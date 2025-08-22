<script setup lang="ts">
import { ref, watch } from 'vue';

import { Radio, Label, Range, Input } from '@ui/index';
import type { ErrorCorrectionLevel, FormatType } from '@/types/types';

const formatType = ref<FormatType>('svg');
const errorCorrectionLevel = ref<ErrorCorrectionLevel>('H');

const colorDark = ref('#000000');
const colorLight = ref('#ffffff');

const margin = ref<number>(2);
const width = ref<number>(200);

const emits = defineEmits(['change'])

const updateQrcodeOptions = () => { 
    emits('change', formatType.value, errorCorrectionLevel.value, colorDark.value, colorLight.value, margin.value, width.value);
};

watch([formatType, errorCorrectionLevel, colorDark, colorLight, margin, width], updateQrcodeOptions, { immediate: true });

</script>

<template>
    <section class="h-full w-full lg:w-3/10 lg:border-l not-lg:border-t border-[#202020] flex flex-col items-center">
        <h2 class="w-full text-xl font-semibold py-2 lg:border-b border-[#202020] text-center">Tools</h2>
        <ul class="flex flex-col gap-4 lg:overflow-scroll px-4">

            <li class="not-last:border-b-2 border-[#202020] py-2">
                <h3 class=" font-medium mb-1">Format</h3>
                <div class="w-full flex flex-row flex-wrap gap-2">

                    <Radio v-model="formatType" id="svg" name="svg" value="svg" text="SVG" />
                    <Radio v-model="formatType" id="png" name="png" value="png" text="PNG" />
                    <Radio v-model="formatType" id="webp" name="webp" value="webp" text="Webp" />
                    <Radio v-model="formatType" id="jpeg" name="jpeg" value="jpeg" text="JPEG" />

                </div>
            </li>

            <li class="not-last:border-b-2 border-[#202020] py-2">
                <h3 class=" font-medium mb-1">Error correction level</h3>
                <div class="w-full flex flex-row flex-wrap gap-2">

                    <Radio v-model="errorCorrectionLevel" id="low" name="low" value="L" text="Low" />
                    <Radio v-model="errorCorrectionLevel" id="medium" name="medium" value="M" text="Medium" />
                    <Radio v-model="errorCorrectionLevel" id="quartile" name="quartile" value="Q" text="Quartile" />
                    <Radio v-model="errorCorrectionLevel" id="high" name="high" value="H" text="High" />

                </div>
            </li>

            <li class="not-last:border-b-2 border-[#202020] py-2">
                <h3 class=" font-medium mb-1">Color</h3>
                <div class="w-full flex flex-row gap-2">
                    <div class="inline-flex items-center gap-2 p-2">
                        <Label id="light" label="Light :" />
                        <input class="border border-blue-300" v-model="colorLight" type="color" name="light" id="light"
                            value="#ffffff">
                    </div>
                    <div class="inline-flex items-center gap-2 p-2">
                        <Label id="dark" label="Dark :" />
                        <input class="border border-blue-300" v-model="colorDark" type="color" name="dark" id="dark"
                            value="#000000">
                    </div>
                </div>
            </li>

            <li class="not-last:border-b-2 border-[#202020] py-2">
                <h3 class=" font-medium mb-1">Margin</h3>
                <div class="w-full flex flex-row gap-2">
                    <div class="inline-flex items-center gap-2 p-2">
                        <Label id="margin" label="Pixel" />
                        <Range class="w-2/3" v-model="margin" type="range" name="margin" id="margin" step="1" min="0"
                            max="10" />
                        <Input class="w-1/3" v-model="margin" type="number" name="margin" id="margin" />
                    </div>
                </div>
            </li>

            <li class="not-last:border-b-2 py-2">
                <h3 class=" font-medium mb-1">Width</h3>
                <div class="w-full flex flex-row gap-2">
                    <div class="inline-flex items-center gap-2 p-2">
                        <Label id="width" label="Pixel" />
                        <Range class="w-2/3" v-model="width" type="range" name="width" id="width" step="4" min="0"
                            max="512" />
                        <Input class="w-1/3" v-model="width" type="number" name="width" id="width" />
                    </div>
                </div>
            </li>

        </ul>
    </section>
</template>