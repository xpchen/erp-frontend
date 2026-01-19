<template>
  <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="默认仓库" prop="fdefaultwarehouseid">
            <el-select
v-model="formData.fdefaultwarehouseid"
              clearable
              filterable
              placeholder="请选择默认仓库"
              class="!w-1/1">
              <el-option
                v-for="warehouse in warehouseList"
                :key="warehouse.id"
                :label="warehouse.name"
                :value="warehouse.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="安全库存" prop="fqtysafety">
            <el-input-number v-model="formData.fqtysafety" placeholder="请填写安全库存"/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="最低库存量" prop="fqtymin">
            <el-input-number v-model="formData.fqtymin" placeholder="请填写最低库存量" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="最高库存量" prop="fqtymax">
            <el-input-number v-model="formData.fqtymax" placeholder="请填写最高库存量" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="库存下限天数" prop="fdaysbottom">
            <el-input-number v-model="formData.fdaysbottom" placeholder="请填写库存下限天数" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="库存上限天数" prop="fdaystop">
            <el-input-number v-model="formData.fdaystop" placeholder="请填写库存上限天数" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="最大周转天数" prop="fdaysturnover">
            <el-input-number type="number" v-model="formData.fdaysturnover" placeholder="请填写最大周转天数" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="允许负库存" prop="fisnegative">
            <el-radio-group v-model="formData.fisnegative">
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
          <el-form-item label="使用批号管理" prop="fisbatchno">
            <el-radio-group v-model="formData.fisbatchno">
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
          <el-form-item label="使用序号管理" prop="fissequenceno">
            <el-radio-group v-model="formData.fissequenceno">
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
          <el-form-item label="条码管理" prop="fisbarcode">
            <el-radio-group v-model="formData.fisbarcode">
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
          <el-form-item label="最小包装量" prop="fqtyminpackage">
            <el-input-number v-model="formData.fqtyminpackage" placeholder="请填写最小包装量" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="组合件" prop="fiscompages">
            <el-radio-group v-model="formData.fiscompages">
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
          <el-form-item label="出库优先方式" prop="fissueprioritymode">
            <el-select v-model="formData.fissueprioritymode" placeholder="请选择出库优先方式">
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.ERP_STOCKOUT_PRIORITY_MODE)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="保质期管理" prop="fisperiodvalid">
            <el-radio-group v-model="formData.fisperiodvalid">
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
          <el-form-item label="保质期" prop="fperiodvalid">
            <el-input-number type="number" v-model="formData.fperiodvalid" placeholder="请填写保质期" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="保质期单位" prop="fperiodvalidunit">
            <el-select v-model="formData.fperiodvalidunit" placeholder="请选择保质期单位">
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.ERP_EXPIRATION_UNIT)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
</template>


<script lang="ts" setup name="PurchaseInfoForm">
import {onMounted} from 'vue'
import { MaterialApi, InventoryDTO } from '@/api/erp/product/product'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { UserVO } from '@/api/system/user'
import { WarehouseApi, WarehouseVO } from '@/api/erp/stock/warehouse'
import * as UserApi from '@/api/system/user'

const { t } = useI18n() // 国际化
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const { query } = useRoute() // 查询参数
const message = useMessage() // 消息弹窗
let purchaserList = ref<UserVO[]>([]) // 用户列表
let warehouseList = ref<WarehouseVO[]>([]) // 供应商列表

const formType = ref(query.type)
const formRef = ref() // 表单 Ref
const formRules = reactive({
})

const formData = ref({
  fid: undefined,
  fmaterialid: undefined, // 物料编码
  fqtysafety: undefined,  // 安全库存
  fqtymin: undefined,    // 最低库存量
  fqtymax: undefined,    // 最高库存量
  fdaysbottom: undefined,  // 库存下限天数
  fdaystop: undefined,    // 库存上限天数
  fdaysturnover: undefined,  // 最大周转天数
  fisnegative: undefined,  // 允许负库存
  fisbatchno: undefined,  // 使用批号管理
  fissequenceno: undefined,    // 使用序列号管理
  fislotnumber: undefined,    // 批次管理
  fisbarcode: undefined,     // 条码管理
  fqtyminpackage: undefined,     // 最小包装量
  fiscompages: undefined,        // 组合件
  fissueprioritymode: undefined,  // 出库优先方式
  fisperiodvalid: undefined,   // 保质期管理
  fperiodvalid: undefined,    // 保质期
  fperiodvalidunit: undefined,       // 保质期单位
  fpurchasingaheaddate: undefined,    // 采购提前期(天)
  fdefaultwarehouseid: undefined,    // 默认仓库
  fclosedatecalmode: undefined   // 到期日计算方式

})

const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    debugger
    const data = formData.value as unknown as InventoryDTO
    if (formType.value === 'create') {
      await MaterialApi.createInventoryInfo(data)
      // message.success(t('common.createSuccess'))
    } else {
      await MaterialApi.updateInventoryInfo(data)
      // message.success(t('common.updateSuccess'))
    }
    // dialogVisible.value = false
    // 发送操作成功的事件
    // emit('success')
  } finally {
    formLoading.value = false
  }
}

const getInventoryInfo = async () => {
  const id = query.id as unknown as number
  if (!id) {
    return
  }
  formLoading.value = true
  try {
    debugger
    formData.value = await MaterialApi.getInventoryInfo(id)
  }finally {
    formLoading.value = false
  }
}

const validate = async () =>{
  try{
    await unref(formRef)?.validate()
  }catch{
    return false
  }
    return true
}

onMounted(async () => {
    // 获取库存资料信息
    await getInventoryInfo()
    purchaserList.value = await UserApi.getSimpleUserList()
    warehouseList.value = await WarehouseApi.getWarehouseSimpleList()
  })
  defineExpose({
    validate,
    submitForm
  })
</script>
