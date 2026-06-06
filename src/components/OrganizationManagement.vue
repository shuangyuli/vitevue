<template>
  <div class="page-container">
    <el-row class="full-height" :gutter="16">
      <el-col :span="7" class="col-height" style="padding-right: 0;">
        <el-card class="full-card">
          <template #header>
            <div class="card-header">
              <span>组织架构</span>
              <el-button type="primary" size="small" @click="openAdd(null)">新增部门</el-button>
            </div>
          </template>
          <el-tree
            :data="store.tree"
            node-key="id"
            default-expand-all
            highlight-current
            :expand-on-click-node="false"
            @node-click="handleNodeClick"
          >
            <template #default="{ data }">
              <span class="tree-node">
                <span>{{ data.label }}</span>
                <span class="tree-meta">{{ data.memberCount }}人</span>
              </span>
            </template>
          </el-tree>
        </el-card>
      </el-col>
      <el-col :span="17" class="col-height" style="padding-left: 3px;">
        <el-card class="full-card">
          <template #header>
            <div class="card-header">
              <span>{{ currentNode ? currentNode.label + ' — 详情' : '请选择部门' }}</span>
              <div v-if="currentNode">
                <el-button type="primary" size="small" @click="openAdd(currentNode.id)">新增子部门</el-button>
                <el-button size="small" @click="openEdit">编辑</el-button>
                <el-button type="danger" size="small" @click="handleDelete">删除</el-button>
              </div>
            </div>
          </template>
          <div v-if="!currentNode" class="empty-hint">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
              <path d="M3 21h18M3 21v-4m0 4h4M3 21l8-8M21 8v5M21 8h-5m5 0l-4 4" />
              <circle cx="12" cy="3" r="2" />
            </svg>
            <span>请从左侧选择部门查看详情</span>
          </div>
          <el-descriptions v-else :column="2" border>
            <el-descriptions-item label="名称">{{ currentNode.label }}</el-descriptions-item>
            <el-descriptions-item label="负责人">{{ currentNode.manager }}</el-descriptions-item>
            <el-descriptions-item label="人数">{{ currentNode.memberCount }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="currentNode.status === '启用' ? 'success' : 'danger'" size="small">{{ currentNode.status }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="排序">{{ currentNode.sort }}</el-descriptions-item>
          </el-descriptions>
          <div v-if="currentNode && currentNode.children.length > 0" style="margin-top: 20px">
            <h4 style="margin-bottom: 12px">子部门</h4>
            <el-table :data="currentNode.children" border size="small">
              <el-table-column prop="label" label="名称" />
              <el-table-column prop="manager" label="负责人" width="100" />
              <el-table-column prop="memberCount" label="人数" width="70" />
              <el-table-column prop="status" label="状态" width="80">
                <template #default="{ row }">
                  <el-tag :type="row.status === '启用' ? 'success' : 'danger'" size="small">{{ row.status }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="140">
                <template #default="{ row }">
                  <el-button type="primary" link size="small" @click="openEditNode(row)">编辑</el-button>
                  <el-button type="danger" link size="small" @click="handleDeleteNode(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="dialogVisible" :title="editingNode ? '编辑部门' : '新增部门'" width="520px" @close="resetForm">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="label">
          <el-input v-model="form.label" placeholder="请输入部门名称" />
        </el-form-item>
        <el-form-item label="负责人" prop="manager">
          <el-input v-model="form.manager" placeholder="请输入负责人" />
        </el-form-item>
        <el-form-item label="人数" prop="memberCount">
          <el-input-number v-model="form.memberCount" :min="0" :max="999" style="width: 100%" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="1" :max="999" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio value="启用">启用</el-radio>
            <el-radio value="禁用">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="!editingNode" label="上级部门" prop="parentId">
          <el-input :model-value="parentLabel" disabled />
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
import { useOrganizationStore, type OrgNode } from '../stores/organization'

const store = useOrganizationStore()
onMounted(() => store.fetchTree())
const currentNode = ref<OrgNode | null>(null)
const dialogVisible = ref(false)
const editingNode = ref<OrgNode | null>(null)
const formRef = ref()
const parentId = ref<number | null>(null)

const form = reactive({
  label: '', manager: '', memberCount: 0, sort: 1,
  status: '启用' as '启用' | '禁用',
})

const rules = {
  label: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
  manager: [{ required: true, message: '请输入负责人', trigger: 'blur' }],
}

const parentLabel = ref('')

function handleNodeClick(node: OrgNode) {
  currentNode.value = node
}

function openAdd(pid: number | null) {
  editingNode.value = null
  parentId.value = pid
  parentLabel.value = pid === null ? '顶级部门' : (store.tree[0] ? findLabel(store.tree, pid) : '')
  Object.assign(form, { label: '', manager: '', memberCount: 0, sort: 1, status: '启用' })
  dialogVisible.value = true
}

function findLabel(nodes: OrgNode[], id: number): string {
  for (const n of nodes) {
    if (n.id === id) return n.label
    const r = findLabel(n.children, id)
    if (r) return r
  }
  return ''
}

function openEdit() {
  if (!currentNode.value) return
  editingNode.value = currentNode.value
  const n = currentNode.value
  parentId.value = n.parentId
  parentLabel.value = n.parentId === null ? '顶级部门' : findLabel(store.tree, n.parentId)
  Object.assign(form, { label: n.label, manager: n.manager, memberCount: n.memberCount, sort: n.sort, status: n.status })
  dialogVisible.value = true
}

function openEditNode(node: OrgNode) {
  currentNode.value = node
  openEdit()
}

function resetForm() {
  formRef.value?.resetFields()
}

async function submitForm() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  if (editingNode.value) {
    await store.updateNode(editingNode.value.id, { ...form })
    ElMessage.success('修改成功')
  } else {
    await store.addNode(parentId.value, { ...form })
    ElMessage.success('新增成功')
  }
  dialogVisible.value = false
}

async function handleDelete() {
  if (!currentNode.value) return
  try {
    await ElMessageBox.confirm(`确认删除部门「${currentNode.value.label}」？子部门将上移。`, '提示', { type: 'warning' })
    await store.deleteNode(currentNode.value!.id)
    currentNode.value = null
    ElMessage.success('删除成功')
  } catch {}
}

async function handleDeleteNode(node: OrgNode) {
  try {
    await ElMessageBox.confirm(`确认删除部门「${node.label}」？`, '提示', { type: 'warning' })
    await store.deleteNode(node.id)
    if (currentNode.value?.id === node.id) currentNode.value = null
    ElMessage.success('删除成功')
  } catch {}
}
</script>

<style scoped>
.page-container {
  height: 100%;
  padding: 16px;
  overflow: hidden;
  background: #f0f2f5;
}

.full-height { height: 100%; }

.col-height { height: 100%; }

.full-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  border: none;
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
}

.full-card :deep(.el-card__header) {
  padding: 14px 20px;
  border-bottom: 1px solid #f1f5f9;
}

.full-card :deep(.el-card__body) {
  flex: 1;
  overflow: auto;
  padding: 16px 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #1e293b;
  font-size: 14px;
}

.tree-node {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1;
  padding-right: 8px;
  font-size: 14px;
}

.tree-meta {
  font-size: 12px;
  color: #94a3b8;
}

.empty-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #94a3b8;
  font-size: 14px;
  gap: 12px;
}

.empty-hint svg {
  width: 64px;
  height: 64px;
  opacity: 0.3;
}

:deep(.el-tree-node__content) {
  border-radius: 6px;
  margin: 1px 0;
  transition: background 0.15s;
}

:deep(.el-tree-node__content:hover) {
  background: #f1f5f9;
}

:deep(.el-tree-node__content:focus-visible) {
  outline: 2px solid #3b82f6;
  outline-offset: -2px;
}

:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background: #eff6ff;
  color: #3b82f6;
}

:deep(.el-descriptions__label) {
  background: #f8fafc;
}

.card-header :deep(.el-button) {
  touch-action: manipulation;
}
</style>
