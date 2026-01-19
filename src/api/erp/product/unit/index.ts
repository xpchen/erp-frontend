// src/api/erp/product/unit.ts
import request from '@/config/axios'

/**
 * 对齐后端：ErpProductUnitRespVO
 * 注意：后端是 Long，这里用 number（足够），如果你们前端有 Long 字符串规范，也可改为 string | number
 */
export interface ProductUnitVO {
  id: number
  name: string
  status?: number
  createTime?: string // 后端是 LocalDateTime，前端通常是 ISO 字符串
}

/**
 * 对齐后端：ErpProductUnitPageReqVO extends PageParam
 * PageParam 常见字段：pageNo/pageSize（芋道一般如此）
 */
export interface ProductUnitPageReqVO {
  pageNo: number
  pageSize: number
  name?: string
  status?: number
}

/**
 * 对齐后端：ErpProductUnitSaveReqVO
 */
export interface ProductUnitSaveReqVO {
  id?: number
  name: string
  status: number
}

/**
 * 对齐后端 Controller：@RequestMapping("/erp/product-unit")
 */
const BASE_URL = '/erp/product-unit'

export const ProductUnitApi = {
  /** 创建产品单位 POST /create */
  createProductUnit: (data: ProductUnitSaveReqVO) => {
    return request.post({ url: `${BASE_URL}/create`, data })
  },

  /** 更新产品单位 PUT /update */
  updateProductUnit: (data: ProductUnitSaveReqVO) => {
    return request.put({ url: `${BASE_URL}/update`, data })
  },

  /** 删除产品单位 DELETE /delete?id= */
  deleteProductUnit: (id: number) => {
    return request.delete({ url: `${BASE_URL}/delete`, params: { id } })
  },

  /** 获得产品单位 GET /get?id= */
  getProductUnit: (id: number) => {
    return request.get({ url: `${BASE_URL}/get`, params: { id } })
  },

  /** 获得产品单位分页 GET /page */
  getProductUnitPage: (params: ProductUnitPageReqVO) => {
    return request.get({ url: `${BASE_URL}/page`, params })
  },

  /**
   * 获得产品单位精简列表 GET /simple-list
   * 后端说明：只包含启用状态，给下拉框用
   */
  getProductUnitSimpleList: async (): Promise<ProductUnitVO[]> => {
    // 说明：
    // 1) 芋道前端 request.get 通常会自动取 CommonResult 的 data 并返回
    // 2) 如果你的 request.get 返回的是完整 CommonResult，需要改成：
    //    const res = await request.get({ ... }); return res.data;
    return await request.get({ url: `${BASE_URL}/simple-list` })
  },

  /** 导出产品单位 Excel GET /export-excel */
  exportProductUnitExcel: (params: Omit<ProductUnitPageReqVO, 'pageNo' | 'pageSize'> & Partial<ProductUnitPageReqVO>) => {
    return request.download({ url: `${BASE_URL}/export-excel`, params })
  }
}
