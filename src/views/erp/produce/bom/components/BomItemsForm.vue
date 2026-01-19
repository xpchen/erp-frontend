<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="formRules"
    v-loading="formLoading"
    label-width="0px"
    :inline-message="true"
  >
    <el-table :data="formData" class="-mt-10px">
      <el-table-column label="序号" type="index" width="50" />
      <el-table-column label="工序" min-width="150">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.fprocess`" :rules="formRules.fprocess" class="mb-0px!">
            <el-select v-model="row.fprocess" placeholder="请选择工序">
              <el-option
              v-for="item in processList"
                  :key="item.id"
                  :label="item.processName"
                  :value="item.id"
                />
            </el-select>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="物料" min-width="180">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.fmaterialid`" :rules="formRules.fmaterialid" class="mb-0px!">
            <el-select
              v-model="row.fmaterialid"
              clearable
              filterable
              @change="onChangeProduct($event,row)"
              placeholder="请选择物料"
            >
              <el-option
                v-for="item in materialList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </template>
      </el-table-column>
      <!-- 新增物料规格列 -->
      <el-table-column label="物料规格" min-width="120">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.fmodel`" :rules="formRules.fmodel" class="mb-0px!">
            <el-input v-model="row.fmodel" placeholder="" disabled />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="物料属性" min-width="120">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.fmaterialprop`" :rules="formRules.fmaterialprop" class="mb-0px!">
            <el-select v-model="row.fmaterialprop" placeholder="">
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.ERP_MATERIAL_ATTR)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
                  />
            </el-select>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="计量单位" min-width="100">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.funitid`" :rules="formRules.funitid" class="mb-0px!">
            <el-select v-model="row.funitid" clearable placeholder="" class="w-1/1" disabled>
              <el-option v-for="[id, name] in materialUnitItem" :key="id" :value="id" :label="name" />
            </el-select>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="消耗定额" min-width="90">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.fconsumefixqty`" :rules="formRules.fconsumefixqty" class="mb-0px!">
            <el-input type="number" v-model="row.fconsumefixqty" placeholder="" />
          </el-form-item>
        </template>
      </el-table-column>
      <!-- 新增采购单位列 -->
      <!-- <el-table-column label="采购单位" min-width="100">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.unitPurchase`" :rules="formRules.unitPurchase" class="mb-0px!">
            <el-select v-model="row.unitPurchase" clearable placeholder="" class="w-1/1">
              <el-option v-for="[id, name] in materialUnitItem" :key="id" :value="id" :label="name" />
            </el-select>
          </el-form-item>
        </template>
      </el-table-column> -->
      <!-- 新增换算比例列 -->
      <!-- <el-table-column label="换算比例" min-width="90">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.changeRate`" :rules="formRules.changeRate" class="mb-0px!">
            <el-input type="number" v-model="row.changeRate" placeholder="" />
          </el-form-item>
        </template>
      </el-table-column> -->
      <el-table-column label="消耗类型" min-width="110">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.fconsumetype`" :rules="formRules.fconsumetype" class="mb-0px!">
            <el-select v-model="row.fconsumetype" placeholder="">
              <el-option
                    v-for="dict in getIntDictOptions(DICT_TYPE.ERP_COST_TYPE)"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
            </el-select>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="基本状态" min-width="150" v-if="false">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.fbasestatus`" class="mb-0px!">
            <el-radio-group v-model="row.fbasestatus">
                <el-radio value="1">核准</el-radio>
            </el-radio-group>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="废品率" min-width="90">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.fscrapratio`"  class="mb-0px!">
            <el-input type="number" v-model="row.fscrapratio" placeholder="" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="生产/采购周期" min-width="100">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.fleadtime`"  class="mb-0px!">
            <el-input type="number" v-model="row.fleadtime" placeholder="" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="生效日期" min-width="140">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.feffectivedate`" :rules="formRules.feffectivedate" class="mb-0px!">
            <el-date-picker
              v-model="row.feffectivedate"
              type="date"
              value-format="x"
              placeholder=""
            />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="失效日期" min-width="140">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.fdisabledate`" class="mb-0px!">
            <el-date-picker
              v-model="row.fdisabledate"
              type="date"
              value-format="x"
              placeholder=""
            />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="领送料方式" min-width="120" v-if="false">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.fissmode`" :rules="formRules.fissmode" class="mb-0px!">
            <el-select v-model="row.fissmode" placeholder="" disabled>
              <el-option
                    v-for="dict in getIntDictOptions(DICT_TYPE.ERP_MATERIAL_OUT)"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
            </el-select>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="领料仓库" min-width="150">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.fdefaultwarehouseid`" class="mb-0px!">
            <el-select v-model="row.fdefaultwarehouseid" clearable filterable placeholder="请选择仓库" class="!w-220px">
              <el-option v-for="[id, name] in warehouseItem" :key="id" :value="id" :label="name" />
            </el-select>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="替代方式" min-width="150" v-if="false">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.freplacemode`" class="mb-0px!">
            <el-input v-model="row.freplacemode" placeholder="" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="倒冲" min-width="80">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.fisbackflush`" class="mb-0px!">
            <el-select v-model="row.fisbackflush">
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.SYSTEM_YES_NO)"
                :key="dict.value"
                :value="dict.value"
                :label="dict.label"
              />
            </el-select>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column align="center" fixed="right" label="操作" width="60">
        <template #default="{ $index }">
          <el-button @click="handleDelete($index)" link>—</el-button>
        </template>
      </el-table-column>
      <el-table-column label="备注" min-width="150">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.fremark`" class="mb-0px!">
            <el-input v-model="row.fremark" placeholder="请输入备注" />
          </el-form-item>
        </template>
      </el-table-column>
    </el-table>
  </el-form>
  <el-row justify="center" class="mt-3">
    <el-button @click="handleAdd" round>+ 添加bom分录</el-button>
  </el-row>
</template>
<script setup lang="ts">
import { BomApi } from '@/api/erp/produce/bom'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { useBasicData } from '@/api/erp/basic/common'
import { ProduceProcessVO } from '@/api/erp/produce/process';
import { ProduceRoutingApi } from '@/api/erp/produce/producerouting';
import { MaterialApi, MaterialDTO} from '@/api/erp/basic/material/info'
const { warehouseItem , defaultWarehouseId} = useBasicData()

const message = useMessage() // 消息弹窗

const { materialUnitItem } = useBasicData()

const props: any = defineProps<{
  fparentid: undefined // 单据头（主表的关联字段）
  fmaterialid: undefined // 物料id
}>()

const formLoading = ref(false) // 表单的加载中
const formData = ref([])
const processList = ref<ProduceProcessVO[]>([]); // 新增：工序列表
const materialList = ref<MaterialDTO[]>([]) // 产品列表
const formRules = reactive({
  fmaterialid: [{ required: true, message: '物料不能为空', trigger: 'blur' }],
  fmaterialprop: [{ required: true, message: '物料属性不能为空', trigger: 'blur' }],
  feffectivedate: [{ required: true, message: '生效日期不能为空', trigger: 'blur' }],
  fconsumefixqty: [{ required: true, message: '消耗定额不能为空', trigger: 'blur' }],
  fconsumetype: [{ required: true, message: '消耗类型不能为空', trigger: 'change' }],
  fissmode: [{ required: true, message: '领送料方式不能为空', trigger: 'blur' }],
  funitid: [{ required: true, message: '单位不能为空', trigger: 'blur' }],
  fprocess: [{ required: true, message: '工序不能为空', trigger: 'blur' }],
  fdefaultwarehouseid: [
    {
      validator: (rule, value, callback) => {
        // 遍历每行数据
        formData.value.forEach((row, index) => {
          if (row.fisbackflush === 1 && !row.fdefaultwarehouseid) {
            callback(new Error(`第 ${index + 1} 行选择倒冲时，默认仓库必须选择`));
          }
        });
        callback();
      },
      trigger: 'blur'
    }
  ],
  // 新增采购单位和换算比例的验证规则
  // unitPurchase: [
  //   {
  //     validator: (rule, value, callback) => {
  //       debugger
  //       formData.value.forEach((row, index) => {
  //         if (row.unitPurchase && !row.changeRate) {
  //           callback(new Error(`第 ${index + 1} 行采购单位有值时，换算比例必须有值`));
  //         }
  //       });
  //       callback();
  //     },
  //     trigger: ['blur', 'change']
  //   }
  // ],
  // changeRate: [
  //   {
  //     validator: (rule, value, callback) => {
  //       debugger
  //       formData.value.forEach((row, index) => {
  //         if (row.unitPurchase && !row.changeRate) {
  //           callback(new Error(`第 ${index + 1} 行采购单位有值时，换算比例必须有值`));
  //         }
  //       });
  //       callback();
  //     },
  //     trigger: ['blur', 'change']
  //   }
  // ],
  freplacemode: [{ required: true, message: '替代方式不能为空', trigger: 'blur' }],
  // fisbackflush: [{ required: true, message: '倒冲不能为空', trigger: 'blur' }],
})
const formRef = ref() // 表单 Ref

/** 监听主表的关联字段的变化，加载对应的子表数据 */
watch(
  [() => props.fparentid, () => props.fmaterialid],
  async ([fparentId, fmaterialId]) => {
    // 1. 重置表单
    formData.value = []
    // 2. val 非空，则加载数据
    if (!fparentId && !fmaterialId) {
      return;
    }
    try {
      debugger;
      const result = await ProduceRoutingApi.getProduceRoutingDetailListByMaterialId(fmaterialId);
      processList.value = result; // 假设返回的数据可以直接用于下拉框
      materialList.value = await MaterialApi.getMaterialSimpleListForBom()
      if(fparentId){
        formLoading.value = true
        formData.value = await BomApi.getBomItemsListByFparentid(fparentId)
      }
      
    } finally {
      formLoading.value = false
    }
  },
  { immediate: true }
)

/** 处理产品变更 */
const onChangeProduct = (materialId, row) => {
  // 选择的物料不能是自己
  if (materialId === props.fmaterialid) {
    message.warning('选择的物料不能是BOM物料自身')
    // 选择的物料需要还原成之前的值
    row.fmaterialid = undefined
    return;
  }

  const material = materialList.value.find((item) => item.id === materialId);
  if (material) {
    row.fmaterialid = material.id;
    row.funitid = material.unitId;
    row.fmaterialprop = material.planInfo.materialAttr;
    row.fissmode = material.planInfo.issMode;
    row.fisbackflush = material.planInfo.isBackFlush;
    // 自制件，获取生产周期，外购件，获取采购周期
    if (material.planInfo.materialAttr === 3) {
      row.fleadtime = material.planInfo.produceLeadTime 
    }else if(material.planInfo.materialAttr === 4){
      row.fleadtime = material.planInfo.recevingLeadTime
    }
    // 新增物料规格赋值
    row.fmodel = material.standard; 
  }
}

/**
 * 将日期对象转换为 'YYYY-MM-DD HH:mm:ss.SSS' 格式的字符串
 * @param date 日期对象
 * @returns 格式化后的日期字符串
 */
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  // 月份从 0 开始，所以要加 1，同时补零到两位
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  // 毫秒部分补零到三位
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
};

/** 新增按钮操作 */
const handleAdd = () => {
  const row = {
    fid: undefined,
    fseq: undefined,
    fprocess: undefined,
    fmaterialid: undefined,
    funitid: undefined,
    fbasestatus: undefined,
    fremark: undefined,
    fparentid: undefined,
    fscrapratio: undefined,
    fleadtime: undefined,
    // 设置生效日期为当天时间戳
    feffectivedate: Math.floor(new Date().getTime()), 
    // 设置失效日期为 2099-12-31 08:00:00.000 格式的字符串
    fdisabledate: new Date('2099-12-31 08:00:00.000').getTime(), 
    fconsumefixqty: undefined,
    fconsumetype: 1,
    fissmode: 1,
    fdefaultwarehouseid: defaultWarehouseId.value,
    freplacemode: undefined,
    fmaterialprop: undefined,
    fisbackflush: 0,
    // unitPurchase: undefined,
    // changeRate: undefined,
  }
  row.fparentid = props.fparentid
  formData.value.push(row)
}

/** 删除按钮操作 */
const handleDelete = (index) => {
  formData.value.splice(index, 1)
}

/** 表单校验 */
const validate = async () => {
  try {
    debugger
    // 先进行表单自带的验证
    await formRef.value.validate()

    // 自定义验证：检查是否存在工序和物料同时相同的记录
    const recordMap = new Map();
    for (let i = 0; i < formData.value.length; i++) {
      const row = formData.value[i];
      const key = `${row.fprocess}-${row.fmaterialid}`;
      if (recordMap.has(key)) {
        message.warning(`第 ${recordMap.get(key) + 1} 行和第 ${i + 1} 行工序和物料重复，请检查！`);
        return Promise.reject(new Error('存在工序和物料重复的记录'));
      }
      recordMap.set(key, i);
      // 选择倒冲时默认仓库是否选择
      if (row.fisbackflush === 1 && !row.fdefaultwarehouseid) {
        message.warning(`第 ${i + 1} 行选择倒冲时，领料仓库必须选择`);
        return Promise.reject(new Error('选择倒冲时领料仓库未选择'));
      }
    }

    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
}

/** 表单值 */
const getData = () => {
  return formData.value
}

defineExpose({ validate, getData })
</script>