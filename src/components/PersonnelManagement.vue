<template>
  <div class="page-container">
    <el-card class="search-card">
      <el-form :inline="true" :model="query" class="search-form">
        <el-form-item label="搜索">
          <el-input v-model="query.keyword" placeholder="姓名/手机号/邮箱" clearable @clear="handleSearch" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="部门">
          <el-select v-model="query.department" placeholder="全部" clearable @change="handleSearch" style="width: 140px">
            <el-option v-for="d in departments" :key="d" :label="d" :value="d" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部" clearable @change="handleSearch" style="width: 120px">
            <el-option label="在职" value="在职" />
            <el-option label="离职" value="离职" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <div class="table-header">
        <span class="table-title">人员列表</span>
        <el-button type="primary" @click="openAdd">新增人员</el-button>
      </div>
      <el-table :data="store.pagedList" border stripe style="width: 100%" class="flex-table" :row-class-name="rowClassName">
        <el-table-column prop="name" label="姓名" width="120">
          <template #default="{ row }">
            <el-input v-if="editingRowId === row.id" v-model="editForm.name" size="small" placeholder="姓名" />
            <span v-else>{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" width="140">
          <template #default="{ row }">
            <el-input v-if="editingRowId === row.id" v-model="editForm.phone" size="small" placeholder="手机号" />
            <span v-else>{{ row.phone }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="180">
          <template #default="{ row }">
            <el-input v-if="editingRowId === row.id" v-model="editForm.email" size="small" placeholder="邮箱" />
            <span v-else>{{ row.email }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="department" label="部门" width="110">
          <template #default="{ row }">
            <el-select v-if="editingRowId === row.id" v-model="editForm.department" size="small" style="width: 100%">
              <el-option v-for="d in departments" :key="d" :label="d" :value="d" />
            </el-select>
            <span v-else>{{ row.department }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="position" label="职位" width="100">
          <template #default="{ row }">
            <el-input v-if="editingRowId === row.id" v-model="editForm.position" size="small" placeholder="职位" />
            <span v-else>{{ row.position }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="roleName" label="角色" width="130">
          <template #default="{ row }">
            <el-select v-if="editingRowId === row.id" v-model="editForm.roleId" size="small" style="width: 100%" placeholder="选择角色">
              <el-option v-for="r in roles" :key="r.id" :label="r.name" :value="r.id" />
            </el-select>
            <span v-else>{{ getRoleName(row.roleId) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-select v-if="editingRowId === row.id" v-model="editForm.status" size="small" style="width: 100%">
              <el-option label="在职" value="在职" />
              <el-option label="离职" value="离职" />
            </el-select>
            <el-tag v-else :type="row.status === '在职' ? 'success' : 'danger'" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="joinDate" label="入职日期" width="140">
          <template #default="{ row }">
            <el-date-picker v-if="editingRowId === row.id" v-model="editForm.joinDate" type="date" size="small" value-format="YYYY-MM-DD" style="width: 100%" />
            <span v-else>{{ row.joinDate }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <template v-if="editingRowId === row.id">
              <el-button type="primary" link size="small" @click="saveEdit(row)">保存</el-button>
              <el-button link size="small" @click="cancelEdit">取消</el-button>
            </template>
            <template v-else>
              <el-button type="primary" link size="small" @click="startEdit(row)" :disabled="editingRowId !== null">编辑</el-button>
              <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
            </template>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="暂无人员数据" :image-size="80" />
        </template>
      </el-table>
      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="query.page"
          v-model:page-size="query.pageSize"
          :page-sizes="[5, 10, 20, 50]"
          :total="store.total"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="handleSearch"
          @current-change="handleSearch"
        />
      </div>
    </el-card>

    <!-- 仅用于新增的弹窗 -->
    <el-dialog v-model="dialogVisible" title="新增人员" width="560px" @close="resetForm">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-select v-model="form.department" placeholder="请选择部门" style="width: 100%">
            <el-option v-for="d in departments" :key="d" :label="d" :value="d" />
          </el-select>
        </el-form-item>
        <el-form-item label="职位" prop="position">
          <el-input v-model="form.position" placeholder="请输入职位" />
        </el-form-item>
        <el-form-item label="角色" prop="roleId">
          <el-select v-model="form.roleId" placeholder="请选择角色" style="width: 100%" clearable>
            <el-option v-for="r in roles" :key="r.id" :label="r.name" :value="r.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio value="在职">在职</el-radio>
            <el-radio value="离职">离职</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="入职日期" prop="joinDate">
          <el-date-picker v-model="form.joinDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { usePersonnelStore, type Personnel } from '../stores/personnel'
import api from '../api'

const store = usePersonnelStore()
interface RoleOption { id: number; name: string }
const roles = ref<RoleOption[]>([])
onMounted(async () => {
  store.fetchList()
  try { const { data } = await api.get('/roles'); if (data.code === 200) roles.value = data.data } catch {}
})
const dialogVisible = ref(false)
const formRef = ref()

// 部门选项（集中管理）
const departments = ['技术部', '市场部', '财务部', '人事部', '运营部']

const query = reactive({
  keyword: '',
  department: '',
  status: '',
  page: 1,
  pageSize: 10,
})

// ========== 新增表单 ==========
const defaultForm = () => ({
  name: '', phone: '', email: '', department: '', position: '',
  status: '在职' as '在职' | '离职', joinDate: '',  roleId: null as number | null,
})

const form = reactive(defaultForm())

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1\d{10}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }, { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }],
  department: [{ required: true, message: '请选择部门', trigger: 'change' }],
  position: [{ required: true, message: '请输入职位', trigger: 'blur' }],
}

// ========== 行内编辑 ==========
const editingRowId = ref<number | null>(null)
const editForm = reactive({ ...defaultForm() })

function getRoleName(roleId: number | null): string {
  if (roleId == null) return '-'
  const role = roles.value.find(r => r.id === roleId)
  return role ? role.name : '-'
}

function startEdit(row: Personnel) {
  editingRowId.value = row.id
  Object.assign(editForm, { 
    name: row.name, phone: row.phone, email: row.email,
    department: row.department, position: row.position,
    status: row.status, joinDate: row.joinDate, roleId: row.roleId ?? null
  })
}

function cancelEdit() {
  editingRowId.value = null
}

function saveEdit(row: Personnel) {
  if (!editForm.name) return ElMessage.warning('请输入姓名')
  if (!editForm.phone) return ElMessage.warning('请输入手机号')
  if (!editForm.email) return ElMessage.warning('请输入邮箱')
  if (!editForm.department) return ElMessage.warning('请选择部门')
  if (!editForm.position) return ElMessage.warning('请输入职位')
  if (!/^1\d{10}$/.test(editForm.phone)) return ElMessage.warning('手机号格式不正确')

  store.updatePersonnel(row.id, { ...editForm })
  ElMessage.success('修改成功')
  editingRowId.value = null
}

function rowClassName({ row }: { row: Personnel }) {
  return editingRowId.value === row.id ? 'editing-row' : ''
}

// ========== 查询 ==========
function handleSearch() {
  store.query = {
    keyword: query.keyword,
    department: query.department,
    status: query.status,
    page: query.page,
    pageSize: query.pageSize,
  }
  store.fetchList()
}

function handleReset() {
  query.keyword = ''
  query.department = ''
  query.status = ''
  query.page = 1
  store.resetQuery()
}

// ========== 新增 ==========
function openAdd() {
  Object.assign(form, defaultForm())
  dialogVisible.value = true
}

function resetForm() {
  formRef.value?.resetFields()
}

async function submitForm() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  await store.addPersonnel({ ...form })
  ElMessage.success('新增成功')
  dialogVisible.value = false
}

// ========== 删除 ==========
async function handleDelete(row: Personnel) {
  try {
    await ElMessageBox.confirm(`确认删除人员"${row.name}"？`, '提示', { type: 'warning' })
    await store.deletePersonnel(row.id)
    ElMessage.success('删除成功')
  } catch {}
}
</script>

<style scoped>
.page-container {
  height: 100%;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
  background: #f0f2f5;
}

.search-card {
  flex-shrink: 0;
  border-radius: 10px;
  border: none;
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
}

.search-card :deep(.el-card__body) { padding: 16px 20px 4px; }

.search-form { margin-bottom: 0; }

.table-card {
  flex: 1;
  height: 0;
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  border: none;
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
}

.table-card :deep(.el-card__body) {
  flex: 1;
  height: 0;
  display: flex;
  flex-direction: column;
  overflow: auto;
  padding: 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  flex-shrink: 0;
}

.table-title { font-size: 15px; font-weight: 600; color: #1e293b; }

.flex-table { flex: 1; }

/* 行内编辑高亮 */
:deep(.editing-row) {
  background-color: #eff6ff !important;
}

:deep(.editing-row td) {
  padding: 4px 0 !important;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
  flex-shrink: 0;
}

:deep(.el-table th.el-table__cell) {
  background: #f8fafc;
  color: #475569;
  font-weight: 600;
}

:deep(.el-button:focus-visible) {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  border-radius: 4px;
}

.search-form :deep(.el-button) {
  touch-action: manipulation;
}
</style>
