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
    <el-table
      :data="formData"
      show-summary
      :summary-method="getSummaries"
      class="-mt-10px"
      :show-overflow-tooltip="true"
    >
      <el-table-column label="序号" type="index" align="center" width="60" />
      <el-table-column label="仓库名称" min-width="125">
        <template #default="{ row, $index }">
          <el-form-item
            :prop="`${$index}.warehouseId`"
            :rules="formRules.warehouseId"
            class="mb-0px!"
          >
            <el-select v-model="row.warehouseId"  clearable filterable placeholder="请选择仓库" class="!w-220px" @change="onChangeWarehouse($event, row)">
              <el-option v-for="[id, name] in warehouseItem" :key="id" :value="id" :label="name" />
            </el-select>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="物料名称" min-width="240" show-overflow-tooltip>
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.materialId`" :rules="formRules.materialId" class="mb-0px!">
            <el-input
              v-model="row.materialName"
              readonly
              placeholder="点击选择物料"
              class="!w-300px"
              @click="openMaterialDrawer(row)"
            />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="规格" min-width="200" show-overflow-tooltip>
        <template #default="{ row }">
          <el-form-item class="mb-0px!">
            <el-input v-model="row.materialStandard" placeholder="" readonly disabled class="!w-full" />
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
      <el-table-column label="条码" min-width="150">
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
      <el-table-column label="数量" prop="count" fixed="right" min-width="140">
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
      <el-table-column label="物料单价" fixed="right" min-width="120" v-if="checkPermi(['erp:amount:view'])">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.materialPrice`" class="mb-0px!">
            <el-input-number
              v-model="row.materialPrice"
              controls-position="right"
              :min="0.01"
              :precision="2"
              class="!w-100%"
            />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="合计金额" prop="totalPrice" fixed="right" min-width="100" v-if="checkPermi(['erp:amount:view'])">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.totalPrice`" class="mb-0px!">
            <el-input disabled v-model="row.totalPrice" :formatter="erpPriceInputFormatter" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="备注" min-width="150">
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
    <el-button @click="handleAdd" round>+ 添加出库物料</el-button>
  </el-row>
  <el-drawer
    v-model="materialDrawerVisible"
    title="物料选择"
    :direction="materialDrawerDirection"
    size="48%"
    :modal-append-to-body="true"
    :append-to-body="true"
  >
    <QueryMaterialIndex @select="handleMaterialSelect" />
  </el-drawer>
</template>
<script setup lang="ts">
import { checkPermi } from "@/utils/permission"
import { StockApi } from '@/api/erp/stock/stock'
import { useBasicData } from '@/api/erp/basic/common'
const { warehouseItem, materialInfoArray, defaultWarehouseId } = useBasicData()
import type { DrawerProps } from 'element-plus'
import QueryMaterialIndex from '@/views/erp/basic/material/info/components/QueryMaterialIndex.vue'
import { MaterialDTO } from '@/api/erp/basic/material/info'

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
  inId: [{ required: true, message: '出库编号不能为空', trigger: 'blur' }],
  warehouseId: [{ required: true, message: '仓库不能为空', trigger: 'blur' }],
  materialId: [{ required: true, message: '物料不能为空', trigger: 'blur' }],
  count: [{ required: true, message: '物料数量不能为空', trigger: 'blur' }]
})
const formRef = ref([]) // 表单 Ref
const materialDrawerVisible = ref(false)
const materialDrawerDirection = ref<DrawerProps['direction']>('rtl')
const currentEditRow = ref<any>(null)

/** 初始化设置出库项 */
watch(
  () => props.items,
  async (val) => {
    formData.value = val
    formData.value?.forEach((item) => {
      if (!item.materialStandard && item.materialSpec) {
        item.materialStandard = item.materialSpec
      }
    })
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
      item.totalPrice = erpPriceMultiply(item.materialPrice, item.count)
    })
  },
  { deep: true }
)

/** 合计 */
const getSummaries = (param: SummaryMethodProps) => {
  const { columns, data } = param
  const sums: string[] = []
  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = '合计'
      return
    }
    if (['count', 'totalPrice'].includes(column.property)) {
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
    warehouseId: defaultWarehouseId.value,
    materialId: undefined,
    materialStandard: undefined,
    materialUnitName: undefined,
    materialBarCode: undefined,
    materialPrice: undefined,
    stockCount: undefined,
    count: 1,
    totalPrice: undefined,
    remark: undefined
  }
  formData.value.push(row)
}

/** 删除按钮操作 */
const handleDelete = (index) => {
  formData.value.splice(index, 1)
}

/** 处理仓库变更 */
const onChangeWarehouse = (warehouseId, row) => {
  // 加载库存
  setStockCount(row)
}

/** 处理物料变更 */
const onChangeMaterial = (materialId, row) => {
  const material = materialInfoArray.value.find((item) => item.id === materialId)
  if (material) {
    row.materialName = material.name ?? row.materialName
    row.materialStandard =
      material.standard ?? row.materialSpec ?? row.materialStandard ?? ''
    row.materialUnitName = material.unitName
    row.materialBarCode = material.barCode
    row.materialPrice = material.minPrice
  }
  setStockCount(row)
}

/** 打开物料选择抽屉 */
const openMaterialDrawer = (row) => {
  if (props.disabled) return
  currentEditRow.value = row
  materialDrawerVisible.value = true
}

/** 选择物料后回填当前行 */
const handleMaterialSelect = (material: MaterialDTO) => {
  if (!currentEditRow.value) return
  const row = currentEditRow.value
  row.materialId = material.id
  row.materialName = material.name
  row.materialStandard = material.standard ?? ''
  row.materialUnitName = material.unitName
  row.materialBarCode = material.barCode
  row.materialPrice = material.minPrice
  setStockCount(row)
  materialDrawerVisible.value = false
}

/** 加载库存 */
const setStockCount = async (row) => {
  if (!row.materialId || !row.warehouseId) {
    return
  }
  const stock = await StockApi.getStock2(row.materialId, row.warehouseId)
  row.stockCount = stock ? stock.count : 0
}

/** 表单校验 */
const validate = () => {
  return formRef.value.validate()
}
defineExpose({ validate })

watch(defaultWarehouseId, (value) => {
  if (value && formData.value.length === 0) {
    handleAdd()
  }
}, { immediate: true })
</script>
