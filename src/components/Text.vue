<script setup lang="ts">
import { ref } from 'vue';
import { Label, Input } from '@ui/index';

const text = ref<String>('');

const emits = defineEmits(['change'])

const onInput = () => {
    emits('change', text.value);
}

</script>
<template>
    <div class="w-full flex flex-row gap-2 not-last:mb-2 text-center">
        <Label id="text" label="Text" class="min-w-1/6" variant="box"/>
        <Input v-model="text" @input="onInput" id="text" type="text" placeholder="Example text" class="w-full"/>
    </div>
</template>