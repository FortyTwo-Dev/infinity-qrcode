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
        class="w-full not-dark:shadow dark:bg-[#202020] hover:opacity-85 not-dark:hover:shadow-xs p-2 cursor-pointer">
        <p class="text-center font-semibold">{{ text }}</p>
    </button>
</template>