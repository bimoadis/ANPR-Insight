<template>
  <div
    class="min-h-screen bg-gradient-to-b from-gray-100 to-green-100 font-sans"
  >
    <div class="max-w-6xl mx-auto py-12 px-6">
      <h1 class="text-4xl font-bold text-center mb-4">ANPR - Insight</h1>
      <p class="text-center text-gray-600 max-w-2xl mx-auto mb-10">
        ANPR-Insight adalah platform cerdas berbasis AI yang memungkinkan
        deteksi, pengenalan, dan analisis plat nomor kendaraan secara otomatis
        untuk kebutuhan pemantauan lalu lintas yang cepat dan efisien.
      </p>

      <div
        class="bg-white rounded-xl shadow-xl p-6 flex flex-col md:flex-row gap-6 transition-all"
      >
        <!-- Left Section -->
        <div class="flex-1 space-y-4">
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-semibold">Smart Vehicle Monitoring</h2>
            <div v-if="hasVideo" class="flex gap-2">
              <button
                class="px-4 py-2 rounded-md text-white bg-emerald-600 hover:bg-emerald-700 transition"
                @click="getHasil"
              >
                Refresh Hasil
              </button>

              <button
                class="px-4 py-2 rounded-md text-white bg-red-500 hover:bg-red-600 transition"
                @click="resetVideo"
              >
                Reset Video
              </button>
            </div>
          </div>

          <!-- Upload Area -->
          <div
            v-if="!selectedFile"
            class="border-2 border-dashed border-emerald-500 rounded-lg p-6 text-center bg-emerald-50"
          >
            <div class="text-4xl mb-2">☁️</div>
            <p class="font-medium mb-1">Choose a file or drag & drop it here</p>
            <p class="text-sm text-gray-500 mb-4">
              Video formats (MP4, AVI, MOV), up to 50MB
            </p>
            <input
              ref="fileInput"
              type="file"
              accept="video/*"
              @change="handleFileSelect"
              class="hidden"
            />
            <button
              @click="triggerFileInput"
              class="px-5 py-2 rounded-full border border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white transition"
            >
              Pilih Video
            </button>
          </div>

          <!-- Video Preview -->
          <div v-if="selectedFile && !uploadComplete" class="space-y-4">
            <div class="border-2 border-emerald-500 rounded-lg p-4 bg-gray-50">
              <div class="flex justify-between items-center mb-3">
                <h3 class="text-sm font-semibold text-gray-700">
                  Preview Video
                </h3>
                <button
                  @click="clearSelectedFile"
                  class="text-xs text-red-600 hover:text-red-700"
                >
                  ✕ Hapus
                </button>
              </div>
              <video
                v-if="videoPreviewUrl"
                :src="videoPreviewUrl"
                controls
                class="w-full rounded-lg max-h-[300px] bg-black"
              ></video>
              <p class="text-xs text-gray-600 mt-2">
                File: {{ selectedFile.name }} ({{
                  formatFileSize(selectedFile.size)
                }})
              </p>
            </div>

            <div v-if="uploading">
              <p class="text-sm mb-1">Uploading: {{ progress }}%</p>
              <progress
                :value="progress"
                max="100"
                class="w-full h-2"
              ></progress>
            </div>

            <button
              v-if="!uploading"
              @click="startUpload"
              class="w-full px-5 py-3 rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition font-semibold"
            >
              📤 Upload Video
            </button>
          </div>

          <!-- After Upload Complete -->
          <div v-if="uploadComplete" class="space-y-4">
            <div
              class="border-2 border-emerald-500 rounded-lg p-4 bg-emerald-50"
            >
              <div class="flex items-center gap-2 mb-3">
                <span class="text-2xl">✅</span>
                <h3 class="text-lg font-semibold text-emerald-700">
                  Video Berhasil Diupload!
                </h3>
              </div>
              <video
                v-if="videoPreviewUrl"
                :src="videoPreviewUrl"
                controls
                class="w-full rounded-lg max-h-[300px] bg-black"
              ></video>
              <p class="text-xs text-gray-600 mt-2">
                File: {{ selectedFile?.name }}
              </p>
            </div>

            <button
              v-if="!processingDetection"
              @click="startDetection"
              class="w-full px-5 py-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition font-semibold text-lg"
            >
              🔍 Deteksi Plat Nomor
            </button>

            <div v-if="processingDetection" class="text-center">
              <div class="inline-flex items-center gap-2 text-blue-600">
                <svg
                  class="animate-spin h-5 w-5"
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
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
              <p class="text-xs text-gray-500 mt-2">
                Proses ini mungkin memakan waktu beberapa menit
              </p>
            </div>
          </div>

          <p v-if="message" class="text-sm text-emerald-700">{{ message }}</p>
          <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
        </div>

        <!-- Right Section -->
        <div
          class="flex-1 bg-gray-50 border border-dashed rounded-lg flex items-center justify-center text-gray-400"
        >
          <template v-if="hasil.length">
            <div class="text-left px-4 py-2 w-full">
              <h2
                class="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2"
              >
                📊 Data Plat Terdeteksi
              </h2>

              <div class="max-h-[600px] overflow-y-auto space-y-5 pr-2">
                <div
                  v-for="(row, i) in hasil"
                  :key="i"
                  class="bg-white rounded-xl shadow-md border border-gray-200 p-4 hover:shadow-lg transition-all"
                >
                  <!-- Header -->
                  <div class="flex justify-between items-center mb-3">
                    <h3 class="text-sm text-gray-700 font-semibold">
                      Frame #{{ row.Frame }}
                    </h3>
                    <span
                      :class="[
                        'px-3 py-1 text-xs font-semibold rounded-full',
                        row['Label Plat']?.includes('putih')
                          ? 'bg-gray-200 text-gray-800'
                          : row['Label Plat']?.includes('hitam')
                          ? 'bg-gray-900 text-white'
                          : 'bg-blue-100 text-blue-800',
                      ]"
                    >
                      {{ row["Label Plat"] }}
                    </span>
                  </div>

                  <!-- Info -->
                  <div class="text-sm text-gray-600 space-y-1 mb-3">
                    <p>
                      <span class="font-medium text-gray-800">Confidence:</span>
                      {{ row["Conf YOLO"] }}
                    </p>
                    <p>
                      <span class="font-medium text-gray-800">Waktu:</span>
                      {{ row.Waktu }}
                    </p>
                    <p v-if="row['OCR Crop']">
                      <span class="font-medium text-gray-800">OCR Crop:</span>
                      <span
                        :class="
                          row['OCR Crop'] ? 'text-gray-900' : 'text-gray-400'
                        "
                      >
                        {{ row["OCR Crop"] || "N/A" }}
                      </span>
                    </p>
                    <p v-if="row['OCR HD']">
                      <span class="font-medium text-gray-800">OCR HD:</span>
                      <span
                        :class="
                          row['OCR HD'] ? 'text-gray-900' : 'text-gray-400'
                        "
                      >
                        {{ row["OCR HD"] || "N/A" }}
                      </span>
                    </p>
                    <p v-if="row['SR Path'] || row['OCR SR']">
                      <span class="font-medium text-gray-800">OCR SR:</span>
                      <span
                        :class="[
                          row['OCR SR']
                            ? 'text-emerald-700 font-semibold'
                            : 'text-gray-400',
                        ]"
                      >
                        {{ row["OCR SR"] || "N/A" }}
                      </span>
                    </p>
                  </div>

                  <!-- Images Section -->
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <!-- Crop -->
                    <div v-if="row['Crop Path']" class="text-center">
                      <p class="text-xs font-semibold text-gray-700 mb-1">
                        Crop
                      </p>
                      <div class="relative">
                        <img
                          :src="formatPath(row['Crop Path'])"
                          alt="Crop"
                          class="w-full object-contain max-h-[25vh] mx-auto rounded border border-gray-200"
                          @error="handleImageError"
                        />
                        <p
                          v-if="row['OCR Crop']"
                          class="text-xs text-gray-600 mt-1 font-mono"
                        >
                          {{ row["OCR Crop"] }}
                        </p>
                      </div>
                    </div>

                    <!-- HD -->
                    <div v-if="row['HD Path']" class="text-center">
                      <p class="text-xs font-semibold text-gray-700 mb-1">HD</p>
                      <div class="relative">
                        <img
                          :src="formatPath(row['HD Path'])"
                          alt="HD"
                          class="w-full object-contain max-h-[25vh] mx-auto rounded border border-gray-200"
                          @error="handleImageError"
                        />
                        <p
                          v-if="row['OCR HD']"
                          class="text-xs text-gray-600 mt-1 font-mono"
                        >
                          {{ row["OCR HD"] }}
                        </p>
                      </div>
                    </div>

                    <!-- SR -->
                    <div v-if="row['SR Path']" class="text-center">
                      <p class="text-xs font-semibold text-emerald-700 mb-1">
                        SR
                      </p>
                      <div class="relative">
                        <img
                          :src="formatPath(row['SR Path'])"
                          alt="SR"
                          class="w-full object-contain max-h-[25vh] mx-auto rounded border-2 border-emerald-300"
                          @load="handleSRImageLoad(row)"
                          @error="handleImageError"
                        />
                        <p
                          v-if="row['OCR SR']"
                          class="text-xs text-emerald-700 mt-1 font-mono font-semibold"
                        >
                          {{ row["OCR SR"] }}
                        </p>
                      </div>
                    </div>

                    <!-- Threshold (if exists) -->
                    <div v-if="row['Threshold Path']" class="text-center">
                      <p class="text-xs font-semibold text-gray-700 mb-1">
                        Threshold
                      </p>
                      <img
                        :src="formatPath(row['Threshold Path'])"
                        alt="Threshold"
                        class="w-full object-contain max-h-[25vh] mx-auto rounded border border-gray-200"
                        @error="handleImageError"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <template v-else>
            <div class="flex flex-col items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-16 w-16 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 17v-6a2 2 0 012-2h6m2 0a2 2 0 012 2v6a2 2 0 01-2 2H11a2 2 0 01-2-2z"
                />
              </svg>
              <p>Data Plat Nomor Kosong</p>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const apiUrl = import.meta.env.VITE_API_URL;
