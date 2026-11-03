<script setup lang="ts">
import type { TraceMetadata } from '@/types/learn'

defineProps<{ metadata: TraceMetadata | null }>()
</script>

<template>
  <section aria-labelledby="stats-heading" class="flex flex-col gap-3">
    <h2 id="stats-heading" class="text-lg font-semibold">Trace</h2>

    <dl v-if="metadata" class="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
      <dt class="opacity-70">Version</dt>
      <dd>{{ metadata.version }}</dd>
      <dt class="opacity-70">Size</dt>
      <dd>{{ metadata.size }}×{{ metadata.size }}</dd>
      <dt class="opacity-70">Level</dt>
      <dd>{{ metadata.level }}</dd>
      <dt class="opacity-70">Mask</dt>
      <dd>{{ metadata.mask }}</dd>
      <dt class="opacity-70">Blocks</dt>
      <dd>{{ metadata.blocks }}</dd>
      <dt class="opacity-70">Data codewords</dt>
      <dd>{{ metadata.dataCodewords }}</dd>
      <dt class="opacity-70">ECC per block</dt>
      <dd>{{ metadata.eccPerBlock }}</dd>
      <dt class="opacity-70">Total codewords</dt>
      <dd>{{ metadata.totalCodewords }}</dd>
      <dt class="opacity-70">Data modules</dt>
      <dd>{{ metadata.dataModules }}</dd>
      <dt class="opacity-70">Segments</dt>
      <dd class="break-words">{{ metadata.segments }}</dd>
    </dl>

    <p v-else class="text-sm opacity-70">Build a trace to see its metadata.</p>
  </section>
</template>
