<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2>管理后台登录</h2>
      <el-form
        :model="loginForm"
        :rules="rules"
        ref="loginFormRef"
        label-width="80px"
        @keyup.enter="submitForm"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
        </el-form-item>
        <el-form-item class="login-error" v-if="errorMsg">
          <el-alert :title="errorMsg" type="error" show-icon :closable="false" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="loading" style="width: 100%">
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
        <el-form-item>
          <el-button @click="resetForm" style="width: 100%">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const loginFormRef = ref()
const loading = ref(false)
const errorMsg = ref('')

const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不少于6位', trigger: 'blur' }
  ]
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

const resetForm = () => {
  loginFormRef.value.resetFields()
  errorMsg.value = ''
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.login-card {
  width: 400px;
  padding: 32px 24px 16px;
  border-radius: 12px;
}
.login-card h2 {
  text-align: center;
  margin-bottom: 24px;
  color: #303133;
}
.login-error {
  margin-bottom: 0;
}
</style>
