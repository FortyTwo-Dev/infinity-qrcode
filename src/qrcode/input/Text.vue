<script setup>
const model = defineModel();
const emits = defineEmits(['change'])

const addText = (event) => {
    if (event.currentTarget.input) {
        emits('change', event.currentTarget);
    }
}
</script>
<template>
    <div class="w-full flex flex-row gap-2 not-last:mb-2">
        <label for="text" class="border border-[#202020] p-2">Text</label>
        <div class="w-full h-full border border-[#202020] p-2 focus-within:border-blue-300">
            <input v-model="model" type="text" @input="addText" id="text" placeholder="Example text" class="w-full h-full outline-none" />
        </div>
    </div>
</template>