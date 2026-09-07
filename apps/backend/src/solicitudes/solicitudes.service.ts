import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SolicitudesService {
  constructor(private prisma: PrismaService) {}

  async listarEsquemasConSolicitudes() {
    const esquemas = await this.prisma.esquema.findMany({
      where: {
        solicitudesReapertura: {
          some: {}
        }
      },
      include: {
        _count: {
          select: {
            solicitudesReapertura: { where: { estado: 'PENDING' } }
          }
        },
        solicitudesReapertura: {
          select: { estado: true }
        }
      }
    });

    return esquemas.map(sq => {
      return {
        id: sq.id,
        nombre: sq.nombre,
        ambiente: sq.ambiente,
        pendientesCount: sq._count.solicitudesReapertura,
        totalCount: sq.solicitudesReapertura.length,
      };
    });
  }

  async listarPorEsquema(esquemaId: string) {
    const esquema = await this.prisma.esquema.findUnique({
      where: { id: esquemaId },
      select: { id: true, nombre: true }
    });
    if (!esquema) throw new NotFoundException('Esquema no encontrado');

    const solicitudes = await this.prisma.solicitudReapertura.findMany({
      where: { esquemaId },
      include: {
        usuario: { select: { id: true, nombre: true, apellido: true } }
      },
      orderBy: { creadoEn: 'desc' }
    });

    return { esquema, solicitudes };
  }

  async aceptar(id: string) {
    const solicitud = await this.prisma.solicitudReapertura.findUnique({ where: { id } });
    if (!solicitud) throw new NotFoundException('Solicitud no encontrada');
    if (solicitud.estado !== 'PENDING') throw new BadRequestException('La solicitud ya fue procesada');

    await this.prisma.$transaction(async (tx) => {
      // Marcar como APPROVED
      await tx.solicitudReapertura.update({
        where: { id },
        data: { estado: 'APPROVED' }
      });
      // Eliminar el envio para reaperturar
      await tx.envioCertificacion.deleteMany({
        where: {
          esquemaId: solicitud.esquemaId,
          usuarioId: solicitud.usuarioId
        }
      });
    });

    return { message: 'Reapertura concedida. El usuario ya puede editar sus respuestas.' };
  }

  async rechazar(id: string, respuestaAdmin: string) {
    const solicitud = await this.prisma.solicitudReapertura.findUnique({ where: { id } });
    if (!solicitud) throw new NotFoundException('Solicitud no encontrada');
    if (solicitud.estado !== 'PENDING') throw new BadRequestException('La solicitud ya fue procesada');

    if (!respuestaAdmin || !respuestaAdmin.trim()) {
      throw new BadRequestException('Debes proveer un motivo de rechazo');
    }

    await this.prisma.solicitudReapertura.update({
      where: { id },
      data: { estado: 'REJECTED', respuestaAdmin }
    });

    return { message: 'Solicitud rechazada correctamente.' };
  }
}
