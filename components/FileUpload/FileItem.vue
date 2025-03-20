<script setup lang="ts">
import { computed } from "vue";
import type { FileStatus } from "./types";

interface Props {
  fileStatus: FileStatus;
  preview?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  preview: false,
});

const emit = defineEmits<{
  (e: "remove"): void;
}>();

// Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Get file type icon based on mime type or extension
const fileTypeIcon = computed(() => {
  const fileType = props.fileStatus.file.type || "";
  const extension =
    props.fileStatus.file.name.split(".").pop()?.toLowerCase() || "";

  if (fileType.startsWith("image/")) {
    return "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z";
  } else if (fileType.startsWith("video/")) {
    return "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z";
  } else if (fileType.startsWith("audio/")) {
    return "M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3";
  } else if (["pdf"].includes(extension)) {
    return "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z";
  } else if (["doc", "docx", "txt", "rtf"].includes(extension)) {
    return "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z";
  }

  return "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z";
});
</script>

<template>
  <div
    class="group relative flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm hover:border-gray-200 transition-colors duration-200"
  >
    <!-- View File Overlay -->
    <div class="hidden group-hover:block absolute inset-0 pointer-events-none">
      <div class="absolute inset-0 bg-white/90 rounded-lg" />
      <a
        v-if="fileStatus.status === 'success' && fileStatus.url"
        :href="fileStatus.url"
        target="_blank"
        class="absolute inset-0 flex items-center justify-center text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 pointer-events-auto"
      >
        <span class="flex items-center space-x-2">
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
          <span>View File</span>
        </span>
      </a>
      <div
        v-else-if="fileStatus.status === 'error'"
        class="absolute inset-0 flex items-center justify-center text-xs text-rose-600"
      >
        <div class="max-h-[40px] overflow-y-auto px-2">
          <span class="flex items-center space-x-2">
            <svg
              class="w-3 h-3 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span class="break-words">{{
              fileStatus.error || "Upload failed"
            }}</span>
          </span>
        </div>
      </div>
    </div>

    <div class="flex-1">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3 min-w-0 flex-1">
          <!-- File Preview or Type Icon -->
          <div
            class="w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center"
          >
            <img
              v-if="preview && fileStatus.previewUrl"
              :src="fileStatus.previewUrl"
              :alt="fileStatus.file.name"
              class="w-full h-full object-cover"
            />
            <svg
              v-else
              class="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                :d="fileTypeIcon"
              />
            </svg>
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center space-x-3">
              <span
                class="text-sm font-medium text-gray-700 truncate max-w-[200px]"
                :title="fileStatus.file.name"
                >{{ fileStatus.file.name }}</span
              >
              <span class="text-xs text-gray-400 flex-shrink-0">{{
                formatFileSize(fileStatus.file.size)
              }}</span>
              <span
                v-if="fileStatus.status === 'uploading'"
                class="text-xs text-gray-500 flex items-center flex-shrink-0 bg-gray-50 px-2 py-0.5 rounded-full"
              >
                <svg
                  class="animate-spin h-3 w-3 mr-1"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="3"
                  />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Uploading
              </span>
              <span
                v-if="fileStatus.status === 'success'"
                class="text-xs text-emerald-600 flex items-center flex-shrink-0 bg-emerald-50 px-2 py-0.5 rounded-full"
              >
                <svg
                  class="w-3 h-3 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                Done
              </span>
              <span
                v-if="fileStatus.status === 'error'"
                class="text-xs text-rose-600 flex items-center flex-shrink-0 bg-rose-50 px-2 py-0.5 rounded-full"
                :title="fileStatus.error"
              >
                <svg
                  class="w-3 h-3 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
                Failed
              </span>
            </div>
          </div>
        </div>
        <button
          class="relative z-10 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-50"
          :disabled="fileStatus.status === 'uploading'"
          @click="emit('remove')"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
