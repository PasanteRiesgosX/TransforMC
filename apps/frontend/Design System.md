# Design System — Certificación Vista 5.0 (Multicines)

> **Este documento es la fuente de verdad del diseño.** Úsalo junto con el HTML de referencia y las
> capturas de pantalla adjuntas. Ante cualquier ambigüedad entre "lo que se ve mejor" y lo que dice
> este documento, **gana este documento**. No inventes colores, tamaños ni tipografías que no estén
> listados aquí.

---

## 1. Paleta de colores

Estos son los **únicos** colores permitidos en toda la aplicación. Impleméntalos como CSS variables
o como `extend` en `tailwind.config.js` — nunca como hex sueltos dentro de un componente.

### Base

| Token         | Hex        | Uso                                              |
|---------------|------------|---------------------------------------------------|
| `--bg`        | `#F4F6FA`  | Fondo general de la app (fuera de cards)          |
| `--card`      | `#FFFFFF`  | Fondo de tarjetas, modales, sidebar, inputs       |
| `--navy`      | `#1E2233`  | Fondo landing/login/topbar; texto de títulos      |
| `--gray`      | `#3A3F4A`  | Texto principal (body)                            |
| `--grayLight` | `#6E747A`  | Texto secundario / metadatos                      |
| `--border`    | `#E7EAF2`  | Bordes de cards, inputs, separadores              |

### Acento (marca)

| Token       | Hex        |
|-------------|------------|
| `--cian`    | `#00AEEF`  |
| `--morado`  | `#7C3AED`  |
| `--magenta` | `#EC008C`  |
| `--naranja` | `#F5A623`  |
| `--teal`    | `#00B39A`  |

### Estado / semáforo

| Token              | Hex        | Uso                          |
|--------------------|------------|-------------------------------|
| `--verde`          | `#8BC34A`  | Éxito                        |
| `--verdeAmarillo`  | `#FFD54F`  | Advertencia leve              |
| `--naranjaFuerte`  | `#FB8C00`  | Advertencia (warn buttons)    |
| `--rojo`           | `#E53935`  | Error / peligro               |

### Fondos suaves (badges, tags, hover)

| Token          | Valor                          |
|----------------|----------------------------------|
| `--cian-bg`    | `rgba(0,174,239,0.10)`          |
| `--morado-bg`  | `rgba(124,58,237,0.10)`         |
| `--magenta-bg` | `rgba(236,0,140,0.10)`          |
| `--naranja-bg` | `rgba(245,166,35,0.12)`         |
| `--teal-bg`    | `rgba(0,179,154,0.12)`          |
| `--rojo-bg`    | `rgba(229,57,53,0.10)`          |

**Regla:** cuando un elemento (badge, tag, ícono con fondo) usa un color de acento, el fondo es
siempre la versión `-bg` (10-12% opacidad) del mismo color, nunca el color sólido, excepto en
botones primarios y barras de progreso.

---

## 2. Tipografía

- Fuente: sans-serif del sistema — `Inter` (recomendada si está disponible) o el stack original
  `Arial, Helvetica, 'Segoe UI', sans-serif`. No usar fuentes decorativas ni serif.
- Tamaño base: `14px` / `line-height: 1.5`.
- Pesos: `700` (bold) para títulos, labels, botones y nombres. `600` para metadatos con énfasis.
  `400` para texto de párrafo/descripciones.

| Elemento                | Tamaño   | Peso | Color         |
|--------------------------|----------|------|---------------|
| `landing-title` (h1)     | 30px     | 700  | `#FFFFFF`     |
| `landing-desc`           | 15px     | 400  | `#AEB4C4`     |
| `login-title` (h1)       | 22px     | 700  | `--navy`      |
| `page-title` (h1)        | 23px     | 700  | `--navy`      |
| `page-sub`               | 13px     | 400  | `--grayLight` |
| `field label`            | 12px     | 700  | `--gray`      |
| `card title` (nombre)    | 14.5px   | 700  | `--navy`      |
| `card meta / cargo`      | 12px     | 400  | `--grayLight` |
| `tag`                    | 11px     | 700  | según color   |
| `button`                 | 13.5px   | 700  | según variante|

---

## 3. Espaciado, radios y sombras

- Radios: `--radius-s: 6px` (inputs, botones, chips pequeños) · `--radius-m: 10px` (bloques internos)
  · `--radius-l: 16px` (cards, modal, login card — el radio "grande" de la marca).
- Sombras: `--shadow: 0 10px 28px rgba(30,34,51,0.10)` (modal, login card) ·
  `--shadow-sm: 0 2px 8px rgba(30,34,51,0.06)` (cards en reposo).
- Padding estándar de card: `18-22px`. Gap entre cards en grid: `14-16px`.
- Transiciones: `all .15s ease` para hovers de card/botón; `.2s` como máximo. No usar animaciones
  de más de 300ms ni easing "bounce"/elastic — todo es sutil y rápido.

---

## 4. Regla de íconos (el punto que más se rompió antes)

Los íconos **nunca van sueltos a tamaño libre**. Siempre viven dentro de un contenedor ("badge")
con fondo `-bg` del color correspondiente:

| Contexto                          | Tamaño del contenedor | Tamaño del ícono dentro | Radio        |
|------------------------------------|------------------------|---------------------------|--------------|
| Role card (landing)                | 44×44px                | 20px                      | 12px         |
| Avatar grande (`avatar-lg`, users) | 44×44px                | (iniciales, no ícono)     | 12px         |
| Avatar chico (`avatar`, topbar)    | 30×30px                | (iniciales, no ícono)     | 50% (círculo)|
| Card de módulo/catálogo            | 42×42px                | 19px                      | 12px         |
| Ícono de sidebar                   | 18px (sin contenedor)  | 14-16px                   | —            |
| Ícono inline en botón/tag          | sin contenedor         | 14-16px                   | —            |
| `icon-btn` (editar/eliminar)       | 26×26px                | 11-12px                   | 6px          |
| Warn icon en modal                 | 48×48px                | 22px                      | 50% (círculo)|

**Checklist antes de dar por terminado cualquier componente con íconos:**
- [ ] ¿El ícono tiene `size={}` explícito (nunca el default de la librería)?
- [ ] ¿Está dentro de un contenedor del tamaño de la tabla de arriba, o es un ícono inline ≤18px?
- [ ] Si es de librería (ej. `lucide-react`), ¿el tamaño en px coincide con la columna "ícono dentro"?

Está **prohibido** un ícono mayor a 24px fuera de badges grandes (warn icon), y mayor a 20px dentro
de badges normales.

**Prohibido usar emojis como ícono en ningún lugar de la app** (ni en el sidebar de navegación, ni
en las tarjetas de módulo del catálogo, ni en ningún badge). Todos los íconos deben ser SVG de una
librería real (`lucide-react` recomendada), con `size={}` explícito según la tabla de arriba. La
maqueta original usaba emojis (📦 🎬 🎟️ etc.) solo como placeholder — en la app real se reemplazan
1 a 1 por íconos de línea de la misma librería, manteniendo el mismo color de fondo (`-bg`) que
tenía el emoji.

### Mapa de íconos por módulo (reemplaza a los emojis de la maqueta)

Usa este mapeo por palabra clave en el nombre del módulo (case-insensitive, `includes`), igual que
hacía `moduloIcon()` en la maqueta, pero devolviendo un nombre de ícono de `lucide-react` en vez de
un emoji:

| Palabra(s) clave en el nombre         | Ícono lucide-react |
|----------------------------------------|---------------------|
| `film`, `program`                      | `Clapperboard`      |
| `voucher`, `vmanagement`                | `Ticket`            |
| `loyalty`                               | `CreditCard`        |
| `head office`, `headoffice`             | `Building2`         |
| `back office`, `backoffice`             | `Archive`           |
| `cinema manager`                        | `Video`             |
| `cash desk`                             | `Banknote`          |
| `kiosco trade`, `trade`                 | `ShoppingCart`      |
| `pos`                                   | `Receipt`           |
| `ta ia`, `ia interactive`               | `Bot`               |
| `kiosco vista`, `kiosk`                 | `Monitor`           |
| `usher`                                 | `DoorOpen`          |
| *(ninguna coincidencia — fallback)*     | `Package`           |

El color de fondo del badge (`mod-icon`) sigue igual que antes: se calcula por hash del `id` del
módulo sobre la lista `['cian','morado','magenta','naranja','teal']` — no lo cambies, solo cambia
el contenido de adentro (emoji → ícono SVG).

### Íconos nuevos de la Fase 3 (Esquemas de evaluación)

Misma regla: **cero emojis**, todo `lucide-react` con `size={}` explícito. Reemplazos 1 a 1 de los
glifos/emojis que usa la maqueta en la sección de esquemas:

