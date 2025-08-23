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
                <Button v-if="qrcodeType == 'text'" text="Text" variant="secondarySelectPrimary"/>
                <Button v-else @click="setQrcodeType('text')" text="Text" variant="secondary"/>
            </li>

            <li class="w-full first:pt-2 last:pb-2 px-2">
                <Button v-if="qrcodeType == 'url'" text="URL" variant="secondarySelectPrimary"/>
                <Button v-else @click="setQrcodeType('url')" text="URL" variant="secondary"/>
            </li>

            <li class="w-full first:pt-2 last:pb-2 px-2">
                <Button v-if="qrcodeType == 'wi-fi'" text="Wi-Fi" variant="secondarySelectPrimary"/>
                <Button v-else @click="setQrcodeType('wi-fi')" text="Wi-Fi" variant="secondary"/>
            </li>

            <li class="w-full first:pt-2 last:pb-2 px-2">
                <Button v-if="qrcodeType == 'email'" text="Email" variant="secondarySelectPrimary"/>
                <Button v-else @click="setQrcodeType('email')" text="Email" variant="secondary"/>
            </li>

        </ul>
    </section>

</template>