<script setup lang="ts">
import { Store, Plus, MoreVertical, Coffee, MapPin, ExternalLink } from 'lucide-vue-next'
import { ref } from 'vue'

const isAddModalOpen = ref(false)

// Mock data cho danh sách quán
const shops = ref([
  {
    id: 1,
    name: 'Phúc Long Coffee & Tea',
    address: '123 Nguyễn Huệ, Quận 1',
    hasMenu: true,
    totalItems: 45,
    cover: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=400&h=200'
  },
  {
    id: 2,
    name: 'The Coffee House',
    address: '456 Lê Lợi, Quận 1',
    hasMenu: true,
    totalItems: 32,
    cover: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=400&h=200'
  },
  {
    id: 3,
    name: 'Highlands Coffee',
    address: 'Tòa nhà Bitexco, Quận 1',
    hasMenu: false,
    totalItems: 0,
    cover: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=400&h=200'
  }
])
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold">Quán & Thực đơn</h1>
        <p class="text-base-content/70 mt-1">Quản lý danh sách các quán nước và thực đơn tương ứng.</p>
      </div>
      <button class="btn btn-primary shadow-sm" @click="isAddModalOpen = true">
        <Plus class="w-5 h-5" />
        Thêm Quán Mới
      </button>
    </div>

    <!-- Shop Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-4">
      <div v-for="shop in shops" :key="shop.id" class="card bg-base-100 shadow-sm border border-base-200 overflow-hidden hover:shadow-md transition-shadow">
        <figure class="h-40 relative group">
          <img :src="shop.cover" :alt="shop.name" class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <NuxtLink :to="`/shops/${shop.id}`" class="btn btn-sm btn-primary">
              <ExternalLink class="w-4 h-4 mr-1" />
              Xem chi tiết
            </NuxtLink>
          </div>
        </figure>
        <div class="card-body p-5">
          <h2 class="card-title text-lg flex justify-between items-start">
            {{ shop.name }}
            <button class="btn btn-ghost btn-sm btn-circle"><MoreVertical class="w-4 h-4"/></button>
          </h2>
          <p class="text-sm text-base-content/70 flex items-center gap-2 mt-1">
            <MapPin class="w-4 h-4" />
            {{ shop.address }}
          </p>
          
          <div class="divider my-2"></div>
          
          <div class="flex items-center justify-between mt-2">
            <div class="flex items-center gap-2">
              <div :class="['badge badge-sm gap-1', shop.hasMenu ? 'badge-success badge-outline' : 'badge-warning badge-outline']">
                {{ shop.hasMenu ? 'Đã có Menu' : 'Chưa có Menu' }}
              </div>
              <span v-if="shop.hasMenu" class="text-xs text-base-content/60 font-medium">{{ shop.totalItems }} món</span>
            </div>
            
            <div class="card-actions justify-end">
              <NuxtLink :to="`/shops/${shop.id}`" class="btn btn-sm" :class="shop.hasMenu ? 'btn-outline' : 'btn-primary'">
                <Coffee class="w-4 h-4" />
                {{ shop.hasMenu ? 'Quản lý Menu' : 'Tạo Menu' }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Shop Modal -->
    <dialog class="modal" :class="{ 'modal-open': isAddModalOpen }">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Thêm Quán Nước Mới</h3>
        
        <form @submit.prevent="isAddModalOpen = false" class="flex flex-col gap-4">
          <div class="form-control w-full">
            <label class="label"><span class="label-text font-medium">Tên quán</span></label>
            <input type="text" placeholder="Nhập tên quán..." class="input input-bordered w-full" required />
          </div>
          
          <div class="form-control w-full">
            <label class="label"><span class="label-text font-medium">Địa chỉ</span></label>
            <input type="text" placeholder="Nhập địa chỉ..." class="input input-bordered w-full" />
          </div>
          
          <div class="form-control w-full">
            <label class="label"><span class="label-text font-medium">URL Hình ảnh (Tuỳ chọn)</span></label>
            <input type="url" placeholder="https://..." class="input input-bordered w-full" />
          </div>

          <div class="modal-action mt-6">
            <button type="button" class="btn btn-ghost" @click="isAddModalOpen = false">Hủy</button>
            <button type="submit" class="btn btn-primary">Lưu thông tin</button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop" @click="isAddModalOpen = false">
        <button>close</button>
      </form>
    </dialog>
  </div>
</template>