| Contexto (maqueta)                                   | Glifo/emoji original | Ícono `lucide-react`              | Tamaño                        |
|------------------------------------------------------|----------------------|-----------------------------------|-------------------------------|
| Badge de ambiente **Pruebas** (en tarjeta de esquema)| 🧪                    | `FlaskConical`                    | 19px, dentro de `mod-icon` 42×42 |
| Badge de ambiente **Producción**                     | 🚀                    | `Rocket`                          | 19px, dentro de `mod-icon` 42×42 |
| Botón "Asignar módulo completo" / "Asignar sección"  | ⚡                    | `Zap`                             | 14px inline (dentro del botón texto) |
| Caret de árbol del picker (cerrado / abierto)        | ▶ / ▼                | `ChevronRight` / `ChevronDown`    | 16px inline                   |
| Empty state "todavía no has creado ningún esquema"   | ◈                    | `ClipboardList`                   | 32px, `opacity:.5`, color `--grayLight` |
| Empty state "todavía no hay paquetes"                | 📦                    | `Package`                         | 32px, `opacity:.5`, color `--grayLight` |
| Editar paquete / esquema (`icon-btn`)                | ✎                    | `Pencil`                          | `icon-btn` 26×26, ícono 12px  |
| Eliminar paquete / esquema (`icon-btn`)              | ✕                    | `Trash2`                          | `icon-btn` 26×26, ícono 12px  |

- **Color del badge de ambiente** (`mod-icon` de la tarjeta de esquema): sigue la misma regla de hash
  del `id` del esquema sobre `['cian','morado','magenta','naranja','teal']` — igual que un módulo.
- **El semáforo (`.semaphore`) NO es un ícono de librería** — es un componente bespoke de 3 puntos
  sobre fondo navy, ya definido en CSS. Se mantiene tal cual (no lo reemplaces por un ícono lucide).
- **Avatar "+N"** (overflow de responsables): no es un ícono, es un `avatar` (30px, círculo) con el
  texto `+N` y fondo `--morado` (`bg-morado`), tal como la maqueta.

### Íconos nuevos de la Fase 4 (Resultados)

Misma regla: **cero emojis**, todo `lucide-react` con `size={}` explícito.

| Contexto                                                         | Ícono `lucide-react`  | Tamaño                              |
|------------------------------------------------------------------|-----------------------|-------------------------------------|
| Ítem del sidebar **Resultados**                                  | `BarChart3`           | 18px (sin contenedor)               |
| Empty state "Todavía no hay nada que mostrar" (sin esquemas)     | `BarChart3`           | 32px, `opacity:.5`, `--grayLight`   |
| Empty state "Este esquema todavía no tiene certificaciones"      | `ClipboardCheck`      | 32px, `opacity:.5`, `--grayLight`   |
| Ícono de flecha "abrir detalle" en `progress-card` (drill-down)  | `ChevronRight`        | 14px inline                         |
| Ícono en breadcrumbs para separar niveles (fallback al "/")      | `ChevronRight`        | 12px inline, `--grayLight`          |
| Tag / conteo "Ítems con falla"                                   | `AlertTriangle`       | 12px inline (dentro del tag)        |
| Tag / conteo "Ítems funcionales"                                 | `CheckCircle2`        | 12px inline                         |
| Tag / conteo "Ítems pendientes"                                  | `Clock`               | 12px inline                         |
| Botones de filtro en tabla ("Responsable", "Estado")             | `Filter`              | 14px inline (dentro del botón)      |
| Columna **Documento Adjunto** (placeholder no funcional)         | `Paperclip`           | 14px, color `--grayLight`, opacity .5 |
| Ícono en la celda "Estado — Funciona" de la tabla                | `CheckCircle2`        | 14px, color `--teal`                |
| Ícono en la celda "Estado — No funciona" de la tabla             | `XCircle`             | 14px, color `--rojo`                |
| Ícono en la celda "Estado — Pendiente" de la tabla               | `Clock`               | 14px, color `--grayLight`           |

- **El semáforo (`.semaphore`) sigue siendo bespoke** (NO lo reemplaces por un ícono de librería).
  Lo único que cambia entre Fase 3 y Fase 4 es que **ahora sí se cablea a data real**, pero con una
  fórmula NUEVA basada en calidad de certificación (ver §6quater), no en completitud.
- **La barra de progreso (`.progress-track` + `.progress-fill`)** tampoco es un ícono; en Fase 4
  se cablea al porcentaje **de completitud** calculado sobre los `ResultadoItem` del esquema. Ojo:
  la barra representa completitud, el semáforo representa calidad — son dos indicadores distintos.

---

## 5. Logo

- **No agregues ningún logo por ahora.** El logo se pega manualmente después como string base64.
- Deja únicamente el contenedor/slot con el tamaño y posición correctos:
  - **Landing:** `height: 38px`, centrado, `margin-bottom: 36px` respecto al título.
  - **Topbar / header interno (post-login):** `height: 22px`, alineado a la **izquierda**, nunca
    centrado ni ocupando ancho completo. Va junto al breadcrumb, separado por un divisor vertical
    sutil (`border-left: 1px solid rgba(255,255,255,.15)`).
- Nunca uses un `<img>` con un asset importado desde `/assets` a tamaño natural — eso fue lo que
  causó el logo gigante. El patrón correcto es un elemento con altura fija en px (no `w-full`,
  no `h-auto`, no `object-contain` sin contenedor con altura definida) y `width: auto`.

---

## 6. Componentes clave (specs exactas)

### Landing (pantalla de bienvenida)
- Fondo `--navy`, `min-height: 100vh`, contenido centrado vertical y horizontalmente.
- Barra de firma superior: 4px de alto, dividida en 4 franjas iguales de los 4 colores de acento
  (cian, morado, magenta, naranja).
- Dos `role-card` lado a lado (`flex`, `gap:16px`, min-width 210px cada una): fondo
  `rgba(255,255,255,0.04)`, borde `rgba(255,255,255,0.14)`, radius-l. Hover: fondo
  `rgba(255,255,255,0.08)`, borde cian, `translateY(-2px)`.

### Login
- Mismo fondo navy que landing. Card blanca centrada, `max-width: 400px`, radius-l, shadow.
- Badge de rol (arriba del título) en pill: `padding: 5px 12px`, `border-radius: 20px`, fondo
  `-bg` del color de rol (cian para certificador, morado para admin).
- Inputs: borde `1.5px solid var(--border)`, focus → borde cian. Sin sombra en focus.
- Botón primario: ancho completo, fondo cian, texto blanco, hover con `brightness(1.08)` y
  sombra de color.

### Topbar (post-login)
- Alto fijo `60px`, fondo `--navy`, `position: sticky; top:0`.
- Izquierda: logo (22px) + breadcrumb con separador vertical.
- Derecha: chip de usuario (avatar circular 30px + nombre) + botón "Salir" tipo pill translúcido.

### Sidebar — navegación por módulos
- Ancho fijo `224px`, fondo blanco, borde derecho sutil.
- Ítems de navegación: `padding: 10px 12px`, radius-s, ícono 18px (lucide-react, nunca emoji) +
  label 13.5px bold.
- Activo: fondo `--cian-bg`, texto cian. Deshabilitado (pestañas de fases futuras, sin implementar
  aún): opacidad 0.55, cursor default, sin hover, sin `onClick`.
- **Estado actual (Fase 4):** **4 ítems habilitados** — **Usuarios** (`Users`), **Catálogo**
  (`LayoutGrid`), **Esquemas de evaluación** (`ClipboardList`) y ahora **Resultados** (`BarChart3`).
  Este último pasa de `div` deshabilitado a `NavLink` real apuntando a `/admin/resultados`, con el
  mismo tratamiento de activo (`--cian-bg` + texto cian) que los otros tres. El único ítem que sigue
  deshabilitado es **Solicitudes** (`FileText`) — mantén su tratamiento actual (opacidad 0.55, sin
  `onClick`) hasta la fase que lo aborde. No cambies sus íconos: en el código real son `BarChart3` y
  `FileText` (no `Inbox`).

### Cards de usuario (`user-card`)
- Fondo blanco, borde sutil, radius-l, padding 18px, shadow-sm, hover → borde cian (sin transform).
- Estructura interna: avatar-lg (iniciales, 44px, esquinas redondeadas 12px, color por hash del id)
  + nombre/cargo → correo → fila inferior con tags (rol + estado) y acciones (editar/eliminar).
- Grid responsive: `repeat(auto-fill, minmax(240px, 1fr))`, gap 14px.

### Modal
- Overlay: `rgba(20,22,33,0.55)` + blur sutil. Modal centrado, blanco, radius-l, max-width 520px,
  shadow. Header con título + botón cerrar (×). Footer con acciones alineadas a la derecha,
  separado por borde superior.

### Tags / badges de estado
- Pill (`border-radius: 20px`), padding `3px 10px`, fondo `-bg` + texto en el tono sólido u oscurecido
  del color (ver tabla de colores). Ej: `tag-morado` = fondo `--morado-bg`, texto `--morado`.

### Toast
- Fondo `--navy`, texto blanco, pill (`border-radius: 30px`), centrado abajo, con punto cian
  decorativo. Aparece/desaparece con fade + leve traslación vertical (4px), 250ms.

