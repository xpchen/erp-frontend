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
            <el-select v-model="row.materialId" clearable filterable placeholder="请选择物料" class="!w-300px" @change="onChangeMaterial($event, row)">
              <el-option
                v-for="m in materialInfoArray"
                :key="m.id"
                :value="m.id"
                :label="m.name || ''"
              >
                <span>{{ m.name || '-' }}</span>
                <span class="ml-2 text-gray-500">{{ m.standard || '-' }}</span>
              </el-option>
            </el-select>
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
      <el-table-column label="编码" min-width="150">
        <template #default="{ row }">
          <el-form-item class="mb-0px!">
            <el-input disabled v-model="row.materialBarCode" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="单位" min-width="90">
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
              class="!w-100%"
            />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="申请数量" prop="applyCount" min-width="140">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.applyCount`" class="mb-0px!">
            <el-input-number
              v-model="row.applyCount"
              controls-position="right"
              class="!w-100%"
              disabled
            />
          </el-form-item>
        </template>
      </el-table-column>
      <!-- 新增源单单号列 -->
      <el-table-column label="源单单号" min-width="150">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.sourceBillNo`" :rules="formRules.sourceBillNo" class="mb-0px!">
            <el-input v-model="row.sourceBillNo" placeholder="请输入源单单号" />
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
      <!-- 新增隐藏的 backFlushFalg 列 -->
      <el-table-column label="倒冲标志" min-width="100" style="display: none;">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.backFlushFalg`" :rules="formRules.backFlushFalg" class="mb-0px!">
            <el-input v-model="row.backFlushFalg" type="hidden" />
          </el-form-item>
        </template>
      </el-table-column>
    </el-table>
  </el-form>
  <el-row justify="center" class="mt-3" v-if="!disabled">
    <el-button @click="handleAdd" round>+ 添加出库物料</el-button>
  </el-row>
</template>
<script setup lang="ts">
import { StockApi } from '@/api/erp/stock/stock'
import { useBasicData } from '@/api/erp/basic/common'
const { warehouseItem, materialInfoArray } = useBasicData()

import {
  erpCountInputFormatter,
  erpPriceInputFormatter,
  erpPriceMultiply,
  getSumValue
} from '@/utils'

const props = defineProps<{
  items: any[]
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

/** 新增按钮操作 */
const handleAdd = () => {
  const row = {
    id: undefined,
    warehouseId: undefined,
    materialId: undefined,
    materialStandard: undefined,
    materialUnitName: undefined,
    materialBarCode: undefined,
    materialPrice: undefined,
    stockCount: undefined,
    count: 0,
    applyCount: 0,
    totalPrice: undefined,
    remark: undefined,
    // 新增源单相关字段
    sourceBillId: undefined,
    sourceBillItemId: undefined,
    sourceBillNo: undefined,
    backFlushFalg: 0
  }
  formData.value.push(row)
}
const formRef = ref([]) // 表单 Ref

onMounted(() => {})


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

// watch(defaultWarehouseId, (value) => {
//   if (value && formData.value.length === 0) {
//     handleAdd()
//   }
// }, { immediate: true })

let unwatch: () => void;

// 初始化设置出库项
unwatch = watch(
  () => props.items,
  async (val) => {
    if (val) {
      formData.value = val
      // 每项的仓库设置成默认仓库defaultWarehouseId.value
      formData.value.forEach((item) => {
        // item.warehouseId = defaultWarehouseId.value
        // 调用onChangeMaterial处理物料
        onChangeMaterial(item.materialId, item);
      })
    }
    // 首次执行后停止监听
    // unwatch();
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

</script>

