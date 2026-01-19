import request from '@/config/axios'

// 工艺路线 VO
export interface ProduceRoutingVO {
  id: number // ID
  routingName: string // 工艺路线名称
  materialId: number // 物料编码
  materialNumber: undefined,
  materialName: undefined,
  description: string // 描述
  status: number // 状态
  totalLeadTime: number // 总时间
  totalProcessPrice: number // 总工价
}

// 工艺路线 API
export const ProduceRoutingApi = {
  // 查询工艺路线分页
  getProduceRoutingPage: async (params: any) => {
    return await request.get({ url: `/erp/produce-routing/page`, params })
  },

  // 查询工艺路线详情
  getProduceRouting: async (id: number) => {
    return await request.get({ url: `/erp/produce-routing/get?id=` + id })
  },

  // 新增工艺路线
  createProduceRouting: async (data: ProduceRoutingVO) => {
    return await request.post({ url: `/erp/produce-routing/create`, data })
  },

  // 修改工艺路线
  updateProduceRouting: async (data: ProduceRoutingVO) => {
    return await request.put({ url: `/erp/produce-routing/update`, data })
  },

  // 删除工艺路线
  deleteProduceRouting: async (id: number) => {
    return await request.delete({ url: `/erp/produce-routing/delete?id=` + id })
  },

  // 导出工艺路线 Excel
  exportProduceRouting: async (params) => {
    return await request.download({ url: `/erp/produce-routing/export-excel`, params })
  },

  getProduceRoutingMap: async(materialId: number) => {
    return await request.get({ url: `/erp/produce-routing/get/` + materialId })
  },

// ==================== 子表（工艺路线明细） ====================

  // 获得工艺路线明细列表
  getProduceRoutingDetailListByRoutingId: async (routingId) => {
    return await request.get({ url: `/erp/produce-routing/produce-routing-detail/list-by-routing-id?routingId=` + routingId })
  },

  // 获得工艺路线明细工序列表
  getProduceRoutingDetailListByMaterialId: async (materialId) => {
    return await request.get({ url: `/erp/produce-routing/produce-routing-detail/list-by-material-id?materialId=` + materialId })
  },
}
