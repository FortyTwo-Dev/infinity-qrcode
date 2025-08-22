<script setup lang="ts">
import { ref } from 'vue';
import Button from './ui/button/Button.vue';
import type { QrcodeType } from '@/types/types';

const qrcodeType = ref<QrcodeType>('text');

const emits = defineEmits(['change'])

const setQrcodeType = (type: QrcodeType) => { qrcodeType.value = type; emits('change', qrcodeType.value);};

</script>

<template>

    <section class="w-full lg:w-2/10 lg:border-r not-lg:border-t border-secondary flex flex-col items-center">
        <h2 class="w-full text-xl font-semibold py-2 lg:border-b border-secondary text-center">Usage</h2>
        <ul class="w-full flex flex-col gap-2 overflow-scroll">

            <li class="w-full first:pt-2 last:pb-2 px-2">
                <Button @click="setQrcodeType('text')" text="Text" />
            </li>

            <li class="w-full first:pt-2 last:pb-2 px-2">
                <Button @click="setQrcodeType('url')" text="URL" />
            </li>

            <li class="w-full first:pt-2 last:pb-2 px-2">
                <Button @click="setQrcodeType('wi-fi')" text="Wi-Fi" />
            </li>

            <li class="w-full first:pt-2 last:pb-2 px-2">
                <Button @click="setQrcodeType('email')" text="Email" />
            </li>

        </ul>
    </section>

</template>