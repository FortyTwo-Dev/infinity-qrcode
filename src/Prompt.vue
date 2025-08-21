<script setup>
import { useRegisterSW } from 'virtual:pwa-register/vue'

const {
  offlineReady,
  needRefresh,
  updateServiceWorker,
} = useRegisterSW()

async function close() {
  offlineReady.value = false
  needRefresh.value = false
}
</script>

<template>
  <div
    v-if="offlineReady || needRefresh"
    class="fixed right-0 bottom-0 m-4 p-3 border border-[#202020] z-10 text-left bg-[#fbfbfe] dark:bg-[#121212]" role="alert">
    <div class="mb-2">
      <span v-if="offlineReady">
        App ready to work offline
      </span>
      <span v-else>
        New content available, click on reload button to update.
      </span>
    </div>
    <button class="border border-[#202020] mr-1 outline-none py-1 px-2.5" v-if="needRefresh" @click="updateServiceWorker()">
      Reload
    </button>
    <button class="border border-[#202020] mr-1 outline-none py-1 px-2.5" @click="close">
      Close
    </button>
  </div>
</template>