<!-- ERP 产品的新增/修改 -->
<template>
  <ContentWrap v-loading="formLoading">
    <el-tabs v-model="activeName">
      <el-tab-pane label="基本信息" name="basicInfo">
        <basic-info-form ref="basicInfoRef" :formType="formType" :activeName="activeName" />
      </el-tab-pane>
      <el-tab-pane label="采购信息" name="purchase">
        <purchase-info-form ref="purchaseInfoRef" :formType="formType" :activeName="activeName"/>
      </el-tab-pane>
      <el-tab-pane label="库存信息" name="inventory">
        <inventory-info-form
          ref="inventoryInfoRef"
          :formType="formType"
          :activeName="activeName"
        />
      </el-tab-pane>
      <el-tab-pane label="计划信息" name="plan">
        <plan-info-form ref="planInfoRef" :formType="formType" :activeName="activeName"/>
      </el-tab-pane>
    </el-tabs>
    <el-form>
      <el-form-item style="float: right">
        <el-button :loading="formLoading" type="primary" @click="submitForm">保存</el-button>
        <el-button @click="close">返回</el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>
</template>
<script lang="ts" setup>



import { useTagsViewStore } from '@/store/modules/tagsView'
import { BasicInfoForm, InventoryInfoForm, PurchaseInfoForm, PlanInfoForm } from './components'
import * as ProductApi from '@/api/erp/product/product'

defineOptions({ name: 'ErpProductEdit' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗
const { push, currentRoute } = useRouter() // 路由
const { query } = useRoute() // 查询参数
const { delView } = useTagsViewStore() // 视图操作

const formType = ref(query.type)   // 新增OR修改
console.log(formType.value)

const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const activeName = ref('basicInfo') // Tag 激活的窗口
const basicInfoRef = ref<ComponentRef<typeof BasicInfoForm>>()
const purchaseInfoRef = ref<ComponentRef<typeof PurchaseInfoForm>>()
const inventoryInfoRef = ref<ComponentRef<typeof InventoryInfoForm>>()
const planInfoRef = ref<ComponentRef<typeof PlanInfoForm>>()
const formData = ref<ProductApi.MaterialUpdateReqDTO>({
  inventoryInfo: {},
  purchaseInfo: {},
  planInfo: {}

})

/** 提交按钮 */
const submitForm = async () => {
  // 参数校验
  if (!unref(formData)) return
  debugger
 let checkResult =  await unref(basicInfoRef)?.validate()
 if(!checkResult){
  activeName.value = "basicInfo"
  return
 }
 checkResult =  await unref(purchaseInfoRef)?.validate()
 if(!checkResult){
  activeName.value = "purchase"
  return
 }
 checkResult =  await unref(inventoryInfoRef)?.validate()
 if(!checkResult){
  activeName.value = "inventory"
  return
 }
 checkResult =  await unref(planInfoRef)?.validate()
 if(!checkResult){
  activeName.value = "plan"
  return
 }
  try {
    // 提交请求
    await unref(basicInfoRef)?.submitForm()
    await unref(purchaseInfoRef)?.submitForm()
    await unref(inventoryInfoRef)?.submitForm()
    await unref(planInfoRef)?.submitForm()
    // console.log(formData.value)
    // message.success(t('common.updateSuccess'))
    close()
  } catch {}
}

/** 关闭按钮 */
const close = () => {
  delView(unref(currentRoute))
  push('/erp/material/view')
}

/** 初始化 */
onMounted(() => {
  // getDetail()
})
</script>
