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
      <el-form-item label="计划编码" prop="no">
        <el-input
          v-model="queryParams.no"
          placeholder="请输入计划编码"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="物料" prop="materialId">
        <el-select v-model="queryParams.materialId" clearable filterable placeholder="请选择物料（名称+规格）" class="!w-280px">
          <el-option
            v-for="m in materialInfoArray"
            :key="m.id"
            :value="m.id"
            :label="(m.name || '') + (m.standard ? ' ' + m.standard : '')"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="规格型号" prop="mode">
        <el-input
          v-model="queryParams.mode"
          placeholder="请输入规格型号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="queryParams.remark"
          placeholder="请输入备注"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="完工日期" prop="endDate">
        <el-date-picker
          v-model="queryParams.endDate"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="物料属性" prop="materialAttr">
          <el-select v-model="queryParams.materialAttr" placeholder="请选择物料属性" class="!w-120px">
            <el-option
              v-for="dict in getIntDictOptions(DICT_TYPE.ERP_MATERIAL_ATTR)"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
      </el-form-item>
      <el-form-item label="是否选单" prop="mrpSelected">
        <el-radio-group v-model="queryParams.mrpSelected">
        <el-radio
          v-for="(item, index) in YES_NO_OPTIONS"
          :key="index"
          :value="item.value"
          :label="item.label"
        >
          {{ item.label }}
        </el-radio>
      </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="warning"
          plain
          @click="openAutoGenerateForm"
          v-hasPermi="['erp:main-plan:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 自动生成
        </el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['erp:main-plan:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 手动新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['erp:main-plan:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="计划编码" align="center" prop="no" />
      <el-table-column label="物料" align="center" prop="materialName" />
      <el-table-column label="单位" align="center" prop="unitName" />
      <el-table-column label="规格型号" align="center" prop="mode" />
      <el-table-column label="数量" align="center" prop="qty" />
      <el-table-column
        label="开工日期"
        align="center"
        prop="startDate"
        :formatter="dateFormatter2"
        width="180px"
      />
      <el-table-column
        label="完工日期"
        align="center"
        prop="endDate"
        :formatter="dateFormatter2"
        width="180px"
      />
      <el-table-column label="物料属性" align="center" prop="materialAttr" >
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.ERP_MATERIAL_ATTR" :value="scope.row.materialAttr" />
        </template>
      </el-table-column>  
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="MRP选单" align="center" prop="mrpSelected">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.SYSTEM_YES_NO" :value="scope.row.mrpSelected" />
        </template>
      </el-table-column>    
      <!-- <el-table-column label="状态" align="center" prop="status" /> -->
      <el-table-column label="操作" align="center" width="180px">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['erp:main-plan:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['erp:main-plan:delete']"
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
  <MainPlanForm ref="formRef" @success="getList" />
  <!-- 自动生成主计划弹窗 -->
  <AutoGenerateMainPlan ref="autoGenerateFormRef" @success="getList" />
</template>

<script setup lang="ts">
import {  YES_NO_OPTIONS } from '@/components/DictData/DictConst.ts'
import { dateFormatter2 } from '@/utils/formatTime'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import download from '@/utils/download'
import { MainPlanApi, MainPlanVO } from '@/api/erp/produce/mainplan'
import MainPlanForm from './MainPlanForm.vue'
import { useBasicData } from '@/api/erp/basic/common'
import AutoGenerateMainPlan from '@/views/erp/produce/mainplan/AutoGenerateMainPlan.vue'

const { materialInfoArray } = useBasicData()

/** 主计划 列表 */
defineOptions({ name: 'ErpMainPlan' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<MainPlanVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  no: undefined,
  materialId: undefined,
  mode: undefined,
  remark: undefined,
  startDate: [],
  endDate: [],
  materialAttr: 3,
  mrpSelected: '0',
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await MainPlanApi.getMainPlanPage(queryParams)
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

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await MainPlanApi.deleteMainPlan(id)
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
    const data = await MainPlanApi.exportMainPlan(queryParams)
    download.excel(data, '主计划.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 初始化 **/
onMounted(() => {
  getList()
})

const autoGenerateFormRef = ref()

// 打开自动生成主计划画面
const openAutoGenerateForm = () => {
  autoGenerateFormRef.value.open()
}
</script>
