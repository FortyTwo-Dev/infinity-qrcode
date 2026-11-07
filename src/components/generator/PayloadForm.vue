<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { ItButton, ItField, ItInput, ItOption, ItSelect, ItTextarea } from '@components/theme'
import { buildPayload } from '@/lib/qrcode/payloads'
import { createDefaultFormState, type FormState, type QrcodeType } from '@/types/qr'

const props = defineProps<{ type: QrcodeType; initialText?: string }>()

const emit = defineEmits<{
  'update:payload': [payload: string]
  'update:errors': [errors: Record<string, string>]
}>()

const { t } = useI18n()

const form = ref<FormState>(createDefaultFormState())
const touched = ref(false)
const showWifiPassword = ref(false)

const result = computed(() => buildPayload(props.type, form.value))
const errors = computed(() => result.value.errors)
const visibleErrors = computed(() => (touched.value ? errors.value : {}))

/** Translates the catalog key of a field error; keep the raw record going up. */
function fieldError(field: string): string | undefined {
  const key = visibleErrors.value[field]
  return key ? t(key) : undefined
}

const urlScheme = computed({
  get: () => form.value.urlScheme,
  set: (value: string) => {
    form.value.urlScheme = value === 'http://' ? 'http://' : 'https://'
  },
})

const wifiEncryption = computed({
  get: () => form.value.wifiEncryption,
  set: (value: string) => {
    form.value.wifiEncryption =
      value === 'WPA3' || value === 'WEP' || value === 'nopass' ? value : 'WPA'
  },
})

watch(
  result,
  (value) => {
    emit('update:payload', value.value)
    emit('update:errors', value.errors)
  },
  { immediate: true },
)

watch(
  () => props.type,
  () => {
    form.value = createDefaultFormState()
    touched.value = false
  },
)

watch(
  () => props.initialText,
  (value) => {
    if (value !== undefined) form.value.text = value
  },
  { immediate: true },
)
</script>

