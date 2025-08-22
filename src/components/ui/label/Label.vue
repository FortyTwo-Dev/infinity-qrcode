<script setup lang="ts">

type Variant = 'default' | 'box';

interface Props {
    id?: string;
    label?: String;
    variant?: Variant;
}

defineProps<Props>();

const variantClasses = {
    default: '',
    box: 'border border-secondary p-2 rounded-sm',
};

const getVariantClasses = (variant: Variant) => {
    return variantClasses[variant] || variantClasses.default;
};

</script>

<template>
    <label v-show="label" :for="id" :class="getVariantClasses(variant ?? 'default')">{{ label }}</label>
</template>