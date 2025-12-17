<template>
  <div>
    <h2>Hasil Deteksi</h2>
    <button @click="getHasil">🔄 Ambil Data</button>
    <a
      v-if="hasil.length"
      :href="`${apiUrl}/get-csv`"
      download="hasil_video.csv"
      class="btn-download"
    >⬇️ Download CSV</a>

    <button @click="confirmClear" class="btn-clear">🗑️ Clear Hasil Deteksi</button>


    <div v-if="hasil.length">
      <div
        v-for="(row, i) in hasil.slice(0, 5)"
        :key="i"
        class="hasil-entry"
      >
        <p><strong>Frame:</strong> {{ row.Frame }} | <strong>Label:</strong> {{ row['Label YOLO'] }}</p>
        <p>
          <strong>OCR HD:</strong> {{ row['OCR HD'] }} ({{ row['Conf HD'] }}) <br />
          <strong>OCR Threshold:</strong> {{ row['OCR Threshold'] }} ({{ row['Conf Threshold'] }})
        </p>
        <div class="img-preview">
          <img
            :src="`${apiUrl}/images/crop/${getFileName(row['Crop Path'])}`"
            alt="Crop"
          />
          <img
            :src="`${apiUrl}/images/hd/${getFileName(row['HD Path'])}`"
            alt="HD"
          />
          <img
            :src="`${apiUrl}/images/threshold/${getFileName(row['Threshold Path'])}`"
            alt="Threshold"
          />
        </div>
        <hr />
      </div>
    </div>

    <p v-else>⏳ Belum ada data</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const hasil = ref([])
const apiUrl = import.meta.env.VITE_API_URL

const getHasil = async () => {
  const res = await fetch(`${apiUrl}/get-results`)
  const data = await res.json()
  hasil.value = data.data || []
}

const getFileName = (fullPath) => {
  return fullPath.split('/').pop()
}

const confirmClear = async () => {
  if (!confirm("Apakah kamu yakin ingin menghapus semua hasil deteksi?")) return

  const res = await fetch(`${apiUrl}/clear-results`, {
    method: 'DELETE'
  })
  const data = await res.json()
  alert(data.message)
  hasil.value = []
}
</script>

<style scoped>
.img-preview {
  display: flex;
  gap: 1rem;
}
.img-preview img {
  width: 200px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
.btn-download {
  display: inline-block;
  margin: 10px 0;
  padding: 8px 16px;
  background: #2c7a7b;
  color: white;
  text-decoration: none;
  border-radius: 5px;
}

.btn-clear {
  display: inline-block;
  margin: 10px;
  padding: 8px 16px;
  background: #e53e3e;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

</style>
