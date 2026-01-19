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
      <el-table-column label="sourceBillId" min-width="150" v-if="false">
        <template #default="{ row }">
          <el-form-item class="mb-0px!">
            <el-input disabled v-model="row.sourceBillId" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="sourceBillDetailId" min-width="150" v-if="false">
        <template #default="{ row }">
          <el-form-item class="mb-0px!">
            <el-input disabled v-model="row.sourceBillDetailId" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="序号" type="index" align="center" width="60" />
      <el-table-column label="物料名称" min-width="180">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.materialId`" :rules="formRules.materialId" class="mb-0px!">
            <el-select v-model="row.materialId"  clearable filterable placeholder="请选择物料" class="!w-220px" @change="onChangeMaterial($event, row)">
              <el-option v-for="[id, name] in materialItem" :key="id" :value="id" :label="name" />
            </el-select>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="库存" min-width="100">
        <template #default="{ row }">
          <el-form-item class="mb-0px!">
            <el-input disabled v-model="row.stockCount" :formatter="erpCountInputFormatter" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="编码" min-width="150">
        <template #default="{ row }">
          <el-form-item class="mb-0px!">
            <el-input disabled v-model="row.materialBarCode" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="规格" min-width="150">
        <template #default="{ row }">
          <el-form-item class="mb-0px!">
            <el-input disabled v-model="row.materialStandard" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="单位" min-width="80">
        <template #default="{ row }">
          <el-form-item class="mb-0px!">
            <el-input disabled v-model="row.materialUnitName" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="数量" prop="count" min-width="140">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.count`" :rules="formRules.count" class="mb-0px!">
            <el-input-number
              v-model="row.count"
              controls-position="right"
              :min="0.001"
              :precision="3"
              class="!w-100%"
            />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="物料单价" min-width="120">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.materialPrice`" :rules="formRules.materialPrice" class="mb-0px!">
            <el-input-number
              v-model="row.materialPrice"
              controls-position="right"
              :min="0.00"
              :precision="2"
              class="!w-100%"
            />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="金额" prop="totalMaterialPrice" min-width="100">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.totalMaterialPrice`" class="mb-0px!">
            <el-input
              disabled
              v-model="row.totalMaterialPrice"
              :formatter="erpPriceInputFormatter"
            />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="税率（%）"  min-width="115" v-if="false">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.taxPercent`" class="mb-0px!">
            <el-input-number
              v-model="row.taxPercent"
              controls-position="right"
              :min="0"
              :precision="2"
              class="!w-100%"
            />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="税额" prop="taxPrice"  min-width="120" v-if="false">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.taxPrice`" class="mb-0px!">
            <el-form-item :prop="`${$index}.taxPrice`" class="mb-0px!">
              <el-input disabled v-model="row.taxPrice" :formatter="erpPriceInputFormatter" />
            </el-form-item>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="税额合计" prop="totalPrice" min-width="100" v-if="false">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.totalPrice`" class="mb-0px!">
            <el-input disabled v-model="row.totalPrice" :formatter="erpPriceInputFormatter" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="交货日期" min-width="140">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.deliveryDate`"  class="mb-0px!">
            <el-date-picker
              v-model="row.deliveryDate"
              type="date"
              value-format="x"
              placeholder=""
            />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="备注" min-width="150">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.remark`" class="mb-0px!">
            <el-input v-model="row.remark" placeholder="" />
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
    <el-button @click="handleAdd" round>+ 添加采购物料</el-button>
  </el-row>
</template>
<script setup lang="ts">
import { StockApi } from '@/api/erp/stock/stock'
import { useBasicData } from '@/api/erp/basic/common'
const { materialItem, materialInfoArray } = useBasicData()
import {
  erpCountInputFormatter,
  erpPriceInputFormatter,
  erpPriceMultiply,
  getSumValue
} from '@/utils'

const props = defineProps<{
  items: undefined
  disabled: false
}>()
const formLoading = ref(false) // 表单的加载中
const formData = ref([])
const formRules = reactive({
  materialId: [{ required: true, message: '物料不能为空', trigger: 'blur' }],
  count: [{ required: true, message: '物料数量不能为空', trigger: 'blur' }],
  materialPrice: [{ required: true, message: '物料单价不能为空', trigger: 'blur' }]
})
const formRef = ref([]) // 表单 Ref

/** 初始化设置入库项 */
watch(
  () => props.items,
  async (val) => {
    formData.value = val
    if (val) {
      debugger;
      for (const row of val) {
        await setStockCount(row);
      }
    }
  },
  { immediate: true }
)

/** 监听合同物料变化，计算合同物料总价 */
watch(
  () => formData.value,
  (val) => {
    if (!val || val.length === 0) {
      return
    }
    // 循环处理
    val.forEach((item) => {
      item.totalMaterialPrice = erpPriceMultiply(item.materialPrice, item.count)
      item.taxPrice = erpPriceMultiply(item.totalMaterialPrice, item.taxPercent / 100.0)
      if (item.totalMaterialPrice != null) {
        item.totalPrice = item.totalMaterialPrice + (item.taxPrice || 0)
      } else {
        item.totalPrice = 0
      }
    })
  },
  { deep: true }
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
    if (['count', 'totalMaterialPrice', 'taxPrice', 'totalPrice'].includes(column.property)) {
      const sum = getSumValue(data.map((item) => Number(item[column.property])))
      sums[index] =
        column.property === 'count' ? erpCountInputFormatter(sum) : erpPriceInputFormatter(sum)
    } else {
      sums[index] = ''
    }
  })

  return sums
}

/** 新增按钮操作 */
const handleAdd = () => {
  const row = {
    id: undefined,
    materialId: undefined,
    materialUnitName: undefined, // 物料单位
    materialBarCode: undefined, // 物料条码
    materialStandard: undefined, // 物料规格
    materialPrice: undefined,
    stockCount: undefined,
    count: 1,
    totalMaterialPrice: undefined,
    taxPercent: undefined,
    taxPrice: undefined,
    totalPrice: undefined,
    deliveryDate: undefined,
    remark: undefined
  }
  formData.value.push(row)
}

/** 删除按钮操作 */
const handleDelete = (index: number) => {
  formData.value.splice(index, 1)
}

/** 处理物料变更 */
const onChangeMaterial = (materialId, row) => {
  const material = materialInfoArray.value.find((item) => item.id === materialId)
  if (material) {
    row.materialUnitName = material.unitName
    row.materialBarCode = material.barCode
    row.materialPrice = material.purchasePrice
  }
  // 加载库存
  setStockCount(row)
}

/** 加载库存 */
const setStockCount = async (row: any) => {
  debugger
  if (!row.materialId) {
    return
  }
  const count = await StockApi.getStockCount(row.warehouseId, row.materialId)
  row.stockCount = count || 0
}

/** 表单校验 */
const validate = () => {
  return formRef.value.validate()
}
defineExpose({ validate })

/** 初始化 */
onMounted(async () => {
  // 默认添加一个
  if (formData.value.length === 0) {
    handleAdd()
  }

  // 画面初始化时，为每行调用 setStockCount
  for (const row of formData.value) {
    await setStockCount(row);
  }
})
</script>
