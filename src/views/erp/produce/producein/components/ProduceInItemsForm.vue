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
      <el-table-column label="序号" type="index" width="100" />
      <el-table-column label="物料编码" min-width="150">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.materialNumber`" :rules="formRules.materialNumber" class="mb-0px!">
            <!-- 根据 isReadOnly 控制输入框只读状态和 click 事件 -->
            <el-input 
              v-model="row.materialNumber" 
              placeholder="请输入物料编码" 
              :readonly="row.isReadOnly"
              @click="!row.isReadOnly && openMaterialDrawer(row)"
            />
            <el-drawer v-model="drawer" title="物料选择" :direction="direction" size="48%" :modal-append-to-body="true" :append-to-body="true">
              <QueryMaterialIndex @select="handleMaterialSelect" />
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
            <el-input v-model="row.unitId" placeholder="" readonly/>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="入库数量" min-width="150">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.qty`" :rules="formRules.qty" class="mb-0px!">
            <el-input type="number" v-model="row.qty" placeholder="" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="最终确认数量" min-width="150">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.finalQty`" class="mb-0px!">
            <el-input type="number" v-model="row.finalQty" placeholder="" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="仓库名称" min-width="125">
        <template #default="{ row, $index }">
          <el-form-item
            :prop="`${$index}.warehouseId`"
            :rules="formRules.warehouseId"
            class="mb-0px!"
          >
            <el-select v-model="row.warehouseId"  clearable filterable placeholder="请选择仓库" class="!w-220px">
              <el-option v-for="[id, name] in warehouseItem" :key="id" :value="id" :label="name" />
            </el-select>
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
  <el-row justify="center" class="mt-3" v-if="!disabled && addBthVisible">
    <el-button @click="handleAdd" round>+ 添加生产入库明细</el-button>
  </el-row>
</template>
<script setup lang="ts">
import { ProduceInApi } from '@/api/erp/produce/producein'
import type { DrawerProps } from 'element-plus'
import { useBasicData } from '@/api/erp/basic/common'
import QueryMaterialIndex  from '@/views/erp/basic/material/info/components/QueryMaterialIndex.vue'
import { MaterialDTO } from '@/api/erp/basic/material/info'

const { materialUnitItem } = useBasicData()
const { warehouseItem } = useBasicData()
const props = defineProps<{
  items: []
  produceInId: undefined // 生产入库ID（主表的关联字段）
  disabled: false
  addBthVisible: true
}>()
const formLoading = ref(false) // 表单的加载中
const formData = ref([])
const formRules = reactive({
  // produceInId: [{ required: true, message: '入库单号不能为空', trigger: 'blur' }],
  qty: [{ required: true, message: '入库数量不能为空', trigger: 'blur' }],
  warehouseId: [{ required: true, message: '仓库不能为空', trigger: 'blur' }],
  materialNumber: [{ required: true, message: '物料编码不能为空', trigger: 'blur' }],
  unitId: [{ required: true, message: '单位不能为空', trigger: 'blur' }],
  
})
const formRef = ref() // 表单 Ref

const direction = ref<DrawerProps['direction']>('rtl')
const drawer = ref(false)
const currentEditRow = ref<any>(null)


/** 监听主表的关联字段的变化，加载对应的子表数据 */
watch(
  [() => props.produceInId, () => props.items],
  async ([newProduceInId, newItems]) => {
    // 1. 重置表单
    formData.value = newItems
    // 2. val 非空，则加载数据
    if (!newProduceInId) {
      return;
    }
    try {
      formLoading.value = true
      formData.value = await ProduceInApi.getProduceInItemsListByProduceInId(newProduceInId)
      // 遍历列表，根据 sourceBillId 设置只读标志
      formData.value.forEach(item => {
        item.isReadOnly = !!item.sourceBillId;
      });
      
    } finally {
      formLoading.value = false
    }
  },
  { immediate: true }
)



const openMaterialDrawer = (row: any) => {
  if (props.disabled) return
  currentEditRow.value = row  // 保存当前编辑的行
  drawer.value = true        // 打开抽屉
}

const handleMaterialSelect = (material: MaterialDTO) => {
  debugger;
  if (currentEditRow.value) {
    currentEditRow.value.materialNumber = material.barCode // 设置物料编码
    currentEditRow.value.materialId = material.id // 设置物料内码
    currentEditRow.value.materialName = material.name // 设置物料名称
    currentEditRow.value.unitId = material.unitName
    currentEditRow.value.price = material.purchasePrice
  }
  drawer.value = false  // 关闭抽屉
}

/** 新增按钮操作 */
const handleAdd = () => {
  const row = {
    id: undefined,
    produceInId: undefined,
    materialId: undefined,
    qty: undefined,
    unitId: undefined,
    finalQty: undefined,
    sourceBillId: undefined,
    sourceBillNo: undefined,
    sourceBillItemId: undefined,
    warehouseId: undefined,
    remark: undefined,
  }
  row.produceInId = props.produceInId
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