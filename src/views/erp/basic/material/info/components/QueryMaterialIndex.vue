<!-- ERP 物料列表 -->
<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-18px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="规格" prop="standard">
        <el-input
          v-model="queryParams.standard"
          placeholder="请输入规格（模糊）"
          clearable
          @keyup.enter="handleQuery"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="物料类别" prop="categoryId">
        <el-tree-select
          v-model="queryParams.categoryId"
          :data="materialCategoryTree"
          :props="{ label: 'name', value: 'id' }"
          check-strictly
          clearable
          filterable
          placeholder="请选择类别（可选父级查下属全部）"
          class="!w-220px"
          node-key="id"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table 
    v-loading="loading" 
    :data="list" 
    :stripe="true" 
    :show-overflow-tooltip="true"  
    @row-click="handleRowClick" 
    style="cursor: pointer"  
    highlight-current-row
    :current-row-key="currentRowKey"
    :row-class-name="tableRowClassName">
      <el-table-column label="条码" align="center" prop="barCode" min-width="120"/>
      <el-table-column label="名称" align="center" prop="name" min-width="180"/>
      <el-table-column label="规格" align="center" prop="standard" :min-width="props.forPurchaseRequest ? 300 : 260"/>
      <el-table-column label="分类" align="center" prop="categoryName" min-width="140"/>
      <el-table-column v-if="props.forPurchaseRequest" label="单位" align="center" prop="unitName" min-width="80"/>
      <el-table-column
        v-if="false"
        label="采购价格"
        align="center"
        prop="purchasePrice"
        :formatter="erpPriceTableColumnFormatter"
      />
      <el-table-column
        v-if="false"
        label="销售价格"
        align="center"
        prop="salePrice"
        :formatter="erpPriceTableColumnFormatter"
      />
      <el-table-column
        v-if="false"
        label="最低价格"
        align="center"
        prop="minPrice"
        :formatter="erpPriceTableColumnFormatter"
      />
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
import { dateFormatter } from '@/utils/formatTime'
import { MaterialApi, MaterialDTO } from '@/api/erp/basic/material/info'
import { erpPriceTableColumnFormatter } from '@/utils'
import { MaterialCategoryApi } from '@/api/erp/basic/material/category'
import { handleTree } from '@/utils/tree'

const materialCategoryTree = ref<any[]>([])
const getMaterialCategoryTree = async () => {
  const data = await MaterialCategoryApi.getMaterialCategoryList({})
  materialCategoryTree.value = handleTree(data || [], 'id', 'parentId')
}

/** 是否用于采购申请：true 时显示单位列、规格列加长；false 时仅保留条码/名称/规格/分类 4 列 */
/** 供应商编号：传入时仅展示该供应商下的物料（关联物料采购属性） */
const props = withDefaults(
  defineProps<{ forPurchaseRequest?: boolean; supplierId?: number | null }>(),
  { forPurchaseRequest: false, supplierId: undefined }
)

const currentRowKey = ref()
const currentSelectedRow = ref<MaterialDTO | null>(null)

const emit = defineEmits(['select'])  // 定义选择事件

// 行点击处理
const handleRowClick = (row: MaterialDTO) => {
  currentRowKey.value = row.id
  currentSelectedRow.value = row
  emit('select', row)
}
// 行样式处理
const tableRowClassName = ({ row }: { row: MaterialDTO }) => {
  return row.id === currentRowKey.value ? 'selected-row' : ''
}

/** ERP 物料列表 */
defineOptions({ name: 'QueryMaterialIndex' })

const loading = ref(false) // 列表的加载中
const route = useRoute();
const list = ref<MaterialDTO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: undefined,
  standard: undefined as string | undefined,
  categoryId: undefined,
  materialStatus: 0
})
const queryFormRef = ref() // 搜索的表单

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const params = { ...queryParams, supplierId: props.supplierId ?? undefined }
    const data = await MaterialApi.getMaterialPage(params)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

watch(() => props.supplierId, () => {
  queryParams.pageNo = 1
  getList()
})

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

watch(() => route.fullPath, async () => {
      // 当路由变化时执行某些操作，如重新获取数据
      // 刷新列表
      if(route.fullPath == "/erp/material/material"){
        await getList()
      }
    });

/** 初始化 **/
onMounted(() => {
  getMaterialCategoryTree()
  getList()
})
</script>

<style scoped>
/* 选中行样式 */
:deep(.el-table__body tr.selected-row > td) {
  background-color: #16e449 !important;
}

/* 鼠标悬停样式 */
:deep(.el-table__body tr:hover > td) {
  background-color: #0bc1da !important;
}
</style>
