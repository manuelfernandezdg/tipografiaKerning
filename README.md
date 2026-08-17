# Kerning Explorer

Herramienta web estática (sin framework ni build) para explorar y experimentar con **kerning**, **espaciado tipográfico** y **propiedades CSS de texto** en tiempo real, con soporte para cargar cualquier fuente desde Google Fonts o archivos locales.

**Ver en vivo:** <span style="color:#FF843D">→</span> [manuelfernandezdg.github.io/tipografiaKerning](https://manuelfernandezdg.github.io/tipografiaKerning/)

---

## ¿Para qué sirve?

Cuando se trabaja con tipografía en la web, las decisiones de espaciado son visuales: no hay forma de saber si un valor de `letter-spacing` funciona bien con una fuente determinada sin verlo en acción. Kerning Explorer resuelve eso: permite cargar cualquier tipografía y ajustar todas las propiedades CSS relevantes en tiempo real, viendo el resultado antes de escribir una sola línea de código.

La app trabaja con **tres elementos** —h1, h2 y párrafo— y devuelve en tiempo real:

- el **letter-spacing óptimo` con indicador de legibilidad,
- el efecto de **font-kerning**, **ligaduras** y **text-rendering** sobre el mismo texto,
- una **comparación de pares kerneados** (AV, To, fi, fl…) con y sin kerning activo,
- una **salida CSS** lista para copiar, con comentarios explicativos.

---

## Funcionalidades

- Tres elementos preview simultáneos (h1, h2, p), cada uno con controles independientes de `font-size`, `font-weight`, `letter-spacing`, `word-spacing`, `line-height` y propiedades tipográficas avanzadas.
- Indicador de legibilidad en vivo que diagnostica el `letter-spacing` (óptimo / moderado / extremo).
- **Comparación de pares kerneados**: muestra lado a lado cada par sin kerning y con kerning activo.
- **Salida CSS** por elemento, con la sintaxis resaltada y botón para copiar.
- Carga de fuentes desde **Google Fonts** (URL de @import) o **archivos locales** (drag & drop / file picker).
- Selector de temas: oscuro, claro, papel crema y personalizado con color pickers.
- Persistencia de estado en **localStorage** y **URL params** para compartir configuraciones.
- Atajos de teclado para cambiar elemento activo, toggle de propiedades y compartir.

---

## Propiedades CSS cubiertas

### `letter-spacing`

Controla el espacio entre todos los caracteres de forma uniforme. Se expresa en `em` para que escale proporcionalmente con el `font-size`. Un detalle importante: el espacio se aplica *después* de cada carácter, incluido el último, lo que puede descentrar visualmente un titular centrado.

Para titulares grandes (más de 32px) suele convenir un valor ligeramente negativo (-0.02em a -0.04em), porque las tipografías están diseñadas para verse bien en tamaños intermedios y a mayor tamaño los espacios interglifos se abren. Para cuerpo de texto, el valor recomendado es `normal` o entre -0.01em y 0.02em como máximo.

### `font-kerning`

Activa las tablas de kerning embebidas en la fuente. Las tipografías de calidad incluyen pares kerneados definidos por el diseñador tipográfico (AV, To, WA, fi…) que ajustan el espacio óptico entre caracteres específicos.

Valores posibles:
- `auto` — el navegador decide (comportamiento por defecto)
- `normal` — aplica las tablas de kerning siempre
- `none` — desactiva el kerning completamente

### `font-variant-ligatures`

Las ligaduras son glifos especiales que reemplazan combinaciones de letras que colisionan ópticamente (`fi`, `fl`, `ff`, `ffi`, `ffl`). Con `common-ligatures` activado, la fuente usa el glifo combinado diseñado para esa situación.

### `text-rendering`

Le indica al motor de renderizado del navegador qué priorizar. Con `optimizeLegibility` el navegador activa kerning y ligaduras automáticamente. Es útil para titulares, pero se desaconseja en bloques largos de texto por su costo de rendimiento.

### `font-variant-numeric: oldstyle-nums`

Activa los números en estilo old-style, que tienen ascendentes y descendentes propios, integrándose mejor visualmente dentro del flujo del texto corrido. No todas las fuentes incluyen este conjunto de glifos.

### `word-spacing`

Ajusta el espacio entre palabras. Útil para corregir la textura del texto en justificaciones o para tipografías con espaciado interno muy estrecho o muy amplio.

---

## Atajos de teclado

| Tecla | Acción |
|-------|--------|
| `1` | Seleccionar h1 |
| `2` | Seleccionar h2 |
| `3` | Seleccionar párrafo |
| `K` | Toggle font-kerning |
| `L` | Toggle ligaduras |
| `R` | Toggle text-rendering |
| `N` | Toggle oldstyle-nums |
| `S` | Compartir URL |
| `Z` | Restablecer todo |
| `Esc` | Cerrar panel (móvil) |

---

## Paleta del sistema

La interfaz usa tokens CSS en `:root` (capa `tokens`). Los mismos colores que ves en la app:

### Acento y diagnóstico

| Token | Descripción | Valor |
|-------|-------------|-------|
| `--accent` | Acento | `hsl(22, 100%, 62%)` |
| `--accent2` | Acento claro | `hsl(22, 100%, 78%)` |
| `--danger` | Errores / fail | `hsl(0, 100%, 71%)` |
| `--pass-a` | Warn / moderado | `hsl(41, 100%, 65%)` |
| `--pass-aa` | OK / óptimo | `hsl(153, 100%, 55%)` |
| `--pass-aaa` | Info / neutro | `hsl(201, 100%, 65%)` |

### Texto y superficies

| Token | Descripción | Valor |
|-------|-------------|-------|
| `--bg` | Fondo de la interfaz | `hsl(214, 5%, 11%)` |
| `--surface` | Superficie de paneles | `hsl(215, 11%, 3%)` |
| `--surface2` | Superficies hundidas | `hsl(214, 4%, 5%)` |
| `--border` | Bordes de componentes | `hsl(214, 35%, 22%)` |
| `--text` | Texto principal | `hsl(215, 25%, 85%)` |
| `--text3` | Texto secundario | `hsl(216, 15%, 60%)` |

---

## Compatibilidad

Funciona en todos los navegadores modernos (Chrome, Firefox, Safari, Edge). La propiedad `font-kerning` tiene soporte universal. `font-variant-ligatures` y `font-variant-numeric` tienen soporte amplio con algunas variaciones menores entre motores de renderizado. `text-rendering: optimizeLegibility` es una propiedad no estándar (originalmente de SVG) adoptada por los navegadores; su comportamiento puede variar levemente.

---

## Uso

No requiere instalación ni build: abrir `index.html` en el navegador o verlo publicado en [GitHub Pages](https://manuelfernandezdg.github.io/tipografiaKerning/). Todo el estilado vive en `css/estilos.css` y la lógica en `js/app.js`.
