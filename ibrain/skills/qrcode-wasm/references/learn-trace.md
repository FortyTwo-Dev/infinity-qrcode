# Learn trace

## Phases

| Phase | Meaning | Extra data |
| --- | --- | --- |
| `empty` | Blank grid | None |
| `finders` | Three finder patterns | highlight |
| `timing` | Timing patterns | highlight |
| `alignment` | Alignment patterns | highlight |
| `format_reserved` | Format area reserved | highlight |
| `data_placement` | One data bit placed | `bitIndex`, highlight |
| `mask_candidate` | One mask evaluated | `mask`, `penalty`, highlight |
| `mask_chosen` | Best mask selected | `mask` |
| `format_info` | Format information written | highlight |
| `final` | Finished matrix | None |

## Frame fields

- `matrix()`: `Uint8Array`, `size * size`, row-major.
- `highlight()`: `Uint32Array` of flat `(x, y)` pairs.
- `phase()`: stable string key from the table.
- `bitIndex()`: index of the placed data bit, or `undefined`.
- `mask()`: mask number, or `undefined`.
- `penalty()`: mask penalty, or `undefined`.
- `size()`: matrix side length.
- `free()`: release the frame.

Copy `matrix()` and `highlight()` into ordinary arrays before freeing if the
data must outlive the current frame.

## UI model

- Build the trace when content/level/version/stride/mask mode changes.
- Keep `frameIndex` separate. Moving the slider must not rebuild the trace.
- A phase list is computed once from `phase()` per frame; use it for the
  timeline markers and the grouped view.
- Autoplay uses an interval; pause on unmount and respect reduced motion.
- For large versions, render the matrix on canvas and allow zoom; never render
  one DOM node per module.

## Error handling

- A forced version smaller than the payload throws. Show the message and keep
  the last valid trace or an empty state; do not display a stale final matrix
  as if it were the new one.
