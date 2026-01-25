<!-- ERP 物料库存列表 -->
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
      <el-form-item label="物料" prop="materialId">
        <el-select v-model="queryParams.materialId"  clearable filterable placeholder="请选择物料" class="!w-220px" >
          <el-option v-for="[id, name] in materialItem" :key="id" :value="id" :label="name" />
        </el-select>
      </el-form-item>
      <el-form-item label="仓库" prop="warehouseId">
        <el-select v-model="queryParams.warehouseId"  clearable filterable placeholder="请选择仓库" class="!w-220px" >
          <el-option v-for="[id, name] in warehouseItem" :key="id" :value="id" :label="name" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['erp:stock:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['erp:stock:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <StockForm ref="formRef" @success="getList" />
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="物料名称" align="center" prop="materialName" />
      <el-table-column label="物料单位" align="center" prop="unitName" />
      <el-table-column label="物料规格" align="center" prop="standard" />
      <el-table-column label="物料分类" align="center" prop="categoryName" />
      <el-table-column
        label="库存量"
        align="center"
        prop="count"
        :formatter="erpCountTableColumnFormatter"
      />
      <el-table-column label="仓库" align="center" prop="warehouseName" />
      <el-table-column label="存放位置" align="center" prop="location" min-width="150">
        <template #default="{ row }">
          <span v-if="row.location">{{ row.location }}</span>
          <span v-else style="color: #999">未设置</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right" width="180">
        <template #default="{ row }">
          <!-- <el-button
            link
            type="primary"
            @click="handleViewDetail(row)"
          >
            查看
          </el-button> -->
          <el-button
            link
            type="primary"
            @click="openForm('update', row)"
          >
            编辑位置
          </el-button>
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
</template>

<script setup lang="ts">
import download from '@/utils/download'
import { StockApi, StockVO } from '@/api/erp/stock/stock'
import { erpCountTableColumnFormatter } from '@/utils'
import { useBasicData } from '@/api/erp/basic/common'
import StockForm from './StockForm.vue'
const { materialItem, warehouseItem } = useBasicData()

/** ERP 物料库存列表 */
defineOptions({ name: 'ErpStock' })

const message = useMessage() // 消息弹窗

const loading = ref(true) // 列表的加载中
const list = ref<StockVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  materialId: undefined,
  warehouseId: undefined
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await StockApi.getStockPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

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

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, row?: StockVO) => {
  formRef.value.open(type, row)
}

/** 查看详情 */
const handleViewDetail = (row: StockVO) => {
  // 跳转到库存明细页面，传递物料和仓库参数
  const router = useRouter()
  router.push({
    path: '/erp/stock/record',
    query: {
      materialId: row.materialId,
      warehouseId: row.warehouseId
    }
  })
}

/** 删除按钮操作 */
// const handleDelete = async (id: number) => {
//   try {
//     // 删除的二次确认
//     await message.delConfirm()
//     // 发起删除
//     await StockApi.deleteStock(id)
//     message.success(t('common.delSuccess'))
//     // 刷新列表
//     await getList()
//   } catch {}
// }

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await StockApi.exportStock(queryParams)
    download.excel(data, '物料库存.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 初始化 **/
onMounted(async () => {
  await getList()
})
</script>
