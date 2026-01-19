<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="formRules"
    v-loading="formLoading"
    label-width="0px"
    :inline-message="true"
  >
    <el-table :data="formData" class="-mt-10px">
      <el-table-column label="序号" type="index" width="100" />
      <el-table-column label="工序编码" min-width="150" align="center">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.processCode`" :rules="formRules.processCode" class="mb-0px!">
            <el-input v-model="row.processCode" placeholder="请输入工序编码" readonly />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="工序名称" min-width="150" align="center">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.processName`" :rules="formRules.processName" class="mb-0px!">
            <el-input v-model="row.processName" placeholder="请输入工序名称" readonly />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="工序顺序" min-width="100" align="center">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.sequence`" :rules="formRules.sequence" class="mb-0px!">
            <el-input v-model="row.sequence" placeholder="请输入工序顺序" readonly/>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="实际工期(天)" min-width="100" align="center">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.actualDay`" :rules="formRules.actualDay" class="mb-0px!">
            <el-input v-model="row.actualDay" placeholder="请输入实际工期(天)" readonly/>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="任务状态" align="center">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.status`" :rules="formRules.status" class="mb-0px!">
            <dict-tag :type="DICT_TYPE.ERP_PRODUCTION_TASK_STATUS" :value="row.status" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="开工时间" min-width="150" align="center">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.startDate`" :rules="formRules.startDate" class="mb-0px!">
            <el-date-picker
              v-model="row.startDate"
              type="date"
              value-format="x"
              placeholder="选择开工时间"
              readonly
            />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="完工时间" min-width="150" align="center">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.endDate`" :rules="formRules.endDate" class="mb-0px!">
            <el-date-picker
              v-model="row.endDate"
              type="date"
              value-format="x"
              placeholder="选择完工时间"
              readonly
            />
          </el-form-item>
        </template>
      </el-table-column>

      <el-table-column label="质检状态"  align="center">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.qualityCheck`" :rules="formRules.qualityCheck" class="mb-0px!">
            <dict-tag :type="DICT_TYPE.ERP_PRODUCTION_TASK_QUALITY_CHECK_STATUS" :value="row.qualityCheck" />
          </el-form-item>
        </template>
      </el-table-column>

      <el-table-column label="末道工序"  align="center">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.finalProcess`" class="mb-0px!">
            <dict-tag :type="DICT_TYPE.INFRA_BOOLEAN_STRING" :value="row.finalProcess" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="备注" min-width="150" align="center">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.remark`" :rules="formRules.remark" class="mb-0px!">
            <el-input v-model="row.remark" placeholder="请输入备注" />
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
  <el-row justify="center" class="mt-3">
    <el-button @click="handleAdd" round style="display: none;">+ 添加工序计划列表</el-button>
  </el-row>
</template>
<script setup lang="ts">
import { ProductionTaskApi } from '@/api/erp/produce/productiontask'
import { DICT_TYPE } from '@/utils/dict'

const props = defineProps<{
  productionTaskId: undefined // 任务单ID（主表的关联字段）
}>()
const formLoading = ref(false) // 表单的加载中
const formData = ref([])
const formRules = reactive({
  productionTaskId: [{ required: true, message: '任务单ID不能为空', trigger: 'blur' }],
  processId: [{ required: true, message: '工序ID不能为空', trigger: 'blur' }],
  processCode: [{ required: true, message: '工序 编码不能为空', trigger: 'blur' }],
  processName: [{ required: true, message: '工序名称不能为空', trigger: 'blur' }],
  sequence: [{ required: true, message: '工序顺序不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '状态(1-待开始 2-进行中 3-已完成)不能为空', trigger: 'blur' }],
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
      formData.value = await ProductionTaskApi.getProductionTaskProcessesListByProductionTaskId(val)
    } finally {
      formLoading.value = false
    }
  },
  { immediate: true }
)

/** 新增按钮操作 */
const handleAdd = () => {
  const row = {
    id: undefined,
    productionTaskId: undefined,
    processId: undefined,
    processCode: undefined,
    processName: undefined,
    sequence: undefined,
    plannedDay: undefined,
    actualDay: undefined,
    status: undefined,
    startWorkTime: undefined,
    endWorkTime: undefined,
    qualityCheck: undefined,
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

defineExpose({ validate, getData })
</script>