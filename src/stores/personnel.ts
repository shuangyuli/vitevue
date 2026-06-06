import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api'

export interface Personnel {
  id: number
  name: string
  phone: string
  email: string
  department: string
  position: string
  status: '在职' | '离职'
  joinDate: string
  roleId?: number
  roleName?: string
}

export interface PersonnelQuery {
  keyword: string
  department: string
  status: string
  page: number
  pageSize: number
}

export const usePersonnelStore = defineStore('personnel', () => {
  const source = ref<Personnel[]>([])
  const total = ref(0)
  const loading = ref(false)

  const query = ref<PersonnelQuery>({
    keyword: '',
    department: '',
    status: '',
    page: 1,
    pageSize: 10,
  })

  const pagedList = computed(() => source.value)

  async function fetchList() {
    loading.value = true
    try {
      const { data } = await api.get('/personnel', { params: query.value })
      if (data.code === 200) {
        source.value = data.data.data
        total.value = data.data.total
      }
    } finally {
      loading.value = false
    }
  }

  async function addPersonnel(payload: Omit<Personnel, 'id'>) {
    const { data } = await api.post('/personnel', payload)
    if (data.code === 200) {
      await fetchList()
    }
  }

  async function updatePersonnel(id: number, payload: Partial<Personnel>) {
    const { data } = await api.put(`/personnel/${id}`, payload)
    if (data.code === 200) {
      await fetchList()
    }
  }

  async function deletePersonnel(id: number) {
    const { data } = await api.delete(`/personnel/${id}`)
    if (data.code === 200) {
      await fetchList()
    }
  }

  function resetQuery() {
    query.value = { keyword: '', department: '', status: '', page: 1, pageSize: 10 }
    fetchList()
  }

  return { source, query, total, loading, pagedList, fetchList, addPersonnel, updatePersonnel, deletePersonnel, resetQuery }
})
