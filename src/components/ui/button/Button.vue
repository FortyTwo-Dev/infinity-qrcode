<script setup lang="ts">

interface Props {
    text?: String
}

defineProps<Props>();

const emits = defineEmits(['click'])

const onClick = (event) => {
    emits('click', event);
}

</script>

<template>
    <button @click="onClick"
        class="w-full bg-secondary hover:opacity-85 p-2 cursor-pointer rounded-sm">
        <p class="text-center font-semibold">{{ text }}</p>
    </button>
</template>