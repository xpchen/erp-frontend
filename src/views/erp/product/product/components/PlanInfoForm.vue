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
          <el-form-item label="物料属性" prop="fmaterialattr">
            <el-select v-model="formData.fmaterialattr" placeholder="请选择物料属性">
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.ERP_MATERIAL_ATTR)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="责任部门" prop="fdutydepartment">
            <el-tree-select
              v-model="formData.fdutydepartment"
              :data="deptList"
              :props="defaultProps"
              check-strictly
              clearable
              filterable
              node-key="id"
              placeholder="请选择责任部门"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="计划类型" prop="fplanningmode">
            <el-select v-model="formData.fplanningmode" placeholder="请选择计划类型">
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.ERP_PLANNING_MODE)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="制造策略" prop="fplanstrategy">
            <el-select v-model="formData.fplanstrategy" placeholder="请选择制造策略" :disabled="isPlanStrategyDisabled">
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.ERP_PLAN_STRATEGY)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="物料特性" prop="fmaterialchar">
            <el-select v-model="formData.fmaterialchar" placeholder="请选择物料特性">
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.ERP_MATERIAL_CHAR)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="生产计量单位" prop="fproductunitid">
            <el-select
v-model="formData.fproductunitid"
              clearable
              filterable
              placeholder="请选择生产计量单位"
              class="!w-1/1">
              <el-option
              v-for="unit in unitList"
                :key="unit.id"
                :label="unit.name"
                :value="unit.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="需求分配" prop="fisdemandassign">
            <el-radio-group v-model="formData.fisdemandassign">
              <el-radio
                v-for="dict in getIntDictOptions(DICT_TYPE.SYSTEM_YES_NO)"
                :key="dict.value"
                :value="dict.value"
              >
                {{ dict.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否最大批量法" prop="fismaxbatchmethod">
            <el-radio-group v-model="formData.fismaxbatchmethod">
              <el-radio
                v-for="dict in getIntDictOptions(DICT_TYPE.SYSTEM_YES_NO)"
                :key="dict.value"
                :value="dict.value"
              >
                {{ dict.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="最大批量" prop="fqtymax">
            <el-input-number v-model="formData.fmaxbatchqty" placeholder="请填写最大批量" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否最小批量法" prop="fisminbatchmethod">
            <el-radio-group v-model="formData.fisminbatchmethod">
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
        </el-col>
        <el-col :span="12">
          <el-form-item label="最小批量" prop="fminbatchqty">
            <el-input-number v-model="formData.fminbatchqty" placeholder="请填写最小批量" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否批量增量" prop="fisbatchincmethod">
            <el-radio-group v-model="formData.fisbatchincmethod">
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
        </el-col>
        <el-col :span="12">
          <el-form-item label="批量增量" prop="fbatchincqty">
            <el-input-number v-model="formData.fbatchincqty" placeholder="请填写最小批量" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否倒冲" prop="fisbackflush">
            <el-radio-group v-model="formData.fisbackflush">
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
        </el-col>
        <el-col :span="12">
          <el-form-item label="提前期(天)" prop="fproduceleadtime">
            <el-input-number v-model="formData.fproduceleadtime" placeholder="请填写提前期(天)" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="收货提前期(天)" prop="frecevingleadtime">
            <el-input-number v-model="formData.frecevingleadtime" placeholder="请填写收货提前期(天)" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="领送料模式" prop="fissmode">
            <el-select v-model="formData.fissmode" placeholder="请选择领送料模式">
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.ERP_MATERIAL_OUT)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="领料限额控制" prop="fisquotacontrol">
            <el-radio-group v-model="formData.fisquotacontrol">
              <el-radio
                v-for="dict in getIntDictOptions(DICT_TYPE.SYSTEM_YES_NO)"
                :key="dict.value"
                :value="dict.value"
              >
                {{ dict.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="领料上限允差" prop="frecevingleadtime">
            <el-input-number v-model="formData.frecevingleadtime" placeholder="请填写领料上限允差" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="领料下限允差" prop="fissinlowlimit">
            <el-input-number v-model="formData.fissinlowlimit" placeholder="请填写领料下限允差" />
          </el-form-item>
        </el-col>

      </el-row>
    </el-form>
</template>


<script lang="ts" setup name="PurchaseInfoForm">
import {onMounted} from 'vue'
import { PlanDTO, MaterialApi } from '@/api/erp/product/product'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { ProductUnitApi, ProductUnitVO } from '@/api/erp/product/unit'
import { defaultProps, handleTree } from '@/utils/tree'
import * as DeptApi from '@/api/system/dept'

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const { query } = useRoute() // 查询参数
const unitList = ref<ProductUnitVO[]>([]) // 产品单位列表

const formType = ref(query.type)
const formRef = ref() // 表单 Ref
const deptList = ref<Tree[]>([]) // 树形结构的部门列表
const formRules = reactive({
  fplanningmode: [{ required: true, message: '计划类型不能为空', trigger: 'blur' }],
  fmaterialattr: [{ required: true, message: '物料属性不能为空', trigger: 'blur' }]
})

const formData = ref({
  fid: undefined,
  fstatus: undefined,  // 计划状态
  fmaterialid: undefined,    // 物料
  fmaterialattr: undefined,    // 物料属性
  fplanstrategy: undefined,  // 制造策略
  fmaterialchar: undefined,    // 物料特性
  fproductunitid: undefined,  // 生产计量单位
  fisdemandassign: undefined,  // 需求分配
  fismaxbatchmethod: undefined,  // 是否最大批量法
  fmaxbatchqty: undefined,    // 最大批量
  fisminbatchmethod: undefined,    // 是否最小批量法
  fminbatchqty: undefined,     // 最小批量
  fisroundupmultiple: undefined,     // 是否取整倍数
  fisbatchincmethod: undefined,        // 是否批量增量
  fbatchincqty: undefined,  // 批量增量
  fisbackflush: undefined,   // 是否倒冲
  fproduceleadtime: undefined,    // 提前期(天)
  frecevingleadtime: undefined,       // 收货提前期(天)
  fisquotacontrol: undefined,    // 领料限额控制
  fissmode: undefined,    // 领送料模式
  fissleadtime: undefined,   // 领料提前期
  fissinhightlimit: undefined,   // 领料上限允差
  fissinlowlimit: undefined,   // 领料下限允差
  fplanningmode: undefined,   // 计划方式
  fdutydepartment: undefined,   // 责任部门
  freplacemode: undefined   // 替换方式

})

// 定义制造策略是否禁用的状态
const isPlanStrategyDisabled = ref(false);
// 监听计划类型的变化
watch(() => formData.value.fplanningmode, (newValue: number) => {
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
      await MaterialApi.createPlanInfo(data)
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
  const id = query.id as unknown as number
  if (!id) {
    return
  }
  formLoading.value = true
  try {
    formData.value = await MaterialApi.getPlanInfo(id)
  } finally {
    formLoading.value = false
  }
}

const validate = async () =>{
  try{
    debugger
    // 新增的判断逻辑：如果物料属性是 自制件 时，责任部门必须选择
    if (formData.value.fmaterialattr === 3 && !formData.value.fdutydepartment) {
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
    // 产品单位
    unitList.value = await ProductUnitApi.getProductUnitSimpleList()
    // 加载部门树
    deptList.value = handleTree(await DeptApi.getSimpleDeptList())
    // 获取计划资料信息
    await getPlanInfo()
  })

  defineExpose({
  validate, submitForm
  })
</script>
