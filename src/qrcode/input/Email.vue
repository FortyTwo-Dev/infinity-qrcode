<script setup>
import { ref } from 'vue';

const mailto = ref('mailto:');
const email = ref('');

const emits = defineEmits(['change'])

const addText = () => {
    const fullEmail = mailto.value + email.value;
    emits('change', fullEmail);
}
</script>
<template>
    <div class="w-full flex flex-row gap-2 not-last:mb-2">
        <label for="text" class="border border-[#202020] p-2">mailto:</label>
        <div class="w-full h-full border border-[#202020] p-2 focus-within:border-blue-300">
            <input v-model="email" type="text" @input="addText" id="text" placeholder="Example text" class="w-full h-full outline-none" />
        </div>
    </div>
</template>