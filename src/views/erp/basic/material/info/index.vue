<!-- ERP 物料列表 -->
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
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="规格" prop="standard">
        <el-input
          v-model="queryParams.standard"
          placeholder="请输入规格（模糊）"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
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
          class="!w-240px"
          node-key="id"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['erp:material:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['erp:material:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="编码" align="center" prop="barCode" min-width="120" />
      <el-table-column label="名称" align="center" prop="name" min-width="160" />
      <el-table-column label="规格" align="center" prop="standard" min-width="220" />
      <el-table-column label="分类" align="center" prop="categoryName" min-width="120" />
      <el-table-column label="单位" align="center" prop="unitName" min-width="80" />
      <el-table-column
        label="采购价格"
        align="center"
        prop="purchasePrice"
        min-width="110"
        :formatter="erpPriceTableColumnFormatter"
      />
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="操作" align="center" width="180px">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="handleUpdate(scope.row.id)"
            v-hasPermi="['erp:material:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['erp:material:delete']"
          >
            删除
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

  <!-- 表单弹窗：添加/修改 -->
  <MaterialForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { MaterialApi, MaterialDTO } from '@/api/erp/basic/material/info'
import MaterialForm from './MaterialForm.vue'
import { DICT_TYPE } from '@/utils/dict'
import { erpPriceTableColumnFormatter } from '@/utils'
import { MaterialCategoryApi } from '@/api/erp/basic/material/category'
import { handleTree } from '@/utils/tree'

const MATERIAL_LIST_QUERY_KEY = 'erp_material_list_query'

const materialCategoryTree = ref<any[]>([])
const getMaterialCategoryTree = async () => {
  const data = await MaterialCategoryApi.getMaterialCategoryList({})
  materialCategoryTree.value = handleTree(data || [], 'id', 'parentId')
}

/** ERP 物料列表 */
defineOptions({ name: 'ErpMaterial' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const { push } = useRouter() // 路由跳转

const loading = ref(false) // 列表的加载中
const route = useRoute();
const list = ref<MaterialDTO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 50,
  name: undefined,
  standard: undefined as string | undefined,
  categoryId: undefined
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 从编辑页返回时恢复列表筛选条件（sessionStorage 一次性读取） */
const restoreMaterialListQuery = () => {
  try {
    const raw = sessionStorage.getItem(MATERIAL_LIST_QUERY_KEY)
    if (!raw) {
      return
    }
    sessionStorage.removeItem(MATERIAL_LIST_QUERY_KEY)
    const saved = JSON.parse(raw) as Record<string, unknown>
    if (saved && typeof saved === 'object') {
      if (saved.name !== undefined) queryParams.name = saved.name as any
      if (saved.standard !== undefined) queryParams.standard = saved.standard as any
      if (saved.categoryId !== undefined) queryParams.categoryId = saved.categoryId as any
      if (saved.pageNo !== undefined) queryParams.pageNo = saved.pageNo as any
      if (saved.pageSize !== undefined) queryParams.pageSize = saved.pageSize as any
    }
  } catch {
    /* ignore */
  }
}

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

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 编辑操作 */
const handleUpdate = (id: number) => {
  sessionStorage.setItem(
    MATERIAL_LIST_QUERY_KEY,
    JSON.stringify({
      name: queryParams.name,
      standard: queryParams.standard,
      categoryId: queryParams.categoryId,
      pageNo: queryParams.pageNo,
      pageSize: queryParams.pageSize
    })
  )
  push('/erp/material/edit?materialId=' + id + '&type=update')
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await MaterialApi.deleteMaterial(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}


watch(
  () => route.path,
  async (path) => {
    if (path === '/erp/material/view') {
      await getList()
    }
  }
)

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await MaterialApi.exportMaterial(queryParams)
    download.excel(data, '物料.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 初始化 **/
onMounted(async () => {
  await getMaterialCategoryTree()
  restoreMaterialListQuery()
  await getList()
})
</script>
