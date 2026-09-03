import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto, ChangePasswordDto } from './dto/auth.dto';
import { Roles } from '@vista/shared';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password, landingRole } = loginDto;
    
    // Búsqueda case-insensitive por email
    const user = await this.prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }
    
    if (!user.activo) {
      throw new UnauthorizedException('Cuenta inactiva. Contacte al administrador.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    // Validar landingRole contra el rol real
    if (landingRole === 'admin' && user.rol !== Roles.ADMIN) {
      throw new UnauthorizedException('Esa cuenta no corresponde al tipo de acceso elegido.');
    }
    if (landingRole === 'user' && user.rol !== Roles.CERTIFIER) {
      throw new UnauthorizedException('Esa cuenta no corresponde al tipo de acceso elegido.');
    }

    // Actualizar lastLoginAt (fire and forget)
    this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    }).catch(console.error);

    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.rol, 
      forceChange: user.mustChangePassword 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        role: user.rol,
        forceChange: user.mustChangePassword
      }
    };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { newPassword } = changePasswordDto;
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        mustChangePassword: false,
      },
    });

    return { message: 'Contraseña actualizada correctamente' };
  }
}
