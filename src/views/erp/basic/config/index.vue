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
      <el-form-item label="状态:" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择状态"
          clearable
          class="!w-240px"
        >
        <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="配置键:" prop="configKey">
        <el-input
          v-model="queryParams.configKey"
          placeholder="请输入配置键"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="配置值:" prop="configValue">
        <el-input
          v-model="queryParams.configValue"
          placeholder="请输入配置值"
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
          plain
          @click="openForm('create')"
          v-hasPermi="['erp:user-customize-config:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['erp:user-customize-config:export']"
          v-if="false"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="主键ID" align="center" prop="id" v-if="false"/>
      <el-table-column label="状态" prop="status" align="left">
        <template #default="scope">
          <el-switch
            class="ml-4px"
            v-model="scope.row.status"
            v-hasPermi="['system:menu:update']"
            :active-value="CommonStatusEnum.ENABLE"
            :inactive-value="CommonStatusEnum.DISABLE"
            :loading="statusUpdating[scope.row.id]"
            @change="(val) => handleStatusChanged(scope.row, val as number)"
          />
        </template>
      </el-table-column>
      <el-table-column label="配置键" align="left" prop="configKey" width="350px"/>
      <el-table-column label="配置值" align="left" prop="configValue" />
      <el-table-column label="配置描述" align="left" prop="configDesc" width="350px"/>
      <el-table-column
        label="变更时间"
        align="left"
        prop="updateTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="操作" align="center" width="180px">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['erp:user-customize-config:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['erp:user-customize-config:delete']"
            v-if="false"
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
  <UserCustomizeConfigForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { UserCustomizeConfigApi, UserCustomizeConfigVO } from '@/api/erp/basic/config'
import UserCustomizeConfigForm from './UserCustomizeConfigForm.vue'
import { CommonStatusEnum } from '@/utils/constants'

/** 用户自定义配置 列表 */
defineOptions({ name: 'UserCustomizeConfig' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<UserCustomizeConfigVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  status: undefined,
  configGroup: undefined,
  configKey: undefined,
  configValue: undefined,
  createTime: [],
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await UserCustomizeConfigApi.getUserCustomizeConfigPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 开启/关闭配置的状态 */
const statusUpdating = ref({})
const handleStatusChanged = async (row, val: number) => {
  statusUpdating.value[row.id] = true
  try {
    row.status = val
    await UserCustomizeConfigApi.updateStatus(row.id)
    await getList()
  }catch (e) {
    row.status = row.status === CommonStatusEnum.ENABLE ? CommonStatusEnum.DISABLE : CommonStatusEnum.ENABLE
  }finally {
    statusUpdating.value[row.id] = false
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
    await UserCustomizeConfigApi.deleteUserCustomizeConfig(id)
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
    const data = await UserCustomizeConfigApi.exportUserCustomizeConfig(queryParams)
    download.excel(data, '用户自定义配置.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 初始化 **/
onMounted(() => {
  getList()
})

// const SPECIAL_CONFIG_KEYS = [
//   'erp_purchase_request_default_approved',
//   'erp_production_task_default_approved',
//   'erp_auto_create_purchase_order'
// ]

// const isSpecialConfigKey = (configKey: string) => {
//   return SPECIAL_CONFIG_KEYS.includes(configKey)
// }
</script>
