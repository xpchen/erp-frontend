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
      <el-form-item label="计划编码" prop="no">
        <el-input
          v-model="queryParams.no"
          placeholder="请输入计划编码"
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
      <el-form-item label="规格型号" prop="mode">
        <el-input
          v-model="queryParams.mode"
          placeholder="请输入规格型号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
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
      <el-form-item label="完工日期" prop="endDate">
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
      <el-form-item label="物料属性" prop="materialAttr">
          <el-select v-model="queryParams.materialAttr" placeholder="请选择物料属性" class="!w-120px">
            <el-option
              v-for="dict in getIntDictOptions(DICT_TYPE.ERP_MATERIAL_ATTR)"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true" @selection-change="handleSelectionChange"  ref="multipleTableRef">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="计划编码" align="center" prop="no" />
      <el-table-column label="物料" align="center" prop="materialName" />
      <el-table-column label="单位" align="center" prop="unitName" />
      <el-table-column label="规格型号" align="center" prop="mode" />
      <el-table-column label="数量" align="center" prop="qty" />
      <el-table-column
        label="开工日期"
        align="center"
        prop="startDate"
        :formatter="dateFormatter2"
        width="180px"
      />
      <el-table-column
        label="完工日期"
        align="center"
        prop="endDate"
        :formatter="dateFormatter2"
        width="180px"
      />
      <el-table-column label="物料属性" align="center" prop="materialAttr" >
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.ERP_MATERIAL_ATTR" :value="scope.row.materialAttr" />
        </template>
      </el-table-column>  
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="MRP选单" align="center" prop="mrpSelected">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.SYSTEM_YES_NO" :value="scope.row.mrpSelected" />
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
import { dateFormatter2 } from '@/utils/formatTime'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { MainPlanApi, MainPlanVO } from '@/api/erp/produce/mainplan'
import { useBasicData } from '@/api/erp/basic/common'
const { materialInfoArray } = useBasicData()
const message = useMessage() // 消息弹窗

/** 主计划 列表 */
defineOptions({ name: 'ErpProduceMainPlanFrom' })

const dialogVisible = ref(false)
const dialogTitle = ref('选择主计划')
const loading = ref(true) // 列表的加载中
const list = ref<MainPlanVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const multipleTableRef = ref() // 多选表格引用
const selectedRows = ref<MainPlanVO[]>([]) // 选中的行数据
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  no: undefined,
  materialId: undefined,
  mode: undefined,
  remark: undefined,
  startDate: [],
  endDate: [],
  materialAttr: undefined,
  mrpSelected: '0'
})
const queryFormRef = ref() // 搜索的表单

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await MainPlanApi.getMainPlanPage(queryParams)
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

/** 多选处理 */
const handleSelectionChange = (rows: MainPlanVO[]) => {
  selectedRows.value = rows
}

/** 确定选择 */
const handleConfirm = () => {
  debugger
  if (selectedRows.value.length === 0) {
    message.warning('请至少选择一条主计划')
    return
  }
  
  const selectedNos = selectedRows.value.map(row => row.no)
  emit('success', selectedNos)
  dialogVisible.value = false
}

/** 打开对话框 */
const open = () => {
  dialogVisible.value = true
  // 重置选择状态
  nextTick(() => {
    if (multipleTableRef.value) {
      multipleTableRef.value.clearSelection()
    }
  })
  // 刷新列表
  getList()
}

defineExpose({ open })

const emit = defineEmits(['success'])

/** 初始化 **/
onMounted(() => {
  getList()
})
</script>