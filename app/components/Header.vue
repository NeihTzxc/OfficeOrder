<script setup lang="ts">
import { LogOut, Menu } from 'lucide-vue-next'
</script>

<template>
  <div class="navbar bg-base-100 border-b border-base-300 px-4 shadow-sm sticky top-0 z-40">
    <div class="flex-none lg:hidden">
      <label for="main-drawer" aria-label="open sidebar" class="btn btn-square btn-ghost">
        <Menu class="w-6 h-6" />
      </label>
    </div>
    <div class="flex-1">
      <h1 class="text-xl font-bold text-primary px-2 lg:hidden">TeamOrder</h1>
    </div>
    <div class="flex-none flex items-center gap-4">
      <div class="hidden sm:flex flex-col items-end">
        <span class="text-sm font-semibold">Thien Nguyen</span>
        <span class="text-xs text-base-content/70">Quản trị viên</span>
      </div>
      <div class="avatar placeholder sm:hidden">
        <div class="bg-primary text-primary-content rounded-full w-8">
          <span class="text-xs">TN</span>
        </div>
      </div>
      <button class="btn btn-sm btn-ghost text-error flex gap-2">
        <LogOut class="w-4 h-4" />
        <span class="hidden sm:inline">Đăng xuất</span>
      </button>
    </div>
  </div>
</template>
