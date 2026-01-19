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
      <!-- 第一行 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="入库单号" prop="produceInNo">
            <el-input v-model="formData.produceInNo" placeholder="保存时自动生成" readonly/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="类型" prop="type">
            <el-select v-model="formData.type" placeholder="" class="!w-120px">
              <el-option
                v-for="dict in getDictOptions(DICT_TYPE.ERP_PRODUCE_IN_TYPE)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <!-- 第二行 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="业务日期" prop="bizDate">
            <el-date-picker
              v-model="formData.bizDate"
              type="date"
              value-format="x"
              placeholder=""
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="备注" prop="remark">
            <el-input v-model="formData.remark" placeholder="" />
          </el-form-item>
        </el-col>
      </el-row>
      <!-- 第三行 -->
      <el-row :gutter="20">
        <el-col :span="12">
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
      </el-row>
      <!-- 隐藏字段 -->
      <el-form-item label="状态 " prop="status" v-if="false">
        <el-radio-group v-model="formData.status">
          <el-radio value="1">请选择字典生成</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="生产组织" prop="produceDept" v-if="false">
        <el-input v-model="formData.produceDept" placeholder="" />
      </el-form-item>
    </el-form>
    <!-- 子表的表单 -->
    <el-tabs v-model="subTabsName">
      <el-tab-pane label="生产入库明细" name="produceInItems">
        <ProduceInItemsForm ref="produceInItemsFormRef"
         :items="formData.produceInItemss" 
         :produce-in-id="formData.id"
         :disabled="disabled"
         :addBthVisible="addBthVisible"/>
      </el-tab-pane>
    </el-tabs>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading" v-if="!disabled">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
  <!-- 可入库的订单列表 -->
  <ProductionTaskInEnableList
    ref="productionTaskInEnableListRef"
    @success="handleProductionTaskChange"
  />
  
</template>
<script setup lang="ts">
import { ProduceInApi, ProduceInVO } from '@/api/erp/produce/producein'
import ProduceInItemsForm from './components/ProduceInItemsForm.vue'
import { ProductionTaskVO } from '@/api/erp/produce/productiontask'
import { DICT_TYPE, getDictOptions } from '@/utils/dict'
import ProductionTaskInEnableList from '@/views/erp/produce/productiontask/components/ProductionTaskInEnableList.vue'

/** 生产入库-包含成品，半成品 表单 */
defineOptions({ name: 'ProduceInForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗
const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  produceInNo: undefined,
  type: undefined,
  status: 10,
  bizDate: undefined,
  remark: undefined,
  produceDept: undefined,
  sourceBillNo: '',
  produceInItemss: [],
})
const formRules = reactive({
  type: [{ required: true, message: '类型不能为空', trigger: 'change' }],
  bizDate: [{ required: true, message: '业务日期不能为空', trigger: 'blur' }],
})
const formRef = ref() // 表单 Ref

/** 子表的表单 */
const subTabsName = ref('produceInItems')
const produceInItemsFormRef = ref()
const selectButtonDisabled = ref(false)

const disabled = computed(() => formType.value === 'detail')

let addBthVisible = ref(true)

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  selectButtonDisabled.value = false
  addBthVisible.value = true
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await ProduceInApi.getProduceIn(id)
      addBthVisible.value = !formData.value.sourceBillNo
      // 检查 sourceBillNo 是否不为空
      selectButtonDisabled.value = !!formData.value.sourceBillNo
      
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 打开【可入库的订单列表】弹窗 */
const productionTaskInEnableListRef = ref() // 可入库的订单列表 Ref
const openProductionTaskInEnableList = () => {
  productionTaskInEnableListRef.value.open()
}

const handleProductionTaskChange = (task: ProductionTaskVO) => {

  // 如果之前有添加过，提示用户，是否要覆盖
  if (formData.value.produceInItemss.length > 0) {
      ElMessageBox.confirm('是否要覆盖当前明细数据？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      formData.value.produceInItemss = []
      addProduceIn(task)
    }).catch(() => {})  
  }else{
    addProduceIn(task)
  }
}

const addProduceIn = (task: ProductionTaskVO) => {
      addBthVisible.value = false
      // 将订单设置到入库单
      formData.value.sourceBillNo = task.productionTaskNo
      // 将订单项设置到入库单项
      // 定义一个item项，把task中的各个属性都赋值给item
      const item = {
        id: undefined,
        produceInId: undefined,
        materialId: task.materialId,
        materialName: task.materialName,
        materialNumber: task.materialNumber,
        qty: task.plannedQuantity - (task.actualQuantity || 0),
        finalQty: task.plannedQuantity - (task.actualQuantity || 0),
        remark: task.remark,
        status: 10,
        sourceBillNo: task.productionTaskNo,
        sourceBillId: task.id,
        unitId: task.materialUnit,
      }
      formData.value.produceInItemss.push(item)
}

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 校验子表单
  try {
    await produceInItemsFormRef.value.validate()
  } catch (e) {
    subTabsName.value = 'produceInItems'
    return
  }
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as ProduceInVO
    // 拼接子表的数据
    data.produceInItemss = produceInItemsFormRef.value.getData()
    if (formType.value === 'create') {
      await ProduceInApi.createProduceIn(data)
      message.success(t('common.createSuccess'))
    } else {
      await ProduceInApi.updateProduceIn(data)
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
    produceInNo: undefined,
    type: undefined,
    status: 10,
    bizDate: undefined,
    remark: undefined,
    produceDept: undefined,
    sourceBillNo: '',
    produceInItemss: [],
  }
  formRef.value?.resetFields()
}
</script>