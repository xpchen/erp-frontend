import request from '@/config/axios'

// 主计划 VO
export interface MainPlanVO {
  id: number // ID
  no: string // 计划编码
  sourceBillId: number // 源单据ID
  sourceBillNo: string // 来源单据编码
  sourceDetailId: number // 来源单据行号
  materialId: number // 物料ID
  unitId: number // 单位
  unitName: String // 单位
  mode: string // 规格型号
  qty: number // 数量
  remark: string // 备注
  startDate: Date // 开工日期
  endDate: Date // 完工日期
  materialAttr: boolean // 物料属性
  mrpSelected: boolean // MRP选单
  status: number // 状态
}

// 主计划 API
export const MainPlanApi = {
  // 查询主计划分页
  getMainPlanPage: async (params: any) => {
    return await request.get({ url: `/erp/main-plan/page`, params })
  },

  // 查询主计划详情
  getMainPlan: async (id: number) => {
    return await request.get({ url: `/erp/main-plan/get?id=` + id })
  },

  // 新增主计划
  createMainPlan: async (data: MainPlanVO) => {
    return await request.post({ url: `/erp/main-plan/create`, data })
  },

  // 修改主计划
  updateMainPlan: async (data: MainPlanVO) => {
    return await request.put({ url: `/erp/main-plan/update`, data })
  },

  // 删除主计划
  deleteMainPlan: async (id: number) => {
    return await request.delete({ url: `/erp/main-plan/delete?id=` + id })
  },

  // 导出主计划 Excel
  exportMainPlan: async (params) => {
    return await request.download({ url: `/erp/main-plan/export-excel`, params })
  },

  // 自动生成主计划
  autoGenerateMainPlan: async (data: any) => {
    return await request.post({ url: `/erp/main-plan/auto-generate`, data })
  },
}
