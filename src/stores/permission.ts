import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api'

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

export const usePermissionStore = defineStore('permission', () => {
  const roles = ref<Role[]>([])
  const allPermissions = ref<PermissionTreeNode[]>([])
  const selectedRoleId = ref<number | null>(null)
  const selectedRole = ref<Role | null>(null)

  async function fetchRoles() {
    const { data } = await api.get('/roles')
    if (data.code === 200) {
      roles.value = data.data
    }
  }

  async function fetchPermissions() {
    const { data } = await api.get('/permissions/tree')
    if (data.code === 200) {
      allPermissions.value = data.data
    }
  }

  function selectRole(id: number) {
    selectedRoleId.value = id
    selectedRole.value = roles.value.find(r => r.id === id) || null
  }

  async function addRole(payload: Record<string, unknown>) {
    const { data } = await api.post('/roles', payload)
    if (data.code === 200) {
      await fetchRoles()
    }
  }

  async function updateRole(id: number, payload: Partial<Role>) {
    const { data } = await api.put(`/roles/${id}`, payload)
    if (data.code === 200) {
      await fetchRoles()
      if (selectedRoleId.value === id) {
        selectRole(id)
      }
    }
  }

  async function deleteRole(id: number) {
    const { data } = await api.delete(`/roles/${id}`)
    if (data.code === 200) {
      await fetchRoles()
      if (selectedRoleId.value === id) {
        selectedRoleId.value = null
        selectedRole.value = null
      }
    }
  }

  async function updateRolePermissions(id: number, permissions: string[]) {
    const { data } = await api.put(`/roles/${id}/permissions`, { permissions })
    if (data.code === 200) {
      await fetchRoles()
      if (selectedRoleId.value === id) {
        selectRole(id)
      }
    }
  }

  return { roles, allPermissions, selectedRoleId, selectedRole, selectRole, fetchRoles, fetchPermissions, addRole, updateRole, deleteRole, updateRolePermissions }
})
