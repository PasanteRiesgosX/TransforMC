import { IsEmail, IsNotEmpty, IsString, MinLength, IsIn } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password!: string;

  @IsString()
  @IsNotEmpty({ message: 'El tipo de acceso es requerido' })
  @IsIn(['admin', 'user'], { message: 'Tipo de acceso inválido' })
  landingRole!: string;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  newPassword!: string;
}
