# CLAUDE.md — Certificación Vista (Multicines)

Contexto permanente del proyecto. Léelo antes de tocar cualquier archivo.
Idioma de trabajo, de la UI y de los comentarios de código: **español**.

---

## 1. Qué es este proyecto

Aplicación interna de **Multicines S.A.** para certificar el sistema **Vista 5.0**.

El negocio: Vista se compone de **módulos** (FilmProgram, Head Office, Cash Desk, Loyalty, POS…),
cada módulo tiene **submódulos**, y cada submódulo tiene **casos de prueba**. Un administrador arma
**esquemas de evaluación** (paquetes de casos de prueba asignados a personas) y esas personas
**certifican** cada caso: funciona / no funciona / pendiente. La aplicación muestra el avance y la
calidad de esa certificación.

### Maqueta de referencia

`Certificacion_Vista_Maqueta MVP 2.0.html` (raíz, ~324 KB, un solo archivo con HTML+CSS+JS vanilla).

Es un **prototipo funcional pero desordenado**: sirve como fuente de verdad **visual** (paleta,
clases CSS, anatomía de tarjetas, tablas, semáforo) y como referencia de **comportamiento**, pero
**no** de arquitectura ni de reglas de negocio. Cuando la maqueta y los documentos de diseño se
contradigan, **ganan los documentos de diseño**. La maqueta usa emojis como íconos y `localStorage`
como base de datos; ninguna de las dos cosas se replica.

Funciones útiles de la maqueta como referencia (por si hay que consultarlas):

| Función                    | Línea aprox. | Qué hace                                    |
|----------------------------|--------------|---------------------------------------------|
| `readiness(pct, fail)`     | 471          | Semáforo viejo (**reemplazado** en Fase 4)  |
| `semaphoreHtml(light,opts)`| 476          | Markup del semáforo de 3 luces              |
| `progressCard(opts)`       | 1121         | Anatomía de la tarjeta de progreso          |
| `renderAdminResults()`     | 1141         | Pantalla Resultados (7 pestañas, **obsoleta**) |
| `renderResultsCampana()`   | 1277         | Drill-down esquema → módulo → submódulo     |
| `renderResultsFlatList()`  | 1354         | Tabla plana de ítems                        |

---

## 2. Stack y estructura

Monorepo con **npm workspaces**. Node ≥ 20.19.

```
Certifier Vista/
├── CLAUDE.md                       ← este archivo
├── Design System.md                ← diseño de la FASE EN CURSO (Fase 4 — Resultados)
├── Certificacion_Vista_Maqueta MVP 2.0.html
├── docker-compose.yml              ← Postgres 15 en :5432
├── apps/
│   ├── backend/                    ← NestJS 12 + Prisma 7 + PostgreSQL
│   │   ├── prisma/schema.prisma
│   │   ├── prisma/migrations/
│   │   ├── prisma/seed.ts
│   │   └── src/
│   │       ├── auth/               ← JWT + Passport
│   │       ├── users/              ← Fase 1
│   │       ├── modulos/            ← Fase 2 (catálogo)
│   │       ├── esquemas/           ← Fase 3 (+ Pruebas vs Producción)
│   │       ├── resultados/         ← Fase 4 (+ Comparativa)
│   │       ├── certificaciones/    ← Fase 5
│   │       ├── solicitudes/        ← Fase 6 (reaperturas)
│   │       ├── common/             ← guards (JwtAuthGuard, RolesGuard), decorators
│   │       ├── prisma/             ← PrismaService (@prisma/adapter-pg)
│   │       └── generated/prisma/   ← cliente generado (NO editar)
│   └── frontend/                   ← React 19 + Vite 8 + Tailwind 4 + react-router 7
│       ├── Design System.md        ← histórico Fases 2 y 3 (§1–§6ter, §9, §9bis)
│       └── src/
│           ├── components/ui/      ← Button, Modal, Input, Select, Badge, Avatar…
│           ├── components/layout/  ← AdminLayout, CertifierLayout
│           ├── context/            ← AuthContext, ToastContext
│           ├── pages/              ← una página por pantalla
│           └── index.css           ← TODO el CSS bespoke (variables + clases)
└── packages/shared/                ← @vista/shared: Roles ('ADMIN' | 'CERTIFIER')
```

