<script setup lang="ts">
import { CONTENT_TYPES, type QrcodeType } from '@/types/qr'

const model = defineModel<QrcodeType>({ required: true })
</script>

<template>
  <section aria-labelledby="content-heading">
    <h2 id="content-heading" class="it-h5 mb-3 text-lg font-semibold">Content type</h2>
    <fieldset class="it-fieldset-plain">
      <legend class="sr-only">Content type</legend>
      <div class="it-choice-group it-choice-group-2 lg:grid-cols-1">
        <label
          v-for="item in CONTENT_TYPES"
          :key="item.value"
          :for="`content-${item.value}`"
          class="it-choice"
        >
          <input
            :id="`content-${item.value}`"
            v-model="model"
            type="radio"
            name="content-type"
            :value="item.value"
          />
          <span>{{ item.label }}</span>
        </label>
      </div>
    </fieldset>
  </section>
</template>
