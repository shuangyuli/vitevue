import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Personnel {
  id: number
  name: string
  phone: string
  email: string
  department: string
  position: string
  status: '在职' | '离职'
  joinDate: string
}

export interface PersonnelQuery {
  keyword: string
  department: string
  status: string
  page: number
  pageSize: number
}

function generateMock(): Personnel[] {
  const departments = ['技术部', '市场部', '财务部', '人事部', '运营部']
  const positions = ['经理', '主管', '工程师', '专员', '助理']
  const surnames = ['张', '李', '王', '赵', '周', '吴', '郑', '孙', '钱', '陈', '刘', '杨', '黄', '马', '朱']
  const names = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '涛']

  const data: Personnel[] = []
  for (let i = 1; i <= 25; i++) {
    const dept = departments[i % departments.length]
    const s = surnames[i % surnames.length]
    const n = names[(i * 3) % names.length]
    data.push({
      id: i,
      name: s + n,
      phone: '138' + String(Math.floor(Math.random() * 90000000 + 10000000)),
      email: `user${i}@company.com`,
      department: dept,
      position: positions[i % positions.length],
      status: i % 7 === 0 ? '离职' : '在职',
      joinDate: `202${(i % 6)}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
    })
  }
  return data
}

export const usePersonnelStore = defineStore('personnel', () => {
  const source = ref<Personnel[]>(generateMock())
  const query = ref<PersonnelQuery>({
    keyword: '',
    department: '',
    status: '',
    page: 1,
    pageSize: 10,
  })

  const filteredList = computed(() => {
    let list = source.value
    if (query.value.keyword) {
      const kw = query.value.keyword.toLowerCase()
      list = list.filter(p => p.name.includes(kw) || p.phone.includes(kw) || p.email.includes(kw))
    }
    if (query.value.department) {
      list = list.filter(p => p.department === query.value.department)
    }
    if (query.value.status) {
      list = list.filter(p => p.status === query.value.status)
    }
    return list
  })

  const total = computed(() => filteredList.value.length)

  const pagedList = computed(() => {
    const start = (query.value.page - 1) * query.value.pageSize
    return filteredList.value.slice(start, start + query.value.pageSize)
  })

  let nextId = 26

  function addPersonnel(data: Omit<Personnel, 'id'>) {
    source.value.unshift({ id: nextId++, ...data })
  }

  function updatePersonnel(id: number, data: Partial<Personnel>) {
    const idx = source.value.findIndex(p => p.id === id)
    if (idx !== -1) {
      source.value[idx] = { ...source.value[idx], ...data }
    }
  }

  function deletePersonnel(id: number) {
    source.value = source.value.filter(p => p.id !== id)
  }

  function resetQuery() {
    query.value = { keyword: '', department: '', status: '', page: 1, pageSize: 10 }
  }

  return { source, query, filteredList, total, pagedList, addPersonnel, updatePersonnel, deletePersonnel, resetQuery }
})
