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
      <el-form-item label="工序编码" prop="codeNo">
        <el-input
          v-model="queryParams.codeNo"
          placeholder="请输入工序编码"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="工序名称" prop="processName">
        <el-input
          v-model="queryParams.processName"
          placeholder="请输入工序名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择状态"
          clearable
          class="!w-240px"
          disabled
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.SYSTEM_STATUS_OK_NG)"
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
          v-hasPermi="['erp:produce-process:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['erp:produce-process:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
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
     @row-click="handleRowClick" 
     style="cursor: pointer"  
     highlight-current-row
     :current-row-key="currentRowKey"
     :row-class-name="tableRowClassName"
     :show-overflow-tooltip="true">
      <el-table-column label="工序编码" align="center" prop="codeNo" />
      <el-table-column label="工序名称" align="center" prop="processName" />
      <el-table-column label="工作中心" align="center" prop="workCenter" />
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.SYSTEM_STATUS_OK_NG" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="描述" align="center" prop="description" />
    </el-table>
    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>
</template>

<script setup lang="ts">
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import { ProduceProcessApi, ProduceProcessVO } from '@/api/erp/produce/process'


const currentRowKey = ref()
const currentSelectedRow = ref<ProduceProcessVO | null>(null)

const emit = defineEmits(['select'])  // 定义选择事件

// 行点击处理
const handleRowClick = (row: ProduceProcessVO) => {
  currentRowKey.value = row.id
  currentSelectedRow.value = row
  emit('select', row)
}

// 行样式处理
const tableRowClassName = ({ row }: { row: ProduceProcessVO }) => {
  return row.id === currentRowKey.value ? 'selected-row' : ''
}


/** 工艺工序 列表 */
defineOptions({ name: 'ErpProduceProcess' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<ProduceProcessVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  codeNo: undefined,
  processName: undefined,
  status: 1,
})
const queryFormRef = ref() // 搜索的表单

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    debugger
    const data = await ProduceProcessApi.getProduceProcessPage(queryParams)
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
</script>

<style scoped>
/* 选中行样式 */
:deep(.el-table__body tr.selected-row > td) {
  background-color: #16e449 !important;
}

/* 鼠标悬停样式 */
:deep(.el-table__body tr:hover > td) {
  background-color: #0bc1da !important;
}
</style>