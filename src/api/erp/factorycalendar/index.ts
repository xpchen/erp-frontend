import request from '@/config/axios'

// ERP工厂日历 VO
export interface FactoryCalendarVO {
  fid: number // ID
  fyear: string // 年
  fdate: string // 日期
  fisholiday: number // 非工作日
}

// ERP工厂日历 API
export const FactoryCalendarApi = {
  // 查询ERP工厂日历分页
  getFactoryCalendarPage: async (params: any) => {
    return await request.get({ url: `/erp/factory-calendar/page`, params })
  },

  // 查询ERP工厂日历详情
  getFactoryCalendar: async (fyear: number) => {
    return await request.get({ url: `/erp/factory-calendar/get?fyear=` + fyear })
  },

  // 新增ERP工厂日历
  createFactoryCalendar: async (data: FactoryCalendarVO[]) => {
    return await request.post({ url: `/erp/factory-calendar/create`, data })
  },

  // 修改ERP工厂日历
  updateFactoryCalendar: async (data: FactoryCalendarVO) => {
    return await request.put({ url: `/erp/factory-calendar/update`, data })
  },

  // 删除ERP工厂日历
  deleteFactoryCalendar: async (id: number) => {
    return await request.delete({ url: `/erp/factory-calendar/delete?id=` + id })
  },

  // 导出ERP工厂日历 Excel
  exportFactoryCalendar: async (params) => {
    return await request.download({ url: `/erp/factory-calendar/export-excel`, params })
  },
}
