import request from '@/config/axios'

// ERP 物料 DTO
export type MaterialDTO = {
  id: number // 物料编号
  name: string // 物料名称
  barCode: string // 物料条码
  categoryId: number // 物料类型编号
  unitId: number // 单位编号
  unitName?: string // 单位名字
  status: number // 物料状态
  standard: string // 物料规格
  remark: string // 物料备注
  expiryDay: number // 保质期天数
  weight: number // 重量（kg）
  purchasePrice: number // 采购价格，单位：元
  salePrice: number // 销售价格，单位：元
  minPrice: number // 最低价格，单位：元
  planInfo: PlanDTO // 计划属性
}

// 计划属性
export type PlanDTO = {
  id: undefined,
  status: undefined,  // 计划状态
  freezeOrgUnit: undefined,
  materialId: undefined,    // 物料
  materialAttr: undefined,    // 物料属性
  planStrategy: undefined,  // 制造策略
  materialChar: undefined,    // 物料特性
  batchincQty: undefined,  // 批量增量
  isBackFlush: undefined,   // 是否倒冲
  produceLeadTime: undefined,    // 提前期(天)
  recevingLeadTime: undefined,       // 收货提前期(天)
  dutyDepartmentId: undefined,
  isKeyPart: undefined,
  qualityOrgId: undefined,
  productLineId: undefined,
  purOrgId: undefined,
  issMode: undefined,    // 领送料模式
  issLeadTime: undefined,   // 领料提前期
  planningMode: undefined,   // 计划方式
  replaceMode: undefined   // 替换方式
}

// 库存属性
export type InventoryDTO = {
  id: undefined,
  material_id: undefined,
  freezeOrgUnit: undefined,
  qtySafety: undefined,  // 安全库存
  isNegative: undefined,  // 允许负库存
  isBatchNo: undefined,  // 使用批号管理
  isSequenceNo: undefined,    // 使用序列号管理
  isLotNumber: undefined,    // 批次管理
  unitId: undefined,
  isBarcode: undefined,     // 条码管理
  issuePriorityMode: undefined,  // 出库优先方式
  isPeriodValid: undefined,   // 保质期管理
  periodValid: undefined,    // 保质期
  periodValidUnit: undefined,       // 保质期单位
  purchasingAheadDate: undefined,    // 采购提前期(天)
  defaultWarehouseId: undefined,    // 默认仓库
  isCheck: undefined,
  qualityOrgId: undefined
}

// 采购属性
export type PurchaseDTO = {
  id: undefined,
  materialId: number,
  status: number,
  purPersonId: number,
  supplierId: number,
  producingArea: string,
  produceFactory: string,
  price: number,
  priceTop: number,
  daydAhead: number,
  appointPurOrgId: number,
  purchaseCheckType: number,
  purGroup: number
}

export type MaterialUpdateReqDTO = {
  planInfo: PlanDTO | any
  inventoryInfo: InventoryDTO | any
  purchaseInfo: PurchaseDTO | any
}

// ERP 物料 API
export const MaterialApi = {
  // 查询物料分页
  getMaterialPage: async (params: any) => {
    return await request.get({ url: `/erp/material/page`, params })
  },

  // 查询物料精简列表
  getMaterialSimpleList: async () => {
    return await request.get({ url: `/erp/material/simple-list` })
  },

  // 查询物料精简列表(做BOM时用，必须有计划资料)
  getMaterialSimpleListForBom: async () => {
    return await request.get({ url: `/erp/material/simple-list-for-bom` })
  },

  // 查询物料详情
  getMaterial: async (id: number) => {
    return await request.get({ url: `/erp/material/get?id=` + id})
  },

  // 新增物料
  createMaterial: async (data: MaterialDTO) => {
    return await request.post({ url: `/erp/material/create`, data })
  },

  // 修改物料
  updateMaterial: async (data: MaterialDTO) => {
    return await request.put({ url: `/erp/material/update`, data })
  },

    // 新增物料采购属性
  createPurchaseInfo: async (data: PurchaseDTO) => {
    return await request.post({ url: `/erp/material/purchaseInfo/create`, data })
  },
  
    // 修改物料采购属性
  updatePurchaseInfo: async (data: PurchaseDTO) => {
    return await request.put({ url: `/erp/material/purchaseInfo/update`, data })
  },

  // 新增物料库存属性
  createInventoryInfo: async (data: InventoryDTO) => {
    return await request.post({ url: `/erp/material/materialInventory/create`, data })
  },
  
    // 修改物料库存属性
  updateInventoryInfo: async (data: InventoryDTO) => {
    return await request.put({ url: `/erp/material/materialInventory/update`, data })
  },
  // 新增物料库存属性
  createPlanInfo: async (data: PlanDTO) => {
  return await request.post({ url: `/erp/material/plan/create`, data })
  },

  // 修改物料计划属性
  updatePlanInfo: async (data: PlanDTO) => {
    return await request.put({ url: `/erp/material/plan/update`, data })
  },

  // 删除物料
  deleteMaterial: async (id: number) => {
    return await request.delete({ url: `/erp/material/delete?id=` + id })
  },

  // 导出物料 Excel
  exportMaterial: async (params) => {
    return await request.download({ url: `/erp/material/export-excel`, params })
  },

  // 获取物料采购资料
  getPurchaseInfo: async (parentId) => {
    return await request.get({ url : `erp/material/purchaseInfo/get?parentId=` + parentId})
  },

  // 获取物料库存资料
  getInventoryInfo: async (parentId) => {
    return await request.get({ url : `erp/material/materialInventory/get?parentId=` + parentId})
  },

  // 获取物料计划资料
  getPlanInfo: async (parentId) => {
    return await request.get({ url : `erp/material/plan/get?parentId=` + parentId})
  }
}
