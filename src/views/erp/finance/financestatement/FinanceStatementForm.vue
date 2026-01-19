<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="80%">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
      :disabled="disabled"
    >
      <!-- 使用 el-row 进行行布局 -->
      <el-row :gutter="20">
        <el-col :span="8"> <!-- 每列占 8 份，一行共 24 份，所以每行显示 3 项 -->
          <el-form-item label="对账单号" prop="no">
            <el-input v-model="formData.no" placeholder="请输入对账单号" readonly/>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="类型" prop="type">
            <el-select v-model="formData.type" placeholder="请选择类型" readonly disabled>
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.ERP_FINANCE_STATEMENT_TYPE)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="对账周期" prop="billingPeriod">
            <el-input v-model="formData.billingPeriod" placeholder="请输入对账周期" readonly/>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="生成日期" prop="statementDate">
            <el-date-picker
              v-model="formData.statementDate"
              type="date"
              value-format="x"
              placeholder="选择生成日期"
              readonly
             />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="总金额(含税)" prop="totalAmount">
            <el-input v-model="formData.totalAmount" placeholder="请输入总金额（含税）" readonly/>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="交易金额" prop="transactionAmount">
            <el-input v-model="formData.transactionAmount" placeholder="请输入交易金额" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="状态" prop="status">
            <dict-tag :type="DICT_TYPE.ERP_FINANCE_STATEMENT_STATUS" :value="formData.status" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <!-- 子表的表单 -->
    <el-tabs v-model="subTabsName">
      <el-tab-pane label="对账单明细" name="financeStatementItems">
        <!-- 绑定自定义事件 -->
        <FinanceStatementItemsForm 
          ref="financeStatementItemsFormRef" 
          :statement-id="formData.id" 
          :disabled="disabled"
          @updateTotalAmount="updateTotalAmount"
        />
      </el-tab-pane>
    </el-tabs>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading" v-if="!disabled">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { FinanceStatementApi, FinanceStatementVO } from '@/api/erp/finance/financestatement'
import FinanceStatementItemsForm from './components/FinanceStatementItemsForm.vue'

/** 对账单 表单 */
defineOptions({ name: 'FinanceStatementForm' })

const disabled = computed(() => formType.value === 'detail')

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  no: undefined,
  type: undefined,
  billingPeriod: undefined,
  statementDate: undefined,
  totalAmount: 0, // 初始化总金额为 0
  transactionAmount: undefined,
  status: undefined,
})
const formRules = reactive({
  billingPeriod: [{ required: true, message: '对账周期不能为空', trigger: 'blur' }],
})
const formRef = ref() // 表单 Ref

/** 子表的表单 */
const subTabsName = ref('financeStatementItems')
const financeStatementItemsFormRef = ref()

// 处理子组件传来的总金额
const updateTotalAmount = (newTotal: number) => {
  formData.value.totalAmount = newTotal
}

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
      formData.value = await FinanceStatementApi.getFinanceStatement(id)
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
    await financeStatementItemsFormRef.value.validate()
  } catch (e) {
    subTabsName.value = 'financeStatementItems'
    return
  }
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as FinanceStatementVO
    // 拼接子表的数据
    data.financeStatementItemss = financeStatementItemsFormRef.value.getData()
    if (formType.value === 'create') {
      await FinanceStatementApi.createFinanceStatement(data)
      message.success(t('common.createSuccess'))
    } else {
      await FinanceStatementApi.updateFinanceStatement(data)
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
    no: undefined,
    type: undefined,
    billingPeriod: undefined,
    statementDate: undefined,
    totalAmount: 0, // 重置总金额为 0
    paidAmount: undefined,
    status: undefined,
  }
  formRef.value?.resetFields()
}
</script>