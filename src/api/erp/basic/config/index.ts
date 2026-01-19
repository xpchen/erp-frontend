import { updateStatus } from '@/api/mall/product/spu'
import request from '@/config/axios'

// 用户自定义配置 VO
export interface UserCustomizeConfigVO {
  id: number // 主键ID
  status: boolean // 状态
  configGroup: string // 配置分组
  configName: string // 配置名称
  configValue: string // 配置值
}

// 用户自定义配置 API
export const UserCustomizeConfigApi = {
  // 查询用户自定义配置分页
  getUserCustomizeConfigPage: async (params: any) => {
    return await request.get({ url: `/erp/user-customize-config/page`, params })
  },

  // 查询用户自定义配置详情
  getUserCustomizeConfig: async (id: number) => {
    return await request.get({ url: `/erp/user-customize-config/get?id=` + id })
  },

  // 新增用户自定义配置
  createUserCustomizeConfig: async (data: UserCustomizeConfigVO) => {
    return await request.post({ url: `/erp/user-customize-config/create`, data })
  },

  // 修改用户自定义配置
  updateUserCustomizeConfig: async (data: UserCustomizeConfigVO) => {
    return await request.put({ url: `/erp/user-customize-config/update`, data })
  },

  // 删除用户自定义配置
  deleteUserCustomizeConfig: async (id: number) => {
    return await request.delete({ url: `/erp/user-customize-config/delete?id=` + id })
  },

  // 导出用户自定义配置 Excel
  exportUserCustomizeConfig: async (params) => {
    return await request.download({ url: `/erp/user-customize-config/export-excel`, params })
  },

  // 修改配置状态
  updateStatus: async (id: number) => {
    return await request.put({ url: `/erp/user-customize-config/update-status?id=` + id })
  }
}
