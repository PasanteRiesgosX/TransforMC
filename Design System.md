# Design System — Fase 4: Resultados

> **Fuente de verdad del diseño de la fase en curso.** Deroga y reemplaza a la §6quater y §9ter de
> `apps/frontend/Design System.md`, que describían Resultados con 7 pestañas.
> Los fundamentos (paleta §1, tipografía §2, espaciado §3, regla de íconos §4, logo §5) **siguen
> vigentes** en ese archivo — este documento no los repite, los da por hechos.
>
> Ante cualquier ambigüedad entre "lo que se ve mejor" y lo que dice este documento, **gana este
> documento**. No inventes colores, tamaños ni tipografías nuevas.

---

## 1. La decisión de fondo: los esquemas son entornos aislados

La maqueta era incoherente: mostraba resultados "globales" mezclados y, a la vez, permitía certificar
el mismo módulo en dos esquemas distintos. Se resuelve así:

**Un esquema de evaluación = un testeo independiente.** Sus porcentajes, semáforo, conteos y tablas se
calculan **solo con sus propios `PaqueteItem`**. Crear un esquema nuevo **nunca** baja el avance de otro.

Consecuencias directas sobre la UI:

- Al entrar a **Resultados** NO se ven resultados globales sueltos: se ve **la lista de esquemas**.
- Cualquier número que se muestre lleva implícito "…dentro de este esquema".
- Comparar entre esquemas es válido (son testeos distintos del mismo sistema), pero se hace mirando
  tarjetas lado a lado — no sumándolas.
- Los 4 KPI de arriba (`stat-card`) del nivel 0 sí son la suma de todos los esquemas, pero se
  etiquetan explícitamente como acumulado, no como "avance del proyecto".

---

## 2. Navegación — 4 niveles, siempre respetando la jerarquía

Una sola pestaña: **Vista global**. Nada de `filter-tabs`. La navegación es un **drill-down** de 4
niveles, y **la jerarquía no se salta nunca**, sin importar a qué nivel haya seleccionado el admin al
armar el esquema.

| Nivel | Ruta                                                        | Qué se ve                                    |
|-------|-------------------------------------------------------------|----------------------------------------------|
| 0     | `/admin/resultados`                                          | 4 `stat-card` + grid de **tarjetas de esquema** |
| 1     | `/admin/resultados/:esquemaId`                               | Grid de **tarjetas de módulo**               |
| 2     | `/admin/resultados/:esquemaId/modulos/:moduloId`             | Grid de **tarjetas de submódulo**            |
| 3     | `/admin/resultados/:esquemaId/submodulos/:subModuloId`       | **Tabla** de casos de prueba + filtros       |

- Rutas reales (URL compartible, sobrevive a F5). Nada de estado en memoria para la navegación.
- `breadcrumbs` en todos los niveles ≥ 1, con cada nivel anterior clickeable:
  `Resultados / {esquema} / {módulo} / {submódulo}`.
- Volver un nivel es SPA (`navigate(-1)` o el breadcrumb), nunca recarga.

### La regla de jerarquía (lo que hace que los 3 casos funcionen igual)

El árbol que se pinta **se deriva del conjunto real de `PaqueteItem` del esquema**, no de lo que el
admin "clickeó" al crearlo. En pseudocódigo:

```
items       = PaqueteItem[] del esquema            → con casoPrueba → subModulo → modulo
módulos     = distinct(items.map(i => i.modulo))   → nivel 1
submódulos  = distinct(items.filter(módulo actual).map(i => i.subModulo))  → nivel 2
casos       = items.filter(submódulo actual)       → nivel 3 (tabla)
```

Esto resuelve los tres casos sin lógica especial:

| Lo que seleccionó el admin              | Nivel 1 muestra          | Nivel 2 muestra                       | Nivel 3 muestra              |
|-----------------------------------------|--------------------------|---------------------------------------|------------------------------|
| **Caso 1** — un módulo completo          | ese módulo               | todos sus submódulos                  | todos los casos del submódulo |
| **Caso 2** — 2 submódulos de 2 módulos   | los 2 módulos            | **solo** el submódulo seleccionado de ese módulo | los casos de ese submódulo |
| **Caso 3** — 2 casos de 2 submódulos     | los 2 módulos            | **solo** el submódulo del caso         | **solo** los casos seleccionados |