### Patrón `mod-card group relative` (revelar acciones al hover)

Cada tarjeta reutilizable de la app (`mod-card` en catálogo, esquemas, resultados) se compone
combinando tres clases sobre el mismo `<div>`:

```jsx
<div className="mod-card group relative">
  ...contenido de la tarjeta...
  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
    <button className="icon-btn"><Pencil size={12} /></button>
    <button className="icon-btn"><Trash2 size={12} /></button>
  </div>
</div>
```

**Qué hace cada clase (todas son Tailwind puras, no CSS bespoke):**
- **`mod-card`** — el estilo visual base (fondo blanco, borde, `radius-l`, padding 20px, sombra
  suave, transición). Está definido en `index.css` como CSS custom porque lo usan varios módulos.
- **`group`** — marca la tarjeta como "contenedor de grupo Tailwind". Su único efecto es habilitar
  que sus **descendientes** usen los modificadores `group-hover:*`, `group-focus:*`, etc. Sin este
  `group` en el padre, `group-hover:opacity-100` en el hijo no hace absolutamente nada.
- **`relative`** — establece a la tarjeta como contexto de posicionamiento (`position: relative`)
  para que los `<div>` hijos con `absolute` (los `icon-btn` de acción) queden anclados a la
  esquina de **esta tarjeta** y no del `<body>`.

**Regla:** cuando una tarjeta tenga acciones que aparecen al pasar el cursor (editar/eliminar/
reordenar), usa este patrón exacto. Nunca `display:none` + `display:block` (mata la transición ni
respeta el foco por teclado); usa `opacity-0 group-hover:opacity-100 transition-opacity`. Y no
olvides `relative` — es el error más común: si las acciones aparecen en la esquina del navegador en
vez de en la esquina de la tarjeta, es porque falta el `relative` en el padre.

---

## 6bis. Catálogo — pantallas y componentes (Fase 2)

### Lista de módulos (`admin-catalog`)
- Encabezado de página (`page-head`) + barra de búsqueda (`search-wrap`, un solo input ancho
  completo, placeholder "Buscar módulo, submódulo o caso de prueba...") que filtra en vivo.
- Toolbar con botón primario a la derecha: **"+ Nuevo módulo"**.
- Grid de `mod-card` (`repeat(auto-fill, minmax(240px,1fr))`, gap 14-16px): cada card tiene el
  `mod-icon` (42×42px, ver mapa de íconos arriba), nombre del módulo, versión (o "sin versión"),
  y un renglón secundario "`N` submódulos · `M` casos de prueba". Clic en la card abre el detalle.
- Cuando hay texto en el buscador, la vista cambia a una tabla plana de resultados (ítem, módulo ›
  submódulo, acción eliminar) en vez del grid de cards — igual que en la maqueta.

### Detalle de módulo (`admin-catalog-detail`)
- `breadcrumbs`: "Catálogo / {nombre del módulo}".
- Encabezado con `mod-icon` + nombre + versión + conteo de submódulos.
- Toolbar: botones **"+ SubMódulo"** (outline) y **"Eliminar módulo"** (danger) a la derecha.
- Fila de `sub-pill` (una por submódulo, con conteo de casos entre paréntesis) — clic en una pill
  la marca `active` (fondo cian sólido) y despliega su panel de casos de prueba debajo.

### Panel de un submódulo (al hacer clic en su pill)
- Header del panel: nombre del submódulo a la izquierda; a la derecha, en este orden, **tres**
  acciones (antes había dos — se agrega la del medio):
  1. **"+ Clasificador"** (`btn-outline btn-sm`) — nuevo botón de esta fase.
  2. **"+ Caso de Prueba"** (`btn-outline btn-sm`) — antes decía "+ Ítem".
  3. Ícono eliminar submódulo (`icon-btn`, ✕ → reemplazar por ícono `Trash2` o `X` de lucide).
- Debajo del header, el contenido se organiza en dos posibles bloques (pueden coexistir):
  1. **Casos sin clasificador**, listados directo como `item-row` (igual que la maqueta).
  2. **Por cada clasificador** del submódulo: un sub-encabezado con el nombre del clasificador
     (texto 12px bold, color `--gray`, `text-transform: uppercase`, `letter-spacing: 0.02em` —
     mismo tratamiento visual que `.sub-block-title` en la maqueta) seguido de sus `item-row`
     correspondientes. Si un submódulo no tiene ningún clasificador, este bloque no aparece — el
     panel se ve exactamente igual que en la maqueta original.
- Cada `item-row` (caso de prueba) muestra el nombre y, al hover, dos `icon-btn`: editar (`Pencil`)
  y eliminar (`Trash2`) — reemplazando los íconos ✎/✕ de la maqueta.
- Si el submódulo no tiene ningún caso de prueba todavía, mostrar el mismo estado vacío de texto
  gris que ya usa la maqueta ("Todavía no hay casos de prueba en este submódulo.").

### Modales
- **Nuevo módulo / Editar módulo:** campos `nombre` (requerido), `versión` (opcional), `conjunto`
  (opcional — input de texto libre, ej. "Vista", "Head Office (HO)"). Error inline si el nombre ya
  existe (case-insensitive) → mismo patrón visual que `error-msg` en los modales de usuario.
- **Nuevo SubMódulo / Editar SubMódulo:** un solo campo `nombre` (requerido). Sin validación de
  duplicados (los nombres de submódulo pueden repetirse).
- **Nuevo Clasificador / Editar Clasificador:** un solo campo `nombre` (requerido), asociado al
  submódulo actualmente abierto. Sin validación de duplicados.
- **Nuevo Caso de Prueba / Editar Caso de Prueba:** campo `nombre` (requerido) + selector
  `Clasificador` (`<select>`) con opción **"Sin clasificador"** por defecto más las clasificaciones
  existentes de ese submódulo. Si el submódulo no tiene ningún clasificador creado, el selector no
  se muestra en absoluto (no tiene sentido mostrarlo vacío).
- **Confirmación de eliminar módulo/submódulo:** usar el mismo patrón de `confirm()` o modal de
  advertencia (`modal-warn-icon`) ya presente en la maqueta, dejando claro en el texto que se
  borrará todo lo que contiene (cascada).
- **Confirmación de eliminar clasificador:** el texto de confirmación debe aclarar explícitamente
  que **los casos de prueba NO se eliminan**, solo quedan sin clasificador — para que el admin no
  piense que va a perder información. Ej.: *"¿Eliminar este clasificador? Los casos de prueba que
  agrupa no se eliminan, solo dejarán de estar agrupados."*

---

## 6ter. Esquemas de evaluación — pantallas y componentes (Fase 3)

> Fuente de verdad del comportamiento: las funciones `renderAdminSchemes`, `openSchemeEditor`,
> `renderSchemeEditor`, `renderModalCreatePaquete` y sus handlers en la maqueta. Adáptalas al scope
> de la Fase 3 según lo que sigue. **No se construye la pantalla de Resultados ni la certificación
> en sí (eso es Fase 4).**

### Terminología (Fase 3)
- **Esquema de evaluación** / **Esquemas de evaluación** (nunca "campaña").
- **Paquete** — un conjunto de ítems del catálogo asignado a 0..N responsables.
- **Ítem / ítems** — así se llaman las hojas del catálogo *dentro del contexto de esquemas* (p. ej.
  "un paquete con 5 ítems", "selecciona ítems", "N ítem(s) seleccionados"). Es el mismo término que
  usa la maqueta; **mantenlo**. Los nodos del árbol del picker siguen siendo Módulo → SubMódulo →
  (fila de caso de prueba mostrada por su nombre), pero los conteos y textos agregados dicen "ítems".
- **Ambiente** — con dos valores exactos: **"Pruebas"** y **"Producción"** (con tilde). El valor por
  defecto de un esquema nuevo es **"Pruebas"**.
- **Responsable(s)** — usuarios con rol USER (en el backend, `rol === 'CERTIFIER'`).

### Rutas (react-router, anidadas bajo `/admin`, igual patrón que Catálogo)
- `/admin/esquemas` → lista de esquemas (`AdminSchemes`).
- `/admin/esquemas/nuevo` → editor en **modo crear** (`AdminSchemeEditor`).
- `/admin/esquemas/:id` → editor en **modo editar** (mismo `AdminSchemeEditor`, gestiona un esquema
  ya guardado).

### Conexión a endpoints (Fase 3 — sin datos mock)
Todas las llamadas van con `Authorization: Bearer <token>` (`localStorage.getItem('token')`), contra
`http://localhost:3000`, siguiendo el patrón ya usado en `AdminCatalog.tsx` (axios directo).

