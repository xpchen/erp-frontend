import request from '@/config/axios'

// ERP 物料类别 VO
export interface MaterialCategoryVO {
  id: number // 类别编号
  parentId: number // 父类别编号
  name: string // 类别名称
  code: string // 类别编码
  sort: number // 类别排序
  status: number // 开启状态
}

const PREFIX: string = '/erp/material-category'

// ERP 物料类别 API
export const MaterialCategoryApi = {
  // 查询物料类别列表
  getMaterialCategoryList: async (params: any) => {
    return await request.get({ url: `${PREFIX}/list`, params})
  },

  // 查询物料类别精简列表
  getMaterialCategorySimpleList: async () => {
    return await request.get({ url: `${PREFIX}/simple-list` })
  },

  // 查询物料类别详情
  getMaterialCategory: async (id: number) => {
    return await request.get({ url: `${PREFIX}/get?id=${id}` })
  },

  // 新增物料类别
  createMaterialCategory: async (data: MaterialCategoryVO) => {
    return await request.post({ url: `${PREFIX}/create`, data })
  },

  // 修改物料类别
  updateMaterialCategory: async (data: MaterialCategoryVO) => {
    return await request.put({ url: `${PREFIX}/update`, data })
  },

  // 删除物料类别
  deleteMaterialCategory: async (id: number) => {
    return await request.delete({ url: `${PREFIX}/delete?id=${id}` })
  },

  // 导出物料类别 Excel
  exportMaterialCategory: async (params) => {
    return await request.download({ url: `${PREFIX}/export-excel`, params })
  }
}
