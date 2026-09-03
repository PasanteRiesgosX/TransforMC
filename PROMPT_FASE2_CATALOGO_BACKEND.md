# Prompt — Fase 2.1: Backend del Catálogo (Módulos / SubMódulos / Clasificadores / Casos de Prueba)

Vas a implementar **solo el backend** (schema de base de datos + endpoints + validaciones) del módulo
de Catálogo, siguiendo el mismo stack y convenciones ya usadas en la Fase 1 (autenticación/usuarios).
**No implementes nada de frontend en esta fase.** Los datos de arranque los voy a insertar yo
manualmente con un script SQL — tú solo creas las tablas (vía migración de Prisma) y la lógica de
endpoints; no necesitas sembrar datos de prueba propios.

## 1. Conceptos y jerarquía

- **Módulo**: aplicación/componente del sistema (ej. "Film Programming", "POS").
- **SubMódulo**: sección funcional dentro de un módulo (ej. "General Maintenance", "Box Office").
  *(en la maqueta HTML de referencia estos se llamaban "Secciones" — en la app real y en el código,
  todo debe decir/nombrarse **SubMódulo**, no "Sección").*
- **Clasificador**: agrupación **opcional** de casos de prueba dentro de un submódulo. No es un nivel
  jerárquico nuevo — es puramente organizacional. Un caso de prueba puede o no tener clasificador.
  Ejemplos reales ya cargados: en "Cinema Manager (BO)" el submódulo "BACKOFFICE" agrupa sus casos
  bajo los clasificadores "Manejador de programación" y "Reportes"; en "POS" el submódulo "POS" los
  agrupa bajo "FONDOS", "TAQUILLA" y "DULCERIA".
- **Caso de Prueba**: la prueba puntual a certificar. Pertenece siempre a un submódulo, y
  opcionalmente a un clasificador de ese mismo submódulo.

Relaciones: 1 Módulo → N SubMódulos → N Casos de Prueba. Un SubMódulo → N Clasificadores
(0 o más). Un Clasificador → N Casos de Prueba (pero un Clasificador nunca es obligatorio).

## 2. Esquema de base de datos (Prisma)

Implementa exactamente este schema (ajusta solo si tu convención de proyecto usa otro generador de
IDs, pero mantén los nombres de modelo/columna en camelCase tal como Prisma los genera, porque ya
tengo preparado un script de seed SQL que asume estos nombres exactos):

```prisma
model Modulo {
  id            String      @id @default(uuid())
  nombre        String      @unique
  version       String?
  conjunto      String?
  orden         Int         @default(0)
  activo        Boolean     @default(true)
  creadoPorId   String?
  creadoPor     Usuario?    @relation(fields: [creadoPorId], references: [id])
  creadoEn      DateTime    @default(now())
  actualizadoEn DateTime    @updatedAt

  subModulos    SubModulo[]

  @@index([orden])
}

model SubModulo {
  id            String        @id @default(uuid())
  nombre        String
  orden         Int           @default(0)

  moduloId      String
  modulo        Modulo        @relation(fields: [moduloId], references: [id], onDelete: Cascade)

  creadoEn      DateTime      @default(now())
  actualizadoEn DateTime      @updatedAt

  clasificadores Clasificador[]
  casosPrueba   CasoPrueba[]

  @@index([moduloId, orden])
}

model Clasificador {
  id            String       @id @default(uuid())
  nombre        String
  orden         Int          @default(0)

  subModuloId   String
  subModulo     SubModulo    @relation(fields: [subModuloId], references: [id], onDelete: Cascade)

  creadoEn      DateTime     @default(now())

  casosPrueba   CasoPrueba[]

  @@index([subModuloId, orden])
}

model CasoPrueba {
  id             String        @id @default(uuid())
  nombre         String
  orden          Int           @default(0)

  subModuloId    String
  subModulo      SubModulo     @relation(fields: [subModuloId], references: [id], onDelete: Cascade)

  clasificadorId String?
  clasificador   Clasificador? @relation(fields: [clasificadorId], references: [id], onDelete: SetNull)

  creadoEn       DateTime      @default(now())
  actualizadoEn  DateTime      @updatedAt

  @@index([subModuloId, orden])
  @@index([clasificadorId])
}
```

**IMPORTANTE — reglas de unicidad (no las cambies):**
- `Modulo.nombre` es **el único campo con restricción de unicidad** en todo este módulo. No puede
  haber dos módulos con el mismo nombre.
- `SubModulo.nombre`, `Clasificador.nombre` y `CasoPrueba.nombre` **NO** llevan restricción de
  unicidad — sí pueden repetirse (entre submódulos distintos, entre módulos distintos, o incluso
  dentro del mismo submódulo si el usuario lo permite). No agregues `@@unique` en ninguno de los tres.
- La comparación de nombre de módulo para detectar duplicados debe ser **case-insensitive**
  ("Loyalty" y "loyalty" deben considerarse el mismo nombre). La forma más simple: antes de crear o
  renombrar un módulo, consulta `WHERE LOWER(nombre) = LOWER($input)` y rechaza si hay coincidencia.
  (Si prefieres una solución a nivel de base de datos, puedes usar la extensión `citext` de Postgres
  para la columna `nombre` de `Modulo` — Supabase la soporta — pero la validación en el service layer
  es obligatoria de todas formas para dar un mensaje de error claro antes de golpear la constraint.)

## 3. Reglas de negocio a implementar

