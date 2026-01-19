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
      <el-form-item label="入库类型" prop="inType">
        <el-select
          v-model="queryParams.inType"
          placeholder="请选择入库类型"
          clearable
          class="!w-240px"
        >
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择状态"
          clearable
          class="!w-240px"
        >
        <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.ERP_PRODUCE_IN_BACKFLUSH_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="处理结果" prop="processResult">
        <el-select
          v-model="queryParams.processResult"
          placeholder="请选择处理结果"
          clearable
          class="!w-240px"
        >
        <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.ERP_PRODUCE_BACKFLUSH_PROCESS_RESULT)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="入库单号" prop="produceInNo">
        <el-input
          v-model="queryParams.produceInNo"
          placeholder="请输入生产入库单号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['erp:produce-in-event:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="ID" align="center" prop="id" width="60px"/>
      <el-table-column label="入库单ID" align="center" prop="produceInId" width="90px"/>
      <el-table-column label="入库类型" align="center" prop="inType" width="90px">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.ERP_AUDIT_STATUS" :value="scope.row.inType" />
        </template>
      </el-table-column>  
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="160px"
      />
      <el-table-column label="状态" align="center" prop="status" width="100px">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.ERP_PRODUCE_IN_BACKFLUSH_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>  
      <el-table-column label="入库单号" align="center" prop="produceInNo" width="160px"/>
      <el-table-column label="异常信息" align="center" prop="remark" />
      <el-table-column label="处理结果" align="center" prop="processResult">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.ERP_PRODUCE_BACKFLUSH_PROCESS_RESULT" :value="scope.row.processResult" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="120px">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['erp:produce-in-event:update']"
          >
            详情
          </el-button>
          <el-button
            link
            type="primary"
            @click="updateProcessResult(1, scope.row.id)"
            v-hasPermi="['erp:produce-in-event:update']"
            v-if="scope.row.processResult === 0 && scope.row.status === 2"
          >
            处理
          </el-button>
          <el-button
            link
            type="primary"
            @click="updateProcessResult(2, scope.row.id)"
            v-hasPermi="['erp:produce-in-event:update']"
            v-if="scope.row.processResult === 0 && scope.row.status === 2"
          >
            忽视
          </el-button>
          <!-- <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['erp:produce-in-event:delete']"
          >
            删除
          </el-button> -->
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
  <ProduceInEventForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { ProduceInEventApi, ProduceInEventVO } from '@/api/erp/stock/produceinevent'
import ProduceInEventForm from './ProduceInEventForm.vue'

/** 生产入库事务 列表 */
defineOptions({ name: 'ProduceInEvent' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<ProduceInEventVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  produceInId: undefined,
  inType: undefined,
  createTime: [],
  status: undefined,
  processResult: 0,
  produceInNo: undefined,
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await ProduceInEventApi.getProduceInEventPage(queryParams)
    debugger
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

/** 更新处理结果 */
const updateProcessResult = async (processResult: number, id: number) => {
  try {
    const data = {
      id: id,
      processResult: processResult
    } as unknown as ProduceInEventVO
    await ProduceInEventApi.updateProduceInEvent(data)
    message.success(t('common.updateSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}


/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await ProduceInEventApi.deleteProduceInEvent(id)
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
    const data = await ProduceInEventApi.exportProduceInEvent(queryParams)
    download.excel(data, '生产入库事务.xls')
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