<template>
  <div>
    <!-- 新增年份选择项 -->
    <el-select v-model="selectedYear" @change="generateCalendar(selectedYear)" placeholder="请选择年份" class="year-select">
      <el-option
        v-for="year in availableYears"
        :key="year"
        :label="year.toString()"
        :value="year"
      />
    </el-select>
    <!-- 新增保存按钮 -->
    <el-button @click="saveSelectedDates" class="highlight">保存</el-button>
    <!-- 新增重置按钮 -->
    <el-button @click="resetDates" class="highlight">重置</el-button>
    <!-- 新增一排选项 -->
    <div class="weekday-selector">
      <el-checkbox-group v-model="selectedWeekday" @change="batchUpdateStatus">
        <el-checkbox label="0">星期日</el-checkbox>
        <el-checkbox label="1">星期一</el-checkbox>
        <el-checkbox label="2">星期二</el-checkbox>
        <el-checkbox label="3">星期三</el-checkbox>
        <el-checkbox label="4">星期四</el-checkbox>
        <el-checkbox label="5">星期五</el-checkbox>
        <el-checkbox label="6">星期六</el-checkbox>
      </el-checkbox-group>
    </div>
    <div class="calendar-container">
      <el-card v-for="(month, index) in months" :key="index" class="month-card">
        <template #header>
          <div class="month-header">
            <h2>{{ month.name }}</h2>
          </div>
        </template>
        <table>
          <thead>
            <tr>
              <th>日</th>
              <th>一</th>
              <th>二</th>
              <th>三</th>
              <th>四</th>
              <th>五</th>
              <th>六</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(week, weekIndex) in month.weeks" :key="weekIndex">
              <td
                v-for="(day, dayIndex) in week"
                :key="dayIndex"
                :style="{ 
                  backgroundColor: day && dayStatus[month.name][day] ? '#f0f0f0' : 'transparent',
                  color: day && dayStatus[month.name][day] ? 'black' : '' 
                }"
                @click="day && toggleDayStatus(month.name, day)"
              >
                <span v-if="day">{{ day }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElCard, ElCheckbox, ElCheckboxGroup, ElSelect, ElOption, ElButton, ElMessage } from 'element-plus';
import { FactoryCalendarApi } from '@/api/erp/factorycalendar/index';

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗
// 定义月份名称
const monthNames = [
  '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月'
];

// 生成可选择的年份范围，这里设置为当前年份前后各 10 年
const currentYear = new Date().getFullYear();
const availableYears = ref(Array.from({ length: 21 }, (_, i) => currentYear - 10 + i));
const selectedYear = ref(currentYear);

// 生成一年的日历数据
const months = ref([]);
const dayStatus = ref({});
// 新增：选中的星期
const selectedWeekday = ref<string[]>([]);
// 新增：记录上一次选中的星期
const prevSelectedWeekday = ref<string[]>([]);


// 调用后台接口获取数据
const fetchFactoryCalendar = async () => {
  try {
    debugger
    const data = await FactoryCalendarApi.getFactoryCalendar(selectedYear.value);
    // 处理接口返回的数据，更新 dayStatus
    data.forEach(item => {
      const date = new Date(item.fdate);
      const month = monthNames[date.getMonth()];
      const day = date.getDate();
      if (item.fisholiday === 1) {
        dayStatus.value[month][day] = true;
      }
    });
    // 这里可以根据接口返回的数据更新 dayStatus 等状态
    console.log('获取工厂日历数据成功:', data);
  } catch (error) {
    console.error('获取工厂日历数据失败:', error);
    ElMessage.error('获取工厂日历数据失败，请稍后重试');
  }
};
// 生成日历的函数
const generateCalendar = (year: number) => {
  const newMonths = [];
  const newDayStatus = {};

  for (let month = 0; month < 12; month++) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay();

    const weeks = [];
    let currentWeek = [];

    // 填充空白日期
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push(null);
    }

    // 填充日期
    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    // 填充剩余空白日期
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);

    // 确保每个月有六个星期
    while (weeks.length < 6) {
      weeks.push(Array(7).fill(null));
    }

    newMonths.push({
      name: monthNames[month],
      weeks
    });

    // 初始化日期状态
    newDayStatus[monthNames[month]] = {};
    for (let day = 1; day <= daysInMonth; day++) {
      newDayStatus[monthNames[month]][day] = false;
    }
  }

  months.value = newMonths;
  dayStatus.value = newDayStatus;

  debugger;
  fetchFactoryCalendar();
};

// 初始化当前年份的日历
generateCalendar(selectedYear.value);

