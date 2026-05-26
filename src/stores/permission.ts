import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Role {
  id: number
  name: string
  description: string
  permissions: string[]
  memberCount: number
  createdAt: string
}

export interface PermissionTreeNode {
  id: string
  label: string
  children?: PermissionTreeNode[]
}

const allPermissions: PermissionTreeNode[] = [
  {
    id: 'dashboard', label: '数据大屏',
    children: [{ id: 'dashboard:view', label: '查看' }],
  },
  {
    id: 'personnel', label: '人员管理',
    children: [
      { id: 'personnel:view', label: '查看' },
      { id: 'personnel:add', label: '新增' },
      { id: 'personnel:edit', label: '编辑' },
      { id: 'personnel:delete', label: '删除' },
    ],
  },
  {
    id: 'organization', label: '机构管理',
    children: [
      { id: 'organization:view', label: '查看' },
      { id: 'organization:add', label: '新增' },
      { id: 'organization:edit', label: '编辑' },
      { id: 'organization:delete', label: '删除' },
    ],
  },
  {
    id: 'permission', label: '权限设置',
    children: [
      { id: 'permission:view', label: '查看' },
      { id: 'permission:add', label: '新增' },
      { id: 'permission:edit', label: '编辑' },
      { id: 'permission:delete', label: '删除' },
    ],
  },
]

const defaultRoles: Role[] = [
  {
    id: 1, name: '超级管理员', description: '拥有系统所有权限',
    permissions: allPermissions.flatMap(g => [g.id, ...(g.children || []).map(c => c.id)]),
    memberCount: 2, createdAt: '2024-01-15',
  },
  {
    id: 2, name: '普通管理员', description: '可管理大部分业务',
    permissions: [
      'dashboard:view', 'personnel:view', 'personnel:add', 'personnel:edit',
      'organization:view', 'organization:edit', 'permission:view',
    ],
    memberCount: 5, createdAt: '2024-03-20',
  },
  {
    id: 3, name: '编辑员', description: '可查看和编辑内容',
    permissions: ['dashboard:view', 'personnel:view', 'personnel:edit', 'organization:view', 'organization:edit'],
    memberCount: 8, createdAt: '2024-06-10',
  },
  {
    id: 4, name: '访客', description: '仅可查看数据',
    permissions: ['dashboard:view', 'personnel:view', 'organization:view'],
    memberCount: 12, createdAt: '2025-01-01',
  },
]

export const usePermissionStore = defineStore('permission', () => {
  const roles = ref<Role[]>([...defaultRoles])
  const selectedRoleId = ref<number | null>(null)
  let nextId = 5

  const selectedRole = ref<Role | null>(null)

  function selectRole(id: number) {
    selectedRoleId.value = id
    selectedRole.value = roles.value.find(r => r.id === id) || null
  }

  function addRole(data: Omit<Role, 'id' | 'memberCount' | 'createdAt'>) {
    roles.value.push({
      id: nextId++, memberCount: 0, createdAt: new Date().toISOString().slice(0, 10), ...data,
    })
  }

  function updateRole(id: number, data: Partial<Role>) {
    const idx = roles.value.findIndex(r => r.id === id)
    if (idx !== -1) {
      roles.value[idx] = { ...roles.value[idx], ...data }
      if (selectedRoleId.value === id) {
        selectedRole.value = roles.value[idx]
      }
    }
  }

  function deleteRole(id: number) {
    roles.value = roles.value.filter(r => r.id !== id)
    if (selectedRoleId.value === id) {
      selectedRoleId.value = null
      selectedRole.value = null
    }
  }

  function updateRolePermissions(id: number, permissions: string[]) {
    const idx = roles.value.findIndex(r => r.id === id)
    if (idx !== -1) {
      roles.value[idx].permissions = permissions
      if (selectedRoleId.value === id) {
        selectedRole.value!.permissions = permissions
      }
    }
  }

  return { roles, allPermissions, selectedRoleId, selectedRole, selectRole, addRole, updateRole, deleteRole, updateRolePermissions }
})
