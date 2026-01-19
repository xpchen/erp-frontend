import request from '@/config/axios'

// 物料采购属性 DTO
export interface MaterialPurchasingDTO {
  id: number // 编号
  status: number // 采购状态
  statusDesc: string // 采购状态
  materialId: number // 物料
  purPersonId: number // 采购员
  supplierId: number // 供应商
  producingArea: string // 产地
  produceFactory: string // 生产厂家
  price: number // 参考单价
  priceTop: number // 最高限价
  daydAhead: number // 收货可提前天数
  appointPurOrgId: number // 指定采购组织
  purchaseCheckType: number // 采购检验
  purchaseCheckTypeDesc: string // 采购检验
  purGroup: string // 采购组
}

// 物料采购属性 API
export const MaterialPurchasingApi = {
  // 查询物料采购属性分页
  getMaterialPurchasingPage: async (params: any) => {
    return await request.get({ url: `/erp/material-purchasing/page`, params })
  },

  // 查询物料采购属性详情
  getMaterialPurchasing: async (id: number) => {
    return await request.get({ url: `/erp/material-purchasing/get?id=` + id })
  },

  // 新增物料采购属性
  createMaterialPurchasing: async (data: MaterialPurchasingDTO) => {
    return await request.post({ url: `/erp/material-purchasing/create`, data })
  },

  // 修改物料采购属性
  updateMaterialPurchasing: async (data: MaterialPurchasingDTO) => {
    return await request.put({ url: `/erp/material-purchasing/update`, data })
  },

  // 删除物料采购属性
  deleteMaterialPurchasing: async (id: number) => {
    return await request.delete({ url: `/erp/material-purchasing/delete?id=` + id })
  },

  // 导出物料采购属性 Excel
  exportMaterialPurchasing: async (params) => {
    return await request.download({ url: `/erp/material-purchasing/export-excel`, params })
  },
}
