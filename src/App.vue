<script setup lang="ts">
import { ref, watch } from 'vue';
import Theme from './Theme.vue';
import Text from './qrcode/input/Text.vue';
import Url from './qrcode/input/Url.vue';
import Wifi from './qrcode/input/Wifi.vue';
import Email from './qrcode/input/Email.vue';
import QRCode from 'qrcode';
import Prompt from './Prompt.vue';

const text = ref('');
const qrcodeSvg = ref('');
const qrcodeImg = ref('');

type InputType = 'text' | 'url' | 'wi-fi' | 'email';
const inputType = ref<InputType>('text');

type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
const errorCorrectionLevel = ref<ErrorCorrectionLevel>('H');

type FormatType = 'svg' | 'png' | 'webp' | 'jpeg';
const formatType = ref<FormatType>('svg');

const colorDark = ref('#000000');
const colorLight = ref('#ffffff');

const margin = ref<number>(2);
const scale = ref<number>(4);

const width = ref<number>(200);

const url = ref('');
const handleUrlChange = (newUrl) => {text.value = newUrl;};

const handleWifiChange = (newWifi) => {text.value = newWifi;};

const handleEmailChange = (newEmail) => {text.value = newEmail;};

const setInputType = (type: InputType) => { inputType.value = type; text.value = ""; url.value = "";};

