<template>
  <el-form :model="formData" label-width="100px">
    <el-form-item label="计划日期" prop="plannedDate">
      <!-- 新增计划日期选择框 -->
      <el-date-picker
        v-model="formData.plannedDate"
        type="date"
        placeholder="选择计划日期"
        style="width: 200px;"
      />
    </el-form-item>
    <el-form-item label="计划选项">
      <el-card>
          <el-checkbox label="允许计划订单开始日期在过去" v-model="formData.allowPastStartDate"/>
          <el-checkbox label="bom数据检查" v-model="formData.bomDataCheck"/>
      </el-card>
    </el-form-item>
    <!-- 将按钮放在 el-form-item 中，设置 label 为空 -->
    <el-form-item label="">
      <!-- 使用 :disabled 绑定按钮禁用状态 -->
      <el-button @click="openSaleOrderOutEnableList" :disabled="isSubmitting">选择销售订单</el-button>
      <el-button @click="submitPlan" type="primary" :disabled="isSubmitting">运行计划</el-button>
      <!-- 修改进度条为转圈圈效果，并设置 width 属性来缩小大小 -->
      <el-progress
        v-if="showProgress"
        type="circle"
        :percentage="progress"
        :status="getProgressStatus"
        :format="progressFormat"
        width=70
      />
    </el-form-item>

    <!-- 子表的表单 -->
    <el-table :data="formData.items" style="width: 100%">
        <el-table-column prop="no" label="订单编号" min-width="200"/>
        <el-table-column prop="orderTime" label="订单日期" :formatter="dateFormatter2"/>
        <el-table-column label="客户" align="left" prop="customerName" />
        <el-table-column label="产品" align="center" prop="productName" min-width="200" />
        <el-table-column
          label="数量"
          align="center"
          prop="count"
          :formatter="erpCountTableColumnFormatter"
        />
        <el-table-column label="单位" align="center" prop="productUnitName" />
        <el-table-column label="交货日期" align="center" prop="deliveryDate" :formatter="dateFormatter2" min-width="120" />
        <el-table-column label="创建人" align="center" prop="creatorName" />
        <el-table-column label="操作" width="180px">
          <template #default="scope">
            <el-button @click="deleteSalesOrder(scope.$index)">删除</el-button>
          </template>
        </el-table-column>
    </el-table>
  </el-form>
  <!-- 待运算的订单列表 -->
  <SaleOrderOutEnableList ref="saleOrderOutEnableListRef" @success="handleSaleOrderChange" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { dateFormatter2 } from '@/utils/formatTime';
import { erpCountTableColumnFormatter, erpPriceTableColumnFormatter } from '@/utils';
import {
  ElDatePicker,
  ElForm,
  ElFormItem,
  ElButton,
  ElTable,
  ElTableColumn,
  ElMessageBox,
  ElMessage,
  ElProgress // 确保 ElProgress 被引入
} from 'element-plus';
import SaleOrderOutEnableList from '@/views/erp/sale/order/components/SaleOrderMrpEnableList.vue'
import { SaleOrderVO } from '@/api/erp/sale/order'
import { MrpApi } from '@/api/erp/mrp'

// 定义表单数据对象
const formData = ref({
  plannedDate: new Date(),
  planOptions: [] as String[],
  allowPastStartDate: false,
  bomDataCheck: false,
  id: undefined,
  customerId: undefined,
  accountId: undefined,
  saleUserId: undefined,
  outTime: undefined,
  remark: undefined,
  orderNo: undefined,
  items: [] as SaleOrderVO[],
  no: undefined // 出库单号，后端返回
});

/** 打开【可出库的订单列表】弹窗 */
const saleOrderOutEnableListRef = ref() // 可出库的订单列表 Ref
const openSaleOrderOutEnableList = () => {
  saleOrderOutEnableListRef.value.open()
}

const handleSaleOrderChange = (order: SaleOrderVO[]) => {
  // 检查订单项是否已经存在
  const orderIds = order.map((item) => item.id);
  const existingOrderIds = formData.value.items.map((item) => item.id);
  const newOrderIds = orderIds.filter((id) => !existingOrderIds.includes(id));
  // 如果有新的订单项，则添加到 formData.items 中
  if (newOrderIds.length > 0) {
    // 通过循环添加到 formData.items 中
    newOrderIds.forEach((id) => {
      const orderItem = order.find((item) => item.id === id);
      if (orderItem) {
        formData.value.items.push(orderItem);
      }
    });
  } else {
    // 如果没有新的订单项，则提示用户
    ElMessage.warning('所选订单项已存在，无需重复添加!');
  }
}

// 删除选中的销售订单
const deleteSalesOrder = (index: number) => {
  formData.value.items.splice(index, 1);
};

// 定义进度条相关的响应式变量
const showProgress = ref(false)
const progress = ref(0)
// 新增响应式变量控制按钮禁用状态
const isSubmitting = ref(false)

// 计算进度条状态，修改判断逻辑以实现背景颜色变化
const getProgressStatus = computed(() => {
  if (progress.value === 100) {
    return 'success';
  }
  return ''; // 转圈圈效果下，不需要特殊状态，清空状态
});

// 自定义进度条文本格式
const progressFormat = (percentage: number) => {
  if (percentage === 100) {
    return '完成';
  }
  return '处理中...';
};

// 提交计划的方法
const submitPlan = () => {
  // 判断 formData.value.items 中是否有元素
  if (formData.value.items.length === 0) {
    ElMessage.warning('请选择销售订单后再运行!');
    return;
  }

  // 处理 items 中的日期字段
  const formattedItems = formData.value.items.map(item => {
    return {
      ...item,
      orderTime: dateFormatter2(item, null, item.orderTime),
      deliveryDate: dateFormatter2(item, null, item.deliveryDate)
    };
  });

  const dataToSubmit = {
    formData: {
      ...formData.value,
      items: formattedItems
    }
  };

  // 弹出框显示所有提交的内容
  ElMessageBox.confirm(
    JSON.stringify(dataToSubmit, null, 2),
    '确认提交内容',
    {
      confirmButtonText: '提交',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 开始提交，禁用按钮
    isSubmitting.value = true;
    // 显示进度条并开始更新进度
    showProgress.value = true;
    let startTime = Date.now();
    const intervalId = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      // 模拟 10 秒处理时间
      const progressPercent = Math.min(Math.floor((elapsedTime / 10000) * 100), 100);
      progress.value = progressPercent;

      // 模拟 10 秒后完成
      if (elapsedTime >= 10000) {
        clearInterval(intervalId);
        // 模拟后台成功返回数据
        const mockData = '计划运行成功';
        ElMessage.success(mockData);
        // 延迟隐藏进度条
        setTimeout(() => {
          showProgress.value = false;
          progress.value = 0;
          // 运行完成，恢复按钮可点击状态
          isSubmitting.value = false;
        }, 1000);
      }
    }, 100);
  }).catch(() => {
    // 用户取消操作，恢复按钮可点击状态
    isSubmitting.value = false;
    console.log('提交操作已取消');
  });
};
</script>

<style scoped>
/* 移除之前进度条的灰色背景样式，因为转圈圈效果不需要 */
</style>
