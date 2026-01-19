<template>
  <ContentWrap class="mb-3px">
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
    <el-form-item label="主计划编码:" prop="sourceBillNo" label-width="100px">
        <el-input
          v-model="queryParams.sourceBillNo"
          placeholder="请输入主计划编码"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="需求计划编码:" prop="mrpNo" label-width="100px">
        <el-input
          v-model="queryParams.mrpNo"
          placeholder="请输入需求计划编码"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="销售订单编码:" prop="saleOrderNo" label-width="100px">
        <el-input
          v-model="queryParams.saleOrderNo"
          placeholder="请输入销售订单编码"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="创建时间:" prop="createTime" label-width="100px">
        <el-date-picker
          v-model="queryParams.createTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
    </el-form>
  </ContentWrap>
  <ContentWrap class="mb-3px">
      <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
      <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
      <el-button type="warning" plain @click="openErpProduceMainPlanFrom" v-hasPermi="['erp:material-requirement-plan:create']" :loading="calculatingMRP">
          <Icon icon="fa:calculator" class="mr-5px" /> MRP运算
      </el-button>
      <el-button type="success" plain @click="batchHandleIssueTask" >
          <Icon icon="fa-solid:clipboard-check" class="mr-5px" /> 批量下达任务
      </el-button>
      <el-button type="primary" plain @click="handleExport" :loading="exportLoading" v-hasPermi="['erp:material-requirement-plan:export']" >
          <Icon icon="ep:download" class="mr-5px" /> 导出
      </el-button>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true" @selection-change="handleSelectionChange">
      <el-table-column type="selection" :selectable="checkSelectable"/>
      <el-table-column label="序号" align="center" prop="id" />
      <el-table-column label="主计划编码" align="center" prop="sourceBillNo" />
      <el-table-column label="需求计划编码" align="center" prop="mrpNo" />
      <el-table-column label="销售订单编码" align="center" prop="saleOrderNo" />
      <el-table-column label="审批状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.ERP_AUDIT_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="下达状态" align="center" prop="issuedStatus">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.ERP_MRP_ISSUED_STATUS" :value="scope.row.issuedStatus" />
        </template>
      </el-table-column>
      <el-table-column label="描述" align="center" prop="mrpDesc" />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="操作" align="center" min-width="120px">
        <template #default="scope">
          <el-button
            link
            type="info"
            @click="openForm('view', scope.row.id)"
          >
            详情
          </el-button>
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['erp:material-requirement-plan:update']"
            v-if="scope.row.issuedStatus !== 3"
          >
            编辑
          </el-button>
          <!-- <el-button
            link
            type="primary"
            @click="handleUpdateStatus(scope.row.id, 20)"
            v-hasPermi="['erp:material-requirement-plan:update']"
            v-if="scope.row.status === 10"
          >
            审批
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleUpdateStatus(scope.row.id, 10)"
            v-hasPermi="['erp:material-requirement-plan:update']"
            v-else
          >
            反审批
          </el-button> -->
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['erp:material-requirement-plan:delete']" 
            v-if="scope.row.issuedStatus !== 3"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <MaterialRequirementPlanForm ref="formRef" @success="getList" />
  <!-- 选择主计划弹窗 -->
  <ErpProduceMainPlanFrom ref="erpProduceMainPlanFromRef" @success="handleSelectedMainPlans" />

   <!-- 全局加载指示器 -->
  <el-dialog
    v-model="showLoadingDialog"
    title="MRP计算中"
    width="20%"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
  >
    <div style="text-align: center">
      <el-icon class="is-loading" size="50" color="#409EFF">
        <Loading />
      </el-icon>
      <p style="margin-top: 20px">正在计算MRP，请稍候...</p>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { DICT_TYPE } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { MaterialRequirementPlanApi, MaterialRequirementPlanVO, MrpCalculationDTO, MrpApprovalDTO } from '@/api/erp/produce/materialrequirementplan/index'
import MaterialRequirementPlanForm from './MaterialRequirementPlanForm.vue'
import ErpProduceMainPlanFrom from '@/views/erp/produce/mainplan/components/erpProduceMainPlanFrom.vue'

