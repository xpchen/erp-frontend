<template>
  <ContentWrap>
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px">
      <el-form-item label="入库单号" prop="no">
        <el-input
          v-model="queryParams.no"
          placeholder="请输入入库单号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="产品" prop="productId">
        <el-select
          v-model="queryParams.productId"
          clearable
          filterable
          placeholder="请选择产品"
          class="!w-240px"
        >
          <el-option
            v-for="item in productList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
    </el-form>

  </ContentWrap>

  <ContentWrap>
    <el-table
      v-loading="loading"
      :data="list"
      :stripe="true"
      :show-overflow-tooltip="true"
      @selection-change="handleSelectionChange"
    >
      <el-table-column width="30" label="选择" type="selection" />
      <el-table-column min-width="180" label="入库单号" align="center" prop="no" />
      <el-table-column label="产品信息" align="center" prop="productNames" min-width="200" />
      <el-table-column label="供应商" align="center" prop="supplierName" />
      <el-table-column
        label="入库时间"
        align="center"
        prop="inTime"
        :formatter="dateFormatter2"
        width="120px"
      />
      <el-table-column label="创建人" align="center" prop="creatorName" />
      <el-table-column
        label="总数量"
        align="center"
        prop="totalCount"
        :formatter="erpCountTableColumnFormatter"
      />
      <el-table-column
        label="应付金额"
        align="center"
        prop="totalPrice"
        :formatter="erpPriceTableColumnFormatter"
      />
      <el-table-column
        label="已付金额"
        align="center"
        prop="paymentPrice"
        :formatter="erpPriceTableColumnFormatter"
      />
      <el-table-column label="未付金额" align="center">
        <template #default="scope">
          <span v-if="scope.row.paymentPrice === scope.row.totalPrice">0</span>
          <el-tag type="danger" v-else>
            {{ erpPriceInputFormatter(scope.row.totalPrice - scope.row.paymentPrice) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="审核状态" align="center" fixed="right" width="90" prop="status">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.ERP_AUDIT_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right" width="220">
        <template #default="scope">
          <el-button
            link
            @click="openForm('detail', scope.row.id)"
            v-hasPermi="['erp:purchase-in:query']"
          >
            详情
          </el-button>
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['erp:purchase-in:update']"
            :disabled="scope.row.status === 20"
          >
            编辑
          </el-button>
          <el-button
            link
            type="primary"
            @click="handleUpdateStatus(scope.row.id, 20)"
            v-hasPermi="['erp:purchase-in:update-status']"
            v-if="scope.row.status === 10"
          >
            审批
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleUpdateStatus(scope.row.id, 10)"
            v-hasPermi="['erp:purchase-in:update-status']"
            v-else
          >
            反审批
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete([scope.row.id])"
            v-hasPermi="['erp:purchase-in:delete']"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </ContentWrap>
  <PurchaseInForm ref="formRef" @success="getList" />
</template>
<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { dateFormatter2 } from '@/utils/formatTime'
import { MaterialApi, MaterialDTO } from '@/api/erp/product/product'
import { WarehouseApi, WarehouseVO } from '@/api/erp/stock/warehouse'
import { AccountApi, AccountVO } from '@/api/erp/basic/account'
import { SupplierApi, SupplierVO } from '@/api/erp/basic/supplier'
import * as UserApi from '@/api/system/user'
import { PurchaseInApi, PurchaseInVO } from '@/api/erp/purchase/in'
import { UserVO } from '@/api/system/user'
import PurchaseInForm from '@/views/erp/purchase/in/PurchaseInForm.vue'

import {
  erpCountTableColumnFormatter,
  erpPriceInputFormatter,
  erpPriceTableColumnFormatter
} from '@/utils'


const message = useMessage() // 消息弹窗
const loading = ref(true) // 列表的加载中
const list = ref<PurchaseInVO[]>([]) // 列表的数据
const productList = ref<[]>([]) // 产品列表
const supplierList = ref<SupplierVO[]>([]) // 供应商列表
const userList = ref<UserVO[]>([]) // 用户列表
const warehouseList = ref<WarehouseVO[]>([]) // 仓库列表
const accountList = ref<AccountVO[]>([]) // 账户列表
const total = ref(0) // 列表的总页数

const selectionList = ref<PurchaseInVO[]>([])
const handleSelectionChange = (rows: PurchaseInVO[]) => {
  selectionList.value = rows
}
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}


const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  no: undefined,
  supplierId: undefined,
  productId: undefined,
  warehouseId: undefined,
  inTime: [],
  orderNo: undefined,
  paymentStatus: undefined,
  accountId: undefined,
  status: undefined,
  remark: undefined,
  creator: undefined
  })

  /** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await PurchaseInApi.getPurchaseInPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

  function handleQuery(){
    queryParams.pageNo = 1
    getList()
  }

  /** 审批/反审批操作 */
const handleUpdateStatus = async (id: number, status: number) => {
  try {
    // 审批的二次确认
    await message.confirm(`确定${status === 20 ? '审批' : '反审批'}该入库吗？`)
    // 发起审批
    await PurchaseInApi.updatePurchaseInStatus(id, status)
    message.success(`${status === 20 ? '审批' : '反审批'}成功`)
    // 刷新列表
    await getList()
  } catch {}
}

const handleDelete = async (ids:Array<any>)=>{
  // try {
  //   // 审批的二次确认
  //   await message.confirm(`确定${status === 20 ? '审批' : '反审批'}该入库吗？`)
  //   // 发起审批
  //   await PurchaseInApi.updatePurchaseInStatus(id, status)
  //   message.success(`${status === 20 ? '审批' : '反审批'}成功`)
  //   // 刷新列表
  //   await getList()
  // } catch {}
}

  /** 初始化 **/
onMounted(async () => {
  await getList()
  // 加载产品、仓库列表、供应商
  productList.value = await MaterialApi.getMaterialSimpleList()
  supplierList.value = await SupplierApi.getSupplierSimpleList()
  userList.value = await UserApi.getSimpleUserList()
  warehouseList.value = await WarehouseApi.getWarehouseSimpleList()
  accountList.value = await AccountApi.getAccountSimpleList()
})
</script>
<style>
</style>
