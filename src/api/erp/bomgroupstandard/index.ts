import request from '@/config/axios'

// bom分组 VO
export interface BomGroupStandardVO {
  id: number // 编号
  name: string // 名称
  number: string // 编码
  description: string // 描述
  simplename: string // 简称
  parentid: number // 父节点
}

// bom分组 API
export const BomGroupStandardApi = {
  // 查询bom分组列表
  getBomGroupStandardList: async (params) => {
    return await request.get({ url: `/erp/bom-group-standard/list`, params })
  },

  // 查询bom分组详情
  getBomGroupStandard: async (id: number) => {
    return await request.get({ url: `/erp/bom-group-standard/get?id=` + id })
  },

  // 新增bom分组
  createBomGroupStandard: async (data: BomGroupStandardVO) => {
    return await request.post({ url: `/erp/bom-group-standard/create`, data })
  },

  // 修改bom分组
  updateBomGroupStandard: async (data: BomGroupStandardVO) => {
    return await request.put({ url: `/erp/bom-group-standard/update`, data })
  },

  // 删除bom分组
  deleteBomGroupStandard: async (id: number) => {
    return await request.delete({ url: `/erp/bom-group-standard/delete?id=` + id })
  },

  // 导出bom分组 Excel
  exportBomGroupStandard: async (params) => {
    return await request.download({ url: `/erp/bom-group-standard/export-excel`, params })
  },
}