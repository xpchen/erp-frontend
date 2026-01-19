import request from '@/config/axios'

// 生产入库事务 VO
export interface ProduceInEventVO {
  id: number // ID
  produceInId: number // 生产入库单ID
  inType: number // 入库类型
  status: number // 状态
  produceInNo: string // 生产入库单号
}

// 生产入库事务 API
export const ProduceInEventApi = {
  // 查询生产入库事务分页
  getProduceInEventPage: async (params: any) => {
    return await request.get({ url: `/erp/produce-in-event/page`, params })
  },

  // 查询生产入库事务详情
  getProduceInEvent: async (id: number) => {
    return await request.get({ url: `/erp/produce-in-event/get?id=` + id })
  },

  // 新增生产入库事务
  createProduceInEvent: async (data: ProduceInEventVO) => {
    return await request.post({ url: `/erp/produce-in-event/create`, data })
  },

  // 修改生产入库事务
  updateProduceInEvent: async (data: ProduceInEventVO) => {
    return await request.put({ url: `/erp/produce-in-event/update`, data })
  },

  // 删除生产入库事务
  deleteProduceInEvent: async (id: number) => {
    return await request.delete({ url: `/erp/produce-in-event/delete?id=` + id })
  },

  // 导出生产入库事务 Excel
  exportProduceInEvent: async (params) => {
    return await request.download({ url: `/erp/produce-in-event/export-excel`, params })
  },

// ==================== 子表（生产入库事务明细） ====================

  // 获得生产入库事务明细列表
  getProduceInEventItemsListByParentId: async (parentId) => {
    return await request.get({ url: `/erp/produce-in-event/produce-in-event-items/list-by-parent-id?parentId=` + parentId })
  },
}
