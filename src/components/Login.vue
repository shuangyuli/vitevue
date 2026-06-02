<template>
  <div class="login-container">
    <div class="login-bg-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
    </div>
    <div class="login-card-wrap">
      <div class="login-brand">
        <div class="brand-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="9" y1="21" x2="9" y2="9" />
          </svg>
        </div>
        <h1 class="brand-name">管理后台</h1>
        <p class="brand-desc">企业数据管理中心</p>
      </div>
      <el-form
        :model="loginForm"
        :rules="rules"
        ref="loginFormRef"
        @keyup.enter="submitForm"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="用户名"
            size="large"
            :prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            size="large"
            show-password
            :prefix-icon="Lock"
          />
        </el-form-item>
        <div class="login-extra">
          <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
        </div>
        <el-form-item v-if="errorMsg">
          <el-alert :title="errorMsg" type="error" show-icon :closable="false" />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            @click="submitForm"
            class="login-btn"
          >
            {{ loading ? '登录中...' : '登 录' }}
          </el-button>
        </el-form-item>
      </el-form>
      <div class="login-footer">
        <span>提示：admin / admin123</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

const loginFormRef = ref()
const loading = ref(false)
const errorMsg = ref('')

const loginForm = reactive({
  username: '',
  password: '',
  remember: false,
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不少于6位', trigger: 'blur' },
  ],
}

const submitForm = () => {
  loginFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    loading.value = true
    errorMsg.value = ''
    try {
      await authStore.login(loginForm.username, loginForm.password, loginForm.remember)
      router.push('/home')
    } catch (e: any) {
      errorMsg.value = e.message || '登录失败，请重试'
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0f172a 100%);
  overflow: hidden;
  position: relative;
}

.login-bg-shapes {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.08;
  animation: float 20s infinite ease-in-out;
}

.shape-1 {
  width: 600px; height: 600px;
  background: radial-gradient(circle, #3b82f6, transparent 70%);
  top: -200px; right: -100px;
  animation-delay: 0s;
}

.shape-2 {
  width: 500px; height: 500px;
  background: radial-gradient(circle, #8b5cf6, transparent 70%);
  bottom: -150px; left: -100px;
  animation-delay: -7s;
}

.shape-3 {
  width: 300px; height: 300px;
  background: radial-gradient(circle, #06b6d4, transparent 70%);
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -14s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.05); }
  66% { transform: translate(-20px, 20px) scale(0.95); }
}

.login-card-wrap {
  position: relative;
  z-index: 1;
  width: 420px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 44px 40px 32px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.4);
}

.login-brand {
  text-align: center;
  margin-bottom: 36px;
}

.brand-icon {
  width: 56px; height: 56px;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.brand-icon svg { width: 28px; height: 28px; }

.brand-name {
  font-size: 24px;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0 0 6px;
  letter-spacing: 2px;
}

.brand-desc {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.login-extra {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  padding: 0 4px;
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  letter-spacing: 4px;
  border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border: none;
}

.login-btn:hover {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
}

.login-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 12px;
  color: #475569;
}

:deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.06);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #3b82f6;
  background: rgba(255, 255, 255, 0.08);
}

:deep(.el-input__inner) {
  color: #f1f5f9;
}

:deep(.el-input__inner::placeholder) {
  color: #64748b;
}

:deep(.el-input__suffix) {
  color: #64748b;
}

:deep(.el-input__suffix:hover) {
  color: #94a3b8;
}

:deep(.el-checkbox__label) {
  color: #94a3b8;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-alert) {
  border-radius: 10px;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.25);
}

:deep(.el-alert__title) {
  color: #fca5a5;
}
</style>