// 更新日期状态
const updateDayStatus = (month: string, day: number) => {
  // 这里可以添加保存状态到后端的逻辑
  console.log(`更新 ${month} ${day} 的状态为: ${dayStatus.value[month][day]}`);
};

// 新增：批量更新状态
const batchUpdateStatus = () => {
  // 找出新增选中的星期
  const newlySelected = selectedWeekday.value.filter(weekday =>!prevSelectedWeekday.value.includes(weekday));
  // 找出取消选中的星期
  const deselected = prevSelectedWeekday.value.filter(weekday =>!selectedWeekday.value.includes(weekday));

  // 处理新增选中的星期
  newlySelected.forEach((weekday) => {
    months.value.forEach((month) => {
      month.weeks.forEach((week) => {
        const day = week[parseInt(weekday)];
        if (day) {
          dayStatus.value[month.name][day] = true;
        }
      });
    });
  });

  // 处理取消选中的星期
  deselected.forEach((weekday) => {
    months.value.forEach((month) => {
      month.weeks.forEach((week) => {
        const day = week[parseInt(weekday)];
        if (day) {
          dayStatus.value[month.name][day] = false;
        }
      });
    });
  });

  // 更新上一次选中的星期
  prevSelectedWeekday.value = [...selectedWeekday.value];
};

// 新增：切换日期选中状态
const toggleDayStatus = (month: string, day: number) => {
  dayStatus.value[month][day] = !dayStatus.value[month][day];
  updateDayStatus(month, day);
};

// 新增：保存选中日期的函数
const saveSelectedDates = async () => {
  const selectedDates = [];
  for (const month in dayStatus.value) {
    for (const day in dayStatus.value[month]) {
      if (dayStatus.value[month][day]) {
        const monthIndex = monthNames.indexOf(month) + 1;
        const formattedMonth = monthIndex.toString().padStart(2, '0');
        const formattedDay = day.toString().padStart(2, '0');
        const formattedDate = `${selectedYear.value}-${formattedMonth}-${formattedDay}`;
        selectedDates.push({ fdate: formattedDate, fisholiday: 1, fyear: selectedYear.value});
      }
    }
  }

  // 提交选中日期到后台
  if (selectedDates.length === 0) {
    selectedDates.push({ fdate: '', fisholiday: 0, fyear: selectedYear.value});
  }
  const result = await FactoryCalendarApi.createFactoryCalendar(selectedDates);
  message.success(t('common.createSuccess'))
// 这里需要替换为实际的后端接口地址
// fetch('/api/save-dates', {
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/json'
//   },
//   body: JSON.stringify(selectedDates)
// })
// .then(response => response.json())
// .then(data => {
//   console.log('保存成功:', data);
//   // 弹出消息框展示所有选中的日期
//   ElMessage.success(`已保存选中的日期: ${selectedDates}`);
// })
// .catch(error => {
//   console.error('保存失败:', error);
//   ElMessage.error('保存失败，请稍后重试');
// });
};

// 新增：重置日期状态的函数
const resetDates = () => {
  months.value.forEach((month) => {
    Object.keys(dayStatus.value[month.name]).forEach((day) => {
      dayStatus.value[month.name][day] = false;
    });
  });
  // 清空选中的星期
  selectedWeekday.value = [];
  prevSelectedWeekday.value = [];
};

// 在组件挂载时调用接口
onMounted(() => {
  fetchFactoryCalendar();
});
</script>

<style scoped>
.calendar-container {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  gap: 20px; /* 添加卡片之间的间距 */
}

.month-card {
  width: calc((100% - 100px) / 6); /* 考虑间距后计算宽度 */
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.month-header {
  height: 20px; /* 固定月份标题区域的高度 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.month-card .el-card__body {
  width: 100%;
  display: flex;
  justify-content: center;
}

table {
  border-collapse: collapse;
  width: 100%;
  flex: 1; /* 让表格填充剩余空间 */
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

tr {
  height: 30px;
}

.weekday-selector {
  margin: 10px 0;
}

/* 新增：控制年份选择框的宽度 */
.year-select {
  width: 200px; /* 可根据需要调整宽度 */
}

/* 新增：保存按钮高亮样式 */
.highlight {
  background-color: #409eff; /* 按钮背景颜色，可根据喜好调整 */
  color: white; /* 按钮文字颜色 */
  font-weight: bold; /* 文字加粗 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 按钮阴影 */
}

/* 鼠标悬停时的样式 */
.highlight:hover {
  background-color: #66b1ff; 
}

/* 按钮被点击时的样式 */
.highlight:active {
  background-color: #3a8ee6; 
}
</style>
