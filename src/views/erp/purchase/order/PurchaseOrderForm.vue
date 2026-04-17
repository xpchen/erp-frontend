<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="90%">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
      :disabled="disabled"
    >
      <el-row :gutter="20">
        <!-- 第一列内容 -->
        <el-col :span="16">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="订单单号" prop="no">
                <el-input disabled v-model="formData.no" placeholder="保存时自动生成" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="订单时间" prop="orderTime">
                <el-date-picker
                  v-model="formData.orderTime"
                  type="date"
                  value-format="x"
                  placeholder="选择订单时间"
                  class="!w-1/1"
                />
              </el-form-item>
            </el-col>
            <!-- 将供应商表单项移动到订单时间后面 -->
            <el-col :span="8">
              <el-form-item label="供应商" prop="supplierId">
                <el-select
                  v-model="formData.supplierId"
                  clearable
                  filterable
                  class="!w-220px"
                  :disabled="supplierSelectDisabled"
                  :placeholder="supplierSelectPlaceholder"
                >
                  <el-option
                    v-for="opt in headerSupplierOptions"
                    :key="opt.id"
                    :value="opt.id"
                    :label="opt.name"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="备注" prop="remark">
                <el-input
                  v-model="formData.remark"
                  placeholder=""
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="附件" prop="fileUrl">
                <UploadFile :is-show-tip="false" v-model="formData.fileUrl" :limit="1" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-col>
        <!-- 二维码列，横跨两行 -->
        <el-col :span="8">
          <el-form-item>
            <qrcode-vue :value="formData.no" :size="100" v-if="formData.no"/>
          </el-form-item>
        </el-col>
      </el-row>
      <!-- 子表的表单 -->
      <ContentWrap>
        <el-tabs v-model="subTabsName" class="-mt-15px -mb-10px">
          <el-tab-pane label="订单物料清单" name="item">
            <PurchaseOrderItemForm
              ref="itemFormRef"
              :items="formData.items"
              :disabled="disabled"
              :supplier-id="formData.supplierId"
              @supplier-change="handleDetailSupplierChange"
            />
          </el-tab-pane>
        </el-tabs>
      </ContentWrap>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="优惠率（%）" prop="discountPercent">
            <el-input-number
              v-model="formData.discountPercent"
              controls-position="right"
              :min="0"
              :precision="2"
              placeholder="请输入优惠率"
              class="!w-1/1"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="付款优惠" prop="discountPrice">
            <el-input
              disabled
              v-model="formData.discountPrice"
              :formatter="erpPriceInputFormatter"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="优惠后金额">
            <el-input disabled v-model="formData.totalPrice" :formatter="erpPriceInputFormatter" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="结算账户" prop="accountId">
            <el-select v-model="formData.accountId"  clearable filterable placeholder="请选择结算账户" class="!w-220px" >
              <el-option v-for="[id, name] in accountItem" :key="id" :value="id" :label="name" />
            </el-select> 
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="支付订金" prop="depositPrice">
            <el-input-number
              v-model="formData.depositPrice"
              controls-position="right"
              :min="0"
              :precision="2"
              placeholder="请输入支付订金"
              class="!w-1/1"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading" v-if="!disabled">
        确 定
      </el-button>
      <!-- 添加打印按钮 -->
      <el-button @click="printPage" type="info">打 印</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { PurchaseOrderApi, PurchaseOrderVO, RequestItem } from '@/api/erp/purchase/order'
import { MaterialSupplierApi } from '@/api/erp/basic/material/materialSupplier'
import PurchaseOrderItemForm from './components/PurchaseOrderItemForm.vue'
import { erpPriceInputFormatter, erpPriceMultiply } from '@/utils'
import { useBasicData } from '@/api/erp/basic/common'
import QrcodeVue from 'qrcode.vue' // 引入二维码生成组件

const { supplierItem, accountItem, defaultAccountId } = useBasicData()

