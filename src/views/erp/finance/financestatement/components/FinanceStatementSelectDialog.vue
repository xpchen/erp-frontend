<template>
  <Dialog 
    :title="dialogTitle" 
    v-model="dialogVisible" 
    width="70%"
    :close-on-click-modal="false"
  >
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="对账单号" prop="financeStatementNo">
        <el-input
          v-model="queryParams.financeStatementNo"
          placeholder="请输入对账单号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="供应商" prop="transactionUserId" v-if="queryParams.financeStatementType === 1">
        <el-select v-model="queryParams.transactionUserId"  clearable filterable placeholder="请选择供应商" class="!w-220px" >
          <el-option v-for="[id, name] in supplierItem" :key="id" :value="id" :label="name" />
        </el-select>
      </el-form-item>
      <el-form-item label="客户" prop="transactionUserId" v-if="queryParams.financeStatementType === 2">
        <el-select v-model="queryParams.transactionUserId"  clearable filterable placeholder="请选择客户" class="!w-220px" >
          <el-option v-for="[id, name] in customerItem" :key="id" :value="id" :label="name" />
        </el-select>
      </el-form-item>
      <el-form-item label="对账周期" prop="billingPeriod">
         <el-date-picker
          v-model="queryParams.billingPeriod"
          type="month"
          placeholder="请选择对账周期"
          value-format="YYYY-MM"
          clearable
          @change="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择状态"
          clearable
          class="!w-240px"
        >
        <el-option
            v-for="dict in filteredStatusOptions"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
       <el-form-item label="批量结清账单" prop="settleTheBill" label-width="100">
        <el-checkbox v-model="queryParams.settleTheBill" label true />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true"  @selection-change="handleSelectionChange"  ref="multipleTableRef">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="对账单号" align="center" prop="financeStatementNo" width="180px"/>
      <el-table-column label="供应商" align="center" prop="transactionUserName" v-if="queryParams.financeStatementType === 1"/>
      <el-table-column label="客户" align="center" prop="transactionUserName" v-if="queryParams.financeStatementType === 2"/> 
      <el-table-column label="对账周期" align="center" prop="billingPeriod" />
      <el-table-column label="生成日期" align="center" prop="statementDate" :formatter="dateFormatter2"/>
      <el-table-column label="应付金额" align="center" prop="totalAmount" v-if="queryParams.financeStatementType === 1"/>
      <el-table-column label="应收金额" align="center" prop="totalAmount" v-if="queryParams.financeStatementType === 2"/>
      <el-table-column label="已付金额" align="center" prop="transactionAmount" v-if="queryParams.financeStatementType === 1"/>
      <el-table-column label="已收金额" align="center" prop="transactionAmount" v-if="queryParams.financeStatementType === 2"/>
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
            <dict-tag :type="DICT_TYPE.ERP_FINANCE_STATEMENT_STATUS" :value="scope.row.status" />
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
<!-- 对话框操作按钮 -->
     <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </template>
</Dialog>
</template>

<script setup lang="ts">
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { dateFormatter2} from '@/utils/formatTime'
import { FinanceStatementApi, FinanceStatementVO, PageFinanceStatementVO } from '@/api/erp/finance/financestatement'
import { useBasicData } from '@/api/erp/basic/common'
const { supplierItem, customerItem } = useBasicData()

/** 对账单 列表 */
defineOptions({ name: 'FinanceStatementSelectDialog' })
const message = useMessage() // 消息弹窗

const dialogTitle = ref('选择对账单')
const dialogVisible = ref(false)
const multipleTableRef = ref() // 多选表格引用
const selectedRows = ref<PageFinanceStatementVO[]>([]) // 选中的行数据
const loading = ref(true) // 列表的加载中
const list = ref<FinanceStatementVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  financeStatementNo: undefined,
  transactionUserId: undefined,
  financeStatementType: undefined,
  billingPeriod: undefined,
  status: undefined,
  settleTheBill: false
})
const queryFormRef = ref() // 搜索的表单

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await FinanceStatementApi.pageFinanceStatement(queryParams)
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

/** 打开对话框方法（关键修复点） */
const open = (financeStatementType: undefined) => {
  dialogVisible.value = true
  // 重置查询条件
  queryParams.pageNo = 1
  queryParams.financeStatementNo = undefined
  queryParams.transactionUserId = undefined
  queryParams.financeStatementType = financeStatementType // 默认为供应商对账单
  queryParams.billingPeriod = undefined,
  queryParams.status = undefined
  // 重新加载数据
  getList()
}

defineExpose({ open }); // 提供 open 方法，用于打开弹窗


/** 多选处理 */
const handleSelectionChange = (rows: PageFinanceStatementVO[]) => {
  selectedRows.value = rows
}

const emit = defineEmits(['success'])

/** 确定选择 */
const handleConfirm = () => {
  debugger
  if (selectedRows.value.length === 0) {
    message.warning('请至少选择一条对账单')
    return
  }
  
  const selectedNos = selectedRows.value.map(row => row.financeStatementNo)
   emit('success', {
    statementNos: selectedNos,
    settleTheBill: queryParams.settleTheBill
  })
  dialogVisible.value = false
}

const filteredStatusOptions = computed(() => {
  // 获取所有状态选项
  const allOptions = getIntDictOptions(DICT_TYPE.ERP_FINANCE_STATEMENT_STATUS)
  // 过滤掉value为1和2的选项
  return allOptions.filter(dict => ![0, 3].includes(dict.value))
})
</script>