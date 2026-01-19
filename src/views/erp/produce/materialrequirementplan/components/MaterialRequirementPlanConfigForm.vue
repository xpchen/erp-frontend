<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="82%"  align-center>
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
      :disabled="isViewMode"
    >
    <el-row :gutter="20">
      <el-col :span="8">
        <el-form-item label="主计划编码:" prop="sourceBillNo" label-width="120px">
          <el-input v-model="formData.sourceBillNo" placeholder="主计划编码" disabled />
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="需求计划编码:" prop="mrpNo" label-width="120px">
          <el-input v-model="formData.mrpNo" placeholder="保存时自动生成" disabled/>
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="销售订单编码:" prop="saleOrderNo" label-width="120px">
          <el-input v-model="formData.saleOrderNo" placeholder="保存时自动生成" disabled/>
        </el-form-item>
      </el-col>
    </el-row>

     <el-row :gutter="20">
      <el-col :span="8">
        <el-form-item label="审批状态:" prop="statusDesc" label-width="120px">
          <el-input v-model="formData.statusDesc"  disabled />
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="下达状态:" prop="issuedStatusDesc" label-width="120px">
          <el-input v-model="formData.issuedStatusDesc" disabled/>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="16">
        <el-form-item label="需求计划描述:" prop="mrpDesc" label-width="120px">
          <el-input v-model="formData.mrpDesc" type="textarea" placeholder="请输入需求计划描述" />
        </el-form-item>
      </el-col>
    </el-row>
    </el-form>
    <!-- 子表的表单 -->
    <!-- <el-button @click="handleIssueTask" type="success" :disabled="formLoading" v-if="formType !== 'view'" style="margin-left: 94%; margin-bottom: -46px;">下达任务</el-button> -->
    <el-tabs v-model="subTabsName">
      <el-tab-pane label="物料需求计划明细" name="materialRequirementPlanItems">
        <MaterialRequirementPlanItemsForm ref="materialRequirementPlanItemsFormRef" :material-requirement-plan-id="formData.id" :from-type="formType"/>
      </el-tab-pane>
    </el-tabs>
    <template #footer>
      <el-button 
        @click="handleIssueTask" 
        type="success" 
        :disabled="formLoading" 
        v-if="formType !== 'view' && formData.statusDesc !== '未审核' && formData.issuedStatusDesc !== '全部下达'" >下达任务</el-button>
      <el-button @click="submitForm" type="primary" :disabled="formLoading" v-if="formType !== 'view'">确 定</el-button>
      <el-button @click="dialogVisible = false">关闭</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { MaterialRequirementPlanApi, MaterialRequirementPlanVO, MrpTaskDispatchDTO} from '@/api/erp/produce/materialrequirementplan'
import MaterialRequirementPlanItemsForm from './MaterialRequirementPlanItemsForm.vue'

/** 物料需求计划 表单 */
defineOptions({ name: 'MaterialRequirementPlanForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  statusDesc: undefined,
  issuedStatusDesc: undefined,
  sourceBillNo: undefined,
  mrpNo: undefined,
  saleOrderNo: undefined,
  mrpDesc: undefined,
})
const formRules = reactive({
  produceMainPlanNo: [{ required: true, message: '主计划编码不能为空', trigger: 'blur' }],
  mrpNo: [{ required: true, message: '需求计划编码不能为空', trigger: 'blur' }],
})
const formRef = ref() // 表单 Ref

/** 子表的表单 */
const subTabsName = ref('materialRequirementPlanItems')
const materialRequirementPlanItemsFormRef = ref()

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = type === 'create' ? t('action.create') : type === 'update' ? t('action.update') : t('详情')
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await MaterialRequirementPlanApi.getInfo(id)
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
    await materialRequirementPlanItemsFormRef.value.validate()
  } catch (e) {
    subTabsName.value = 'materialRequirementPlanItems'
    return
  }
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as MaterialRequirementPlanVO
    // 拼接子表的数据
    data.materialRequirementPlanItems = materialRequirementPlanItemsFormRef.value.getData()
    if (formType.value === 'create') {
      await MaterialRequirementPlanApi.createMaterialRequirementPlan(data)
      message.success(t('common.createSuccess'))
    } else {
      await MaterialRequirementPlanApi.updateMaterialRequirementPlan(data)
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
    sourceBillNo: undefined,
    mrpNo: undefined,
    mrpDesc: undefined,
  }
  formRef.value?.resetFields()
}

// 新增计算属性：判断是否为查看模式
const isViewMode = computed(() => formType.value === 'view')

/** 下达任务 */
const handleIssueTask = async () => {
  try {
    formLoading.value = true
    const data = [Number(formData.value.id)]
    await MaterialRequirementPlanApi.issueTask(data)
    message.success('下达任务成功')
     dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}
</script>