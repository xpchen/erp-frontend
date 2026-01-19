import request from '@/config/axios'

// bom VO
export interface BomVO {
  fid: number // 编号
  fnumber: string // 编码
  fname: string // bom名称
  fbomtype: number // bom类型
  fproductqty: number // 生产数量
  fusagetype: number // bom用途
  fmaterialid: number // 物料
  fmaterialname: string // 物料名称
  fmodel: string // 规格型号
  fyield: number // 成品率
  fbomgroupid: number // bom组
  fbomgroupname: string // bom组名称
  fpicturenumber: string // 工程图号
  fbizdate: Date // 业务日期
  fdescription: string // 描述
  fauditorid: string // 审核人
  faudittime: Date // 审核时间
  fbasestatus: number // 单据状态
  funitid: number // 计量单位
  funitname: string // 计量单位名称
  unitPurchase: number // 采购单位
  changeRate: number // 换算比例 
}

// bom API
export const BomApi = {
  // 查询bom分页
  getBomPage: async (params: any) => {
    return await request.get({ url: `/erp/bom/page`, params })
  },

  // 查询bom详情
  getBom: async (id: number) => {
    return await request.get({ url: `/erp/bom/get?id=` + id })
  },

  // 新增bom
  createBom: async (data: BomVO) => {
    return await request.post({ url: `/erp/bom/create`, data })
  },

  // 修改bom
  updateBom: async (data: BomVO) => {
    return await request.put({ url: `/erp/bom/update`, data })
  },

  // 删除bom
  deleteBom: async (id: number) => {
    return await request.delete({ url: `/erp/bom/delete?id=` + id })
  },

  // 导出bom Excel
  exportBom: async (params) => {
    return await request.download({ url: `/erp/bom/export-excel`, params })
  },

  // 查询物料精简列表（并且未做过BOM）
  getUnBomMaterial: async () => {
    return await request.get({ url: `/erp/bom/getUnBomMaterial` })
  },

  // ==================== 子表（bom分录） ====================

  // 获得bom分录列表
  getBomItemsListByFparentid: async (fparentid) => {
    return await request.get({ url: `/erp/bom/bom-items/list-by-fparentid?fparentid=` + fparentid })
  },

  // 获得bom分录列表（所有层级）
  getAllBomItemsListByFparentid: async (fparentid) => {
    return await request.get({ url: `/erp/bom/bom-items/list-all-by-fparentid?fparentid=` + fparentid })
  },
}