**Regla dura:** nunca se muestra un módulo, submódulo o caso de prueba que no tenga al menos un
`PaqueteItem` en este esquema. El catálogo completo no se pinta en Resultados.

---

## 3. Semáforo — mide CALIDAD, no completitud

Este es el cambio más importante respecto a la maqueta. `readiness(pct, fail)` **queda derogada**.

El semáforo responde a *"¿qué tan bien salió lo que ya se certificó?"*, no a *"¿cuánto falta?"*.

```ts
// ok   = ítems con estado "aprobado"
// fail = ítems con estado "rechazado"
// certificados = ok + fail   (los "pendiente" NO entran en el cálculo)

function calidad(ok: number, fail: number) {
  const certificados = ok + fail;
  if (certificados === 0) {
    return { light: 'off', pct: null, label: 'Sin certificaciones todavía', cls: 'tag-neutral' };
  }
  const pct = Math.round((ok / certificados) * 100);
  if (pct >= 90) return { light: 'green',  pct, label: 'Certificación conforme',   cls: 'tag-teal' };
  if (pct >= 70) return { light: 'yellow', pct, label: 'Con observaciones',        cls: 'tag-naranja' };
  return           { light: 'red',    pct, label: 'Certificación no conforme', cls: 'tag-rojo' };
}
```

| Calidad     | Luz        | Etiqueta                    |
|-------------|------------|-----------------------------|
| 0 – 69 %    | 🔴 roja    | Certificación no conforme   |
| 70 – 89 %   | 🟡 amarilla| Con observaciones           |
| 90 – 100 %  | 🟢 verde   | Certificación conforme      |
| sin datos   | ⚫ apagado | Sin certificaciones todavía |

**Decisión sobre el estado "sin datos"** (`ok + fail === 0`): las tres luces quedan **apagadas** — que
es el estado por defecto del CSS de `.semaphore-light`, no un cuarto color inventado. Un esquema recién
creado no puede pintarse rojo: eso diría "no conforme" cuando en realidad nadie lo ha revisado.

**El semáforo se calcula en los 4 niveles** con la misma función, cambiando solo el conjunto de ítems:
esquema completo, módulo, submódulo. (En la tabla del nivel 3 el semáforo va en el encabezado.)

---

## 4. Barra de progreso — mide COMPLETITUD

Indicador **distinto** del semáforo. Van juntos en la misma tarjeta y no se contradicen: uno dice
"cuánto se ha revisado", el otro "qué tan bien salió".

```ts
const total = items.length;                  // todos los PaqueteItem del nodo
const done  = ok + fail;                     // certificados
const avance = total ? Math.round(done / total * 100) : 0;
```

- `.progress-fill` en **cian** por defecto.
- `.progress-fill.pf-teal` cuando `avance === 100 && fail === 0`.
- Debajo, siempre el renglón `{done}/{total} ítems certificados` (11.5px, `--grayLight`).

**Nunca** pintes la barra con color de semáforo ni el semáforo con el porcentaje de avance. Son ejes
independientes: un esquema puede estar 100 % avanzado y en rojo (todo revisado, mucho falla), o 20 %
avanzado y en verde (poco revisado, pero lo revisado funciona).

---

## 5. El patrón `mod-card group relative` — cómo se construye un cuadrito

Todas las tarjetas de Resultados (esquema, módulo, submódulo) son **la misma tarjeta** con distinto
contenido. Se construye siempre igual.

### 5.1. Las tres clases del contenedor

```jsx
<div className="mod-card group relative">
```

| Clase      | Qué hace                                                                              |
|------------|---------------------------------------------------------------------------------------|
| `mod-card` | El estilo visual base (definido en `index.css`): fondo `--card`, borde `--border`, `radius-l`, padding 20px, `shadow-sm`, `transition: all .15s ease`. |
| `group`    | Marca la tarjeta como contenedor de grupo Tailwind. **Su único efecto** es habilitar que sus descendientes usen `group-hover:*`. Sin esto, `group-hover:opacity-100` en un hijo no hace absolutamente nada. |
| `relative` | `position: relative`, para que los hijos `absolute` (acciones al hover, flecha) se anclen a **esta tarjeta** y no al `<body>`. **Es el error más común**: si las acciones aparecen en la esquina del navegador, falta `relative`. |

