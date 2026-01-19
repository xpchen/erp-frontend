import request from '@/config/axios'

// 人员工序对照 VO
export interface UserProcessMappingVO {
  id: number // ID
  userId: number // 人员ID
  processId: number // 工序ID
}

// 人员工序对照 API
export const UserProcessMappingApi = {
  // 查询人员工序对照分页
  getUserProcessMappingPage: async (params: any) => {
    return await request.get({ url: `/erp/user-process-mapping/page`, params })
  },

  // 查询人员工序对照详情
  getUserProcessMapping: async (id: number) => {
    return await request.get({ url: `/erp/user-process-mapping/get?id=` + id })
  },

  // 新增人员工序对照
  createUserProcessMapping: async (data: UserProcessMappingVO) => {
    return await request.post({ url: `/erp/user-process-mapping/create`, data })
  },

  // 修改人员工序对照
  updateUserProcessMapping: async (data: UserProcessMappingVO) => {
    return await request.put({ url: `/erp/user-process-mapping/update`, data })
  },

  // 删除人员工序对照
  deleteUserProcessMapping: async (id: number) => {
    return await request.delete({ url: `/erp/user-process-mapping/delete?id=` + id })
  },

  // 导出人员工序对照 Excel
  exportUserProcessMapping: async (params) => {
    return await request.download({ url: `/erp/user-process-mapping/export-excel`, params })
  },
}