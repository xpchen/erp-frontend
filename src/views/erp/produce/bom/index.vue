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
      <el-form-item label="编码" prop="fnumber">
        <el-input
          v-model="queryParams.fnumber"
          placeholder="请输入编码"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="BOM名称" prop="fname" label-width="80px">
        <el-input
          v-model="queryParams.fname"
          placeholder="请输入BOM名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="物料" prop="fmaterialid">
        <el-input
          v-model="queryParams.fmaterialid"
          placeholder="请输入物料"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="单据状态" prop="fbasestatus">
        <el-select
          v-model="queryParams.fbasestatus"
          placeholder="请选择单据状态"
          clearable
          class="!w-240px"
        >
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['erp:bom:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['erp:bom:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <!-- 子表的列表 -->
      <el-table-column type="expand">
        <template #default="scope">
          <el-tabs model-value="bomItems">
            <el-tab-pane label="BOM分录" name="bomItems">
              <BomItemsList :fparentid="scope.row.fid" />
            </el-tab-pane>
          </el-tabs>
        </template>
      </el-table-column>
      <el-table-column label="编号" align="center" prop="fid" width="80"/>
      <el-table-column label="编码" align="center" prop="fnumber" width="180"/>
      <el-table-column label="BOM组" align="center" prop="fbomgroupname" width="100"/>
      <el-table-column label="BOM名称" align="center" prop="fname" />
      <el-table-column label="物料名称" align="center" prop="fmaterialname" min-width="220" />
      <el-table-column label="规格型号" align="center" prop="fmodel" min-width="220" />
      <!-- <el-table-column label="bom类型" align="center" prop="fbomtype" /> -->
      <el-table-column label="生产数量" align="center" prop="fproductqty" width="80"/>
      <el-table-column label="计量单位" align="center" prop="funitname" width="80"/>
      <!-- <el-table-column label="bom用途" align="center" prop="fusagetype" /> -->
      <!-- <el-table-column label="成品率" align="center" prop="fyield" /> -->
      <!-- <el-table-column label="工程图号" align="center" prop="fpicturenumber" /> -->
      <el-table-column label="描述" align="center" prop="fdescription" />
      <!-- <el-table-column label="单据状态" align="center" prop="fbasestatus" /> -->
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter2"
        width="180px"
      />
      <el-table-column label="操作" align="center" min-width="120px">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.fid)"
            v-hasPermi="['erp:bom:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.fid)"
            v-hasPermi="['erp:bom:delete']"
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
  <BomForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { dateFormatter2 } from '@/utils/formatTime'
import download from '@/utils/download'
import { BomApi, BomVO } from '@/api/erp/produce/bom'
import BomForm from './BomForm.vue'
import BomItemsList from './components/BomItemsList.vue'

/** bom 列表 */
defineOptions({ name: 'ErpBom' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<BomVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  fnumber: undefined,
  fname: undefined,
  fmaterialid: undefined,
  fbasestatus: undefined,
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await BomApi.getBomPage(queryParams)
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
  debugger
  formRef.value.open(type, id)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await BomApi.deleteBom(id)
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
    const data = await BomApi.exportBom(queryParams)
    download.excel(data, 'bom.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 初始化 **/
onMounted(() => {
  getList()
})
</script>