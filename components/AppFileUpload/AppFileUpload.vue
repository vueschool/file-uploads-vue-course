<script setup>
function handleFileSelect(e) {
  console.log(e);
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
  </div>
</template>