**Dónde vive el diseño:** hay **dos** archivos `Design System.md` y no son intercambiables.

- `Design System.md` (raíz) → **la fase en curso**. Es lo que se implementa ahora.
- `apps/frontend/Design System.md` → fundamentos (§1–§5) + histórico de Fases 2 y 3. Consúltalo para
  paleta, tipografía, íconos y specs de pantallas ya construidas. Su §6quater de Fase 4 está
  **derogada** por el archivo de la raíz.

---

## 3. Comandos

```bash
docker compose up -d          # levanta Postgres (root/rootpassword, db certifier_vista_db)
npm run dev:backend           # NestJS en http://localhost:3000  (watch)
npm run dev:frontend          # Vite en http://localhost:5173
npm run db:migrate            # prisma migrate dev  (dentro de apps/backend)
npm run db:seed               # prisma db seed
npm run db:studio             # prisma studio
npm run build                 # shared → backend → frontend
```

Lint/format del backend: `npm run lint -w backend` (oxlint) · `npm run format -w backend` (prettier).
Lint del frontend: `npm run lint -w frontend` (eslint).

---

## 4. Estado del proyecto por fases

| Fase | Alcance                                    | Estado         |
|------|--------------------------------------------|----------------|
| 1    | Auth, usuarios, roles, cambio de clave      | ✅ Terminada   |
| 2    | Catálogo (módulos / submódulos / clasificadores / casos de prueba) | ✅ Terminada |
| 3    | Esquemas de evaluación (paquetes + responsables) | ✅ Terminada |
| 4    | Resultados (admin, solo lectura)            | ✅ Terminada   |
| 5    | Mis certificaciones (certificador, con autoguardado) | ✅ Terminada |
| 6    | **Solicitudes de reapertura** y **Pruebas vs Producción** | ✅ Terminada   |

**Resultados (Fase 4) es solo de LECTURA.** No marca, no aprueba, no rechaza y no comenta. Toda la
escritura de `ResultadoItem` vive en la Fase 5 (`/api/mis-certificaciones`). La UI de Resultados debe
seguir funcionando con la tabla `ResultadoItem` **completamente vacía** (KPIs en 0, semáforos
apagados, estados vacíos) sin lanzar excepciones ni quedarse en spinner.

---

## 5. Modelo de datos (Prisma — `apps/backend/prisma/schema.prisma`)

```
User ──< Modulo ──< SubModulo ──< Clasificador (opcional, agrupa casos)
                          └────< CasoPrueba (clasificadorId opcional)

Esquema ──< Paquete ──< PaqueteItem ──1:1?── ResultadoItem
    │            └────< PaqueteResponsable ──> User
    ├────< EnvioCertificacion ──> User        (único por esquema+usuario)
    ├────< SolicitudReapertura ──> User       (estado: PENDING, APPROVED, REJECTED)
    └────0..1 Esquema (esquemaPadreId: vinculación Pruebas vs Producción)
PaqueteItem ──> CasoPrueba          (esquemaId denormalizado)
```

Puntos que hay que tener presentes siempre:

- **`PaqueteItem` es la unidad real de trabajo.** Un `CasoPrueba` del catálogo puede estar en varios
  esquemas; dentro de **un mismo esquema** solo puede estar una vez (`@@unique([esquemaId, casoPruebaId])`).
- **`ResultadoItem` es 1:1 opcional con `PaqueteItem`.** Sin fila = pendiente. Guarda las respuestas
  a las **dos preguntas** del certificador:
  - `estado ∈ { "pendiente", "aprobado", "rechazado" }` (P1: ¿funciona?). Strings, no enums.
  - `cambio: Boolean?` (P2: ¿notaste cambios?). **Nullable a propósito**: sin eso no se distingue
    "todavía no contestó" de "contestó que sigue igual".
  - `comentarioFalla` (¿qué no funciona?) y `comentarioCambio` (¿qué cambió? / cuéntanos qué pasó).
- **`EnvioCertificacion` es único por `(esquemaId, usuarioId)`.** Su existencia = ese certificador ya
  cerró ese esquema → todo `PATCH` suyo sobre ítems de ese esquema responde 403. Al conceder una
  reapertura, este registro se elimina para desbloquear el formulario.
