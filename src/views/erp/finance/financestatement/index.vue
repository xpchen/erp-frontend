<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="对账单号" prop="no">
        <el-input
          v-model="queryParams.no"
          placeholder="请输入对账单号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="供应商" prop="supplierId" v-if="queryParams.type === 1">
        <el-select v-model="queryParams.supplierId"  clearable filterable placeholder="请选择供应商" class="!w-220px" >
          <el-option v-for="[id, name] in supplierItem" :key="id" :value="id" :label="name" />
        </el-select>
      </el-form-item>
      <el-form-item label="客户" prop="customerId" v-if="queryParams.type === 2">
        <el-select v-model="queryParams.customerId"  clearable filterable placeholder="请选择客户" class="!w-220px" >
          <el-option v-for="[id, name] in customerItem" :key="id" :value="id" :label="name" />
        </el-select>
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select
          v-model="queryParams.type"
          placeholder="请选择类型"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.ERP_FINANCE_STATEMENT_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="对账周期" prop="billingPeriod">
        <!-- 修改为年月选择框 -->
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
      <el-form-item label="生成日期" prop="statementDate">
        <el-date-picker
          v-model="queryParams.statementDate"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
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
            v-for="dict in getIntDictOptions(DICT_TYPE.ERP_FINANCE_STATEMENT_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['erp:finance-statement:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['erp:finance-statement:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
        <el-button
          type="info"
          plain
          @click="generateStatement"
          :loading="createLoading"
          v-hasPermi="['erp:finance-statement:create']"
        >
          <Icon icon="ep:document" class="mr-5px" /> 生成对账单
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="ID" align="center" prop="id" width="100px"/>
      <el-table-column label="对账单号" align="center" prop="no" width="180px"/>
      <el-table-column label="交易方" align="center" prop="transactionUserName" />
      <el-table-column label="类型" align="center" prop="type">
        <template #default="scope">
            <dict-tag :type="DICT_TYPE.ERP_FINANCE_STATEMENT_TYPE" :value="scope.row.type" />
        </template>
      </el-table-column>  
      <el-table-column label="对账周期" align="center" prop="billingPeriod" />
      <el-table-column label="生成日期" align="center" prop="statementDate" :formatter="dateFormatter2"/>
      <el-table-column label="总金额（含税）" align="center" prop="totalAmount" />
      <el-table-column label="交易金额" align="center" prop="transactionAmount" />
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
            <dict-tag :type="DICT_TYPE.ERP_FINANCE_STATEMENT_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>  
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter2"
        width="180px"
      />
      <el-table-column label="操作" align="center" width="180px">
        <template #default="scope">
          <el-button
            link
            @click="openForm('detail', scope.row.id)"
            v-hasPermi="['erp:finance-statement:query']"
          >
            详情
          </el-button>
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['erp:finance-statement:update']"
            v-if="scope.row.status === 0"
          >
            编辑
          </el-button>
          <el-button
            link
            type="primary"
            @click="handleUpdateStatus(scope.row.id, 1)"
            v-hasPermi="['erp:finance-statement:update-status']"
            v-if="scope.row.status === 0"
          >
            审批
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleUpdateStatus(scope.row.id, 0)"
            v-hasPermi="['erp:finance-statement:update-status']"
            v-if="scope.row.status !== 0"
          >
            反审批
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id, scope.row.type)"
            v-hasPermi="['erp:finance-statement:delete']"
            v-if="scope.row.status === 0"
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
  <FinanceStatementForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { dateFormatter2} from '@/utils/formatTime'
import download from '@/utils/download'
import { FinanceStatementApi, FinanceStatementVO } from '@/api/erp/finance/financestatement'
import FinanceStatementForm from './FinanceStatementForm.vue'
import { useBasicData } from '@/api/erp/basic/common'
import { ElMessageBox } from 'element-plus'
const { supplierItem, customerItem } = useBasicData()

/** 对账单 列表 */
defineOptions({ name: 'ErpFinanceStatement' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<FinanceStatementVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  no: undefined,
  supplierId: undefined,
  customerId: undefined,
  type: undefined,
  billingPeriod: undefined as string | undefined,
  statementDate: [],
  status: undefined,
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中
const createLoading = ref(false) // 生成对账单的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await FinanceStatementApi.getFinanceStatementPage(queryParams)
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

const handleUpdateStatus = async (id: number, status: number) => {
  try {
    // 审批的二次确认
    await message.confirm(`确定${status === 1 ? '审批' : '反审批'}该对账单吗？`)
    // 发起审批
    await FinanceStatementApi.updateFinanceStatementStatus(id, status)
    message.success(`${status === 1 ? '审批' : '反审批'}成功`)
    // 刷新列表
    await getList()
  } catch {}
}

/** 删除按钮操作 */
const handleDelete = async (id: number, type: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await FinanceStatementApi.deleteFinanceStatement(id, type)
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
    const data = await FinanceStatementApi.exportFinanceStatement(queryParams)
    download.excel(data, '对账单.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 生成对账单操作 */
const generateStatement = async () => {
  try {
    // 弹出确认框
    await ElMessageBox.confirm(
      '确定要生成对账单吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    const { billingPeriod, type } = queryParams;
    const currentMonth = new Date().toISOString().slice(0, 7); // 获取当前年月 YYYY-MM

    // 检查类型是否选择
    if (!type) {
      message.warning('请选择类型');
      return;
    }

    if (!billingPeriod) {
      message.warning('请选择对账周期');
      return;
    }

    if (billingPeriod > currentMonth) {
      message.warning('对账周期不能超过当前月份');
      return;
    }

    // 用户点击确认后执行后续逻辑
    createLoading.value = true;
    // 调用生成对账单的 API，这里假设存在对应的 API 方法
    const result = await FinanceStatementApi.generateFinanceStatement(queryParams);
    if(result){
      message.success('对账单生成成功');
    }else{
      message.error('无数据，未生成对账单');
      return;
    }
    
    // 刷新列表
    await getList();
  } catch (error) {
    if (error === 'cancel') {
      // 用户点击取消，不做处理
      return;
    }
    message.error('对账单生成失败');
  } finally {
    createLoading.value = false;
  }
};

/** 初始化 **/
onMounted(() => {
  getList()
})
</script>
