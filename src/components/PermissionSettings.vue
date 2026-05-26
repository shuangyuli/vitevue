<template>
  <div class="page-container">
    <el-row class="full-height" :gutter="16">
      <el-col :span="5" class="col-height">
        <el-card class="full-card">
          <template #header>
            <div class="card-header">
              <span>角色列表</span>
              <el-button type="primary" size="small" @click="openAdd">新增</el-button>
            </div>
          </template>
          <div class="role-list">
            <div
              v-for="role in store.roles"
              :key="role.id"
              class="role-item"
              :class="{ active: store.selectedRoleId === role.id }"
              @click="selectRole(role.id)"
            >
              <div class="role-name">{{ role.name }}</div>
              <div class="role-meta">{{ role.memberCount }}人</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="19" class="col-height">
        <el-card class="full-card" v-if="store.selectedRole">
          <template #header>
            <div class="card-header">
              <span>{{ store.selectedRole.name }} — 权限配置</span>
              <div>
                <el-button size="small" @click="openEdit">编辑角色</el-button>
                <el-button type="danger" size="small" @click="handleDelete">删除角色</el-button>
              </div>
            </div>
          </template>
          <el-descriptions :column="2" border style="margin-bottom: 24px">
            <el-descriptions-item label="角色名称">{{ store.selectedRole.name }}</el-descriptions-item>
            <el-descriptions-item label="成员数">{{ store.selectedRole.memberCount }}人</el-descriptions-item>
            <el-descriptions-item label="描述">{{ store.selectedRole.description }}</el-descriptions-item>
            <el-descriptions-item label="创建日期">{{ store.selectedRole.createdAt }}</el-descriptions-item>
          </el-descriptions>
          <h4 style="margin-bottom: 12px">权限分配</h4>
          <el-tree
            :data="store.allPermissions"
            node-key="id"
            show-checkbox
            default-expand-all
            :check-strictly="false"
            :default-checked-keys="store.selectedRole.permissions"
            @check="handlePermissionCheck"
          />
        </el-card>
        <el-card class="full-card empty-card" v-else>
          <div class="empty-hint">请从左侧选择角色查看权限</div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="dialogVisible" :title="editingRole ? '编辑角色' : '新增角色'" width="520px" @close="resetForm">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入角色描述" />
        </el-form-item>
        <el-form-item label="权限" prop="permissions">
          <el-tree
            :data="store.allPermissions"
            node-key="id"
            show-checkbox
            default-expand-all
            :default-checked-keys="form.permissions"
            @check="handleFormPermissionCheck"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { usePermissionStore } from '../stores/permission'

const store = usePermissionStore()
const dialogVisible = ref(false)
const editingRole = ref(false)
const formRef = ref()

const form = reactive({
  name: '', description: '', permissions: [] as string[],
})

const rules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
}

function selectRole(id: number) {
  store.selectRole(id)
}

function handlePermissionCheck(_node: any, checked: { checkedKeys: string[] }) {
  if (store.selectedRole) {
    store.updateRolePermissions(store.selectedRole.id, checked.checkedKeys)
    ElMessage.success('权限已更新')
  }
}

function handleFormPermissionCheck(_node: any, checked: { checkedKeys: string[] }) {
  form.permissions = checked.checkedKeys
}

function openAdd() {
  editingRole.value = false
  Object.assign(form, { name: '', description: '', permissions: [] })
  dialogVisible.value = true
}

function openEdit() {
  if (!store.selectedRole) return
  editingRole.value = true
  Object.assign(form, {
    name: store.selectedRole.name,
    description: store.selectedRole.description,
    permissions: [...store.selectedRole.permissions],
  })
  dialogVisible.value = true
}

function resetForm() {
  formRef.value?.resetFields()
}

function submitForm() {
  formRef.value.validate((valid: boolean) => {
    if (!valid) return
    if (editingRole.value && store.selectedRole) {
      store.updateRole(store.selectedRole.id, { name: form.name, description: form.description, permissions: form.permissions })
      ElMessage.success('修改成功')
    } else {
      store.addRole({ name: form.name, description: form.description, permissions: form.permissions })
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
  })
}

function handleDelete() {
  if (!store.selectedRole) return
  ElMessageBox.confirm(`确认删除角色「${store.selectedRole.name}」？`, '提示', { type: 'warning' }).then(() => {
    store.deleteRole(store.selectedRole!.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}
</script>

<style scoped>
.page-container { height: 100%; padding: 20px; }

.full-height { height: 100%; }

.col-height { height: 100%; }

.full-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.full-card :deep(.el-card__body) {
  flex: 1;
  overflow: auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.role-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.role-item {
  padding: 12px 16px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.2s;
}

.role-item:hover { background: #f0f2f5; }

.role-item.active {
  background: #ecf5ff;
  color: #409eff;
}

.role-name { font-weight: 500; }

.role-meta { font-size: 12px; color: #909399; }

.empty-card {
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-hint { color: #909399; font-size: 14px; }
</style>
