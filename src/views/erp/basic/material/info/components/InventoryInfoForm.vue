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
          <el-form-item label="默认仓库" prop="defaultWarehouseId">
            <el-select v-model="formData.defaultWarehouseId" clearable filterable placeholder="请选择默认仓库" class="!w-1/1">
              <el-option v-for="warehouse in warehouseList" :key="warehouse.id" :label="warehouse.name" :value="warehouse.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="安全库存" prop="qtySafety">
            <el-input-number v-model="formData.qtySafety" placeholder="请填写安全库存" class="!w-1/1"/>
          </el-form-item>
        </el-col>
    </el-row>
<!-- 
    <el-row :gutter="20">
      <el-col :span="12">
          <el-form-item label="最低库存量" prop="qtyMin">
            <el-input-number v-model="formData.qtyMin" placeholder="请填写最低库存量"  class="!w-1/1"/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="最高库存量" prop="qtyMax">
            <el-input-number v-model="formData.qtyMax" placeholder="请填写最高库存量" class="!w-1/1" />
          </el-form-item>
        </el-col>
    </el-row> -->

    <!-- <el-row :gutter="20">
      <el-col :span="12">
          <el-form-item label="允许负库存" prop="isNegative">
            <el-radio-group v-model="formData.isNegative">
              <el-radio v-for="dict in getIntDictOptions(DICT_TYPE.SYSTEM_YES_NO)" :key="dict.value" :value="dict.value" >
                {{ dict.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="保质期" prop="periodValid">
            <el-input-number type="number" v-model="formData.periodValid" placeholder="请填写保质期" class="!w-1/1" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="使用批号管理" prop="isBatchNo">
            <el-radio-group v-model="formData.isBatchNo">
              <el-radio v-for="dict in getIntDictOptions(DICT_TYPE.SYSTEM_YES_NO)" :key="dict.value" :value="dict.value" >
                {{ dict.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
    </el-row> -->

    <!-- <el-row :gutter="20">
      <el-col :span="12">
          <el-form-item label="条码管理" prop="isBarcode">
            <el-radio-group v-model="formData.isBarcode">
              <el-radio v-for="dict in getIntDictOptions(DICT_TYPE.SYSTEM_YES_NO)" :key="dict.value" :value="dict.value" >
                {{ dict.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="出库优先方式" prop="issuePriorityMode">
            <el-select v-model="formData.issuePriorityMode" placeholder="请选择出库优先方式">
              <el-option v-for="dict in getIntDictOptions(DICT_TYPE.ERP_STOCKOUT_PRIORITY_MODE)" :key="dict.value" :label="dict.label" :value="dict.value"  class="!w-1/1"/>
            </el-select>
          </el-form-item>
        </el-col>
      
    </el-row> -->

    <!-- <el-row :gutter="20">
     <el-col :span="12">
          <el-form-item label="保质期管理" prop="isPeriodValid">
            <el-radio-group v-model="formData.isPeriodValid">
              <el-radio v-for="dict in getIntDictOptions(DICT_TYPE.SYSTEM_YES_NO)" :key="dict.value" :value="dict.value" >
                {{ dict.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col> 
       
    </el-row> -->

    <!-- <el-row :gutter="20">
       <el-col :span="12">
          <el-form-item label="保质期单位" prop="periodValidUnit">
            <el-select v-model="formData.periodValidUnit" placeholder="请选择保质期单位">
              <el-option v-for="dict in getIntDictOptions(DICT_TYPE.ERP_EXPIRATION_UNIT)" :key="dict.value" :label="dict.label" :value="dict.value" class="!w-1/1" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="使用序号管理" prop="isSequenceNo">
            <el-radio-group v-model="formData.isSequenceNo">
              <el-radio v-for="dict in getIntDictOptions(DICT_TYPE.SYSTEM_YES_NO)" :key="dict.value" :value="dict.value" >
                {{ dict.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row> -->
  </el-form>
</template>


<script lang="ts" setup name="PurchaseInfoForm">
import {onMounted} from 'vue'
import { MaterialApi, InventoryDTO } from '@/api/erp/basic/material/info'
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
// const formRules = reactive({
//   qtySafety: [{ required: true, message: '安全库存不能为空', trigger: 'blur' }]
// })

const formData = ref({
  id: undefined,
  materialId: query.materialId,
  freezeOrgUnit: undefined,
  qtySafety: undefined,  // 安全库存
  isNegative: undefined,  // 允许负库存
  isBatchNo: undefined,  // 使用批号管理
  isSequenceNo: undefined,    // 使用序列号管理
  isLotNumber: undefined,    // 批次管理
  unitId: undefined,
  isBarcode: undefined,     // 条码管理
  issuePriorityMode: undefined,  // 出库优先方式
  isPeriodValid: undefined,   // 保质期管理
  periodValid: undefined,    // 保质期
  periodValidUnit: undefined,       // 保质期单位
  purchasingAheadDate: undefined,    // 采购提前期(天)
  defaultWarehouseId: undefined,    // 默认仓库
  isCheck: undefined,
  qualityOrgId: undefined

})

const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as InventoryDTO
    if (formType.value === 'create') {
      await MaterialApi.createInventoryInfo(data)
      // message.success(t('common.createSuccess'))
    } else {
      await MaterialApi.createOrUpdateInventoryInfo(data)
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
  const materialId = query.materialId as unknown as number
  if (!materialId) {
    return
  }
  formLoading.value = true
  try {
    const res = await MaterialApi.getInventoryInfo(materialId)
    formData.value = {
      ...formData.value,
      ...res
    }
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