Las tres van **siempre juntas**. No uses `mod-card` sin `group relative` en Resultados, aunque la
tarjeta no tenga acciones todavía — el patrón debe ser uniforme.

### 5.2. Anatomía obligatoria (de arriba a abajo, siempre este orden)

```
┌──────────────────────────────────────────────┐
│  [mod-icon 42×42]              [⚫][Badge]   │  ← fila 1: identidad + estado
│                                              │
│  Nombre del nodo                             │  ← fila 2: mod-card-title
│  meta · meta · meta                          │  ← fila 3: mod-card-meta
│                                              │
│  ████████████░░░░░░░░░░  78%                 │  ← fila 4: progress-track + %
│  14/18 ítems certificados                    │  ← fila 5: renglón de avance
│                                              │
│  [12 bien]  [⚠ 2 con fallas]                 │  ← fila 6: progress-card-chips
└──────────────────────────────────────────────┘
```

1. **Fila superior** (`flex items-start justify-between`):
   - Izquierda: `mod-icon` (42×42, `radius 12px`, fondo `var(--{color}-bg)`, ícono 19px del color
     sólido). El color sale del **hash del `id`** sobre `['cian','morado','magenta','naranja','teal']`
     — misma función `getHashIndex` que ya usa `AdminSchemes.tsx`. No lo cambies por fase.
   - Derecha, en este orden: **acciones al hover** (si las hay) → **semáforo** → **badge de contexto**.
2. **`mod-card-title`** — el nombre del nodo (esquema / módulo / submódulo). 15px bold `--navy`.
3. **`mod-card-meta`** — 11.5px `--grayLight`, separado por ` · `.
4. **`progress-track` + `progress-fill`** con el `%` de avance a la derecha (18px bold, `--navy`).
5. **Renglón de avance** — `{done}/{total} ítems certificados`.
6. **`progress-card-chips`** — la fila de chips de calidad (ver 5.4).

### 5.3. Acciones al hover (solo si la tarjeta las tiene)

```jsx
<div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
  <button className="icon-btn" onClick={(e) => { e.stopPropagation(); /* … */ }}>
    <Pencil size={12} />
  </button>
</div>
```

- **Siempre** `opacity-0 group-hover:opacity-100 transition-opacity`. **Nunca** `display:none` →
  `display:block`: mata la transición y rompe el foco por teclado.
- **Siempre** `e.stopPropagation()` en el `onClick` del botón, para que el clic no burbujee al
  `onClick` de navegación de la tarjeta.
- En Fase 4 las tarjetas de Resultados **no tienen acciones de edición** (es solo lectura). El slot
  existe pero va vacío.

**La flecha de drill-down va INLINE junto al título, no en la esquina.** La esquina superior derecha
ya está ocupada por el semáforo y el badge de ambiente; una flecha absoluta ahí se les encima:

```jsx
<div className="flex items-center gap-1">
  <div className="mod-card-title mb-0">{title}</div>
  {navegable && (
    <ChevronRight
      size={14}
      className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
      style={{ color: 'var(--cian)' }}
    />
  )}
</div>
```

Sigue siendo el mismo patrón (`group` en el padre + `opacity-0 group-hover:opacity-100`); lo único
que cambia es que no necesita `absolute`. El `relative` del contenedor se mantiene igual, porque es
el ancla de cualquier hijo absoluto que se agregue después.

### 5.4. `progress-card-chips` — los chips de calidad

Fila al pie de la tarjeta, siempre **dos chips**, siempre en este orden:

```jsx
<div className="progress-card-chips">
  <span className="tag tag-teal">{ok} bien</span>
  <span className={`tag ${fail > 0 ? 'tag-rojo' : 'tag-neutral'}`}>
    {fail > 0 && <AlertTriangle size={12} />}
    {fail} con fallas
  </span>
</div>
```

