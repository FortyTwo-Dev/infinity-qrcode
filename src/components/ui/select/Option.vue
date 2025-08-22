<script setup lang="ts">
interface Props {
    value?: String;
    text?: String;
}

defineProps<Props>();

</script>

<template>
    <option :value="value">{{ text }}</option>
</template>