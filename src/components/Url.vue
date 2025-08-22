<script setup lang="ts">
import { ref, computed } from 'vue';
import { Input, Select, Option } from '@ui/index';

const url = ref<String>();
const selectedPrefix = ref('https://');
const emits = defineEmits(['change']);

const fullUrl = computed<string>(() => {
  return selectedPrefix.value + url.value;
});

const onInput = () => {
    emits('change', fullUrl.value);
};

const onChange = () => {
    emits('change', fullUrl.value);
};

</script>

<template>
    <div class="w-full flex flex-row gap-2 not-last:mb-2">
        <Select id="protocol" v-model="selectedPrefix" @change="onChange" class="min-w-1/6">
            <Option value="https://" text="https://"></Option>
            <Option value="http://" text="http://"></Option>
        </Select>
        <Input v-model="url" @input="onInput" type="text" placeholder="example.com" class="w-full"/>
    </div>
</template>