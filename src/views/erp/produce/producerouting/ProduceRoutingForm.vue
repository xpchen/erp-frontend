<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" :width="dialogWidth">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="路线名称" prop="routingName">
        <el-input v-model="formData.routingName" placeholder="请输入工艺路线名称" />
      </el-form-item>
      <!--增加一个物料ID的隐藏输入框-->
      <el-form-item label="物料内码" prop="materialId" v-show="false">
        <el-input v-model="formData.materialId" readonly/>  
      </el-form-item>
      <el-form-item label="物料编码" prop="materialNumber">
        <el-input v-model="formData.materialNumber" placeholder="请输入物料编码" @click="openMaterialDrawer"/>
        <el-drawer v-model="drawer" title="物料选择" :direction="direction" size="48%" :modal-append-to-body="true" :append-to-body="true">
            <QueryMaterialIndex @select="handleMaterialSelect" />
        </el-drawer>
      </el-form-item>
      <!--增加物料名称-->
      <el-form-item label="物料名称" prop="materialName">
        <el-input v-model="formData.materialName" readonly />  
      </el-form-item>
      <el-form-item label="总耗时" prop="totalLeadTime">
        <el-input v-model="formData.totalLeadTime" readonly /> 
      </el-form-item>
      <el-form-item label="总工价" prop="totalProcessPrice">
        <el-input v-model="formData.totalProcessPrice" readonly />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input v-model="formData.description"/>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio
            v-for="dict in getIntDictOptions(DICT_TYPE.SYSTEM_STATUS_OK_NG)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
 
    </el-form>
    <!-- 子表的表单 -->
    <el-tabs v-model="subTabsName">
      <el-tab-pane label="工艺路线明细" name="produceRoutingDetail">
        <ProduceRoutingDetailForm 
          ref="produceRoutingDetailFormRef" 
          :routing-id="formData.id" 
          @input-change="calculateTotal"/>
      </el-tab-pane>
    </el-tabs>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { ProduceRoutingApi, ProduceRoutingVO } from '@/api/erp/produce/producerouting'
import ProduceRoutingDetailForm from './components/ProduceRoutingDetailForm.vue'
import { MaterialDTO } from '@/api/erp/basic/material/info'
import QueryMaterialIndex  from '@/views/erp/basic/material/info/components/QueryMaterialIndex.vue'
import type { DrawerProps } from 'element-plus'

/** 工艺路线 表单 */
defineOptions({ name: 'ProduceRoutingForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const dialogWidth = ref('50%') // 默认宽度
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const direction = ref<DrawerProps['direction']>('rtl')
const formData = ref<any>({
  id: undefined,
  routingName: undefined,
  materialId: undefined,
  materialNumber: undefined,
  materialName: undefined,
  description: undefined,
  status: undefined,
  totalLeadTime: undefined,
  totalProcessPrice: undefined,
})
const formRules = reactive({
  routingName: [{ required: true, message: '工艺路线名称不能为空', trigger: 'blur' }],
  materialNumber: [{ required: true, message: '物料编码不能为空', trigger: 'blur' }],
})
const formRef = ref() // 表单 Ref

const drawer = ref(false)

const openMaterialDrawer = (row: any) => {
  drawer.value = true        // 打开抽屉
}

const calculateTotal = () => {
  debugger
  const details = produceRoutingDetailFormRef.value.getData();
  let totalLeadTime = 0;
  let totalProcessPrice = 0;

  details.forEach((detail) => {
    totalLeadTime += Number(detail.leadDay) || 0;
    totalProcessPrice += Number(detail.processPrice) || 0;
  });

  if(details.length > 0){
    formData.value.totalLeadTime = totalLeadTime;
    formData.value.totalProcessPrice = totalProcessPrice;
  }
  
};

// 初始加载数据时计算一次
watch(
  () => formData.value.id,
  () => {
    if (formData.value.id) {
      calculateTotal();
    }
  },
  { immediate: true }
);

/** 处理物料选择 */
const handleMaterialSelect = (material: MaterialDTO) => {
  formData.value.materialNumber = material.barCode // 设置物料编码
  formData.value.materialId = material.id // 设置物料内码
  formData.value.materialName = material.name // 设置物料名称
  drawer.value = false  // 关闭抽屉
}

/** 子表的表单 */
const subTabsName = ref('produceRoutingDetail')
const produceRoutingDetailFormRef = ref()

/** 打开弹窗 */
const open = async (type: string, id?: number, width?: string) => {
  dialogVisible.value = true
  dialogWidth.value = width || '80%'
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await ProduceRoutingApi.getProduceRouting(id)
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
    const result = await produceRoutingDetailFormRef.value.validate()
    if(!result){
      return
    }
  } catch (e) {
    subTabsName.value = 'produceRoutingDetail'
    return
  }
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as ProduceRoutingVO
    // 拼接子表的数据
    data.produceRoutingDetails = produceRoutingDetailFormRef.value.getData()
    debugger
    if (formType.value === 'create') {
      await ProduceRoutingApi.createProduceRouting(data)
      message.success(t('common.createSuccess'))
    } else {
      await ProduceRoutingApi.updateProduceRouting(data)
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
    routingName: undefined,
    materialId: undefined,
    description: undefined,
    status: undefined,
    totalLeadTime: undefined,
    totalProcessPrice: undefined,
  }
  formRef.value?.resetFields()
}
</script>