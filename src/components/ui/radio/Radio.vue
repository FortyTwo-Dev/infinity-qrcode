<script setup lang="ts">
const model = defineModel<string>();

interface Props {
    id?: string;
    name?: string;
    value?: string;
    text?: String;
}

defineProps<Props>();

</script>

<template>
    <div class="inline-flex items-center bg-secondary p-2 hover:opacity-85 rounded-sm">
        <label class="relative flex items-center cursor-pointer" :for="id">
            <input v-model="model" :name="name" type="radio"
                class="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-foreground checked:border-primary transition-all"
                :id="id" :value="value" :checked="model === value">
            <span
                class="absolute bg-primary w-3 h-3 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity duration-200 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            </span>
        </label>
        <label class="ml-2 cursor-pointer text-sm" :for="id">{{ text }}</label>
    </div>
</template>