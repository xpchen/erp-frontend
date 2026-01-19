<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="工序编码" prop="codeNo">
        <el-input v-model="formData.codeNo" placeholder="请输入工序编码" />
      </el-form-item>
      <el-form-item label="工序名称" prop="processName">
        <el-input v-model="formData.processName" placeholder="请输入工序名称" />
      </el-form-item>
      <el-form-item label="工作中心" prop="workCenter"  class="mb-0px!">
          <el-tree-select
            v-model="formData.workCenter"
            :data="deptList"
            :props="defaultProps"
            check-strictly 
            clearable 
            filterable
            node-key="id"
          />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio
            v-for="dict in getIntDictOptions(DICT_TYPE.SYSTEM_STATUS_OK_NG)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input v-model="formData.description"  placeholder="请输入描述"  />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { ProduceProcessApi, ProduceProcessVO } from '@/api/erp/produce/process'
import * as DeptApi from '@/api/system/dept'
import { defaultProps, handleTree } from '@/utils/tree'

/** 工艺工序 表单 */
defineOptions({ name: 'ProduceProcessForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const deptList = ref<Tree[]>([]) // 树形结构

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  codeNo: undefined,
  processName: undefined,
  workCenter: undefined,
  status: 1,
  description: undefined,
})
const formRules = reactive({
  codeNo: [{ required: true, message: '工序编码不能为空', trigger: 'blur' }],
  processName: [{ required: true, message: '工序名称不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'blur' }],
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  deptList.value = handleTree(await DeptApi.getSimpleDeptList())
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await ProduceProcessApi.getProduceProcess(id)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as ProduceProcessVO
    if (formType.value === 'create') {
      await ProduceProcessApi.createProduceProcess(data)
      message.success(t('common.createSuccess'))
    } else {
      await ProduceProcessApi.updateProduceProcess(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    codeNo: undefined,
    processName: undefined,
    workCenter: undefined,
    status: 1,
    description: undefined,
  }
  formRef.value?.resetFields()
}
</script>