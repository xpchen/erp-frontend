import request from '@/config/axios'

interface ReportWorkData {
  productionTaskId: number
  productionTaskNo: string
  materialId: number
  materialName: string
  materialCode: string
  plannedQuantity: number
  completedQuantity: number
  qualifiedQuantity: number
  scrapQuantity: number
  scrapReason: string
  startTime: Date | string
  endTime: Date | string
}

export const ReportWorkApi = {

   submitReportWork: async (data: ReportWorkData) => {
   return await request.post({ url: `/erp/production-task/report-work`, data })
  },

}