| Acción en UI                                   | Endpoint                                   |
|------------------------------------------------|--------------------------------------------|
| Cargar lista de tarjetas                       | `GET /api/esquemas`                        |
| Abrir un esquema guardado (modo editar)        | `GET /api/esquemas/:id`                    |
| Crear esquema completo (con todos sus paquetes)| `POST /api/esquemas`                       |
| Editar datos generales (nombre / ambiente)     | `PATCH /api/esquemas/:id`                  |
| Eliminar esquema completo                      | `DELETE /api/esquemas/:id`                 |
| Agregar un paquete a un esquema ya guardado    | `POST /api/esquemas/:id/paquetes`          |
| Renombrar / reasignar responsables de paquete  | `PATCH /api/paquetes/:id`                  |
| Eliminar un paquete (libera sus ítems)         | `DELETE /api/paquetes/:id`                 |
| Árbol del catálogo (picker)                    | `GET /api/modulos` + `GET /api/modulos/:id`|
| Lista de responsables candidatos               | `GET /users` → filtrar `rol === 'CERTIFIER'` |

**Forma de las respuestas** (ya implementada en backend):
- `GET /api/esquemas` → `[{ id, nombre, ambiente, creadoEn, responsables:[{id,nombre,apellido}],
  _count:{ paquetes, items } }]`.
- `GET /api/esquemas/:id` (y las respuestas de crear/editar/borrar paquete devuelven este mismo
  objeto ya actualizado) → `{ id, nombre, ambiente, creadoEn, actualizadoEn, paquetes:[{ id, nombre,
  orden, itemIds:[...], items:[{ casoPruebaId, nombre, subModuloId }], userIds:[...],
  responsables:[{ id, nombre, apellido, cargo }] }] }`.

### Manejo de carga y error (idéntico patrón que Fase 2)
- Estados de `loading` por vista; deshabilita botones mientras una mutación está en vuelo.
- Al fallar un fetch/mutación, muestra el mensaje **que devuelve el backend** (NestJS), leído así —
  es el patrón ya usado en `AdminCatalog.tsx`, **no** el formato `{ error }` del prompt viejo:
  ```
  const msg = (Array.isArray(err.response?.data?.message)
      ? err.response.data.message[0]
      : err.response?.data?.message)
    || err.response?.data?.error
    || 'Mensaje genérico de respaldo';
  ```
  Errores inline (dentro de un modal) usan el mismo patrón visual `error-msg` de los modales de
  usuario/catálogo; errores de carga de pantalla usan toast.

---

### Pantalla A — Lista de esquemas (`/admin/esquemas`)
- `page-head`: título **"Esquemas de evaluación"** + `page-sub` "Un esquema agrupa lo que se va a
  certificar en un ambiente, organizado en 'paquetes' de ítems que le asignas a uno o más
  responsables."
- `toolbar` con botón primario a la derecha: **"+ Nuevo esquema"** → navega a `/admin/esquemas/nuevo`.
- **Estado vacío** (sin esquemas): `panel` con `empty-state`, ícono `ClipboardList` (32px, ver §4),
  título "Todavía no has creado ningún esquema" y subtítulo "Crea el primero para empezar a asignar
  certificaciones."
- **Grid de tarjetas** (`cards-grid`, `repeat(auto-fill, minmax(280px,1fr))`, gap 14px): una
  `mod-card` por esquema. Estructura interna (de arriba a abajo):
  1. Fila superior: a la izquierda el `mod-icon` de ambiente (badge 42×42, color por hash del id;
     ícono `FlaskConical` si ambiente="Pruebas", `Rocket` si "Producción"). A la derecha:
     el **semáforo** (`.semaphore`) + un `Badge` de ambiente (`color="cian"` para Pruebas,
     `color="magenta"` para Producción).
  2. `mod-card-title` = nombre del esquema.
  3. `mod-card-meta` = "`N` paquete(s) · `M` ítems · creado `{fecha}`", usando `_count.paquetes`,
     `_count.items` y `creadoEn` (formatea a `dd/mm/aaaa`, es-EC).
  4. Fila de **avatares** de responsables (distintos, ya vienen deduplicados en `responsables`):
     hasta 4 `avatar` (30px) con iniciales; si hay más, un `avatar` extra `+N` con fondo `--morado`.
  5. **Barra de progreso** (`progress-track` + `progress-fill`) y renglón "`0`/`M` ítems certificados".
- **Placeholder de Fase 4 (decisión tomada):** el semáforo y la barra de progreso se **mantienen
  como placeholder estático**, porque su data real (certificaciones) no existe hasta la Fase 4. Como
  `GET /api/esquemas` **no** devuelve progreso, renderízalos así, sin cablearlos a ninguna data:
  - Progreso: `done = 0`, `total = _count.items`, `pct = 0` → barra en 0% (color cian).
  - Semáforo: estado **amarillo** ("En progreso") encendido (equivale a `readiness(0,0)` de la
    maqueta). No calcules nada; es puramente visual y provisional.
- **Clic en el cuerpo de la tarjeta: NO navega a Resultados** (esa pantalla es Fase 4). Regla 15:
  el cuerpo de la tarjeta queda inerte → usa `cursor: default` (no `pointer`) y sin `onClick` de
  navegación a resultados.
- **Acciones de la tarjeta** (así es como se llega a editar/eliminar, decisión "gestión completa"):
  dos `icon-btn` que aparecen al hover (mismo patrón que las filas del catálogo), ubicados en la
  esquina — **Editar** (`Pencil`) → navega a `/admin/esquemas/:id` (modo editar); **Eliminar**
  (`Trash2`) → abre confirmación y, al aceptar, `DELETE /api/esquemas/:id`, luego refresca la lista
  y muestra toast. El texto de confirmación debe aclarar que se eliminan también **todos sus
  paquetes** y se liberan sus ítems (cascada).

---

### Pantalla B — Editor de esquema (`/admin/esquemas/nuevo` y `/admin/esquemas/:id`)

Un mismo componente con dos modos. La diferencia clave es **cuándo se persiste**:

- **Modo crear** (`/nuevo`): se arma un **borrador en memoria** (`{ nombre, ambiente, paquetes:[
  { nombre, itemIds, userIds } ] }`). Nada toca el backend hasta pulsar **"Crear esquema"**, que hace
  un **único** `POST /api/esquemas` con todos los paquetes. El "mapa de ítems tomados" (`taken`) se
  calcula de la unión de `itemIds` de los paquetes del borrador.
- **Modo editar** (`/:id`): al entrar hace `GET /api/esquemas/:id` y trabaja **server-driven**. Cada
  operación de paquete (crear/renombrar/eliminar) llama a su endpoint y el backend **responde con el
  detalle completo del esquema ya actualizado** → reemplaza el estado local con esa respuesta (no
  mantengas borrador). El `taken` sale de los `itemIds` de los paquetes ya persistidos. Editar los
  datos generales usa `PATCH /api/esquemas/:id`.

**Layout (idéntico en ambos modos):**
- `breadcrumbs`: "Esquemas de evaluación / {Nuevo esquema | nombre del esquema}".
- `page-head`: título ("Nuevo esquema de evaluación" o "Editar esquema") + `page-sub`.
- **Panel de datos generales** (`panel`, `max-width:760px`): un `grid-2` con
  - `field` **Nombre del esquema** (input; placeholder "Ej. Certificación HeadOffice — Pruebas").
    Si se deja vacío, el backend aplica el default "Esquema sin nombre" (no lo fuerces en el front).
  - `field` **Ambiente** (`Select` con dos opciones: "Pruebas" (default) y "Producción").
  - `hint` debajo: "Si necesitas certificar los mismos módulos en pruebas y en producción, crea dos
    esquemas — uno por ambiente."
  - En **modo editar**, un cambio en estos campos se guarda con `PATCH /api/esquemas/:id` (al blur o
    con un botón "Guardar datos generales" — elige uno y sé consistente; recomendado: guardar al
    confirmar con botón, mostrando toast).
- **Grid de dos paneles** (`grid-2`, `align-items:start`):
  - **Panel izquierdo — "1. Elige los ítems a certificar"**: el `picker-tree` (ver detalle abajo) +,
    cuando hay selección, la barra de resumen de selección.
  - **Panel derecho — "2. Paquetes y responsables"**: la lista de `paquete-card` (o su empty-state).
- **Pie** (`modal-foot` sin borde): botón `ghost` **"Cancelar"** (vuelve a `/admin/esquemas`) +
  botón primario. En modo crear el primario es **"Crear esquema"**; en modo editar no hay "crear"
  global (los paquetes ya se persisten individualmente) — el primario puede ser **"Listo"** que
  vuelve a la lista.

**Validaciones antes de `POST /api/esquemas` (modo crear):** debe haber **≥1 paquete**; si no,
avisar "Crea al menos un paquete de ítems antes de guardar el esquema." (regla 5). El backend
re-valida todo (ítems repetidos, ítems inexistentes, responsables no-CERTIFIER, paquete sin ítems),
así que ante un 400 muestra el `message` del servidor.

#### Picker del catálogo (`picker-tree`) — panel izquierdo
Árbol colapsable de 3 niveles. **Carga perezosa:** al abrir el editor haz `GET /api/modulos` (trae
módulos con conteos, sin ítems); la primera vez que un módulo se **expande** — o que se usa su
"Asignar módulo completo" o su checkbox de módulo — haz `GET /api/modulos/:id` para traer sus
submódulos e ítems y **cachea** ese resultado en estado local. (Los módulos arrancan colapsados.)

