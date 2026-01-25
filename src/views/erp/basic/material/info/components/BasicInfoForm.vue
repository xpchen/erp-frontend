<template>
  <!-- <Dialog :title="dialogTitle" v-model="dialogVisible"> -->
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >

    <el-row :gutter="20">
      <el-col :span="12">
          <el-form-item label="名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="编码" prop="barCode">
            <el-input v-model="formData.barCode" placeholder="请输入编码，留空则自动生成" />
          </el-form-item>
        </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="物料类别" prop="categoryId">
          <el-select v-model="formData.categoryId" clearable placeholder="请选择类别">
            <el-option v-for="[id, name] in materialCategoryItem" :key="id" :value="id" :label="name" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="单位" prop="unitId">
          <el-select v-model="formData.unitId"  clearable placeholder="请选择单位" filterable>
            <el-option v-for="[id, name] in materialUnitItem" :key="id" :value="id" :label="name" />
          </el-select>
        </el-form-item>
      </el-col>
      <!-- 新增一行，包含采购单位和换算比例 -->
        <el-col :span="12">
          <el-form-item label="采购单位" prop="unitPurchase">
            <el-select v-model="formData.unitPurchase" clearable placeholder="请选择采购单位" filterable>
              <el-option v-for="[id, name] in materialUnitItem" :key="id" :value="id" :label="name" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="换算比例" prop="changeRate">
            <el-input-number v-model="formData.changeRate" placeholder="请输入换算比例" :min="0" :precision="2" class="!w-1/1" />
          </el-form-item>
        </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)" :key="dict.value" :value="dict.value">
                {{ dict.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="规格" prop="standard">
          <el-input v-model="formData.standard" placeholder="请输入规格" />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="保质期天数" prop="expiryDay">
          <el-input-number v-model="formData.expiryDay" placeholder="请输入保质期天数" :min="0" :precision="0" class="!w-1/1" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
          <el-form-item label="重量(KG)" prop="weight">
            <el-input-number v-model="formData.weight" placeholder="请输入重量" :min="0" class="!w-1/1" />
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="采购价格(元)" prop="purchasePrice">
           <el-input-number v-model="formData.purchasePrice" placeholder="请输入采购价格" :min="0" :precision="2" class="!w-1/1" />
           <span style=" margin-left: 8px;color: red;">如果有采购单位，为采购单位的价格</span>
          </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="销售价格(元)" prop="salePrice">
          <el-input-number v-model="formData.salePrice" placeholder="请输入销售价格" :min="0" :precision="2" class="!w-1/1"  />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
          <el-form-item label="最低价格(元)" prop="minPrice">
            <el-input-number v-model="formData.minPrice" placeholder="请输入最低价格" :min="0" :precision="2" class="!w-1/1" />
          </el-form-item>
        </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="24">
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" v-model="formData.remark" placeholder="请输入备注" :rows="4"/>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
    <!-- <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog> -->
</template>
<script setup lang="ts">
import { MaterialApi, MaterialDTO } from '@/api/erp/basic/material/info'
import { CommonStatusEnum } from '@/utils/constants'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { useBasicData } from '@/api/erp/basic/common'
const { materialCategoryItem, materialUnitItem } = useBasicData()

// 自定义校验函数
const validateChangeRate = (rule, value, callback) => {
  if (formData.value.unit_purchase && !value) {
    callback(new Error('采购单位填写时，换算比例必须填写'))
  } else {
    callback()
  }
}

/** ERP 物料 表单 */
defineOptions({ name: 'MaterialForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗
const { query } = useRoute() // 查询参数
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref(query.type) // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  name: undefined,
  barCode: undefined,
  categoryId: undefined,
  unitId: undefined,
  // 新增字段
  unitPurchase: undefined,
  changeRate: undefined,
  status: undefined,
  standard: undefined,
  remark: undefined,
  expiryDay: undefined,
  weight: undefined,
  purchasePrice: undefined,
  salePrice: undefined,
  minPrice: undefined
})

const formRules = reactive({
  name: [{ required: true, message: '物料名称不能为空', trigger: 'blur' }],
  categoryId: [{ required: true, message: '物料分类编号不能为空', trigger: 'blur' }],
  unitId: [{ required: true, message: '单位编号不能为空', trigger: 'blur' }],
  unit_purchase: [{ required: true, message: '采购单位不能为空', trigger: 'blur' }],
  change_rate: [
    { validator: validateChangeRate, trigger: 'blur' }
  ],
  status: [{ required: true, message: '物料状态不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

/** 获得详情 */
const getDetail = async () => {
  const materialId = query.materialId as unknown as number
  if (!materialId) {
    return
  }
  formLoading.value = true
  try {
    const res = await MaterialApi.getMaterial(materialId)
    formData.value = {
      ...formData.value,
      ...res
    }
  } finally {
    formLoading.value = false
  }
}

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    debugger
    const data = formData.value as unknown as MaterialDTO
    if (formType.value === 'create') {
      await MaterialApi.createMaterial(data)
      message.success(t('common.createSuccess'))
    } else {
      debugger
      await MaterialApi.updateMaterial(data)
      message.success(t('common.updateSuccess'))
    }
    // 发送操作成功的事件
    // emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    name: undefined,
    barCode: undefined,
    categoryId: undefined,
    unitId: undefined,
    unitPurchase: undefined,
    changeRate: undefined,
    status: CommonStatusEnum.ENABLE,
    standard: undefined,
    remark: undefined,
    expiryDay: undefined,
    weight: undefined,
    purchasePrice: undefined,
    salePrice: undefined,
    minPrice: undefined
  }
  formRef.value?.resetFields()
}

/** 初始化 */
onMounted(async () => {
  getDetail()
})

const validate = async () =>{
  try{
    await unref(formRef)?.validate()
  }catch{
    return false
  }
    return true
}

defineExpose({
  validate, submitForm
})
</script>