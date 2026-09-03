import { IsString, IsOptional, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateModuloDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  nombre!: string;

  @IsString()
  @IsOptional()
  version?: string;

  @IsString()
  @IsOptional()
  conjunto?: string;
}

export class UpdateModuloDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  version?: string;

  @IsString()
  @IsOptional()
  conjunto?: string;
}

export class CreateSubModuloDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  nombre!: string;
}

export class UpdateSubModuloDto {
  @IsString()
  @IsOptional()
  nombre?: string;
}

export class CreateClasificadorDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  nombre!: string;
}

export class UpdateClasificadorDto {
  @IsString()
  @IsOptional()
  nombre?: string;
}

export class CreateCasoPruebaDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  nombre!: string;

  @IsUUID()
  @IsOptional()
  clasificadorId?: string;
}

export class UpdateCasoPruebaDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsUUID()
  @IsOptional()
  clasificadorId?: string | null;
}
