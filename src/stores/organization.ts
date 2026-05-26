import { defineStore } from 'pinia'
import { ref } from 'vue'

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

function buildTree(): OrgNode[] {
  const root: OrgNode = {
    id: 1, label: '总公司', parentId: null, children: [],
    manager: '张总', memberCount: 86, sort: 1, status: '启用',
  }
  root.children = [
    {
      id: 2, label: '技术部', parentId: 1, children: [
        { id: 6, label: '前端组', parentId: 2, children: [], manager: '李主管', memberCount: 8, sort: 1, status: '启用' },
        { id: 7, label: '后端组', parentId: 2, children: [], manager: '王主管', memberCount: 12, sort: 2, status: '启用' },
        { id: 8, label: '测试组', parentId: 2, children: [], manager: '赵主管', memberCount: 6, sort: 3, status: '启用' },
      ],
      manager: '李总监', memberCount: 26, sort: 1, status: '启用',
    },
    {
      id: 3, label: '市场部', parentId: 1, children: [
        { id: 9, label: '市场拓展组', parentId: 3, children: [], manager: '钱主管', memberCount: 10, sort: 1, status: '启用' },
        { id: 10, label: '品牌运营组', parentId: 3, children: [], manager: '周主管', memberCount: 8, sort: 2, status: '启用' },
      ],
      manager: '钱总监', memberCount: 18, sort: 2, status: '启用',
    },
    {
      id: 4, label: '财务部', parentId: 1, children: [
        { id: 11, label: '会计组', parentId: 4, children: [], manager: '孙主管', memberCount: 5, sort: 1, status: '启用' },
        { id: 12, label: '审计组', parentId: 4, children: [], manager: '陈主管', memberCount: 4, sort: 2, status: '启用' },
      ],
      manager: '孙部长', memberCount: 9, sort: 3, status: '启用',
    },
    {
      id: 5, label: '人事部', parentId: 1, children: [
        { id: 13, label: '招聘组', parentId: 5, children: [], manager: '吴主管', memberCount: 4, sort: 1, status: '启用' },
        { id: 14, label: '培训组', parentId: 5, children: [], manager: '郑主管', memberCount: 3, sort: 2, status: '禁用' },
      ],
      manager: '吴部长', memberCount: 7, sort: 4, status: '启用',
    },
  ]
  return [root]
}

let nextId = 15

export const useOrganizationStore = defineStore('organization', () => {
  const tree = ref<OrgNode[]>(buildTree())

  function findNode(nodes: OrgNode[], id: number): OrgNode | null {
    for (const node of nodes) {
      if (node.id === id) return node
      const found = findNode(node.children, id)
      if (found) return found
    }
    return null
  }

  function findParent(nodes: OrgNode[], id: number, parent: OrgNode | null = null): { node: OrgNode | null; children: OrgNode[] } | null {
    for (const node of nodes) {
      if (node.id === id) return { node: parent, children: nodes }
      const found = findParent(node.children, id, node)
      if (found) return found
    }
    return null
  }

  function addNode(parentId: number | null, data: Omit<OrgNode, 'id' | 'children' | 'parentId'>) {
    const node: OrgNode = { id: nextId++, children: [], parentId, ...data }
    if (parentId === null) {
      tree.value.push(node)
    } else {
      const parent = findNode(tree.value, parentId)
      if (parent) parent.children.push(node)
    }
  }

  function updateNode(id: number, data: Partial<OrgNode>) {
    const node = findNode(tree.value, id)
    if (node) {
      Object.assign(node, { label: data.label ?? node.label, manager: data.manager ?? node.manager, memberCount: data.memberCount ?? node.memberCount, sort: data.sort ?? node.sort, status: data.status ?? node.status })
    }
  }

  function deleteNode(id: number) {
    const result = findParent(tree.value, id)
    if (!result) return
    const { children } = result
    const idx = children.findIndex(n => n.id === id)
    if (idx !== -1) {
      const target = children[idx]
      if (target.children.length > 0) {
        const insertIdx = children.indexOf(target)
        children.splice(insertIdx, 1, ...target.children)
      } else {
        children.splice(idx, 1)
      }
    }
  }

  return { tree, addNode, updateNode, deleteNode }
})
