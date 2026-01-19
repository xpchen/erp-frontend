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
        <el-col :span="8">
          <el-form-item label="关联订单" prop="sourceBillNo">
            <el-input v-model="formData.sourceBillNo" readonly>
              <template #append>
                <!-- 绑定按钮禁用状态 -->
                <el-button @click="openProductionTaskInEnableList" :disabled="selectButtonDisabled">
                  <Icon icon="ep:search" /> 选择
                </el-button>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="备注" prop="remark">
            <el-input
              type="textarea"
              v-model="formData.remark"
              :rows="1"
              placeholder="请输入备注"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="业务类型" prop="outType">
            <!-- 将输入框替换为下拉框 -->
            <el-select v-model="formData.outType" placeholder="请选择业务类型">
              <el-option label="领料出库" :value="100" />
              <el-option label="退料入库" :value="200" />
              <el-option label="倒冲出库" :value="120" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8" v-if="false">
          <el-form-item label="附件" prop="fileUrl">
            <UploadFile :is-show-tip="false" v-model="formData.fileUrl" :limit="1" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <!-- 子表的表单 -->
    <ContentWrap>
      <el-tabs v-model="subTabsName" class="-mt-15px -mb-10px">
        <el-tab-pane label="出库物料清单" name="item">
          <StockOutReqItemForm ref="itemFormRef" :items="formData.items" :disabled="disabled" />
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
import { StockOutReqApi, StockOutReqVO } from '@/api/erp/stock/req'
import StockOutReqItemForm from './components/StockOutReqItemForm.vue'
import { useBasicData } from '@/api/erp/basic/common'
import * as DeptApi from '@/api/system/dept'
import { defaultProps, handleTree } from '@/utils/tree'

const { customerItem } = useBasicData()

/** ERP 领料出库单表单 */
defineOptions({ name: 'StockOutReqForm' })

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
  // 保持数字类型
  outType: 100,
  fileUrl: '',
  items: []
})

// 修改 open 方法以接收物料数据
const open = async (type: string, id?: number, materials?: any[], outType?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)

  deptList.value = handleTree(await DeptApi.getSimpleDeptList())
  formType.value = type
  resetForm()

  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await StockOutReqApi.getStockOut(id)
    } finally {
      formLoading.value = false
    }
  }

  // 如果传递了物料数据，设置到子表
  if (materials) {
    // 直接更新 formData.items
    formData.value.items = [...materials] 
  }

  // 如果传递了 outType 参数，更新 formData.outType 的值
  if (outType !== undefined) {
    formData.value.outType = outType;
  }
}

const formRules = reactive({
  outTime: [{ required: true, message: '出库时间不能为空', trigger: 'blur' }],
  customerId: [{ required: true, message: '部门不能为空', trigger: 'blur' }],
  // 添加业务类型的校验规则
  outType: [{ required: true, message: '业务类型不能为空', trigger: 'change' }]
})
const disabled = computed(() => formType.value === 'detail')
const formRef = ref() // 表单 Ref

/** 子表的表单 */
const subTabsName = ref('item')
const itemFormRef = ref()

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
    const data = formData.value as unknown as StockOutReqVO
    if (formType.value === 'create') {
      await StockOutReqApi.createStockOut(data)
      message.success(t('common.createSuccess'))
    } else {
      await StockOutReqApi.updateStockOut(data)
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
    outType: 100,
    items: []
  }
  formRef.value?.resetFields()
}
</script>
