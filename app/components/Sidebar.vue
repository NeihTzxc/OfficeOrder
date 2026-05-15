<script setup lang="ts">
import { LayoutDashboard, Store, Coffee, ReceiptText } from 'lucide-vue-next'
</script>

<template>
  <aside class="menu bg-base-100 text-base-content min-h-full w-80 p-4 border-r border-base-300 shadow-sm flex flex-col gap-4">
    <!-- Logo area -->
    <div class="mb-4 mt-2 px-4 flex items-center gap-2">
      <div class="bg-primary text-primary-content p-2 rounded-lg">
        <Coffee class="w-6 h-6" />
      </div>
      <h2 class="text-2xl font-bold text-primary tracking-tight">TeamOrder</h2>
    </div>
    
    <!-- Navigation menu -->
    <ul class="menu p-0 flex-1 gap-2 font-medium">
      <li>
        <NuxtLink to="/" exact-active-class="active bg-primary/10 text-primary">
          <LayoutDashboard class="w-5 h-5 mr-2" />
          Dashboard
        </NuxtLink>
      </li>
      <li>
        <NuxtLink to="/shops" active-class="active bg-primary/10 text-primary">
          <Store class="w-5 h-5 mr-2" />
          Quán & Thực đơn
        </NuxtLink>
      </li>
      <li>
        <NuxtLink to="/sessions" active-class="active bg-primary/10 text-primary">
          <Coffee class="w-5 h-5 mr-2" />
          Phiên đặt nước
        </NuxtLink>
      </li>
      <li>
        <NuxtLink to="/history" active-class="active bg-primary/10 text-primary">
          <ReceiptText class="w-5 h-5 mr-2" />
          Lịch sử hóa đơn
        </NuxtLink>
      </li>
    </ul>
    
    <!-- Optional: Bottom area (e.g., settings, support) -->
  </aside>
</template>
