<script setup lang="ts">
import { ref, computed } from 'vue';
import { Label, Input } from '@ui/index';

const mailto = ref('mailto:');
const email = ref('');

const emits = defineEmits(['change'])

const fullEmail = computed<string>(() => {
  return mailto.value + email.value;
});

const onInput = () => {
    emits('change', fullEmail.value);
}

</script>
<template>
    <div class="w-full flex flex-row gap-2 not-last:mb-2 text-center">
        <Label id="email" label="mailto:" class="min-w-1/6" variant="box"/>
        <Input v-model="email" @input="onInput" id="email" type="text" placeholder="email@example.com" class="w-full"/>
    </div>
</template>