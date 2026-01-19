<template>
  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="ID" align="center" prop="id" />
      <el-table-column label="顺序" align="center" prop="sequenceNumber" />
      <el-table-column label="工序编码" align="center" prop="processCodeNo" />
      <el-table-column label="工序名称" align="center" prop="processName" />  
      <el-table-column label="工作中心" align="center" prop="workCenterName" />
      <el-table-column label="前置期" align="center" prop="leadDay" />
      <el-table-column label="工价" align="center" prop="processPrice" />
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.SYSTEM_STATUS_OK_NG" :value="scope.row.status" />
        </template>
      </el-table-column>    
      <el-table-column
        label="末道工序" align="center">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.SYSTEM_YES_NO" :value="scope.row.finalProcess" />
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
    </el-table>
  </ContentWrap>
</template>
<script setup lang="ts">
import {DICT_TYPE } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import { ProduceRoutingApi } from '@/api/erp/produce/producerouting'

const props = defineProps<{
  routingId?: number // 工艺路线ID（主表的关联字段）
}>()
const loading = ref(false) // 列表的加载中
const list = ref([]) // 列表的数据

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    list.value = await ProduceRoutingApi.getProduceRoutingDetailListByRoutingId(props.routingId)
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 初始化 **/
onMounted(() => {
  getList()
})
</script>