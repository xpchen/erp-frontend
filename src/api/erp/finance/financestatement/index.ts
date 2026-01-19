import request from '@/config/axios'

// 对账单 VO
export interface FinanceStatementVO {
  id: number // ID
  no: string // 对账单号
  type: number // 类型
  supplierName: string // 供应商名称
  billingPeriod: string // 对账周期
  statementDate: Date // 生成日期
  totalAmount: number // 总金额（含税）
  paidAmount: number // 已付金额
  status: number // 状态
}

export interface PageFinanceStatementVO {
  financeStatementId: number
  financeStatementNo: string // 对账单号
  type: number // 类型
  transactionUserName: string
  billingPeriod: string // 对账周期
  statementDate: Date // 生成日期
  totalAmount: number // 总金额（含税）
  paidAmount: number // 已付金额
  status: number // 状态
}

// 对账单 API
export const FinanceStatementApi = {
  // 查询对账单分页
  getFinanceStatementPage: async (params: any) => {
    return await request.get({ url: `/erp/finance-statement/page`, params })
  },
   // 查询对账单分页
  pageFinanceStatement: async (params: any) => {
    return await request.get({ url: `/erp/finance-statement/pageFinanceStatement`, params })
  },

  // 查询对账单详情
  getFinanceStatement: async (id: number) => {
    return await request.get({ url: `/erp/finance-statement/get?id=` + id })
  },

  // 新增对账单
  createFinanceStatement: async (data: FinanceStatementVO) => {
    return await request.post({ url: `/erp/finance-statement/create`, data })
  },

  // 修改对账单
  updateFinanceStatement: async (data: FinanceStatementVO) => {
    return await request.put({ url: `/erp/finance-statement/update`, data })
  },

   // 更新对账单的状态
   updateFinanceStatementStatus: async (id: number, status: number) => {
    return await request.put({
      url: `/erp/finance-statement/update-status`,
      params: {
        id,
        status
      }
    })
  },

  // 删除对账单
  deleteFinanceStatement: async (id: number, type: number) => {
    return await request.delete({ url: `/erp/finance-statement/delete?id=${id}&type=${type}` })
  },

  // 导出对账单 Excel
  exportFinanceStatement: async (params) => {
    return await request.download({ url: `/erp/finance-statement/export-excel`, params })
  },


  generateFinanceStatement: async (params) =>{
    return await request.get({ url: `/erp/finance-statement/generate`, params })
  },

// ==================== 子表（对账单明细） ====================

  // 获得对账单明细列表
  getFinanceStatementItemsListByStatementId: async (statementId) => {
    return await request.get({ url: `/erp/finance-statement/finance-statement-items/list-by-statement-id?statementId=` + statementId })
  },
}
