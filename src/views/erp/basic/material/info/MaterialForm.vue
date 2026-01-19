<!-- ERP 物料的新增/修改 -->
<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
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
            <el-input v-model="formData.barCode" readonly placeholder="保存后自动生成编码" />
          </el-form-item>
        </el-col>
        <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="物料类别" prop="categoryId">
          <el-select v-model="formData.categoryId" class="!w-240px" clearable placeholder="请选择类别">
          <el-option
            v-for="[id, name] in materialCategoryItem"
            :key="id"
            :value="id"
            :label="name"
          />
        </el-select>
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item label="单位" prop="unitId">
          <el-select v-model="formData.unitId" class="!w-240px" clearable placeholder="请选择单位" filterable>
          <el-option
            v-for="[id, name] in materialUnitItem"
            :key="id"
            :value="id"
            :label="name"
          />
        </el-select>
        </el-form-item>
      </el-col>
    </el-row>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="formData.status">
              <el-radio
                v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
                :key="dict.value"
                :value="dict.value"
              >
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
        <el-col :span="12">
          <el-form-item label="保质期天数" prop="expiryDay">
            <el-input-number
              v-model="formData.expiryDay"
              placeholder="请输入保质期天数"
              :min="0"
              :precision="0"
              class="!w-1/1"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="重量（kg）" prop="weight">
            <el-input-number
              v-model="formData.weight"
              placeholder="请输入重量（kg）"
              :min="0"
              class="!w-1/1"
            />
          </el-form-item>
        </el-col>
        <!-- <el-col :span="12">
          <el-form-item label="采购价格" prop="purchasePrice">
            <el-input-number
              v-model="formData.purchasePrice"
              placeholder="请输入采购价格，单位：元"
              :min="0"
              :precision="2"
              class="!w-1/1"
            />
          </el-form-item>如果有采购单位，为采购单位的价格
        </el-col> -->
        <el-col :span="12">
          <el-form-item label="销售价格" prop="salePrice">
            <el-input-number
              v-model="formData.salePrice"
              placeholder="请输入销售价格，单位：元"
              :min="0"
              :precision="2"
              class="!w-1/1"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="最低价格" prop="minPrice">
            <el-input-number
              v-model="formData.minPrice"
              placeholder="请输入最低价格，单位：元"
              :min="0"
              :precision="2"
              class="!w-1/1"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input type="textarea" v-model="formData.remark" placeholder="请输入备注" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { MaterialApi, MaterialDTO } from '@/api/erp/basic/material/info'
import { CommonStatusEnum } from '@/utils/constants'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { useBasicData } from '@/api/erp/basic/common'
const { materialCategoryItem, materialUnitItem } = useBasicData()

/** ERP 物料 表单 */
defineOptions({ name: 'MaterialForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  name: undefined,
  barCode: undefined,
  categoryId: undefined,
  unitId: undefined,
  status: undefined,
  standard: undefined,
  remark: undefined,
  expiryDay: undefined,
  weight: undefined,
  // purchasePrice: undefined,
  salePrice: undefined,
  minPrice: undefined
})
const formRules = reactive({
  name: [{ required: true, message: '物料名称不能为空', trigger: 'blur' }],
  // barCode: [{ required: true, message: '物料条码不能为空', trigger: 'blur' }],
  categoryId: [{ required: true, message: '物料分类编号不能为空', trigger: 'blur' }],
  unitId: [{ required: true, message: '单位编号不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '物料状态不能为空', trigger: 'blur' }]
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
      formData.value = await MaterialApi.getMaterial(id)
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
    const data = formData.value as unknown as MaterialDTO
    if (formType.value === 'create') {
      await MaterialApi.createMaterial(data)
      message.success(t('common.createSuccess'))
    } else {
      await MaterialApi.updateMaterial(data)
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
    name: undefined,
    barCode: undefined,
    categoryId: undefined,
    unitId: undefined,
    status: CommonStatusEnum.ENABLE,
    standard: undefined,
    remark: undefined,
    expiryDay: undefined,
    weight: undefined,
    // purchasePrice: undefined,
    salePrice: undefined,
    minPrice: undefined
  }
  formRef.value?.resetFields()
}
</script>