- **`picker-mod-head`** (fila de módulo): caret (`ChevronRight`/`ChevronDown`) + checkbox de módulo +
  ícono del módulo (mapa §4) + nombre + botón texto **"⚡ Asignar módulo completo"** (`quick-assign`,
  ícono `Zap`, alineado a la derecha).
- **`picker-sub-head`** (fila de submódulo, indentada): checkbox de submódulo + nombre + botón texto
  **"⚡ Asignar sección"** (`quick-assign`).
- **`picker-item-row`** (fila de ítem, más indentada): checkbox de ítem + nombre del caso de prueba.
  Si el ítem ya está **tomado** por otro paquete de **este** esquema: fila con clase `taken`
  (`opacity:.55`), checkbox **deshabilitado**, y a la derecha `picker-item-taken-tag` "en: {nombre
  del paquete}".
- **Los tres caminos de selección** (todos terminan en un set de `itemIds` en staging):
  a) **Ítem suelto**: marcar/desmarcar su checkbox (se puede combinar ítems de distintos módulos y
     submódulos en un mismo paquete).
  b) **"Asignar sección"**: selecciona automáticamente todos los ítems **disponibles** (no tomados)
     de ese submódulo y abre de una vez el modal de crear paquete con el **nombre del submódulo**
     pre-llenado (editable).
  c) **"Asignar módulo completo"**: igual pero con todos los ítems disponibles del módulo entero y el
     **nombre del módulo** pre-llenado (editable).
  - Los checkboxes de módulo/submódulo son "seleccionar todos los disponibles": marcan/desmarcan solo
    los ítems no tomados; si no hay ninguno disponible, el checkbox va deshabilitado.
- **Barra de resumen de selección** (aparece solo si hay ≥1 ítem en staging): fondo `--cian-bg`,
  radius-s, texto "`N` ítem(s) seleccionados" (color `#0090C7`, bold) + botón primario `btn-sm`
  **"Crear paquete con esto →"** que abre el modal de crear paquete (sin nombre pre-llenado).

#### Lista de paquetes (`paquete-card`) — panel derecho
- **Empty-state** (sin paquetes): `empty-state` con ícono `Package` (32px), título "Todavía no hay
  paquetes" y subtítulo "Selecciona ítems a la izquierda y arma tu primer paquete."
- Cada **`paquete-card`**:
  - `paquete-card-top`: `paquete-name` (nombre del paquete) a la izquierda; a la derecha dos
    `icon-btn` — **Editar** (`Pencil`, "Renombrar / reasignar") y **Eliminar** (`Trash2`).
  - `paquete-meta`: "`N` ítem(s)" (usa `itemIds.length`).
  - `paquete-users`: un `tag tag-neutral` por responsable con "Nombre Apellido"; si el paquete no
    tiene responsables, un único `tag tag-naranja` **"Sin responsable asignado"**.
- **Eliminar paquete**: confirmación → en modo editar `DELETE /api/paquetes/:id` (el backend
  responde con el esquema actualizado; refresca estado). En modo crear, simplemente quita el paquete
  del borrador. En ambos casos, **sus ítems vuelven a quedar disponibles** en el picker (regla 9).

#### Modal Crear / Editar paquete (`renderModalCreatePaquete`)
Reutiliza el componente `Modal`. Título "Nuevo paquete" (crear) o "Editar paquete" (editar).
- `field` **Nombre del paquete** (input, requerido; placeholder "Ej. HeadOffice — Box Office"). En
  quick-assign viene pre-llenado con el nombre del módulo/submódulo, pero **es editable**.
- Solo en **crear**: `hint` "`N` ítem(s) seleccionados se incluirán en este paquete."
- `field` **Responsable(s)**: `<select multiple>` (o multiselección equivalente, `min-height:120px`)
  con los usuarios `rol === 'CERTIFIER'` (de `GET /users`), mostrando "Nombre Apellido — cargo".
  `hint` "Ctrl/Cmd + clic para elegir varios." **Se permite no elegir a nadie** (paquete sin
  responsable, regla 2).
- Footer: `ghost` "Cancelar" + primario "Crear paquete" / "Guardar cambios".
- **Guardar (crear paquete):**
  - Nombre vacío → toast "Ponle un nombre al paquete", no cierra.
  - Modo crear (borrador): agrega `{ id local, nombre, userIds, itemIds:[...staging] }` al borrador y
    limpia el staging.
  - Modo editar (esquema ya guardado): `POST /api/esquemas/:id/paquetes` con `{ nombre, itemIds,
    userIds }`; reemplaza el estado con el esquema devuelto; limpia staging.
- **Guardar (editar paquete):** **solo** cambia nombre y responsables — **nunca** los ítems
  (regla 8; el picker no aparece en este modal). Modo editar → `PATCH /api/paquetes/:id` con
  `{ nombre, userIds }`. Modo crear → actualiza el paquete en el borrador.

---

---

## 6quater. Resultados — pantallas y componentes (Fase 4) — ⛔ DEROGADA

> **⛔ ESTA SECCIÓN YA NO SE IMPLEMENTA.** Describe Resultados con 7 pestañas (`global`, `campana`,
> `persona`, `modulo`, `comparar`, `fallas`, `ok`) y con el semáforo `readiness(pct, fail)` basado en
> completitud. Ambas decisiones fueron **revertidas**.
>
> La especificación vigente de la Fase 4 vive en **`Design System.md` en la raíz del proyecto**:
> una sola vista, esquemas aislados, drill-down Esquema → Módulo → SubMódulo → tabla de casos, y
> semáforo basado en **calidad** (`ok/(ok+fail)`: rojo 0–69 %, amarillo 70–89 %, verde 90–100 %).
>
> Se conserva aquí solo como referencia histórica. **No la uses para implementar.**

> Fuente de verdad del comportamiento: las funciones `renderAdminResults`, `renderResultsCampana`,
> `renderResultsPersona`, `renderResultsModuloCross`, `renderResultsComparar`,
> `renderResultsFlatList`, `readiness()` y `allFlatEntries()` en la maqueta HTML. Adáptalas al
> scope de la Fase 4 según lo que sigue.

### Alcance de la Fase 4 (admin-only)
- **Se construye:** la pantalla `admin-results` completa (con sus 7 pestañas de filtro), incluida
  la lectura de `ResultadoItem` desde el backend, el cálculo real del semáforo/progreso a nivel
  esquema y paquete, y la descarga de reportes ejecutivos.
- **NO se construye en esta fase:** la UI del certificador (`user-results`, `renderSubmit`,
  botones de OK/Falla, autoguardado, envío, reaperturas). Esas pantallas viven en Fase 5. Pero **sí
  se crea el modelo `ResultadoItem` en el backend** (schema + migración), porque Resultados lo lee
  para poblar todas sus vistas. Sin ese modelo, la pantalla se queda en el estado vacío para siempre.

### Modelo de datos que Resultados consume
- Ver `schema.prisma` — modelo **`ResultadoItem`** (creado como parte de esta fase, ver §6quater
  final). Campos que la UI necesita leer: `estado` (`"pendiente" | "aprobado" | "rechazado"`),
  `evidencia`, `comentario`, `certificadoPor` (con `nombre`, `apellido`), `certificadoEn`. La
  relación 1:1 con `PaqueteItem` permite obtener automáticamente `esquemaId`, `paqueteId` y
  `casoPruebaId` sin duplicar columnas — cuando pintes un ítem en cualquier tabla o card, resuelve
  el nombre del caso de prueba y su ruta `Módulo › SubMódulo` navegando esa relación.
- Semántica de `estado`: `"aprobado"` = "ok / funciona bien" (verde en la maqueta),
  `"rechazado"` = "fail / con falla" (rojo en la maqueta), `"pendiente"` = todavía no lo revisó
  nadie o el certificador guardó progreso sin marcar. Un ítem del esquema sin fila en
  `ResultadoItem` cuenta también como pendiente. **Los conteos "certificado" y "sin certificar"
  suman aprobado + rechazado = certificado; pendiente = sin certificar.**

### Terminología (Fase 4)
- **Resultado** — nombre de la sección y de la pantalla principal (`admin-results`).
- **Certificar / ítem certificado** — un `ResultadoItem` cuyo `estado` es `"aprobado"` o
  `"rechazado"` (lo contrario a `"pendiente"`).
- **Ítem "que funciona bien" / "OK"** — `estado === "aprobado"`. En texto de UI di **"funciona
  bien"**, no "OK" ni "PASS".
- **Ítem "con falla" / "falla"** — `estado === "rechazado"`. Nunca "reprobado".
- **Avance / progreso** — el `pct` calculado como `(aprobados + rechazados) / total * 100`,
  redondeado a entero. Un esquema con 0 ítems muestra `0%`.
- **Semáforo del esquema** — resultado de `readiness(pct, fail)` (ver más abajo).

