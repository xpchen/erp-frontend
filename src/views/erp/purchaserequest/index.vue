<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="单据编号" prop="no">
        <el-input
          v-model="queryParams.no"
          placeholder=""
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="业务日期" prop="bizDate">
        <el-date-picker
          v-model="queryParams.bizDate"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="申请人" prop="personId">
        <el-select v-model="queryParams.personId"  clearable filterable placeholder="" class="!w-220px" >
          <el-option v-for="[id, name] in userItem" :key="id" :value="id" :label="name" />
        </el-select>
      </el-form-item>
      <el-form-item label="物料" prop="materialId">
        <el-select v-model="queryParams.materialId"  clearable filterable placeholder="请选择物料" class="!w-220px" >
          <el-option v-for="[id, name] in materialItem" :key="id" :value="id" :label="name" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['erp:purchase-request:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['erp:purchase-request:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
        <!-- 下推采购订单按钮 -->
        <el-button
          v-if="selectedRows.length > 0"
          type="warning"
          @click="handlePushPurchaseOrder"
          v-hasPermi="['erp:purchase-order:create']"
        >
          <Icon icon="ep:arrow-right" class="mr-5px" /> 下推采购订单
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table 
      v-loading="loading" 
      :data="list" 
      :stripe="true" 
      @selection-change="handleSelectionChange"
      @row-dblclick="openDetailPage"
      :span-method="objectSpanMethod"
      border
    >
      <!-- 添加 checkbox 列 -->
      <el-table-column type="selection" width="55" />
      <el-table-column label="ID" align="center" prop="id" v-if="false"/>
      <el-table-column label="明细ID" align="center" prop="itemId" v-if="false"/>
      <el-table-column label="单据编号" align="center" prop="no" width="150px"/>
      <el-table-column
        label="业务日期"
        align="center"
        prop="bizDate"
        :formatter="dateFormatter2"
        width="100px"
      />
      <el-table-column label="物料名称" align="center" prop="materialName" width="180px"/>
      <el-table-column label="物料规格" align="center" prop="materialStandard" width="160px">
        <template #default="scope">{{ scope.row.materialStandard || '-' }}</template>
      </el-table-column>
      <el-table-column label="申请数量" align="center" prop="qty" width="85px"/>
      <el-table-column label="单位" align="center" prop="unitName" width="60px"/>
      <el-table-column label="采购数量" align="center" prop="purchaseOrderQty" width="85px"/>
      <el-table-column label="金额合计" align="center" prop="amount" width="90px"/>
      <el-table-column
        label="需求日期"
        align="center"
        prop="requireDate"
        :formatter="dateFormatter2"
        width="100px"
      />
      <el-table-column
        label="建议采购日期"
        align="center"
        prop="advicePurchaseDate"
        :formatter="dateFormatter2"
        width="110px"
      />
      <el-table-column label="价税合计" align="center" prop="taxAmount" width="90px"/>
      <el-table-column label="状态" align="center" width="90" prop="status">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.ERP_AUDIT_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="申请人" align="center" prop="personName" />
      <el-table-column label="是否加急" align="center" prop="isUrgent" v-if="false"/>
      <el-table-column label="申请部门" align="center" prop="deptName" />
      <el-table-column label="需求类型" align="center" prop="demandType">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.ERP_PURCHASE_DEMAND_TYPE" :value="scope.row.demandType" />
        </template>
      </el-table-column>  
      <el-table-column label="币种" align="center" prop="currency" v-if="false"/>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter2"
        width="120px"
        v-if="false"
      />
      <el-table-column label="操作" align="center" min-width="120px" fixed = "left">
        <template #default="scope">
          <div class="operation-column">
            <el-button
              link
              type="primary"
              @click="openForm('update', scope.row.id)"
              v-hasPermi="['erp:purchase-request:update']"
              v-if="scope.row.status === 10"
            >
              编辑
            </el-button>
            <el-button
              link
              type="primary"
              @click="handleUpdateStatus(scope.row.id, 20)"
              v-hasPermi="['erp:purchase-request:update-status']"
              v-if="scope.row.status === 10"
            >
              审批
            </el-button>
            <el-button
              link
              type="danger"
              @click="handleUpdateStatus(scope.row.id, 10)"
              v-hasPermi="['erp:purchase-request:update-status']"
              v-else
            >
              反审批
            </el-button>
            <el-button
              link
              type="danger"
              @click="handleDelete(scope.row.id)"
              v-hasPermi="['erp:purchase-request:delete']"
            >
              删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <PurchaseRequestForm ref="formRef" @success="getList" />
  <!-- 表单弹窗：添加/修改 -->
  <PurchaseOrderForm ref="formOrderRef" @success="getList" />
</template>

<script setup lang="ts">
import { dateFormatter2 } from '@/utils/formatTime'
import download from '@/utils/download'
import { PurchaseRequestApi, PurchaseRequestVO } from '@/api/erp/purchaserequest'
import PurchaseRequestForm from './PurchaseRequestForm.vue'
import { useBasicData } from '@/api/erp/basic/common/index'
import { DICT_TYPE } from '@/utils/dict'
import PurchaseOrderForm from '../purchase/order/PurchaseOrderForm.vue'
import {BillStatus} from '@/api/erp/common/constants'
const { materialItem, userItem } = useBasicData()

/** 采购申请单 列表 */
defineOptions({ name: 'ErpPurchaseRequest' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<PurchaseRequestVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  no: undefined,
  bizDate: [],
  personId: undefined,
  materialId: undefined,
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

// /** 查询列表 */
// const getList = async () => {
//   loading.value = true
//   try {
//     const data = await PurchaseRequestApi.getPurchaseRequestPage(queryParams)
//     list.value = data.list
//     total.value = data.total
//   } finally {
//     loading.value = false
//   }
// }

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/**
 * 打开详细画面
 * @param row 当前双击行的数据
 */
 const openDetailPage = (row) => {
  // 假设详细画面的路由名称为 'PurchaseRequestDetail'
  formRef.value.open("detail", row.id)
}

/** 审批/反审批操作 */
const handleUpdateStatus = async (id: number, status: number) => {
  try {
    // 审批的二次确认
    await message.confirm(`确定${status === BillStatus.APPROVE ? '审批' : '反审批'}该申请订单吗？`)
    // 发起审批
    await PurchaseRequestApi.updatePurchaseRequestStatus(id, status)
    message.success(`${status === 20 ? '审批' : '反审批'}成功`)
    // 刷新列表
    await getList()
  } catch {}
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await PurchaseRequestApi.deletePurchaseRequest(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}



/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await PurchaseRequestApi.exportPurchaseRequest(queryParams)
    download.excel(data, '采购申请单.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 初始化 **/
onMounted(() => {
  getList()
})

// 存储选中的行数据
const selectedRows = ref<PurchaseRequestVO[]>([]);

/**
 * 处理表格选中项变化事件
 * @param rows 选中的行数据
 */
const handleSelectionChange = (rows) => {
  selectedRows.value = rows;
};

const formOrderRef = ref();

/**
 * 下推采购订单逻辑
 */
const handlePushPurchaseOrder = async () => {
  // 新建一个对象rowItem， 同时获取选中行的id, itemId赋值给这个对象
  const rowItem = selectedRows.value.map(row => ({ sourceBillId: row.id, sourceBillDetailId: row.itemId }));
  if (rowItem.length === 0) {
    message.warning('请选择需要下推的采购申请单');
    return;
  }

  // 检查是否有未审核的申请单
  const hasUnapproved = selectedRows.value.some(row => row.status !== BillStatus.APPROVE);
  if (hasUnapproved) {
    message.warning('未审核申请单不能下推采购订单');
    return;
  }

  // 检查是否有不可下推数量的采购申请单
  // 检查(qty - purchaseOrderQty) <= 0，否则提示不能下推（purchaseOrderQty如果为null需要转成0）
  const hasUnpushableQty = selectedRows.value.some(row => (row.qty - (row.purchaseOrderQty || 0)) <= 0);
  if (hasUnpushableQty) {
    message.warning('有不可下推数量的采购申请单');
    return;
  }

  console.log("rowItem=====", rowItem)
  // 打开采购订单表单
  formOrderRef.value.openForPush("push", rowItem);
};


// 用于存储合并信息的数组
const spanArr = ref<number[]>([]);
// 记录当前合并的行数
const pos = ref(0);

// 计算合并信息
const getSpanArr = (data: PurchaseRequestVO[]) => {
  spanArr.value = [];
  pos.value = 0;
  data.forEach((item, index) => {
    if (index === 0) {
      spanArr.value.push(1);
      pos.value = 0;
    } else {
      // 判断当前行的单据编号是否和上一行相同
      if (item.no === data[index - 1].no) {
        spanArr.value[pos.value] += 1;
        spanArr.value.push(0);
      } else {
        spanArr.value.push(1);
        pos.value = index;
      }
    }
  });
};

// 合并单元格方法
const objectSpanMethod = ({ row, column, rowIndex, columnIndex }) => {
  // 单据编号列索引为 2，操作列索引为 1
  if (columnIndex === 2 || columnIndex === 1) { 
    const _row = spanArr.value[rowIndex];
    const _col = _row > 0 ? 1 : 0;
    return {
      rowspan: _row,
      colspan: _col
    };
  }
  return {
    rowspan: 1,
    colspan: 1
  };
};

// 修改 getList 方法，在获取数据后计算合并信息
const getList = async () => {
  loading.value = true;
  try {
    const data = await PurchaseRequestApi.getPurchaseRequestPage(queryParams);
    list.value = data.list;
    total.value = data.total;
    getSpanArr(list.value); // 计算合并信息
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.operation-column {
  word-break: break-all; /* 允许在单词内换行 */
  white-space: normal; /* 允许文本换行 */
}

.operation-column .el-button {
  display: inline-block; /* 让按钮内联显示 */
  margin-bottom: 4px; /* 给按钮底部添加一些间距 */
}
</style>