- El chip "bien" es **siempre** `tag-teal`, incluso con `ok === 0`.
- El chip "con fallas" es `tag-rojo` **solo si `fail > 0`**; si es 0 va `tag-neutral` (gris) y **sin**
  el ícono `AlertTriangle`. Un 0 en rojo alarma sin motivo.
- **Decidido: hay un tercer chip**, `tag-neutral` con `{pendientes} pendientes`, siempre presente en
  los tres niveles. Sin él la tarjeta no explica por qué la barra no llega a 100 %.

### 5.5. Modificadores de borde

Acento de 3px en el borde izquierdo, según el estado **de calidad** (no de avance):

```css
.mod-card.is-conforme  { border-left: 3px solid var(--teal); }   /* calidad ≥ 90 */
.mod-card.has-fail     { border-left: 3px solid var(--rojo); }   /* calidad < 70 */
```

Amarillo y "sin datos" no llevan acento — la tarjeta queda con su borde normal. Esto evita que un
grid de 12 tarjetas se vea como un semáforo de feria.

### 5.6. Navegable vs. no navegable

| Nivel | ¿Navegable? | Cursor              | `onClick` en el body                     | Flecha |
|-------|-------------|---------------------|-------------------------------------------|--------|
| 0 — esquema   | ✅ sí | `cursor-pointer`    | → `/admin/resultados/:esquemaId`          | ✅     |
| 1 — módulo    | ✅ sí | `cursor-pointer`    | → `.../modulos/:moduloId`                 | ✅     |
| 2 — submódulo | ✅ sí | `cursor-pointer`    | → `.../submodulos/:subModuloId`           | ✅     |

La clase `is-clickable` (definida en `index.css`) aporta el `cursor: pointer` y el hover
(`border-color: var(--cian)` + `translateY(-1px)`). Las tarjetas navegables llevan además
`role="button"`, `tabIndex={0}` y manejo de Enter/Espacio, para que el drill-down funcione por teclado.

En Fase 4 **las tres son navegables**. Si en el futuro una tarjeta es solo informativa: `cursor-default`,
sin `onClick`, sin flecha — pero **conserva** `group relative` para no romper el patrón.

### 5.7. Grid contenedor

```jsx
<div className="grid gap-[14px]" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
```

`280px` en nivel 0 (esquemas), `260px` en niveles 1 y 2 (módulos y submódulos).

### 5.8. Contenido específico por nivel

| Nivel | `mod-icon`                                   | `mod-card-title` | `mod-card-meta`                                  | Badge derecho              |
|-------|----------------------------------------------|------------------|--------------------------------------------------|----------------------------|
| 0 esquema   | `FlaskConical` (Pruebas) / `Rocket` (Producción) | nombre del esquema | `{N} paquetes · {M} ítems · creado {dd/mm/aaaa}` | ambiente (`tag-cian` / `tag-magenta`) |
| 1 módulo    | ícono del mapa de módulos (§4 del DS base)   | nombre del módulo | `{N} submódulos · {M} ítems en este esquema`      | — |
| 2 submódulo | ícono del módulo padre, atenuado             | nombre del submódulo | `{M} ítems · Responsables: {nombres}`          | — |

En nivel 0, además, la fila de **avatares de responsables** (hasta 4 de 30px + `+N` con fondo
`--morado`) va entre `mod-card-meta` y la barra de progreso — igual que hoy en `AdminSchemes.tsx`.

---

## 6. `stat-card` — los 4 KPI del nivel 0

Fila superior de `/admin/resultados`, dentro de `.grid-4` con `margin-bottom: 22px`.

| Tarjeta                   | Valor                                | Color del número |
|---------------------------|--------------------------------------|------------------|
| **Avance global**         | `(ok + fail) / total × 100` %        | `--navy`         |
| **Ítems que funcionan bien** | `ok`                              | `--teal`         |
| **Ítems con fallas**      | `fail`                               | `--rojo`         |
| **Ítems pendientes**      | `total − ok − fail`                  | `--grayLight`    |

CSS (falta en `index.css`, hay que agregarlo):

