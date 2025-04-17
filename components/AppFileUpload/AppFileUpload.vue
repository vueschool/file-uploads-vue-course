<script setup lang="ts">
import attrAccept from "attr-accept";

const files = ref<File[]>([]);
const isDragging = ref(false);

const props = withDefaults(
  defineProps<{
    accept?: string[];
    maxMb?: number;
    multiple?: boolean;
  }>(),
  {
    accept: () => ["image/*", "video/*", ".doc", ".docx"],
    maxMb: 5,
    multiple: false,
  }
);

const emit = defineEmits<{
  "uploaded:files": [files: { filename: string; url: string }[]];
}>();

function fileIsTooBig(file: File) {
  return file.size > props.maxMb * 1024 * 1024;
}

async function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement;
  const filesAsArray = Array.from(input?.files || []); //FileList

  const formData = new FormData();
  filesAsArray.map((file) => {
    if (attrAccept(file, props.accept) && !fileIsTooBig(file)) {
      formData.append(file.name, file);
    }
  });

  if (Array.from(formData.values()).length) {
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = (await response.json()) as {
      files: { filename: string; url: string }[];
    };
    emit("uploaded:files", data.files);
  }

  if (props.multiple) {
    files.value = files.value.concat(filesAsArray);
  } else {
    files.value = filesAsArray;
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  else return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

type Preview = { type: string; url: string } | null;
const previews = computed<Preview[]>((oldPreviews) => {
  // cleanup old previews
  if (oldPreviews) {
    oldPreviews.map((oldPreview) => {
      if (oldPreview?.url) {
        URL.revokeObjectURL(oldPreview.url);
      }
    });
  }
  return files.value.map((file) => {
    if (file.type.startsWith("image")) {
      return {
        type: "image",
        url: URL.createObjectURL(file),
      };
    } else if (file.type.startsWith("video")) {
      return {
        type: "video",
        url: URL.createObjectURL(file),
      };
    } else {
      return null;
    }
  });
});

// cleanup
onUnmounted(() => {
  previews.value.forEach((preview) => {
    if (preview?.url) {
      URL.revokeObjectURL(preview.url);
    }
  });
});
</script>
<template>
  <div class="w-full">
    <div
      class="border border-gray-300 border-dashed rounded-lg p-8 text-center"
      :class="{ 'border-blue-500 bg-blue-50': isDragging }"
      @dragenter="isDragging = true"
      @dragover="isDragging = true"
      @dragleave="isDragging = false"
      @drop="isDragging = false"
    >
      <input
        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        type="file"
        :accept="accept.join(',')"
        :multiple="multiple"
        @change="handleFileSelect"
      />
      <div class="flex flex-col items-center">
        <!-- Upload icon -->
        <svg
          class="w-12 h-12 text-gray-400 mb-3"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M48 42.6667V50.6667C48 51.7275 47.5786 52.7449 46.8284 53.4951C46.0783 54.2452 45.0609 54.6667 44 54.6667H20C18.9391 54.6667 17.9217 54.2452 17.1716 53.4951C16.4214 52.7449 16 51.7275 16 50.6667V42.6667"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M40 26.6667L32 18.6667L24 26.6667"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M32 18.6667V42.6667"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>

        <p class="text-lg">
          <span class="text-blue-500 font-medium">Upload files</span> or drag
          and drop
        </p>
        <p class="text-gray-500 text-sm mt-1">All files up to {{ maxMb }}MB</p>
      </div>
    </div>

    <!-- File list -->
    <div class="mt-5 space-y-3">
      <div
        v-for="(file, index) in files"
        :key="file.name"
        class="flex items-center bg-white rounded-lg shadow-sm border border-gray-100 p-3"
      >
        <!-- Thumbnail -->
        <div
          class="w-12 h-12 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 mr-3"
        >
          <img
            v-if="previews[index]?.type === 'image'"
            :src="previews[index].url"
            :alt="file.name"
            class="w-full h-full object-cover"
          />
          <video
            v-else-if="previews[index]?.type === 'video'"
            :src="previews[index].url"
            class="w-full h-full object-cover"
          ></video>
          <div v-else class="w-full h-full flex items-center justify-center">
            <svg
              class="w-6 h-6 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        </div>

        <!-- File details -->
        <div class="flex-grow">
          <div class="text-sm font-medium">{{ file.name }}</div>
          <div class="text-xs text-gray-500">
            {{ formatFileSize(file.size) }}
          </div>
        </div>

        <!-- Status indicator -->
        <div class="flex items-center">
          <span
            v-if="attrAccept(file, accept) && !fileIsTooBig(file)"
            class="text-sm text-green-600 bg-green-50 rounded-full px-3 py-0.5 flex items-center"
          >
            <svg
              class="w-4 h-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            Done
          </span>
          <span
            v-else
            class="text-sm text-red-600 bg-red-50 rounded-full px-3 py-0.5"
          >
            Error
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
