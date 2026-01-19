<template>
  <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      v-loading="formLoading"
    >

    <el-row :gutter="20">
      <el-col :span="12">
          <el-form-item label="物料属性" prop="materialAttr">
            <el-select v-model="formData.materialAttr" placeholder="请选择物料属性">
              <el-option v-for="[id, name] in materialAttrItem" :key="id" :value="id" :label="name" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="责任部门" prop="dutyDepartmentId">
            <el-tree-select v-model="formData.dutyDepartmentId" :data="deptList" :props="defaultProps" check-strictly clearable filterable node-key="id" placeholder="请选择责任部门" />
          </el-form-item>
        </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
          <el-form-item label="计划类型" prop="planningMode">
            <el-select v-model="formData.planningMode" placeholder="请选择计划类型">
              <el-option v-for="[id, name] in materialPlanModeItem" :key="id" :value="id" :label="name" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="物料特性" prop="materialChar">
            <el-select v-model="formData.materialChar" placeholder="请选择物料特性">
              <el-option v-for="[id, name] in materialCharTypeItem" :key="id" :value="id" :label="name" />
            </el-select>
          </el-form-item>
        </el-col>
        <!-- <el-col :span="12">
          <el-form-item label="制造策略" prop="planStrategy">
            <el-select v-model="formData.planStrategy" placeholder="请选择制造策略">
              <el-option v-for="[id, name] in materialPlanStrategyItem" :key="id" :value="id" :label="name" />
            </el-select>
          </el-form-item>
        </el-col> -->
    </el-row>


    <el-row :gutter="20">
      
        <!-- <el-col :span="12">
          <el-form-item label="批量增量" prop="batchincQty">
            <el-input-number v-model="formData.batchincQty" placeholder="请填写批量增量" class="!w-1/1"/>
          </el-form-item>
        </el-col> -->
    </el-row>

    <el-row :gutter="20">
      <!-- <el-col :span="12">
          <el-form-item label="是否倒冲" prop="isBackFlush">
            <el-radio-group v-model="formData.isBackFlush">
              <el-radio
                v-for="dict in getIntDictOptions(DICT_TYPE.SYSTEM_YES_NO)"
                :key="dict.value"
                :value="dict.value"
                :label="dict.label"
              >
                {{ dict.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col> -->
        <el-col :span="12">
          <el-form-item label="生产提前期(天)" prop="produceLeadTime">
            <el-input-number v-model="formData.produceLeadTime" placeholder="请填写生产提前期(天)" class="!w-1/1"/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="收货提前期(天)" prop="recevingLeadTime">
            <el-input-number v-model="formData.recevingLeadTime" placeholder="请填写收货提前期(天)" class="!w-1/1"/>
          </el-form-item>
        </el-col>
    </el-row>

    <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="领送料模式" prop="issMode">
            <el-select v-model="formData.issMode" placeholder="请选择领送料模式">
              <el-option v-for="[id, name] in materialIssModeItem" :key="id" :value="id" :label="name" :disabled="true"/>
            </el-select>
          </el-form-item>
        </el-col>
    </el-row>
  </el-form>
</template>


<script lang="ts" setup name="PurchaseInfoForm">
import {onMounted} from 'vue'
import { MaterialApi, PlanDTO } from '@/api/erp/basic/material/info'
import { defaultProps, handleTree } from '@/utils/tree'
import * as DeptApi from '@/api/system/dept'
import { useBasicData } from '@/api/erp/basic/common'
const { materialAttrItem, materialPlanModeItem, materialCharTypeItem, materialIssModeItem } = useBasicData()

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const { query } = useRoute() // 查询参数

const formType = ref(query.type)
const formRef = ref() // 表单 Ref
const deptList = ref<Tree[]>([]) // 树形结构的部门列表
const formRules = reactive({
  planningMode: [{ required: true, message: '计划类型不能为空', trigger: 'blur' }],
  materialAttr: [{ required: true, message: '物料属性不能为空', trigger: 'blur' }]
})

const formData = ref({
  id: undefined,
  status: undefined,  // 计划状态
  freezeOrgUnit: undefined,
  materialId: query.materialId,    // 物料
  materialAttr: undefined,    // 物料属性
  planStrategy: undefined,  // 制造策略
  materialChar: undefined,    // 物料特性
  batchincQty: undefined,  // 批量增量
  isBackFlush: undefined,   // 是否倒冲
  produceLeadTime: undefined,    // 提前期(天)
  recevingLeadTime: undefined,       // 收货提前期(天)
  dutyDepartmentId: undefined,
  isKeyPart: undefined,
  qualityOrgId: undefined,
  productLineId: undefined,
  purOrgId: undefined,
  issMode: 1,    // 领送料模式
  issLeadTime: undefined,   // 领料提前期
  planningMode: 3,   // 计划方式
  replaceMode: undefined   // 替换方式

})

// 定义制造策略是否禁用的状态
const isPlanStrategyDisabled = ref(false);
// 监听计划类型的变化
watch(() => formData.value.planningMode, (newValue: number) => {
  isPlanStrategyDisabled.value = [0, 1].includes(newValue);
});

const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as PlanDTO
    debugger
    if (formType.value === 'create') {
      await MaterialApi.createPlanInfo(data)
      // message.success(t('common.createSuccess'))
    } else {
      await MaterialApi.createOrUpdatePlanInfo(data)
      // message.success(t('common.updateSuccess'))
    }
    // dialogVisible.value = false
    // 发送操作成功的事件
    // emit('success')
  } finally {
    formLoading.value = false
  }
}

const getPlanInfo = async () => {
  const materialId = query.materialId as unknown as number
  if (!materialId) {
    return
  }
  formLoading.value = true
  try {
    const res = await MaterialApi.getPlanInfo(materialId)
    formData.value = {
      ...formData.value,
      ...res
    }
  } finally {
    formLoading.value = false
  }
}

const validate = async () =>{
  try{
    debugger
    // 新增的判断逻辑：如果物料属性是 自制件 时，责任部门必须选择
    if (formData.value.materialAttr !== undefined && formData.value.materialAttr === 3 && !formData.value.dutyDepartmentId) {
      message.error('当物料属性为【自制件】时，责任部门必须选择！');
      return false;
    }
    await unref(formRef)?.validate()
  }catch{
    return false
  }
  
  return true
}

onMounted(async () => {
    // 加载部门树
    deptList.value = handleTree(await DeptApi.getSimpleDeptList())
    // 获取计划资料信息
    await getPlanInfo()
  })

  defineExpose({
  validate, submitForm
  })
</script>