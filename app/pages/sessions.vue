<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Plus, Link as LinkIcon, QrCode, Coffee, Users, Clock, Lock, CheckCircle2, X, Copy, ExternalLink, CalendarClock } from 'lucide-vue-next'

// Mock Data
const sessions = ref([
  {
    id: 'SESSION-001',
    shopName: 'Phúc Long Coffee & Tea',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=200&h=200',
    status: 'open', // open, locked, completed
    itemCount: 15,
    participantCount: 12,
    totalAmount: 750000,
    createdAt: '14:30',
    deadline: '16:00 hôm nay'
  },
  {
    id: 'SESSION-002',
    shopName: 'The Coffee House',
    image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=200&h=200',
    status: 'locked',
    itemCount: 8,
    participantCount: 8,
    totalAmount: 320000,
    createdAt: '09:00',
    deadline: '10:30 hôm nay'
  },
  {
    id: 'SESSION-003',
    shopName: 'Highlands Coffee',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=200&h=200',
    status: 'completed',
    itemCount: 24,
    participantCount: 20,
    totalAmount: 1250000,
    createdAt: 'Hôm qua',
    deadline: 'Hôm qua'
  }
])

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

const getStatusColor = (status: string) => {
  if (status === 'open') return 'badge-success bg-success/10 text-success border-success/20'
  if (status === 'locked') return 'badge-warning bg-warning/10 text-warning-700 border-warning/20'
  return 'badge-neutral bg-base-300 text-base-content/70 border-base-300'
}

const getStatusLabel = (status: string) => {
  if (status === 'open') return 'Đang mở'
  if (status === 'locked') return 'Đã chốt (Khóa)'
  return 'Đã hoàn thành'
}

const getStatusIcon = (status: string) => {
  if (status === 'open') return Coffee
  if (status === 'locked') return Lock
  return CheckCircle2
}

// Simulating Real-time updates for "Open" sessions
let interval: any
onMounted(() => {
  interval = setInterval(() => {
    const openSession = sessions.value.find(s => s.status === 'open')
    if (openSession && Math.random() > 0.6) {
      openSession.itemCount += 1
      if (Math.random() > 0.5) openSession.participantCount += 1
      openSession.totalAmount += Math.floor(Math.random() * 20000 + 30000)
    }
  }, 4000)
})
onUnmounted(() => {
  clearInterval(interval)
})

// QR Code Modal State
const isQrModalOpen = ref(false)
const activeQrSession = ref<any>(null)
const openQrModal = (session: any) => {
  activeQrSession.value = session
  isQrModalOpen.value = true
}

// Toast state
const showToast = ref(false)
const copyLink = (session: any) => {
  showToast.value = true
  setTimeout(() => showToast.value = false, 3000)
}
</script>

