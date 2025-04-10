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

  files.value = files.value.concat(filesAsArray);
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
    <label
      class="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700"
    >
      <input
        type="file"
        :accept="accept.join(',')"
        :multiple="multiple"
        hidden
        @change="handleFileSelect"
      />
      Upload
    </label>
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
