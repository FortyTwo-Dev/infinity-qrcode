<script setup lang="ts">
const model = defineModel();

interface Props {
    id?: string;
    placeholder?: string;
}

defineProps<Props>();

const emits = defineEmits(['change'])

const onChange = (event) => {
    emits('change', event);
}

</script>

<template>
    <select v-model="model" :id="id" class="border border-[#202020] p-2" @change="onChange">
        <option v-if="placeholder" value="" disabled>{{placeholder}}</option>
        <slot></slot>
    </select>
</template>