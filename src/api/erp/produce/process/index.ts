import request from '@/config/axios'

// 工艺工序 VO
export interface ProduceProcessVO {
  id: number // ID
  codeNo: string // 工序编码
  processName: string // 工序名称
  workCenter: number // 工作中心
  workCenterName: string
  status: number // 状态(0:无效 1有效)
  description: string // 描述
}

// 工艺工序 API
export const ProduceProcessApi = {
  // 查询工艺工序分页
  getProduceProcessPage: async (params: any) => {
    return await request.get({ url: `/erp/produce-process/page`, params })
  },

  // 查询工艺工序列表
  getProduceProcessList: async () => {
    return await request.get({ url: `/erp/produce-process/list-all`})
  },

  // 查询工艺工序详情
  getProduceProcess: async (id: number) => {
    return await request.get({ url: `/erp/produce-process/get?id=` + id })
  },

  // 新增工艺工序
  createProduceProcess: async (data: ProduceProcessVO) => {
    return await request.post({ url: `/erp/produce-process/create`, data })
  },

  // 修改工艺工序
  updateProduceProcess: async (data: ProduceProcessVO) => {
    return await request.put({ url: `/erp/produce-process/update`, data })
  },

  // 删除工艺工序
  deleteProduceProcess: async (id: number) => {
    return await request.delete({ url: `/erp/produce-process/delete?id=` + id })
  },

  // 导出工艺工序 Excel
  exportProduceProcess: async (params) => {
    return await request.download({ url: `/erp/produce-process/export-excel`, params })
  },
}
