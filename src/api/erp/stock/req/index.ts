import request from '@/config/axios'

// ERP 领料出库单 VO
export interface StockOutReqVO {
  id: number // 出库编号
  no: string // 出库单号
  customerId: number // 客户编号
  outTime: Date // 出库时间
  totalCount: number // 合计数量
  totalPrice: number // 合计金额，单位：元
  status: number // 状态
  remark: string // 备注
}

// ERP 领料出库单 API
export const StockOutReqApi = {
  // 查询领料出库单分页
  getStockOutPage: async (params: any) => {
    return await request.get({ url: `/erp/stock-out-req/page`, params })
  },

  // 查询领料出库单详情
  getStockOut: async (id: number) => {
    return await request.get({ url: `/erp/stock-out-req/get?id=` + id })
  },

  // 新增领料出库单
  createStockOut: async (data: StockOutVO) => {
    return await request.post({ url: `/erp/stock-out-req/create`, data })
  },

  // 修改领料出库单
  updateStockOut: async (data: StockOutVO) => {
    return await request.put({ url: `/erp/stock-out-req/update`, data })
  },

  // 更新领料出库单的状态
  updateStockOutStatus: async (id: number, status: number) => {
    return await request.put({
      url: `/erp/stock-out-req/update-status`,
      params: {
        id,
        status
      }
    })
  },

  // 删除领料出库单
  deleteStockOut: async (ids: number[]) => {
    return await request.delete({
      url: `/erp/stock-out/delete`,
      params: {
        ids: ids.join(',')
      }
    })
  },

  // 导出领料出库单 Excel
  exportStockOut: async (params) => {
    return await request.download({ url: `/erp/stock-out/export-excel`, params })
  }
}
