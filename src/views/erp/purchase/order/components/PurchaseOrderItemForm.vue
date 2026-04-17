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
      <el-table-column label="默认供应商" min-width="200">
        <template #default="{ row }">
          <el-form-item class="mb-0px!">
            <el-select
              v-model="row.selectedSupplierId"
              clearable
              filterable
              :disabled="!row.materialId || (orderLevelAllowedSupplierIds.length === 0 && orderLevelSupplierOptions.length === 0)"
              :placeholder="
                !row.materialId
                  ? '请先选择物料'
                  : orderLevelAllowedSupplierIds.length === 0 && orderLevelSupplierOptions.length === 0
                    ? '请维护默认/备选供应商'
                    : '请选择供应商'
              "
              class="!w-180px"
              @change="handleRowSupplierChange"
            >
              <el-option
                v-for="option in orderLevelSupplierOptions"
                :key="option.id"
                :value="option.id"
                :label="option.name"
              />
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
      <el-table-column label="税率（%）" min-width="115">
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
      <el-table-column label="税额" prop="taxPrice" min-width="120">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.taxPrice`" class="mb-0px!">
            <el-form-item :prop="`${$index}.taxPrice`" class="mb-0px!">
              <el-input disabled v-model="row.taxPrice" :formatter="erpPriceInputFormatter" />
            </el-form-item>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="税额合计" prop="totalPrice" min-width="100">
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
import { MaterialApi, MaterialDTO } from '@/api/erp/basic/material/info'
import { MaterialSupplierApi } from '@/api/erp/basic/material/materialSupplier'
import { useBasicData } from '@/api/erp/basic/common'
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
    supplierId?: number
  }>(),
  { disabled: false, supplierId: undefined }
)
const emit = defineEmits<{
  (e: 'supplier-change', supplierId: number | undefined): void
}>()
const message = useMessage()
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
const { supplierItem } = useBasicData()

/** 已选物料行的「默认+备选」供应商交集，表头与各行共用同一可选范围 */
const orderLevelAllowedSupplierIds = computed(() => {
  const rows = (formData.value || []).filter((r: any) => r.materialId)
  if (!rows.length) return []
  let ids = new Set<number>(rows[0].allowedSupplierIds || [])
  for (let i = 1; i < rows.length; i++) {
    const next = new Set<number>(rows[i].allowedSupplierIds || [])
    ids = new Set([...ids].filter((id) => next.has(id)))
  }
  return Array.from(ids).sort((a, b) => a - b)
})

const orderLevelSupplierOptions = computed(() => {
  const allowed = orderLevelAllowedSupplierIds.value
  const opts = allowed.map((id) => ({
    id,
    name: supplierItem.value.get(id) ?? `供应商#${id}`
  }))
  if (
    props.disabled &&
    props.supplierId != null &&
    !allowed.includes(Number(props.supplierId))
  ) {
    const sid = Number(props.supplierId)
    opts.push({
      id: sid,
      name: supplierItem.value.get(sid) ?? `供应商#${sid}`
    })
  } else if (!props.disabled && props.supplierId != null) {
    const sid = Number(props.supplierId)
    if (allowed.length > 0 && !allowed.includes(sid)) {
      opts.push({
        id: sid,
        name: `${supplierItem.value.get(sid) ?? `供应商#${sid}`}（不在可选范围，请重选或维护主数据）`
      })
    } else if (allowed.length === 0) {
      opts.push({
        id: sid,
        name: `${supplierItem.value.get(sid) ?? `供应商#${sid}`}（物料未维护供应商，请维护主数据）`
      })
    }
  }
  return opts
})

/** 加载物料采购默认供应商、备选列表，并生成本行 allowedSupplierIds */
const loadMaterialSupplierContext = async (row: any) => {
  row.defaultSupplierName = ''
  row.defaultSupplierId = undefined
  row.allowedSupplierIds = []
  if (!row?.materialId) {
    return
  }
  try {
    let info: { supplierId?: number | string } | null = null
    try {
      info = await MaterialApi.getPurchaseInfo(row.materialId)
    } catch {
      info = null
    }
    let alternateIds: number[] = []
    try {
      const list = await MaterialSupplierApi.list(row.materialId)
      alternateIds = Array.isArray(list) ? list.map((id) => Number(id)) : []
    } catch {
      alternateIds = []
    }
    const idSet = new Set<number>()
    const sid = info?.supplierId
    if (sid != null && sid !== '') {
      const n = Number(sid)
      row.defaultSupplierId = n
      row.defaultSupplierName = supplierItem.value.get(n) ?? `供应商#${n}`
      idSet.add(n)
    }
    alternateIds.forEach((id) => {
      if (Number.isFinite(id)) idSet.add(id)
    })
    row.allowedSupplierIds = Array.from(idSet)
  } catch {
    row.allowedSupplierIds = []
  }
}