```css
.stat-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-m); padding: 18px; box-shadow: var(--shadow-sm); }
.stat-num  { font-size: 28px; font-weight: 700; margin: 0; color: var(--navy); }
.stat-label{ font-size: 11.5px; color: var(--grayLight); margin-top: 3px; font-weight: 600; }
```

**Decisión:** la misma fila de 4 `stat-card` se repite en los niveles 1, 2 y 3, **acotada al nodo
actual** (los ítems de ese esquema / módulo / submódulo). Da continuidad visual y responde la pregunta
obvia de cada pantalla sin obligar a leer las tarjetas una por una.

En mobile, `.grid-4` ya colapsa a 1 columna; a partir de 640px conviene 2 columnas.

---

## 7. Nivel 3 — tabla de casos de prueba

Último nivel. Aquí **no hay tarjetas**: hay una tabla tipo Excel dentro de un `.panel` con
`padding: 0` (el panel da el borde y el radio; la tabla ocupa todo el ancho).

### 7.1. Encabezado del nivel

Antes de la tabla, en este orden:
1. `breadcrumbs` completo (4 niveles).
2. Fila de identidad: `mod-icon` del módulo + nombre del submódulo + `semaphore` + `tag` con la
   etiqueta de calidad (`Certificación conforme` / `Con observaciones` / etc.).
3. Los 4 `stat-card` acotados a este submódulo.
4. La barra de filtros.
5. La tabla.

### 7.2. Columnas (exactamente estas, en este orden)

| # | Columna              | Contenido                                                                 |
|---|----------------------|---------------------------------------------------------------------------|
| 1 | **Caso de Prueba**   | `casoPrueba.nombre`. Si tiene clasificador, debajo en 11px `--grayLight`.  |
| 2 | **Estado**           | `tag` + ícono (ver 7.3)                                                    |
| 3 | **Responsable**      | `Avatar` 22px + `Nombre Apellido`. Varios → separados por coma. Ninguno → `—` |
| 4 | **Cambios**          | `tag-naranja` "Con cambios" si aplica; si no, `—` (ver ⚠ en 7.5)          |
| 5 | **Comentario**       | `resultado.comentario`, 12.5px `--grayLight`, `max-width: 260px`, truncado con `title` completo |
| 6 | **Documento Adjunto**| **Placeholder no funcional**: `Paperclip` 14px `--grayLight` `opacity: .5` + `—`. Sin `onClick`, sin link, sin tooltip de "próximamente". |

`<tr>` con clase `row-hover` (ya existe en `index.css`).

### 7.3. Estado — los tres valores y su presentación

| `estado` (backend) | Texto en UI    | Chip          | Ícono              |
|--------------------|----------------|---------------|--------------------|
| `"aprobado"`       | **Funciona**   | `tag-teal`    | `CheckCircle2` 14px `--teal` |
| `"rechazado"`      | **No funciona**| `tag-rojo`    | `XCircle` 14px `--rojo`      |
| `"pendiente"` / sin fila | **Pendiente** | `tag-neutral` | `Clock` 14px `--grayLight` |

Un `PaqueteItem` **sin** `ResultadoItem` se pinta como **Pendiente**. Nunca como fila vacía ni error.

### 7.4. Filtros

Barra encima de la tabla (`toolbar`), dos filtros, ambos **cliente-side** sobre las filas ya cargadas:

- **Responsable** — `Select` con "Todos los responsables" + un `option` por responsable distinto
  presente en este submódulo.
- **Estado** — `Select` con "Todos los estados" + `Funciona` / `No funciona` / `Pendiente`.

Reglas:
- El estado de los filtros vive en la **query string** (`?responsable=<id>&estado=rechazado`) para que
  la vista filtrada sea compartible.
- Si el filtro deja 0 filas: `empty-state` dentro del panel con título *"Ningún caso de prueba
  coincide con los filtros"* y un botón `btn-ghost btn-sm` **"Limpiar filtros"**.
- Los 4 `stat-card` de arriba **no** se recalculan con el filtro: siempre reflejan el submódulo
  completo. Filtrar es mirar un subconjunto, no cambiar la medición.
- Ícono `Filter` 14px inline en la etiqueta de la barra de filtros.

### 7.5. La columna "Cambios" — resuelta

