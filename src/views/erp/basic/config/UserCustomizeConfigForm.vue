<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio :key="0" :value="0" >开启</el-radio>
          <el-radio :key="1" :value="1">关闭</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="配置键" prop="configKey">
        <el-input v-model="formData.configKey" placeholder="请输入配置键" :disabled="formType === 'update'"/>
      </el-form-item>
      <el-form-item label="配置值" prop="configValue">
        <template v-if="formData.configKey === 'erp_merge_purchase_orders'">
          <el-radio-group v-model="formData.configValue">
            <el-radio :key="'the_earliest_time'" :label="'the_earliest_time'" >
              采购最早时间
            </el-radio>
            <el-radio  :key="'the_latest_time'"  :label="'the_latest_time'" > 
              采购最晚时间
            </el-radio>
            <el-radio  :key="'the_same_time'"  :label="'the_same_time'" > 
              采购相同时间
            </el-radio>
          </el-radio-group>
        </template>
        <template v-else>
          <el-input v-model="formData.configValue" placeholder="请输入配置值"  :disabled="shouldDisableConfigValue" />
        </template>
      </el-form-item>

      <el-form-item label="配置描述" prop="configDesc">
        <el-input v-model="formData.configDesc" placeholder="请输入配置描述" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { UserCustomizeConfigApi, UserCustomizeConfigVO } from '@/api/erp/basic/config'

/** 用户自定义配置 表单 */
defineOptions({ name: 'UserCustomizeConfigForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  status: 0,
  configKey: undefined,
  configDesc: undefined,
  configValue: undefined,
})
const formRules = reactive({
  status: [{ required: true, message: '状态不能为空', trigger: 'blur' }],
  configKey: [{ required: true, message: '配置键不能为空', trigger: 'blur' }],
  configValue: [{ required: true, message: '配置值不能为空', trigger: 'blur' }],
})
const formRef = ref() // 表单 Ref

const SPECIAL_CONFIG_KEYS = [
  'erp_purchase_request_default_approved',
  'erp_production_task_default_approved',
  'erp_auto_create_purchase_order'
]

// 计算属性：判断是否应该禁用配置值输入框
const shouldDisableConfigValue = computed(() => {
  return formType.value === 'update' && 
         formData.value.configKey && 
         SPECIAL_CONFIG_KEYS.includes(formData.value.configKey)
})

/** 打开弹窗 */
// const open = async (type: string, id?: number) => {
//   dialogVisible.value = true
//   dialogTitle.value = t('action.' + type)
//   formType.value = type
//   resetForm()
//   // 修改时，设置数据
//   if (id) {
//     formLoading.value = true
//     try {
//       formData.value = await UserCustomizeConfigApi.getUserCustomizeConfig(id)
//     } finally {

//       formLoading.value = false
//     }
//   }
// }

const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()

  if (id) {
    formLoading.value = true
    try {
      const data = await UserCustomizeConfigApi.getUserCustomizeConfig(id)
      formData.value = {
        ...data,
        // 特殊处理：若为 erp_merge_purchase_orders，确保 configValue 为字符串类型
        configValue: String(data.configValue),
      }
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
    const data = formData.value as unknown as UserCustomizeConfigVO
    if (formType.value === 'create') {
      await UserCustomizeConfigApi.createUserCustomizeConfig(data)
      message.success(t('common.createSuccess'))
    } else {
      await UserCustomizeConfigApi.updateUserCustomizeConfig(data)
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
    status: 0,
    configKey: undefined,
    configDesc: undefined,
    configValue: undefined,
  }
  formRef.value?.resetFields()
}
</script>