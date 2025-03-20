<script setup lang="ts">
import type { FileStatus } from "@/types";
import FileItem from "./FileItem.vue";

interface Props {
  files: FileStatus[];
  preview?: boolean;
  inline?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  preview: false,
  inline: false,
});

const emit = defineEmits<{
  (e: "remove", index: number): void;
}>();
</script>

<template>
  <div v-if="files.length > 0 && (!inline || files.length > 1)" class="mt-4">
    <ul class="space-y-2">
      <li v-for="(fileStatus, index) in files" :key="index">
        <FileItem
          :file-status="fileStatus"
          :preview="preview"
          @remove="emit('remove', index)"
        />
      </li>
    </ul>
  </div>
</template>
