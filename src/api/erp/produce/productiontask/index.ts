import request from '@/config/axios'

// 生产任务 VO
export interface ProductionTaskVO {
  id: number // 主键ID
  name: string // 任务名称
  productionTaskNo: string // 任务单编号
  productMainPlanId: number // 主计划ID
  sourceBillId: number // 源单据ID
  sourceBillNo: string // 来源单据编码
  sourceDetailId: number // 来源单据行号
  materialId: number // 物料ID
  materialNumber: string // 物料编码
  materialName: string // 物料名称
  materialSpec: string // 物料规格
  materialUnit: string // 物料单位名称
  plannedQuantity: number // 计划生产数量
  actualQuantity: number // 实际生产数量
  produceRoutingId: number // 工艺路线ID
  priority: number // 优先级(1-紧急 2-高 3-中 4-低)
  status: number // 状态(1-待生产 2-生产中 3-已完成 4-已取消)
  startWorkTime: Date // 开工时间
  endWorkTime: Date // 完工时间
  remark: string // 备注
}

// 生产任务 API
export const ProductionTaskApi = {
  // 查询生产任务分页
  getProductionTaskPage: async (params: any) => {
    return await request.get({ url: `/erp/production-task/page`, params })
  },

  // 查询生产任务详情
  getProductionTask: async (id: number) => {
    return await request.get({ url: `/erp/production-task/get?id=` + id })
  },

  // 新增生产任务
  createProductionTask: async (data: ProductionTaskVO) => {
    return await request.post({ url: `/erp/production-task/create`, data })
  },

  // 修改生产任务
  updateProductionTask: async (data: ProductionTaskVO) => {
    return await request.put({ url: `/erp/production-task/update`, data })
  },

  // 删除生产任务
  deleteProductionTask: async (id: number) => {
    return await request.delete({ url: `/erp/production-task/delete?id=` + id })
  },

  // 导出生产任务 Excel
  exportProductionTask: async (params) => {
    return await request.download({ url: `/erp/production-task/export-excel`, params })
  },

// ==================== 子表（生产任务单物料清单） ====================

  // 获得生产任务单物料清单列表
  getProductionTaskMaterialListByProductionTaskId: async (productionTaskId) => {
    return await request.get({ url: `/erp/production-task/production-task-material/list-by-production-task-id?productionTaskId=` + productionTaskId })
  },

// ==================== 子表（生产任务单工序） ====================

  // 获得生产任务单工序列表
  getProductionTaskProcessesListByProductionTaskId: async (productionTaskId) => {
    return await request.get({ url: `/erp/production-task/production-task-processes/list-by-production-task-id?productionTaskId=` + productionTaskId })
  },
}
