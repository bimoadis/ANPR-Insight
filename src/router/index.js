import { createRouter, createWebHistory } from 'vue-router'
import UploadPage from '../views/UploadPage.vue'
import ResultPage from '../views/ResultPage.vue'

const routes = [
  { path: '/', redirect: '/upload' },
  { path: '/upload', component: UploadPage },
  { path: '/hasil', component: ResultPage },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
