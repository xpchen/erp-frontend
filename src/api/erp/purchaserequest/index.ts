import request from '@/config/axios'

// 采购申请单 VO
export interface PurchaseRequestVO {
  id: number // ID
  no: string // 采购申请单编号
  bizDate: Date // 业务日期
  totalAmount: number // 金额合计(不含税)
  personId: number // 申请人
  isUrgent: number // 是否加急
  deptId: number // 申请部门
  demandTypeId: string // 需求类型
  totalTax: number // 税额合计
  totalTaxAmount: number // 价税合计
  status: number // 状态
}

// 采购申请单 API
export const PurchaseRequestApi = {
  // 查询采购申请单分页
  getPurchaseRequestPage: async (params: any) => {
    return await request.get({ url: `/erp/purchase-request/page`, params })
  },

  // 查询采购申请单详情
  getPurchaseRequest: async (id: number) => {
    return await request.get({ url: `/erp/purchase-request/get?id=` + id })
  },

  // 新增采购申请单
  createPurchaseRequest: async (data: PurchaseRequestVO) => {
    return await request.post({ url: `/erp/purchase-request/create`, data })
  },

  // 修改采购申请单
  updatePurchaseRequest: async (data: PurchaseRequestVO) => {
    return await request.put({ url: `/erp/purchase-request/update`, data })
  },

  // 删除采购申请单
  deletePurchaseRequest: async (id: number) => {
    return await request.delete({ url: `/erp/purchase-request/delete?id=` + id })
  },

  // 导出采购申请单 Excel
  exportPurchaseRequest: async (params) => {
    return await request.download({ url: `/erp/purchase-request/export-excel`, params })
  },

  // 更新采购订单的状态
  updatePurchaseRequestStatus: async (id: number, status: number) => {
    return await request.put({
      url: `/erp/purchase-request/update-status`,
      params: {
        id,
        status
      }
    })
  },

// ==================== 子表（采购申请单明细） ====================

  // 获得采购申请单明细列表
  getPurchaseRequestItemsListByRequestId: async (requestId) => {
    return await request.get({ url: `/erp/purchase-request/purchase-request-items/list-by-request-id?requestId=` + requestId })
  }
}
