<template>
  <div
    class="border-2 border-dashed border-green-400 p-6 rounded-xl bg-white shadow text-center"
  >
    <p class="mb-2 text-gray-600">Choose a file or drag & drop it here</p>
    <p class="text-sm text-green-600">
      JPEG, PNG, MP4 formats, up to 50MB
    </p>

    <input
      type="file"
      ref="fileInput"
      accept="video/*,image/*"
      style="display: none"
      @change="handleUpload"
    />

    <button
      @click="fileInput.click()"
      class="mt-4 px-4 py-2 border border-green-600 text-green-600 rounded hover:bg-green-50"
    >
      Upload File
    </button>

    <div v-if="previewUrl" class="mt-4">
      <video
        v-if="isVideo"
        :src="previewUrl"
        class="max-w-full rounded"
        controls
      />
      <img
        v-else
        :src="previewUrl"
        class="max-w-full rounded"
        alt="Preview"
      />
    </div>

    <p class="mt-2 text-sm text-gray-500" v-if="uploadMessage">
      {{ uploadMessage }}
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const fileInput = ref(null)
const previewUrl = ref('')
const uploadMessage = ref('')
const isVideo = ref(false)

const handleUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  const type = file.type
  isVideo.value = type.startsWith('video/')
  previewUrl.value = URL.createObjectURL(file)

  const formData = new FormData()
  formData.append('file', file)

  try {
    const res = await fetch(import.meta.env.VITE_API_URL + '/upload-video', {
      method: 'POST',
      body: formData,
    })
    const json = await res.json()
    uploadMessage.value = json.message || 'Upload berhasil!'
  } catch (err) {
    uploadMessage.value = '❌ Upload gagal.'
  }
}
</script>