/** 交集变化后，与表头供应商对齐；新建时自动推荐默认供应商 */
const syncSupplierWithOrderContext = () => {
  const allowed = orderLevelAllowedSupplierIds.value
  const headerId = props.supplierId != null ? Number(props.supplierId) : undefined
  if (allowed.length === 0) {
    formData.value.forEach((r: any) => {
      r.selectedSupplierId = headerId
    })
    return
  }
  if (headerId != null && allowed.includes(headerId)) {
    formData.value.forEach((r: any) => {
      r.selectedSupplierId = headerId
    })
    return
  }
  if (headerId != null && !allowed.includes(headerId)) {
    formData.value.forEach((r: any) => {
      r.selectedSupplierId = headerId
    })
    return
  }
  const prefer = formData.value.find(
    (r: any) => r.materialId && r.defaultSupplierId && allowed.includes(Number(r.defaultSupplierId))
  )
  const pick = prefer
    ? Number(prefer.defaultSupplierId)
    : allowed[0]
  formData.value.forEach((r: any) => {
    r.selectedSupplierId = pick
  })
  emit('supplier-change', pick)
}

/** 初始化设置入库项 */
watch(
  () => props.items,
  async (val) => {
    formData.value = val
    if (val) {
      for (const row of val) {
        await setStockCount(row)
        if (row.materialId) await loadMaterialSupplierContext(row)
      }
      syncSupplierWithOrderContext()
    }
  },
  { immediate: true }
)

/** 供应商字典晚到时，刷新已选行的供应商上下文 */
watch(
  () => supplierItem.value?.size,
  async () => {
    if (!formData.value?.length) return
    for (const row of formData.value) {
      if (row.materialId) await loadMaterialSupplierContext(row)
    }
    syncSupplierWithOrderContext()
  }
)

watch(
  () => props.supplierId,
  (supplierId) => {
    if (!formData.value?.length) return
    const allowed = orderLevelAllowedSupplierIds.value
    if (supplierId == null || supplierId === undefined) {
      formData.value.forEach((r: any) => {
        r.selectedSupplierId = undefined
      })
      return
    }
    const n = Number(supplierId)
    if (allowed.length && allowed.includes(n)) {
      formData.value.forEach((r: any) => {
        r.selectedSupplierId = n
      })
    }
  }
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
      item.taxPrice = erpPriceMultiply(item.totalMaterialPrice, (item.taxPercent ?? 0) / 100.0)
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
    defaultSupplierName: undefined,
    defaultSupplierId: undefined,
    allowedSupplierIds: [],
    selectedSupplierId: props.supplierId,
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
  nextTick(() => syncSupplierWithOrderContext())
}

/** 行内选择供应商后，回填到表头并统一全行 */
const handleRowSupplierChange = (supplierId?: number | null) => {
  if (supplierId == null || supplierId === undefined) {
    formData.value.forEach((r: any) => {
      r.selectedSupplierId = undefined
    })
    emit('supplier-change', undefined)
    return
  }
  const normalized = Number(supplierId)
  if (!orderLevelAllowedSupplierIds.value.includes(normalized)) return
  formData.value.forEach((r: any) => {
    r.selectedSupplierId = normalized
  })
  emit('supplier-change', normalized)
}

/** 打开物料选择抽屉 */
const openMaterialDrawer = (row: any) => {
  currentEditRow.value = row
  drawer.value = true
}

/** 处理物料选择（从抽屉选择后回填） */
const handleMaterialSelect = async (material: MaterialDTO) => {
  if (currentEditRow.value) {
    const row = currentEditRow.value
    row.materialId = material.id
    row.materialName = material.name
    row.materialStandard = material.standard
    row.materialBarCode = material.barCode
    row.materialUnitName = material.unitName
    row.materialPrice = material.purchasePrice
    await setStockCount(row)
    await loadMaterialSupplierContext(row)
    if (!row.allowedSupplierIds?.length) {
      message.warning(
        '该物料未维护默认或备选供应商，请先到「物料信息 - 采购属性」中维护后再选择供应商。'
      )
    }
    syncSupplierWithOrderContext()
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
const refreshDefaultSupplierNames = async () => {
  if (!formData.value?.length) return
  for (const row of formData.value) {
    if (row.materialId) await loadMaterialSupplierContext(row)
  }
  syncSupplierWithOrderContext()
}
defineExpose({ validate, refreshDefaultSupplierNames })

/** 初始化 */
onMounted(async () => {
  // 默认添加一个
  if (formData.value.length === 0) {
    handleAdd()
  }

  for (const row of formData.value) {
    await setStockCount(row)
    if (row.materialId) await loadMaterialSupplierContext(row)
  }
  syncSupplierWithOrderContext()
})
</script>
