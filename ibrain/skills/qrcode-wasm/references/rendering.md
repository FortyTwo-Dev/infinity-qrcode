# Rendering and export

## Shared renderer

`QrCanvas` receives a matrix (`Uint8Array`), a size, a module size, a quiet
zone, two colours and an optional highlight list. It draws once per change.

- Use a canvas sized in CSS pixels, scaled by `devicePixelRatio` for crisp
  edges.
- Disable image smoothing; draw integer rectangles.
- Paint the light colour first, then the dark modules.
- Convert highlight pairs to a set or an index map once, not inside the draw
  loop.

## SVG export

Build the SVG from the matrix rather than post-processing the package's SVG:

```ts
function toSvg(matrix: Uint8Array, size: number, module: number, quiet: number, dark: string, light: string) {
  const dimension = (size + quiet * 2) * module
  const parts: string[] = []
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (matrix[y * size + x] === 1) {
        parts.push(`M${(x + quiet) * module} ${(y + quiet) * module}h${module}v${module}h-${module}z`)
      }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${dimension}" height="${dimension}" viewBox="0 0 ${dimension} ${dimension}" shape-rendering="crispEdges"><rect width="${dimension}" height="${dimension}" fill="${light}"/><path fill="${dark}" d="${parts.join('')}"/></svg>`
}
```

## Raster export

- Create an offscreen canvas of `(size + quiet * 2) * module`.
- Paint the light background first, then the dark modules.
- `toDataURL('image/png')`, `image/webp` or `image/jpeg`.
- JPEG has no alpha; the light background is mandatory.
- Revoke object URLs after download.

## Learn stage

- Render the current frame matrix, then overlay the highlight cells with the
  accent colour or an outline.
- Keep the grid readable at small module sizes; zoom rather than shrinking the
  modules below 2 CSS pixels.
- Provide an accessible text summary of the phase and frame index.