- **`SolicitudReapertura`** rastrea las peticiones de los certificadores para desbloquear sus esquemas
  ya enviados (`estado ∈ { "PENDING", "APPROVED", "REJECTED" }`, `motivo`, `respuestaAdmin`).
- **Vinculación Pruebas vs Producción (`esquemaPadreId`):** Un esquema de Producción puede nacer
  como clon de uno de Pruebas apuntando a su `esquemaPadreId`. Esto habilita su comparación directa.
- **Nada de enums de Prisma.** Roles, ambiente y estado son `String` a propósito.
- Ambiente del esquema: exactamente `"Pruebas"` | `"Producción"` (con tilde).
- Roles: `"ADMIN"` | `"CERTIFIER"` desde `@vista/shared`. En la UI, a los `CERTIFIER` se les dice
  **"responsables"**.

---

## 6. Convenciones del backend

- Todos los controladores de admin: `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(SharedRoles.ADMIN)`.
- Prefijo de rutas: `@Controller('api')` (excepto `users`, que es `@Controller('users')` por herencia
  de la Fase 1 — **no lo cambies**).
- `ValidationPipe` global con `whitelist: true, transform: true` → los DTO usan `class-validator`.
- Errores: `BadRequestException` / `NotFoundException` con **mensaje en español y accionable**
  (el frontend lo muestra tal cual).
- Un servicio devuelve **el objeto ya reformateado** para la UI (ver `EsquemasService.formatDetalle`),
  no la entidad cruda de Prisma. Las mutaciones de paquete devuelven **el esquema completo actualizado**.
- Agregaciones (conteos, porcentajes) se calculan **en el backend**. La UI no agrega sobre listas
  grandes de ítems crudos.

### Endpoints existentes

| Recurso   | Endpoints                                                                                     |
|-----------|-----------------------------------------------------------------------------------------------|
| Auth      | `POST /auth/login`, `POST /auth/change-password`                                              |
| Usuarios  | `GET /users`, `POST /users`, `PATCH /users/:id`, `DELETE /users/:id`                          |
| Catálogo  | `GET/POST /api/modulos`, `GET/PATCH/DELETE /api/modulos/:id`, `.../submodulos`, `.../clasificadores`, `.../casos` |
| Esquemas  | `GET/POST /api/esquemas`, `GET/PATCH/DELETE /api/esquemas/:id`, `POST /api/esquemas/:id/paquetes`, `PATCH/DELETE /api/paquetes/:id` |
| Resultados| `GET /api/resultados/overview`, `GET /api/resultados/esquemas/:esquemaId`, `.../modulos/:moduloId`, `.../submodulos/:subModuloId` |
| Certificar| `GET /api/mis-certificaciones`, `GET /api/mis-certificaciones/:esquemaId`, `.../modulos/:moduloId`, `PATCH /api/mis-certificaciones/items/:paqueteItemId`, `POST /api/mis-certificaciones/:esquemaId/enviar`, `POST /api/mis-certificaciones/:esquemaId/solicitar-reapertura` |
| Solicitudes| `GET /api/solicitudes`, `GET /api/solicitudes/:esquemaId`, `PATCH /api/solicitudes/:id/aceptar`, `PATCH /api/solicitudes/:id/rechazar` |

Los de **Resultados** son `@Roles(ADMIN)`; los de **Certificar** son `@Roles(CERTIFIER)` y además
filtran siempre por el usuario del token (`paquete.responsables.some({ usuarioId })`), así que un
certificador nunca alcanza un ítem que no le asignaron. El `:esquemaId` de la URL acota, nunca amplía.

---

## 7. Convenciones del frontend

- **Nada de datos mock.** Cada pantalla consume su endpoint real con
  `Authorization: Bearer ${localStorage.getItem('token')}` contra `http://localhost:3000` (axios
  directo, patrón de `AdminCatalog.tsx` / `AdminSchemes.tsx`).
- Lectura de errores del backend — **siempre este patrón**:

  ```ts
  const readError = (err: any, fallback: string) =>
    (Array.isArray(err.response?.data?.message)
      ? err.response?.data?.message[0]
      : err.response?.data?.message) ||
    err.response?.data?.error ||
    fallback;
  ```

  Errores dentro de un modal → `error-msg` inline. Errores de carga de pantalla → toast.
