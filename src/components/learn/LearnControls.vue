<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { ItField, ItOption, ItSelect } from '@components/theme'
import { LEVEL_LABELS } from '@/i18n/keys'
import { ERROR_CORRECTION_LEVELS, type ErrorCorrectionLevel } from '@/types/qr'

import DetailHelp from './DetailHelp.vue'
import ErrorCorrectionHelp from './ErrorCorrectionHelp.vue'
import VersionHelp from './VersionHelp.vue'

const { t } = useI18n()


interface Props {
  level: ErrorCorrectionLevel
  version: number | null
  stride: number
  maskCandidates: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:level': [level: ErrorCorrectionLevel]
  'update:version': [version: number | null]
  'update:stride': [stride: number]
  'update:mask-candidates': [enabled: boolean]
}>()

const level = computed<string>({
  get: () => props.level,
  set: (value) => emit('update:level', value as ErrorCorrectionLevel),
})

const version = computed<string>({
  get: () => (props.version === null ? '' : String(props.version)),
  set: (value) => emit('update:version', value === '' ? null : Number(value)),
})

const stride = computed<string>({
  get: () => String(props.stride),
  set: (value) => emit('update:stride', Number(value)),
})

const maskCandidates = computed<boolean>({
  get: () => props.maskCandidates,
  set: (value) => emit('update:mask-candidates', value),
})
</script>

<template>
  <section aria-labelledby="trace-options-heading" class="controls-stack">
    <h2 id="trace-options-heading" class="it-h5 panel-title">{{ t('learn.controls.title') }}</h2>

    <fieldset class="it-fieldset-plain">
      <legend class="option-legend row it-small">
        {{ t('learn.controls.errorCorrection') }}
        <ErrorCorrectionHelp />
      </legend>
      <div class="it-choice-group it-choice-group-2">
        <label
          v-for="option in ERROR_CORRECTION_LEVELS"
          :key="option.value"
          :for="`trace-level-${option.value}`"
          class="it-choice"
        >
          <input
            :id="`trace-level-${option.value}`"
            v-model="level"
            type="radio"
            name="trace-level"
            :value="option.value"
          />
          <span>{{ t(LEVEL_LABELS[option.value]) }}</span>
        </label>
      </div>
    </fieldset>

    <ItField
      :label="t('learn.controls.version')"
      html-for="trace-version"
      :hint="t('learn.controls.versionHint')"
    >
      <template #help>
        <VersionHelp />
      </template>
      <ItSelect
        id="trace-version"
        v-model="version"
        :aria-label="t('learn.controls.version')"
      >
        <ItOption value="" :text="t('learn.controls.auto')" />
        <ItOption
          v-for="value in 40"
          :key="value"
          :value="String(value)"
          :text="t('learn.controls.versionOption', { version: value })"
        />
      </ItSelect>
    </ItField>

    <ItField
      :label="t('learn.controls.detail')"
      html-for="trace-stride"
      :hint="t('learn.controls.detailHint')"
    >
      <template #help>
        <DetailHelp />
      </template>
      <ItSelect
        id="trace-stride"
        v-model="stride"
        :aria-label="t('learn.controls.detail')"
      >
        <ItOption value="1" :text="t('learn.controls.everyModule')" />
        <ItOption value="5" :text="t('learn.controls.everyModules', { count: 5 })" />
        <ItOption value="10" :text="t('learn.controls.everyModules', { count: 10 })" />
        <ItOption value="20" :text="t('learn.controls.everyModules', { count: 20 })" />
        <ItOption value="50" :text="t('learn.controls.everyModules', { count: 50 })" />
      </ItSelect>
    </ItField>

    <label for="trace-mask-candidates" class="row it-small">
      <input
        id="trace-mask-candidates"
        v-model="maskCandidates"
        type="checkbox"
        class="controls-toggle"
      />
      {{ t('learn.controls.maskCandidates') }}
    </label>
  </section>
</template>