/** ERP 销售订单表单 */
defineOptions({ name: 'PurchaseOrderForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改；detail - 详情
const formData = ref({
  id: undefined,
  supplierId: undefined,
  accountId: undefined,
  orderTime: new Date().getTime(),
  remark: undefined,
  fileUrl: '',
  discountPercent: 0,
  discountPrice: 0,
  totalPrice: 0,
  depositPrice: 0,
  items: [],
  no: undefined // 订单单号，后端返回
})
const formRules = reactive({
  supplierId: [{ required: true, message: '供应商不能为空', trigger: 'blur' }],
  orderTime: [{ required: true, message: '订单时间不能为空', trigger: 'blur' }]
})
const disabled = computed(() => formType.value === 'detail')
const formRef = ref() // 表单 Ref

/** 子表的表单 */
const subTabsName = ref('item')
const itemFormRef = ref()
const skipSupplierWatch = ref(false)

/** 各已选物料「默认+备选」供应商交集（与明细下拉一致） */
const getOrderLevelAllowedSupplierIds = (items: any[] | undefined) => {
  const rows = (items || []).filter((r: any) => r.materialId)
  if (!rows.length) return []
  let ids = new Set<number>(rows[0].allowedSupplierIds || [])
  for (let i = 1; i < rows.length; i++) {
    const next = new Set<number>(rows[i].allowedSupplierIds || [])
    ids = new Set([...ids].filter((id) => next.has(id)))
  }
  return Array.from(ids).sort((a, b) => a - b)
}

const headerSupplierOptions = computed(() => {
  const allowed = getOrderLevelAllowedSupplierIds(formData.value.items)
  const opts = allowed.map((id) => ({
    id,
    name: supplierItem.value.get(id) ?? `供应商#${id}`
  }))
  const sidRaw = formData.value.supplierId
  if (sidRaw != null) {
    const sid = Number(sidRaw)
    if (!opts.some((o) => o.id === sid)) {
      const baseName = supplierItem.value.get(sid) ?? `供应商#${sid}`
      const hint =
        allowed.length === 0
          ? '（物料未维护供应商，请维护主数据）'
          : '（不在可选范围，请重选或维护主数据）'
      opts.push({ id: sid, name: baseName + hint })
    }
  }
  return opts
})

const materialRowsInItems = computed(() =>
  (formData.value.items || []).filter((r: any) => r.materialId)
)

const supplierSelectDisabled = computed(() => {
  if (disabled.value) return true
  if (!materialRowsInItems.value.length) return true
  return headerSupplierOptions.value.length === 0
})

const supplierSelectPlaceholder = computed(() => {
  if (disabled.value) return '请选择供应商'
  if (!materialRowsInItems.value.length) return '请先添加并选择物料'
  if (!headerSupplierOptions.value.length) return '请维护物料默认/备选供应商'
  return '请选择供应商'
})

/** 计算 discountPrice、totalPrice 价格 */
watch(
  () => formData.value,
  (val) => {
    if (!val) {
      return
    }
    const totalPrice = val.items.reduce((prev, curr) => prev + curr.totalPrice, 0)
    const discountPrice =
      val.discountPercent != null ? erpPriceMultiply(totalPrice, val.discountPercent / 100.0) : 0
    formData.value.discountPrice = discountPrice
    formData.value.totalPrice = totalPrice - discountPrice
  },
  { deep: true }
)

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  skipSupplierWatch.value = true
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type) + '采购订单'
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await PurchaseOrderApi.getPurchaseOrder(id)
    } finally {
      formLoading.value = false
    }
  }
  if (defaultAccountId.value) {
    formData.value.accountId = defaultAccountId.value
  }
  nextTick(() => {
    skipSupplierWatch.value = false
  })
}

/***
 * 采购申请单下推场合
 */
