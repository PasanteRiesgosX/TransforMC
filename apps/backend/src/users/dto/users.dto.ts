import { IsEmail, IsNotEmpty, IsString, IsIn, Matches, ValidateIf } from 'class-validator';
import { Roles } from '@vista/shared';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre!: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido es requerido' })
  apellido!: string;

  @IsString()
  @IsNotEmpty({ message: 'El cargo es requerido' })
  cargo!: string;

  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'El perfil es requerido' })
  @IsIn([Roles.ADMIN, Roles.CERTIFIER], { message: 'Perfil inválido' })
  rol!: string;

  @IsString()
  @IsNotEmpty({ message: 'Se requiere una contraseña genérica inicial' })
  genericPassword!: string;
}

export class UpdateUserDto {
  @IsString()
  @ValidateIf((o) => o.nombre !== undefined)
  nombre?: string;

  @IsString()
  @ValidateIf((o) => o.apellido !== undefined)
  apellido?: string;

  @IsString()
  @ValidateIf((o) => o.cargo !== undefined)
  cargo?: string;

  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @ValidateIf((o) => o.email !== undefined)
  email?: string;

  @IsString()
  @IsIn([Roles.ADMIN, Roles.CERTIFIER], { message: 'Perfil inválido' })
  @ValidateIf((o) => o.rol !== undefined)
  rol?: string;
}