async function generateQrCode() {
  const content = text.value || "Easter Egg";
  if (formatType.value !== "svg") {
    try {
      qrcodeImg.value = await QRCode.toDataURL(content, {
        type: `image/${formatType.value}`,
        errorCorrectionLevel: errorCorrectionLevel.value,
        scale: Number(scale.value),
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
        scale: Number(scale.value),
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

watch([text, formatType, errorCorrectionLevel, colorDark, colorLight, margin, scale, width], generateQrCode, { immediate: true });

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
  
          <section class="w-full lg:w-2/10 lg:border-r not-lg:border-t border-[#202020] flex flex-col items-center">
            <h2 class="w-full text-xl font-semibold py-2 lg:border-b border-[#202020] text-center">Usage</h2>
            <ul class="w-full flex flex-col gap-2 overflow-scroll">
  
              <li class="w-full first:pt-2 last:pb-2 px-2">
                <button @click="setInputType('text')" class="w-full not-dark:shadow dark:bg-[#202020] hover:opacity-85 not-dark:hover:shadow-xs p-2 cursor-pointer">
                  <p class="text-center font-semibold">Text</p>
                </button>
              </li>
  
              <li class="w-full first:pt-2 last:pb-2 px-2">
                <button @click="setInputType('url')" class="w-full not-dark:shadow dark:bg-[#202020] hover:opacity-85 not-dark:hover:shadow-xs p-2 cursor-pointer">
                  <p class="text-center font-semibold">URL</p>
                </button>
              </li>
  
              <li class="w-full first:pt-2 last:pb-2 px-2">
                <button @click="setInputType('wi-fi')" class="w-full not-dark:shadow dark:bg-[#202020] hover:opacity-85 not-dark:hover:shadow-xs p-2 cursor-pointer">
                  <p class="text-center font-semibold">Wi-Fi</p>
                </button>
              </li>
  
              <li class="w-full first:pt-2 last:pb-2 px-2">
                <button @click="setInputType('email')" class="w-full not-dark:shadow dark:bg-[#202020] hover:opacity-85 not-dark:hover:shadow-xs p-2 cursor-pointer">
                  <p class="text-center font-semibold">Email</p>
                </button>
              </li>
  
            </ul>
          </section>
  
          <section class="w-full lg:w-5/10 flex flex-col items-center">
  
            <div class="h-full content-center">
              <div class="h-full not-lg:m-4 content-center overflow-hidden">
                <div v-if="formatType === 'svg'" v-html="qrcodeSvg" class="flex not-dark:shadow-lg dark:shadow-white/50"></div>
                <img v-else :src="qrcodeImg" alt="QRCode" class="flex not-dark:shadow-lg dark:shadow-white/50 not-lg:size-48 aspect-square">
              </div>
            </div>
  
            <div class="w-full">
              <div class="border-t border-[#202020] w-full p-3">
    
                <Text v-if="inputType == 'text'" v-model="text" @change="generateQrCode"></Text>
                <Url v-if="inputType == 'url'" v-model="url" @change="handleUrlChange"></Url>
                <Wifi v-if="inputType == 'wi-fi'" @change="handleWifiChange"></Wifi>
                <Email v-if="inputType == 'email'" @change="handleEmailChange"></Email>
    
              </div>
    
              <div class="border-t border-[#202020] w-full p-3">
                <button @click="downloadQRCode" class="w-full not-dark:shadow dark:bg-[#202020] hover:opacity-85 not-dark:hover:shadow-xs p-2 cursor-pointer">
                  <p class="text-center font-semibold">Download</p>
                </button>
              </div>
            </div>
  
          </section>
  
          <section class="h-full w-full lg:w-3/10 lg:border-l not-lg:border-t border-[#202020] flex flex-col items-center">
            <h2 class="w-full text-xl font-semibold py-2 lg:border-b border-[#202020] text-center">Tools</h2>
            <ul class="flex flex-col gap-4 lg:overflow-scroll px-4">
  
              <li class="not-last:border-b-2 border-[#202020] py-2">
                <h3 class=" font-medium mb-1">Format :</h3>
                <div class="w-full flex flex-row flex-wrap gap-2">
  
                  <div class="inline-flex items-center not-dark:shadow not-dark:hover:shadow-xs dark:bg-[#202020] p-2 hover:opacity-85">
                    <label class="relative flex items-center cursor-pointer" for="svg">
                      <input v-model="formatType" name="type" type="radio"
                        class="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-slate-300 checked:border-blue-300 transition-all"
                        id="svg" value="svg" checked>
                      <span
                        class="absolute bg-blue-300 w-3 h-3 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity duration-200 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      </span>
                    </label>
                    <label class="ml-2 cursor-pointer text-sm" for="svg">SVG</label>
                  </div>
  
                  <div class="inline-flex items-center not-dark:shadow not-dark:hover:shadow-xs dark:bg-[#202020] p-2 hover:opacity-85">
                    <label class="relative flex items-center cursor-pointer" for="png">
                      <input v-model="formatType" name="type" type="radio"
                        class="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-slate-300 checked:border-blue-300 transition-all"
                        id="png" value="png">
                      <span
                        class="absolute bg-blue-300 w-3 h-3 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity duration-200 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      </span>
                    </label>
                    <label class="ml-2 cursor-pointer text-sm" for="png">PNG</label>
                  </div>
  
                  <div class="inline-flex items-center not-dark:shadow not-dark:hover:shadow-xs dark:bg-[#202020] p-2 hover:opacity-85">
                    <label class="relative flex items-center cursor-pointer" for="webp">
                      <input v-model="formatType" name="type" type="radio"
                        class="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-slate-300 checked:border-blue-300 transition-all"
                        id="webp" value="webp">
                      <span
                        class="absolute bg-blue-300 w-3 h-3 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity duration-200 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      </span>
                    </label>
                    <label class="ml-2 cursor-pointer text-sm" for="webp">Webp</label>
                  </div>
  
                  <div class="inline-flex items-center not-dark:shadow not-dark:hover:shadow-xs dark:bg-[#202020] p-2 hover:opacity-85">
                    <label class="relative flex items-center cursor-pointer" for="jpeg">
                      <input v-model="formatType" name="type" type="radio"
                        class="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-slate-300 checked:border-blue-300 transition-all"
                        id="jpeg" value="jpeg">
                      <span
                        class="absolute bg-blue-300 w-3 h-3 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity duration-200 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      </span>
                    </label>
                    <label class="ml-2 cursor-pointer text-sm" for="jpeg">JPEG</label>
                  </div>
  
                </div>
              </li>
  
              <li class="not-last:border-b-2 border-[#202020] py-2">
                <h3 class=" font-medium mb-1">Error correction level :</h3>
                <div class="w-full flex flex-row flex-wrap gap-2">
                  <div class="inline-flex items-center not-dark:shadow not-dark:hover:shadow-xs dark:bg-[#202020] p-2 hover:opacity-85">
                    <label class="relative flex items-center cursor-pointer" for="low">
                      <input name="errorCorrectionLevel" v-model="errorCorrectionLevel" type="radio"
                        class="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-slate-300 checked:border-blue-300 transition-all"
                        id="low" value="L">
                      <span
                        class="absolute bg-blue-300 w-3 h-3 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity duration-200 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      </span>
                    </label>
                    <label class="ml-2 cursor-pointer text-sm" for="low">Low</label>
                  </div>
  
                  <div class="inline-flex items-center not-dark:shadow not-dark:hover:shadow-xs dark:bg-[#202020] p-2 hover:opacity-85">
                    <label class="relative flex items-center cursor-pointer" for="medium">
                      <input name="errorCorrectionLevel" v-model="errorCorrectionLevel" type="radio"
                        class="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-slate-300 checked:border-blue-300 transition-all"
                        id="medium" value="M">
                      <span
                        class="absolute bg-blue-300 w-3 h-3 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity duration-200 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      </span>
                    </label>
                    <label class="ml-2 cursor-pointer text-sm" for="medium">Medium</label>
                  </div>
  
                  <div class="inline-flex items-center not-dark:shadow not-dark:hover:shadow-xs dark:bg-[#202020] p-2 hover:opacity-85">
                    <label class="relative flex items-center cursor-pointer" for="quartile">
                      <input name="errorCorrectionLevel" v-model="errorCorrectionLevel" type="radio"
                        class="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-slate-300 checked:border-blue-300 transition-all"
                        id="quartile" value="Q">
                      <span
                        class="absolute bg-blue-300 w-3 h-3 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity duration-200 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      </span>
                    </label>
                    <label class="ml-2 cursor-pointer text-sm" for="quartile">Quartile</label>
                  </div>
  
                  <div class="inline-flex items-center not-dark:shadow not-dark:hover:shadow-xs dark:bg-[#202020] p-2 hover:opacity-85">
                    <label class="relative flex items-center cursor-pointer" for="high">
                      <input name="errorCorrectionLevel" v-model="errorCorrectionLevel" type="radio"
                        class="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-slate-300 checked:border-blue-300 transition-all"
                        id="high" value="H" checked>
                      <span
                        class="absolute bg-blue-300 w-3 h-3 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity duration-200 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      </span>
                    </label>
                    <label class="ml-2 cursor-pointer text-sm" for="high">High</label>
                  </div>
  
                </div>
              </li>
  
              <li class="not-last:border-b-2 border-[#202020] py-2">
                <h3 class=" font-medium mb-1">Color :</h3>
                <div class="w-full flex flex-row gap-2">
                  <div class="inline-flex items-center gap-2 p-2">
                    <label for="light">Light :</label>
                    <input class="border border-blue-300" v-model="colorLight" type="color" name="light" id="light" value="#ffffff">
                  </div>
                  <div class="inline-flex items-center gap-2 p-2">
                    <label for="dark">Dark :</label>
                    <input class="border border-blue-300" v-model="colorDark" type="color" name="dark" id="dark" value="#000000">
                  </div>
                </div>
              </li>
  
              <li class="not-last:border-b-2 border-[#202020] py-2">
                <h3 class=" font-medium mb-1">Margin :</h3>
                <div class="w-full flex flex-row gap-2">
                  <div class="inline-flex items-center gap-2 p-2">
                    <input class="w-2/3 accent-blue-300" v-model="margin" type="range" name="margin" step="1" min="0" max="10">
                    <div class="w-1/3 border border-[#202020] focus-within:border-blue-300 p-1">
                      <input class="w-full outline-none" v-model="margin" type="number" name="margin">
                    </div>
                  </div>
                </div>
              </li>
  
              <li class="not-last:border-b-2 border-[#202020] py-2">
                <h3 class=" font-medium mb-1">Scale :</h3>
                <div class="w-full flex flex-row gap-2">
                  <div class="inline-flex items-center gap-2 p-2">
                    <input class="w-2/3 accent-blue-300" v-model="scale" type="range" name="scale" step="1" min="0" max="10">
                    <div class="w-1/3 border border-[#202020] focus-within:border-blue-300 p-1">
                      <input class="w-full outline-none" v-model="scale" type="number" name="scale">
                    </div>
                  </div>
                </div>
              </li>
  
              <li class="not-last:border-b-2 py-2">
                <h3 class=" font-medium mb-1">Width :</h3>
                <div class="w-full flex flex-row gap-2">
                  <div class="inline-flex items-center gap-2 p-2">
                    <input class="w-2/3 accent-blue-300" v-model="width" type="range" name="width" step="5" min="0" max="500">
                    <div class="w-1/3 border border-[#202020] focus-within:border-blue-300 p-1">
                      <input class="w-full outline-none" v-model="width" type="number" name="width">
                    </div>
                  </div>
                </div>
              </li>
  
            </ul>
          </section>
  
        </div>
  
      </section>
    </main>

    <footer class="not-lg:pb-18 w-full h-full flex items-center justify-center text-center">
      <h4 class="text-lg font-semibold">Infinity QRCode - {{ new Date().getFullYear() }} -  <a href="https://github.com/FortyTwo-Dev/infinity-qrcode" class=" hover:text-blue-300">Github</a></h4>
    </footer>

  </div>
</template>
