<template>
  <!-- 修改 Dialog 组件，添加 close-on-click-modal 属性 -->
  <Dialog 
    :title="dialogTitle" 
    v-model="dialogVisible" 
    width="70%"
    :close-on-click-modal="false"
  >
    <ContentWrap>
    <!-- 选择销售订单按钮 -->
    <el-button @click="openSaleOrderList" type="primary" :disabled="isGenerating">选择销售订单</el-button>
    </ContentWrap>
    <ContentWrap>
    <!-- 显示选择的销售订单列表 -->
    <el-table :data="selectedSaleOrders" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="订单单号" align="center" prop="no" />
      <el-table-column label="客户" align="center" prop="customerName" />
      <el-table-column
          label="订单时间"
          align="center"
          prop="orderTime"
          :formatter="dateFormatter2"
          width="120px"
        />
      <el-table-column label="物料" align="center" prop="materialNames" />
      <!-- <el-table-column label="单位" align="center" prop="materialUnitName" /> -->
      <el-table-column label="数量" align="center" prop="totalCount" />
      <!-- <el-table-column label="交货日期" align="center" prop="deliveryDate" :formatter="dateFormatter2" min-width="120" /> -->
      <!-- 可根据实际需求添加更多列 -->
    </el-table>
  </ContentWrap>
    <!-- 循环等待的动态图示 -->
    <div v-if="isGenerating" class="loading-indicator">
      <!-- 使用自定义加载动画 -->
      <div class="custom-loader"></div>
    </div>
    <!-- 使用 footer 插槽添加取消按钮 -->
    <template #footer>
      <!-- 生成主计划按钮 -->
      <el-button @click="generateMainPlan" type="success" :disabled="selectedSaleOrders.length === 0 || isGenerating" >
        生成主计划
      </el-button>
      <el-button @click="dialogVisible = false" :disabled="isGenerating">取消</el-button>
    </template>
  </Dialog>
  <!-- 引入销售订单选择组件 -->
  <SaleOrderMrpEnableList ref="saleOrderListRef" @success="handleSaleOrderSelect" />
</template>

<script setup lang="ts">
import SaleOrderMrpEnableList from '@/views/erp/sale/order/components/SaleOrderMrpEnableList.vue'
import { MainPlanApi } from '@/api/erp/produce/mainplan'
import { dateFormatter2 } from '@/utils/formatTime';

const message = useMessage()
const dialogVisible = ref(false)
const dialogTitle = ref('自动生成主计划')
const selectedSaleOrders = ref([])
const isGenerating = ref(false) // 控制按钮禁用状态的响应式变量

// 定义自定义事件
const emits = defineEmits(['success'])

// 销售订单选择组件引用
const saleOrderListRef = ref()

// 打开选择销售订单画面
const openSaleOrderList = () => {
  saleOrderListRef.value?.open()
}

// 处理销售订单选择
const handleSaleOrderSelect = (orders) => {
  selectedSaleOrders.value = orders
}

// 生成主计划
const generateMainPlan = async () => {
  isGenerating.value = true // 开始生成时禁用按钮
  try {
    // 调用后台 API 运算逻辑生成主计划
    const saleOrderIds = selectedSaleOrders.value.map((order) => order.id)
    await MainPlanApi.autoGenerateMainPlan(saleOrderIds)
    message.success('主计划生成成功')
  } catch (error) {
    message.error('主计划生成失败')
  } finally {
    isGenerating.value = false // 生成结束后启用按钮
    dialogVisible.value = false
    // 触发自定义事件
    emits('success') 
  }
}

defineExpose({
  open: () => {
    dialogVisible.value = true
    selectedSaleOrders.value = []
  }
})
</script>

<style scoped>


@keyframes spin {
  0% { transform: rotate(0deg); }

  100% { transform: rotate(360deg); }
}

.loading-indicator {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 自定义加载动画样式 */
.custom-loader {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
</style>