<script setup lang="ts">
const model = defineModel();

type InputType = 'text' | 'number';

interface Props {
    id?: string;
    placeholder?: string;
    type?: InputType;
}

defineProps<Props>();

const emits = defineEmits(['input'])

const onInput = (event) => {
    emits('input', event);
}

</script>

<template>
    <div class="h-full border border-[#202020] p-2 focus-within:border-blue-300">
        <input v-model="model" :type="type" @input="onInput" :id="id" :placeholder="placeholder" class="w-full h-full outline-none"/>
    </div>
</template>