const openForPush = async (type: string, requestItems: RequestItem[]) => {
  skipSupplierWatch.value = true
  dialogVisible.value = true
  dialogTitle.value = t('action.' + "create") + '采购订单'
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (requestItems) {
    formLoading.value = true
    try {
      formData.value.items = await PurchaseOrderApi.getPurchaseRequestItemsListByRequestIds(requestItems)
    } finally {
      formLoading.value = false
    }
  }
  if (defaultAccountId.value) {
    formData.value.accountId = defaultAccountId.value
  }
  nextTick(() => {
    skipSupplierWatch.value = false
  })
}

defineExpose({ open, openForPush }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调

const getErrorMessage = (error: any, fallback = '操作失败') => {
  return error?.msg || error?.message || error?.response?.data?.msg || fallback
}

const getUniqueMaterialIds = () => {
  const ids = (formData.value.items || [])
    .map((item: any) => Number(item.materialId))
    .filter((id: number) => Number.isFinite(id) && id > 0)
  return Array.from(new Set(ids))
}

const checkSupplierSupport = async (supplierId?: number) => {
  if (!supplierId) {
    return { unsupportedMaterialIds: [], unsupportedMaterialNames: [] }
  }
  const materialIds = getUniqueMaterialIds()
  if (!materialIds.length) {
    return { unsupportedMaterialIds: [], unsupportedMaterialNames: [] }
  }
  return await MaterialSupplierApi.checkSupport({ supplierId, materialIds })
}

const ensureSupplierSupportBeforeSubmit = async () => {
  const supplierId = formData.value.supplierId
  if (!supplierId) {
    return true
  }
  const supportResult = await checkSupplierSupport(supplierId)
  if (!supportResult.unsupportedMaterialIds?.length) {
    return true
  }
  const unsupportedNames = supportResult.unsupportedMaterialNames?.join('、') || supportResult.unsupportedMaterialIds.join('、')
  message.error(`当前供应商不支持以下物料：${unsupportedNames}`)
  return false
}

const handleDetailSupplierChange = (supplierId?: number) => {
  if (disabled.value) return
  if (formData.value.supplierId === supplierId) return
  formData.value.supplierId = supplierId
}

const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  await itemFormRef.value.validate()
  const items = formData.value.items || []
  for (const item of items) {
    if (!item.materialId) continue
    if (!item.allowedSupplierIds?.length) {
      message.error(
        `物料「${item.materialName || item.materialId}」未维护默认或备选供应商，请先在物料采购属性中维护后再保存。`
      )
      return
    }
  }
  const allowed = getOrderLevelAllowedSupplierIds(items)
  const sid = formData.value.supplierId != null ? Number(formData.value.supplierId) : NaN
  if (!Number.isFinite(sid) || !allowed.includes(sid)) {
    message.error('请选择供应商，且必须为当前各物料默认/备选供应商的交集。若无交集，请调整物料或主数据。')
    return
  }
  if (!(await ensureSupplierSupportBeforeSubmit())) {
    return
  }
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as PurchaseOrderVO
    if (formType.value === 'create' || formType.value === 'push') {
      await PurchaseOrderApi.createPurchaseOrder(data)
      message.success(t('common.createSuccess'))
    } else {
      await PurchaseOrderApi.updatePurchaseOrder(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } catch (error: any) {
    message.error(getErrorMessage(error))
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  skipSupplierWatch.value = true
  formData.value = {
    id: undefined,
    supplierId: undefined,
    accountId: undefined,
    orderTime: new Date().getTime(),
    remark: undefined,
    fileUrl: undefined,
    discountPercent: 0,
    discountPrice: 0,
    totalPrice: 0,
    depositPrice: 0,
    items: []
  }
  formRef.value?.resetFields()
  nextTick(() => {
    skipSupplierWatch.value = false
  })
}

/** 打印当前页面 */
const printPage = () => {
  window.print();
};
</script>

<style scoped>
/* 正常显示样式 */

/* 打印样式 */
@media print {
  /* 隐藏不需要打印的元素，例如按钮 */
  .el-button {
    display: none;
  }

  /* 调整表格样式 */
  .el-table {
    width: 100%;
    border-collapse: collapse;
  }

  /* 其他样式调整 */

  /* ... */
}
</style>