<template>
  <div class="min-h-screen px-8 py-6 bg-gradient-to-b from-[#e6f2ed] to-[#d8ede3] font-sans">
    <div class="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl p-8">
      <h1 class="text-3xl font-bold text-center text-gray-800 mb-2">ANPR - Insight</h1>
      <p class="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
        ANPR-Insight adalah platform cerdas berbasis AI yang memungkinkan deteksi, pengenalan,
        dan analisis plat nomor kendaraan secara otomatis untuk kebutuhan pemantauan lalu lintas
        yang cepat dan efisien.
      </p>

      <div class="flex flex-col md:flex-row gap-8">
        <!-- === Kiri: Upload dan Deteksi === -->
        <div class="flex-1">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">Smart Vehicle Monitoring</h2>
            <div class="space-x-2">
              <button
                @click="processVideo"
                class="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
              >Deteksi</button>
              <button
                @click="resetUpload"
                class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >Reset Video</button>
            </div>
          </div>

          <!-- Upload Box -->
          <div class="border-2 border-dashed border-emerald-500 rounded-xl p-6 text-center bg-gray-50">
            <p class="text-gray-700 font-semibold mb-2">Choose a file or drag & drop it here</p>
            <p class="text-sm text-gray-500 mb-4">JPEG, PNG, PDG, and MP4 formats, up to 50MB</p>
            <input
              ref="fileInput"
              type="file"
              accept="video/*,image/*"
              style="display: none"
              @change="handleUpload"
            />
            <button
              @click="fileInput.click()"
              class="border border-emerald-600 px-4 py-2 rounded text-emerald-600 hover:bg-emerald-50"
            >Upload File</button>

            <div v-if="previewUrl" class="mt-4">
              <video v-if="isVideo" :src="previewUrl" controls class="rounded max-w-full" />
              <img v-else :src="previewUrl" class="rounded max-w-full" alt="Preview" />
            </div>
            <p class="text-sm mt-2 text-gray-500">{{ message }}</p>
          </div>
        </div>

        <!-- === Kanan: Data Kosong / Hasil Deteksi === -->
        <div class="w-full md:w-1/2 bg-gray-100 rounded-xl flex items-center justify-center">
          <div v-if="!hasil.length" class="text-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <p>Data Plat Nomor Kosong</p>
          </div>
          <div v-else class="text-sm p-4 overflow-auto max-h-[300px] w-full">
            <div
              v-for="(row, i) in hasil.slice(0, 5)"
              :key="i"
              class="mb-4 border-b pb-2"
            >
              <p><strong>Frame:</strong> {{ row.Frame }} | <strong>Label:</strong> {{ row['Label YOLO'] }}</p>
              <p>
                <strong>OCR HD:</strong> {{ row['OCR HD'] }} ({{ row['Conf HD'] }})<br />
                <strong>OCR Threshold:</strong> {{ row['OCR Threshold'] }} ({{ row['Conf Threshold'] }})
              </p>
              <div class="flex gap-2 mt-2">
                <img :src="`${apiUrl}/images/crop/${getFileName(row['Crop Path'])}`" class="w-24 rounded" />
                <img :src="`${apiUrl}/images/hd/${getFileName(row['HD Path'])}`" class="w-24 rounded" />
                <img :src="`${apiUrl}/images/threshold/${getFileName(row['Threshold Path'])}`" class="w-24 rounded" />
              </div>
            </div>
            <div class="flex justify-between items-center mt-4">
              <a :href="`${apiUrl}/get-csv`" download class="text-emerald-700 hover:underline">⬇ Download CSV</a>
              <button @click="confirmClear" class="text-red-500 hover:underline">🗑 Clear Hasil</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const apiUrl = import.meta.env.VITE_API_URL
const fileInput = ref(null)
const previewUrl = ref('')
const isVideo = ref(false)
const uploadedFilename = ref('')
const message = ref('')
const hasil = ref([])

const handleUpload = (e) => {
  const file = e.target.files[0]
  if (!file) return

  isVideo.value = file.type.startsWith('video/')
  previewUrl.value = URL.createObjectURL(file)

  const formData = new FormData()
  formData.append('file', file)

  fetch(`${apiUrl}/upload-video`, {
    method: 'POST',
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      message.value = data.message || '✅ Upload berhasil'
      uploadedFilename.value = data.filename
    })
    .catch(() => {
      message.value = '❌ Gagal upload file'
    })
}

const processVideo = async () => {
  if (!uploadedFilename.value) return

  const formData = new FormData()
  formData.append('filename', uploadedFilename.value)

  const res = await fetch(`${apiUrl}/process-video`, {
    method: 'POST',
    body: formData
  })
  const data = await res.json()
  message.value = data.message || '✅ Video berhasil diproses'
  getHasil()
}

const getHasil = async () => {
  const res = await fetch(`${apiUrl}/get-results`)
  const data = await res.json()
  hasil.value = data.data || []
}

const getFileName = (path) => path.split('/').pop()

const confirmClear = async () => {
  if (!confirm('Yakin hapus semua hasil?')) return
  const res = await fetch(`${apiUrl}/clear-results`, { method: 'DELETE' })
  const data = await res.json()
  alert(data.message)
  hasil.value = []
  message.value = ''
}

const resetUpload = () => {
  uploadedFilename.value = ''
  previewUrl.value = ''
  hasil.value = []
  message.value = ''
}
</script>
