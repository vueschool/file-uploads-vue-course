<script setup lang="ts">
const files = ref<File[]>([]);

const allowedFileTypes = ["image/*", "video/*", ".doc", ".docx"];

const maxMB = 5;
const MAX_FILE_SIZE = maxMB * 1024 * 1024;

function fileIsTooBig(file: File) {
  return file.size > MAX_FILE_SIZE;
}

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
      <input
        type="file"
        :accept="allowedFileTypes.join(',')"
        multiple
        hidden
        @change="handleFileSelect"
      />
      Upload
    </label>
    <p v-for="file in files" :key="file.name">
      {{ file.name }}

      <span v-if="fileIsTooBig(file)" class="text-red-500">
        File must be no larger than {{ maxMB }}
      </span>
    </p>
  </div>
</template>
