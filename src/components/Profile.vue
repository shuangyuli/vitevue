<template>
  <div class="profile-page">
    <div class="profile-content">
      <div class="profile-top">
        <div class="avatar-section">
          <div class="avatar" @click="triggerUpload" @keydown.enter="triggerUpload" @keydown.space.prevent="triggerUpload" title="点击更换头像" tabindex="0" role="button" aria-label="更换头像">
            <img v-if="avatarUrl" :src="avatarUrl" class="avatar-img" alt="用户头像" />
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 4-7 8-7s8 3 8 7" />
            </svg>
            <div class="avatar-overlay" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
          </div>
          <input ref="fileInput" type="file" accept="image/png,image/jpeg,image/webp,image/gif" @change="handleAvatarChange" style="display: none" />
          <div class="avatar-info">
            <h2>{{ authStore.username || 'admin' }}</h2>
            <p>管理员</p>
          </div>
          <el-tag type="success" size="small" effect="light">在线</el-tag>
        </div>
      </div>

      <el-row :gutter="20">
        <el-col :span="14">
          <el-card class="info-card" shadow="never">
            <template #header>
              <span class="card-hd">基本信息</span>
            </template>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="用户名">{{ profile.username || 'admin' }}</el-descriptions-item>
              <el-descriptions-item label="邮箱">{{ profile.email || '-' }}</el-descriptions-item>
              <el-descriptions-item label="手机号">{{ profile.phone || '-' }}</el-descriptions-item>
              <el-descriptions-item label="部门">{{ profile.department || '-' }}</el-descriptions-item>
              <el-descriptions-item label="角色">{{ profile.role || '-' }}</el-descriptions-item>
              <el-descriptions-item label="注册日期">{{ profile.registerDate || '-' }}</el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-col>
        <el-col :span="10">
          <el-card class="info-card" shadow="never">
            <template #header>
              <span class="card-hd">修改密码</span>
            </template>
            <el-form :model="pwdForm" :rules="pwdRules" ref="pwdFormRef" label-position="top">
              <el-form-item label="旧密码" prop="oldPassword">
                <el-input v-model="pwdForm.oldPassword" type="password" show-password placeholder="请输入旧密码" />
              </el-form-item>
              <el-form-item label="新密码" prop="newPassword">
                <el-input v-model="pwdForm.newPassword" type="password" show-password placeholder="请输入新密码" />
              </el-form-item>
              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input v-model="pwdForm.confirmPassword" type="password" show-password placeholder="请再次输入新密码" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="changePassword" style="width: 100%">修改密码</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth'
import api from '../api'

const authStore = useAuthStore()
const profile = ref<Record<string, string>>({})

onMounted(async () => {
  try {
    const { data } = await api.get('/user/profile')
    if (data.code === 200) profile.value = data.data
  } catch {}
})
const pwdFormRef = ref()
const fileInput = ref<HTMLInputElement>()
const avatarUrl = ref<string | null>(null)

const triggerUpload = () => {
  fileInput.value?.click()
}

const handleAvatarChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    ElMessage.warning('图片大小不能超过2MB')
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    avatarUrl.value = reader.result as string
    ElMessage.success('头像已更新')
  }
  reader.readAsDataURL(file)
  input.value = ''
}

const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const validateConfirm = (_rule: any, value: string, callback: Function) => {
  if (value !== pwdForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const pwdRules = {
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不少于6位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirm, trigger: 'blur' },
  ],
}

const changePassword = async () => {
  const valid = await pwdFormRef.value.validate().catch(() => false)
  if (!valid) return
  try {
    await api.put('/user/password', { oldPassword: pwdForm.oldPassword, newPassword: pwdForm.newPassword })
    ElMessage.success('密码修改成功')
    pwdForm.oldPassword = ''
    pwdForm.newPassword = ''
    pwdForm.confirmPassword = ''
    pwdFormRef.value.resetFields()
  } catch {
    ElMessage.error('密码修改失败')
  }
}
</script>

<style scoped>
.profile-page {
  height: 100%;
  background: #f0f2f5;
  overflow: auto;
  padding: 24px;
}

.profile-content {
  max-width: 900px;
  margin: 0 auto;
}

.profile-top {
  background: #fff;
  border-radius: 12px;
  padding: 28px 32px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar {
  width: 64px; height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar svg { width: 32px; height: 32px; }

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.avatar-overlay svg {
  width: 24px;
  height: 24px;
  color: #fff;
}

.avatar:hover .avatar-overlay {
  opacity: 1;
}

.avatar-info h2 {
  margin: 0 0 2px;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

.avatar-info p {
  margin: 0;
  color: #94a3b8;
  font-size: 14px;
}

.info-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.info-card :deep(.el-card__header) {
  border-bottom: 1px solid #f1f5f9;
  padding: 16px 20px;
}

.card-hd {
  font-size: 15px;
  font-weight: 600;
  color: #334155;
}

.avatar:focus-visible {
  outline: 3px solid #3b82f6;
  outline-offset: 3px;
}

:deep(.el-button:focus-visible) {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  border-radius: 4px;
}

:deep(.el-button) {
  touch-action: manipulation;
}
</style>
