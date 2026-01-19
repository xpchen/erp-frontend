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
      <el-form-item label="人员" prop="userId">
        <el-select
          v-model="queryParams.userId"
          placeholder="请选择人员"
          clearable
          filterable
          class="!w-240px"
        >
          <!-- 渲染用户列表 -->
          <el-option
            v-for="user in userList"
            :key="user.id"
            :label="user.nickname"
            :value="user.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="工序" prop="processId">
        <el-select
          v-model="queryParams.processId"
          placeholder="请选择工序"
          clearable
          filterable
          class="!w-240px"
        >
          <el-option
            v-for="process in processList"
            :key="process.id"
            :label="process.processName"
            :value="process.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['erp:user-process-mapping:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['erp:user-process-mapping:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="人员" align="center" prop="userName" />
      <el-table-column label="工序" align="center" prop="processName" />
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
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['erp:user-process-mapping:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['erp:user-process-mapping:delete']"
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
  <UserProcessMappingForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { UserProcessMappingApi, UserProcessMappingVO } from '@/api/erp/basic/userprocessmapping'
import UserProcessMappingForm from './UserProcessMappingForm.vue'
import { getAllUser, UserVO } from '@/api/system/user'
import { ProduceProcessApi, ProduceProcessVO } from '@/api/erp/produce/process'

/** 人员工序对照 列表 */
defineOptions({ name: 'UserProcessMapping' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<UserProcessMappingVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  userId: undefined,
  processId: undefined,
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await UserProcessMappingApi.getUserProcessMappingPage(queryParams)
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
    await UserProcessMappingApi.deleteUserProcessMapping(id)
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
    const data = await UserProcessMappingApi.exportUserProcessMapping(queryParams)
    download.excel(data, '人员工序对照.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 初始化 **/
onMounted(() => {
  getList()
})


// 定义用户列表响应式变量
const userList = ref<UserVO[]>([])

const processList = ref<ProduceProcessVO[]>([])

// 获取用户列表
const getUserList = async () => {
  try {
    const data = await getAllUser()
    userList.value = data
  } catch (error) {
    console.error('获取用户列表失败', error)
  }
}

const getProcessList = async () => {
  try {
    const data = await ProduceProcessApi.getProduceProcessList()
    processList.value = data
  } catch (error) {
    console.error('获取工序列表失败', error)
  }
}

// 初始化
onMounted(() => {
  getList()
  // 调用获取用户列表方法
  getUserList()

  getProcessList()
})
</script>
