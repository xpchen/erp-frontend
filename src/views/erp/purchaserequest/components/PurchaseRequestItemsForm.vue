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
      <el-table-column label="物料编码" min-width="150">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.materialNumber`" :rules="formRules.materialNumber" class="mb-0px!">
            <el-input v-model="row.materialNumber" placeholder="请输入物料编码" @click="openMaterialDrawer(row)"/>
            <el-drawer v-model="drawer" title="物料选择" :direction="direction" size="48%" :modal-append-to-body="true" :append-to-body="true">
                <QueryMaterialIndex :for-purchase-request="true" @select="handleMaterialSelect" />
            </el-drawer>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="物料名称" min-width="150">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.materialName`" class="mb-0px!">
            <el-input v-model="row.materialName" placeholder="" readonly/>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="规格" min-width="180">
        <template #default="{ row }">
          <el-form-item class="mb-0px!">
            <el-input v-model="row.materialStandard" placeholder="" readonly/>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="物料内码" min-width="150" v-if="false">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.materialId`"  class="mb-0px!">
            <el-input v-model="row.materialId" placeholder="请输入物料编码"/>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="单位" min-width="100">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.unitId`" :rules="formRules.unitId" class="mb-0px!">
            <el-select v-model="row.unitId" clearable placeholder="" class="w-1/1" disabled>
              <el-option v-for="[id, name] in materialUnitItem" :key="id" :value="id" :label="name" />
            </el-select>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="数量" min-width="100">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.qty`" :rules="formRules.qty" class="mb-0px!">
            <el-input type='number' v-model="row.qty" placeholder="请输入数量" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="单价(不含税)" min-width="120">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.price`"  class="mb-0px!">
            <el-input type='number' v-model="row.price" placeholder="" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="税率" min-width="100">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.tax`"  class="mb-0px!">
            <el-input type="number" v-model="row.tax" placeholder="" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="币种" min-width="150" v-if="false">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.currency`" class="mb-0px!">
            <el-input v-model="row.currency" placeholder="" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="金额合计" min-width="100">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.amount`"  class="mb-0px!">
            <el-input v-model="row.amount" placeholder=""  readonly/>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="价税合计" min-width="100">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.taxAmount`"  class="mb-0px!">
            <el-input v-model="row.taxAmount" placeholder=""  readonly/>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="需求日期" min-width="160">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.requireDate`"  class="mb-0px!">
            <el-date-picker
              v-model="row.requireDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder=""
              class="!w-1/1"
            />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="建议交货日期" min-width="160">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.advicePurchaseDate`"  class="mb-0px!">
            <el-date-picker
              v-model="row.advicePurchaseDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder=""
              class="!w-1/1"
            />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="主计划ID" min-width="150" v-if="false">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.planId`"  class="mb-0px!">
            <el-input v-model="row.planId" placeholder="" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="销售订单ID" min-width="150" v-if="false">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.saleOrderId`" class="mb-0px!">
            <el-input v-model="row.saleOrderId" placeholder="" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="销售订单明细ID" min-width="150" v-if="false">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.saleOrderItemId`" class="mb-0px!">
            <el-input v-model="row.saleOrderItemId" placeholder="" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="已采购数量" min-width="100">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.purchaseOrderQty`" class="mb-0px!">
            <el-input v-model="row.purchaseOrderQty" placeholder="" readonly/>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="备注" min-width="150">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.remark`"  class="mb-0px!">
            <el-input v-model="row.remark" placeholder="" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="状态" min-width="150" v-if="false">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.status`" class="mb-0px!">
            <el-radio-group v-model="row.status">
                <el-radio value="1">请选择字典生成</el-radio>
            </el-radio-group>
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
    <el-button @click="handleAdd" round>+ 添加采购申请单明细</el-button>
  </el-row>
</template>
<script setup lang="ts">
import { ref, reactive, watch, defineEmits } from 'vue'; 
import { PurchaseRequestApi } from '@/api/erp/purchaserequest'
import type { DrawerProps } from 'element-plus'
import { useBasicData } from '@/api/erp/basic/common'
import { MaterialDTO } from '@/api/erp/basic/material/info'
import QueryMaterialIndex  from '@/views/erp/basic/material/info/components/QueryMaterialIndex.vue'
import { erpPriceMultiply } from '@/utils'

const { materialUnitItem } = useBasicData()
const props = defineProps<{
  requestId: undefined 
}>()
const formLoading = ref(false) 
const direction = ref<DrawerProps['direction']>('rtl')
const formData = ref([])
const formRules = reactive({
  requestId: [{ required: true, message: '申请单ID不能为空', trigger: 'blur' }],
  materialNumber: [{ required: true, message: '物料编码不能为空', trigger: 'blur' }],
  unitId: [{ required: true, message: '单位不能为空', trigger: 'blur' }],
  qty: [{ required: true, message: '数量不能为空', trigger: 'blur' }],
})
const formRef = ref() 
const drawer = ref(false)
const currentEditRow = ref<any>(null)

// 在顶层调用 defineEmits
const emit = defineEmits(['items-changed']);

/** 监听主表的关联字段的变化，加载对应的子表数据 */
watch(
  () => props.requestId,
  async (val) => {
    formData.value = []
    if (!val) {
      return;
    }
    try {
      formLoading.value = true
      formData.value = await PurchaseRequestApi.getPurchaseRequestItemsListByRequestId(val)
    } finally {
      formLoading.value = false
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
      item.amount = erpPriceMultiply(item.price, item.qty)
      item.taxPrice = erpPriceMultiply(item.amount, item.tax / 100.0)
      if (item.amount != null) {
        item.taxAmount = item.amount + (item.taxPrice || 0)
      } else {
        item.taxAmount = undefined
      }
    })
    debugger;
    // 直接使用 emit 触发事件
    emit('items-changed', val);
  },
  { deep: true }
)

/** 新增按钮操作 */
const handleAdd = () => {
  const row = {
    id: undefined,
    requestId: undefined,
    materialId: undefined,
    materialName: undefined,
    materialStandard: undefined,
    materialNumber: undefined,
    unitId: undefined,
    qty: undefined,
    price: undefined,
    tax: undefined,
    currency: undefined,
    amount: undefined,
    taxAmount: undefined,
    requireDate: undefined,
    advicePurchaseDate: undefined,
    planId: undefined,
    saleOrderId: undefined,
    saleOrderItemId: undefined,
    purchaseOrderQty: undefined,
    remark: undefined,
    status: undefined,
  }
  row.requestId = props.requestId
  formData.value.push(row)
}

/** 删除按钮操作 */
const handleDelete = (index) => {
  formData.value.splice(index, 1)
}

const handleMaterialSelect = (material: MaterialDTO) => {
  if (currentEditRow.value) {
    currentEditRow.value.materialNumber = material.barCode // 设置物料编码
    currentEditRow.value.materialId = material.id // 设置物料内码
    currentEditRow.value.materialName = material.name // 设置物料名称
    currentEditRow.value.materialStandard = material.standard // 设置规格
    currentEditRow.value.unitId = material.unitId
    currentEditRow.value.price = material.purchasePrice
  }
  drawer.value = false  // 关闭抽屉
}

const openMaterialDrawer = (row: any) => {
  // if (props.disabled) return
  currentEditRow.value = row  // 保存当前编辑的行
  drawer.value = true        // 打开抽屉
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