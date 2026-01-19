<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="计划编码" prop="no">
        <el-input v-model="formData.no" placeholder="编码保存后自动生成" disabled />
      </el-form-item>
      <el-form-item label="物料" prop="materialId">
        <el-select v-model="formData.materialId" 
         clearable filterable placeholder="请选择物料" 
         class="!w-220px"
         @change="onChangeMaterial($event)" >
         <el-option
            v-for="item in materialList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="单位" prop="unitId">
        <el-select v-model="formData.unitId"  clearable filterable placeholder="请请输入单位" class="!w-220px" >
          <el-option v-for="[id, name] in materialUnitItem" :key="id" :value="id" :label="name" />
        </el-select>
      </el-form-item>
      <el-form-item label="规格型号" prop="mode">
        <el-input v-model="formData.mode" placeholder="请输入规格型号" />
      </el-form-item>
      <el-form-item label="物料属性" prop="materialAttr">
        <el-select v-model="formData.materialAttr" placeholder="请选择物料属性" class="!w-120px">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.ERP_MATERIAL_ATTR)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="数量" prop="qty">
        <el-input v-model="formData.qty" placeholder="请输入数量" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" placeholder="请输入备注" />
      </el-form-item>
      <el-form-item label="开工日期" prop="startDate">
        <el-date-picker
          v-model="formData.startDate"
          type="date"
          value-format="x"
          placeholder="选择开工日期"
        />
      </el-form-item>
      <el-form-item label="完工日期" prop="endDate">
        <el-date-picker
          v-model="formData.endDate"
          type="date"
          value-format="x"
          placeholder="选择完工日期"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status" v-if="false">
        <el-radio-group v-model="formData.status">
          <el-radio value="1">请选择字典生成</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { MainPlanApi, MainPlanVO } from '@/api/erp/produce/mainplan'
import { MaterialApi, MaterialDTO} from '@/api/erp/basic/material/info'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { useBasicData } from '@/api/erp/basic/common'

const { materialUnitItem } = useBasicData()
const materialList = ref<MaterialDTO[]>([]) // 产品列表

/** 主计划 表单 */
defineOptions({ name: 'MainPlanForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData:any = ref({
  id: undefined,
  no: undefined,
  sourceBillId: undefined,
  sourceBillNo: undefined,
  sourceDetailId: undefined,
  materialId: undefined,
  unitId: undefined,
  mode: undefined,
  qty: undefined,
  remark: undefined,
  startDate: undefined,
  endDate: undefined,
  materialAttr: undefined,
  mrpSelected: 0,
  status: 1,
})
const formRules = reactive({
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  materialList.value = await MaterialApi.getMaterialSimpleListForBom()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await MainPlanApi.getMainPlan(id)
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
    const data = formData.value as unknown as MainPlanVO
    if (formType.value === 'create') {
      await MainPlanApi.createMainPlan(data)
      message.success(t('common.createSuccess'))
    } else {
      await MainPlanApi.updateMainPlan(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}


const onChangeMaterial = (materialId) => {
  const material = materialList.value.find((item) => item.id === materialId)
  if (material) {
    // formData.value.fmaterialid = material.id
    formData.value.unitId = material.unitId
    formData.value.materialAttr = material.planInfo.materialAttr
    formData.value.mode = material.standard
  }
  // 加载库存
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    no: undefined,
    sourceBillId: undefined,
    sourceBillNo: undefined,
    sourceDetailId: undefined,
    materialId: undefined,
    unitId: undefined,
    mode: undefined,
    qty: undefined,
    remark: undefined,
    startDate: undefined,
    endDate: undefined,
    materialAttr: undefined,
    mrpSelected: 0,
    status: 1,
  }
  formRef.value?.resetFields()
}
</script>