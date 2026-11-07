<script setup lang="ts">
import { useTemplateRef, watchEffect } from 'vue'

import { drawMatrix } from '@/lib/qrcode/render'

const props = withDefaults(
  defineProps<{
    matrix: Uint8Array | null
    size: number
    moduleSize: number
    quietZone: number
    dark: string
    light: string
    highlight?: readonly number[]
    highlightColor?: string
    label?: string
  }>(),
  {
    highlight: () => [],
    highlightColor: 'currentColor',
    label: 'QR code',
  },
)

const canvas = useTemplateRef<HTMLCanvasElement>('canvas')

watchEffect(() => {
  const element = canvas.value
  if (!element || !props.matrix || props.size <= 0) return

  const dimension = (props.size + props.quietZone * 2) * props.moduleSize
  const ratio = Math.min(window.devicePixelRatio || 1, 3)

  element.width = Math.round(dimension * ratio)
  element.height = Math.round(dimension * ratio)
  element.style.width = `${dimension}px`
  element.style.height = 'auto'

  const context = element.getContext('2d')
  if (!context) return

  context.setTransform(ratio, 0, 0, ratio, 0, 0)
  context.imageSmoothingEnabled = false

  const highlightColor =
    props.highlightColor === 'currentColor' ? getComputedStyle(element).color : props.highlightColor

  drawMatrix(context, {
    matrix: props.matrix,
    size: props.size,
    moduleSize: props.moduleSize,
    quietZone: props.quietZone,
    dark: props.dark,
    light: props.light,
    highlight: props.highlight,
    highlightColor,
  })
})
</script>

<template>
  <figure class="qr-figure">
    <canvas ref="canvas" class="qr-canvas" />
    <figcaption class="it-sr-only">{{ label }}</figcaption>
  </figure>
</template>
