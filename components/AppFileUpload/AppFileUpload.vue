<script setup lang="ts">
const files = ref<File[]>([]);

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
    formData.append(file.name, file);
  });

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = (await response.json()) as {
    files: { filename: string; url: string }[];
  };
  emit("uploaded:files", data.files);

  if (props.multiple) {
    files.value = files.value.concat(filesAsArray);
  } else {
    files.value = filesAsArray;
  }
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
  <div>
    <div class="relative border border-dashed p-5 rounded text-center">
      <input
        class="absolute inset-0 opacity-0"
        type="file"
        :accept="accept.join(',')"
        :multiple="multiple"
        @change="handleFileSelect"
      />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-12 w-12 mx-auto mb-4 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
        />
      </svg>

      <span class="text-blue-500">Upload files </span>
      <span>or drag and drop</span>
    </div>
    <p v-for="(file, index) in files" :key="file.name">
      {{ file.name }}

      <img
        v-if="previews[index]?.type === 'image'"
        :src="previews[index].url"
        :alt="file.name"
      />
      <video
        v-if="previews[index]?.type === 'video'"
        :src="previews[index].url"
        autoplay
        muted
        loop
      ></video>

      <span v-if="fileIsTooBig(file)" class="text-red-500">
        File must be no larger than {{ maxMb }}
      </span>
    </p>
  </div>
</template>
