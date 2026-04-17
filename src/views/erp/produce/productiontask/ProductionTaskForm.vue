<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="1500">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" v-loading="formLoading">

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="任务编码:" prop="productionTaskNo">
            <el-input v-model="formData.productionTaskNo" placeholder="保存时自动生成" disabled/>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="计划生产数量:" prop="plannedQuantity" label-width="115px">
            <el-input-number v-model="formData.plannedQuantity" placeholder="请输入计划生产数量"  class="!w-1/1"/>
          </el-form-item>
        </el-col>
         <el-col :span="8">
          <el-form-item label="工艺路线:" prop="produceRoutingId">
            <el-select v-model="formData.produceRoutingId"  clearable filterable placeholder="请选择工艺路线"  @focus="fetchProcessRoutes" :loading="routingLoading" disabled>
              <el-option v-for="[id, name] in produceRoutingItem" :key="id" :value="id" :label="name" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="物料:" prop="materialName">
            <el-input v-model="formData.materialName" placeholder="点击选择物料" readonly @click="openMaterialDrawer"/>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="物料编码:" prop="materialNumber">
            <el-input v-model="formData.materialNumber" placeholder="物料编码" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="物料规格:" prop="materialSpec">
            <el-input v-model="formData.materialSpec" placeholder="物料规格" readonly />
          </el-form-item>
        </el-col>

      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="物料单位:" prop="materialUnit">
            <el-input v-model="formData.materialUnit" placeholder="物料单位" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="开工时间:" prop="startDate">
            <el-date-picker v-model="formData.startDate" type="date" value-format="x" placeholder="选择开工时间"   class="!w-1/1"/>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="完工时间:" prop="endDate">
            <el-date-picker v-model="formData.endDate" type="date" value-format="x" placeholder="选择完工时间"  class="!w-1/1"/>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        
        <!-- <el-col :span="8">
          <el-form-item label="主计划编码:" prop="productMainPlanNo">
            <el-input v-model="formData.productMainPlanNo" placeholder="请输入主计划编码" />
          </el-form-item>
        </el-col> -->
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="实际生产数量:" prop="actualQuantity" label-width="120px">
            <el-input v-model="formData.actualQuantity" placeholder="实际生产数量" readonly/>
          </el-form-item>
        </el-col>
        <el-col :span="16">
          <el-form-item label="备注:" prop="remark">
            <el-input type="textarea" v-model="formData.remark" :rows="3" placeholder="请输入备注"/>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <!-- 物料选择抽屉 -->
    <el-drawer v-model="drawerVisible" title="物料选择" :direction="direction" size="48%" :modal-append-to-body="true" :append-to-body="true">
      <QueryMaterialIndex @select="handleMaterialSelect" />
    </el-drawer>

    <!-- 子表的表单 -->
    <el-tabs v-model="subTabsName">
      <el-tab-pane label="物料需求计划列表" name="productionTaskMaterial">
        <ProductionTaskMaterialForm ref="productionTaskMaterialFormRef" 
        :production-task-id="formData.id" 
      />
      </el-tab-pane>
      <el-tab-pane label="工序计划列表" name="productionTaskProcesses">
        <ProductionTaskProcessesForm ref="productionTaskProcessesFormRef" :production-task-id="formData.id" />
      </el-tab-pane>
    </el-tabs>
    <template #footer>
      <el-button v-if="subTabsName === 'productionTaskMaterial'" @click="openStockOutReqForm" type="primary">
        领 料
      </el-button>
      <!-- 添加退料按钮 -->
      <el-button v-if="subTabsName === 'productionTaskMaterial'" @click="openStockReturnReqForm" type="warning">
        退 料
      </el-button>
      <el-button 
        v-if="subTabsName === 'productionTaskProcesses'" 
        @click="handleReportWork" 
        type="primary"
        :disabled="formData.plannedQuantity <= formData.actualQuantity">报 工</el-button>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
  <StockOutReqForm ref="stockOutReqFormRef" @success="refreshData"/>
  <!-- 添加报工表单组件 -->
  <ReportWorkForm ref="reportWorkFormRef" @success="handleReportWorkSuccess" />

</template>
<script setup lang="ts">
import { MaterialDTO } from '@/api/erp/basic/material/info'
import { ProductionTaskApi, ProductionTaskVO } from '@/api/erp/produce/productiontask'
import ProductionTaskMaterialForm from './components/ProductionTaskMaterialForm.vue'
import ProductionTaskProcessesForm from './components/ProductionTaskProcessesForm.vue'
import StockOutReqForm from '@/views/erp/stock/req/StockOutReqForm.vue'
import QueryMaterialIndex  from '@/views/erp/basic/material/info/components/QueryMaterialIndex.vue'
import { ProduceRoutingApi } from '@/api/erp/produce/producerouting'
import type { DrawerProps } from 'element-plus'
import { objectToNumberKeyMap } from '@/utils/converters'
// 引入报工表单组件和 API
import ReportWorkForm from '@/views/erp/produce/productiontask/components/ReportWorkForm.vue'
import { number } from 'vue-types'

