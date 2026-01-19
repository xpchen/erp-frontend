import { ref } from 'vue'
import request from '@/config/axios'
import { objectToNumberKeyMap, convertKeyValueObjectToFullMap, convertMap } from '@/utils/converters'

export function useBasicData() {
  const materialItem = ref<Map<number, string>>(new Map())
  const materialCategoryItem = ref<Map<number, string>>(new Map())
  const materialUnitItem = ref<Map<number, string>>(new Map())
  const materialPurchasingStatusItem = ref<Map<number, string>>(new Map())
  const materialPurchasingCheckTypeItem = ref<Map<number, string>>(new Map())
  const materialAttrItem = ref<Map<number, string>>(new Map())
  const materialPlanModeItem = ref<Map<number, string>>(new Map())
  const materialCharTypeItem = ref<Map<number, string>>(new Map())
  const materialPlanStrategyItem = ref<Map<number, string>>(new Map())
  const materialIssModeItem = ref<Map<number, string>>(new Map())
  const customerItem = ref<Map<number, string>>(new Map())
  const accountItem = ref<Map<number, string>>(new Map())
  const tempAccountItem = ref<Map<number, { key: string; value: boolean }>>(new Map())
  const userItem = ref<Map<number, string>>(new Map())
  const warehouseItem = ref<Map<number, string>>(new Map())
  const tempWarehouseItem = ref<Map<number, { key: string; value: boolean }>>(new Map())
  const supplierItem = ref<Map<number, string>>(new Map())
  const materialInfoArray = ref<Array<object>>([])
  const productionTaskPriorityItem = ref<Map<number, string>>(new Map())
  const productionTaskStatusItem = ref<Map<number, string>>(new Map())
  const purchaseDemandTypeItem = ref<Map<number, string>>(new Map())

  

  const loadData = async () => {
    const {
      materialMap,
      materialCategoryMap, 
      materialUnitMap, 
      materialPurchasingStatusMap,  
      materialPurchasingCheckTypeMap,
      materialAttrMap,
      materialPlanModeMap,
      materialCharTypeMap,
      materialPlanStrategyMap,
      materialIssModeMap,
      customerMap,
      accountMap,
      userMap,
      warehouseMap,
      supplierMap,
      materialInfoList,
      productionTaskPriorityMap,
      productionTaskStatusMap,
      purchaseDemandTypeMap
    } = await request.get({ url: `/erp/basic/common` })
    materialCategoryItem.value = objectToNumberKeyMap(materialCategoryMap)
    materialUnitItem.value = objectToNumberKeyMap(materialUnitMap)
    materialPurchasingStatusItem.value = objectToNumberKeyMap(materialPurchasingStatusMap)
    materialPurchasingCheckTypeItem.value = objectToNumberKeyMap(materialPurchasingCheckTypeMap)
    materialAttrItem.value = objectToNumberKeyMap(materialAttrMap)
    materialPlanModeItem.value = objectToNumberKeyMap(materialPlanModeMap)
    materialCharTypeItem.value = objectToNumberKeyMap(materialCharTypeMap)
    materialPlanStrategyItem.value = objectToNumberKeyMap(materialPlanStrategyMap)
    purchaseDemandTypeItem.value = objectToNumberKeyMap(purchaseDemandTypeMap)
    materialIssModeItem.value = objectToNumberKeyMap(materialIssModeMap)
    materialItem.value = objectToNumberKeyMap(materialMap)
    customerItem.value = objectToNumberKeyMap(customerMap)
    userItem.value = objectToNumberKeyMap(userMap)
    tempAccountItem.value = convertKeyValueObjectToFullMap(accountMap)
    accountItem.value = convertMap(tempAccountItem.value)
    tempWarehouseItem.value = convertKeyValueObjectToFullMap(warehouseMap)
    warehouseItem.value = convertMap(tempWarehouseItem.value)
    supplierItem.value = objectToNumberKeyMap(supplierMap)
    materialInfoArray.value = materialInfoList
    productionTaskPriorityItem.value = objectToNumberKeyMap(productionTaskPriorityMap)
    productionTaskStatusItem.value = objectToNumberKeyMap(productionTaskStatusMap)
  }


  const defaultWarehouseId = computed(() => {
    const entry = Array.from(tempWarehouseItem.value).find(([_, { value }]) => value);
    return entry?.[0] ?? null;
  });

  const defaultAccountId = computed(() => {
    const entry = Array.from(tempAccountItem.value).find(([_, { value }]) => value);
    return entry?.[0] ?? null;
  });

  // 立即执行或手动控制加载 
  loadData()
  return { 
    materialCategoryItem, materialUnitItem, materialPurchasingStatusItem, 
    materialPurchasingCheckTypeItem, materialAttrItem, materialPlanModeItem,
    materialCharTypeItem, materialPlanStrategyItem,
    materialIssModeItem, materialItem, customerItem,
    accountItem, userItem, warehouseItem, supplierItem,
    materialInfoArray, defaultWarehouseId, defaultAccountId,
    productionTaskPriorityItem, productionTaskStatusItem,
    purchaseDemandTypeItem
  }
}