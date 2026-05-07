<template>
  <!-- 列表 -->
  <ContentWrap>
    <!-- 使用 el-table 组件展示树状结构 -->
    <el-table
      v-loading="loading"
      :data="list"
      :stripe="true"
      :show-overflow-tooltip="true"
    >
      <el-table-column label="序号" align="left" prop="fseqShow" width="100"/>
      <el-table-column label="工序" align="center" prop="fprocessname" width="100"/>
      <el-table-column label="物料名称" align="center" prop="fmaterialname" min-width="220" />
      <el-table-column label="物料属性" align="center" prop="fmaterialpropname" />
      <el-table-column label="计量单位" align="center" prop="funitname" />
      <el-table-column label="规格型号" align="center" prop="fmodel" min-width="220" />
      <el-table-column
        label="消耗定额"
        align="center"
        prop="fconsumefixqty"
        :formatter="bomConsumeQuotaFormatter"
        min-width="100"
      />
      <el-table-column label="采购单位" align="center" prop="unitPurchaseName" />
      <el-table-column label="换算比例" align="center" prop="changeRate" />
      <el-table-column label="废品率" align="center" prop="fscrapratio" />
      <el-table-column label="生产周期" align="center" prop="fleadtime" />
      <el-table-column
        label="生效日期"
        align="center"
        prop="feffectivedate"
        :formatter="dateFormatter2"
        width="180px"
      />
      <el-table-column
        label="失效日期"
        align="center"
        prop="fdisabledate"
        :formatter="dateFormatter2"
        width="180px"
      />
      <el-table-column label="备注" align="center" prop="fremark" />
      <!-- <el-table-column label="消耗类型" align="center" prop="fconsumetype" /> -->
      <!-- <el-table-column label="领送料方式" align="center" prop="fissmode" /> -->
      <el-table-column label="领料仓库" align="center" prop="fdefaultwarehousename" />
      <!-- <el-table-column label="替代方式" align="center" prop="freplacemode" /> -->
      <el-table-column label="倒冲" align="center" prop="fisbackflush">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.SYSTEM_YES_NO" :value="scope.row.fisbackflush" />
        </template>
      </el-table-column>  
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter2"
        width="180px"
      />
    </el-table>
  </ContentWrap>
</template>
<script setup lang="ts">
import { DICT_TYPE } from '@/utils/dict'
import { dateFormatter2 } from '@/utils/formatTime';
import { BomApi } from '@/api/erp/produce/bom';
import { erpNumberFormatter } from '@/utils'

/** BOM 消耗定额：表格展示保留 4 位小数 */
const bomConsumeQuotaFormatter = (_row, _column, cellValue: any) =>
  erpNumberFormatter(cellValue, 4)

const props = defineProps<{
  fparentid?: number // 单据头（主表的关联字段）
}>()

const loading = ref(false) // 列表的加载中
const list = ref([]) // 列表的数据

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    list.value = await BomApi.getAllBomItemsListByFparentid(props.fparentid) 
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
</style>