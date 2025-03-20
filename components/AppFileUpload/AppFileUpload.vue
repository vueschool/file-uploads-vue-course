<script setup lang="ts">
const files = ref<File[]>([]);
function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement;
  const filesAsArray = Array.from(input?.files || []); //FileList
  console.log(filesAsArray);
  files.value = files.value.concat(filesAsArray);
}
</script>
<template>
  <div>
    <label
      class="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700"
    >
      <input type="file" multiple hidden @change="handleFileSelect" />
      Upload
    </label>
    <p v-for="file in files" :key="file.name">
      {{ file.name }}
    </p>
  </div>
</template>
