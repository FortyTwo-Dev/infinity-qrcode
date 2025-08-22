<script setup lang="ts">
import { ref, computed } from 'vue';
import { Label, Input, Select, Option } from '@ui/index';

const ssid = ref('');
const encryptionType = ref('WPA3');
const password = ref('');

const emits = defineEmits(['change'])

const fullWifi = computed<string>(() => {
  return 'WIFI:S:' + ssid.value + ';T:' + encryptionType.value + ';P:' + password.value + ';;';
});

const onInput = () => {
    emits('change', fullWifi.value);
}

const onChange = () => {
    emits('change', fullWifi.value);
}

</script>
<template>
    <div class="w-full flex flex-row gap-2 not-last:mb-2 text-center">
        <Label id="ssid" label="WIFI:S:" class="min-w-1/6" variant="box"/>
        <Input v-model="ssid" @input="onInput" id="ssid" type="text" placeholder="SSID" class="w-full"/>
    </div>
    <div class="w-full flex flex-row gap-2 not-last:mb-2 text-center">
        <Label id="encryption" label="T:" class="min-w-1/6" variant="box"/>
        <Select v-model="encryptionType" @change="onChange" class="w-full" id="encryption" placeholder="Encryption">
            <Option value="WPA" text="WPA/WPA2"/>
            <Option value="WPA3" text="WPA3"/>
            <Option value="WEP" text="WEP"/>
            <Option value="nopass" text="nopass"/>
        </Select>
    </div>
    <div class="w-full flex flex-row gap-2 not-last:mb-2 text-center">
        <Label id="password" label="P:" class="min-w-1/6" variant="box"/>
        <Input v-model="password" @input="onInput" id="password" type="text" placeholder="Password" class="w-full"/>
    </div>
</template>