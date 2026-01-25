import request from '@/config/axios'

// ERP 物料库存 VO
export interface StockVO {
  // 编号
  id: number
  // 物料编号
  materialId: number
  // 仓库编号
  warehouseId: number
  // 库存数量
  count: number
  // 存放位置
  location?: string
  // 物料名称
  materialName?: string
  // 仓库名称
  warehouseName?: string
}

// ERP 物料库存 API
export const StockApi = {
  // 查询物料库存分页
  getStockPage: async (params: any) => {
    return await request.get({ url: `/erp/stock/page`, params })
  },

  // 查询物料库存详情
  getStock: async (id: number) => {
    return await request.get({ url: `/erp/stock/get?id=` + id })
  },

  // 查询物料库存详情
  getStock2: async (materialId: number, warehouseId: number) => {
    return await request.get({ url: `/erp/stock/get`, params: { materialId, warehouseId } })
  },

  // 获得物料库存数量
  getStockCount: async (warehouseId: number, materialId: number) => {
    debugger;
    return await request.get({ url: `/erp/stock/get-count`, params: { warehouseId, materialId } })
  },

  // 导出物料库存 Excel
  exportStock: async (params) => {
    return await request.download({ url: `/erp/stock/export-excel`, params })
  },

  // 更新物料库存位置
  updateStockLocation: async (materialId: number, warehouseId: number, location?: string) => {
    return await request.put({ 
      url: `/erp/stock/update-location`, 
      params: { materialId, warehouseId, location } 
    })
  }
}
