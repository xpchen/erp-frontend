<template>
  <el-form
    ref="formRef"
    :model="formData"
    label-width="0px"
  >
    <el-table :data="formData" class="-mt-10px">
      <el-table-column label="序号" type="index" width="100" />
      <el-table-column label="生产入库单明细ID" min-width="150">
        <template #default="{ row }">
          <span>{{ row.produceInItemId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="处理数量" min-width="150">
        <template #default="{ row }">
          <span>{{ row.qty }}</span>
        </template>
      </el-table-column>
      <el-table-column label="处理结果" min-width="150">
        <template #default="{ row }">
          <span>{{ row.result }}</span>
        </template>
      </el-table-column>
      <el-table-column label="处理结果代码" min-width="150">
        <template #default="{ row }">
          <span>{{ row.resultCode }}</span>
        </template>
      </el-table-column>
      <el-table-column label="生产入库单单号" min-width="150">
        <template #default="{ row }">
          <span>{{ row.produceInNo }}</span>
        </template>
      </el-table-column>
      <el-table-column label="物料ID" min-width="150">
        <template #default="{ row }">
          <span>{{ row.materialId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="物料编码" min-width="150">
        <template #default="{ row }">
          <span>{{ row.materialNo }}</span>
        </template>
      </el-table-column>
    </el-table>
  </el-form>
</template>
<script setup lang="ts">
import { ProduceInEventApi } from '@/api/erp/stock/produceinevent'
import { ref, watch } from 'vue'

const props = defineProps<{
  parentId: undefined // 父ID（主表的关联字段）
}>()
const formLoading = ref(false) // 表单的加载中
const formData = ref([])
const formRef = ref() // 表单 Ref

/** 监听主表的关联字段的变化，加载对应的子表数据 */
watch(
  () => props.parentId,
  async (val) => {
    // 1. 重置表单
    formData.value = []
    // 2. val 非空，则加载数据
    if (!val) {
      return;
    }
    try {
      formLoading.value = true
      formData.value = await ProduceInEventApi.getProduceInEventItemsListByParentId(val)
    } finally {
      formLoading.value = false
    }
  },
  { immediate: true }
)


/** 表单校验（因改为展示，可删除该方法） */
// const validate = () => {
//   return formRef.value.validate()
// }

/** 表单值 */
const getData = () => {
  return formData.value
}

defineExpose({ getData })
</script>