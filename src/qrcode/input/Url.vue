<script setup>
import { ref } from 'vue';

const model = defineModel();
const selectedPrefix = ref('https://');
const emits = defineEmits(['change']);

const addText = () => {
    const fullUrl = selectedPrefix.value + model.value;
    emits('change', fullUrl);
};
</script>

<template>
    <div class="w-full flex flex-row not-last:mb-2">
        <select v-model="selectedPrefix" class="border-y border-l border-[#202020] p-2" @change="addText">
            <option value="http://">http://</option>
            <option value="https://">https://</option>
        </select>
        <div class="w-full h-full border border-[#202020] p-2 focus-within:border-blue-300">
            <input v-model="model" type="text" @input="addText" class="w-full h-full outline-none" />
        </div>
    </div>
</template>