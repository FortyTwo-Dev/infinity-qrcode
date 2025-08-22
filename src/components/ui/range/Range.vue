<script setup lang="ts">
const model = defineModel();

interface Props {
    id?: string;
    name?: string;
    step?: string;
    min?: string;
    max?: string;
}

defineProps<Props>();

</script>

<template>
    <input class="accent-primary" v-model="model" type="range" :name="name" :id="id" :step="step" :min="min"
        :max="max">
</template>