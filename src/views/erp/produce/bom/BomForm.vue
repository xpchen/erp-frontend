<template>
  <Dialog 
    :title="dialogTitle" 
    v-model="dialogVisible"
    width="100%">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
      :inline="false" 
      class="two-column-form" 
    >
      <!-- 第一行 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="编码" prop="fnumber">
            <el-input v-model="formData.fnumber" placeholder="编码保存后自动生成" disabled/>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="物料" prop="fmaterialid">
            <el-select
              v-model="formData.fmaterialid"
              clearable
              filterable
              @change="onChangeMaterial($event)"
              placeholder="请选择产品"
              :disabled="formType === 'update'"
            >
              <el-option
                v-for="item in materialList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="bom名称" prop="fname">
            <el-input v-model="formData.fname" placeholder="请输入bom名称" />
          </el-form-item>
        </el-col>
      </el-row>
      <!-- 第二行 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="bom类型" prop="fbomtype">
            <el-select v-model="formData.fbomtype" placeholder="请选择bom类型">
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.ERP_BOM_BOM_TYPE)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="生产数量" prop="fproductqty">
            <el-input v-model="formData.fproductqty" placeholder="请输入生产数量" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="bom用途" prop="fusagetype">
            <el-select v-model="formData.fusagetype" placeholder="请选择bom用途">
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.ERP_BOM_BOM_PURPOSE)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        
      </el-row>
      <!-- 第三行 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="规格型号" prop="fmodel">
            <el-input v-model="formData.fmodel" placeholder="请输入规格型号" :disabled="formType === 'update'"/>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="成品率" prop="fyield">
            <el-input v-model="formData.fyield" placeholder="请输入成品率" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="bom组" prop="fbomgroupid">
            <el-tree-select
              v-model="formData.fbomgroupid"
              :data="bomGroupList"
              :props="defaultProps"
              check-strictly
              node-key="parentid"
              placeholder="请选择bom组"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <!-- 第四行 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="工程图号" prop="fpicturenumber">
            <el-input v-model="formData.fpicturenumber" placeholder="请输入工程图号" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="描述" prop="fdescription">
            <el-input v-model="formData.fdescription" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="计量单位" prop="funitid">
            <el-select v-model="formData.funitid" clearable placeholder="请选择计量单位" class="w-1/1" disabled>
              <el-option
                v-for="unit in unitList"
                :key="unit.id"
                :label="unit.name"
                :value="unit.id"
              />
            </el-select> 
          </el-form-item>
        </el-col>
        <el-col :span="8" v-if="false">
          <el-form-item label="状态" prop="fbasestatus">
            <el-input v-model="formData.fbasestatus" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <!-- 子表的表单 -->
    <el-tabs v-model="subTabsName">
      <el-tab-pane label="bom分录" name="bomItems">
        <BomItemsForm 
          ref="bomItemsFormRef" 
          :fparentid="formData.fid" 
          :fmaterialid="formData.fmaterialid" />
      </el-tab-pane>
    </el-tabs>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <!-- 新增暂存按钮 -->
      <!-- <el-button @click="saveTemporarily" type="warning" :disabled="formLoading">暂 存</el-button> -->
      <el-button @click="handleClose">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { BomApi, BomVO } from '@/api/erp/produce/bom'
import BomItemsForm from './components/BomItemsForm.vue'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { MaterialApi, MaterialDTO } from '@/api/erp/basic/material/info'
import { MaterialUnitApi, MaterialUnitVO } from '@/api/erp/basic/material/unit'
import { BomGroupStandardApi } from '@/api/erp/bomgroupstandard'
import { defaultProps, handleTree } from '@/utils/tree'

/** bom 表单 */
defineOptions({ name: 'BomForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const materialList = ref<MaterialDTO[]>([]) // 物料列表
const unitList = ref<MaterialUnitVO[]>([]) // 产品单位列表
const bomGroupList = ref<Tree[]>([]) // 树形结构
const formData = ref({
  fid: undefined,
  fnumber: undefined,
  fname: undefined,
  fbomtype: undefined,
  fproductqty: undefined,
  fusagetype: undefined,
  fmaterialid: undefined,
  fmodel: undefined,
  fyield: undefined,
  fbomgroupid: undefined,
  fpicturenumber: undefined,
  fbizdate: undefined,
  fdescription: undefined,
  fauditorid: undefined,
  faudittime: undefined,
  fbasestatus: 1,
  funitid: undefined,
})
const formRules = reactive({
  fmaterialid: [{ required: true, message: '物料不能为空', trigger: 'change' }],
  fname: [{ required: true, message: 'bom名称不能为空', trigger: 'change' }],
  fbomtype: [{ required: true, message: 'bom类型不能为空', trigger: 'change' }],
  fproductqty: [{ required: true, message: '生产数量不能为空', trigger: 'blur' }],
  fusagetype: [{ required: true, message: 'bom用途不能为空', trigger: 'change' }],
  fbomgroupid: [{ required: true, message: 'bom组不能为空', trigger: 'blur' }],
  fbasestatus: [{ required: true, message: '单据状态不能为空', trigger: 'blur' }],
})
const formRef = ref() // 表单 Ref

/** 子表的表单 */
const subTabsName = ref('bomItems')
const bomItemsFormRef = ref()

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  debugger
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  materialList.value = await BomApi.getUnBomMaterial()
  unitList.value = await MaterialUnitApi.getMaterialUnitSimpleList()
  // 加载bom组树
  bomGroupList.value = 
  handleTree(await BomGroupStandardApi.getBomGroupStandardList(null), 'id', 'parentid')
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await BomApi.getBom(id)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 校验子表单
  try {
    await bomItemsFormRef.value.validate()
  } catch (e) {
    subTabsName.value = 'bomItems'
    return
  }
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as BomVO
    // 拼接子表的数据
    data.bomItemss = bomItemsFormRef.value.getData()
    if (formType.value === 'create') {
      await BomApi.createBom(data)
      message.success(t('common.createSuccess'))
    } else {
      await BomApi.updateBom(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

const onChangeMaterial = (materialId) => {
  const material = materialList.value.find((item) => item.id === materialId)
  if (material) {
    formData.value.fmaterialid = material.id
    formData.value.fnumber = material.barCode
    formData.value.fname = material.name
    formData.value.fmodel = material.standard
    formData.value.funitid = material.unitId

    // row.productUnitName = product.unitName
    // row.productBarCode = product.barCode
    // row.productPrice = product.purchasePrice
  }
  // 加载库存
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    fid: undefined,
    fnumber: undefined,
    fname: undefined,
    fbomtype: undefined,
    fproductqty: undefined,
    fusagetype: undefined,
    fmaterialid: undefined,
    fmodel: undefined,
    fyield: undefined,
    fbomgroupid: undefined,
    fpicturenumber: undefined,
    fbizdate: undefined,
    fdescription: undefined,
    fauditorid: undefined,
    faudittime: undefined,
    fbasestatus: 1,
    funitid: undefined,
  }
  formRef.value?.resetFields()
}

/** 关闭弹窗 */
const handleClose = () => {
  // 调用重置表单方法
  resetForm();
  // 关闭弹窗
  dialogVisible.value = false;
}

/** 暂存表单 */
const saveTemporarily = async () => {
  formLoading.value = true
  try {
    const data = formData.value as unknown as BomVO
    // 拼接子表的数据
    data.bomItemss = bomItemsFormRef.value.getData()
    if (formType.value === 'create') {
      await BomApi.createBom(data)
      message.success(t('common.tempSaveSuccess'))
    } else {
      await BomApi.updateBom(data)
      message.success(t('common.tempUpdateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}
</script>