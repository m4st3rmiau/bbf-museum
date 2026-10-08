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
- `/galeria`: sala 3D o tarjetas, búsqueda, grupos de ocho y detalles.
- `/galeria?obra=[id]`: selecciona el grupo y el pedestal de una obra.
- `/creditos`: autores, fuentes y licencias de las fotografías.

El clic en un pedestal acerca la exhibición; la placa enfoca su texto y abre el detalle; las fotografías enfocan la imagen correspondiente. En el detalle se pueden ampliar las imágenes completas. Las flechas del teclado y los botones recorren las posiciones de la sala. Cerrar el detalle recupera la selección o posición anterior. Las rutas de cámara rodean el espacio central; se respeta `prefers-reduced-motion`.

## Figura central de campaña

1. Copiar el modelo en `public/models/campaign.glb`. GLB es preferible porque contiene geometría, materiales y texturas en un archivo. También se admite glTF; incluir los `.bin` y texturas en las rutas relativas que indique el archivo.
2. En `src/lib/campaign.ts`, establecer `centralModel.url: "/models/campaign.glb"`.
3. Ajustar `height` (metros) y `rotationY` (radianes). El modelo se centra y se limita a 2.6 m de ancho/profundidad para mantenerlo dentro del espacio reservado. La base queda a 0.6 m sobre el suelo.
4. Revisar la sala en computadora y celular. Mantener el archivo ligero y texturas de resolución moderada; evitar modelos de millones de polígonos.

Con `url: null` se muestra la escultura provisional. Durante la carga se mantiene la escultura, y ante un error se informa que el modelo no está disponible. Esta configuración corresponde a la campaña, no a las obras de visitantes.

Después de cambiar la figura, se puede actualizar la portada mediante `node scripts/capture-museum.mjs` con el servidor activo. `PLAYWRIGHT_BASE_URL` selecciona la URL; por defecto usa `http://localhost:3002`. La portada es una captura de la sala real sin controles superpuestos.

## Datos y límites del prototipo

`src/lib/storage.ts` expone `artworkRepository.list/get/save` sobre IndexedDB (`bbf-museum`, versión 1). Las obras y sus imágenes se almacenan localmente como blobs; el registro nunca persiste los datos personales. El formulario temporal vive en un contexto de React y se conserva entre pasos, pero se pierde al recargar antes de guardar. Tras guardar, la obra sobrevive a una recarga y los datos personales se descartan.

Las imágenes admiten JPG, PNG y WebP hasta 10 MB. Se verifican, se respeta su orientación al decodificar y se convierten a JPEG de máximo 1600 px. En la vitrina y el detalle se mantienen las proporciones. El guardado espera la transacción y evita registros duplicados al reintentar.

Las historias de ejemplo son ficticias. Los enlaces de las obras locales solo funcionan en el navegador y origen que las guardó. Borrar los datos del sitio elimina las obras. No hay publicación compartida, autenticación, moderación ni envío de correos. El aviso mostrado es explicativo para esta demostración; no es el aviso de una campaña pública.

El logo tipográfico y la escultura son provisionales. Las licencias de las imágenes están en `/creditos`; se conservan en `public/images` para no depender de servidores de terceros al visitar la aplicación.

## Pruebas

```sh
npm test
```

Playwright ejecuta los flujos en escritorio y un tamaño móvil: registro y regreso entre pasos, persistencia, exclusión de datos personales, fotos inválidas, guardado bloqueado, búsqueda, detalle, grupos de más de ocho obras, enlaces a obras inexistentes, fallback sin WebGL y ausencia de desbordamiento horizontal.

En macOS usa Chrome instalado si está disponible; en otros sistemas, instalar Chromium con `npx playwright install chromium`. También se puede indicar `PLAYWRIGHT_CHROMIUM_EXECUTABLE`. Las pruebas arrancan o reutilizan el servidor en `http://localhost:3002`; se puede configurar `PLAYWRIGHT_BASE_URL` si ya hay otro servidor activo.
