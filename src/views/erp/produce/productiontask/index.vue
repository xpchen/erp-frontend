<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="100px"
    >
      <el-form-item label="销售单号" prop="saleOrderNo">
        <el-input
          v-model="queryParams.saleOrderNo"
          placeholder="请输入销售单号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="任务单编码：" prop="productionTaskNo">
        <el-input
          v-model="queryParams.productionTaskNo"
          placeholder="请输入任务单编码"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <!-- <el-form-item label="主计划编码：" prop="productMainPlanNo">
        <el-input
          v-model="queryParams.productMainPlanNo"
          placeholder="请输入主计划编码"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item> -->
      <el-form-item label="物料类别：" prop="materialCategoryId">
        <el-select v-model="queryParams.materialCategoryId"  clearable filterable placeholder="请选择物料类别" class="!w-240px" >
          <el-option v-for="[id, name] in materialCategoryItem" :key="id" :value="id" :label="name" />
        </el-select>
      </el-form-item>
      <el-form-item label="物料：" prop="materialId">
        <el-select v-model="queryParams.materialId"  clearable filterable placeholder="请选择物料" class="!w-240px" >
          <el-option v-for="[id, name] in materialItem" :key="id" :value="id" :label="name" />
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="优先级：" prop="priority">
        <el-select v-model="queryParams.priority"  clearable filterable placeholder="请选择优先级" class="!w-240px" >
          <el-option v-for="[id, name] in productionTaskPriorityItem" :key="id" :value="id" :label="name" />
        </el-select>
      </el-form-item> -->
      <el-form-item label="状态：" prop="status">
        <el-select
          v-model="queryParams.status"
          multiple 
          clearable
          filterable
          placeholder="请选择状态"
          class="!w-240px"
        >
          <el-option v-for="[id, name] in productionTaskStatusItem" :key="id" :value="id" :label="name" />
        </el-select>
      </el-form-item>
      <el-form-item label="开工时间：" prop="startDate">
        <el-date-picker
          v-model="queryParams.startDate"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="完工时间：" prop="endDate">
        <el-date-picker
          v-model="queryParams.endDate"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['erp:production-task:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 手动新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['erp:production-task:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="操作" align="center" fix="right" min-width="120px">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['erp:production-task:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['erp:production-task:delete']"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="ID" align="center" prop="id" v-if="false"/>
      <el-table-column label="任务名称" align="center" prop="name" width="180px" v-if="false"/>
      <el-table-column label="任务编码" align="center" prop="productionTaskNo" width="160px"/>
      <!-- <el-table-column label="主计划编码" align="center" prop="productMainPlanNo"  width="110px"/> -->
      <el-table-column label="销售单号" align="center" prop="saleOrderNo"  width="160px"/> 
      <el-table-column label="物料编码" align="center" prop="materialNumber" width="120px"/>
      <el-table-column label="名称" align="center" prop="materialName" width="180px"/>
      <el-table-column label="规格" align="center" prop="materialSpec" width="180px"/>
      <el-table-column label="单位" align="center" prop="materialUnit" width="80px"/>
      <!-- <el-table-column label="优先级" align="center" prop="priority">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.PRODUCTION_TASK_PRIORITY" :value="scope.row.priority" />
        </template>
      </el-table-column> -->
      <el-table-column label="状态" align="center" prop="status" width="90px">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.PRODUCTION_TASK_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="计划数量" align="center" prop="plannedQuantity" width="90px"/>
      <el-table-column label="完成数量" align="center" prop="actualQuantity" width="90px"/>
      <el-table-column label="开工时间" align="center"  prop="startDate" width="110px" />
      <el-table-column label="完工时间" align="center" prop="endDate" width="110px" />
      <el-table-column label="备注" align="center" prop="remark" />+
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
  <ProductionTaskForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { DICT_TYPE } from '@/utils/dict'
import download from '@/utils/download'
import { ProductionTaskApi, ProductionTaskVO } from '@/api/erp/produce/productiontask'
import ProductionTaskForm from './ProductionTaskForm.vue'
import { useBasicData } from '@/api/erp/basic/common'
const { materialItem, productionTaskStatusItem , materialCategoryItem } = useBasicData()

/** 生产任务 列表 */
defineOptions({ name: 'ProductionTask' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<ProductionTaskVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  saleOrderNo: undefined,
  productionTaskNo: undefined,
  productMainPlanNo: undefined,
  materialId: undefined,
  priority: undefined,
  materialCategoryId: undefined, // 新增物料类别查询参数
  status: [1, 2], // 初始默认选中 1 和 2
  startDate: [],
  endDate: []
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await ProductionTaskApi.getProductionTaskPage(queryParams)
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
    await ProductionTaskApi.deleteProductionTask(id)
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
    const data = await ProductionTaskApi.exportProductionTask(queryParams)
    download.excel(data, '生产任务.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 初始化 **/
onMounted(() => {
  getList()
})
</script>