/**
 * 通用对象转Map函数
 * @param obj 原始对象
 * @returns Map<string, T>
 */
export const objectToMap = <T = any>(obj: Record<string, T>): Map<string, T> => {
  return obj ? new Map(Object.entries(obj)) : new Map()
}

/**
 * 将对象转换为Map<number, T>
 * @param obj 原始对象（key会被转换为number类型）
 * @returns Map<number, T>
 */
export const objectToNumberKeyMap = <T = any>(obj: Record<string, T>): Map<number, T> => {
  if (!obj) return new Map()
  
  return new Map(
    Object.entries(obj).map(([key, value]) => [
      Number(key),  // 将key转换为number类型
      value         // 值保持原类型
    ])
  )
}

/**
 * 将对象转换为Map<number, string>（特定value.key结构）
 * @param obj 原始对象（格式如 { "1": { key: "名称", value: boolean } }）
 * @returns Map<number, string>
 */
export const convertKeyValueObjectToMap = (obj: Record<string, { key: string; value: boolean }>): Map<number, string> => {
  if (!obj) return new Map()

  return new Map(
    Object.entries(obj).map(([key, { key: value }]) => [
      Number(key),
      value
    ])
  )
}

/**
 * 将对象转换为Map<number, {key: string, value: boolean}>
 * @param obj 原始对象
 * @returns Map<number, {key: string, value: boolean}>
 */
export const convertKeyValueObjectToFullMap = (
  obj: Record<string, { key: string; value: boolean }>
): Map<number, { key: string; value: boolean }> => {
  if (!obj) return new Map()

  return new Map(
    Object.entries(obj).map(([key, value]) => [
      Number(key),
      value
    ])
  )
}

/**
 * 将Map<number, { key: string }>转换为Map<number, string>
 * @param originalMap 原始Map
 * @returns 转换后的Map
 */
export const convertMap = (originalMap: Map<number, { key: string }>): Map<number, string> => {
  if (!originalMap) return new Map()
  
  return new Map(
    Array.from(originalMap).map(([id, { key }]) => [id, key])
  )
}