<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="formRules"
    v-loading="formLoading"
    label-width="0px"
    :inline-message="true"
    :disabled="disabled"
  >
    <el-table :data="formData" class="-mt-10px">
      <el-table-column label="序号" type="index" width="60"  align="center"/>
       <el-table-column label="明细单号" min-width="180" align="center">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.sourceNo`" :rules="formRules.sourceNo" class="mb-0px!">
            <el-input v-model="row.sourceNo" placeholder="明细单号" readonly disabled/>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="物料名称" min-width="150" align="center">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.materialName`" :rules="formRules.materialName" class="mb-0px!">
            <el-input v-model="row.materialName" placeholder="请输入物料名称" readonly disabled/>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="规格型号" min-width="150" align="center">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.standard`" :rules="formRules.standard" class="mb-0px!">
            <el-input v-model="row.standard" placeholder="请输入规格型号" readonly disabled/>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="单位" min-width="80" align="center">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.unitId`" :rules="formRules.unitName" class="mb-0px!">
            <el-input v-model="row.unitName" placeholder="请输入单位" readonly disabled/>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="对账数量" min-width="110" align="center">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.billingQuantity`" :rules="formRules.billingQuantity" class="mb-0px!">
            <el-input type="number" v-model="row.billingQuantity" placeholder="请输入对账数量" :disabled="disabled"/>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="对账单价" min-width="100" align="center">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.price`" :rules="formRules.price" class="mb-0px!">
            <el-input type="number" v-model="row.price" placeholder="请输入对账单价" :disabled="disabled"/>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="金额(不含税)" min-width="120" align="center">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.amount`" :rules="formRules.amount" class="mb-0px!">
            <el-input v-model="row.amount" placeholder="请输入金额(不含税)" disabled/>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="税率" min-width="80" align="center">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.taxRate`" :rules="formRules.taxRate" class="mb-0px!">
            <el-input type="number" v-model="row.taxRate" placeholder="税率" :disabled="disabled"/>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="税额" min-width="100" align="center">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.taxAmount`" :rules="formRules.taxAmount" class="mb-0px!">
            <el-input v-model="row.taxAmount" placeholder="税额" disabled/>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="总金额(含税)" min-width="120" align="center">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.totalAmount`" :rules="formRules.totalAmount" class="mb-0px!">
            <el-input type="number" v-model="row.totalAmount" placeholder="总金额(含税)" disabled />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="备注" min-width="150" align="center">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.remark`" :rules="formRules.remark" class="mb-0px!">
            <el-input v-model="row.remark" placeholder="备注" />
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
  <!-- <el-row justify="center" class="mt-3" v-if="false">
    <el-button @click="handleAdd" round>+ 添加对账单明细</el-button>
  </el-row> -->
</template>
<script setup lang="ts">
import { FinanceStatementApi } from '@/api/erp/finance/financestatement'

const props = defineProps<{
  statementId: number | undefined, // 对账单 ID（主表的关联字段）
  disabled: boolean
}>()
const emit = defineEmits(['updateTotalAmount']) // 定义自定义事件
const formLoading = ref(false) // 表单的加载中
const formData = ref([])
const formRules = reactive({
  statementId: [{ required: true, message: '对账单 ID不能为空', trigger: 'blur' }],
})
const formRef = ref() // 表单 Ref

// 计算总金额(含税)
const totalTaxAmount = computed(() => {
  return formData.value.reduce((sum, item) => {
    const amount = parseFloat(item.totalAmount) || 0
    return sum + amount
  }, 0)
})

// 监听总金额变化并触发事件
watch(totalTaxAmount, (newTotal) => {
  emit('updateTotalAmount', newTotal)
})

/** 监听主表的关联字段的变化，加载对应的子表数据 */
watch(
  () => props.statementId,
  async (val) => {
    // 1. 重置表单
    formData.value = []
    // 2. val 非空，则加载数据
    if (!val) {
      return;
    }
    try {
      formLoading.value = true
      debugger
      const data =  await FinanceStatementApi.getFinanceStatementItemsListByStatementId(val)
      formData.value = data
    } finally {
      formLoading.value = false
    }
  },
  { immediate: true }
)

// 定义计算金额的函数
const calculateAmounts = (row) => {
  const billingQuantity = parseFloat(row.billingQuantity) || 0
  const price = parseFloat(row.price) || 0
  const taxRate = parseFloat(row.taxRate) || 0

  // 计算金额(不含税)
  row.amount = (billingQuantity * price).toFixed(2)
  // 计算税额
  row.taxAmount = (row.amount * taxRate * 0.01).toFixed(2)
  // 计算总金额(含税)
  row.totalAmount = (parseFloat(row.amount) + parseFloat(row.taxAmount)).toFixed(2)
}

// 监听对账数量、对账单价、税率的变化
watch(() => formData.value.map(item => [item.billingQuantity, item.price, item.taxRate]), (newValues, oldValues) => {
  formData.value.forEach(row => {
    calculateAmounts(row)
  })
}, { deep: true })

/** 新增按钮操作 */
const handleAdd = () => {
  const row = {
    id: undefined,
    statementId: undefined,
    sourceNo: undefined,
    materialId: undefined,
    materialName: undefined,
    standard: undefined,
    unitId: undefined,
    billingQuantity: undefined,
    price: undefined,
    amount: undefined,
    taxRate: undefined,
    taxAmount: undefined,
    totalAmount: undefined,
    remark: undefined,
  }
  row.statementId = props.statementId
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