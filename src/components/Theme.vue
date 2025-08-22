<script setup>
import { ref, onMounted } from 'vue'

// État réactif pour le thème
const isDark = ref(false)

// Références aux éléments SVG
const moon = ref(null)
const sun = ref(null)

// Fonction pour basculer le thème
const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.theme = isDark.value ? 'dark' : 'light'
}

// Initialise le thème au montage
onMounted(() => {
  // Vérifie le thème enregistré ou les préférences système
  const isDarkModePreferred =
    localStorage.theme === 'dark' ||
    (!('theme' in localStorage) &&
     window.matchMedia('(prefers-color-scheme: dark)').matches)

  isDark.value = isDarkModePreferred
  document.documentElement.classList.toggle('dark', isDark.value)
})
</script>

<template>
  <div
    id="toggle-theme-button"
    class="absolute top-0 right-0 mt-6 mr-6 cursor-pointer"
    @click="toggleTheme"
  >
    <svg
      id="sun"
      ref="sun"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      :class="{ hidden: isDark }"
    >
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
    <svg
      id="moon"
      ref="moon"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      :class="{ hidden: !isDark }"
    >
      <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
    </svg>
  </div>
</template>

<style scoped>
.hidden {
  display: none;
}
</style>