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
        <el-form-item label="采购员" prop="purPersonId">
          <el-select v-model="formData.purPersonId" clearable filterable placeholder="请选择采购员" class="!w-1/1">
            <el-option v-for="purchaser in purchaserList" :key="purchaser.id" :label="purchaser.nickname" :value="purchaser.id"/>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="默认供应商" prop="supplierId">
          <el-select v-model="formData.supplierId" clearable filterable placeholder="请选择默认供应商" class="!w-1/1">
            <el-option v-for="supplier in supplierList" :key="supplier.id" :label="supplier.name" :value="supplier.id" />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="24">
        <el-form-item label="备选供应商">
          <el-select
            v-model="alternateSupplierIds"
            multiple
            filterable
            clearable
            placeholder="可多选；保存时会自动包含默认供应商"
            class="!w-1/1 alternate-supplier-select"
          >
            <el-option v-for="supplier in supplierList" :key="supplier.id" :label="supplier.name" :value="supplier.id" />
          </el-select>
          <div
            v-if="alternateSupplierNamesLine"
            class="mt-6px text-13px text-[var(--el-text-color-secondary)] leading-22px break-words"
          >
            已选：{{ alternateSupplierNamesLine }}
          </div>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="产地" prop="producingArea">
          <el-input v-model="formData.producingArea" placeholder="请输入产地" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="生产厂家" prop="produceFactory">
          <el-input v-model="formData.produceFactory" placeholder="请输入生产厂家" />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="参考单价(元)" prop="price">
          <el-input-number v-model="formData.price" placeholder="请选择参考单价" class="!w-1/1"/>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="可提前天数" prop="daydAhead">
          <el-input-number v-model="formData.daydAhead" placeholder="请输入收货可提前天数" class="!w-1/1"/>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
          <el-form-item label="采购检验" prop="purchaseCheckType">
            <el-select v-model="formData.purchaseCheckType" placeholder="请选择检验类型">
              <el-option v-for="[id, name] in materialPurchasingCheckTypeItem" :key="id" :value="id" :label="name" />
            </el-select>
          </el-form-item>
        </el-col>
        <!-- <el-col :span="12">
        <el-form-item label="指定采购组织" prop="appointPurOrgId">
          <el-input v-model="formData.appointPurOrgId" placeholder="请输入指定采购组织" class="!w-1/1" />
        </el-form-item>
      </el-col> -->
    </el-row>
  <!-- <el-row :gutter="20">
      <el-col :span="12">
      <el-form-item label="采购组" prop="purGroup">
        <el-input v-model="formData.purGroup" placeholder="请输入采购组" class="!w-1/1" />
      </el-form-item>
    </el-col>
  </el-row> -->
  </el-form>
</template>


<script lang="ts" setup name="PurchaseInfoForm">
import { computed, onMounted } from 'vue'
import { MaterialApi, PurchaseDTO } from '@/api/erp/basic/material/info'
import { MaterialSupplierApi } from '@/api/erp/basic/material/materialSupplier'
import { UserVO } from '@/api/system/user'
import { SupplierApi, SupplierVO } from '@/api/erp/basic/supplier'
import * as UserApi from '@/api/system/user'
import { useBasicData } from '@/api/erp/basic/common'
const { materialPurchasingCheckTypeItem } = useBasicData()



const { t } = useI18n() // 国际化
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const { query } = useRoute() // 查询参数
let purchaserList = ref<UserVO[]>([]) // 用户列表
let supplierList = ref<SupplierVO[]>([]) // 用户列表
const message = useMessage() // 消息弹窗

const formType = ref(query.type)
const formRef = ref()
// const formRules = reactive({
//   purPersonId: [{ required: true, message: '采购员不能为空', trigger: 'blur' }]
// })

const props = defineProps({
  activeName: String
})

/** 备选供应商 ID 列表（保存时与默认供应商合并写入扩展表） */
const alternateSupplierIds = ref<number[]>([])

/** 已选供应商完整名称（换行展示，避免折叠看不清） */
const alternateSupplierNamesLine = computed(() => {
  const ids = alternateSupplierIds.value || []
  if (!ids.length) return ''
  const names = ids
    .map((id) => supplierList.value.find((s) => s.id === id)?.name)
    .filter(Boolean) as string[]
  return names.join('、')
})

const formData = ref({
  id: undefined,
  materialId: query.materialId,
  status: undefined,
  purPersonId: undefined,
  supplierId: undefined,
  producingArea: undefined,
  produceFactory: undefined,
  price: undefined,
  priceTop: undefined,
  daydAhead: undefined,
  appointPurOrgId: undefined,
  purchaseCheckType: undefined,
  purGroup: undefined
})

const loadAlternateSuppliers = async () => {
  const materialId = Number(query.materialId)
  if (!materialId) {
    alternateSupplierIds.value = []
    return
  }
  try {
    const ids = await MaterialSupplierApi.list(materialId)
    alternateSupplierIds.value = Array.isArray(ids) ? [...ids] : []
  } catch {
    alternateSupplierIds.value = []
  }
}

const getPurchaseInfo = async () => {
  const materialId = query.materialId as unknown as number
  if (!materialId) {
    return
  }
  formLoading.value = true
  try {
    try {
      const res = await MaterialApi.getPurchaseInfo(materialId)
      if (res) {
        formData.value = {
          ...formData.value,
          ...res
        }
      }
    } catch {
      /* 无采购属性时接口可能异常，忽略 */
    }
    await loadAlternateSuppliers()
    const defSid = formData.value.supplierId
    if (defSid != null && !alternateSupplierIds.value.includes(defSid as number)) {
      alternateSupplierIds.value = [defSid as number, ...alternateSupplierIds.value]
    }
  } finally {
    formLoading.value = false
  }
}

watch(
  () => formData.value.supplierId,
  (sid) => {
    if (sid == null || sid === undefined) return
    const arr = alternateSupplierIds.value || []
    if (!arr.includes(sid as number)) {
      alternateSupplierIds.value = [...arr, sid as number]
    }
  }
)

const submitForm = async () => {
  await formRef.value.validate()
  formLoading.value = true
  try {
    const data = formData.value as unknown as PurchaseDTO
    const materialId = Number(query.materialId)
    if (formType.value === 'create') {
      await MaterialApi.createPurchaseInfo(data)
      message.success(t('common.createSuccess'))
    } else {
      await MaterialApi.createOrUpdatePurchaseInfo(data)
    }
    if (materialId) {
      await MaterialSupplierApi.sync({
        materialId,
        supplierIds: alternateSupplierIds.value || []
      })
    }
  } finally {
    formLoading.value = false
  }
}

onMounted(async () => {
    purchaserList.value = await UserApi.getSimpleUserList()
    supplierList.value = await SupplierApi.getSupplierSimpleList()
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

<style scoped>
/* 多选标签自动换行，尽量在框内展示更多 */
.alternate-supplier-select :deep(.el-select__tags) {
  flex-wrap: wrap;
  max-width: 100%;
}
.alternate-supplier-select :deep(.el-select__tags-text) {
  max-width: none;
}
</style>