const produceRoutingItem = ref<Map<number, string>>(new Map()) // 工艺路线列表
const routingLoading = ref(false) // 工艺路线加载状态

/** 生产任务 表单 */
defineOptions({ name: 'ProductionTaskForm' })

/** 物料选择弹窗 */
const drawerVisible = ref(false)
const direction = ref<DrawerProps['direction']>('rtl')

/** 打开物料选择抽屉 */
const openMaterialDrawer = () => {
  drawerVisible.value = true
}

/** 处理物料选择 */
const handleMaterialSelect = (material: MaterialDTO) => {
  formData.value.materialId = material.id
  formData.value.materialNumber = material.barCode
  formData.value.materialName = material.name
  formData.value.materialUnit = material.unitName
  formData.value.materialSpec = material.standard
  drawerVisible.value = false  // 关闭抽屉

   // 清空之前选择的工艺路线
   formData.value.produceRoutingId = undefined
  
  // 获取新物料的工艺路线
  fetchProcessRoutes()
}

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  name: undefined,
  productionTaskNo: undefined,
  // productMainPlanNo: undefined,
  materialId: undefined,
  materialNumber: undefined,
  materialName: undefined,
  materialSpec: undefined,
  materialUnit: undefined,
  plannedQuantity: undefined,
  actualQuantity: undefined,
  produceRoutingId: undefined,
  priority: undefined,
  startDate: undefined,
  endDate: undefined,
  remark: undefined,
})
const formRules = reactive({
  // name: [{ required: true, message: '任务名称不能为空', trigger: 'blur' }],
  materialName: [{ required: true, message: '物料不能为空', trigger: 'blur' }],
  // materialSpec: [{ required: true, message: '物料规格不能为空', trigger: 'blur' }],
  materialUnit: [{ required: true, message: '物料单位不能为空', trigger: 'blur' }],
  plannedQuantity: [{ required: true, message: '计划生产数量不能为空', trigger: 'blur' }],
  // priority: [{ required: true, message: '优先级不能为空', trigger: 'blur' }],
  startWorkTime: [{ required: true, message: '开工时间不能为空', trigger: 'blur' }],
  endWorkTime: [{ required: true, message: '完工时间不能为空', trigger: 'blur' }],
  produceRoutingId: [{ required: true, message: '工艺路线不能为空', trigger: 'blur' }],
  // productMainPlanNo: [{ required: true, message: '主计划不能为空', trigger: 'blur' }],
 
})
const formRef = ref() // 表单 Ref

/** 子表的表单 */
const subTabsName = ref('productionTaskMaterial')
const productionTaskMaterialFormRef = ref()
const productionTaskProcessesFormRef = ref()

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await ProductionTaskApi.getProductionTask(id)
      fetchProcessRoutes() // 获取工艺路线列表
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
    await productionTaskMaterialFormRef.value.validate()
  } catch (e) {
    subTabsName.value = 'productionTaskMaterial'
    return
  }
  try {
    await productionTaskProcessesFormRef.value.validate()
  } catch (e) {
    subTabsName.value = 'productionTaskProcesses'
    return
  }
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as ProductionTaskVO
    debugger
    // // 拼接子表的数据
    data.productionTaskMaterials = productionTaskMaterialFormRef.value.getData()
    data.productionTaskProcessess = productionTaskProcessesFormRef.value.getData()
    if (formType.value === 'create') {
      await ProductionTaskApi.createProductionTask(data)
      message.success(t('common.createSuccess'))
    } else {
      await ProductionTaskApi.updateProductionTask(data)
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
    name: undefined,
    productionTaskNo: undefined,
    // productMainPlanNo: undefined,
    materialId: undefined,
    materialNumber: undefined,
    materialName: undefined,
    materialSpec: undefined,
    materialUnit: undefined,
    plannedQuantity: undefined,
    actualQuantity: undefined,
    produceRoutingId: undefined,
    priority: undefined,
    startDate: undefined,
    endDate: undefined,
    remark: undefined,
  }
  produceRoutingItem.value = new Map() // 清空工艺路线列表
  routingLoading.value = false // 清空工艺路线加载状态
  formRef.value?.resetFields()
}

