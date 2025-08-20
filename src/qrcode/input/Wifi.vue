<script setup>
import { ref } from 'vue';

const ssid = ref('');
const encryptionType = ref('WPA3');
const password = ref('');
const emits = defineEmits(['change'])

const addText = () => {
    const wifi = 'WIFI:S:' + ssid.value + ';T:' + encryptionType.value + ';P:' + password.value + ';;'
    emits('change', wifi);
}
</script>
<template>
    <div class="w-full flex flex-row not-last:mb-2">
        <label for="ssid" class="min-w-1/6 border-y border-l border-[#202020] p-2">WIFI:S:</label>
        <div class="w-full h-full border border-[#202020] p-2 focus-within:border-blue-300">
            <input v-model="ssid" type="text" @input="addText" id="ssid" placeholder="SSID" class="w-full h-full outline-none" />
        </div>
    </div>
    <div class="w-full flex flex-row not-last:mb-2">
        <label for="encryption" class="min-w-1/6 border-y border-l border-[#202020] p-2">T:</label>
        <select v-model="encryptionType" id="encryption" placeholder="Encryption" class="w-full border border-[#202020] focus:border-blue-300 p-2" @change="addText">
            <option value="WPA">WPA/WPA2</option>
            <option value="WPA3">WPA3</option>
            <option value="WEP">WEP</option>
            <option value="nopass">nopass</option>
        </select>
    </div>
    <div class="w-full flex flex-row not-last:mb-2">
        <label for="password" class="min-w-1/6 border-y border-l border-[#202020] p-2">P:</label>
        <div class="w-full h-full border border-[#202020] p-2 focus-within:border-blue-300">
            <input v-model="password" placeholder="Password" type="text" @input="addText" id="password" class="w-full h-full outline-none" />
        </div>
    </div>
</template>