### Rutas (react-router, anidadas bajo `/admin`)
- `/admin/resultados` → pantalla principal con pestañas (`AdminResults`). Al entrar se carga la
  pestaña por defecto **"Vista global"**.
- `/admin/resultados/esquema/:esquemaId` → **atajo** para llegar directo al detalle de un esquema
  (pestaña "Por campaña" con el esquema pre-seleccionado). Este es el destino del clic en el
  cuerpo de la tarjeta de esquema (regla que **cambia** respecto a Fase 3, ver invariantes abajo).

### Conexión a endpoints (Fase 4)
Todas las llamadas van con `Authorization: Bearer <token>`, contra `http://localhost:3000`,
siguiendo el patrón ya usado en `AdminSchemes.tsx` (axios directo). El backend nuevo a construir:

| Acción en UI                                                    | Endpoint sugerido                                    |
|-----------------------------------------------------------------|------------------------------------------------------|
| Vista global — stat cards + card por esquema                    | `GET /api/resultados/overview`                       |
| Detalle de un esquema (por campaña, por persona, por módulo)    | `GET /api/resultados/esquemas/:esquemaId`            |
| Detalle de un paquete (lista de ítems con su estado)            | `GET /api/resultados/paquetes/:paqueteId`            |
| Lista plana de ítems por estado (fallas / funcionales)          | `GET /api/resultados/items?estado=rechazado`         |
| Cruce por módulo entre todos los esquemas                       | `GET /api/resultados/por-modulo`                     |
| Comparar Pruebas vs. Producción                                 | `GET /api/resultados/comparar-ambientes`             |
| Descargar reporte ejecutivo (PDF/CSV)                           | `GET /api/resultados/reporte-ejecutivo` (Fase 4.1)   |

**Nota:** los nombres exactos y la forma de la respuesta los define el prompt de backend de Fase 4;
la UI se acopla a esos contratos. El principio es: **cada pantalla pide su vista ya agregada; la UI
no calcula agregaciones sobre listas grandes de ítems crudos.**

### Función `readiness(pct, fail)` — semáforo del esquema
Tomada tal cual de la maqueta (línea ~471 del HTML):

```
if (fail > 0)    → 🔴 rojo    label "Con fallas por resolver"
if (pct === 100) → 🟢 verde   label "Listo para producción"
else             → 🟡 amarillo label "En progreso"
```

- **Prioridad del rojo:** un esquema al 100% con al menos un ítem rechazado sigue en rojo — no se
  pinta verde hasta que ese ítem se resuelva (se reabra y se apruebe).
- **Uso:** el resultado alimenta la clase del `semaphore-light` (`light-red/yellow/green .active`)
  y el `title` del componente `<Semaphore/>`. No inventes un cuarto estado.

### Manejo de carga y error
- Estados de `loading` por pestaña; deshabilita el botón de "Reporte ejecutivo" mientras esté en
  vuelo.
- Empty-state global sigue diciendo: **"Todavía no hay nada que mostrar. Crea un esquema de
  evaluación y asigna responsables para empezar a ver resultados aquí."** (aplica cuando
  `GET /api/esquemas` regresa vacío). Cuando hay esquemas pero ningún `ResultadoItem` todavía, la
  vista global renderiza los `stat-card` en 0 y los `progress-card` de cada esquema en 0% amarillo
  — nunca error.
- Errores del backend leídos con el patrón habitual (`response.data.message` array→[0] →
  `response.data.error` → fallback), toast.

---

### Componentes nuevos de Fase 4

#### `stat-card` (KPI simple)
Tarjeta pequeña con un número grande arriba y un label debajo. Se usa en la fila superior de la
vista global (4 tarjetas: Avance global, Bien, Fallas, Pendientes). Especificaciones:
- Fondo `--card`, borde `--border`, `radius-l`, padding `18px`, `shadow-sm`.
- Número: `28-32px`, `font-weight:700`. Color por defecto `--navy`, pero:
  - "Bien" en `--teal` (verde institucional del sistema).
  - "Fallas" en `--rojo`.
  - "Pendientes" en `--grayLight`.
- Label debajo: `12px`, `--grayLight`, sin transform.
- Grid contenedor: `repeat(4, 1fr)` en desktop; en mobile colapsa a 2 columnas.

#### `progress-card` (tarjeta de progreso por esquema/paquete/persona)
Es el **componente central de Resultados**. Se compone así:
- Contenedor: `.progress-card`, fondo `--card`, borde `--border`, `radius-l`, padding `18px`,
  `shadow-sm`, transición `all .15s ease`. Al hover eleva `translateY(-1px)` y borde `--cian` (si
  la card es clickeable — es decir, si abre un detalle).
- Modificadores:
  - `.is-ready` (progreso 100% y sin fallas) → borde `--teal`, badge de "Listo" en la esquina.
  - `.has-fail` (al menos 1 falla) → borde `--rojo` suave (`rgba(229,57,53,0.35)`).
- Estructura interna (siempre igual):
  1. **`progress-card-top`** — fila con dos bloques:
     - Izquierda: `progress-card-title` (nombre, `14.5px` bold, `--navy`) + opcional
       `progress-card-meta` (`11.5px`, `--grayLight`).
     - Derecha: `<Semaphore/>` cableado a `readiness(pct, fail)` + `progress-card-pct` (número
       grande a la derecha, ej. "78%", `18px` bold, color según semáforo).
  2. **`.progress-track` + `.progress-fill`** — barra de progreso (ya existe en `index.css`); el
     fill va cian por defecto, y `pf-teal` cuando `pct === 100 && fail === 0`.
  3. **`progress-card-chips`** — fila de dos tags al pie:
     - `<span class="tag tag-teal">{ok} bien</span>` — siempre visible.
     - `<span class="tag {fail>0?'tag-rojo':'tag-neutral'}">{fail} con fallas</span>` — cuando
       `fail>0` va con ícono `AlertTriangle` de 12px antes del número.

**Regla:** cuando la tarjeta represente algo navegable (un esquema entero, un paquete, una
persona), envuélvela en el patrón `group relative` de §6 y agrega la flecha `ChevronRight` en
`opacity-0 group-hover:opacity-100` en la esquina derecha superior. Si no es navegable (una
tarjeta de resumen agregado, ej. "cruce por módulo"), no le pongas `group`.

#### `filter-tabs` (barra de pestañas)
Fila horizontal de botones tipo pill que cambian la vista dentro de Resultados (Vista global,
Por campaña, Por persona, Por módulo, Pruebas vs. Producción, Ítems con falla, Ítems funcionales).
- Contenedor: `flex gap-2`, `flex-wrap: wrap`, `margin-bottom: 20px`.
- `filter-tab`: padding `7px 14px`, `border-radius: 20px`, borde `1px solid --border`, fondo
  `--card`, texto `12.5px` bold `--gray`. Hover: fondo `--bg`.
- `filter-tab.active`: fondo `--cian`, texto blanco, sin borde (borde `1px solid --cian` para
  mantener la geometría). Sin animación de subrayado; el cambio es solo de fondo/color.
- **7 pestañas exactas** (mismos ids que la maqueta):
  `global` · `campana` · `persona` · `modulo` · `comparar` · `fallas` · `ok`.
- El estado activo se guarda en la URL como query param (`?tab=fallas`) para que la pestaña
  sobreviva a un F5 y sea compartible.

---

### Pantalla A — Vista global (`/admin/resultados?tab=global`, default)
- `page-head`: título **"Resultados"** + `page-sub` "Navega libremente: por campaña, por persona,
  por módulo, comparando pruebas contra producción, o directo a los ítems con falla para dar
  seguimiento."
- Debajo, los `filter-tabs` (siempre visibles en todas las pestañas de esta pantalla).
- **Empty-state** (sin esquemas): `panel` con `empty-state`, ícono `BarChart3` 32px, título
  "Todavía no hay nada que mostrar" y subtítulo "Crea un esquema de evaluación y asigna
  responsables para empezar a ver resultados aquí." Con botón secundario "Ir a Esquemas" que
  navega a `/admin/esquemas` (nuevo, útil para ahorrar clics).
- **Con esquemas:**
  1. Fila superior de 4 `stat-card`: **Avance global (%)**, **Ítems que funcionan bien**,
     **Ítems con fallas**, **Ítems pendientes**.
  2. `toolbar`: a la izquierda label `"Por esquema de evaluación"` (13px bold, `--navy`); a la
     derecha botón `btn-outline btn-sm` **"Reporte ejecutivo"** (ícono `FileText` 14px). Al pulsar,
     descarga el PDF/CSV vía `GET /api/resultados/reporte-ejecutivo` con `Authorization` header
     (usa `fetch` + `blob` + `URL.createObjectURL`, NO ventana nueva sin token).
  3. `search-wrap`: input de búsqueda "Buscar esquema..." (filtro cliente-side sobre `nombre`).
  4. **Grid de `progress-card`** (`repeat(auto-fill, minmax(280px, 1fr))`, gap 14px), una por
     esquema. Título: "`{icono ambiente}` {nombre}" (usa `FlaskConical` o `Rocket` inline 14px
     como parte del título, con color por hash como en Fase 3). Meta: "`{ambiente}` · `N` paquetes".
     Clic en el body → navega a `/admin/resultados/esquema/:id` (pestaña "Por campaña" con ese
     esquema abierto).