/** 获取工艺路线列表 */
const fetchProcessRoutes = async () => {
  if (!formData.value.materialId) {
    message.warning('请先选择物料')
    return
  }
  
  try {
    routingLoading.value = true
    const response = await ProduceRoutingApi.getProduceRoutingMap(formData.value.materialId)
    const map = objectToNumberKeyMap(response)
    produceRoutingItem.value = map
    formData.value.produceRoutingId =  map.size > 0 ? [...map.keys()][0] : undefined
     // 如果传入了工艺路线ID，则自动选中
    //  if (produceRoutingId !== undefined && produceRoutingId !== null) {
    //   formData.value.produceRoutingId = produceRoutingId;
    // }
  } catch (error) {
    console.error('获取工艺路线失败:', error)
    message.error('获取工艺路线失败')
  } finally {
    routingLoading.value = false
  }
}

/** 领料操作 */
const handlePickMaterials = () => {
  // 这里添加领料的具体逻辑
  console.log('执行领料操作');
}

const reportWorkFormRef = ref()

// 处理报工成功的回调
const handleReportWorkSuccess = async () => {
  // message.success('报工成功')
  // 重新获取生产任务详情以更新实际生产数量
  if (formData.value.id) {
    try {
      const updatedTask = await ProductionTaskApi.getProductionTask(formData.value.id)
      formData.value.actualQuantity = updatedTask.actualQuantity
    } catch (error) {
      console.error('更新实际生产数量失败:', error)
      message.error('更新实际生产数量失败')
    }
  }
  // 刷新数据
  refreshData()
}

/** 报工操作 */
const handleReportWork = () => {
  const { id, productionTaskNo, materialId, materialName, materialNumber, plannedQuantity } = formData.value
  if (!id || !materialId) {
    message.warning('请先选择生产任务和物料')
    return
  }
  // 打开报工表单并传递数据
  reportWorkFormRef.value.open({
    id: id,
    productionTaskNo,
    materialId,
    materialName,
    materialCode: materialNumber,
    plannedQuantity
  })
}

const stockOutReqFormRef = ref()

/** 领料/退料带入出库子表前：名称与规格分列（子表规格字段为 materialStandard） */
const normalizeMaterialRowForStockOut = (row: Record<string, any>) => {
  const spec = String(row.materialSpec ?? row.materialStandard ?? '').trim()
  let name = String(row.materialName ?? '').trim()
  if (spec && name.endsWith(spec)) {
    name = name.slice(0, name.length - spec.length).replace(/\s+$/u, '').trim()
  }
  row.materialName = name
  row.materialStandard = spec
  row.materialSpec = spec
}

// 打开 StockOutReqForm 并传递物料数据
const openStockOutReqForm = () => {
  // let materials = productionTaskMaterialFormRef.value.getData()
  // 获取选中的物料数据
  let materials = productionTaskMaterialFormRef.value.getSelectedData()
  // 如果没有选择物料，提示需要选择物料
  if (materials.length === 0) {
    ElMessage.warning('请选择物料后再领料。')
    return
  }

  // materials的每项里增加 生产任务的编号，明细的ID
  materials.forEach((material) => {
    normalizeMaterialRowForStockOut(material)
    material.sourceBillId = formData.value.id
    material.sourceBillNo = formData.value.productionTaskNo
    material.sourceBillItemId = material.id
    material.materialBarCode = material.materialCode
    material.materialUnitName = material.materialUnit
    let count = material.plannedQuantity - material.issuedQuantity + material.returnQuantity
    material.count = count > 0 ? count : 0
    material.applyCount = count > 0 ? count : 0
    material.materialId = material.materialId
  })
  // 过滤掉计划数量-已领数量+已退数量<=0的数据
  // materials = materials.filter(material => {
  //   return material.applyCount > 0
  // })

  stockOutReqFormRef.value.open('create', null, materials, 100)
}

// 打开 StockOutReqForm 并传递退料数据
const openStockReturnReqForm = () => {
  // 获取选中的物料数据
  let materials = productionTaskMaterialFormRef.value.getSelectedData()
  if (materials.length === 0) {
    ElMessage.warning('请选择物料后再退料。')
    return
  }
  // materials的每项里增加 生产任务的编号，明细的ID
  materials.forEach((material) => {
    normalizeMaterialRowForStockOut(material)
    material.sourceBillId = formData.value.id
    material.sourceBillNo = formData.value.productionTaskNo
    material.sourceBillItemId = material.id
    material.materialBarCode = material.materialCode
    material.materialUnitName = material.materialUnit
    // 设置 count 为 0
    material.count = 0
    // 设置 applyCount 为 -material.returnQuantity
    let count = material.issuedQuantity - material.returnQuantity
    material.applyCount = count > 0 ? count : 0
    material.materialId = material.materialId
  })
  // 过滤掉退料数量 <= 0 的数据
  // materials = materials.filter(material => {
  //   return material.applyCount > 0
  // })

  stockOutReqFormRef.value.open('create', null, materials, 200)
}

const refreshData = () => {
  productionTaskMaterialFormRef.value.refresh()
}
</script>