<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { CONTENT_TYPES, type QrcodeType } from '@/types/qr'

const { t } = useI18n()

const model = defineModel<QrcodeType>({ required: true })
</script>

<template>
  <section aria-labelledby="content-heading">
    <h2 id="content-heading" class="it-h5 panel-title panel-title-gap">
      {{ t('generator.sections.contentType') }}
    </h2>
    <fieldset class="it-fieldset-plain">
      <legend class="it-sr-only">{{ t('generator.sections.contentType') }}</legend>
      <div class="it-choice-group generator-choices">
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
          <span>{{ t(`generator.types.${item.value}`) }}</span>
        </label>
      </div>
    </fieldset>
  </section>
</template>
