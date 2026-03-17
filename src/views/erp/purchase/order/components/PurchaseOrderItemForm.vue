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
      <el-table-column label="物料名称" min-width="280">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.materialId`" :rules="formRules.materialId" class="mb-0px!">
            <el-input
              v-model="row.materialName"
              placeholder="点击选择物料"
              readonly
              class="!w-260px"
              @click="disabled ? undefined : openMaterialDrawer(row)"
            />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="规格" min-width="160">
        <template #default="{ row }">
          <el-form-item class="mb-0px!">
            <el-input v-model="row.materialStandard" placeholder="" readonly disabled class="!w-140px" />
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
  <el-drawer v-model="drawer" title="物料选择" :direction="direction" size="55%" :modal-append-to-body="true" :append-to-body="true">
    <QueryMaterialIndex @select="handleMaterialSelect" />
  </el-drawer>
  <el-row justify="center" class="mt-3" v-if="!disabled">
    <el-button @click="handleAdd" round>+ 添加采购物料</el-button>
  </el-row>
</template>
<script setup lang="ts">
import type { DrawerProps } from 'element-plus'
import { StockApi } from '@/api/erp/stock/stock'
import { MaterialDTO } from '@/api/erp/basic/material/info'
import QueryMaterialIndex from '@/views/erp/basic/material/info/components/QueryMaterialIndex.vue'
import {
  erpCountInputFormatter,
  erpPriceInputFormatter,
  erpPriceMultiply,
  getSumValue
} from '@/utils'

const props = withDefaults(
  defineProps<{
    items: undefined
    disabled?: boolean
  }>(),
  { disabled: false }
)
const direction = ref<DrawerProps['direction']>('rtl')
const drawer = ref(false)
const currentEditRow = ref<any>(null)
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
    materialName: undefined,
    materialUnitName: undefined,
    materialBarCode: undefined,
    materialStandard: undefined,
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

/** 打开物料选择抽屉 */
const openMaterialDrawer = (row: any) => {
  currentEditRow.value = row
  drawer.value = true
}

/** 处理物料选择（从抽屉选择后回填） */
const handleMaterialSelect = (material: MaterialDTO) => {
  if (currentEditRow.value) {
    currentEditRow.value.materialId = material.id
    currentEditRow.value.materialName = material.name
    currentEditRow.value.materialStandard = material.standard
    currentEditRow.value.materialBarCode = material.barCode
    currentEditRow.value.materialUnitName = material.unitName
    currentEditRow.value.materialPrice = material.purchasePrice
    setStockCount(currentEditRow.value)
  }
  drawer.value = false
}

/** 加载库存 */
const setStockCount = async (row: any) => {
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
