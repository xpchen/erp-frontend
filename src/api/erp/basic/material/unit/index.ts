import request from '@/config/axios'

// ERP 物料单位 VO
export interface MaterialUnitVO {
  id: number // 单位编号
  name: string // 单位名字
  status: number // 单位状态
}

const PREFIX: string = '/erp/material-unit'

// ERP 物料单位 API
export const MaterialUnitApi = {
  // 查询物料单位分页
  getMaterialUnitPage: async (params: any) => {
    return await request.get({ url: `${PREFIX}/page`, params })
  },

  // 查询物料单位精简列表
  getMaterialUnitSimpleList: async () => {
    return await request.get({ url: `${PREFIX}/simple-list` })
  },

  // 查询物料单位详情
  getMaterialUnit: async (id: number) => {
    return await request.get({ url: `${PREFIX}/get?id=${id}` })
  },

  // 新增物料单位
  createMaterialUnit: async (data: MaterialUnitVO) => {
    return await request.post({ url: `${PREFIX}/create`, data })
  },

  // 修改物料单位
  updateMaterialUnit: async (data: MaterialUnitVO) => {
    return await request.put({ url: `${PREFIX}/update`, data })
  },

  // 删除物料单位
  deleteMaterialUnit: async (id: number) => {
    return await request.delete({ url: `${PREFIX}/delete?id=${id}` })
  },

  // 导出物料单位 Excel
  exportMaterialUnit: async (params) => {
    return await request.download({ url: `${PREFIX}/export-excel`, params })
  }
}
