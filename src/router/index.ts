import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Dashboard from '../components/Dashboard.vue'
import PersonnelManagement from '../components/PersonnelManagement.vue'
import OrganizationManagement from '../components/OrganizationManagement.vue'
import PermissionSettings from '../components/PermissionSettings.vue'
import Profile from '../components/Profile.vue'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: Login, meta: { guest: true } },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true },
    redirect: '/home/dashboard',
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'personnel', component: PersonnelManagement },
      { path: 'organization', component: OrganizationManagement },
      { path: 'permissions', component: PermissionSettings },
      { path: 'profile', component: Profile },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  authStore.restoreSession()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.guest && authStore.isAuthenticated) {
    next('/home')
  } else {
    next()
  }
})

export default router
