<script setup lang="ts">
import { ref, computed } from "vue";

interface Props {
  multiple?: boolean;
  accept?: string;
  maxSizeMB?: number;
  inline?: boolean;
  hasError?: boolean;
  selectedCount?: number;
}

const props = withDefaults(defineProps<Props>(), {
  multiple: true,
  accept: "",
  maxSizeMB: 5,
  inline: false,
  hasError: false,
  selectedCount: 0,
});

const emit = defineEmits<{
  (e: "files-selected", files: File[]): void;
}>();

const isDragging = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

// Computed property for accepted file types display
const acceptedFileTypes = computed(() => {
  if (!props.accept) return "All files";
  return props.accept.split(",").join(", ");
});

// Handle file selection
const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;
  emit("files-selected", Array.from(input.files));
};

// Handle drop
const handleDrop = (event: DragEvent) => {
  isDragging.value = false;
  const droppedFiles = Array.from(event.dataTransfer?.files || []);
  emit("files-selected", droppedFiles);
};
</script>

<template>
  <div
    class="relative border-2 rounded"
    :class="[
      inline ? 'border-solid p-2' : 'border-dashed p-4 rounded-lg',
      isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300',
      hasError ? 'border-red-500' : '',
    ]"
    @dragenter.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @dragover.prevent
    @drop.prevent="handleDrop"
  >
    <!-- Upload Icon and Text -->
    <div :class="{ 'text-center': !inline, 'flex items-center': inline }">
      <svg
        v-if="!inline"
        class="mx-auto h-12 w-12 text-gray-400"
        stroke="currentColor"
        fill="none"
        viewBox="0 0 48 48"
        aria-hidden="true"
      >
        <path
          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <div
        :class="[
          inline ? 'flex-1' : 'mt-4',
          inline ? 'flex justify-between items-center' : '',
        ]"
      >
        <div
          :class="[
            !inline
              ? 'flex justify-center text-sm text-gray-600'
              : 'flex items-center text-sm text-gray-600',
          ]"
        >
          <label
            class="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500"
          >
            <span>{{
              inline
                ? selectedCount
                  ? "Change file"
                  : "Choose file"
                : "Upload files"
            }}</span>
            <input
              ref="fileInput"
              type="file"
              class="sr-only"
              :multiple="multiple"
              :accept="accept"
              @change="handleFileSelect"
            />
          </label>
          <p v-if="!inline" class="pl-1">or drag and drop</p>
          <slot name="selected-file" />
        </div>
        <p v-if="!inline" class="text-xs text-gray-500 mt-2 text-center">
          {{ acceptedFileTypes }} up to {{ maxSizeMB }}MB
        </p>
        <slot name="selected-count" />
      </div>
    </div>
  </div>
</template>