`ResultadoItem` no tenía dónde guardar esto. Se **agregó el campo** en la migración
`20260904053155_phase4_resultado_cambio`:

```prisma
// en model ResultadoItem
cambio Boolean @default(false)   // el certificador reportó que el ítem requirió cambios
```

Es **independiente del estado**: un caso puede quedar `"aprobado"` y aun así `cambio: true`. La celda
muestra `tag-naranja` "Con cambios" cuando es `true`, y `—` cuando es `false`. La escritura de este
campo llega en la Fase 5; en la 4 solo se lee.

---

## 8. Endpoints de la Fase 4

Todos con `Authorization: Bearer <token>`, contra `http://localhost:3000`, bajo
`@Controller('api')` + `@Roles(ADMIN)`. **Cada pantalla pide su vista ya agregada** — la UI no
recorre listas grandes de ítems crudos para calcular porcentajes.

| Nivel | Acción                                   | Endpoint                                                    |
|-------|------------------------------------------|-------------------------------------------------------------|
| 0     | KPIs + tarjetas de esquema               | `GET /api/resultados/overview`                              |
| 1     | Módulos de un esquema                    | `GET /api/resultados/esquemas/:esquemaId`                   |
| 2     | Submódulos de un módulo en ese esquema   | `GET /api/resultados/esquemas/:esquemaId/modulos/:moduloId` |
| 3     | Casos de prueba de un submódulo          | `GET /api/resultados/esquemas/:esquemaId/submodulos/:subModuloId` |

**Bloque de métricas común.** Cada nodo (esquema, módulo, submódulo) devuelve siempre la misma forma,
para que el frontend tenga un solo componente de tarjeta:

```ts
type Metricas = {
  total: number;       // PaqueteItem del nodo
  ok: number;          // estado "aprobado"
  fail: number;        // estado "rechazado"
  pendientes: number;  // total - ok - fail
  avance: number;      // (ok+fail)/total*100, entero
  calidad: number | null; // ok/(ok+fail)*100, entero; null si ok+fail === 0
};
```

El frontend **no** recalcula `avance` ni `calidad`; solo mapea `calidad` → color de luz con la tabla
del §3.

Respuestas por nivel:

```ts
// GET /api/resultados/overview
{
  totales: Metricas,                         // suma de todos los esquemas (para los 4 stat-card)
  esquemas: Array<{
    id, nombre, ambiente, creadoEn,
    responsables: [{ id, nombre, apellido }],
    _count: { paquetes, items },
    metricas: Metricas,
  }>
}

// GET /api/resultados/esquemas/:esquemaId
{
  esquema: { id, nombre, ambiente, creadoEn },
  metricas: Metricas,                        // del esquema completo
  modulos: Array<{ id, nombre, subModulosCount, metricas: Metricas }>
}

// GET /api/resultados/esquemas/:esquemaId/modulos/:moduloId
{
  esquema: { id, nombre, ambiente },
  modulo:  { id, nombre },
  metricas: Metricas,                        // del módulo dentro de este esquema
  subModulos: Array<{
    id, nombre,
    responsables: [{ id, nombre, apellido }],
    metricas: Metricas,
  }>
}

// GET /api/resultados/esquemas/:esquemaId/submodulos/:subModuloId
{
  esquema: { id, nombre, ambiente },
  modulo:  { id, nombre },
  subModulo: { id, nombre },
  metricas: Metricas,
  responsablesDisponibles: [{ id, nombre, apellido }],   // para el filtro
  casos: Array<{
    paqueteItemId, casoPruebaId, nombre,
    clasificador: string | null,
    estado: 'aprobado' | 'rechazado' | 'pendiente',
    cambio: boolean,
    comentario: string | null,
    responsables: [{ id, nombre, apellido }],
    certificadoPor: { id, nombre, apellido } | null,
    certificadoEn: string | null,
  }>
}
```

**Importante sobre los responsables:** un `PaqueteItem` no tiene responsable propio — lo hereda del
`Paquete` (`PaqueteResponsable`). El backend resuelve ese salto; la UI recibe la lista ya lista.

---

## 9. Estados de carga, vacío y error

