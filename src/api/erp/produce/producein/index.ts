import request from '@/config/axios'

// 生产入库-包含成品，半成品 VO
export interface ProduceInVO {
  id: number // ID
  produceInNo: string // 生产入库单号
  type: string // 类型
  status: string // 状态 
  bizDate: Date // 业务日期
  remark: string // 备注
  produceDept: number // 生产组织
  sourceBillNo:string // 来源单号
  produceInItemss: []
}

// 生产入库-包含成品，半成品 API
export const ProduceInApi = {
  // 查询生产入库-包含成品，半成品分页
  getProduceInPage: async (params: any) => {
    return await request.get({ url: `/erp/produce-in/page`, params })
  },

  // 查询生产入库-包含成品，半成品详情
  getProduceIn: async (id: number) => {
    return await request.get({ url: `/erp/produce-in/get?id=` + id })
  },

  // 新增生产入库-包含成品，半成品
  createProduceIn: async (data: ProduceInVO) => {
    return await request.post({ url: `/erp/produce-in/create`, data })
  },

  // 修改生产入库-包含成品，半成品
  updateProduceIn: async (data: ProduceInVO) => {
    return await request.put({ url: `/erp/produce-in/update`, data })
  },

  // 删除生产入库-包含成品，半成品
  deleteProduceIn: async (id: number) => {
    return await request.delete({ url: `/erp/produce-in/delete?id=` + id })
  },

  // 导出生产入库-包含成品，半成品 Excel
  exportProduceIn: async (params) => {
    return await request.download({ url: `/erp/produce-in/export-excel`, params })
  },

  // 更新生产入库单状态
  updateProduceInStatus: async (id: number, status: number) => {
    return await request.put({
      url: `/erp/produce-in/update-status`,
      params: {
        id,
        status
      }
    })
  },

// ==================== 子表（生产入库明细） ====================

  // 获得生产入库明细列表
  getProduceInItemsListByProduceInId: async (produceInId) => {
    return await request.get({ url: `/erp/produce-in/produce-in-items/list-by-produce-in-id?produceInId=` + produceInId })
  },
}
