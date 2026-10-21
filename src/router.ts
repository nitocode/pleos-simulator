import { createRouter, createWebHashHistory } from 'vue-router'
import { BRANDS } from '@/brands'
import BrandHost from './BrandHost.vue'

// Historique par hash : fonctionne sur GitHub Pages sans configuration serveur.
export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: `/${BRANDS[0]!.id}` },
    { path: '/:brand', component: BrandHost, props: true },
  ],
})
