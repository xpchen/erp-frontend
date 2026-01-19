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
      <el-form-item label="物料类别" prop="categoryId">
        <el-select v-model="queryParams.categoryId" class="!w-220px" clearable filterable placeholder="请选择类别">
          <el-option
            v-for="[id, name] in materialCategoryItem"
            :key="id"
            :value="id"
            :label="name"
          />
        </el-select>
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
      <el-table-column label="条码" align="center" prop="barCode" width="180"/>
      <el-table-column label="名称" align="center" prop="name" width="180"/>
      <el-table-column label="规格" align="center" prop="standard" width="180"/>
      <el-table-column label="分类" align="center" prop="categoryName" />
      <el-table-column label="单位" align="center" prop="unitName" />
      <el-table-column
        label="采购价格"
        align="center"
        prop="purchasePrice"
        :formatter="erpPriceTableColumnFormatter"
      />
      <el-table-column
        label="销售价格"
        align="center"
        prop="salePrice"
        :formatter="erpPriceTableColumnFormatter"
      />
      <el-table-column
        label="最低价格"
        align="center"
        prop="minPrice"
        :formatter="erpPriceTableColumnFormatter"
      />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
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
import { useBasicData } from '@/api/erp/basic/common'
const { materialCategoryItem } = useBasicData()

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
  categoryId: undefined,
  materialStatus: 0
})
const queryFormRef = ref() // 搜索的表单

/** 查询列表 */
const getList = async () => {
  loading.value = true

  try {
    const data = await MaterialApi.getMaterialPage(queryParams)
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

watch(() => route.fullPath, async () => {
      // 当路由变化时执行某些操作，如重新获取数据
      // 刷新列表
      if(route.fullPath == "/erp/material/material"){
        await getList()
      }
    });

/** 初始化 **/
onMounted(() => {
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
