<script setup lang="ts">

type Variant = 'primary' | 'secondary' | 'secondarySelectPrimary';


interface Props {
    text?: String
    variant?: Variant;
}

defineProps<Props>();

const emits = defineEmits(['click'])

const onClick = (event) => {
    emits('click', event);
}

const variantClasses = {
    primary: 'w-full bg-primary text-primary-foreground hover:opacity-85 p-2 cursor-pointer rounded-sm border-transparent',
    secondary: 'w-full bg-secondary hover:opacity-85 p-2 cursor-pointer rounded-sm border border-transparent',
    secondarySelectPrimary: 'w-full bg-secondary hover:opacity-85 p-2 cursor-pointer rounded-sm border border-primary',
};

const getVariantClasses = (variant: Variant) => {
    return variantClasses[variant] || variantClasses.primary;
};

</script>

<template>
    <button @click="onClick"
        :class="getVariantClasses(variant ?? 'primary')">
        <p class="text-center font-semibold">{{ text }}</p>
    </button>
</template>