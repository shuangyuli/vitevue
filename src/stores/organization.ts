import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api'

export interface OrgNode {
  id: number
  label: string
  parentId: number | null
  children: OrgNode[]
  manager: string
  memberCount: number
  sort: number
  status: '启用' | '禁用'
}

export const useOrganizationStore = defineStore('organization', () => {
  const tree = ref<OrgNode[]>([])

  async function fetchTree() {
    const { data } = await api.get('/organization/tree')
    if (data.code === 200) {
      tree.value = data.data
    }
  }

  async function addNode(parentId: number | null, payload: Record<string, unknown>) {
    const body = parentId !== null ? { ...payload, parentId } : payload
    const { data } = await api.post('/organization', body)
    if (data.code === 200) {
      await fetchTree()
    }
  }

  async function updateNode(id: number, payload: Record<string, unknown>) {
    const { data } = await api.put(`/organization/${id}`, payload)
    if (data.code === 200) {
      await fetchTree()
    }
  }

  async function deleteNode(id: number) {
    const { data } = await api.delete(`/organization/${id}`)
    if (data.code === 200) {
      await fetchTree()
    }
  }

  return { tree, fetchTree, addNode, updateNode, deleteNode }
})
