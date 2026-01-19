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
      <el-table-column label="物料" min-width="180" align="center">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.materialId`" :rules="formRules.materialId" class="mb-0px!">
            <el-input v-model="row.materialName"  placeholder="点击选择物料" readonly @click="openMaterialDrawer(row)"/>
          </el-form-item>
          <el-drawer v-model="drawer" title="物料选择" :direction="direction" size="60%" :modal-append-to-body="true" :append-to-body="true">
            <QueryMaterialIndex @select="handleMaterialSelect" />
          </el-drawer>
        </template>
      </el-table-column>
      <el-table-column label="库存" min-width="100">
        <template #default="{ row }">
          <el-form-item class="mb-0px!">
            <el-input disabled v-model="row.stockCount" :formatter="erpCountInputFormatter" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="条码" min-width="150" align="center">
        <template #default="{ row }">
          <el-form-item class="mb-0px!">
            <el-input disabled v-model="row.materialBarCode" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="单位" min-width="80" align="center">
        <template #default="{ row }">
          <el-form-item class="mb-0px!">
            <el-input disabled v-model="row.materialUnitName" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="数量" prop="count"  min-width="140" align="center">
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
      <el-table-column label="交货日期" prop="deliveryDate"  min-width="150" align="center">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.deliveryDate`" :rules="formRules.deliveryDate" class="mb-0px!">
            <el-date-picker
              v-model="row.deliveryDate"
              type="date"
              value-format="x"
              placeholder="选择交货日期"
              class="!w-1/1"
            />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="单价"  min-width="120" align="center">
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
      <el-table-column label="金额" prop="totalMaterialPrice"  min-width="100" align="center">
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
      <el-table-column label="税率（%）"  min-width="115" align="center">
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
      <el-table-column label="税额" prop="taxPrice"  min-width="120" align="center">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.taxPrice`" class="mb-0px!">
            <el-form-item :prop="`${$index}.taxPrice`" class="mb-0px!">
              <el-input disabled v-model="row.taxPrice" :formatter="erpPriceInputFormatter" />
            </el-form-item>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="税额合计" prop="totalPrice"  min-width="100" align="center">
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
    <el-button @click="handleAdd" round>+ 添加销售物料</el-button>
  </el-row>
  
</template>
<script setup lang="ts">
import { MaterialDTO } from '@/api/erp/basic/material/info'
import { StockApi } from '@/api/erp/stock/stock'
import QueryMaterialIndex  from '@/views/erp/basic/material/info/components/QueryMaterialIndex.vue'
import type { DrawerProps } from 'element-plus'
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
  deliveryDate: [{ required: true, message: '交货日期不能为空', trigger: 'blur' }]
})
const formRef = ref([]) // 表单 Ref

/** 物料选择弹窗 */
const drawer = ref(false)
const currentEditRow = ref<any>(null)
const direction = ref<DrawerProps['direction']>('rtl')
const openMaterialDrawer = (row: any) => {
  if (props.disabled) return
  currentEditRow.value = row  // 保存当前编辑的行
  drawer.value = true        // 打开抽屉
}
/** 处理物料选择 */
const handleMaterialSelect = (material: MaterialDTO) => {
  if (currentEditRow.value) {
    // 更新当前行的物料信息
    currentEditRow.value.materialId = material.id
    currentEditRow.value.materialName = material.name
    currentEditRow.value.materialUnitId = material.unitId
    currentEditRow.value.materialUnitName = material.unitName
    currentEditRow.value.materialBarCode = material.barCode
    currentEditRow.value.materialPrice = material.salePrice
    
    debugger;
    // 加载库存
    setStockCount(currentEditRow.value)
  }
  drawer.value = false  // 关闭抽屉
}


/** 初始化设置出库项 */
watch(
  () => props.items,
  async (val) => {
    formData.value = val
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
        item.totalPrice = undefined
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
    materialName: undefined, // 物料名称
    materialUnitId: undefined, // 物料单位
    materialUnitName: undefined, // 物料单位名称
    materialBarCode: undefined, // 物料条码
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
// const onChangeMaterial = (materialId, row) => {
//   const material = materialList.value.find((item) => item.id === materialId)
//   if (material) {
//     row.materialUnitName = material.unitName
//     row.materialBarCode = material.barCode
//     row.materialPrice = material.salePrice
//   }
//   // 加载库存
//   setStockCount(row)
// }

/** 加载库存 */
const setStockCount = async (row: any) => {
  if (!row.materialId) {
    return
  }
  const count = await StockApi.getStockCount(null, row.materialId)
  row.stockCount = count || 0
}

/** 表单校验 */
const validate = () => {
  return formRef.value.validate()
}
defineExpose({ validate })

/** 初始化 */
onMounted(async () => {
  // materialList.value = await MaterialApi.getMaterialSimpleList()
  // 默认添加一个
  if (formData.value.length === 0) {
    handleAdd()
  }
})
</script>
