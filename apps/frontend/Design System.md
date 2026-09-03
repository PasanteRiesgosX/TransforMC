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
- **Estado actual (Fase 2):** 2 ítems habilitados — **Usuarios** (ícono `Users`) y **Catálogo**
  (ícono `LayoutGrid`). El resto de ítems (Esquemas de evaluación — `ClipboardList`, Resultados —
  `BarChart3`, Solicitudes — `Inbox`) se muestran pero permanecen deshabilitados hasta sus
  respectivas fases — mismo comportamiento que ya tenía "Catálogo" en la fase anterior.

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

## 7. Lo que NO se debe cambiar

- El flujo de pantallas y su orden (landing → login → cambio de clave obligatorio → panel admin /
  home de certificador; y dentro del panel admin: lista de módulos → detalle de módulo → panel de
  submódulo con sus casos de prueba).
- La organización interna de cada pantalla (qué elemento va arriba, al lado de qué, estructura de
  grid/flex tal como está descrita arriba, incluyendo la sección 6bis del Catálogo).
- La paleta de colores de la sección 1 — cero colores nuevos.
- Los textos y labels existentes, **excepto** los renombrados explícitamente para esta fase:
  "Sección" → **"SubMódulo"**, "+ Ítem" → **"+ Caso de Prueba"**, "Eliminar sección" →
  **"Eliminar submódulo"**. No renombres nada más por tu cuenta.

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