- **Carga:** un texto centrado `Cargando resultados...` en `--grayLight` (mismo patrón que
  `AdminSchemes.tsx`). Nada de skeletons nuevos.
- **Sin esquemas** (nivel 0): `panel` + `empty-state`, ícono `BarChart3` 32px `opacity .5`, título
  *"Todavía no hay nada que mostrar"*, subtítulo *"Crea un esquema de evaluación y asigna responsables
  para empezar a ver resultados aquí."*, y botón `btn-outline btn-sm` **"Ir a Esquemas"** →
  `/admin/esquemas`.
- **Esquema sin certificaciones:** **no** es un estado vacío. Se renderiza todo normal: KPIs en 0,
  barras en 0 %, semáforos **apagados**, chips `0 bien` / `0 con fallas`. La tabla del nivel 3 muestra
  todas sus filas en **Pendiente**.
- **Error:** toast con el mensaje del backend, leído con el patrón estándar
  (`response.data.message` array→[0] → `.error` → fallback). Nunca un texto inventado.
- **404 de navegación** (id inexistente en la URL): toast con el mensaje del backend + `navigate` al
  nivel anterior. No dejes la pantalla en blanco.

---

## 10. Íconos de la Fase 4

Cero emojis. Todo `lucide-react` con `size={}` explícito.

| Contexto                                        | Ícono            | Tamaño                        |
|-------------------------------------------------|------------------|-------------------------------|
| Sidebar **Resultados**                          | `BarChart3`      | 18px                          |
| Empty state sin esquemas                        | `BarChart3`      | 32px, `opacity .5`, `--grayLight` |
| Flecha de drill-down en la tarjeta              | `ChevronRight`   | 14px                          |
| Separador de breadcrumbs                        | `ChevronRight`   | 12px, `--grayLight`           |
| Chip "con fallas" (solo si `fail > 0`)          | `AlertTriangle`  | 12px inline                   |
| Etiqueta de la barra de filtros                 | `Filter`         | 14px inline                   |
| Estado **Funciona**                             | `CheckCircle2`   | 14px, `--teal`                |
| Estado **No funciona**                          | `XCircle`        | 14px, `--rojo`                |
| Estado **Pendiente**                            | `Clock`          | 14px, `--grayLight`           |
| Columna **Documento Adjunto** (placeholder)     | `Paperclip`      | 14px, `--grayLight`, `opacity .5` |
| Ambiente Pruebas / Producción                   | `FlaskConical` / `Rocket` | 19px dentro de `mod-icon` 42×42 |

El **semáforo** sigue siendo bespoke (3 puntos sobre fondo navy). No lo reemplaces por un ícono.

---

## 11. CSS que falta en `index.css`

Agregar en la sección correspondiente, **sin tocar** nada existente y **sin valores nuevos** fuera de
la paleta:

```css
/* ── STAT CARD (KPI) ────────────────────────── */
.stat-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-m); padding: 18px; box-shadow: var(--shadow-sm); }
.stat-num  { font-size: 28px; font-weight: 700; margin: 0; color: var(--navy); }
.stat-label{ font-size: 11.5px; color: var(--grayLight); margin-top: 3px; font-weight: 600; }

/* ── CHIPS DE CALIDAD EN TARJETA ────────────── */
.progress-card-chips { display: flex; gap: 7px; margin-top: 12px; flex-wrap: wrap; align-items: center; }
.progress-card-chips .tag { display: inline-flex; align-items: center; gap: 4px; }

/* ── ACENTOS DE CALIDAD EN MOD-CARD ─────────── */
.mod-card.is-conforme { border-left: 3px solid var(--teal); }
.mod-card.has-fail    { border-left: 3px solid var(--rojo); }

/* ── HOVER NAVEGABLE ────────────────────────── */
.mod-card.is-clickable { cursor: pointer; }
.mod-card.is-clickable:hover { border-color: var(--cian); transform: translateY(-1px); }
```

Ya existen y **se reutilizan tal cual**: `.mod-card`, `.mod-icon`, `.mod-card-title`, `.mod-card-meta`,
`.progress-track`, `.progress-fill`, `.pf-teal`, `.semaphore`, `.semaphore-light`, `.tag*`, `.panel`,
`.grid-4`, `.breadcrumbs`, `.empty-state`, `.toolbar`, `.icon-btn`, `.avatar`, `table/th/td`,
`tr.row-hover`.

