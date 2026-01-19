<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="formRules"
    v-loading="formLoading"
    label-width="0px"
    :inline-message="true"
    :disabled="isViewMode"
  >
    <el-table :data="formData" class="-mt-8px">
      <el-table-column label="序号" type="index" width="100" align="center"/>
      <el-table-column label="物料名称" min-width="150" align="center">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.materialName`" :rules="formRules.materialName" class="mb-0px!">
            <el-input v-model="row.materialName" placeholder="物料" disabled/>
          </el-form-item>
        </template>
      </el-table-column>
       <el-table-column label="物料编码" min-width="150" align="center">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.materialBarCode`" class="mb-0px!">
            <el-input v-model="row.materialBarCode" placeholder="物料编码" disabled/>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="单位" min-width="150" align="center">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.materialUnitName`" class="mb-0px!">
            <el-input v-model="row.materialUnitName" placeholder="物料单位" disabled/>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="规格" min-width="150" align="center">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.materialStandard`" class="mb-0px!">
            <el-input v-model="row.materialStandard" placeholder="物料规格" disabled/>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="物料属性" width="80"  align="center">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.materialAttr`"  class="mb-0px!">
            <dict-tag :type="DICT_TYPE.ERP_MATERIAL_ATTR" :value="row.materialAttr" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="计划数量" min-width="150" align="center">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.planQuantity`" :rules="formRules.planQuantity" class="mb-0px!">
            <el-input-number v-model="row.planQuantity" placeholder="请输入计划数量" disabled/>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="实际数量" min-width="150" align="center">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.actualQuantity`" :rules="formRules.actualQuantity" class="mb-0px!">
            <el-input-number v-model="row.actualQuantity" placeholder="请输入实际数量" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="下达状态" width="80" align="center">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.status`" :rules="formRules.status" class="mb-0px!">
            <dict-tag :type="DICT_TYPE.ERP_MATERIAL_REQUIREMENT_PLAN" :value="row.status" />
            <!-- <el-input v-model="row.status" placeholder="下达状态" /> -->
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="计划开工日期" min-width="150" align="center">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.startDate`" :rules="formRules.startDate" class="mb-0px!">
            <el-input v-model="row.startDate" placeholder="计划开工日期" disabled/>

            <!-- <el-date-picker
              v-model="row.startDate"
              type="date"
              value-format="x"
              placeholder="选择计划开工日期"
            /> -->
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="计划完工日期" min-width="150" align="center">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.endDate`" :rules="formRules.endDate" class="mb-0px!">
            <el-input v-model="row.endDate" placeholder="计划完工日期" disabled/>

            <!-- <el-date-picker
              v-model="row.endDate"
              type="date"
              value-format="x"
              placeholder="选择计划完工日期"
            /> -->
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column align="center" fixed="right" label="操作" width="60" v-if="!isViewMode">
        <template #default="{ $index }">
          <el-button @click="handleDelete($index)" link>—</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-form>
  <!-- <el-row justify="center" class="mt-3">
    <el-button @click="handleAdd" round>+ 添加物料需求计划明细</el-button>
  </el-row> -->
</template>
<script setup lang="ts">
import { DICT_TYPE } from '@/utils/dict'
import { MaterialRequirementPlanApi } from '@/api/erp/produce/materialrequirementplan'

const props = defineProps<{
  materialRequirementPlanId: undefined // 物料需求计划ID（主表的关联字段）
  fromType: string
}>()
const formLoading = ref(false) // 表单的加载中
const formData = ref([])
const formRules = reactive({
  materialRequirementPlanId: [{ required: true, message: '物料需求计划ID不能为空', trigger: 'blur' }],
  materialName: [{ required: true, message: '物料ID不能为空', trigger: 'blur' }],
  planQuantity: [{ required: true, message: '计划数量不能为空', trigger: 'blur' }],
  actualQuantity: [{ required: true, message: '实际数量不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '下达状态不能为空', trigger: 'change' }],
  startDate: [{ required: true, message: '计划开工日期不能为空', trigger: 'blur' }],
  endDate: [{ required: true, message: '计划完工日期不能为空', trigger: 'blur' }],
})
const formRef = ref() // 表单 Ref

/** 监听主表的关联字段的变化，加载对应的子表数据 */
watch(
  () => props.materialRequirementPlanId,
  async (val) => {
    // 1. 重置表单
    formData.value = []
    // 2. val 非空，则加载数据
    if (!val) {
      return;
    }
    try {
      formLoading.value = true
      formData.value = await MaterialRequirementPlanApi.getItemInfo(val)
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
    materialRequirementPlanId: undefined,
    materialId: undefined,
    materialName: undefined,
    matchMedialBarCode: undefined,
    materialUnitId: undefined,
    materialUnitName: undefined,
    materialStandard: undefined,
    materialAttr: undefined,
    processId: undefined,
    processName: undefined,
    planQuantity: undefined,
    actualQuantity: undefined,
    status: undefined,
    startDate: undefined,
    endDate: undefined,
  }
  row.materialRequirementPlanId = props.materialRequirementPlanId
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
// 新增计算属性：判断是否为查看模式
const isViewMode = computed(() => props.fromType === 'view')
</script>