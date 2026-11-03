<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { ItField, ItInput, ItOption, ItSelect, ItTextarea } from '@components/theme'
import { buildPayload } from '@/lib/qrcode/payloads'
import { createDefaultFormState, type FormState, type QrcodeType } from '@/types/qr'

const props = defineProps<{ type: QrcodeType; initialText?: string }>()

const emit = defineEmits<{
  'update:payload': [payload: string]
  'update:errors': [errors: Record<string, string>]
}>()

const form = ref<FormState>(createDefaultFormState())
const touched = ref(false)

const result = computed(() => buildPayload(props.type, form.value))
const errors = computed(() => result.value.errors)
const visibleErrors = computed(() => (touched.value ? errors.value : {}))

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
  <div class="flex flex-col gap-3" @input="touched = true" @change="touched = true">
    <template v-if="type === 'text'">
      <ItField label="Text" html-for="text" :error="visibleErrors.text">
        <ItInput
          id="text"
          v-model="form.text"
          aria-label="Text"
          placeholder="Hello world"
          :invalid="Boolean(visibleErrors.text)"
          :describedby="visibleErrors.text ? 'text-error' : undefined"
        />
      </ItField>
    </template>

    <template v-else-if="type === 'url'">
      <ItField label="URL" html-for="url" :error="visibleErrors.url">
        <div class="flex gap-2">
          <ItSelect v-model="urlScheme" aria-label="Protocol" class="max-w-32">
            <ItOption value="https://" text="https://" />
            <ItOption value="http://" text="http://" />
          </ItSelect>
          <ItInput
            id="url"
            v-model="form.url"
            aria-label="URL"
            placeholder="example.com"
            :invalid="Boolean(visibleErrors.url)"
            :describedby="visibleErrors.url ? 'url-error' : undefined"
          />
        </div>
      </ItField>
    </template>

    <template v-else-if="type === 'wi-fi'">
      <ItField label="Network name (SSID)" html-for="wifi-ssid" :error="visibleErrors.wifiSsid">
        <ItInput
          id="wifi-ssid"
          v-model="form.wifiSsid"
          aria-label="Network name (SSID)"
          placeholder="My network"
          :invalid="Boolean(visibleErrors.wifiSsid)"
          :describedby="visibleErrors.wifiSsid ? 'wifi-ssid-error' : undefined"
        />
      </ItField>
      <ItField label="Encryption" html-for="wifi-encryption">
        <ItSelect id="wifi-encryption" v-model="wifiEncryption" aria-label="Encryption">
          <ItOption value="WPA" text="WPA/WPA2" />
          <ItOption value="WPA3" text="WPA3" />
          <ItOption value="WEP" text="WEP" />
          <ItOption value="nopass" text="No password" />
        </ItSelect>
      </ItField>
      <ItField
        v-if="form.wifiEncryption !== 'nopass'"
        label="Password"
        html-for="wifi-password"
        :error="visibleErrors.wifiPassword"
      >
        <ItInput
          id="wifi-password"
          v-model="form.wifiPassword"
          aria-label="Password"
          type="text"
          placeholder="Network password"
          :invalid="Boolean(visibleErrors.wifiPassword)"
          :describedby="visibleErrors.wifiPassword ? 'wifi-password-error' : undefined"
        />
      </ItField>
    </template>

    <template v-else-if="type === 'email'">
      <ItField label="Email address" html-for="email" :error="visibleErrors.email">
        <ItInput
          id="email"
          v-model="form.email"
          aria-label="Email address"
          type="email"
          placeholder="contact@example.com"
          :invalid="Boolean(visibleErrors.email)"
          :describedby="visibleErrors.email ? 'email-error' : undefined"
        />
      </ItField>
      <ItField label="Subject" html-for="email-subject">
        <ItInput
          id="email-subject"
          v-model="form.emailSubject"
          aria-label="Subject"
          placeholder="Optional subject"
        />
      </ItField>
      <ItField label="Message" html-for="email-body">
        <ItTextarea
          id="email-body"
          v-model="form.emailBody"
          aria-label="Message"
          placeholder="Optional message"
        />
      </ItField>
    </template>

    <template v-else-if="type === 'vcard'">
      <div class="grid gap-3 sm:grid-cols-2">
        <ItField label="First name" html-for="vcard-first" :error="visibleErrors.vcardName">
          <ItInput
            id="vcard-first"
            v-model="form.vcard.firstName"
            aria-label="First name"
            placeholder="Ada"
            :invalid="Boolean(visibleErrors.vcardName)"
            :describedby="visibleErrors.vcardName ? 'vcard-first-error' : undefined"
          />
        </ItField>
        <ItField label="Last name" html-for="vcard-last">
          <ItInput
            id="vcard-last"
            v-model="form.vcard.lastName"
            aria-label="Last name"
            placeholder="Lovelace"
          />
        </ItField>
      </div>
      <div class="grid gap-3 sm:grid-cols-2">
        <ItField label="Organization" html-for="vcard-org">
          <ItInput
            id="vcard-org"
            v-model="form.vcard.organization"
            aria-label="Organization"
            placeholder="Company"
          />
        </ItField>
        <ItField label="Job title" html-for="vcard-title">
          <ItInput
            id="vcard-title"
            v-model="form.vcard.title"
            aria-label="Job title"
            placeholder="Engineer"
          />
        </ItField>
      </div>
      <div class="grid gap-3 sm:grid-cols-2">
        <ItField label="Phone" html-for="vcard-phone">
          <ItInput
            id="vcard-phone"
            v-model="form.vcard.phone"
            aria-label="Phone"
            type="tel"
            placeholder="+1 555 0100"
          />
        </ItField>
        <ItField label="Email" html-for="vcard-email" :error="visibleErrors.vcardEmail">
          <ItInput
            id="vcard-email"
            v-model="form.vcard.email"
            aria-label="Email"
            type="email"
            placeholder="ada@example.com"
            :invalid="Boolean(visibleErrors.vcardEmail)"
            :describedby="visibleErrors.vcardEmail ? 'vcard-email-error' : undefined"
          />
        </ItField>
      </div>
      <ItField label="Website" html-for="vcard-website">
        <ItInput
          id="vcard-website"
          v-model="form.vcard.website"
          aria-label="Website"
          placeholder="https://example.com"
        />
      </ItField>
      <ItField label="Address" html-for="vcard-address">
        <ItInput
          id="vcard-address"
          v-model="form.vcard.address"
          aria-label="Address"
          placeholder="Street, city, country"
        />
      </ItField>
    </template>

    <template v-else-if="type === 'sms'">
      <ItField label="Phone number" html-for="sms-number" :error="visibleErrors.smsNumber">
        <ItInput
          id="sms-number"
          v-model="form.smsNumber"
          aria-label="Phone number"
          type="tel"
          placeholder="+1 555 0100"
          :invalid="Boolean(visibleErrors.smsNumber)"
          :describedby="visibleErrors.smsNumber ? 'sms-number-error' : undefined"
        />
      </ItField>
      <ItField label="Message" html-for="sms-message" :error="visibleErrors.smsMessage">
        <ItTextarea
          id="sms-message"
          v-model="form.smsMessage"
          aria-label="Message"
          placeholder="Message"
          :invalid="Boolean(visibleErrors.smsMessage)"
          :describedby="visibleErrors.smsMessage ? 'sms-message-error' : undefined"
        />
      </ItField>
    </template>

    <template v-else-if="type === 'phone'">
      <ItField label="Phone number" html-for="phone" :error="visibleErrors.phone">
        <ItInput
          id="phone"
          v-model="form.phone"
          aria-label="Phone number"
          type="tel"
          placeholder="+1 555 0100"
          :invalid="Boolean(visibleErrors.phone)"
          :describedby="visibleErrors.phone ? 'phone-error' : undefined"
        />
      </ItField>
    </template>

    <template v-else-if="type === 'geo'">
      <div class="grid gap-3 sm:grid-cols-2">
        <ItField label="Latitude" html-for="geo-lat" :error="visibleErrors.latitude">
          <ItInput
            id="geo-lat"
            v-model="form.latitude"
            aria-label="Latitude"
            type="number"
            step="any"
            placeholder="48.8566"
            :invalid="Boolean(visibleErrors.latitude)"
            :describedby="visibleErrors.latitude ? 'geo-lat-error' : undefined"
          />
        </ItField>
        <ItField label="Longitude" html-for="geo-lng" :error="visibleErrors.longitude">
          <ItInput
            id="geo-lng"
            v-model="form.longitude"
            aria-label="Longitude"
            type="number"
            step="any"
            placeholder="2.3522"
            :invalid="Boolean(visibleErrors.longitude)"
            :describedby="visibleErrors.longitude ? 'geo-lng-error' : undefined"
          />
        </ItField>
      </div>
    </template>

    <template v-else-if="type === 'event'">
      <ItField label="Title" html-for="event-title" :error="visibleErrors.eventTitle">
        <ItInput
          id="event-title"
          v-model="form.eventTitle"
          aria-label="Title"
          placeholder="Event title"
          :invalid="Boolean(visibleErrors.eventTitle)"
          :describedby="visibleErrors.eventTitle ? 'event-title-error' : undefined"
        />
      </ItField>
      <ItField label="Location" html-for="event-location">
        <ItInput
          id="event-location"
          v-model="form.eventLocation"
          aria-label="Location"
          placeholder="Optional location"
        />
      </ItField>
      <div class="grid gap-3 sm:grid-cols-2">
        <ItField label="Starts" html-for="event-start" :error="visibleErrors.eventStart">
          <ItInput
            id="event-start"
            v-model="form.eventStart"
            aria-label="Starts"
            type="datetime-local"
            :invalid="Boolean(visibleErrors.eventStart)"
            :describedby="visibleErrors.eventStart ? 'event-start-error' : undefined"
          />
        </ItField>
        <ItField label="Ends" html-for="event-end" :error="visibleErrors.eventEnd">
          <ItInput
            id="event-end"
            v-model="form.eventEnd"
            aria-label="Ends"
            type="datetime-local"
            :invalid="Boolean(visibleErrors.eventEnd)"
            :describedby="visibleErrors.eventEnd ? 'event-end-error' : undefined"
          />
        </ItField>
      </div>
      <ItField label="Description" html-for="event-description">
        <ItTextarea
          id="event-description"
          v-model="form.eventDescription"
          aria-label="Description"
          placeholder="Optional description"
        />
      </ItField>
    </template>

    <template v-else-if="type === 'whatsapp'">
      <ItField
        label="Phone number"
        html-for="whatsapp-number"
        :error="visibleErrors.whatsappNumber"
      >
        <ItInput
          id="whatsapp-number"
          v-model="form.whatsappNumber"
          aria-label="Phone number"
          type="tel"
          placeholder="+1 555 0100"
          :invalid="Boolean(visibleErrors.whatsappNumber)"
          :describedby="visibleErrors.whatsappNumber ? 'whatsapp-number-error' : undefined"
        />
      </ItField>
      <ItField label="Message" html-for="whatsapp-message">
        <ItTextarea
          id="whatsapp-message"
          v-model="form.whatsappMessage"
          aria-label="Message"
          placeholder="Optional message"
        />
      </ItField>
    </template>
  </div>
</template>
