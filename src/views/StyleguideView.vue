<script setup lang="ts">
import { ref } from 'vue'

import {
  ItButton,
  ItCheckbox,
  ItField,
  ItInput,
  ItRadio,
  ItSelect,
  ItTextarea,
} from '@components/theme'

const theme = ref('dark')
const accent = ref('blue')

const name = ref('')
const email = ref('')
const bio = ref('')
const plan = ref('pro')
const contact = ref('email')
const channel = ref('email')
const agree = ref(false)
const newsletter = ref(true)

const CHANNELS = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'sms', label: 'SMS' },
  { value: 'chat', label: 'Chat' },
]
</script>

<template>
  <div class="it-theme styleguide" :data-theme="theme" :data-accent="accent">
    <div class="container">
      <header class="header">
        <div>
          <h1>Infinity Theme</h1>
          <p class="it-lead">Base HTML, design tokens and <code>it-*</code> variants.</p>
        </div>

        <div class="controls">
          <label for="sg-theme-mode">
            Mode
            <select id="sg-theme-mode" v-model="theme" class="it-select it-select-sm">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
          <label for="sg-theme-accent">
            Accent
            <select id="sg-theme-accent" v-model="accent" class="it-select it-select-sm">
              <option value="blue">Blue</option>
              <option value="red">Red</option>
              <option value="pink">Pink</option>
              <option value="yellow">Yellow</option>
            </select>
          </label>
        </div>
      </header>

      <section class="section" aria-labelledby="typography-title">
        <h2 id="typography-title">Typography</h2>
        <h1>Heading 1</h1>
        <h2>Heading 2</h2>
        <h3>Heading 3</h3>
        <p>
          A paragraph with <strong>strong text</strong>, <em>emphasis</em>,
          <a href="#typography-title">a link</a>, <code>inline code</code> and
          <mark>highlighted text</mark>.
        </p>
        <p class="it-muted">A muted paragraph for secondary information.</p>
        <blockquote>
          A blockquote uses the accent colour on its border and a muted text colour.
        </blockquote>
        <pre><code>const theme = 'dark'
const accent = 'blue'</code></pre>
        <ul>
          <li>First item</li>
          <li>Second item</li>
          <li>Third item</li>
        </ul>
        <hr />
        <table>
          <thead>
            <tr>
              <th>Token</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>--it-accent</code></td>
              <td>oklch(62% 0.19 260)</td>
            </tr>
            <tr>
              <td><code>--it-radius</code></td>
              <td>0px</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="section" aria-labelledby="buttons-title">
        <h2 id="buttons-title">Buttons</h2>
        <div class="row">
          <button>Default</button>
          <button class="it-btn-primary">Primary</button>
          <button class="it-btn-secondary">Secondary</button>
          <button class="it-btn-ghost">Ghost</button>
          <button class="it-btn-danger">Danger</button>
          <button class="it-btn-link">Link</button>
          <button disabled>Disabled</button>
        </div>
        <div class="row">
          <button class="it-btn-primary it-btn-sm">Small</button>
          <button class="it-btn-primary it-btn-md">Medium</button>
          <button class="it-btn-primary it-btn-lg">Large</button>
        </div>
        <div class="row">
          <ItButton variant="primary">ItButton primary</ItButton>
          <ItButton variant="secondary" size="lg">ItButton large</ItButton>
          <ItButton variant="danger" :loading="true">Loading</ItButton>
        </div>
      </section>

      <section class="section" aria-labelledby="navigation-title">
        <h2 id="navigation-title">Navigation</h2>
        <nav class="row" aria-label="Example navigation">
          <a href="#" class="it-nav-link" aria-current="page">Generate</a>
          <a href="#" class="it-nav-link">Learn</a>
          <a href="#" class="it-nav-link">Theme</a>
        </nav>
      </section>

      <section class="section" aria-labelledby="forms-title">
        <h2 id="forms-title">Forms</h2>

        <div class="grid">
          <div class="card">
            <h3>Bare HTML</h3>
            <label for="sg-bare-name">
              Name
              <input id="sg-bare-name" placeholder="Ada Lovelace" />
            </label>
            <label for="sg-bare-message">
              Message
              <textarea id="sg-bare-message" placeholder="A short message"></textarea>
            </label>
            <label for="sg-bare-plan">
              Plan
              <select id="sg-bare-plan">
                <option>Free</option>
                <option>Pro</option>
              </select>
            </label>
            <label class="it-check" for="sg-bare-agree">
              <input id="sg-bare-agree" v-model="agree" type="checkbox" />
              I agree
            </label>
          </div>

          <div class="card">
            <h3>Vue wrappers</h3>
            <ItField label="Name" html-for="sg-name" hint="Your public display name.">
              <ItInput id="sg-name" v-model="name" placeholder="Ada Lovelace" />
            </ItField>
            <ItField label="Email" html-for="sg-email" error="Enter a valid email address.">
              <ItInput
                id="sg-email"
                v-model="email"
                type="email"
                placeholder="ada@example.com"
                invalid
                describedby="sg-email-error"
              />
            </ItField>
            <ItField label="Plan" html-for="sg-plan">
              <ItSelect id="sg-plan" v-model="plan">
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="team">Team</option>
              </ItSelect>
            </ItField>
            <ItField label="Bio" html-for="sg-bio" hint="A few sentences.">
              <ItTextarea id="sg-bio" v-model="bio" />
            </ItField>
          </div>
        </div>

        <fieldset>
          <legend>Preferences</legend>
          <div class="row">
            <ItCheckbox v-model="newsletter" label="Newsletter" />
            <ItRadio v-model="contact" name="contact" value="email" label="Email" />
            <ItRadio v-model="contact" name="contact" value="phone" label="Phone" />
          </div>
        </fieldset>

        <fieldset class="it-fieldset-plain">
          <legend>Choice group</legend>
          <div class="it-choice-group it-choice-group-4">
            <label
              v-for="item in CHANNELS"
              :key="item.value"
              :for="`sg-channel-${item.value}`"
              class="it-choice"
            >
              <input
                :id="`sg-channel-${item.value}`"
                v-model="channel"
                type="radio"
                name="sg-channel"
                :value="item.value"
              />
              <span>{{ item.label }}</span>
            </label>
          </div>
        </fieldset>
      </section>

      <section class="section" aria-labelledby="media-title">
        <h2 id="media-title">Media</h2>
        <div class="row">
          <img
            src="/img/qrcode.png"
            alt="QR code"
            class="it-img it-img-round"
            width="96"
            height="96"
          />
          <img src="/img/qrcode.png" alt="" class="it-img it-img-cover" width="160" height="96" />
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.styleguide {
  min-height: 100vh;
  padding: var(--it-space-6);
}

.container {
  display: grid;
  gap: var(--it-space-7);
  max-width: 72rem;
  margin: 0 auto;
}

.header {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  justify-content: space-between;
  gap: var(--it-space-4);
  border-bottom: 1px solid var(--it-border);
  padding-bottom: var(--it-space-4);
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: var(--it-space-4);
}

.section {
  display: grid;
  gap: var(--it-space-4);
}

.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--it-space-3);
}

.grid {
  display: grid;
  gap: var(--it-space-4);
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
}

.card {
  display: grid;
  gap: var(--it-space-3);
  border: 1px solid var(--it-border);
  border-radius: var(--it-radius);
  background: var(--it-surface);
  color: var(--it-surface-fg);
  padding: var(--it-space-4);
}
</style>