- **Estilos:** clases bespoke de `src/index.css` (`.mod-card`, `.panel`, `.tag`, `.progress-track`,
  `.semaphore`, `.breadcrumbs`…) + utilidades de Tailwind para layout. **Cero hex sueltos**: todo color
  sale de las variables CSS (`var(--cian)`, `var(--rojo)`…).
- **Cero emojis como ícono.** Todo `lucide-react` con `size={}` explícito, según la tabla de tamaños
  del §4 de `apps/frontend/Design System.md`.
- Fechas: `toLocaleDateString('es-EC')` / `toLocaleString('es-EC')`.
- Componentes UI reutilizables ya existentes: `Button`, `Modal`, `Input`, `Select`, `Badge`, `Avatar`,
  `SignatureBar`, `LogoPlaceholder`. Reúsalos antes de crear uno nuevo.
- **Logo:** no incorporar ningún asset; solo `LogoPlaceholder` con altura fija (38px landing / 22px
  topbar). El logo real se pega después como base64.
- Sidebar de admin (`AdminLayout.tsx`): ítems habilitados según la fase en curso; los de fases
  futuras van como `<div>` con `opacity-55 cursor-default` (nunca `NavLink`).

---

## 8. Reglas de negocio que no se negocian

1. Un ítem del catálogo **no puede estar en dos paquetes del mismo esquema**; entre esquemas
   distintos **sí** puede repetirse.
2. Los **esquemas son entornos de testeo aislados entre sí**. Cada esquema es un testeo
   independiente; sus porcentajes, semáforos y conteos se calculan **solo con sus propios ítems**.
   Crear un esquema nuevo **nunca** debe bajar el avance de otro.
3. Un esquema requiere ≥ 1 paquete; un paquete requiere ≥ 1 ítem. El nombre del paquete es
   obligatorio; el del esquema no (default `"Esquema sin nombre"`).
4. Un paquete puede tener **0 responsables** ("Sin responsable asignado").
5. Al **editar** un paquete solo se cambian nombre y responsables, nunca sus ítems.
6. Eliminar un paquete **libera** sus ítems (vuelven a estar disponibles en el picker).
7. Resultados **respeta siempre la jerarquía** Módulo › SubMódulo › Caso de prueba, sin importar a
   qué nivel haya seleccionado el admin al armar el esquema, y **solo muestra lo que fue seleccionado**.

---

## 9. Fase 4 (Resultados) — cómo quedó

Especificación completa en **`Design System.md` de la raíz**. Decisiones que cambian respecto a la
maqueta y que hay que respetar de aquí en adelante:

- **Una sola vista** ("Vista global"), no siete pestañas. No existe `filter-tabs`.
- La sección arranca mostrando **los esquemas**, no resultados globales mezclados.
- Navegación por rutas reales: **Esquema → Módulo → SubMódulo → tabla de casos de prueba**.
- El **semáforo mide calidad**, no completitud: `ok / (ok + fail)` → 🔴 0–69 % · 🟡 70–89 % · 🟢 90–100 %.
  Con `ok + fail === 0` (`calidad: null`) el semáforo va **apagado**, nunca rojo.
- La **barra de progreso mide completitud**: `(ok + fail) / total`. Los dos ejes no se cruzan.
- `ResultadoItem.cambio` (Boolean) alimenta la columna "Cambios"; es independiente del estado.

Archivos de la fase:

```
backend   src/resultados/{resultados.module,controller,service}.ts
          prisma/migrations/20260904053155_phase4_resultado_cambio/
frontend  src/lib/resultados.ts                      ← tipos, calidadInfo(), helpers
          src/components/resultados/{Semaphore,StatCards,ResultCard,ResultsHeader}.tsx
          src/pages/AdminResults.tsx                 ← nivel 0
          src/pages/AdminResultsScheme.tsx           ← nivel 1
          src/pages/AdminResultsModule.tsx           ← nivel 2
          src/pages/AdminResultsSubModule.tsx        ← nivel 3 (tabla + filtros)
```

**Ojo con Prisma:** `prisma migrate dev` **no** regeneró el cliente en `src/generated/prisma`. Si
tocas el schema, corre `npx prisma generate` a mano o los tipos del cliente quedan viejos y las
consultas colapsan a `never` en compilación.

