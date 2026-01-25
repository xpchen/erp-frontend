<!-- ERP 物料库存位置编辑 -->
<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="物料名称">
        <el-input v-model="formData.materialName" disabled />
      </el-form-item>
      <el-form-item label="仓库名称">
        <el-input v-model="formData.warehouseName" disabled />
      </el-form-item>
      <el-form-item label="库存数量">
        <el-input v-model="formData.count" disabled />
      </el-form-item>
      <el-form-item label="存放位置" prop="location">
        <el-input 
          v-model="formData.location" 
          placeholder="请输入存放位置，例如：A区-1号货架-3层" 
          maxlength="100"
          show-word-limit
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { StockApi, StockVO } from '@/api/erp/stock/stock'

/** ERP 物料库存位置编辑表单 */
defineOptions({ name: 'StockForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  materialId: undefined,
  warehouseId: undefined,
  materialName: undefined,
  warehouseName: undefined,
  count: undefined,
  location: undefined
})
const formRules = reactive({
  location: [
    { max: 100, message: '存放位置长度不能超过100个字符', trigger: 'blur' }
  ]
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, row?: StockVO) => {
  dialogVisible.value = true
  dialogTitle.value = type === 'update' ? '编辑存放位置' : '新增库存'
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (type === 'update' && row) {
    formData.value = {
      id: row.id,
      materialId: row.materialId,
      warehouseId: row.warehouseId,
      materialName: row.materialName,
      warehouseName: row.warehouseName,
      count: row.count,
      location: row.location || ''
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
    await StockApi.updateStockLocation(
      formData.value.materialId!,
      formData.value.warehouseId!,
      formData.value.location || undefined
    )
    message.success('更新成功')
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
    materialId: undefined,
    warehouseId: undefined,
    materialName: undefined,
    warehouseName: undefined,
    count: undefined,
    location: undefined
  }
  formRef.value?.resetFields()
}
</script>
