<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="formRules"
    v-loading="formLoading"
    label-width="0px"
    :inline-message="true"
  >
    <el-table
      :data="formData"
      class="-mt-10px"
      :show-overflow-tooltip="true"
      @selection-change="handleSelectionChange"
      ref="tableRef"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="序号" type="index" width="60" />
      <el-table-column label="工序" min-width="120" align="center">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.processName`"  class="mb-0px!">
            <el-input v-model="row.processName" disabled/>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="物料编码" min-width="150" align="center">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.materialCode`" :rules="formRules.materialCode" class="mb-0px!">
            <el-input v-model="row.materialCode" placeholder="请输入物料编码" disabled/>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="物料名称" min-width="220" align="center">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.materialName`" :rules="formRules.materialName" class="mb-0px!">
            <el-input v-model="row.materialName" placeholder="请输入物料名称" disabled/>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="物料规格" min-width="220" align="center">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.materialSpec`" :rules="formRules.materialSpec" class="mb-0px!">
            <el-input v-model="row.materialSpec" placeholder="请输入物料规格" disabled/>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="单位" min-width="100" align="center">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.materialUnit`" :rules="formRules.materialUnit" class="mb-0px!">
            <el-input v-model="row.materialUnit" placeholder="请输入单位" disabled/>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="计划用量" min-width="120" align="center">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.plannedQuantity`" :rules="formRules.plannedQuantity" class="mb-0px!">
            <el-input v-model="row.plannedQuantity" placeholder="请输入计划用量" disabled/>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="退回用量" min-width="120" align="center">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.returnQuantity`" :rules="formRules.returnQuantity" class="mb-0px!">
            <el-input v-model="row.returnQuantity" placeholder="请输入退回用量" disabled/>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="已领用量" min-width="120" align="center">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.issuedQuantity`" :rules="formRules.issuedQuantity" class="mb-0px!">
            <el-input v-model="row.issuedQuantity" placeholder="请输入已领用量" disabled/>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="备注" min-width="150" align="center">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.remark`" :rules="formRules.remark" class="mb-0px!">
            <el-input v-model="row.remark" placeholder="请输入备注" disabled/>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column align="center" fixed="right" label="操作" width="60">
        <template #default="{ $index }">
          <el-button @click="handleDelete($index)" link>—</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-form>
  <!-- <el-row justify="center" class="mt-3">
    <el-button @click="handleAdd" round>+ 添加物料需求计划列表</el-button>
  </el-row> -->
</template>
<script setup lang="ts">
import { ProductionTaskApi } from '@/api/erp/produce/productiontask'

const props = defineProps<{
  productionTaskId: undefined // 任务单ID（主表的关联字段）
}>()
const formLoading = ref(false) // 表单的加载中
const formData = ref([])
const formRules = reactive({
  productionTaskId: [{ required: true, message: '任务单ID不能为空', trigger: 'blur' }],
  materialId: [{ required: true, message: '物料ID不能为空', trigger: 'blur' }],
  materialCode: [{ required: true, message: '物料编码不能为空', trigger: 'blur' }],
  materialName: [{ required: true, message: '物料名称不能为空', trigger: 'blur' }],
  materialUnit: [{ required: true, message: '单位不能为空', trigger: 'blur' }],
  plannedQuantity: [{ required: true, message: '计划用量不能为空', trigger: 'blur' }],
})
const formRef = ref() // 表单 Ref

/** 监听主表的关联字段的变化，加载对应的子表数据 */
watch(
  () => props.productionTaskId,
  async (val) => {
    // 1. 重置表单
    formData.value = []
    // 2. val 非空，则加载数据
    if (!val) {
      return;
    }
    try {
      formLoading.value = true
      formData.value = await ProductionTaskApi.getProductionTaskMaterialListByProductionTaskId(val)
    } finally {
      formLoading.value = false
    }
  },
  { immediate: true }
)

const refresh = async () =>{
  try {
      formLoading.value = true
      formData.value = await ProductionTaskApi.getProductionTaskMaterialListByProductionTaskId(props.productionTaskId)
    } finally {
      formLoading.value = false
    }

}

/** 新增按钮操作 */
const handleAdd = () => {
  const row = {
    id: undefined,
    productionTaskId: undefined,
    processName: undefined,
    // 修改为 number 类型，初始值设为 0
    materialId: undefined, 
    materialCode: undefined,
    materialName: undefined,
    materialSpec: undefined,
    materialUnit: undefined,
    plannedDay: undefined,
    actualDay: undefined,
    plannedQuantity: undefined,
    returnQuantity: undefined,
    issuedQuantity: undefined,
    remark: undefined,
  }
  row.productionTaskId = props.productionTaskId
  formData.value.push(row)
}

/** 删除按钮操作 */
const handleDelete = (index) => {
  formData.value.splice(index, 1)
}

/** 表单校验 */
const validate = () => {
  return formRef.value.validate()
}

/** 表单值 */
const getData = () => {
  return formData.value
}

const selectedRows = ref([]) // 存储选中的行数据
const tableRef = ref()

/** 处理选择变化 */
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

/** 获取选中的数据 */
const getSelectedData = () => {
  return selectedRows.value
}
defineExpose({ validate, getData, refresh, getSelectedData })
</script>