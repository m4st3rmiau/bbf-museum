# El museo de las huellas

Prototipo local de un museo con Next.js App Router, React, TypeScript, Tailwind CSS, componentes shadcn/ui sobre Radix, Three.js, React Three Fiber y Drei.

## Desarrollo

Requiere Node.js 22 y npm.

```sh
npm install
npm run dev
```

Abrir la URL que indique Next.js. No se necesitan claves, servicios externos ni una base de datos remota. Las fotografías de ejemplo y las fuentes están incluidas en el proyecto.

```sh
npm run typecheck
npm run build
npm start
```

La compilación usa webpack para evitar la dependencia de Turbopack de puertos internos en entornos restringidos. El servidor de desarrollo usa Turbopack.

## Recorrido

- `/`: bienvenida y vista de la sala.
- `/exhibir`: imágenes, historia y vista previa de la placa.
- `/exhibir/datos`: formulario de contacto de demostración.
- `/gracias/[id]`: confirmación solo después de completar el guardado.
- `/galeria`: sala 3D a pantalla completa o tarjetas, búsqueda, salas de doce y detalles.
- `/galeria?obra=[id]`: abre la sala de una obra y la enfoca.
- `/creditos`: autores, fuentes y licencias de las fotografías.

La sala es a pantalla completa (sin encabezado ni pie). La figura central está en medio de la sala y los doce pedestales (cuatro a la izquierda, cuatro a la derecha y cuatro al fondo) la rodean, cada uno bajo una vitrina de cristal. Se recorre en primera persona: flechas ↑/↓ (o W/S) caminan, ←/→ giran, A/D se desplazan de lado, arrastrar mira alrededor y la rueda del ratón camina; en pantallas táctiles hay flechas en pantalla. Tocar un pedestal, su botón "i" o la figura central acerca la cámara y abre su información; mientras hay una obra enfocada se ocultan la búsqueda y el resto de controles. La búsqueda no oculta pedestales: lista coincidencias, cambia a la sala correspondiente y enfoca la obra. Los pedestales vacíos muestran "+" al acercarse y llevan al formulario `/exhibir`. Cada grupo de doce obras es una sala (miniaturas abajo a la izquierda). Se respeta `prefers-reduced-motion`.

## Figura central de campaña

1. Copiar el modelo en `public/models/campaign.glb`. GLB es preferible porque contiene geometría, materiales y texturas en un archivo. También se admite glTF; incluir los `.bin` y texturas en las rutas relativas que indique el archivo.
2. En `src/lib/campaign.ts`, establecer `centralModel.url: "/models/campaign.glb"`.
3. Ajustar `height` (metros) y `rotationY` (radianes). El modelo se centra y se limita a 2.3 m de ancho/profundidad para mantenerlo dentro de la plataforma central. La base queda a 0.56 m sobre el suelo.
4. El texto que se muestra al tocar la figura central está en `centralInfo` (mismo archivo).
5. Revisar la sala en computadora y celular. Mantener el archivo ligero y texturas de resolución moderada; evitar modelos de millones de polígonos.

Con `url: null` se muestra la escultura provisional. Durante la carga se mantiene la escultura, y ante un error se informa que el modelo no está disponible. Esta configuración corresponde a la campaña, no a las obras de visitantes.

Después de cambiar la figura, se puede actualizar la portada mediante `node scripts/capture-museum.mjs` con el servidor activo. `PLAYWRIGHT_BASE_URL` selecciona la URL; por defecto usa `http://localhost:3002`. La portada es una captura de la sala real sin controles superpuestos.

## Datos y límites del prototipo

`src/lib/storage.ts` expone `artworkRepository.list/get/save` sobre IndexedDB (`bbf-museum`, versión 1). Las obras y sus imágenes se almacenan localmente como blobs; el registro nunca persiste los datos personales. El formulario temporal vive en un contexto de React y se conserva entre pasos, pero se pierde al recargar antes de guardar. Tras guardar, la obra sobrevive a una recarga y los datos personales se descartan.

Las imágenes admiten JPG, PNG y WebP hasta 10 MB. Se verifican, se respeta su orientación al decodificar y se convierten a JPEG de máximo 1600 px. En las vitrinas y el detalle se mantienen las proporciones. El guardado espera la transacción y evita registros duplicados al reintentar.

Las historias de ejemplo son ficticias. Los enlaces de las obras locales solo funcionan en el navegador y origen que las guardó. Borrar los datos del sitio elimina las obras. No hay publicación compartida, autenticación, moderación ni envío de correos. El aviso mostrado es explicativo para esta demostración; no es el aviso de una campaña pública.

El logo tipográfico y la escultura son provisionales. Las licencias de las imágenes están en `/creditos`; se conservan en `public/images` para no depender de servidores de terceros al visitar la aplicación.

## Pruebas

```sh
npm test
```

Playwright ejecuta los flujos en escritorio y un tamaño móvil: registro y regreso entre pasos, persistencia, exclusión de datos personales, fotos inválidas, guardado bloqueado, recorrido con teclado, búsqueda, detalle, pedestales vacíos, salas de más de doce obras, enlaces a obras inexistentes, fallback sin WebGL y ausencia de desbordamiento horizontal.

En macOS usa Chrome instalado si está disponible; en otros sistemas, instalar Chromium con `npx playwright install chromium`. También se puede indicar `PLAYWRIGHT_CHROMIUM_EXECUTABLE`. Las pruebas arrancan o reutilizan el servidor en `http://localhost:3002`; se puede configurar `PLAYWRIGHT_BASE_URL` si ya hay otro servidor activo.