### Pantalla B — Por campaña (`?tab=campana`)
Vista de "un esquema a la vez". Al llegar sin `esquemaId` en URL, muestra un selector de esquema
(`Select` estilo Fase 3, con nombre + badge de ambiente) arriba, y debajo el detalle. Con
`esquemaId`, esa selección está pre-fijada.

- **Encabezado del esquema:** breadcrumbs `Resultados / {nombre del esquema}`, luego una fila con
  `mod-icon` de ambiente + nombre + badge ambiente + semáforo + botón `btn-outline btn-sm`
  **"Generar certificado"** (`Award` 14px) — este último abre el modal de certificado (Fase 4.1;
  en 4.0 basta con dejar el botón deshabilitado o un tooltip "Disponible próximamente").
- **`progress-card` grande del esquema** (mismo componente, sin `group`): título "Progreso general
  del esquema", meta "`M` ítems en total · `N` responsables asignados".
- Luego una fila **"Por paquete"**: grid de `progress-card` (una por paquete). Título = nombre del
  paquete, meta = "Responsables: {lista de tags}". Clic → drill-down a la lista de ítems de ese
  paquete (Pantalla C).
- **Sección "Auditoría"** (colapsable, cerrada por defecto): tabla con las últimas 20 acciones
  (`certificadoPor`, `estado`, `casoPrueba.nombre`, `certificadoEn` formateado es-EC). Fuente:
  `GET /api/resultados/esquemas/:id/auditoria` (endpoint nuevo de esta fase).

### Pantalla C — Detalle de un paquete (drill-down desde Por campaña)
No es una pestaña propia; se abre "in-place" reemplazando el grid de paquetes por una tabla plana.
Breadcrumbs añaden un nivel: `Resultados / {esquema} / {paquete}`.
- `progress-card` compacta arriba con el semáforo/progreso del paquete.
- Tabla de ítems (`panel` con `<table>`): columnas **Caso de prueba** | **Ubicación** (Módulo ›
  SubMódulo) | **Estado** (tag verde/rojo/gris según `aprobado/rechazado/pendiente`) |
  **Certificado por** (avatar + nombre) | **Fecha**. Al pasar el mouse sobre una fila con
  `evidencia` o `comentario`, mostrar un ícono `Info` (14px) a la derecha; clic en él abre un
  popover con el contenido (no un modal — es solo lectura).
- Botón `btn-outline btn-sm` **"Descargar resultado"** (`Download` 14px) en la toolbar → descarga
  el CSV con esas columnas.

### Pantalla D — Por persona (`?tab=persona`)
- Selector de persona arriba (con avatar + nombre; solo CERTIFIER con al menos un paquete
  asignado en cualquier esquema). Sin selección, muestra grid de `progress-card` por persona con
  su avance agregado a través de todos sus paquetes en todos los esquemas.
- Con persona seleccionada: encabezado con avatar 44px + nombre + cargo, `progress-card` grande de
  su avance total, y debajo un grid de `progress-card` por cada esquema donde tiene paquetes
  asignados. Clic en la card → mismo detalle de la Pantalla C, pero filtrado a los paquetes de
  esa persona en ese esquema.

### Pantalla E — Por módulo (`?tab=modulo`)
- Grid de `progress-card` **sin `group`** (no navegables), una por módulo del catálogo. Cada card
  muestra la agregación de ítems de ese módulo **a través de todos los esquemas** donde aparece.
  Título = nombre del módulo (con su ícono de la §4), meta = "En `K` esquemas · `M` ítems totales".
- Cuando un módulo tiene fallas (`fail > 0`), la card muestra la lista expandible de esquemas
  donde ese módulo tiene fallas.

### Pantalla F — Pruebas vs. Producción (`?tab=comparar`)
- Layout de dos columnas iguales (`grid-cols-2 gap-4`). Título de cada columna: "🧪 Pruebas" /
  "🚀 Producción" (usando `FlaskConical`/`Rocket` 16px inline). Debajo, en cada columna, un
  `stat-card` grande con el avance global de ese ambiente, y grid de `progress-card` por esquema
  de ese ambiente. Sin cruce entre columnas — es una vista "espejo" para comparar visualmente.

### Pantalla G — Ítems con falla / Ítems funcionales (`?tab=fallas` / `?tab=ok`)
- Ambas pestañas usan el mismo componente **`ResultsFlatList`**, con distinto filtro de `estado`.
- `page-sub` cambia según el filtro: "Ítems marcados como con falla en cualquier esquema" (fallas)
  o "Ítems marcados como funcionales" (ok).
- `search-wrap` filtra por nombre del ítem, nombre del esquema, o nombre de la persona que
  certificó.
- Tabla plana con las mismas columnas que la Pantalla C, más una columna **Esquema** al inicio
  (para saber de qué esquema viene esa fila).
- Empty state: "No se encontraron ítems con falla — todo lo certificado hasta ahora funciona
  bien." (fallas) o "Todavía no hay ítems marcados como funcionales." (ok).

---

### Invariantes específicas de la Fase 4 (Resultados) — reemplazan a las de §6ter donde aplique
- El **semáforo** y la **barra de progreso** de las tarjetas de esquema (Pantalla A de Fase 3)
  **ya NO son placeholder estático**; **se cablean a `readiness(pct, fail)` y al `pct` real**
  computado desde `ResultadoItem`. El endpoint `GET /api/esquemas` de Fase 3 debe extenderse en el
  backend para incluir `pct`, `done`, `ok`, `fail`, o Resultados debe llamar `GET /api/resultados/overview`
  y merge en el cliente — elige el patrón acorde al prompt de backend.
- El **clic en el cuerpo de la tarjeta de esquema** (Pantalla A de Fase 3) **ahora SÍ navega**
  a `/admin/resultados/esquema/:id`. Cambia el `cursor: default` por `cursor: pointer` en
  `mod-card` y añade `onClick` de navegación. Las acciones Editar/Eliminar de la Fase 3 siguen
  funcionando exactamente igual — el `stopPropagation` en sus botones evita que el clic burbujee al
  contenedor.
- **Se lee, no se escribe.** Resultados es puramente de lectura en Fase 4 — no marca ítems, no
  aprueba, no rechaza, no comenta. Toda la escritura vive en la UI del certificador (Fase 5). Por
  eso el modelo `ResultadoItem` puede estar vacío durante toda esta fase: la UI debe funcionar
  igual (mostrar 0%, amarillo, empty-states) sin romperse.
- **Reaperturas y solicitudes** siguen deshabilitadas (Fase 5). El botón "Solicitar reapertura"
  del detalle por persona/esquema se muestra con tooltip "Disponible próximamente" — no lo escondas.
- **Nada de datos mock:** cada pantalla consume su endpoint real, con `Authorization: Bearer`.
- **URLs compartibles:** la pestaña activa y (cuando aplique) el `esquemaId`/`personaId`
  seleccionado se persisten en la URL como path o query param, para que un enlace copiado abra
  exactamente la misma vista.

### Modelo `ResultadoItem` (esquema de referencia — creado en el backend en esta fase)
Ver `apps/backend/prisma/schema.prisma`, sección "FASE 4". Campos que el frontend consume:

| Campo             | Tipo             | Uso en UI                                                  |
|-------------------|------------------|------------------------------------------------------------|
| `paqueteItem`     | 1:1 a `PaqueteItem` | Da el `casoPrueba` (nombre + ruta) y el `paquete/esquema` |
| `estado`          | String           | `"aprobado"` (verde) · `"rechazado"` (rojo) · `"pendiente"` (gris) |
| `evidencia`       | String? (Text)   | Popover en detalle de paquete (Pantalla C)                |
| `comentario`      | String? (Text)   | Popover en detalle de paquete + tabla de fallas           |
| `certificadoPor`  | Nullable → User  | Columna "Certificado por" en tablas                       |
| `certificadoEn`   | DateTime?        | Columna "Fecha" formateada `dd/mm/aaaa hh:mm` es-EC       |
| `creadoEn` / `actualizadoEn` | DateTime | Auditoría (Pantalla B, sección colapsable)          |

---

- El flujo de pantallas y su orden (landing → login → cambio de clave obligatorio → panel admin /
  home de certificador; y dentro del panel admin: lista de módulos → detalle de módulo → panel de
  submódulo con sus casos de prueba).
- La organización interna de cada pantalla (qué elemento va arriba, al lado de qué, estructura de
  grid/flex tal como está descrita arriba, incluyendo la sección 6bis del Catálogo).
- La paleta de colores de la sección 1 — cero colores nuevos.
- Los textos y labels existentes, **excepto** los renombrados explícitamente para esta fase:
  "Sección" → **"SubMódulo"**, "+ Ítem" → **"+ Caso de Prueba"**, "Eliminar sección" →
  **"Eliminar submódulo"**. No renombres nada más por tu cuenta.

