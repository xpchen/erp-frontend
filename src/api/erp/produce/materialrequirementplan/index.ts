import request from '@/config/axios'

// 物料需求计划 VO
export interface MaterialRequirementPlanVO {
  id: number // 主键ID
  producePlanId: number // 主计划ID
  mrpNo: string // 物料需求计划编码
  status: number // 审批状态
  issuedStatus: number // 下达状态
  mrpDesc: string // 物料需求计划描述
  createTime: Date // 创建时间
}

export interface MrpCalculationDTO {
  produceMainPlanNoList: string[];
}

export interface MrpApprovalDTO {
  id: number;
  status: number;
}

// 物料需求计划 API
export const MaterialRequirementPlanApi = {

 // MRP计算
 mrpCalculation: async (data: MrpCalculationDTO) => {
  return await request.post({ url: `/erp/material-requirement-plan/calculation`, data})
},

 // MRP任务下达
 mrpTaskDispatch: async (data: number) => {
  return await request.post({ url: `/erp/material-requirement-plan/mrpTaskDispatch`, data})
},

// MRP批量任务下达
 mrpBatchTaskDispatch: async (data: number[]) => {
  return await request.post({ url: `/erp/material-requirement-plan/mrpBatchTaskDispatch`, data})
},

 // MRP审批
 mrpApproval: async (data: MrpApprovalDTO) => {
  return await request.put({ url: `/erp/material-requirement-plan/mrpApproval`, data})
},

  // 查询物料需求计划分页
  getMaterialRequirementPlanPage: async (params: any) => {
    return await request.get({ url: `/erp/material-requirement-plan/page`, params })
  },

  // 查询物料需求计划详情
  getMaterialRequirementPlan: async (id: number) => {
    return await request.get({ url: `/erp/material-requirement-plan/get?id=` + id })
  },

  // 查询物料需求计划详情
  getInfo: async (materialRequirementPlanId: number) => {
    return await request.get({ url: `/erp/material-requirement-plan/getInfo?materialRequirementPlanId=` + materialRequirementPlanId })
  },

  // 查询物料需求计划详情
  getItemInfo: async (materialRequirementPlanId: number) => {
    return await request.get({ url: `/erp/material-requirement-plan/getItemInfo?materialRequirementPlanId=` + materialRequirementPlanId })
  },

  // 新增物料需求计划
  createMaterialRequirementPlan: async (data: MaterialRequirementPlanVO) => {
    return await request.post({ url: `/erp/material-requirement-plan/create`, data })
  },

  // 修改物料需求计划
  updateMaterialRequirementPlan: async (data: MaterialRequirementPlanVO) => {
    return await request.put({ url: `/erp/material-requirement-plan/update`, data })
  },

  // 删除物料需求计划
  deleteMaterialRequirementPlan: async (id: number) => {
    return await request.delete({ url: `/erp/material-requirement-plan/delete?id=` + id })
  },

  // 导出物料需求计划 Excel
  exportMaterialRequirementPlan: async (params) => {
    return await request.download({ url: `/erp/material-requirement-plan/export-excel`, params })
  },
}
