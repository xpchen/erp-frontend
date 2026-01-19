<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="80%">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
      :disabled="disabled"
    >
      <!-- 第一行 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="单据编号" prop="no">
            <el-input disabled v-model="formData.no" placeholder="保存时自动生成" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="业务日期" prop="bizDate">
            <el-date-picker
              v-model="formData.bizDate"
              type="date"
              value-format="x"
              placeholder=""
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="金额合计" prop="totalAmount">
            <el-input v-model="formData.totalAmount" placeholder="" readonly/>
          </el-form-item>
        </el-col>
      </el-row>
      <!-- 第二行 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="申请人" prop="personId">
            <el-select 
              v-model="formData.personId" 
              clearable 
              style="width: 100%"
              filterable 
            >
              <el-option
                v-for="item in userList"
                :key="item.id"
                :label="item.nickname"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <!-- <el-col :span="8">
          <el-form-item label="是否加急" prop="isUrgent" v-if="false">
            <el-input v-model="formData.isUrgent" placeholder="" />
          </el-form-item>
        </el-col> -->
        <el-col :span="8">
          <el-form-item label="申请部门" prop="deptId">
            <el-tree-select v-model="formData.deptId" :data="deptList" :props="defaultProps" check-strictly clearable filterable node-key="id" placeholder="请选择责任部门" />
          
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="需求类型" prop="demandType">
            <el-select v-model="formData.demandType"  clearable filterable placeholder="请选择需求类型" class="!w-220px" >
              <el-option v-for="[id, name] in purchaseDemandTypeItem" :key="id" :value="id" :label="name" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <!-- 第三行 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="税额合计" prop="totalTax">
            <el-input v-model="formData.totalTax" placeholder="" readonly/>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="价税合计" prop="totalTaxAmount">
            <el-input v-model="formData.totalTaxAmount" placeholder="" readonly/>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="状态" prop="status" v-show="false">
            <el-radio-group v-model="formData.status">
              <el-radio value="1">请选择字典生成</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      <el-tabs v-model="subTabsName">
        <el-tab-pane label="采购申请单明细" name="purchaseRequestItems">
          <PurchaseRequestItemsForm 
            ref="purchaseRequestItemsFormRef" 
            :request-id="formData.id" 
            @items-changed="handleItemsChanged"
            :disabled="disabled"
          />
        </el-tab-pane>
      </el-tabs>
    </el-form>
    <!-- 子表的表单 -->
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading" v-if="!disabled">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { PurchaseRequestApi, PurchaseRequestVO } from '@/api/erp/purchaserequest'
import PurchaseRequestItemsForm from './components/PurchaseRequestItemsForm.vue'
import * as UserApi from '@/api/system/user'
import * as DeptApi from '@/api/system/dept'
import { getUserProfile, ProfileVO } from '@/api/system/user/profile'
import { defaultProps, handleTree } from '@/utils/tree'
import { erpPriceMultiply } from '@/utils'
import { useBasicData } from '@/api/erp/basic/common'
const { purchaseDemandTypeItem } = useBasicData()

/** 采购申请单 表单 */
defineOptions({ name: 'PurchaseRequestForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗


const userList = ref<UserApi.UserVO[]>([]) // 用户列表
const deptList = ref<Tree[]>([]) // 树形结构的部门列表
const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData: any = ref({
  id: undefined,
  no: undefined,
  bizDate: new Date().getTime(),
  totalAmount: undefined,
  personId: undefined,
  isUrgent: undefined,
  deptId: undefined,
  demandType: '0',
  totalTax: undefined,
  totalTaxAmount: undefined,
  status: undefined,
})
const formRules = reactive({
})
const formRef = ref() // 表单 Ref
const userInfo = ref({} as ProfileVO)

/** 子表的表单 */
const disabled = computed(() => formType.value === 'detail')
const subTabsName = ref('purchaseRequestItems')
const purchaseRequestItemsFormRef = ref()

const getUserInfo = async () => {
  const users = await getUserProfile()
  userInfo.value = users
}
/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 加载部门树
  deptList.value = handleTree(await DeptApi.getSimpleDeptList())
  await getUserInfo()
  formData.value.personId = userInfo.value.id
  formData.value.deptId = userInfo.value.dept.id
  userList.value = await UserApi.getSimpleUserList()
 
  
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await PurchaseRequestApi.getPurchaseRequest(id)
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
  // 校验子表单
  try {
    await purchaseRequestItemsFormRef.value.validate()
  } catch (e) {
    subTabsName.value = 'purchaseRequestItems'
    return
  }
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as PurchaseRequestVO
    // 拼接子表的数据
    data.purchaseRequestItemss = purchaseRequestItemsFormRef.value.getData()
    if (formType.value === 'create' ) {
      await PurchaseRequestApi.createPurchaseRequest(data)
      message.success(t('common.createSuccess'))
    } else {
      await PurchaseRequestApi.updatePurchaseRequest(data)
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
    no: undefined,
    bizDate: new Date().getTime(),
    totalAmount: undefined,
    personId: undefined,
    isUrgent: undefined,
    deptId: undefined,
    demandType: 0,
    totalTax: undefined,
    totalTaxAmount: undefined,
    status: undefined,
  }
  formRef.value?.resetFields()
}

/**
 * 处理 PurchaseRequestItemsForm 组件明细行变化事件
 * @param items 明细行数据
 */
const handleItemsChanged = (items) => {
  let totalAmount = 0;
  let totalTax = 0;
  let totalTaxAmount = 0;

  items.forEach(item => {
    totalAmount += item.amount || 0;
    totalTax += erpPriceMultiply(item.amount, item.tax / 100.0) || 0;
    totalTaxAmount += (totalAmount || 0) + (totalTax || 0);
  });

  formData.value.totalAmount = totalAmount;
  formData.value.totalTax = totalTax;
  formData.value.totalTaxAmount = totalTaxAmount;
};
</script>