---

## 10. Fase 5 (Mis certificaciones) — cómo quedó

Misma jerarquía que Resultados, pero acotada a lo que le tocó a **ese** certificador:
**Esquema → Módulo → SubMódulo → Caso de prueba**. Los submódulos no son un nivel navegable: agrupan
los casos dentro de la pantalla de certificación (`sub-block-title`), como en la maqueta.

**Las dos preguntas y qué despliega cada combinación** (esto se corrigió respecto a la maqueta, que
mostraba un solo campo en todos los casos):

| P1 ¿Funciona? | P2 ¿Cambios? | Campos que se despliegan                          |
|---------------|--------------|---------------------------------------------------|
| Sí, funciona  | No, sigue igual | ninguno — ahí termina                          |
| Sí, funciona  | Sí, cambió      | 1 caja: **Cuéntanos qué pasó**                 |
| No funciona   | No, sigue igual | 1 caja: **¿Qué no funciona?**                  |
| No funciona   | Sí, cambió      | **2 cajas**: ¿Qué no funciona? + ¿Qué cambió?  |

Cada caja tiene textarea (funcional, el admin lo lee en Resultados) y un recuadro "Adjuntar captura"
que es **placeholder no funcional**: no hay `<input type="file">` ni forma de subir nada.

**Autoguardado, sin botón de guardar:**
- Botones de respuesta → `PATCH` inmediato.
- Comentarios → `PATCH` con debounce de 600 ms (`DEBOUNCE_MS` en `CertifierModule.tsx`).
- Indicador en la barra pegajosa: "Guardando..." / "Guardado automáticamente" / "No se pudo guardar".
- El backend **normaliza** los comentarios: si la combinación deja de pedir uno, lo borra. Así
  Resultados nunca muestra un texto que ya no corresponde a ninguna pregunta visible.

"**Mis resultados**" existe como pestaña navegable pero es un **placeholder vacío** a propósito.

Archivos de la fase:

```
backend   src/certificaciones/{module,controller,service}.ts + dto/
          prisma/migrations/20260904131552_phase5_certificacion_respuestas/
frontend  src/lib/certificaciones.ts
          src/components/certificaciones/{CircularProgress,ItemCard}.tsx
          src/pages/CertifierSchemes.tsx    ← nivel 0
          src/pages/CertifierScheme.tsx     ← nivel 1 (módulos + submódulos)
          src/pages/CertifierModule.tsx     ← nivel 2 (certificación + autoguardado)
          src/pages/CertifierResults.tsx    ← placeholder
```

**Envío y bloqueo.** Además del autoguardado, el certificador cierra el esquema con el botón
**Enviar** de la barra superior (`EnviarCertificacion.tsx`, con modal de confirmación porque es
irreversible en esta fase).

- Se registra en **`EnvioCertificacion`**, único por `(esquemaId, usuarioId)`. Dos responsables del
  mismo esquema envían por separado; uno **no** bloquea al otro.
- **Un caso puede quedar vacío ("sin dato") y aun así se envía.** No todos los casos se responden. La
  validez la define `casoListo()` (misma regla en backend y en `lib/certificaciones.ts`): un caso es
  válido si está **completamente vacío** o si tiene lleno todo comentario obligatorio que sus
  respuestas despliegan. Lo único que bloquea el envío es una **respuesta a medias**: "No funciona"
  sin decir qué, o "Sí, cambió" sin decir qué. `envio.incompletos` cuenta solo esos casos a medias.
- **Las dos preguntas se pueden deseleccionar.** Volver a pulsar la opción ya elegida la quita: P1
  vuelve a `estado: "pendiente"`, P2 vuelve a `cambio: null` (el `PATCH` acepta `cambio: null` gracias
  a `@IsOptional()`). El backend **no** cambia cómo persiste un caso sin respuesta (upsert + normalización).
- Tras enviar, `PATCH` sobre cualquier ítem de ese esquema responde **403**. La UI pasa a solo
  lectura: botones deshabilitados (la opción elegida se mantiene nítida, las demás se apagan),
  textareas `readOnly`, y un `readonly-banner` arriba.
- La tarjeta del esquema **sigue apareciendo** en "Mis certificaciones", con el distintivo
  **COMPLETADO**, la fecha de envío y el CTA cambiado a "Ver mis respuestas".