const fileInput = ref(null);
const progress = ref(0);
const message = ref("");
const error = ref("");
const uploading = ref(false);
const uploadedFilename = ref("");
const hasil = ref([]);
const selectedFile = ref(null);
const videoPreviewUrl = ref("");
const uploadComplete = ref(false);
const processingDetection = ref(false);
const hasVideo = ref(false);

const triggerFileInput = () => fileInput.value.click();

const handleFileSelect = (e) => {
  const file = e.target.files[0];
  if (!file) {
    return;
  }

  if (!file.type.startsWith("video/")) {
    error.value = "Silakan pilih file video (MP4, AVI, MOV, dll).";
    return;
  }

  error.value = "";
  message.value = "";
  selectedFile.value = file;

  // Create preview URL
  if (videoPreviewUrl.value) {
    URL.revokeObjectURL(videoPreviewUrl.value);
  }
  videoPreviewUrl.value = URL.createObjectURL(file);
  uploadComplete.value = false;
};

const clearSelectedFile = () => {
  selectedFile.value = null;
  if (videoPreviewUrl.value) {
    URL.revokeObjectURL(videoPreviewUrl.value);
    videoPreviewUrl.value = "";
  }
  uploadComplete.value = false;
  error.value = "";
  message.value = "";
  fileInput.value.value = "";
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

const startUpload = () => {
  if (!selectedFile.value) {
    error.value = "Silakan pilih file terlebih dahulu.";
    return;
  }

  error.value = "";
  message.value = "";
  progress.value = 0;
  uploading.value = true;

  const formData = new FormData();
  formData.append("file", selectedFile.value);

  const xhr = new XMLHttpRequest();
  xhr.upload.addEventListener("progress", (event) => {
    if (event.lengthComputable) {
      progress.value = Math.round((event.loaded / event.total) * 100);
    }
  });
  xhr.onload = () => {
    uploading.value = false;
    if (xhr.status === 200) {
      const res = JSON.parse(xhr.responseText);
      message.value = res.message || "Upload berhasil!";
      uploadComplete.value = true;
      hasVideo.value = true;
    } else {
      error.value = "Upload gagal. Status: " + xhr.status;
    }
  };
  xhr.onerror = () => {
    uploading.value = false;
    error.value = "Terjadi kesalahan jaringan saat upload.";
  };
  xhr.open("POST", `${apiUrl}/upload-video`, true);
  xhr.send(formData);
};

const startDetection = async () => {
  if (!uploadComplete.value) {
    error.value = "Silakan upload video terlebih dahulu.";
    return;
  }

  error.value = "";
  message.value = "";
  processingDetection.value = true;

  try {
    // Start detection
    const res = await fetch(`${apiUrl}/detect-plate`, {
      method: "POST",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${res.status}`);
    }

    const data = await res.json();
    message.value = data.message || "✅ Deteksi plat nomor dimulai!";

    // Poll status setiap 2 detik
    const statusInterval = setInterval(async () => {
      try {
        const statusRes = await fetch(`${apiUrl}/detect-status`);
        const statusData = await statusRes.json();

        if (statusData.error) {
          error.value = statusData.error;
          processingDetection.value = false;
          clearInterval(statusInterval);
          return;
        }

        if (!statusData.is_processing) {
          // Deteksi selesai
          processingDetection.value = false;
          clearInterval(statusInterval);
          message.value =
            statusData.message || "✅ Deteksi plat nomor selesai!";
          hasVideo.value = true;

          // Refresh hasil
          setTimeout(() => {
            getHasil();
          }, 1000);
        } else {
          // Masih processing
          message.value =
            statusData.message || "Memproses deteksi plat nomor...";
        }
      } catch (err) {
        console.error("Error checking status:", err);
      }
    }, 2000);

    // Stop checking after 10 minutes
    setTimeout(() => {
      clearInterval(statusInterval);
      if (processingDetection.value) {
        processingDetection.value = false;
        message.value =
          "⏳ Proses deteksi masih berjalan. Silakan refresh hasil secara manual.";
      }
    }, 600000); // 10 menit
  } catch (err) {
    console.error("Error saat deteksi:", err);
    error.value =
      "Terjadi kesalahan saat deteksi: " + (err.message || err.toString());
    processingDetection.value = false;
  }
};

const getHasil = async () => {
  const res = await fetch(`${apiUrl}/get-results`);
  const data = await res.json();
  console.log("DATA HASIL:", data);
  hasil.value = data.data || [];

  // Update hasVideo berdasarkan hasil
  hasVideo.value = hasil.value.length > 0;
};

const handleSRImageLoad = (row) => {
  // Handle SR image load if needed
};

const handleImageError = (e) => {
  // Handle image load error
  e.target.style.display = "none";
};

const resetVideo = async () => {
  const res = await fetch(`${apiUrl}/clear-results`, { method: "DELETE" });
  const data = await res.json();
  alert(data.message);
  hasil.value = [];
  message.value = "";
  uploadedFilename.value = "";
  selectedFile.value = null;
  uploadComplete.value = false;
  processingDetection.value = false;
  hasVideo.value = false;
  if (videoPreviewUrl.value) {
    URL.revokeObjectURL(videoPreviewUrl.value);
    videoPreviewUrl.value = "";
  }
  fileInput.value.value = "";
};

const formatPath = (path) => {
  if (!path) return "";
  const cleanPath = path.replace(/\\/g, "/");
  // Hilangkan double slash jika ada
  return `${apiUrl}${cleanPath.startsWith("/") ? "" : "/"}${cleanPath}`;
};

onMounted(() => {
  getHasil();
  // Cek apakah sudah ada hasil (ada video yang sudah diupload)
  checkHasVideo();
});

const checkHasVideo = async () => {
  const res = await fetch(`${apiUrl}/get-results`);
  const data = await res.json();
  hasVideo.value = data.data && data.data.length > 0;
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap");
:root {
  font-family: "Inter", sans-serif;
}
</style>
