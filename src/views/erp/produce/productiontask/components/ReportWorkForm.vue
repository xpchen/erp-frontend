<template>
  <el-dialog 
    v-model="dialogVisible" 
    title="报工" 
    width="600px"
    :close-on-click-modal="false" 
  >
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
      <el-form-item label="生产任务单号" prop="productionTaskNo">
        <el-input v-model="formData.productionTaskNo" disabled />
      </el-form-item>
      <el-form-item label="物料名称" prop="materialName">
        <el-input v-model="formData.materialName" disabled />
      </el-form-item>
      <el-form-item label="物料代码" prop="materialCode">
        <el-input v-model="formData.materialCode" disabled />
      </el-form-item>
      <el-form-item label="计划数量" prop="plannedQuantity">
        <el-input v-model="formData.plannedQuantity" disabled />
      </el-form-item>
      <el-form-item label="报工数量" prop="actualQuantity">
        <el-input-number v-model="formData.actualQuantity" :min="0" />
      </el-form-item>
      <el-form-item label="合格数量" prop="qualifiedQuantity" v-if="false">
        <el-input-number v-model="formData.qualifiedQuantity" :min="0" />
      </el-form-item>
      <el-form-item label="报废数量" prop="scrapQuantity" v-if="false">
        <el-input-number v-model="formData.scrapQuantity" :min="0" @change="handleScrapChange" />
      </el-form-item>
      <el-form-item label="报废原因" prop="scrapReason" v-if="formData.scrapQuantity > 0">
        <el-input type="textarea" v-model="formData.scrapReason" :rows="2" />
      </el-form-item>
      <el-form-item label="开工时间" prop="startTime">
        <el-date-picker v-model="formData.startTime" type="date" placeholder="选择开工时间" />
      </el-form-item>
      <el-form-item label="完工时间" prop="endTime">
        <el-date-picker v-model="formData.endTime" type="date" placeholder="选择完工时间" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm">提交</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ReportWorkApi } from '@/api/erp/produce/productiontask/reportwork'

const message = useMessage()
const emit = defineEmits(['success'])

const dialogVisible = ref(false)
const formRef = ref()

// 定义初始表单数据
const initialFormData = {
  productionTaskId: undefined,
  productionTaskNo: '',
  materialId: undefined,
  materialName: '',
  materialCode: '',
  plannedQuantity: 0,
  actualQuantity: 0,
  qualifiedQuantity: 0,
  scrapQuantity: 0,
  scrapReason: '',
  startTime: undefined,
  endTime: undefined
}

const formData = reactive({ ...initialFormData })

const formRules = reactive({
  actualQuantity: [{ required: true, message: '请输入报工数量', trigger: 'blur' }],
  // qualifiedQuantity: [{ required: true, message: '请输入合格数量', trigger: 'blur' }],
  // scrapQuantity: [{ required: true, message: '请输入报废数量', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开工时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择完工时间', trigger: 'change' }],
  scrapReason: [
    {
      validator: (rule, value, callback) => {
        if (formData.scrapQuantity > 0 && !value) {
          callback(new Error('请输入报废原因'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
})

const open = (data: {
  id: number
  productionTaskNo: string
  materialId: number
  materialName: string
  materialCode: string
  plannedQuantity: number
}) => {
  // 重置表单数据为初始状态
  Object.assign(formData, initialFormData)
  // 将传入的参数覆盖到表单数据上
  Object.assign(formData, data)
  dialogVisible.value = true
}

const handleScrapChange = () => {
  if (formData.scrapQuantity <= 0) {
    formData.scrapReason = ''
  }
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate()

  // 校验完工数量是否等于合格数量与报废数量之和
  // const { actualQuantity, qualifiedQuantity, scrapQuantity } = formData
  // if (actualQuantity !== qualifiedQuantity + scrapQuantity) {
  //   message.error('完工数量必须等于合格数量与报废数量之和')
  //   return
  // }

  try {
    await ReportWorkApi.submitReportWork(formData)
    message.success('报工提交成功')
    dialogVisible.value = false
    emit('success')
  } catch (error) {
    message.error('报工提交失败')
    console.error('报工提交失败:', error)
  }
}

defineExpose({ open })
</script>