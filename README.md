# Kerning Explorer
 
Una herramienta interactiva para explorar y experimentar con kerning, espaciado de caracteres y propiedades tipográficas avanzadas en CSS, con soporte para cargar cualquier fuente desde Google Fonts.
 
---
 
## ¿Para qué sirve?
 
Cuando se trabaja con tipografía en la web, las decisiones de espaciado son visuales: no hay forma de saber si un valor de `letter-spacing` funciona bien con una fuente determinada sin verlo en acción. Kerning Explorer resuelve eso: permite cargar cualquier tipografía de Google Fonts y ajustar todas las propiedades CSS relevantes en tiempo real, viendo el resultado antes de escribir una sola línea de código en el proyecto.
 
Es útil para:
 
- Encontrar el `letter-spacing` óptimo para un titular con una fuente nueva
- Comparar cómo diferentes tipografías manejan los pares kerneados (AV, To, fi, fl…)
- Verificar si una fuente tiene tablas de kerning embebidas de calidad
- Generar el CSS final listo para copiar y pegar
- Entender el impacto de `font-kerning`, `font-variant-ligatures` y `text-rendering` en la lectura
---
 
## Cómo usar la app
 
### 1. Cargar una fuente desde Google Fonts
 
Ir a [fonts.google.com](https://fonts.google.com), elegir una tipografía y hacer clic en **"Get font"** → **"Get embed code"**. Seleccionar la pestaña `@import` y copiar únicamente la URL que aparece dentro de la regla, por ejemplo:
 
```
https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap
```
 
Pegar esa URL en el textarea superior del panel izquierdo y presionar **"↳ Cargar fuente"** (o `Enter`).
 
### 2. Escribir el nombre de la font-family
 
Una vez cargada la hoja de estilos, es necesario indicarle al navegador qué nombre usar para aplicar la fuente. Escribirlo en el campo **font-family**, exactamente como figura en Google Fonts, por ejemplo:
 
```
Playfair Display
```
 
La app intentará detectarlo automáticamente desde la URL, pero siempre se puede corregir o escribir a mano. Este paso es indispensable: sin el nombre correcto, el CSS se carga pero la fuente no se aplica.
 
### 3. Ajustar los controles
 
Todos los sliders y toggles del panel izquierdo actúan en tiempo real sobre las tres vistas de la app:
 
| Control | Qué hace |
|---|---|
| `font-size` | Tamaño del titular (18–120px) |
| `font-weight` | Peso tipográfico (100–900, en pasos de 100) |
| `letter-spacing` | Espacio entre caracteres (-0.12em a 0.35em) |
| `word-spacing` | Espacio entre palabras (-0.1em a 0.5em) |
| `line-height` | Interlineado (0.8 a 2.2) |
| `font-kerning` | Activa/desactiva las tablas de kerning de la fuente |
| `text-rendering` | Activa `optimizeLegibility` (solo para titulares) |
| `font-variant-ligatures` | Activa ligaduras tipográficas (`fi`, `fl`, `ffi`…) |
| `font-variant-numeric` | Activa números en estilo old-style |
 
### 4. Navegar entre las pestañas
 
**Titular** — Vista principal con el texto editable. Se puede hacer clic sobre el titular y escribir el contenido real que se usará en el proyecto. También permite cambiar el tema de fondo (oscuro, claro, papel crema) para simular diferentes contextos.
 
**Pares kerneados** — Compara lado a lado el mismo par de caracteres sin kerning (`font-kerning: none`) y con kerning activo (`font-kerning: normal`). Los pares se renderizan con la fuente cargada, lo que permite evaluar la calidad de las tablas de kerning de cada tipografía.
 
**Cuerpo de texto** — Muestra los mismos ajustes aplicados a un párrafo largo, con un indicador de legibilidad que advierte cuando el `letter-spacing` sale del rango recomendado para lectura continua.
 
**CSS generado** — Muestra el CSS listo para copiar, con comentarios explicativos. Incluye dos bloques: uno para el titular y uno con los valores recomendados para cuerpo de texto.
 
---
 
## Técnicas y propiedades CSS cubiertas
 
### `letter-spacing`
 
Controla el espacio entre todos los caracteres de forma uniforme. El valor se expresa en `em` para que escale proporcionalmente con el `font-size`. Un detalle importante: el espacio se aplica *después* de cada carácter, incluido el último, lo que puede descentrar visualmente un titular centrado; en ese caso se compensa con `margin-right` negativo o ajustando el `text-indent`.
 
Para titulares grandes (más de 32px) suele convenir un valor ligeramente negativo (-0.02em a -0.04em), porque las tipografías están diseñadas para verse bien en tamaños intermedios y a mayor tamaño los espacios interglifos se abren. Para cuerpo de texto, el valor recomendado es `normal` o entre -0.01em y 0.02em como máximo.
 
### `font-kerning`
 
Activa las tablas de kerning embebidas en la fuente. Las tipografías de calidad incluyen pares kerneados definidos por el diseñador tipográfico (AV, To, WA, fi…) que ajustan el espacio óptico entre caracteres específicos. Con `font-kerning: normal` el navegador respeta esos ajustes; con `none` los ignora. El efecto visible depende completamente de la calidad de la fuente.
 
Valores posibles:
- `auto` — el navegador decide (comportamiento por defecto; puede omitirlo en tamaños pequeños)
- `normal` — aplica las tablas de kerning siempre
- `none` — desactiva el kerning completamente
### `font-variant-ligatures`
 
Las ligaduras son glifos especiales que reemplazan combinaciones de letras que colisionan ópticamente. Las más comunes son `fi`, `fl`, `ff`, `ffi`, `ffl`. Sin ligaduras, la `f` y la `i` pueden solaparse o quedar con un espacio raro dependiendo de la fuente; con `common-ligatures` activado, la fuente usa el glifo combinado diseñado para esa situación.
 
Valores relevantes:
- `normal` — activa las ligaduras comunes (equivale a `common-ligatures`)
- `common-ligatures` — explícito y recomendado
- `none` — desactiva todas las ligaduras
### `text-rendering`
 
Le indica al motor de renderizado del navegador qué priorizar. Con `optimizeLegibility` el navegador activa kerning y ligaduras automáticamente, independientemente de `font-kerning`. Es útil para titulares y textos cortos. Se desaconseja su uso en bloques largos de texto (párrafos, artículos) porque puede tener un costo de rendimiento perceptible en páginas con mucho contenido.
 
### `font-variant-numeric: oldstyle-nums`
 
Activa los números en estilo old-style (también llamados números de caja baja), que tienen ascendentes y descendentes propios, lo que los integra mejor visualmente dentro del flujo del texto corrido. No todas las fuentes incluyen este conjunto de glifos.
 
### `word-spacing`
 
Ajusta el espacio entre palabras. Útil para corregir la textura del texto en justificaciones o para tipografías con espaciado interno muy estrecho o muy amplio. A diferencia de `letter-spacing`, afectar el `word-spacing` en cuerpo de texto tiene un impacto menor en la legibilidad.
 
---
 
## Notas sobre kerning en párrafos
 
El kerning manual carácter por carácter no es práctico en cuerpos de texto. El flujo recomendado para párrafos es:
 
1. Activar `font-kerning: normal` a nivel global
2. Activar `font-variant-ligatures: common-ligatures`
3. Usar fuentes con buenas tablas de kerning embebidas
4. No modificar `letter-spacing` salvo valores mínimos (entre -0.01em y 0.02em)
5. Evitar `text-rendering: optimizeLegibility` en bloques largos
Para ajustes quirúrgicos en un titular —por ejemplo, corregir el par "Te" en una palabra específica— se puede aislar el carácter con un `<span>`:
 
```css
T<span style="letter-spacing: -0.06em">e</span>levisión
```
 
Para control submilimétrico en titulares de marca, SVG ofrece el atributo `dx` en `<tspan>` que permite mover cada carácter individualmente.
 
---
 
## Compatibilidad
 
Funciona en todos los navegadores modernos (Chrome, Firefox, Safari, Edge). La propiedad `font-kerning` tiene soporte universal. `font-variant-ligatures` y `font-variant-numeric` tienen soporte amplio con algunas variaciones menores entre motores de renderizado. `text-rendering: optimizeLegibility` es una propiedad no estándar (originalmente de SVG) adoptada por los navegadores; su comportamiento puede variar levemente.
 
---
 
## Licencia
 
Uso libre. Sin restricciones.