<!-- 可MRP运算的订单列表 -->
<template>
  <Dialog
    title="选择销售订单"
    v-model="dialogVisible"
    :appendToBody="true"
    :scroll="true"
    width="1080"
  >
    <ContentWrap>
      <!-- 搜索工作栏 -->
      <el-form
        class="-mb-15px"
        :model="queryParams"
        ref="queryFormRef"
        :inline="true"
        label-width="68px"
      >
        <el-form-item label="订单单号" prop="no">
          <el-input
            v-model="queryParams.no"
            placeholder="请输入订单单号"
            clearable
            @keyup.enter="handleQuery"
            class="!w-160px"
          />
        </el-form-item>
        <el-form-item label="物料" prop="materialId">
          <el-select v-model="queryParams.materialId"  clearable filterable placeholder="请选择物料" class="!w-240px" >
            <el-option v-for="[id, name] in materialItem" :key="id" :value="id" :label="name" />
          </el-select>
        </el-form-item>
        <el-form-item label="订单时间" prop="orderTime">
          <el-date-picker
            v-model="queryParams.orderTime"
            value-format="YYYY-MM-DD HH:mm:ss"
            type="daterange"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
            class="!w-160px"
          />
        </el-form-item>
        <el-form-item>
          <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
          <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        </el-form-item>
      </el-form>
    </ContentWrap>

    <ContentWrap>
      <el-table v-loading="loading" :data="list" :show-overflow-tooltip="true" :stripe="true" ref="tableRef" @selection-change="onSelectionChange">
        <el-table-column type="selection" width="65" />
        <el-table-column min-width="180" label="订单单号" align="center" prop="no" />
        <el-table-column label="客户" align="left" prop="customerName" />
        <el-table-column label="物料编码" align="left" prop="materialBarCode" min-width="200" />
        <el-table-column label="物料名称" align="left" prop="materialName" min-width="200" />
        <el-table-column
          label="订单时间"
          align="center"
          prop="orderTime"
          :formatter="dateFormatter2"
          width="120px"
        />
        <el-table-column
          label="数量"
          align="center"
          prop="count"
          :formatter="erpCountTableColumnFormatter"
        />
        <el-table-column label="单位" align="center" prop="materialUnitName" min-width="60" />
        <el-table-column label="交货日期" align="center" prop="deliveryDate" :formatter="dateFormatter2" min-width="120" />
        <el-table-column label="创建人" align="center" prop="creatorName" />
      </el-table>
      <!-- 分页 -->
      <Pagination
        v-model:limit="queryParams.pageSize"
        v-model:page="queryParams.pageNo"
        :total="total"
        @pagination="getList"
      />
    </ContentWrap>
    <template #footer>
      <el-button :disabled="!selectedRows.length" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, nextTick, defineEmits, defineExpose } from 'vue';
import { ElTable } from 'element-plus';
import { SaleOrderApi, SaleOrderVO } from '@/api/erp/sale/order';
import { dateFormatter2 } from '@/utils/formatTime';
import { erpCountTableColumnFormatter } from '@/utils';
import { useBasicData } from '@/api/erp/basic/common'
const { materialItem } = useBasicData()

defineOptions({ name: 'ErpSaleOrderOutEnableList' });

const list = ref<SaleOrderVO[]>([]); // 列表的数据
const total = ref(0); // 列表的总页数
const loading = ref(false); // 列表的加载中
const dialogVisible = ref(false); // 弹窗的是否展示
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  no: undefined,
  materialId: undefined,
  orderTime: [],
  outEnable: true
});
const queryFormRef = ref(); // 搜索的表单
const tableRef = ref<InstanceType<typeof ElTable>>(); // 表格引用
const selectedRows = ref<SaleOrderVO[]>([]); // 选中的行

/** 打开弹窗 */
const open = async () => {
  dialogVisible.value = true;
  await nextTick(); // 等待，避免 queryFormRef 为空
  // 加载可出库的订单列表
  await resetQuery();
};
defineExpose({ open }); // 提供 open 方法，用于打开弹窗

/** 提交选择 */
const emits = defineEmits<{
  (e: 'success', value: SaleOrderVO[]): void
}>();
const submitForm = () => {
  try {
    emits('success', selectedRows.value);
  } finally {
    // 关闭弹窗
    dialogVisible.value = false;
    selectedRows.value = []; // 清空选中行
  }
};

/** 加载列表  */
const getList = async () => {
  loading.value = true;
  try {
    const data = await SaleOrderApi.getSaleOrderPage(queryParams);
  
    // list.value = data.list;
    // total.value = data.total;

     // 合并 data.list 中每项的 items
    const allItems = data.list.flatMap(item => {
      const { items, id, no, customerName, orderTime, remark, creatorName } = item;
      return items?.map(subItem => ({ 
        id, 
        no, 
        customerName, 
        orderTime, 
        remark, 
        creatorName,
        ...subItem 
      })) || [];
    });
    list.value = allItems;
    total.value = allItems.length;
  } finally {
    loading.value = false;
  }
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields();
  handleQuery();
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1;
  selectedRows.value = []; // 清空选中行
  getList();
};

// 监听表格选择变化
const onSelectionChange = (val: SaleOrderVO[]) => {
  selectedRows.value = val;
};
</script>