<template>
  <div class="stack" @input="touched = true" @change="touched = true">
    <template v-if="type === 'text'">
      <ItField :label="t('generator.fields.text')" html-for="text" :error="fieldError('text')">
        <ItInput
          id="text"
          v-model="form.text"
          :aria-label="t('generator.fields.text')"
          :placeholder="t('generator.placeholders.text')"
          :invalid="Boolean(visibleErrors.text)"
          :describedby="visibleErrors.text ? 'text-error' : undefined"
        />
      </ItField>
    </template>

    <template v-else-if="type === 'url'">
      <ItField :label="t('generator.fields.url')" html-for="url" :error="fieldError('url')">
        <div class="payload-row">
          <ItSelect
            v-model="urlScheme"
            :aria-label="t('generator.fields.protocol')"
            class="field-narrow"
          >
            <ItOption value="https://" text="https://" />
            <ItOption value="http://" text="http://" />
          </ItSelect>
          <ItInput
            id="url"
            v-model="form.url"
            :aria-label="t('generator.fields.url')"
            :placeholder="t('generator.placeholders.url')"
            :invalid="Boolean(visibleErrors.url)"
            :describedby="visibleErrors.url ? 'url-error' : undefined"
          />
        </div>
      </ItField>
    </template>

    <template v-else-if="type === 'wi-fi'">
      <ItField
        :label="t('generator.fields.ssid')"
        html-for="wifi-ssid"
        :error="fieldError('wifiSsid')"
      >
        <ItInput
          id="wifi-ssid"
          v-model="form.wifiSsid"
          :aria-label="t('generator.fields.ssid')"
          :placeholder="t('generator.placeholders.ssid')"
          :invalid="Boolean(visibleErrors.wifiSsid)"
          :describedby="visibleErrors.wifiSsid ? 'wifi-ssid-error' : undefined"
        />
      </ItField>
      <ItField :label="t('generator.fields.encryption')" html-for="wifi-encryption">
        <ItSelect
          id="wifi-encryption"
          v-model="wifiEncryption"
          :aria-label="t('generator.fields.encryption')"
        >
          <ItOption value="WPA" text="WPA/WPA2" />
          <ItOption value="WPA3" text="WPA3" />
          <ItOption value="WEP" text="WEP" />
          <ItOption value="nopass" :text="t('generator.fields.noPassword')" />
        </ItSelect>
      </ItField>
      <ItField
        v-if="form.wifiEncryption !== 'nopass'"
        :label="t('generator.fields.wifiPassword')"
        html-for="wifi-password"
        :error="fieldError('wifiPassword')"
      >
        <div class="payload-row">
          <ItInput
            id="wifi-password"
            v-model="form.wifiPassword"
            :aria-label="t('generator.fields.wifiPassword')"
            :type="showWifiPassword ? 'text' : 'password'"
            autocomplete="off"
            :placeholder="t('generator.placeholders.wifiPassword')"
            :invalid="Boolean(visibleErrors.wifiPassword)"
            :describedby="visibleErrors.wifiPassword ? 'wifi-password-error' : undefined"
          />
          <ItButton
            variant="ghost"
            :aria-label="showWifiPassword ? t('generator.fields.hidePassword') : t('generator.fields.showPassword')"
            :aria-pressed="showWifiPassword"
            @click="showWifiPassword = !showWifiPassword"
          >
            <svg
              v-if="showWifiPassword"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path
                d="M10.733 5.076a10.744 10.744 0 0 1 11.216 6.148 10.545 10.545 0 0 1-2.133 3.23m-6.566-.793a3 3 0 1 1-3.988-3.851M14 10.5V10m-6.634 8.36a10.63 10.63 0 0 1-6.15-4.136 10.545 10.545 0 0 1 1.13-2.485M9.9 9.9a3 3 0 0 1-3.9 3.9"
              />
              <path
                d="M2 2l20 20"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </ItButton>
        </div>
      </ItField>
    </template>

    <template v-else-if="type === 'email'">
      <ItField :label="t('generator.fields.email')" html-for="email" :error="fieldError('email')">
        <ItInput
          id="email"
          v-model="form.email"
          :aria-label="t('generator.fields.email')"
          type="email"
          :placeholder="t('generator.placeholders.email')"
          :invalid="Boolean(visibleErrors.email)"
          :describedby="visibleErrors.email ? 'email-error' : undefined"
        />
      </ItField>
      <ItField :label="t('generator.fields.subject')" html-for="email-subject">
        <ItInput
          id="email-subject"
          v-model="form.emailSubject"
          :aria-label="t('generator.fields.subject')"
          :placeholder="t('generator.placeholders.subject')"
        />
      </ItField>
      <ItField :label="t('generator.fields.message')" html-for="email-body">
        <ItTextarea
          id="email-body"
          v-model="form.emailBody"
          :aria-label="t('generator.fields.message')"
          :placeholder="t('generator.placeholders.message')"
        />
      </ItField>
    </template>

    <template v-else-if="type === 'vcard'">
      <div class="payload-grid">
        <ItField
          :label="t('generator.fields.firstName')"
          html-for="vcard-first"
          :error="fieldError('vcardName')"
        >
          <ItInput
            id="vcard-first"
            v-model="form.vcard.firstName"
            :aria-label="t('generator.fields.firstName')"
            :placeholder="t('generator.placeholders.firstName')"
            :invalid="Boolean(visibleErrors.vcardName)"
            :describedby="visibleErrors.vcardName ? 'vcard-first-error' : undefined"
          />
        </ItField>
        <ItField :label="t('generator.fields.lastName')" html-for="vcard-last">
          <ItInput
            id="vcard-last"
            v-model="form.vcard.lastName"
            :aria-label="t('generator.fields.lastName')"
            :placeholder="t('generator.placeholders.lastName')"
          />
        </ItField>
      </div>
      <div class="payload-grid">
        <ItField :label="t('generator.fields.organization')" html-for="vcard-org">
          <ItInput
            id="vcard-org"
            v-model="form.vcard.organization"
            :aria-label="t('generator.fields.organization')"
            :placeholder="t('generator.placeholders.organization')"
          />
        </ItField>
        <ItField :label="t('generator.fields.jobTitle')" html-for="vcard-title">
          <ItInput
            id="vcard-title"
            v-model="form.vcard.title"
            :aria-label="t('generator.fields.jobTitle')"
            :placeholder="t('generator.placeholders.jobTitle')"
          />
        </ItField>
      </div>
      <div class="payload-grid">
        <ItField :label="t('generator.fields.phoneShort')" html-for="vcard-phone">
          <ItInput
            id="vcard-phone"
            v-model="form.vcard.phone"
            :aria-label="t('generator.fields.phoneShort')"
            type="tel"
            :placeholder="t('generator.placeholders.phone')"
          />
        </ItField>
        <ItField
          :label="t('generator.fields.email')"
          html-for="vcard-email"
          :error="fieldError('vcardEmail')"
        >
          <ItInput
            id="vcard-email"
            v-model="form.vcard.email"
            :aria-label="t('generator.fields.email')"
            type="email"
            :placeholder="t('generator.placeholders.vcardEmail')"
            :invalid="Boolean(visibleErrors.vcardEmail)"
            :describedby="visibleErrors.vcardEmail ? 'vcard-email-error' : undefined"
          />
        </ItField>
      </div>
      <ItField :label="t('generator.fields.website')" html-for="vcard-website">
        <ItInput
          id="vcard-website"
          v-model="form.vcard.website"
          :aria-label="t('generator.fields.website')"
          :placeholder="t('generator.placeholders.website')"
        />
      </ItField>
      <ItField :label="t('generator.fields.address')" html-for="vcard-address">
        <ItInput
          id="vcard-address"
          v-model="form.vcard.address"
          :aria-label="t('generator.fields.address')"
          :placeholder="t('generator.placeholders.address')"
        />
      </ItField>
    </template>

    <template v-else-if="type === 'sms'">
      <ItField
        :label="t('generator.fields.phone')"
        html-for="sms-number"
        :error="fieldError('smsNumber')"
      >
        <ItInput
          id="sms-number"
          v-model="form.smsNumber"
          :aria-label="t('generator.fields.phone')"
          type="tel"
          :placeholder="t('generator.placeholders.phone')"
          :invalid="Boolean(visibleErrors.smsNumber)"
          :describedby="visibleErrors.smsNumber ? 'sms-number-error' : undefined"
        />
      </ItField>
      <ItField
        :label="t('generator.fields.message')"
        html-for="sms-message"
        :error="fieldError('smsMessage')"
      >
        <ItTextarea
          id="sms-message"
          v-model="form.smsMessage"
          :aria-label="t('generator.fields.message')"
          :placeholder="t('generator.placeholders.smsMessage')"
          :invalid="Boolean(visibleErrors.smsMessage)"
          :describedby="visibleErrors.smsMessage ? 'sms-message-error' : undefined"
        />
      </ItField>
    </template>

    <template v-else-if="type === 'phone'">
      <ItField :label="t('generator.fields.phone')" html-for="phone" :error="fieldError('phone')">
        <ItInput
          id="phone"
          v-model="form.phone"
          :aria-label="t('generator.fields.phone')"
          type="tel"
          :placeholder="t('generator.placeholders.phone')"
          :invalid="Boolean(visibleErrors.phone)"
          :describedby="visibleErrors.phone ? 'phone-error' : undefined"
        />
      </ItField>
    </template>

    <template v-else-if="type === 'geo'">
      <div class="payload-grid">
        <ItField
          :label="t('generator.fields.latitude')"
          html-for="geo-lat"
          :error="fieldError('latitude')"
        >
          <ItInput
            id="geo-lat"
            v-model="form.latitude"
            :aria-label="t('generator.fields.latitude')"
            type="number"
            step="any"
            :placeholder="t('generator.placeholders.latitude')"
            :invalid="Boolean(visibleErrors.latitude)"
            :describedby="visibleErrors.latitude ? 'geo-lat-error' : undefined"
          />
        </ItField>
        <ItField
          :label="t('generator.fields.longitude')"
          html-for="geo-lng"
          :error="fieldError('longitude')"
        >
          <ItInput
            id="geo-lng"
            v-model="form.longitude"
            :aria-label="t('generator.fields.longitude')"
            type="number"
            step="any"
            :placeholder="t('generator.placeholders.longitude')"
            :invalid="Boolean(visibleErrors.longitude)"
            :describedby="visibleErrors.longitude ? 'geo-lng-error' : undefined"
          />
        </ItField>
      </div>
    </template>

    <template v-else-if="type === 'event'">
      <ItField
        :label="t('generator.fields.title')"
        html-for="event-title"
        :error="fieldError('eventTitle')"
      >
        <ItInput
          id="event-title"
          v-model="form.eventTitle"
          :aria-label="t('generator.fields.title')"
          :placeholder="t('generator.placeholders.eventTitle')"
          :invalid="Boolean(visibleErrors.eventTitle)"
          :describedby="visibleErrors.eventTitle ? 'event-title-error' : undefined"
        />
      </ItField>
      <ItField :label="t('generator.fields.location')" html-for="event-location">
        <ItInput
          id="event-location"
          v-model="form.eventLocation"
          :aria-label="t('generator.fields.location')"
          :placeholder="t('generator.placeholders.location')"
        />
      </ItField>
      <div class="payload-grid">
        <ItField
          :label="t('generator.fields.starts')"
          html-for="event-start"
          :error="fieldError('eventStart')"
        >
          <ItInput
            id="event-start"
            v-model="form.eventStart"
            :aria-label="t('generator.fields.starts')"
            type="datetime-local"
            :invalid="Boolean(visibleErrors.eventStart)"
            :describedby="visibleErrors.eventStart ? 'event-start-error' : undefined"
          />
        </ItField>
        <ItField
          :label="t('generator.fields.ends')"
          html-for="event-end"
          :error="fieldError('eventEnd')"
        >
          <ItInput
            id="event-end"
            v-model="form.eventEnd"
            :aria-label="t('generator.fields.ends')"
            type="datetime-local"
            :invalid="Boolean(visibleErrors.eventEnd)"
            :describedby="visibleErrors.eventEnd ? 'event-end-error' : undefined"
          />
        </ItField>
      </div>
      <ItField :label="t('generator.fields.description')" html-for="event-description">
        <ItTextarea
          id="event-description"
          v-model="form.eventDescription"
          :aria-label="t('generator.fields.description')"
          :placeholder="t('generator.placeholders.description')"
        />
      </ItField>
    </template>

    <template v-else-if="type === 'whatsapp'">
      <ItField
        :label="t('generator.fields.phone')"
        html-for="whatsapp-number"
        :error="fieldError('whatsappNumber')"
      >
        <ItInput
          id="whatsapp-number"
          v-model="form.whatsappNumber"
          :aria-label="t('generator.fields.phone')"
          type="tel"
          :placeholder="t('generator.placeholders.phone')"
          :invalid="Boolean(visibleErrors.whatsappNumber)"
          :describedby="visibleErrors.whatsappNumber ? 'whatsapp-number-error' : undefined"
        />
      </ItField>
      <ItField :label="t('generator.fields.message')" html-for="whatsapp-message">
        <ItTextarea
          id="whatsapp-message"
          v-model="form.whatsappMessage"
          :aria-label="t('generator.fields.message')"
          :placeholder="t('generator.placeholders.whatsappMessage')"
        />
      </ItField>
    </template>
  </div>
</template>