### Invariantes específicas de la Fase 3 (Esquemas)
- **No se construye la sección de Resultados ni la certificación en sí** (marcar OK/Falla,
  comentarios, evidencia, envío, reaperturas, auditoría). Eso es Fase 4. El clic en el **cuerpo** de
  una tarjeta de esquema **no debe navegar a Resultados** (queda inerte, regla 15).
- El **semáforo** y la **barra de progreso** de la tarjeta son **placeholder visual estático** (0% /
  amarillo). No los conectes a ninguna data ni inventes un cálculo de progreso — no existe hasta
  Fase 4.
- **Al editar un paquete ya creado NO se pueden cambiar sus ítems**, solo su nombre y responsables
  (regla 8). Para cambiar ítems: eliminar el paquete y crear uno nuevo.
- **Un ítem no puede estar en dos paquetes del mismo esquema**; en el picker los ítems ya tomados se
  muestran deshabilitados con la etiqueta "en: {paquete}". Entre esquemas distintos sí puede
  repetirse — no bloquees eso.
- Un esquema requiere **≥1 paquete** para guardarse; un paquete requiere **≥1 ítem**. El nombre del
  paquete es obligatorio; el del esquema no (default "Esquema sin nombre" lo pone el backend).
- **Nada de datos mock:** cada pantalla consume su endpoint real de la tabla de §6ter.

## 8. Lo que SÍ se puede mejorar

- Reemplazar los íconos-emoji de la maqueta por íconos SVG reales (ej. `lucide-react`), respetando
  tamaños y contenedores de la sección 4.
- Micro-interacciones y estados de hover/focus/loading, respetando duraciones de la sección 3.
- Accesibilidad (contraste AA, aria-labels, foco por teclado) sin tocar la paleta.
- Tipografía: se puede usar `Inter` en vez del stack Arial/Helvetica si mejora la legibilidad,
  manteniendo los tamaños en px de la tabla de la sección 2.

---

## 9. Checklist final — Fase 2 (Catálogo)

- [ ] ¿Ningún ícono es un emoji? (sidebar, mod-icon, item-row, botones — todos SVG con `size={}`)
- [ ] ¿El sidebar tiene exactamente 2 ítems habilitados (Usuarios, Catálogo) y el resto deshabilitado?
- [ ] ¿La UI dice "SubMódulo" y "+ Caso de Prueba" en vez de "Sección" / "+ Ítem"?
- [ ] ¿Existe el botón "+ Clasificador" dentro del panel de cada submódulo?
- [ ] ¿Los casos de prueba sin clasificador se muestran sueltos, y los que sí tienen se agrupan bajo
      su clasificador, sin romper el layout cuando un submódulo no tiene ninguno?
- [ ] ¿El modal de eliminar clasificador aclara que los casos de prueba no se borran?
- [ ] ¿Todos los colores/radios/sombras siguen siendo los de las secciones 1 y 3 (ningún valor nuevo)?

---

## 9bis. Checklist final — Fase 3 (Esquemas de evaluación)

- [ ] ¿El sidebar tiene **3 ítems habilitados** (Usuarios, Catálogo, Esquemas de evaluación) y solo
      Resultados/Solicitudes deshabilitados? ¿"Esquemas de evaluación" es un `NavLink` a
      `/admin/esquemas` con estado activo cian?
- [ ] ¿Ningún ícono es un emoji? (ambiente `FlaskConical`/`Rocket`, `Zap` en quick-assign, carets
      `ChevronRight`/`ChevronDown`, `Pencil`/`Trash2`, empty-states `ClipboardList`/`Package`) —
      todos `lucide-react` con `size={}` según §4.
- [ ] ¿La lista carga de `GET /api/esquemas` y la tarjeta muestra ambiente, nombre,
      "N paquetes · M ítems · creado {fecha}" y avatares de responsables (con "+N" si >4)?
- [ ] ¿El semáforo y la barra de progreso están como **placeholder estático** (amarillo / 0%), sin
      cablearse a data, y el **clic en el cuerpo de la tarjeta NO navega a Resultados**?
- [ ] ¿Las tarjetas tienen acción **Editar** (→ `/admin/esquemas/:id`) y **Eliminar**
      (`DELETE /api/esquemas/:id` con confirmación de cascada)?
- [ ] ¿El editor arma un **borrador en memoria** en modo crear y hace **un solo** `POST /api/esquemas`
      con todos los paquetes al pulsar "Crear esquema"?
- [ ] ¿El editor en modo editar es **server-driven** (cada crear/renombrar/eliminar paquete pega a su
      endpoint y reemplaza el estado con el esquema devuelto)?
- [ ] ¿El picker del catálogo carga **perezosamente** por módulo (`GET /api/modulos` + `:id`) y marca
      los ítems ya tomados como deshabilitados con "en: {paquete}"?
- [ ] ¿Funcionan los **tres caminos de selección** (ítem suelto, "Asignar sección", "Asignar módulo
      completo"), con nombre de paquete pre-llenado y editable en los dos quick-assign?
- [ ] ¿El modal de paquete permite **0 responsables** ("Sin responsable asignado") y al **editar** un
      paquete NO muestra el picker de ítems (solo nombre + responsables, regla 8)?
- [ ] ¿Eliminar un paquete libera sus ítems (vuelven a estar disponibles en el picker)?
- [ ] ¿Los errores se leen del backend con el patrón `response.data.message` (array→[0]) → `.error` →
      fallback, sin inventar textos, y sin usar datos mock en ninguna pantalla?
- [ ] ¿Todos los colores/radios/sombras siguen siendo los de las secciones 1 y 3 (ningún valor nuevo)?

---

## 9ter. Checklist final — Fase 4 (Resultados) — ⛔ DEROGADO

> **⛔ Usa el checklist §14 de `Design System.md` en la raíz del proyecto.** Este quedó obsoleto junto
> con la §6quater.

- [ ] ¿El sidebar tiene **4 ítems habilitados** (Usuarios, Catálogo, Esquemas, Resultados) y solo
      Solicitudes deshabilitado? ¿"Resultados" es un `NavLink` a `/admin/resultados` con estado
      activo cian y el ícono `BarChart3` 18px?
- [ ] ¿Existe el modelo `ResultadoItem` en `schema.prisma`, con `paqueteItemId @unique`, `estado`
      (default `"pendiente"`), `evidencia`, `comentario`, `certificadoPorId` y `certificadoEn`?
      ¿La migración corrió sin errores (`npx prisma migrate dev --name phase4_resultados`)?
- [ ] ¿La pantalla principal `AdminResults` renderiza los **7 tabs** exactos (`global`, `campana`,
      `persona`, `modulo`, `comparar`, `fallas`, `ok`) y la pestaña activa se guarda en la URL como
      query param (`?tab=...`)?
- [ ] ¿Los `stat-card` de la Vista global muestran Avance global, Bien, Fallas, Pendientes con los
      colores correctos (`--navy`, `--teal`, `--rojo`, `--grayLight`)?
- [ ] ¿La función `readiness(pct, fail)` funciona exactamente como la maqueta? (rojo con
      `fail>0` incluso al 100%, verde solo con `pct===100 && fail===0`, amarillo en cualquier otro
      caso)
- [ ] ¿Las tarjetas de esquema en `/admin/esquemas` **ahora sí** cablean su semáforo y su barra de
      progreso a data real, y el clic en el cuerpo **navega** a
      `/admin/resultados/esquema/:id` (con `stopPropagation` en los botones de acción)?
- [ ] ¿El `progress-card` reutilizable existe como componente, aplica los modificadores `.is-ready`
      / `.has-fail`, y usa el patrón `group relative` **solo** cuando la card es navegable?
- [ ] ¿Ningún ícono es un emoji? (`BarChart3` sidebar/empty, `FileText` reporte ejecutivo, `Award`
      certificado, `Download` descargar, `AlertTriangle` fallas, `Check` enviado, `KeyRound`
      reapertura, `ChevronRight` navegación) — todos `lucide-react` con `size={}` según §4.
- [ ] ¿Las pantallas de detalle (por paquete, por persona) usan `breadcrumbs` con la ruta completa
      y permiten volver un nivel sin recargar (SPA)?
- [ ] ¿"Solicitar reapertura" y "Generar certificado" están visibles pero con tooltip "Disponible
      próximamente" — no ocultos?
- [ ] ¿Los popover de evidencia/comentario son solo lectura (no modales)?
- [ ] ¿La UI funciona igual con `ResultadoItem` vacío (todos los KPIs en 0, semáforos amarillos,
      empty-states) — nunca lanza excepciones ni queda en spinner infinito?
- [ ] ¿Los errores se leen del backend con el patrón `response.data.message` (array→[0]) → `.error`
      → fallback, sin inventar textos, y sin usar datos mock en ninguna pantalla?
- [ ] ¿Todos los colores/radios/sombras siguen siendo los de las secciones 1 y 3 (ningún valor nuevo)?

---