<template>
  <div class="flex flex-col gap-6 relative">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold">Phiên đặt nước</h1>
        <p class="text-base-content/70 mt-1">Quản lý và theo dõi các đơn đặt chung theo thời gian thực.</p>
      </div>
      <button class="btn btn-primary shadow-sm">
        <Plus class="w-5 h-5" />
        Tạo Phiên Mới
      </button>
    </div>
    
    <!-- Sessions List -->
    <div class="flex flex-col gap-4">
      <div 
        v-for="session in sessions" 
        :key="session.id"
        class="bg-base-100 rounded-2xl p-4 sm:p-5 border shadow-sm transition-all flex flex-col lg:flex-row gap-5 items-start lg:items-center"
        :class="session.status === 'open' ? 'border-primary shadow-primary/10' : 'border-base-200'"
      >
        <!-- Shop Info & Status -->
        <div class="flex gap-4 w-full lg:w-1/3">
          <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-base-200">
            <img :src="session.image" class="w-full h-full object-cover" />
          </div>
          <div class="flex flex-col justify-center">
            <div class="flex items-center gap-2 mb-1">
              <span class="badge badge-sm font-medium border" :class="getStatusColor(session.status)">
                <component :is="getStatusIcon(session.status)" class="w-3 h-3 mr-1" />
                {{ getStatusLabel(session.status) }}
              </span>
              <span v-if="session.status === 'open'" class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
            </div>
            <h3 class="font-bold text-lg leading-tight">{{ session.shopName }}</h3>
            <p class="text-xs text-base-content/60 mt-1 font-mono">{{ session.id }}</p>
          </div>
        </div>

        <!-- Live Stats -->
        <div class="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full bg-base-200/50 p-3 sm:p-4 rounded-xl border border-base-200">
          <div class="flex flex-col">
            <span class="text-xs text-base-content/60 flex items-center gap-1 mb-1"><Users class="w-3 h-3"/> Người đặt</span>
            <span class="font-bold text-lg" :class="{'text-primary transition-all duration-300': session.status === 'open'}">{{ session.participantCount }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-xs text-base-content/60 flex items-center gap-1 mb-1"><Coffee class="w-3 h-3"/> Số món</span>
            <span class="font-bold text-lg" :class="{'text-primary transition-all duration-300': session.status === 'open'}">{{ session.itemCount }}</span>
          </div>
          <div class="flex flex-col col-span-2 sm:col-span-2">
            <span class="text-xs text-base-content/60 flex items-center gap-1 mb-1"><CalendarClock class="w-3 h-3"/> Hạn chốt</span>
            <span class="font-semibold text-sm">{{ session.deadline }}</span>
          </div>
        </div>

        <!-- Total & Actions -->
        <div class="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between w-full lg:w-auto gap-4 lg:gap-2">
          <div class="flex flex-col items-start lg:items-end w-full sm:w-auto">
            <span class="text-xs text-base-content/60 mb-0.5">Tổng tạm tính</span>
            <span class="font-bold text-xl text-primary" :class="{'transition-all duration-300': session.status === 'open'}">
              {{ formatPrice(session.totalAmount) }}
            </span>
          </div>
          <div class="flex gap-2 w-full sm:w-auto">
            <div class="join w-full sm:w-auto" v-if="session.status === 'open'">
              <button class="btn btn-sm btn-outline join-item flex-1 sm:flex-none" @click="copyLink(session)" title="Copy Link">
                <LinkIcon class="w-4 h-4" />
              </button>
              <button class="btn btn-sm btn-outline join-item flex-1 sm:flex-none" @click="openQrModal(session)" title="Mã QR">
                <QrCode class="w-4 h-4" />
              </button>
            </div>
            <button class="btn btn-sm flex-1 sm:flex-none" :class="session.status === 'open' ? 'btn-primary' : 'btn-outline'">
              Chi tiết
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- QR Code Modal -->
    <dialog class="modal modal-bottom sm:modal-middle bg-base-200/80 backdrop-blur-sm" :class="{ 'modal-open': isQrModalOpen }">
      <div class="modal-box text-center p-8">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-4 top-4" @click="isQrModalOpen = false">
          <X class="w-5 h-5" />
        </button>
        
        <h3 class="font-bold text-2xl mb-2">Mời tham gia</h3>
        <p class="text-base-content/70 mb-6">Quét mã QR dưới đây để cùng đặt nước tại <br><strong class="text-base-content">{{ activeQrSession?.shopName }}</strong></p>
        
        <div class="bg-white p-4 rounded-2xl inline-block shadow-md border border-base-200 mb-6">
          <!-- Mock QR Code using external API -->
          <img :src="`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://teamorder.app/join/${activeQrSession?.id}`" class="w-48 h-48" alt="QR Code" />
        </div>
        
        <div class="flex gap-2 justify-center">
          <button class="btn btn-outline" @click="copyLink(activeQrSession)">
            <Copy class="w-4 h-4 mr-1" /> Copy Link
          </button>
          <button class="btn btn-primary" @click="isQrModalOpen = false">Đóng</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop" @click="isQrModalOpen = false">
        <button>close</button>
      </form>
    </dialog>

    <!-- Toast Notification -->
    <div class="toast toast-top toast-center z-50 transition-all duration-300" :class="showToast ? 'translate-y-0 opacity-100' : '-translate-y-24 opacity-0'">
      <div class="alert alert-success shadow-lg">
        <CheckCircle2 class="w-5 h-5" />
        <span>Đã copy link mời tham gia!</span>
      </div>
    </div>

  </div>
</template>
