<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="1080">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
      :disabled="disabled"
    >
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="出库单号" prop="no">
            <el-input disabled v-model="formData.no" placeholder="保存时自动生成" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="出库时间" prop="outTime">
            <el-date-picker
              v-model="formData.outTime"
              type="date"
              value-format="x"
              placeholder="选择出库时间"
              class="!w-1/1"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="部门" prop="customerId">
            <el-tree-select
              v-model="formData.customerId"
              :data="deptList"
              :props="defaultProps"
              check-strictly 
              clearable 
              filterable
              node-key="id"
            />
          </el-form-item>
        </el-col>
        <el-col :span="16">
          <el-form-item label="备注" prop="remark">
            <el-input
              type="textarea"
              v-model="formData.remark"
              :rows="1"
              placeholder="请输入备注"
            />
          </el-form-item>
        </el-col>
        <el-col :span="16" v-if="false">
          <el-form-item label="出库类型" prop="outType">
            <el-input
              v-model="formData.outType"
              :rows="1"
              placeholder="请输入出库类型"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="附件" prop="fileUrl">
            <UploadFile :is-show-tip="false" v-model="formData.fileUrl" :limit="1" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <!-- 子表的表单 -->
    <ContentWrap>
      <el-tabs v-model="subTabsName" class="-mt-15px -mb-10px">
        <el-tab-pane label="出库产品清单" name="item">
          <StockOutItemForm ref="itemFormRef" :items="formData.items" :disabled="disabled" />
        </el-tab-pane>
      </el-tabs>
    </ContentWrap>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading" v-if="!disabled">
        确 定
      </el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { StockOutApi, StockOutVO } from '@/api/erp/stock/out'
import StockOutItemForm from './components/StockOutItemForm.vue'
import * as DeptApi from '@/api/system/dept'
import { defaultProps, handleTree } from '@/utils/tree'

/** ERP 其它出库单表单 */
defineOptions({ name: 'StockOutForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const deptList = ref<Tree[]>([]) // 树形结构
const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改；detail - 详情
const formData = ref({
  id: undefined,
  customerId: undefined,
  outTime: undefined,
  remark: undefined,
  fileUrl: '',
  outType: 20,
  items: []
})
const formRules = reactive({
  outTime: [{ required: true, message: '出库时间不能为空', trigger: 'blur' }]
})
const disabled = computed(() => formType.value === 'detail')
const formRef = ref() // 表单 Ref

/** 子表的表单 */
const subTabsName = ref('item')
const itemFormRef = ref()

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
      formData.value = await StockOutApi.getStockOut(id)
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
  await itemFormRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as StockOutVO
    if (formType.value === 'create') {
      await StockOutApi.createStockOut(data)
      message.success(t('common.createSuccess'))
    } else {
      await StockOutApi.updateStockOut(data)
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
    customerId: undefined,
    outTime: undefined,
    remark: undefined,
    fileUrl: undefined,
    outType: 20,
    items: []
  }
  formRef.value?.resetFields()
}
</script>
