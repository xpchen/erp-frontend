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
       
      <el-table-column label="工序ID" v-if="false">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.processId`"  class="mb-0px!">
            <el-input v-model="row.processId" placeholder="请输入工序ID" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="工序编码" min-width="150">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.processCodeNo`" :rules="formRules.processCodeNo" class="mb-0px!">
            <el-input v-model="row.processCodeNo" placeholder="请输入工序编码" @click="openProcessDrawer(row)"/>
          </el-form-item>
          <el-drawer v-model="drawer" title="物料选择" :direction="direction" size="48%" :modal-append-to-body="true" :append-to-body="true">
            <QueryProcessIndex @select="handleProcessSelect" />
          </el-drawer>
        </template>
      </el-table-column>
      <el-table-column label="工序名称" min-width="150">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.processName`" class="mb-0px!">
            <el-input v-model="row.processName" placeholder="请输入工序编码" readonly/>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="顺序" min-width="100">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.sequenceNumber`" :rules="formRules.sequenceNumber" class="mb-0px!">
            <el-input v-model="row.sequenceNumber" placeholder="请输入顺序" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="末道工序" min-width="80" >
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.finalProcess`" class="mb-0px!">
            <el-switch
              v-model="row.finalProcess"
            />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="工作中心" min-width="150">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.workCenter`"  class="mb-0px!">
            <el-tree-select
              v-model="row.workCenter"
              :data="deptList"
              :props="defaultProps"
              check-strictly 
              clearable 
              filterable
              node-key="id"
            />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="前置期" min-width="150">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.leadDay`"  class="mb-0px!">
            <el-input-number
              v-model="row.leadDay"
              placeholder="请输入前置期"
              :min="0" 
              @change="onInputChange"
            />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="工价" min-width="150">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.processPrice`"  class="mb-0px!">
            <el-input v-model="row.processPrice" placeholder="请输入工价" @change="onInputChange"/>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="状态" min-width="150">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.status`" class="mb-0px!">
            <el-select v-model="row.status" clearable>
              <el-option
                v-for="status in statusList"
                :key="status.id"
                :label="status.name"
                :value="status.id"
              />
            </el-select>
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
    <el-button @click="handleAdd" round>+ 添加工艺路线明细</el-button>
  </el-row>
</template>
<script setup lang="ts">
import { ProduceRoutingApi } from '@/api/erp/produce/producerouting'
import QueryProcessIndex from '@/views/erp/produce/process/components/QueryProcessIndex.vue'
import type { DrawerProps } from 'element-plus'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { ProduceProcessVO } from '@/api/erp/produce/process'
import { defaultProps, handleTree } from '@/utils/tree'
import * as DeptApi from '@/api/system/dept'

const deptList = ref<Tree[]>([]) // 树形结构
const direction = ref<DrawerProps['direction']>('rtl')
const props = defineProps<{
  routingId: undefined // 工艺路线ID（主表的关联字段）
}>()
const formLoading = ref(false) // 表单的加载中
const formData = ref([])
const formRules = reactive({
  routingId: [{ required: true, message: '工艺路线ID不能为空', trigger: 'blur' }],
  processCodeNo: [{ required: true, message: '工序编码不能为空', trigger: 'blur' }],
  sequenceNumber: [{ required: true, message: '顺序不能为空', trigger: 'blur' }],
})
const formRef = ref() // 表单 Ref


const drawer = ref(false)
const currentEditRow = ref<any>(null)
const statusList = ref([
  { id: 1, name: '有效' },
  { id: 0, name: '无效' },
])
const openProcessDrawer = (row: any) => {
  // if (props.disabled) return
  currentEditRow.value = row  // 保存当前编辑的行
  drawer.value = true        // 打开抽屉
}

/** 处理物料选择 */
const handleProcessSelect = (process: ProduceProcessVO) => {
  if (currentEditRow.value) {
    // 更新当前行的物料信息
    currentEditRow.value.processId = process.id
    currentEditRow.value.processName = process.processName
    currentEditRow.value.processCodeNo = process.codeNo
    currentEditRow.value.workCenter = process.workCenter
  }
  drawer.value = false  // 关闭抽屉
}

/** 监听主表的关联字段的变化，加载对应的子表数据 */
watch(
  () => props.routingId,
  async (val) => {
    // 1. 重置表单
    formData.value = []
    // 2. val 非空，则加载数据
    if (!val) {
      return;
    }
    try {
      formLoading.value = true
      formData.value = await ProduceRoutingApi.getProduceRoutingDetailListByRoutingId(val)
      debugger
      console.log(formData.value)
    } finally {
      formLoading.value = false
    }
  },
  { immediate: true }
)

const emit = defineEmits(['input-change']);
const onInputChange = () => {
  emit('input-change');
};

onMounted(async () => {
    // 加载部门树
    deptList.value = handleTree(await DeptApi.getSimpleDeptList())
  })

/** 新增按钮操作 */
const handleAdd = () => {
  const row = {
    id: undefined,
    routingId: undefined,
    processId: undefined,
    sequenceNumber: undefined,
    workCenter: undefined,
    leadDay: undefined,
    processPrice: undefined,
    status: 1,
  }
  row.routingId = props.routingId
  formData.value.push(row)
}

/** 删除按钮操作 */
const handleDelete = (index) => {
  formData.value.splice(index, 1)
  emit('input-change')
}

/** 表单校验 */
const validate = () => {
  const hasFinalProcess = formData.value.some(row => row.finalProcess);
  if (!hasFinalProcess) {
    ElMessage.error('必须有一条记录标记为末道工序');
    return false;
  }
  return formRef.value.validate()
}

/** 表单值 */
const getData = () => {
  return formData.value
}

defineExpose({ validate, getData })
</script>