<template>
  <div>
    <button @click="selectOrders">选择订单</button>
  </div>
</template>

<script setup lang="ts">
import { defineEmits } from 'vue';

const emits = defineEmits(['select-orders']);

const selectOrders = () => {
  const orders = [/* 订单数据 */];
  emits('select-orders', orders);
};
</script>