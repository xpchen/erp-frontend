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
          show-word-limit
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="编码" prop="number">
        <el-input
          v-model="queryParams.number"
          placeholder="请输入编码"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="简称" prop="simplename">
        <el-input
          v-model="queryParams.simplename"
          placeholder="请输入简称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          @click="openForm('create')"
          v-hasPermi="['erp:bom-group-standard:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['erp:bom-group-standard:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
        <el-button type="danger" @click="toggleExpandAll">
          <Icon icon="ep:sort" class="mr-5px" /> 展开/折叠
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
      :show-overflow-tooltip="true"
      row-key="id"
      border
      :default-expand-all="isExpandAll"
      v-if="refreshTable"
    >
      <el-table-column label="名称" align="center" prop="name" />
      <el-table-column label="编号" align="center" prop="id" />
      <el-table-column label="编码" align="center" prop="number" />
      <el-table-column label="描述" align="center" prop="description" />
      <el-table-column label="简称" align="center" prop="simplename" />
      <el-table-column label="父节点" align="center" prop="parentid" />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter2"
        width="180px"
      />
      <el-table-column
        label="更新时间"
        align="center"
        prop="updateTime"
        :formatter="dateFormatter2"
        width="180px"
      />
      <el-table-column label="操作" align="center" width="180px">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="handleUpdate(scope.row.id)"
            v-hasPermi="['erp:bom-group-standard:update']"
          >
          <!-- @click="openForm('update', scope.row.id)" -->
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['erp:bom-group-standard:delete']"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <BomGroupStandardForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { dateFormatter2 } from '@/utils/formatTime'
import { handleTree } from '@/utils/tree'
import download from '@/utils/download'
import { BomGroupStandardApi, BomGroupStandardVO } from '@/api/erp/bomgroupstandard'
import BomGroupStandardForm from './BomGroupStandardForm.vue'

/** bom分组 列表 */
defineOptions({ name: 'BomGroupStandard' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<BomGroupStandardVO[]>([]) // 列表的数据
const queryParams = reactive({
  name: undefined,
  number: undefined,
  description: undefined,
  simplename: undefined,
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await BomGroupStandardApi.getBomGroupStandardList(queryParams)
    list.value = handleTree(data, 'id', 'parentid')
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
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

const handleUpdate = async(id: number) => {
  openForm('update', id);
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await BomGroupStandardApi.deleteBomGroupStandard(id)
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
    const data = await BomGroupStandardApi.exportBomGroupStandard(queryParams)
    download.excel(data, 'bom分组.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 展开/折叠操作 */
const isExpandAll = ref(true) // 是否展开，默认全部展开
const refreshTable = ref(true) // 重新渲染表格状态
const toggleExpandAll = async () => {
  refreshTable.value = false
  isExpandAll.value = !isExpandAll.value
  await nextTick()
  refreshTable.value = true
}

/** 初始化 **/
onMounted(() => {
  getList()
})
</script>