`POST /api/mis-certificaciones/:esquemaId/enviar` es el endpoint. La reapertura (poder volver a
editar tras enviar) se implementó en la **Fase 6** (ver §12).

---

## 11. Pruebas vs Producción (Esquemas y Comparativa en Resultados)

Funcionalidad transversal entre Esquemas y Resultados para contrastar testeos entre ambientes:

### A. Esquemas de Evaluación
- **Semáforos funcionales:** Las tarjetas en `AdminSchemes.tsx` leen la métrica real `calidad` agregada desde el backend (`ok / (ok + fail)`). Se pintan en rojo, amarillo o verde (o apagado si no hay certificaciones).
- **Pasar a Producción:** Botón con ícono `Rocket` en las tarjetas de esquemas de Pruebas. Redirige a `/admin/esquemas/nuevo?cloneFrom=:id`.
- **Clonado inteligente:** `AdminSchemeEditor.tsx` detecta el parámetro `cloneFrom`, prellena los paquetes y sus ítems, fuerza el ambiente a `"Producción"` (bloqueando el selector), añade `" Producción"` al nombre y envía `esquemaPadreId` en el payload al backend.
- **Agrupación visual:** En la cuadrícula de esquemas, los esquemas vinculados (`esquemaPadre` e `esquemasHijos`) se ordenan y renderizan contiguos (lado a lado), diferenciando visualmente sus tags de ambiente (`tag-cian` para Pruebas, `tag-magenta` para Producción).

### B. Comparativa en Resultados
- **Ruta de acceso:** Botón tipo chip *"Pruebas vs Producción"* en el encabezado de `AdminResults.tsx` hacia `/admin/resultados/comparativa`.
- **Nivel 0 (Lista de pares vinculados):** En `AdminResultsComparativaList.tsx`, lista todos los pares que tienen relación padre/hijo. Cada tarjeta muestra los porcentajes de calidad de Pruebas y Producción.
- **Drill-down unificado (`AdminResultsComparativaDetail.tsx`):**
  - **Módulos / Submódulos:** Cada tarjeta es un rectángulo dividido en dos secciones: `Pruebas (porcentaje) | Producción (porcentaje)` arriba y el nombre del módulo/submódulo debajo.
  - **Tabla de Casos de Prueba:** Columnas fijas `CASO DE PRUEBA | ESTADO PRUEBAS | ESTADO PRODUCCION`.
  - **Regla de oro de desalineación:** Si un caso de prueba existe en Pruebas pero no en Producción (o viceversa, por edición del admin tras el clonado), el sistema no falla: muestra el tag neutral **"SIN DATO"**.

---

## 12. Fase 6 (Solicitudes de reapertura) — cómo quedó

Permite a los certificadores solicitar el desbloqueo de un esquema enviado y a los administradores conceder o rechazar la reapertura.

### Flujo del Certificador
- En `CertifierScheme.tsx` se integra el componente `SolicitarReapertura.tsx` en la parte inferior.
- **Antes de enviar:** El botón está presente pero deshabilitado. Al hacer clic muestra un aviso indicando que primero debe enviar la certificación.
- **Tras enviar:** El botón se habilita. Al hacer clic abre un modal que solicita obligatoriamente el **Motivo** de la solicitud.
- **Estado PENDING:** Muestra un banner informativo advirtiendo que la solicitud está en revisión por el administrador.
- **Estado REJECTED:** Muestra en un recuadro de alerta el motivo de rechazo (`respuestaAdmin`) redactado por el administrador, y le permite formular una nueva solicitud.

### Flujo del Administrador
- **Sidebar:** Ítem **"Solicitudes"** habilitado en `AdminLayout.tsx` apuntando a `/admin/solicitudes`.
- **Lista de Esquemas con Solicitudes (`AdminSolicitudes.tsx`):** Muestra tarjetas de esquemas con peticiones activas y un badge con el conteo de solicitudes pendientes.
- **Detalle de Solicitudes por Esquema (`AdminSolicitudesEsquema.tsx`):**
  - Tabla con: Certificador, Fecha, Motivo del certificador, Estado actual (`PENDIENTE`, `ACEPTADO`, `RECHAZADO`).
  - **Rechazar:** Abre un modal exigiendo el motivo del rechazo (`respuestaAdmin`). Al confirmar, actualiza a `REJECTED` y el mensaje viaja al certificador.
  - **Aceptar (Reapertura Completa):** Abre un modal de confirmación. En el backend se ejecuta una transacción atómica que:
    1. Marca la solicitud como `APPROVED`.
    2. **Elimina el registro de `EnvioCertificacion`** asociado a ese `(esquemaId, usuarioId)`.
    3. Esto restablece automáticamente todos los permisos de edición (`PATCH`) para el certificador y retira el estado de solo lectura en su UI.

