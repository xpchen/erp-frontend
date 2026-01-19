import request from '@/config/axios'

// 物料计划资料 DTO
export interface MaterialPlanDTO {
  id: number // 编号
  status: boolean // 计划状态(0:未核准 1:核准 2:禁用 3:已删除)
  freezeOrgUnit: string // 禁用组织
  materialId: number // 物料
  materialAttr: string // 物料属性( 10010:规划件 10020:虚拟件 10030:自制件 10040:外购件 10050:委外件 10060:其他)
  planStrategy: string // 制造策略( 10110:MTS10基于预测 10120:MTS11基于预测(只计算毛需求，不考虑库存) 10130:MTS20基于预测和订单)
  materialChar: string // 物料特性(10410:主物料 10420:主辅料 10430:主参配料 0:)
  batchincQty: number // 批量增量
  produceLeadTime: number // 生产周期(天)
  recevingLeadTime: number // 采购周期(天)
  dutyDepartmentId: number // 责任部门
  isBackFlush: boolean // 是否倒冲
  issMode: string // 领送料模式(11010:生产领料 11030:看板 11050:直送 11040:不领料)
  issLeadTime: number // 领料提前期
  planningMode: boolean // 计划类型(0:人工订货 1:再订货点 2:MPS 3:MRP)
  isKeyPart: boolean // 关重件
  qualityOrgId: number // 质检组织
  productLineId: number // 生产线
  purOrgId: number // 默认采购组织
}

// 物料计划资料 API
export const MaterialPlanApi = {
  // 查询物料计划资料分页
  getMaterialPlanPage: async (params: any) => {
    return await request.get({ url: `/erp/material-plan/page`, params })
  },

  // 查询物料计划资料详情
  getMaterialPlan: async (id: number) => {
    return await request.get({ url: `/erp/material-plan/get?id=` + id })
  },

  // 新增物料计划资料
  createMaterialPlan: async (data: MaterialPlanDTO) => {
    return await request.post({ url: `/erp/material-plan/create`, data })
  },

  // 修改物料计划资料
  updateMaterialPlan: async (data: MaterialPlanDTO) => {
    return await request.put({ url: `/erp/material-plan/update`, data })
  },

  // 删除物料计划资料
  deleteMaterialPlan: async (id: number) => {
    return await request.delete({ url: `/erp/material-plan/delete?id=` + id })
  },

  // 导出物料计划资料 Excel
  exportMaterialPlan: async (params) => {
    return await request.download({ url: `/erp/material-plan/export-excel`, params })
  },
}
