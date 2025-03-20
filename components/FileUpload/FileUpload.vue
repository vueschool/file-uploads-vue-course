<script setup lang="ts">
import { ref } from "vue";
import type { FileStatus, UploadResponse } from "./types";
import DropZone from "./DropZone.vue";
import FileList from "./FileList.vue";

interface Props {
  modelValue?: File[];
  multiple?: boolean;
  accept?: string;
  maxSizeMB?: number;
  maxFiles?: number;
  inline?: boolean;
  preview?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  multiple: true,
  accept: "",
  maxSizeMB: 5,
  maxFiles: 10,
  inline: false,
  preview: false,
});

const emit = defineEmits<{
  (e: "update:modelValue", files: File[]): void;
  (e: "error", message: string): void;
  (e: "upload-success", response: UploadResponse): void;
  (e: "upload-error", error: Error): void;
}>();

const hasError = ref(false);
const errorMessage = ref("");
const selectedFiles = ref<FileStatus[]>([]);
let errorTimeout: number | null = null;

// Clear error state
const clearError = () => {
  hasError.value = false;
  errorMessage.value = "";
};

// Set error with auto-clear
const setError = (message: string) => {
  // Clear any existing timeout
  if (errorTimeout) {
    window.clearTimeout(errorTimeout);
  }

  // Set new error
  errorMessage.value = message;
  hasError.value = true;
  emit("error", message);

  // Set timeout to clear error after 3 seconds
  errorTimeout = window.setTimeout(() => {
    clearError();
  }, 3000);
};

// Validate file
const validateFile = (file: File): boolean => {
  // Check file size
  if (file.size > props.maxSizeMB * 1024 * 1024) {
    setError(
      `File ${file.name} is too large. Maximum size is ${props.maxSizeMB}MB`
    );
    return false;
  }

  // Check file type if accept is specified
  if (
    props.accept &&
    !props.accept.split(",").some((type) => {
      if (type.startsWith(".")) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      return file.type.match(new RegExp(type.replace("*", ".*")));
    })
  ) {
    setError(`File ${file.name} is not an accepted file type`);
    return false;
  }

  return true;
};

// Generate preview URL for images
const generatePreview = (file: File): string | undefined => {
  if (file.type.startsWith("image/")) {
    return URL.createObjectURL(file);
  }
  return undefined;
};

// Process files
const processFiles = async (files: File[]) => {
  clearError();

  // Check max files limit
  if (!props.multiple && files.length > 1) {
    setError("Only one file can be uploaded");
    return;
  }

  if (selectedFiles.value.length + files.length > props.maxFiles) {
    setError(`Maximum ${props.maxFiles} files allowed`);
    return;
  }

  // Validate and add files
  const validFiles = files.filter(validateFile);
  if (validFiles.length) {
    // If not multiple, replace existing files
    if (!props.multiple) {
      selectedFiles.value = [];
    }

    const newFileStatuses = validFiles.map((file) => ({
      file,
      status: "pending" as const,
      progress: 0,
      previewUrl: props.preview ? generatePreview(file) : undefined,
    }));

    selectedFiles.value = [...selectedFiles.value, ...newFileStatuses];

    const uploadedFiles = [];
    // Upload each file immediately
    for (const fileStatus of newFileStatuses) {
      const result = await uploadFile(fileStatus);
      if (result) {
        uploadedFiles.push(result);
      }
    }

    emit("update:modelValue", uploadedFiles);
  }
};

// Remove file
const removeFile = (index: number) => {
  const fileStatus = selectedFiles.value[index];
  if (fileStatus.previewUrl) {
    URL.revokeObjectURL(fileStatus.previewUrl);
  }
  selectedFiles.value.splice(index, 1);
  emit(
    "update:modelValue",
    selectedFiles.value.map((fs) => fs.file)
  );
  clearError();
};

// Upload a single file
const uploadFile = async (fileStatus: FileStatus) => {
  const formData = new FormData();
  formData.append("file", fileStatus.file);

  // Update the status in the array
  const index = selectedFiles.value.indexOf(fileStatus);
  if (index !== -1) {
    selectedFiles.value[index] = { ...fileStatus, status: "uploading" };
  }

  try {
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result: UploadResponse = await response.json();
    const uploadedFile = result.files[0];

    // Update the status in the array
    if (index !== -1) {
      selectedFiles.value[index] = {
        ...fileStatus,
        status: "success",
        url: uploadedFile.url,
      };
    }

    emit("upload-success", result);
    return result;
  } catch (error) {
    console.error("Upload error:", error.message);
    // Update the status in the array
    if (index !== -1) {
      selectedFiles.value[index] = {
        ...fileStatus,
        status: "error",
        error: error?.message || "Upload failed",
      };
    }

    setError(fileStatus.error || "Upload failed");
    emit(
      "upload-error",
      error instanceof Error
        ? error
        : new Error(fileStatus.error || "Upload failed")
    );
  }
};
</script>

<template>
  <div class="w-full">
    <DropZone
      :multiple="multiple"
      :accept="accept"
      :max-size-m-b="maxSizeMB"
      :inline="inline"
      :has-error="hasError"
      :selected-count="selectedFiles.length"
      @files-selected="processFiles"
    >
      <template v-if="inline && selectedFiles.length === 1" #selected-file>
        <p class="pl-2 text-gray-500 truncate max-w-[200px]">
          {{ selectedFiles[0].file.name }}
        </p>
      </template>
      <template v-if="inline && selectedFiles.length > 0" #selected-count>
        <div class="flex items-center">
          <button
            v-if="selectedFiles.length === 1"
            class="text-red-500 hover:text-red-700 ml-2"
            @click="removeFile(0)"
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
          <span v-else class="text-sm text-gray-500">
            {{ selectedFiles.length }} files selected
          </span>
        </div>
      </template>
    </DropZone>

    <!-- File List -->
    <FileList
      :files="selectedFiles"
      :preview="preview"
      :inline="inline"
      @remove="removeFile"
    />
  </div>
</template>
