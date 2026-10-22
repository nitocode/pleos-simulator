import { createRouter, createWebHashHistory } from 'vue-router'
import BrandHost from './BrandHost.vue'
import HomePage from './HomePage.vue'

// Historique par hash : fonctionne sur GitHub Pages sans configuration serveur.
export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: HomePage },
    { path: '/:brand', component: BrandHost, props: true },
  ],
})
