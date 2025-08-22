<script setup lang="ts">
const appVersion = __APP_VERSION__;
import QRCode from 'qrcode';

import { ref, watch } from 'vue';

import type { QrcodeType, ErrorCorrectionLevel, FormatType } from '@/types/types';

import { Theme, Text, Url, Wifi, Email, Usage, Prompt, Tools } from '@components/index';
import { Button } from '@ui/index';

const text = ref('');
const qrcodeSvg = ref('');
const qrcodeImg = ref('');

const qrcodeType = ref<QrcodeType>('text');
const errorCorrectionLevel = ref<ErrorCorrectionLevel>('H');
const formatType = ref<FormatType>('svg');

const colorDark = ref<string>('#000000');
const colorLight = ref<string>('#ffffff');

const margin = ref<number>(2);
const width = ref<number>(200);

const handleQrcodeTypeChange = (newQrcodeType) => {qrcodeType.value = newQrcodeType; text.value = "";};

const handleQrcodeOptionsUpdate = (newFormatType: FormatType, newErrorCorrectionLevel: ErrorCorrectionLevel, newColorDark: string, newColorLight: string, newMargin: number, newWidth: number) => {
  formatType.value = newFormatType;
  errorCorrectionLevel.value = newErrorCorrectionLevel;
  colorDark.value = newColorDark;
  colorLight.value = newColorLight;
  margin.value = newMargin;
  width.value = newWidth;
}

const handleTextChange = (newText: string) => {text.value = newText;};
const handleUrlChange = (newUrl: string) => {text.value = newUrl;};
const handleWifiChange = (newWifi: string) => {text.value = newWifi;};
const handleEmailChange = (newEmail: string) => {text.value = newEmail;};


async function generateQrCode() {
  const content = text.value || "Easter Egg";
  if (formatType.value !== "svg") {
    try {
      qrcodeImg.value = await QRCode.toDataURL(content, {
        type: `image/${formatType.value}`,
        errorCorrectionLevel: errorCorrectionLevel.value,
        margin: Number(margin.value),
        width: Number(width.value),
        color: { dark: colorDark.value, light: colorLight.value },
      });
    } catch (err) {
      console.error(err);
    }
  } else {
    try {
      qrcodeSvg.value = await QRCode.toString(content, {
        type: formatType.value,
        errorCorrectionLevel: errorCorrectionLevel.value,
        margin: Number(margin.value),
        width: Number(width.value),
        color: { dark: colorDark.value, light: colorLight.value },
      });
    } catch (err) {
      console.error(err);
    }
  }
};

function downloadQRCode() {
  if (formatType.value === 'svg' && qrcodeSvg.value) {
    const blob = new Blob([qrcodeSvg.value], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qrcode.${formatType.value}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } else if (qrcodeImg.value) {
    const link = document.createElement('a');
    link.href = qrcodeImg.value;
    link.download = `qrcode.${formatType.value}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

watch([text, formatType, errorCorrectionLevel, colorDark, colorLight, margin, width], generateQrCode, { immediate: true });

</script>

<template>
  <div class="w-full h-full flex flex-col gap-18 items-center justify-center">

    <Theme/>
    <Prompt/>

    <section class="flex flex-col gap-2 items-center justify-center px-4 text-center">
      <h1 class=" text-4xl font-semibold">Infinity QRCode</h1>
      <p>Simple, free, open-source QRCode generator.</p>
    </section>

    <main>
      <section class="border border-[#202020] w-full xl:w-7xl lg:w-5xl md:w-3xl lg:h-7/12">
  
        <div class="h-full flex lg:flex-row flex-col">

          <Usage @change="handleQrcodeTypeChange"/>
  
          <section class="w-full lg:w-5/10 flex flex-col items-center">
  
            <div class="h-full content-center">
              <div class="h-full not-lg:m-4 content-center overflow-hidden">
                <div v-if="formatType === 'svg'" v-html="qrcodeSvg" class="flex not-dark:shadow-lg dark:shadow-white/50"></div>
                <img v-else :src="qrcodeImg" alt="QRCode" class="flex not-dark:shadow-lg dark:shadow-white/50 not-lg:size-48 aspect-square">
              </div>
            </div>
  
            <div class="w-full">
              <div class="border-t border-[#202020] w-full p-3">
    
                <Text v-if="qrcodeType == 'text'" @change="handleTextChange"></Text>
                <Url v-if="qrcodeType == 'url'" @change="handleUrlChange"></Url>
                <Wifi v-if="qrcodeType == 'wi-fi'" @change="handleWifiChange"></Wifi>
                <Email v-if="qrcodeType == 'email'" @change="handleEmailChange"></Email>
    
              </div>
    
              <div class="border-t border-[#202020] w-full p-3">
                <Button @click="downloadQRCode" text="Download" />
              </div>
            </div>
  
          </section>

          <Tools @change="handleQrcodeOptionsUpdate"/>
  
        </div>
  
      </section>
    </main>

    <footer class="not-lg:pb-18 w-full h-full flex items-center justify-center text-center">
      <h4 class="text-lg font-semibold">Infinity QRCode - {{ new Date().getFullYear() }} - <a href="https://github.com/FortyTwo-Dev/infinity-qrcode" class=" hover:text-blue-300">Github</a> - V {{ appVersion }}</h4>
    </footer>

  </div>
</template>
