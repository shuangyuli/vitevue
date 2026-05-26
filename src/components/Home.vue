<template>
  <el-container class="home-container">
    <el-aside width="220px" class="side-menu">
      <div class="logo">管理后台</div>
      <el-menu
        :default-active="$route.path"
        class="side-menu-list"
        background-color="#001529"
        text-color="#ffffffa6"
        active-text-color="#fff"
        @select="handleMenuSelect"
      >
        <el-menu-item index="/home/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <span>数据大屏</span>
        </el-menu-item>
        <el-menu-item index="/home/personnel">
          <el-icon><User /></el-icon>
          <span>人员管理</span>
        </el-menu-item>
        <el-menu-item index="/home/organization">
          <el-icon><OfficeBuilding /></el-icon>
          <span>机构管理</span>
        </el-menu-item>
        <el-menu-item index="/home/permissions">
          <el-icon><Lock /></el-icon>
          <span>权限设置</span>
        </el-menu-item>
        <el-menu-item index="/home/profile">
          <el-icon><UserFilled /></el-icon>
          <span>个人中心</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container class="right-container">
      <el-header class="top-bar">
        <div class="top-left">
          <span class="page-title">{{ pageTitle }}</span>
        </div>
        <div class="top-right">
          <span class="user-info">{{ authStore.username }}</span>
          <el-button type="danger" size="small" @click="handleLogout">退出登录</el-button>
        </div>
      </el-header>

      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { DataAnalysis, User, OfficeBuilding, Lock, UserFilled } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const titles: Record<string, string> = {
  '/home/dashboard': '数据大屏',
  '/home/personnel': '人员管理',
  '/home/organization': '机构管理',
  '/home/permissions': '权限设置',
  '/home/profile': '个人中心',
}

const pageTitle = computed(() => titles[route.path] || '管理后台')

const handleMenuSelect = (index: string) => {
  router.push(index)
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.home-container {
  height: 100vh;
  overflow: hidden;
}

.side-menu {
  background: #001529;
  color: #fff;
  overflow-y: auto;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
}

.side-menu-list {
  height: calc(100vh - 60px);
  border-right: none;
}

.right-container {
  height: 100%;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 0 24px;
  border-bottom: 1px solid #ebeef5;
  flex-shrink: 0;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
}

.top-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.main-content {
  height: 0;
  flex: 1;
  overflow: auto;
  background: #f5f7fa;
  padding: 0;
}
</style>
