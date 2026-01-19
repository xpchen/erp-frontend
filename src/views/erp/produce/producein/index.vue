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
      <el-form-item label="入库单号" prop="produceInNo">
        <el-input
          v-model="queryParams.produceInNo"
          placeholder=""
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select
          v-model="queryParams.type"
          placeholder="请选择类型"
          clearable
          class="!w-240px"
        >
        <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.ERP_PRODUCE_IN_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态 " prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择状态 "
          clearable
          class="!w-240px"
        >
        <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.ERP_AUDIT_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="业务日期" prop="bizDate">
        <el-date-picker
          v-model="queryParams.bizDate"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="生产组织" prop="produceDept" v-if="false">
        <el-input
          v-model="queryParams.produceDept"
          placeholder=""
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
          v-hasPermi="['erp:produce-in:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['erp:produce-in:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" 
    :stripe="true" 
    :show-overflow-tooltip="true" 
    :span-method="objectSpanMethod"
    border>
      <el-table-column label="ID" align="center" prop="id" width="60" v-if="false"/>
      <el-table-column label="入库单号" align="center" prop="produceInNo" width="160"/>
      <el-table-column label="类型" align="center" prop="type" width="80">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.ERP_PRODUCE_IN_TYPE" :value="scope.row.type" />
        </template>
      </el-table-column>  
      <el-table-column label="状态 " align="center" prop="status" width="85">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.ERP_AUDIT_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>    
      <el-table-column
        label="业务日期"
        align="center"
        prop="bizDate"
        :formatter="dateFormatter2"
        width="100px"
      />
      <el-table-column label="生产组织" align="center" prop="produceDept" v-if="false" />
      <el-table-column label="物料代码" align="center" prop="materialNumber" />
      <el-table-column label="物料名称" align="center" prop="materialName" />
      <el-table-column label="规格型号" align="center" prop="model" />
      <el-table-column label="单位" align="center" prop="unitName" width="80px" />
      <el-table-column label="数量" align="center" prop="qty"  width="80px"/>
      <el-table-column label="确认数量" align="center" prop="finalQty"  width="90px"/>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" min-width="100px">
        <template #default="scope">
          <el-button
            link
            @click="openForm('detail', scope.row.id)"
            v-hasPermi="['erp:produce-in:query']"
          >
            详情
          </el-button>
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['erp:produce-in:update']"
            v-if="scope.row.status === 10"
          >
            编辑
          </el-button>
          <el-button
              link
              type="primary"
              @click="handleUpdateStatus(scope.row.id, 20)"
              v-hasPermi="['erp:produce-in:update-status']"
              v-if="scope.row.status === 10"
            >
              审批
            </el-button>
            <el-button
              link
              type="danger"
              @click="handleUpdateStatus(scope.row.id, 10)"
              v-hasPermi="['erp:produce-in:update-status']"
              v-else
            >
              反审批
            </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['erp:produce-in:delete']"
            v-if="scope.row.status === 10"
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
  <ProduceInForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { dateFormatter2 } from '@/utils/formatTime'
import download from '@/utils/download'
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { ProduceInApi, ProduceInVO } from '@/api/erp/produce/producein'
import ProduceInForm from './ProduceInForm.vue'
import {BillStatus} from '@/api/erp/common/constants'

/** 生产入库-包含成品，半成品 列表 */
defineOptions({ name: 'ErpProduceIn' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<ProduceInVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  produceInNo: undefined,
  type: undefined,
  status: undefined,
  bizDate: [],
  produceDept: undefined,
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
// 用于存储合并信息的数组
const spanArr = ref<number[]>([]);
// 记录当前合并的行数
const pos = ref(0);

// 计算合并信息
const getSpanArr = (data: ProduceInVO[]) => {
  spanArr.value = [];
  pos.value = 0;
  data.forEach((item, index) => {
    if (index === 0) {
      spanArr.value.push(1);
      pos.value = 0;
    } else {
      // 判断当前行的入库单号、类型、状态和业务日期是否和上一行相同
      if (
        item.produceInNo === data[index - 1].produceInNo &&
        item.type === data[index - 1].type &&
        item.status === data[index - 1].status &&
        item.bizDate === data[index - 1].bizDate
      ) {
        spanArr.value[pos.value] += 1;
        spanArr.value.push(0);
      } else {
        spanArr.value.push(1);
        pos.value = index;
      }
    }
  });
};

// 合并单元格方法
const objectSpanMethod = ({ row, column, rowIndex, columnIndex }) => {
  // 入库单号列索引为 0，类型列索引为 1，状态列索引为 2，业务日期列索引为 3
  if (columnIndex === 0 || columnIndex === 1 || columnIndex === 2 || columnIndex === 3 || columnIndex === 11) { 
    const _row = spanArr.value[rowIndex];
    const _col = _row > 0 ? 1 : 0;
    return {
      rowspan: _row,
      colspan: _col
    };
  }
  return {
    rowspan: 1,
    colspan: 1
  };
};

// 修改 getList 方法，在获取数据后计算合并信息
const getList = async () => {
  loading.value = true;
  try {
    const data = await ProduceInApi.getProduceInPage(queryParams);
    list.value = data.list;
    total.value = data.total;
    // 计算合并信息
    getSpanArr(list.value);
  } finally {
    loading.value = false;
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

const handleUpdateStatus = async (id: number, status: number) => {
  try {
    // 审批的二次确认
    await message.confirm(`确定${status === BillStatus.APPROVE ? '审批' : '反审批'}该申请订单吗？`)
    // 发起审批
    await ProduceInApi.updateProduceInStatus(id, status)
    message.success(`${status === 20 ? '审批' : '反审批'}成功`)
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
    await ProduceInApi.deleteProduceIn(id)
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
    const data = await ProduceInApi.exportProduceIn(queryParams)
    download.excel(data, '生产入库-包含成品，半成品.xls')
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