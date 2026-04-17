<template>
  <Dialog
    title="选择生产任务单（仅展示可领料）"
    v-model="dialogVisible"
    :appendToBody="true"
    :scroll="true"
    width="1200"
  >
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="100px"
    >
      <el-form-item label="任务名称：" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入任务名称"
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
      <el-form-item label="物料：" prop="materialId">
        <el-select v-model="queryParams.materialId"  clearable filterable placeholder="请选择物料" class="!w-240px" >
          <el-option v-for="[id, name] in materialItem" :key="id" :value="id" :label="name" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态：" prop="status">
        <el-select v-model="queryParams.status"  clearable filterable placeholder="请选择状态" class="!w-240px" >
          <el-option v-for="[id, name] in productionTaskStatusItem" :key="id" :value="id" :label="name" />
        </el-select>
      </el-form-item>
      <el-form-item label="开工时间：" prop="startWorkTime">
        <el-date-picker
          v-model="queryParams.startWorkTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="完工时间：" prop="endWorkTime">
        <el-date-picker
          v-model="queryParams.endWorkTime"
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
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column align="center" width="65">
          <template #default="scope">
            <el-radio
              :value="scope.row.id"
              v-model="currentRowValue"
              @change="handleCurrentChange(scope.row)"
            >
              &nbsp;
            </el-radio>
          </template>
        </el-table-column>
      <el-table-column label="ID" align="center" prop="id" v-show="false"/>
      <el-table-column label="任务名称" align="center" prop="name" width="180px" v-if="false"/>
      <el-table-column label="任务编码" align="center" prop="productionTaskNo" width="180px"/>
      <el-table-column label="物料编码" align="center" prop="materialNumber" width="180px"/>
      <el-table-column label="物料名称" align="center" prop="materialName" min-width="220" />
      <el-table-column label="物料规格" align="center" prop="materialSpec" min-width="220" />
      <el-table-column label="物料单位" align="center" prop="materialUnit" />
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.PRODUCTION_TASK_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="计划生产数量" align="center" prop="plannedQuantity" width="110px"/>
      <el-table-column label="实际生产数量" align="center" prop="actualQuantity" width="110px"/>
      <el-table-column label="开工时间" align="center"  prop="startDate" width="180px" />
      <el-table-column label="完工时间" align="center" prop="endDate" width="180px" />
      <el-table-column label="备注" align="center" prop="remark" />
    </el-table>
    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>
  <template #footer>
    <el-button :disabled="!currentRow" type="primary" @click="submitForm">确 定</el-button>
    <el-button @click="dialogVisible = false">取 消</el-button>
  </template>
</Dialog>
</template>

<script setup lang="ts">
import { ElTable } from 'element-plus'
import { DICT_TYPE } from '@/utils/dict'
import { ProductionTaskApi, ProductionTaskVO } from '@/api/erp/produce/productiontask'
import { useBasicData } from '@/api/erp/basic/common'
const { materialItem, productionTaskStatusItem } = useBasicData()


const dialogVisible = ref(false) // 弹窗的是否展示
/** 生产任务 列表 - 用于领料出库 */
defineOptions({ name: 'ProductionTaskEnableList' })
const loading = ref(true) // 列表的加载中
const list = ref<ProductionTaskVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: undefined,
  productionTaskNo: undefined,
  materialId: undefined,
  status: undefined, // 不限制状态，允许各种状态的任务单领料
  startDate: [],
  endDate: []
})
const queryFormRef = ref() // 搜索的表单

/** 选中行 */
const currentRowValue = ref(undefined) // 选中行的 value
const currentRow = ref(undefined) // 选中行
const handleCurrentChange = (row) => {
  currentRow.value = row
}
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

/** 初始化 **/
onMounted(() => {
  getList()
})

/** 提交选择 */
const emits = defineEmits<{
  (e: 'success', value: ProductionTaskVO): void
}>()
const submitForm = () => {
  try {
    emits('success', currentRow.value)
  } finally {
    // 关闭弹窗
    dialogVisible.value = false
  }
}

/** 打开弹窗 */
const open = async () => {
  dialogVisible.value = true
  currentRowValue.value = undefined
  currentRow.value = undefined
  await nextTick() // 等待，避免 queryFormRef 为空
  // 加载可领料的任务单列表
  await resetQuery()
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗
</script>
