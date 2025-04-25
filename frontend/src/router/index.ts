import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth'

// Views
const Login = () => import('@/views/auth/Login.vue')
const Dashboard = () => import('@/views/dashboard/Dashboard.vue')
const Roster = () => import('@/views/roster/RosterView.vue')
const IndividualDetails = () => import('@/views/roster/IndividualDetails.vue')
const Prompts = () => import('@/views/prompts/PromptsView.vue')
const NewPrompt = () => import('@/views/prompts/NewPrompt.vue')
const Reports = () => import('@/views/reports/ReportsView.vue')
const Settings = () => import('@/views/settings/SettingsView.vue')
const UserProfile = () => import('@/views/profile/UserProfileView.vue')
const Admin = () => import('@/views/admin/AdminView.vue')

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/roster',
    name: 'Roster',
    component: Roster,
    meta: { requiresAuth: true }
  },
  {
    path: '/roster/:id',
    name: 'IndividualDetails',
    component: IndividualDetails,
    meta: { requiresAuth: true }
  },
  {
    path: '/prompts',
    name: 'Prompts',
    component: Prompts,
    meta: { requiresAuth: true }
  },
  {
    path: '/prompts/new/:id',
    name: 'NewPrompt',
    component: NewPrompt,
    meta: { requiresAuth: true }
  },
  {
    path: '/reports',
    name: 'Reports',
    component: Reports,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { requiresAuth: true }
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('@/views/history/HistoryView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: UserProfile,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)

  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (requiresAdmin && authStore.userRole !== 'ADMIN') {
    next('/dashboard')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router 