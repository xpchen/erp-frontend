import request from '@/config/axios'

// ERP 物料库存明细 VO
export interface StockRecordVO {
  id: number // 编号
  materialId: number // 物料编号
  warehouseId: number // 仓库编号
  count: number // 出入库数量
  totalCount: number // 总库存量
  bizType: number // 业务类型
  bizId: number // 业务编号
  bizItemId: number // 业务项编号
  bizNo: string // 业务单号
}

// ERP 物料库存明细 API
export const StockRecordApi = {
  // 查询物料库存明细分页
  getStockRecordPage: async (params: any) => {
    return await request.get({ url: `/erp/stock-record/page`, params })
  },

  // 查询物料库存明细详情
  getStockRecord: async (id: number) => {
    return await request.get({ url: `/erp/stock-record/get?id=` + id })
  },

  // 导出物料库存明细 Excel
  exportStockRecord: async (params) => {
    return await request.download({ url: `/erp/stock-record/export-excel`, params })
  }
}
