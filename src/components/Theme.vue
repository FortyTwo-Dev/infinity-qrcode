<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Radio } from '@ui/index'
import type { SiteThemeColor } from '@/types/theme-types';

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function setCookie(name: string, value: string, expires: Date, domain: string) {
  document.cookie = `${name}=${value};expires=${expires};domain=.${domain};path=/`;
}

const isDark = ref(false);
const theme = ref<SiteThemeColor>('blue');

const moon = ref<HTMLElement | null>(null);
const sun = ref<HTMLElement | null>(null);

const savedTheme = getCookie('themeColor') as SiteThemeColor | null;
if (savedTheme) theme.value = savedTheme;

const myDate = new Date();
myDate.setMonth(myDate.getMonth() + 12);
const domain = location.hostname.split('.').reverse()[1];
const suffixe = location.hostname.split('.').reverse()[0];
const fullDomain = (domain == undefined ? '' : domain) + suffixe;

onMounted(() => {
  const isDarkModePreferred = localStorage.theme === 'dark' ||
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  isDark.value = isDarkModePreferred;
  updateThemeClass();
});

function updateThemeClass() {
  const prefix = isDark.value ? 'dark-' : 'light-';
  document.documentElement.classList.remove(
    'light-blue', 'light-red', 'light-pink', 'light-yellow',
    'dark-blue', 'dark-red', 'dark-pink', 'dark-yellow'
  );
  document.documentElement.classList.add(`${prefix}${theme.value}`);
  document.documentElement.classList.toggle('dark', isDark.value);
}

const toggleTheme = () => {
  isDark.value = !isDark.value;
  localStorage.theme = isDark.value ? 'dark' : 'light';
  updateThemeClass();
  setCookie('themeColor', theme.value, myDate, fullDomain);
};

const setThemeColor = (color: SiteThemeColor) => {
  theme.value = color;
  updateThemeClass();
  setCookie('themeColor', color, myDate, fullDomain);
};

watch([isDark, theme], () => {
  updateThemeClass();
});

</script>

<template>
  <div id="toggle-theme-button" class="absolute top-0 right-0 mt-6 mr-6 cursor-pointer" @click="toggleTheme">
    <svg id="sun" ref="sun" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="{ hidden: isDark }">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
    <svg id="moon" ref="moon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
      :class="{ hidden: !isDark }">
      <path
        d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
    </svg>
  </div>
  <div id="select-theme-button" class="absolute top-0 right-0 mt-6 mr-18 cursor-pointer"
    onclick="document.getElementById('theme-dialog').classList.toggle('hidden')">
    <svg id="palette" class="stroke-primary" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
      viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
      stroke-linejoin="round">
      <path
        d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z" />
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
    </svg>
  </div>
  <div id="theme-dialog" class="hidden absolute top-0 right-0 mt-18 mr-6 min-h-10 w-full max-w-3xs bg-secondary text-foreground">
    <div class="bg-secondary text-foreground p-2 border border-primary">
      <div class="flex flex-col flex-wrap gap-4">
        <div>
          <h3>Color</h3>
          <div class="w-full flex flex-row flex-wrap gap-2">
            <Radio v-model="theme" id="blue" name="theme" value="blue" text="Blue" @change="setThemeColor('blue')"/>
            <Radio v-model="theme" id="red" name="theme" value="red" text="Red" @change="setThemeColor('red')" />
            <Radio v-model="theme" id="pink" name="theme" value="pink" text="Pink" @change="setThemeColor('pink')" />
            <Radio v-model="theme" id="yellow" name="theme" value="yellow" text="Yellow" @change="setThemeColor('yellow')" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hidden {
  display: none;
}
</style>