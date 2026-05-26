<template>
  <div class="profile-page">
    <el-card class="profile-card">
      <div class="profile-header">
        <h2>个人中心</h2>
        <el-button type="primary" @click="goHome">返回首页</el-button>
      </div>
      <el-descriptions title="用户信息" column="1" border>
        <el-descriptions-item label="用户名">admin</el-descriptions-item>
        <el-descriptions-item label="邮箱">admin@example.com</el-descriptions-item>
        <el-descriptions-item label="角色">管理员</el-descriptions-item>
      </el-descriptions>
      <el-divider />
      <el-card>
        <p>这里可以继续扩展个人资料、修改密码、头像上传等功能。</p>
      </el-card>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
const goHome = () => {
  router.push('/home')
}
</script>

<style scoped>
.profile-page {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f7fa;
  padding: 40px 16px;
}
.profile-card {
  width: 720px;
}
.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
</style>