**No** se agrega `.filter-tabs`, `.progress-card`, `.env-half` ni ninguna clase de las pestañas
derogadas.

---

## 12. Sidebar

`Resultados` pasa de `<div>` deshabilitado a **`NavLink` real** a `/admin/resultados`, con el mismo
tratamiento activo (`bg-[var(--cian-bg)]` + `text-[var(--cian)]`) que los otros tres, ícono
`BarChart3` 18px.

Quedan **4 ítems habilitados** (Usuarios, Catálogo, Esquemas de evaluación, Resultados) y **1
deshabilitado** (Solicitudes, `FileText`, `opacity-55 cursor-default`, sin `onClick`).

---

## 13. Invariantes de la Fase 4

1. **Solo lectura.** Resultados no marca, no aprueba, no rechaza, no comenta, no adjunta. Toda la
   escritura de `ResultadoItem` es Fase 5.
2. **Esquemas aislados.** Ningún número de un esquema se contamina con otro. Crear un esquema nuevo no
   baja el avance de ninguno existente.
3. **Jerarquía siempre completa.** Módulo → SubMódulo → Caso, aunque el admin haya seleccionado un solo
   caso suelto.
4. **Solo lo seleccionado.** Nunca se muestra un nodo del catálogo sin `PaqueteItem` en este esquema.
5. **Semáforo = calidad, barra = completitud.** Nunca se cruzan.
6. **`ResultadoItem` vacío es un caso válido**, no un error: la UI debe verse bien con la tabla en cero.
7. **Nada de datos mock.** Cada nivel consume su endpoint real.
8. **URLs compartibles.** Nivel, ids y filtros viven en la ruta o en la query string.
9. **Cero valores de diseño nuevos.** Todo color, radio y sombra sale de §1 y §3 del Design System base.

---

## 14. Checklist final — Fase 4

- [ ] ¿El sidebar tiene 4 ítems habilitados y "Resultados" es un `NavLink` con activo cian?
- [ ] ¿`/admin/resultados` muestra **una sola vista** (sin `filter-tabs`) con los 4 `stat-card` y el
      grid de tarjetas de esquema?
- [ ] ¿Existen las 4 rutas de drill-down y cada nivel tiene `breadcrumbs` clickeables?
- [ ] ¿El nivel 1 muestra **módulos** aunque el admin haya seleccionado submódulos o casos sueltos?
- [ ] ¿El nivel 2 muestra **solo** los submódulos con ítems en este esquema?
- [ ] ¿El nivel 3 muestra **solo** los casos de prueba seleccionados, nunca todo el submódulo?
- [ ] ¿El semáforo usa `ok/(ok+fail)` con cortes 0–69 / 70–89 / 90–100, y queda **apagado** cuando no
      hay certificaciones?
- [ ] ¿La barra de progreso usa `(ok+fail)/total` y es independiente del semáforo?
- [ ] ¿Todas las tarjetas usan `mod-card group relative`, con `relative` presente y la flecha
      `ChevronRight` en `opacity-0 group-hover:opacity-100`?
- [ ] ¿`progress-card-chips` tiene los dos chips, con "con fallas" en `tag-neutral` cuando es 0?
- [ ] ¿La tabla tiene las 6 columnas exactas, en orden, con "Documento Adjunto" inerte?
- [ ] ¿Los filtros de responsable y estado funcionan, viven en la query string y **no** alteran los KPI?
- [ ] ¿Se decidió qué hacer con la columna **Cambios** (campo `cambio` en `ResultadoItem` o placeholder)?
- [ ] ¿La pantalla funciona con `ResultadoItem` vacío sin excepciones ni spinner infinito?
- [ ] ¿Los errores se leen del backend con el patrón estándar y no hay ningún dato mock?
- [ ] ¿Ningún ícono es un emoji y todos tienen `size={}` explícito?
- [ ] ¿Ningún color, radio o sombra nuevo fuera de la paleta?
