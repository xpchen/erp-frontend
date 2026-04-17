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
      <el-form-item label="出库单号" prop="no">
        <el-input
          v-model="queryParams.no"
          placeholder="请输入出库单号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="物料" prop="materialId">
        <el-select v-model="queryParams.materialId" clearable filterable placeholder="请选择物料（名称+规格）" class="!w-280px">
          <el-option
            v-for="m in materialInfoArray"
            :key="m.id"
            :value="m.id"
            :label="(m.name || '') + (m.standard ? ' ' + m.standard : '')"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="出库时间" prop="outTime">
        <el-date-picker
          v-model="queryParams.outTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="客户" prop="customerId">
        <el-select v-model="queryParams.customerId"  clearable filterable placeholder="请选择客户" class="!w-220px" >
          <el-option v-for="[id, name] in customerItem" :key="id" :value="id" :label="name" />
        </el-select>
      </el-form-item>
      <el-form-item label="仓库" prop="warehouseId">
        <el-select v-model="queryParams.warehouseId"  clearable filterable placeholder="请选择仓库" class="!w-220px" >
          <el-option v-for="[id, name] in warehouseItem" :key="id" :value="id" :label="name" />
        </el-select>
      </el-form-item>
      <el-form-item label="创建人" prop="creator">
        <el-select v-model="queryParams.creator"  clearable filterable placeholder="请选择创建人" class="!w-220px" >
          <el-option v-for="[id, name] in userItem" :key="id" :value="id" :label="name" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable class="!w-240px">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.ERP_AUDIT_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <!-- 新增业务类型字段 -->
      <el-form-item label="业务类型" prop="outType">
        <el-select v-model="queryParams.outType" placeholder="请选择业务类型" clearable class="!w-240px">
          <el-option label="领料出库" :value="100" />
          <el-option label="退料入库" :value="200" />
          <el-option label="倒冲出库" :value="120" />
        </el-select>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="queryParams.remark"
          placeholder="请输入备注"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['erp:stock-req:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['erp:stock-req:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
        <el-button
          type="danger"
          plain
          @click="handleDelete(selectionList.map((item) => item.id))"
          v-hasPermi="['erp:stock-req:delete']"
          :disabled="selectionList.length === 0"
        >
          <Icon icon="ep:delete" class="mr-5px" /> 删除
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table
      v-loading="loading"
      :data="list"
      :stripe="true"
      :show-overflow-tooltip="true"
      @selection-change="handleSelectionChange"
    >
      <el-table-column width="30" label="选择" type="selection" />
      <el-table-column min-width="180" label="出库单号" align="center" prop="no" />
      <el-table-column label="物料信息" align="center" prop="materialNames" min-width="280" />
      <el-table-column label="物料规格" align="center" prop="materialStandards" min-width="220">
        <template #default="scope">{{ scope.row.materialStandards || '-' }}</template>
      </el-table-column>
      <el-table-column label="部门" align="center" prop="customerName" />
      <el-table-column
        label="出库时间"
        align="center"
        prop="outTime"
        :formatter="dateFormatter2"
        width="120px"
      />
      <el-table-column label="创建人" align="center" prop="creatorName" />
      <el-table-column
        label="数量"
        align="center"
        prop="totalCount"
        :formatter="erpCountTableColumnFormatter"
      />
      <el-table-column
        label="金额"
        align="center"
        prop="totalPrice"
        :formatter="erpPriceTableColumnFormatter"
        v-if ="false"
      />
      <el-table-column label="状态" align="center" fixed="right" width="90" prop="status">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.ERP_AUDIT_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right" width="220">
        <template #default="scope">
          <el-button
            link
            @click="openForm('detail', scope.row.id)"
            v-hasPermi="['erp:stock-req:query']"
          >
            详情
          </el-button>
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['erp:stock-req:update']"
            :disabled="scope.row.status === 20"
          >
            编辑
          </el-button>
          <el-button
            link
            type="primary"
            @click="handleUpdateStatus(scope.row.id, 20)"
            v-hasPermi="['erp:stock-req:update-status']"
            v-if="scope.row.status === 10"
          >
            审批
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleUpdateStatus(scope.row.id, 10)"
            v-hasPermi="['erp:stock-req:update-status']"
            v-else
          >
            反审批
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete([scope.row.id])"
            v-hasPermi="['erp:stock-req:delete']"
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
  <StockOutReqForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { dateFormatter2 } from '@/utils/formatTime'
import download from '@/utils/download'
import { StockOutReqApi, StockOutReqVO } from '@/api/erp/stock/req'
import StockOutReqForm from './StockOutReqForm.vue'
import { erpCountTableColumnFormatter, erpPriceTableColumnFormatter } from '@/utils'
import { useBasicData } from '@/api/erp/basic/common'
const { materialInfoArray, warehouseItem, userItem, customerItem } = useBasicData()

/** ERP 领料出库单列表 */
defineOptions({ name: 'ErpStockOutReq' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<StockOutVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  no: undefined,
  materialId: undefined,
  customerId: undefined,
  warehouseId: undefined,
  outTime: [],
  status: undefined,
  remark: undefined,
  creator: undefined,
  outType: 100
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await StockOutReqApi.getStockOutPage(queryParams)
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
const handleDelete = async (ids: number[]) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await StockOutReqApi.deleteStockOut(ids)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
    selectionList.value = selectionList.value.filter((item) => !ids.includes(item.id))
  } catch {}
}

/** 审批/反审批操作 */
const handleUpdateStatus = async (id: number, status: number) => {
  try {
    // 审批的二次确认
    await message.confirm(`确定${status === 20 ? '审批' : '反审批'}该出库单吗？`)
    // 发起审批
    await StockOutReqApi.updateStockOutStatus(id, status)
    message.success(`${status === 20 ? '审批' : '反审批'}成功`)
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
    const data = await StockOutReqApi.exportStockOut(queryParams)
    download.excel(data, '领料出库单.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 选中操作 */
const selectionList = ref<StockOutVO[]>([])
const handleSelectionChange = (rows: StockOutVO[]) => {
  selectionList.value = rows
}

/** 初始化 **/
onMounted(async () => {
  await getList()
})
</script>