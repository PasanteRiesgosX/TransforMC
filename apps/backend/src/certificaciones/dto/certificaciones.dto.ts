import { IsBoolean, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Autoguardado de la respuesta de un caso de prueba.
 *
 * Todos los campos son opcionales porque la UI guarda de forma incremental: al
 * pulsar un botón de respuesta manda solo ese campo, y al escribir en un
 * comentario manda solo ese comentario (con debounce). Nunca manda el objeto
 * completo.
 */
export class ActualizarRespuestaDto {
  /** Pregunta 1 — "¿Funciona correctamente en este ambiente?" */
  @IsOptional()
  @IsString()
  @IsIn(['pendiente', 'aprobado', 'rechazado'], {
    message: 'El estado debe ser "pendiente", "aprobado" o "rechazado".',
  })
  estado?: string;

  /** Pregunta 2 — "¿Notaste cambios frente a la versión anterior?" */
  @IsOptional()
  @IsBoolean({ message: 'El campo "cambio" debe ser verdadero o falso.' })
  cambio?: boolean;

  /** "¿Qué no funciona?" — solo aplica si estado === "rechazado". */
  @IsOptional()
  @IsString()
  @MaxLength(4000, { message: 'El comentario no puede superar los 4000 caracteres.' })
  comentarioFalla?: string;

  /** "¿Qué cambió?" / "Cuéntanos qué pasó" — solo aplica si cambio === true. */
  @IsOptional()
  @IsString()
  @MaxLength(4000, { message: 'El comentario no puede superar los 4000 caracteres.' })
  comentarioCambio?: string;
}
