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
    <el-table :data="formData" show-summary :summary-method="getSummaries" class="-mt-10px">
      <el-table-column label="序号" type="index" align="center" width="60" />
      <el-table-column label="对账单编号" min-width="200" align="center" v-if="shouldShowBillNumber">
        <template #default="{ row }">
          <el-form-item class="mb-0px!">
            <el-input disabled v-model="row.bizNo" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="应付金额" prop="totalPrice" fixed="right" min-width="100" align="center">
        <template #default="{ row }">
          <el-form-item class="mb-0px!">
            <el-input-number :disabled="amountEditable"  controls-position="right" v-model="row.totalPrice" :formatter="erpPriceInputFormatter" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="已付金额" prop="paidPrice" fixed="right" min-width="100" align="center">
        <template #default="{ row }">
          <el-form-item class="mb-0px!">
            <el-input-number :disabled="amountEditable"  controls-position="right" v-model="row.paidPrice" :formatter="erpPriceInputFormatter" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="本次付款" prop="paymentPrice" fixed="right" min-width="115" align="center">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.paymentPrice`" class="mb-0px!">
            <el-input-number
              v-model="row.paymentPrice"
              controls-position="right"
              :precision="2"
              class="!w-100%"
            />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="备注" min-width="150" align="center">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.remark`" class="mb-0px!">
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
  <el-row justify="center" class="mt-3" v-if="!disabled">
    <el-button @click="handleOpenFinanceStatement" round>+ 添加应付单</el-button>
  </el-row>

  <!-- 可付款的【采购入库单】列表 -->
  <PurchaseInPaymentEnableList
    ref="purchaseInPaymentEnableListRef"
    @success="handleAddPurchaseIn"
  />
  <!-- 可付款的【采购入库单】列表 -->
  <PurchaseReturnRefundEnableList
    ref="purchaseReturnRefundEnableListRef"
    @success="handleAddPurchaseReturn"
  />
</template>
<script setup lang="ts">
import { erpPriceInputFormatter, getSumValue } from '@/utils'
import PurchaseInPaymentEnableList from '@/views/erp/purchase/in/components/PurchaseInPaymentEnableList.vue'
import PurchaseReturnRefundEnableList from '@/views/erp/purchase/return/components/PurchaseReturnRefundEnableList.vue'
import { PurchaseInVO } from '@/api/erp/purchase/in'
import { ErpBizType } from '@/utils/constants'
import { PurchaseReturnVO } from '@/api/erp/purchase/return'

const props = defineProps<{
  items: undefined
  supplierId: undefined
  disabled: false
  formType: string
}>()
const message = useMessage()

const formLoading = ref(false) // 表单的加载中
const formData = ref([])
const formRules = reactive({
  paymentPrice: [{ required: true, message: '本次付款不能为空', trigger: 'blur' }]
})
const formRef = ref([]) // 表单 Ref

/** 初始化设置入库项 */
watch(
  () => props.items,
  async (val) => {
    formData.value = val
  },
  { immediate: true }
)

/** 合计 */
const getSummaries = (param: SummaryMethodProps) => {
  const { columns, data } = param
  const sums: string[] = []
  columns.forEach((column, index: number) => {
    if (index === 0) {
      sums[index] = '合计'
      return
    }
    if (['totalPrice', 'paidPrice', 'paymentPrice'].includes(column.property)) {
      const sum = getSumValue(data.map((item) => Number(item[column.property])))
      sums[index] = erpPriceInputFormatter(sum)
    } else {
      sums[index] = ''
    }
  })
  return sums
}

/** 新增【应付单】按钮操作 */
const financeStatementPaymentEnableListRef = ref()
const handleOpenFinanceStatement = () => {
  formData.value.push({
      bizId: undefined,
      bizNo: undefined,
      totalPrice: undefined,
      paidPrice: undefined,
      paymentPrice: undefined
    })
  // if (!props.supplierId) {
  //   message.error('请选择供应商')
  //   return
  // }
  // financeStatementPaymentEnableListRef.value.open(props.supplierId)
}
const handleAddPurchaseIn = (rows: PurchaseInVO[]) => {
  rows.forEach((row) => {
    formData.value.push({
      bizId: row.id,
      bizNo: row.no,
      totalPrice: row.totalPrice,
      paidPrice: row.paymentPrice,
      paymentPrice: row.totalPrice - row.paymentPrice
    })
  })
}

/** 新增【采购退货】按钮操作 */
const purchaseReturnRefundEnableListRef = ref()
const handleOpenPurchaseReturn = () => {
  if (!props.supplierId) {
    message.error('请选择供应商')
    return
  }
  purchaseReturnRefundEnableListRef.value.open(props.supplierId)
}
const handleAddPurchaseReturn = (rows: PurchaseReturnVO[]) => {
  rows.forEach((row) => {
    formData.value.push({
      bizId: row.id,
      bizType: ErpBizType.PURCHASE_RETURN,
      bizNo: row.no,
      totalPrice: -row.totalPrice,
      paidPrice: -row.refundPrice,
      paymentPrice: -row.totalPrice + row.refundPrice
    })
  })
}

/** 删除按钮操作 */
const handleDelete = (index: number) => {
  formData.value.splice(index, 1)
}

/** 表单校验 */
const validate = () => {
  return formRef.value.validate()
}
defineExpose({ validate })

const shouldShowBillNumber = computed(() => {
  return ['update', 'detail'].includes(props.formType)
})

const amountEditable = computed(() => {
  return ['update', 'detail'].includes(props.formType)
})
</script>
