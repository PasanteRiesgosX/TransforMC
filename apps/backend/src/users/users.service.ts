import { Injectable, ConflictException, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { Roles } from '@vista/shared';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto, creatorId: string) {
    const { email, genericPassword, ...rest } = createUserDto;
    
    // Validación de dominio institucional
    const institutionalDomain = this.configService.get<string>('INSTITUTIONAL_DOMAIN');
    if (institutionalDomain && !email.toLowerCase().endsWith(`@${institutionalDomain}`)) {
      throw new BadRequestException(`El correo debe pertenecer al dominio institucional (@${institutionalDomain})`);
    }

    const existingUser = await this.prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });

    if (existingUser) {
      throw new ConflictException('El correo ya está registrado');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(genericPassword, saltRounds);

    const user = await this.prisma.user.create({
      data: {
        ...rest,
        email: email.toLowerCase(),
        passwordHash,
        mustChangePassword: true,
        createdById: creatorId,
      },
    });

    const { passwordHash: _, ...result } = user;
    return result;
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        cargo: true,
        email: true,
        rol: true,
        activo: true,
        mustChangePassword: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });
    return users;
  }

  async update(id: string, updateUserDto: UpdateUserDto, currentUserId: string) {
    const userToUpdate = await this.prisma.user.findUnique({ where: { id } });
    if (!userToUpdate) throw new NotFoundException('Usuario no encontrado');

    const adminSeedEmail = this.configService.get<string>('ADMIN_SEED_EMAIL');

    // Reglas de negocio especiales para el Master Admin y propio usuario
    if (updateUserDto.rol && updateUserDto.rol !== userToUpdate.rol) {
      if (userToUpdate.email === adminSeedEmail) {
        throw new ForbiddenException('No se puede cambiar el rol del administrador principal');
      }
      if (userToUpdate.id === currentUserId) {
        throw new ForbiddenException('No puedes cambiar tu propio rol');
      }
    }

    if (updateUserDto.email && updateUserDto.email.toLowerCase() !== userToUpdate.email.toLowerCase()) {
      // Verificar conflicto de correo
      const existingUser = await this.prisma.user.findFirst({
        where: { email: { equals: updateUserDto.email, mode: 'insensitive' } },
      });
      if (existingUser) {
        throw new ConflictException('El correo ya está en uso por otro usuario');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...updateUserDto,
        email: updateUserDto.email?.toLowerCase(),
      },
    });

    const { passwordHash: _, ...result } = updatedUser;
    return result;
  }

  async remove(id: string, currentUserId: string) {
    const userToDelete = await this.prisma.user.findUnique({ where: { id } });
    if (!userToDelete) throw new NotFoundException('Usuario no encontrado');

    const adminSeedEmail = this.configService.get<string>('ADMIN_SEED_EMAIL');

    if (userToDelete.email === adminSeedEmail) {
      throw new ForbiddenException('No se puede eliminar la cuenta del administrador principal');
    }

    if (userToDelete.id === currentUserId) {
      throw new ForbiddenException('No puedes eliminar tu propia cuenta');
    }

    await this.prisma.user.delete({ where: { id } });
    return { message: 'Usuario eliminado exitosamente' };
  }
}
