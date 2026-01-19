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
          <el-form-item label="采购员" prop="fpurperson">
            <el-select
v-model="formData.fpurperson"
              clearable
              filterable
              placeholder="请选择采购员"
              class="!w-1/1">
              <el-option
                v-for="purchaser in purchaserList"
                :key="purchaser.id"
                :label="purchaser.nickname"
                :value="purchaser.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="供应商" prop="fsupplier">
            <el-select
v-model="formData.fsupplier"
              clearable
              filterable
              placeholder="请选择供应商"
              class="!w-1/1">
              <el-option
                v-for="supplier in supplierList"
                :key="supplier.id"
                :label="supplier.name"
                :value="supplier.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="产地" prop="fproducingarea">
            <el-input v-model="formData.fproducingarea" placeholder="请选择产地" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="生产厂家" prop="fproducefactory">
            <el-input v-model="formData.fproducefactory" placeholder="请选择生产厂家" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="采购策略" prop="fpurchasestrategy">
            <el-input v-model="formData.fpurchasestrategy" placeholder="请选择采购策略" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="计量单位" prop="funitid">
            <el-select v-model="formData.funitid" clearable placeholder="请选择单位" class="w-1/1">
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
          <el-form-item label="参考单价" prop="fprice">
            <el-input type="number" v-model="formData.fprice" placeholder="请选择参考单价" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="可提前天数" prop="fdaydahead">
            <el-input-number v-model="formData.fdaydahead" placeholder="请输入收货可提前天数" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="允许退货" prop="fisreturn">
            <el-radio-group v-model="formData.fisreturn">
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
          <el-form-item label="采购检验" prop="fpurchasecheck">
            <el-select v-model="formData.fpurchasecheck" placeholder="请选择采购检验">
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.ERP_PURCHASE_CHECK_OPTION)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="不控制时间" prop="fisnotcontroltime">
            <el-radio-group v-model="formData.fisnotcontroltime">
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
          <el-form-item label="不控制数量" prop="fisnotcontrolqty">
            <el-radio-group v-model="formData.fisnotcontrolqty">
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
      </el-row>
    </el-form>
</template>


<script lang="ts" setup name="PurchaseInfoForm">
import {onMounted} from 'vue'
import { MaterialApi , PurchaseDTO} from '@/api/erp/product/product'
import { ProductUnitApi, ProductUnitVO } from '@/api/erp/product/unit'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { UserVO } from '@/api/system/user'
import { SupplierApi, SupplierVO } from '@/api/erp/basic/supplier'
import * as UserApi from '@/api/system/user'



const { t } = useI18n() // 国际化
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const { query } = useRoute() // 查询参数
let purchaserList = ref<UserVO[]>([]) // 用户列表
let supplierList = ref<SupplierVO[]>([]) // 用户列表
const message = useMessage() // 消息弹窗
const unitList = ref<ProductUnitVO[]>([]) // 产品单位列表

const formType = ref(query.type)
const formRef = ref()
const formRules = reactive({
  // fpurperson: [{ required: true, message: '采购员不能为空', trigger: 'blur' }]
})

const props = defineProps({
  activeName: String
})

console.log(props.activeName)

const formData = ref({
  fid: undefined,
  fmaterialid: undefined,
  fstatus: undefined,
  fpurperson: undefined,
  fsupplier: undefined,
  fproducingarea: undefined,
  fproducefactory: undefined,
  fpurchasestrategy: undefined,
  fisreturn: undefined,
  funitid: undefined,
  fprice: undefined,
  fdaydahead: undefined,
  fpurchasecheck: undefined,
  fisnotcontroltime: undefined,
  fisnotcontrolqty: undefined,
  fispurchasecheck: undefined,
  creator: undefined,
  createTime: undefined
})

const getPurchaseInfo = async () => {
  const id = query.id as unknown as number
  if (!id) {
    return
  }
  formLoading.value = true
  try {
    formData.value = await MaterialApi.getPurchaseInfo(id)
  } finally {
    formLoading.value = false
  }
}

const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as PurchaseDTO
    if (formType.value === 'create') {
      await MaterialApi.createPurchaseInfo(data)
      message.success(t('common.createSuccess'))
    } else {
      await MaterialApi.updatePurchaseInfo(data)
      // message.success(t('common.updateSuccess'))
    }
    // dialogVisible.value = false
    // 发送操作成功的事件
    // emit('success')
  } finally {
    formLoading.value = false
  }
}

// watch(
//   () => props.table,
//   (table) => {
//     if (!table) return
//     formData.value = table
//   },
//   {
//     deep: true,
//     immediate: true
//   }
// )

onMounted(async () => {
    purchaserList.value = await UserApi.getSimpleUserList()
    supplierList.value = await SupplierApi.getSupplierSimpleList()

    // 产品单位
    unitList.value = await ProductUnitApi.getProductUnitSimpleList()
    // 获取采购资料信息
    await getPurchaseInfo()
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
  // validate: async () => unref(formRef)?.validate(),
  validate,
  submitForm
  })
</script>
