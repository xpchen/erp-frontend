<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="80%">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <!-- 使用 el-row 和 el-col 进行 2 列布局 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="生产入库单ID">
            <!-- 替换为 el-input 并设置 readonly -->
            <span>{{ formData.produceInId }}</span>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="生产入库单号">
            <!-- 替换为 el-input 并设置 readonly -->
            <span>{{ formData.produceInNo }}</span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="入库类型">
            <!-- 替换为 el-input 并设置 readonly -->
            <dict-tag :type="DICT_TYPE.ERP_AUDIT_STATUS" :value="formData.inType" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态">
            <!-- 保持 dict-tag 组件，可根据需求添加 readonly 样式 -->
            <dict-tag :type="DICT_TYPE.ERP_PRODUCE_IN_BACKFLUSH_STATUS" :value="formData.status" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-form-item label="异常信息">
            <!-- 替换为 el-input 并设置 readonly -->
            <span>{{ formData.remark }}</span>
          </el-form-item>
      </el-row>
    </el-form>
    <!-- 子表的表单 -->
    <el-tabs v-model="subTabsName">
      <el-tab-pane label="生产入库事务明细" name="produceInEventItems">
        <!-- 假设子表单组件支持 readonly 模式 -->
        <ProduceInEventItemsForm ref="produceInEventItemsFormRef" :parent-id="formData.id" :readonly="true" />
      </el-tab-pane>
    </el-tabs>
    <template #footer>
      <!-- 隐藏确定按钮 -->
      <!-- <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button> -->
      <el-button @click="dialogVisible = false">关 闭</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { DICT_TYPE } from '@/utils/dict'
import { ProduceInEventApi, ProduceInEventVO } from '@/api/erp/stock/produceinevent'
import ProduceInEventItemsForm from './components/ProduceInEventItemsForm.vue'

/** 生产入库事务 表单 */
defineOptions({ name: 'ProduceInEventForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  produceInId: undefined,
  inType: undefined,
  status: 0,
  produceInNo: undefined,
  remark: undefined
})
const formRules = reactive({
})
const formRef = ref() // 表单 Ref

/** 子表的表单 */
const subTabsName = ref('produceInEventItems')
const produceInEventItemsFormRef = ref()

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await ProduceInEventApi.getProduceInEvent(id)
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
  // 校验子表单
  try {
    await produceInEventItemsFormRef.value.validate()
  } catch (e) {
    subTabsName.value = 'produceInEventItems'
    return
  }
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as ProduceInEventVO
    // 拼接子表的数据
    data.produceInEventItemss = produceInEventItemsFormRef.value.getData()
    if (formType.value === 'create') {
      await ProduceInEventApi.createProduceInEvent(data)
      message.success(t('common.createSuccess'))
    } else {
      await ProduceInEventApi.updateProduceInEvent(data)
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
    produceInId: undefined,
    inType: undefined,
    status: undefined,
    produceInNo: undefined,
    remark: undefined
  }
  formRef.value?.resetFields()
}
</script>