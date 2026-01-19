import request from '@/config/axios'

// 物料库存属性 DTO
export interface MaterialInventoryDTO {
  id: number // 编号
  status: boolean // 物料状态(0:未核准 1:核准 2:禁用 3:已删除)
  freezeOrgUnit: string // 禁用组织
  materialId: number // 物料ID
  qtySafety: number // 安全库存
  isNegative: boolean // 允许负库存
  isBatchNo: boolean // 使用批号管理
  isSequenceNo: boolean // 使用序列号管理
  isLotNumber: boolean // 批次管理
  isBarcode: boolean // 条码管理
  issuePriorityMode: boolean // 出库优先方式(1:按批次号顺序 2:按批次先进先出 3:按批次后进先出 4:近效期)
  unitId: number // 计量单位
  isPeriodValid: boolean // 保质期管理z
  periodValid: number // 保质期
  periodValidUnit: boolean // 保质期单位(1:年 2:月 3:日)
  purchasingAheadDate: number // 采购提前期(天)
  defaultWarehouseId: number // 默认仓库
  isCheck: boolean // 是否检验
  qualityOrgId: number // 质检组织
}

// 物料库存属性 API
export const MaterialInventoryApi = {
  // 查询物料库存属性分页
  getMaterialInventoryPage: async (params: any) => {
    return await request.get({ url: `/erp/material-inventory/page`, params })
  },

  // 查询物料库存属性详情
  getMaterialInventory: async (id: number) => {
    return await request.get({ url: `/erp/material-inventory/get?id=` + id })
  },

  // 新增物料库存属性
  createMaterialInventory: async (data: MaterialInventoryDTO) => {
    return await request.post({ url: `/erp/material-inventory/create`, data })
  },

  // 修改物料库存属性
  updateMaterialInventory: async (data: MaterialInventoryDTO) => {
    return await request.put({ url: `/erp/material-inventory/update`, data })
  },

  // 删除物料库存属性
  deleteMaterialInventory: async (id: number) => {
    return await request.delete({ url: `/erp/material-inventory/delete?id=` + id })
  },

  // 导出物料库存属性 Excel
  exportMaterialInventory: async (params) => {
    return await request.download({ url: `/erp/material-inventory/export-excel`, params })
  },
}
