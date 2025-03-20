<script setup>
const files = ref([]);
</script>

<template>
  <div class="max-w-md mx-auto flex justify-center items-center h-screen">
    <div class="w-full">
      <FileUpload v-model="files" preview class="w-full" />
    </div>
  </div>
</template>