/** 物料需求计划 列表 */
defineOptions({ name: 'MaterialRequirementPlan' })

const calculatingMRP = ref(false) // 按钮加载状态
const showLoadingDialog = ref(false) // 全局加载对话框

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const selectedRows = ref<MaterialRequirementPlanVO[]>([])
const loading = ref(true) // 列表的加载中
const list = ref<MaterialRequirementPlanVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  sourceBillNo: undefined,
  mrpNo: undefined,
  saleOrderNo: undefined,
  mrpName: undefined,
  status: undefined,
  createTime: [],
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await MaterialRequirementPlanApi.getMaterialRequirementPlanPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await MaterialRequirementPlanApi.deleteMaterialRequirementPlan(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await MaterialRequirementPlanApi.exportMaterialRequirementPlan(queryParams)
    download.excel(data, '物料需求计划.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 初始化 **/
onMounted(() => {
  getList()
})

const erpProduceMainPlanFromRef = ref()

/** 打开选择主计划画面并处理返回结果 */
const openErpProduceMainPlanFrom = () => {
  erpProduceMainPlanFromRef.value.open()
}

// 处理选择的主计划编码
// const handleSelectedMainPlans = async (selectedNos: string[]) => {
//   try {
//     loading.value = true
//     // 调用MRP计算API
//     const mrpCalculationDto: MrpCalculationDTO = {produceMainPlanNoList: selectedNos}
//     await MaterialRequirementPlanApi.mrpCalculation(mrpCalculationDto)
//     message.success('MRP计算成功')
//     // 刷新列表
//     await getList()
//   } catch (error) {
//     console.error('MRP计算失败:', error)
//   } finally {
//     loading.value = false
//   }
// }

const handleSelectedMainPlans = async (selectedNos: string[]) => {
  if (selectedNos.length === 0) return
  
  try {
    calculatingMRP.value = true // 按钮加载状态
    showLoadingDialog.value = true // 显示全局加载对话框
    
    // 调用MRP计算API
    const mrpCalculationDto: MrpCalculationDTO = {produceMainPlanNoList: selectedNos}
    await MaterialRequirementPlanApi.mrpCalculation(mrpCalculationDto)
    message.success('MRP计算成功')
    
    // 刷新列表
    await getList()
  } catch (error) {
    console.error('MRP计算失败:', error)
    message.error('MRP计算失败')
  } finally {
    calculatingMRP.value = false
    showLoadingDialog.value = false
  }
}

/** 审批/反审批操作 */
const handleUpdateStatus = async (id: number, status: number) => {
  try {
    // 审批的二次确认
    await message.confirm(`确定${status === 20 ? '审批' : '反审批'}该订单吗？`)
    // 发起审批
    const mrpApprovalDTO: MrpApprovalDTO = {id: id, status: status}
    await MaterialRequirementPlanApi.mrpApproval(mrpApprovalDTO)
    message.success(`${status === 20 ? '审批' : '反审批'}成功`)
    // 刷新列表
    await getList()
  } catch {}
}

const checkSelectable = (row: MaterialRequirementPlanVO) => row.issuedStatus !== 3

const handleSelectionChange = (selection: MaterialRequirementPlanVO[]) => {
  selectedRows.value = selection
}

// 批量下达任务
const batchHandleIssueTask = async () => {
  if (selectedRows.value.length === 0) {
    message.warning('请至少选择一条记录')
    return
  }
  debugger
  
  try {
    // 检查所选记录是否都符合条件
    const invalidRows = selectedRows.value.filter(row => !checkSelectable(row))
    if (invalidRows.length > 0) {
      message.warning(`选中的 ${invalidRows.length} 条记录不符合下达条件`)
      return
    }
    
    // 确认对话框
    await message.confirm(`确定要批量下达选中的 ${selectedRows.value.length} 条任务吗？`)
    
    // 调用API批量下达
    const ids = selectedRows.value.map(row => row.id)
    await MaterialRequirementPlanApi.mrpBatchTaskDispatch(ids)
    message.success('批量下达成功')
    
    // 刷新列表
    await getList()
    // 清空选择
    selectedRows.value = []
  } catch (error) {
    console.error('批量下达失败:', error)
  }
}
</script>