1. **Borrar un Módulo borra en cascada** todos sus SubMódulos, Clasificadores y Casos de Prueba
   asociados (ya viene resuelto por `onDelete: Cascade` en el schema — no lo implementes a mano).
2. **Un Módulo no se puede borrar si tiene casos de prueba en uso en una campaña/esquema activo.**
   Esa relación (Caso de Prueba ↔ Esquema/Campaña) se va a crear en una fase posterior con
   `onDelete: Restrict` hacia `CasoPrueba`. Por ahora, como esa tabla no existe todavía, no hay nada
   que implementar en esta fase — pero **no pongas `onDelete: Cascade` en ningún lado que pudiera
   destruir un caso de prueba desde una tabla externa en el futuro**; deja el modelo tal como está
   arriba para que esa restricción se pueda añadir después sin refactorizar `CasoPrueba`.
3. **Borrar un Clasificador NO borra sus casos de prueba** — solo los desvincula (pasan a
   `clasificadorId = NULL`). Esto ya lo resuelve `onDelete: SetNull` en el schema. Es intencional:
   el clasificador es un elemento organizacional opcional, no un contenedor obligatorio.
4. **Un Clasificador siempre pertenece a un SubMódulo específico** (no es global). Al asignar un
   `clasificadorId` a un caso de prueba, valida que `clasificador.subModuloId === caso.subModuloId`
   — si no coincide, responde 400 con un mensaje claro ("El clasificador no pertenece a este
   submódulo").
5. Los endpoints de creación de Clasificador (`+ Clasificador`) deben requerir `subModuloId` y
   `nombre`. No hay restricción de unicidad de nombre entre clasificadores.

## 4. Endpoints a implementar

```
# Módulos
GET    /api/modulos                        Lista todos (incluye conteo de submódulos/casos)
POST   /api/modulos                        Crear { nombre, version?, conjunto? }
GET    /api/modulos/:id                    Detalle con submódulos → clasificadores → casos anidados
PATCH  /api/modulos/:id                    Editar { nombre?, version?, conjunto? }
DELETE /api/modulos/:id                    Eliminar (cascada)

# SubMódulos
POST   /api/modulos/:moduloId/submodulos   Crear { nombre }
PATCH  /api/submodulos/:id                 Editar { nombre }
DELETE /api/submodulos/:id                 Eliminar (cascada a clasificadores y casos)

# Clasificadores
POST   /api/submodulos/:subModuloId/clasificadores   Crear { nombre }   ("+ Clasificador")
PATCH  /api/clasificadores/:id                        Editar { nombre }
DELETE /api/clasificadores/:id                        Eliminar (SetNull en sus casos, no cascada)

# Casos de Prueba
POST   /api/submodulos/:subModuloId/casos   Crear { nombre, clasificadorId? }  ("+ Caso de Prueba")
PATCH  /api/casos/:id                       Editar { nombre?, clasificadorId? }
DELETE /api/casos/:id                       Eliminar
```

El campo `orden` de cada entidad nueva debe calcularse automáticamente como
`(máximo orden existente en ese padre) + 1` — no lo recibas del cliente.

## 5. Validaciones y respuestas de error esperadas

Usa códigos HTTP consistentes con el resto de la API (ya definidos en la Fase 1). Como mínimo:

| Situación | Código | Respuesta |
|---|---|---|
| Falta `nombre` en el body | 400 | `{ "error": "El nombre es obligatorio." }` |
| Crear/renombrar módulo con nombre ya existente (case-insensitive) | 409 | `{ "error": "Ya existe un módulo con ese nombre." }` |
| `moduloId` / `subModuloId` / `clasificadorId` / `casoId` no existe | 404 | `{ "error": "<Entidad> no encontrado." }` |
| `clasificadorId` enviado no pertenece al mismo submódulo del caso | 400 | `{ "error": "El clasificador no pertenece a este submódulo." }` |
| Eliminar un módulo que tiene casos de prueba usados en una campaña/esquema activo (cuando esa tabla ya exista en fase futura) | 409 | `{ "error": "No puedes eliminar este módulo: tiene casos de prueba en uso en una campaña activa." }` — captura el error de FK (`onDelete: Restrict`) y tradúcelo a este mensaje, no dejes pasar el error crudo de Postgres/Prisma. |
| Body con tipos inválidos (ej. `nombre` no es string) | 400 | `{ "error": "..." }` descriptivo del campo |

Todas las respuestas de error deben seguir el mismo formato JSON que ya usa la API de usuarios de la
Fase 1 (reutiliza el mismo middleware/handler de errores si ya existe).

## 6. Qué NO hacer en esta fase

- No implementes UI/componentes de frontend.
- No crees la tabla de Esquemas/Campañas ni la relación con `CasoPrueba` — eso es una fase futura.
- No inventes campos adicionales (`descripcion`, `tags`, etc.) que no estén en este documento.
- No agregues `@@unique` a `SubModulo.nombre`, `Clasificador.nombre` ni `CasoPrueba.nombre`.
- No siembres datos de catálogo tú mismo — yo cargo el script SQL manualmente después de que corras
  la migración.

## 7. Entregable esperado de tu parte

1. Migración de Prisma aplicada con las 4 tablas de la sección 2.
2. Endpoints de la sección 4 implementados y probados (aunque sea con un smoke test manual).
3. Validaciones de la sección 5 cubiertas.
4. Confírmame cuando la migración esté lista para que yo corra el script de seed.
