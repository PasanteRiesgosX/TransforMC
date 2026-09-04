import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsIn,
  IsArray,
  ArrayNotEmpty,
  ArrayMinSize,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export const AMBIENTES = ['Pruebas', 'Producción'] as const;
export type Ambiente = (typeof AMBIENTES)[number];

/**
 * Paquete anidado que llega al crear un esquema completo o al agregar un
 * paquete a un esquema existente. Debe tener nombre y al menos un ítem;
 * los responsables son opcionales (se permite "Sin responsable asignado").
 */
export class PaqueteInputDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del paquete es obligatorio.' })
  nombre!: string;

  @IsArray()
  @ArrayNotEmpty({ message: 'Un paquete debe tener al menos un ítem.' })
  @ArrayMinSize(1, { message: 'Un paquete debe tener al menos un ítem.' })
  @IsUUID('all', { each: true, message: 'Cada ítem debe ser un identificador válido.' })
  itemIds!: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  userIds?: string[];
}

export class CreateEsquemaDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsIn(AMBIENTES, { message: 'El ambiente debe ser "Pruebas" o "Producción".' })
  @IsOptional()
  ambiente?: Ambiente;

  @IsArray()
  @ArrayNotEmpty({ message: 'Un esquema debe tener al menos un paquete.' })
  @ArrayMinSize(1, { message: 'Un esquema debe tener al menos un paquete.' })
  @ValidateNested({ each: true })
  @Type(() => PaqueteInputDto)
  paquetes!: PaqueteInputDto[];
}

export class UpdateEsquemaDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsIn(AMBIENTES, { message: 'El ambiente debe ser "Pruebas" o "Producción".' })
  @IsOptional()
  ambiente?: Ambiente;
}

/** Agregar un paquete nuevo a un esquema ya existente. */
export class CreatePaqueteDto extends PaqueteInputDto {}

/**
 * Editar un paquete ya creado: SOLO se permite renombrarlo y/o reasignar
 * responsables. NO se pueden cambiar sus ítems desde aquí (regla de negocio 8).
 */
export class UpdatePaqueteDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del paquete no puede quedar vacío.' })
  @IsOptional()
  nombre?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  userIds?: string[];
}
