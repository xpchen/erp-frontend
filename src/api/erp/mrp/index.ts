import request from '@/config/axios'

export const MrpApi = {
  // 新增bom分录
  runMrp: async (data) => {
    return await request.post({ url: `/erp/manufacture/mrp/runMrp`, data })
  }
}