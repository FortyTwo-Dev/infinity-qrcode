<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { Field, Input, Option, Select, Textarea } from '@ui/index'
import { buildPayload } from '@/lib/qrcode/payloads'
import { createDefaultFormState, type FormState, type QrcodeType } from '@/types/qr'

const props = defineProps<{ type: QrcodeType; initialText?: string }>()

const emit = defineEmits<{
  'update:payload': [payload: string]
  'update:errors': [errors: Record<string, string>]
}>()

const form = ref<FormState>(createDefaultFormState())

const result = computed(() => buildPayload(props.type, form.value))
const errors = computed(() => result.value.errors)

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
  <div class="flex flex-col gap-3">
    <template v-if="type === 'text'">
      <Field label="Text" html-for="text" :error="errors.text">
        <Input
          id="text"
          v-model="form.text"
          aria-label="Text"
          placeholder="Hello world"
          :invalid="Boolean(errors.text)"
          :describedby="errors.text ? 'text-error' : undefined"
        />
      </Field>
    </template>

    <template v-else-if="type === 'url'">
      <Field label="URL" html-for="url" :error="errors.url">
        <div class="flex gap-2">
          <Select v-model="urlScheme" aria-label="Protocol" class="max-w-32">
            <Option value="https://" text="https://" />
            <Option value="http://" text="http://" />
          </Select>
          <Input
            id="url"
            v-model="form.url"
            aria-label="URL"
            placeholder="example.com"
            :invalid="Boolean(errors.url)"
            :describedby="errors.url ? 'url-error' : undefined"
          />
        </div>
      </Field>
    </template>

    <template v-else-if="type === 'wi-fi'">
      <Field label="Network name (SSID)" html-for="wifi-ssid" :error="errors.wifiSsid">
        <Input
          id="wifi-ssid"
          v-model="form.wifiSsid"
          aria-label="Network name (SSID)"
          placeholder="My network"
          :invalid="Boolean(errors.wifiSsid)"
          :describedby="errors.wifiSsid ? 'wifi-ssid-error' : undefined"
        />
      </Field>
      <Field label="Encryption" html-for="wifi-encryption">
        <Select id="wifi-encryption" v-model="wifiEncryption" aria-label="Encryption">
          <Option value="WPA" text="WPA/WPA2" />
          <Option value="WPA3" text="WPA3" />
          <Option value="WEP" text="WEP" />
          <Option value="nopass" text="No password" />
        </Select>
      </Field>
      <Field
        v-if="form.wifiEncryption !== 'nopass'"
        label="Password"
        html-for="wifi-password"
        :error="errors.wifiPassword"
      >
        <Input
          id="wifi-password"
          v-model="form.wifiPassword"
          aria-label="Password"
          type="text"
          placeholder="Network password"
          :invalid="Boolean(errors.wifiPassword)"
          :describedby="errors.wifiPassword ? 'wifi-password-error' : undefined"
        />
      </Field>
    </template>

    <template v-else-if="type === 'email'">
      <Field label="Email address" html-for="email" :error="errors.email">
        <Input
          id="email"
          v-model="form.email"
          aria-label="Email address"
          type="email"
          placeholder="contact@example.com"
          :invalid="Boolean(errors.email)"
          :describedby="errors.email ? 'email-error' : undefined"
        />
      </Field>
      <Field label="Subject" html-for="email-subject">
        <Input
          id="email-subject"
          v-model="form.emailSubject"
          aria-label="Subject"
          placeholder="Optional subject"
        />
      </Field>
      <Field label="Message" html-for="email-body">
        <Textarea
          id="email-body"
          v-model="form.emailBody"
          aria-label="Message"
          placeholder="Optional message"
        />
      </Field>
    </template>

    <template v-else-if="type === 'vcard'">
      <div class="grid gap-3 sm:grid-cols-2">
        <Field label="First name" html-for="vcard-first" :error="errors.vcardName">
          <Input
            id="vcard-first"
            v-model="form.vcard.firstName"
            aria-label="First name"
            placeholder="Ada"
            :invalid="Boolean(errors.vcardName)"
            :describedby="errors.vcardName ? 'vcard-first-error' : undefined"
          />
        </Field>
        <Field label="Last name" html-for="vcard-last">
          <Input
            id="vcard-last"
            v-model="form.vcard.lastName"
            aria-label="Last name"
            placeholder="Lovelace"
          />
        </Field>
      </div>
      <div class="grid gap-3 sm:grid-cols-2">
        <Field label="Organization" html-for="vcard-org">
          <Input
            id="vcard-org"
            v-model="form.vcard.organization"
            aria-label="Organization"
            placeholder="Company"
          />
        </Field>
        <Field label="Job title" html-for="vcard-title">
          <Input
            id="vcard-title"
            v-model="form.vcard.title"
            aria-label="Job title"
            placeholder="Engineer"
          />
        </Field>
      </div>
      <div class="grid gap-3 sm:grid-cols-2">
        <Field label="Phone" html-for="vcard-phone">
          <Input
            id="vcard-phone"
            v-model="form.vcard.phone"
            aria-label="Phone"
            type="tel"
            placeholder="+1 555 0100"
          />
        </Field>
        <Field label="Email" html-for="vcard-email" :error="errors.vcardEmail">
          <Input
            id="vcard-email"
            v-model="form.vcard.email"
            aria-label="Email"
            type="email"
            placeholder="ada@example.com"
            :invalid="Boolean(errors.vcardEmail)"
            :describedby="errors.vcardEmail ? 'vcard-email-error' : undefined"
          />
        </Field>
      </div>
      <Field label="Website" html-for="vcard-website">
        <Input
          id="vcard-website"
          v-model="form.vcard.website"
          aria-label="Website"
          placeholder="https://example.com"
        />
      </Field>
      <Field label="Address" html-for="vcard-address">
        <Input
          id="vcard-address"
          v-model="form.vcard.address"
          aria-label="Address"
          placeholder="Street, city, country"
        />
      </Field>
    </template>

    <template v-else-if="type === 'sms'">
      <Field label="Phone number" html-for="sms-number" :error="errors.smsNumber">
        <Input
          id="sms-number"
          v-model="form.smsNumber"
          aria-label="Phone number"
          type="tel"
          placeholder="+1 555 0100"
          :invalid="Boolean(errors.smsNumber)"
          :describedby="errors.smsNumber ? 'sms-number-error' : undefined"
        />
      </Field>
      <Field label="Message" html-for="sms-message" :error="errors.smsMessage">
        <Textarea
          id="sms-message"
          v-model="form.smsMessage"
          aria-label="Message"
          placeholder="Message"
          :invalid="Boolean(errors.smsMessage)"
          :describedby="errors.smsMessage ? 'sms-message-error' : undefined"
        />
      </Field>
    </template>

    <template v-else-if="type === 'phone'">
      <Field label="Phone number" html-for="phone" :error="errors.phone">
        <Input
          id="phone"
          v-model="form.phone"
          aria-label="Phone number"
          type="tel"
          placeholder="+1 555 0100"
          :invalid="Boolean(errors.phone)"
          :describedby="errors.phone ? 'phone-error' : undefined"
        />
      </Field>
    </template>

    <template v-else-if="type === 'geo'">
      <div class="grid gap-3 sm:grid-cols-2">
        <Field label="Latitude" html-for="geo-lat" :error="errors.latitude">
          <Input
            id="geo-lat"
            v-model="form.latitude"
            aria-label="Latitude"
            type="number"
            step="any"
            placeholder="48.8566"
            :invalid="Boolean(errors.latitude)"
            :describedby="errors.latitude ? 'geo-lat-error' : undefined"
          />
        </Field>
        <Field label="Longitude" html-for="geo-lng" :error="errors.longitude">
          <Input
            id="geo-lng"
            v-model="form.longitude"
            aria-label="Longitude"
            type="number"
            step="any"
            placeholder="2.3522"
            :invalid="Boolean(errors.longitude)"
            :describedby="errors.longitude ? 'geo-lng-error' : undefined"
          />
        </Field>
      </div>
    </template>

    <template v-else-if="type === 'event'">
      <Field label="Title" html-for="event-title" :error="errors.eventTitle">
        <Input
          id="event-title"
          v-model="form.eventTitle"
          aria-label="Title"
          placeholder="Event title"
          :invalid="Boolean(errors.eventTitle)"
          :describedby="errors.eventTitle ? 'event-title-error' : undefined"
        />
      </Field>
      <Field label="Location" html-for="event-location">
        <Input
          id="event-location"
          v-model="form.eventLocation"
          aria-label="Location"
          placeholder="Optional location"
        />
      </Field>
      <div class="grid gap-3 sm:grid-cols-2">
        <Field label="Starts" html-for="event-start" :error="errors.eventStart">
          <Input
            id="event-start"
            v-model="form.eventStart"
            aria-label="Starts"
            type="datetime-local"
            :invalid="Boolean(errors.eventStart)"
            :describedby="errors.eventStart ? 'event-start-error' : undefined"
          />
        </Field>
        <Field label="Ends" html-for="event-end" :error="errors.eventEnd">
          <Input
            id="event-end"
            v-model="form.eventEnd"
            aria-label="Ends"
            type="datetime-local"
            :invalid="Boolean(errors.eventEnd)"
            :describedby="errors.eventEnd ? 'event-end-error' : undefined"
          />
        </Field>
      </div>
      <Field label="Description" html-for="event-description">
        <Textarea
          id="event-description"
          v-model="form.eventDescription"
          aria-label="Description"
          placeholder="Optional description"
        />
      </Field>
    </template>

    <template v-else-if="type === 'whatsapp'">
      <Field label="Phone number" html-for="whatsapp-number" :error="errors.whatsappNumber">
        <Input
          id="whatsapp-number"
          v-model="form.whatsappNumber"
          aria-label="Phone number"
          type="tel"
          placeholder="+1 555 0100"
          :invalid="Boolean(errors.whatsappNumber)"
          :describedby="errors.whatsappNumber ? 'whatsapp-number-error' : undefined"
        />
      </Field>
      <Field label="Message" html-for="whatsapp-message">
        <Textarea
          id="whatsapp-message"
          v-model="form.whatsappMessage"
          aria-label="Message"
          placeholder="Optional message"
        />
      </Field>
    </template>
  </div>
</template>