Archivos de la fase:
```
backend   src/solicitudes/{solicitudes.module,controller,service}.ts
          src/certificaciones/{controller,service}.ts (endpoint solicitar-reapertura)
          prisma/migrations/20260904174442_add_reaperturas/
frontend  src/pages/AdminSolicitudes.tsx
          src/pages/AdminSolicitudesEsquema.tsx
          src/components/certificaciones/SolicitarReapertura.tsx
---

## 13. Fase 6 - Parte 3 (Versionamiento de Casos de Prueba)

Permite a los usuarios certificadores crear múltiples versiones de sus respuestas (casos de prueba) a lo largo del tiempo, almacenando el historial sin alterar el comportamiento de las métricas.

### A. Modelo Arquitectónico (Archivo Histórico)
Para mantener intacta la lógica de las métricas en Resultados (las cuales leen siempre `ResultadoItem`), se implementó el patrón de **Archivo Histórico**:
- El esquema original 1:1 `PaqueteItem <-> ResultadoItem` se mantiene. `ResultadoItem` contiene siempre la **versión activa**.
- Se creó el modelo inmutable `ResultadoHistorico` ligado a `PaqueteItem`.
- Al **Versionar**, el backend copia los campos (estado, comentarios, fechas) de `ResultadoItem` hacia una nueva fila en `ResultadoHistorico`, e incrementa `version` en `ResultadoItem`, reseteándolo a `estado = 'pendiente'`.
- De esta forma las métricas globales y los endpoints existentes ignoran el historial automáticamente.

### B. Funcionalidad del Certificador (`ItemCard.tsx` / `CertifierModule.tsx`)
- Aparece el botón **Versionar** (ícono `GitBranch`) en los ítems que ya han sido contestados (`estado !== 'pendiente'`).
- Al hacer clic, se crea la nueva versión activa (se resetea la tarjeta principal para que el certificador vuelva a evaluar).
- Las **versiones anteriores** se renderizan inmediatamente debajo de la tarjeta principal. Aparecen anidadas, en modo de solo lectura (deshabilitadas visualmente con menor opacidad y el badge de su versión histórica `v1.0`).
- La versión activa muestra su badge `v2.0`, `v3.0`, etc.

### C. Funcionalidad de Resultados Administrador (`AdminResultsSubModule.tsx`)
- En la tabla de Resultados a nivel submódulo (Nivel 3), se incorporó la columna **Versión**.
- Se reemplazó el `<tr>` simple por un `React.Fragment`. Si un caso tiene historial, debajo de su fila activa (la última evaluación), se despliegan en cascada todas sus iteraciones históricas como filas grises en cursiva ("Versión anterior").
- Los KPIs (semáforo de calidad y barra de completitud) se mantienen inalterados ya que continúan calculándose exclusivamente con la respuesta de la última versión creada.

Archivos de la fase:
```
backend   prisma/schema.prisma (ResultadoItem.version, model ResultadoHistorico)
          src/certificaciones/{certificaciones.service, certificaciones.controller}.ts
          src/resultados/resultados.service.ts
frontend  src/lib/certificaciones.ts y resultados.ts
          src/components/certificaciones/ItemCard.tsx
          src/pages/CertifierModule.tsx
          src/pages/AdminResultsSubModule.tsx
```

---

## 14. Git

- Rama principal: `main`. Historial corto (`first commit`, `Segundo commit fase 2`).
- Mensajes de commit en español.
- No commitear ni pushear salvo que el usuario lo pida explícitamente.
- `apps/backend/.env` contiene la cadena de conexión — **nunca** lo incluyas en un commit ni copies
  su contenido a otro archivo.
