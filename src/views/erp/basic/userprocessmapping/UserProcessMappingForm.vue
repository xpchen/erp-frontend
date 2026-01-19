<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="人员" prop="userId">
        <el-select
          v-model="formData.userId"
          placeholder="请选择人员"
          clearable
          filterable
          class="!w-240px"
        >
          <!-- 渲染用户列表 -->
          <el-option
            v-for="user in userList"
            :key="user.id"
            :label="user.nickname"
            :value="user.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="工序" prop="processId">
        <el-select
          v-model="formData.processId"
          placeholder="请选择工序"
          clearable
          filterable
          class="!w-240px"
        >
          <el-option
            v-for="process in processList"
            :key="process.id"
            :label="process.processName"
            :value="process.id"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { UserProcessMappingApi, UserProcessMappingVO } from '@/api/erp/basic/userprocessmapping'
import { getAllUser, UserVO } from '@/api/system/user'
import { ProduceProcessApi, ProduceProcessVO } from '@/api/erp/produce/process'

/** 人员工序对照 表单 */
defineOptions({ name: 'UserProcessMappingForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  userId: undefined,
  processId: undefined,
})
const formRules = reactive({
  userId: [{ required: true, message: '人员不能为空', trigger: 'change' }],
  processId: [{ required: true, message: '工序不能为空', trigger: 'change' }],
})
const formRef = ref() // 表单 Ref

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
      formData.value = await UserProcessMappingApi.getUserProcessMapping(id)
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
    const data = formData.value as unknown as UserProcessMappingVO
    if (formType.value === 'create') {
      await UserProcessMappingApi.createUserProcessMapping(data)
      message.success(t('common.createSuccess'))
    } else {
      await UserProcessMappingApi.updateUserProcessMapping(data)
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
    userId: undefined,
    processId: undefined,
  }
  formRef.value?.resetFields()
}

// 定义用户列表响应式变量
const userList = ref<UserVO[]>([])

const processList = ref<ProduceProcessVO[]>([])

// 获取用户列表
const getUserList = async () => {
  try {
    const data = await getAllUser()
    userList.value = data
  } catch (error) {
    console.error('获取用户列表失败', error)
  }
}

const getProcessList = async () => {
  try {
    const data = await ProduceProcessApi.getProduceProcessList()
    processList.value = data
  } catch (error) {
    console.error('获取工序列表失败', error)
  }
}

// 初始化
onMounted(() => {
  getUserList()
  getProcessList()
})
</script>