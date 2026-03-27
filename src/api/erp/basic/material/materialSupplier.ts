import request from '@/config/axios'

export interface MaterialSupplierCheckReq {
  supplierId: number
  materialIds: number[]
}

export interface MaterialSupplierCheckResp {
  unsupportedMaterialIds: number[]
  unsupportedMaterialNames: string[]
}

export interface MaterialSupplierBatchBindReq {
  supplierId: number
  materialIds: number[]
  setDefaultSupplier?: boolean
}

/** 物料备选供应商（扩展表，默认供应商仍在采购属性） */
export const MaterialSupplierApi = {
  list: async (materialId: number) => {
    return await request.get({ url: '/erp/material-supplier/list', params: { materialId } })
  },
  sync: async (data: { materialId: number; supplierIds: number[] }) => {
    return await request.put({ url: '/erp/material-supplier/sync', data })
  },
  checkSupport: async (data: MaterialSupplierCheckReq) => {
    return await request.post<MaterialSupplierCheckResp>({ url: '/erp/material-supplier/check-support', data })
  },
  batchBindSupplier: async (data: MaterialSupplierBatchBindReq) => {
    return await request.put({ url: '/erp/material-supplier/batch-bind-supplier', data })
  }
}
