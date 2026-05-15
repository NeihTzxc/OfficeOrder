<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ArrowLeft, Plus, Edit2, Trash2, Search, X, Check, FileSpreadsheet, UploadCloud, AlertCircle, CheckCircle2 } from 'lucide-vue-next'
import { ref, computed } from 'vue'
import * as XLSX from 'xlsx'
import { z } from 'zod'
import { useMenuStore } from '~/stores/menuStore'

const route = useRoute()
const shopId = route.params.id

// Store Integration
const menuStore = useMenuStore()
const menuCategories = computed(() => menuStore.categories)

// Mock data
const shopName = ref('Phúc Long Coffee & Tea')
const searchQuery = ref('')
const isAddItemModalOpen = ref(false)

const availableToppings = ref([
  { id: 't1', name: 'Trân châu đen', price: 10000 },
  { id: 't2', name: 'Trân châu trắng', price: 10000 },
  { id: 't3', name: 'Thạch rau câu', price: 8000 },
  { id: 't4', name: 'Kem phô mai (Macchiato)', price: 15000 },
  { id: 't5', name: 'Đào ngâm', price: 12000 }
])

const formatPrice = (price: number | string) => {
  const p = Number(price)
  if (isNaN(p)) return String(price)
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p)
}

// --- Add Item Form State & Validation ---
const newItem = ref({
  name: '',
  price: 0,
  desc: '',
  image: 'https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?w=400&h=400&fit=crop',
  hasSize: false,
  sizes: [{ name: 'Size M', price: 0 }, { name: 'Size L', price: 10000 }],
  hasTopping: false,
  selectedToppings: [] as string[]
})

const addSize = () => { newItem.value.sizes.push({ name: '', price: 0 }) }
const removeSize = (index: number) => { newItem.value.sizes.splice(index, 1) }

const previewSelectedSize = ref(0)
const previewSelectedToppings = ref<string[]>([])

const openAddModal = () => {
  newItem.value = {
    name: '', // Empty to test validation
    price: 0,
    desc: 'Món nước mới thêm vào menu',
    image: 'https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?w=400&h=400&fit=crop',
    hasSize: false,
    sizes: [{ name: 'Size M', price: 0 }, { name: 'Size L', price: 10000 }],
    hasTopping: false,
    selectedToppings: []
  }
  formErrors.value = {}
  previewSelectedSize.value = 0
  previewSelectedToppings.value = []
  isAddItemModalOpen.value = true
}

const previewTotalPrice = computed(() => {
  let total = Number(newItem.value.price) || 0
  if (newItem.value.hasSize && newItem.value.sizes.length > 0) {
    const sizePrice = Number(newItem.value.sizes[previewSelectedSize.value]?.price) || 0
    total += sizePrice
  }
  if (newItem.value.hasTopping) {
    previewSelectedToppings.value.forEach(tId => {
      const topping = availableToppings.value.find(t => t.id === tId)
      if (topping) total += topping.price
    })
  }
  return total
})

// Zod Schema Setup
const itemSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên món ăn/thức uống.'),
  price: z.number().min(0, 'Giá không được âm.'),
  desc: z.string().optional(),
  hasSize: z.boolean(),
  sizes: z.array(z.object({
    name: z.string().min(1, 'Tên Size không được để trống.'),
    price: z.number().min(0, 'Giá Size không được âm.')
  })).optional()
}).refine(data => {
  if (data.hasSize && (!data.sizes || data.sizes.length === 0)) return false;
  return true;
}, { message: 'Vui lòng thêm ít nhất 1 Size.', path: ['sizes'] });

const formErrors = ref<Record<string, string>>({});

const saveNewItem = () => {
  formErrors.value = {}
  
  // Validate with safeParse to avoid throw
  const result = itemSchema.safeParse(newItem.value)
  
  if (!result.success) {
    if (result.error && result.error.errors) {
      result.error.errors.forEach(e => {
        if (e.path && e.path.length) {
          formErrors.value[e.path.join('.')] = e.message
        }
      })
    }
    return
  }

  // Custom size array validation
  if (newItem.value.hasSize) {
     for (let i = 0; i < newItem.value.sizes.length; i++) {
         if (!newItem.value.sizes[i].name) {
             formErrors.value[`sizes.${i}.name`] = 'Tên size bắt buộc'
             return
         }
     }
  }

  // Save to Pinia store
  const targetCategoryId = menuCategories.value[0]?.id || 'c1'
  menuStore.addItem(targetCategoryId, newItem.value)
  
  isAddItemModalOpen.value = false
}

// --- Import Excel State & Logic ---
const isImportModalOpen = ref(false)
const isDragging = ref(false)
const importPreviewData = ref<any[]>([])

const handleDragOver = (e: DragEvent) => { e.preventDefault(); isDragging.value = true; }
const handleDragLeave = (e: DragEvent) => { e.preventDefault(); isDragging.value = false; }
const handleDrop = async (e: DragEvent) => {
  e.preventDefault();
  isDragging.value = false;
  if (e.dataTransfer?.files.length) {
    processFile(e.dataTransfer.files[0])
  }
}
const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files?.length) {
    processFile(target.files[0])
    target.value = ''
  }
}

const validateRow = (row: any) => {
  const price = Number(row.price)
  if (!row.name || row.name.trim() === '') return 'Thiếu tên món'
  if (isNaN(price)) return 'Giá không hợp lệ (Phải là số)'
  if (price < 0) return 'Giá không được âm'
  return ''
}

const processFile = (file: File) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target?.result as ArrayBuffer)
      const workbook = XLSX.read(data, { type: 'array' })
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      const json = XLSX.utils.sheet_to_json(worksheet)
      
      if (json.length === 0) {
        alert('File Excel trống hoặc không đúng định dạng.')
        return
      }

      importPreviewData.value = json.map((row: any, idx) => {
        const itemData = {
          id: idx,
          name: row['Tên món'] || row['name'] || row['Name'] || '',
          category: row['Danh mục'] || row['category'] || row['Category'] || 'Chưa phân loại',
          price: row['Giá'] || row['price'] || row['Price'] || '',
          error: ''
        }
        itemData.error = validateRow(itemData)
        return itemData
      })
    } catch (err) {
      console.error(err)
      alert('Lỗi khi đọc file.')
    }
  }
  reader.readAsArrayBuffer(file)
}

const loadMockData = () => {
  importPreviewData.value = [
    { id: 1, name: 'Trà Sữa Khoai Môn', category: 'Trà Sữa', price: 45000, error: '' },
    { id: 2, name: 'Trà Đào Cam Sả', category: 'Trà', price: '45k', error: 'Giá không hợp lệ (Phải là số)' },
    { id: 3, name: '', category: 'Cà Phê', price: 30000, error: 'Thiếu tên món' },
    { id: 4, name: 'Bánh Flan', category: 'Bánh Ngọt', price: 20000, error: '' },
    { id: 5, name: 'Latte', category: 'Cà Phê', price: -10000, error: 'Giá không được âm' }
  ]
}

const updateRowValidation = (row: any) => { row.error = validateRow(row) }
const importErrorCount = computed(() => importPreviewData.value.filter(r => r.error !== '').length)
const validItemsCount = computed(() => importPreviewData.value.filter(r => r.error === '').length)
</script>

<template>
  <div class="flex flex-col gap-6 relative">
    <!-- Header & Breadcrumb -->
    <div>
      <NuxtLink to="/shops" class="btn btn-sm btn-ghost gap-2 mb-2 -ml-2 text-base-content/70">
        <ArrowLeft class="w-4 h-4" />
        Quay lại danh sách
      </NuxtLink>
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-3xl font-bold flex items-center gap-3">
            {{ shopName }}
            <div class="badge badge-primary">Menu</div>
          </h1>
        </div>
        <div class="flex gap-2 w-full sm:w-auto">
          <button class="btn btn-outline btn-success flex-1 sm:flex-none shadow-sm" @click="isImportModalOpen = true">
            <FileSpreadsheet class="w-5 h-5" />
            Nhập từ Excel
          </button>
          <button class="btn btn-primary flex-1 sm:flex-none shadow-sm" @click="openAddModal">
            <Plus class="w-5 h-5" />
            Thêm Món
          </button>
        </div>
      </div>
    </div>

    <!-- Search / Filter -->
    <div class="bg-base-100 p-4 rounded-box shadow-sm border border-base-200 flex flex-col sm:flex-row gap-4">
      <div class="join w-full sm:max-w-md">
        <div class="relative w-full">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search class="h-5 w-5 text-base-content/50" />
          </div>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Tìm kiếm món ăn, thức uống..." 
            class="input input-bordered w-full pl-10 join-item"
          />
        </div>
      </div>
      <select class="select select-bordered w-full sm:w-xs">
        <option selected>Tất cả danh mục</option>
        <option v-for="cat in menuCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
      </select>
    </div>

    <!-- Menu Content (Pinia Store bound) -->
    <div class="space-y-8 mt-2">
      <div v-for="category in menuCategories" :key="category.id" class="space-y-4">
        <h2 class="text-xl font-bold border-b border-base-300 pb-2 flex items-center gap-2">
          {{ category.name }}
          <span class="badge badge-sm badge-neutral">{{ category.items.length }}</span>
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div 
            v-for="item in category.items" 
            :key="item.id" 
            class="card card-side bg-base-100 shadow-sm border border-base-200 hover:border-primary/50 transition-colors"
          >
            <figure class="w-32 sm:w-40 shrink-0">
              <img :src="item.image" :alt="item.name" class="w-full h-full object-cover" />
            </figure>
            <div class="card-body p-4 justify-between">
              <div>
                <h3 class="card-title text-base sm:text-lg leading-tight">{{ item.name }}</h3>
                <p class="text-sm text-base-content/60 mt-1 line-clamp-2">{{ item.desc }}</p>
              </div>
              <div class="flex items-center justify-between mt-2">
                <span class="font-bold text-primary">{{ formatPrice(item.price) }}</span>
                <div class="flex gap-1">
                  <button class="btn btn-square btn-ghost btn-sm text-base-content/70 hover:text-primary">
                    <Edit2 class="w-4 h-4" />
                  </button>
                  <button class="btn btn-square btn-ghost btn-sm text-base-content/70 hover:text-error">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ================= ADD ITEM MODAL ================= -->
    <dialog class="modal modal-bottom sm:modal-middle bg-base-200/80 backdrop-blur-sm" :class="{ 'modal-open': isAddItemModalOpen }">
      <div class="modal-box w-11/12 max-w-6xl p-0 overflow-hidden flex flex-col h-[90vh] sm:h-auto max-h-[90vh]">
        <div class="flex justify-between items-center p-4 sm:p-6 border-b border-base-200 bg-base-100 sticky top-0 z-10">
          <h3 class="font-bold text-xl sm:text-2xl text-primary flex items-center gap-2">
            <Plus class="w-6 h-6" /> Thêm món mới
          </h3>
          <button class="btn btn-sm btn-circle btn-ghost" @click="isAddItemModalOpen = false">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto bg-base-200/50">
          <div class="flex flex-col lg:flex-row h-full">
            <div class="flex-1 p-4 sm:p-6 space-y-8 bg-base-100">
              
              <section>
                <h4 class="text-lg font-bold mb-4 flex items-center gap-2"><div class="w-2 h-6 bg-primary rounded-full"></div>Thông tin cơ bản</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="form-control w-full">
                    <label class="label"><span class="label-text font-medium">Tên món</span></label>
                    <input v-model="newItem.name" type="text" placeholder="VD: Trà Đào Cam Sả" class="input input-bordered w-full" :class="{'input-error': formErrors['name']}" />
                    <span v-if="formErrors['name']" class="label-text-alt text-error mt-1">{{ formErrors['name'] }}</span>
                  </div>
                  <div class="form-control w-full">
                    <label class="label"><span class="label-text font-medium">Giá cơ bản (VNĐ)</span></label>
                    <input v-model.number="newItem.price" type="number" class="input input-bordered w-full" :class="{'input-error': formErrors['price']}" />
                    <span v-if="formErrors['price']" class="label-text-alt text-error mt-1">{{ formErrors['price'] }}</span>
                  </div>
                  <div class="form-control w-full md:col-span-2">
                    <label class="label"><span class="label-text font-medium">Mô tả</span></label>
                    <textarea v-model="newItem.desc" class="textarea textarea-bordered w-full" rows="2" placeholder="Nhập mô tả món..."></textarea>
                  </div>
                </div>
              </section>

              <div class="divider"></div>

              <section>
                <div class="flex items-center justify-between mb-4">
                  <h4 class="text-lg font-bold flex items-center gap-2"><div class="w-2 h-6 bg-secondary rounded-full"></div>Món này có Size?</h4>
                  <input type="checkbox" v-model="newItem.hasSize" class="toggle toggle-secondary" />
                </div>
                
                <div v-if="newItem.hasSize" class="bg-base-200/50 p-4 rounded-xl border border-base-200 space-y-3">
                  <span v-if="formErrors['sizes']" class="text-error text-xs block mb-2">{{ formErrors['sizes'] }}</span>
                  <div v-for="(size, index) in newItem.sizes" :key="index" class="flex flex-col gap-1">
                    <div class="flex items-center gap-2">
                      <input v-model="size.name" type="text" placeholder="Tên Size (M, L...)" class="input input-sm input-bordered flex-1" :class="{'input-error': formErrors[`sizes.${index}.name`]}" />
                      <input v-model.number="size.price" type="number" placeholder="Giá cộng thêm" class="input input-sm input-bordered w-32" />
                      <button class="btn btn-sm btn-square btn-ghost text-error" @click="removeSize(index)" :disabled="newItem.sizes.length <= 1">
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </div>
                    <span v-if="formErrors[`sizes.${index}.name`]" class="text-error text-xs">{{ formErrors[`sizes.${index}.name`] }}</span>
                  </div>
                  <button class="btn btn-sm btn-outline btn-secondary mt-2 w-full border-dashed" @click="addSize">
                    <Plus class="w-4 h-4" /> Thêm Size
                  </button>
                </div>
              </section>

              <div class="divider"></div>

              <section>
                <div class="flex items-center justify-between mb-4">
                  <h4 class="text-lg font-bold flex items-center gap-2"><div class="w-2 h-6 bg-accent rounded-full"></div>Món này có Topping?</h4>
                  <input type="checkbox" v-model="newItem.hasTopping" class="toggle toggle-accent" />
                </div>

                <div v-if="newItem.hasTopping" class="bg-base-200/50 p-4 rounded-xl border border-base-200">
                  <p class="text-sm text-base-content/70 mb-3">Tích chọn các topping cho phép add-on vào món này:</p>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label v-for="topping in availableToppings" :key="topping.id" class="cursor-pointer label justify-start gap-3 bg-base-100 p-3 rounded-lg border border-base-200 hover:border-accent/50 transition-colors">
                      <input type="checkbox" :value="topping.id" v-model="newItem.selectedToppings" class="checkbox checkbox-sm checkbox-accent" />
                      <div class="flex flex-col">
                        <span class="label-text font-medium">{{ topping.name }}</span>
                        <span class="text-xs text-base-content/60">+{{ formatPrice(topping.price) }}</span>
                      </div>
                    </label>
                  </div>
                </div>
              </section>
            </div>

            <!-- Preview UI (Right) -->
            <div class="w-full lg:w-[400px] border-l border-base-300 bg-base-200 flex flex-col">
              <div class="p-4 bg-base-200 font-medium text-center text-sm tracking-widest text-base-content/60 uppercase">
                Preview giao diện App
              </div>
              <div class="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center items-start">
                <div class="artboard artboard-demo phone-1 bg-base-100 rounded-[2.5rem] shadow-xl border-[8px] border-base-300 overflow-hidden relative flex flex-col justify-start max-w-[320px] w-full h-[650px]">
                  <div class="absolute top-0 inset-x-0 h-6 bg-base-300 rounded-b-3xl w-40 mx-auto z-20"></div>
                  <div class="w-full h-56 bg-base-300 relative shrink-0">
                    <img :src="newItem.image" class="w-full h-full object-cover" />
                    <button class="absolute top-8 left-4 btn btn-circle btn-sm btn-ghost bg-base-100/50 backdrop-blur">
                      <ArrowLeft class="w-4 h-4" />
                    </button>
                  </div>
                  <div class="flex-1 overflow-y-auto p-5 pb-24 w-full bg-base-100">
                    <h2 class="text-xl font-bold leading-tight">{{ newItem.name || 'Tên món' }}</h2>
                    <p class="text-primary font-bold text-lg mt-1">{{ formatPrice(newItem.price) }}</p>
                    <p class="text-sm text-base-content/70 mt-2 leading-relaxed">{{ newItem.desc || 'Mô tả chi tiết món ăn sẽ hiển thị tại đây cho khách hàng đọc.' }}</p>

                    <div v-if="newItem.hasSize && newItem.sizes.length > 0" class="mt-6">
                      <h3 class="font-bold mb-3 flex justify-between">Chọn Size <span class="text-error text-xs font-normal">Bắt buộc</span></h3>
                      <div class="space-y-2">
                        <label v-for="(size, idx) in newItem.sizes" :key="idx" class="flex items-center justify-between p-3 border border-base-200 rounded-xl cursor-pointer" :class="{'border-secondary bg-secondary/5': previewSelectedSize === idx}">
                          <div class="flex items-center gap-3">
                            <input type="radio" :value="idx" v-model="previewSelectedSize" class="radio radio-sm radio-secondary" />
                            <span class="font-medium">{{ size.name || 'Size' }}</span>
                          </div>
                          <span v-if="size.price > 0" class="text-sm text-base-content/70">+{{ formatPrice(size.price) }}</span>
                        </label>
                      </div>
                    </div>

                    <div v-if="newItem.hasTopping && newItem.selectedToppings.length > 0" class="mt-6">
                      <h3 class="font-bold mb-3 flex justify-between">Thêm Topping <span class="text-base-content/50 text-xs font-normal">Tùy chọn</span></h3>
                      <div class="space-y-2">
                        <template v-for="tId in newItem.selectedToppings" :key="tId">
                          <label v-if="availableToppings.find(t => t.id === tId)" class="flex items-center justify-between p-3 border border-base-200 rounded-xl cursor-pointer" :class="{'border-accent bg-accent/5': previewSelectedToppings.includes(tId)}">
                            <div class="flex items-center gap-3">
                              <input type="checkbox" :value="tId" v-model="previewSelectedToppings" class="checkbox checkbox-sm checkbox-accent" />
                              <span class="font-medium">{{ availableToppings.find(t => t.id === tId)?.name }}</span>
                            </div>
                            <span class="text-sm text-base-content/70">+{{ formatPrice(availableToppings.find(t => t.id === tId)?.price || 0) }}</span>
                          </label>
                        </template>
                      </div>
                    </div>
                  </div>
                  <div class="absolute bottom-0 inset-x-0 p-4 bg-base-100 border-t border-base-200 pb-8 z-10">
                    <button class="btn btn-primary w-full shadow-lg h-12 rounded-xl text-base">
                      Thêm • {{ formatPrice(previewTotalPrice) }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-base-100 p-4 border-t border-base-200 flex justify-end gap-3 sticky bottom-0 z-10">
          <button class="btn btn-ghost" @click="isAddItemModalOpen = false">Hủy bỏ</button>
          <button class="btn btn-primary" @click="saveNewItem">
            <Check class="w-5 h-5 mr-1" /> Lưu Món Này
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop" @click="isAddItemModalOpen = false">
        <button>close</button>
      </form>
    </dialog>

    <!-- Import Modal (Original code preserved) -->
    <!-- ... Rest of the Import Excel modal is the same, but simplified for brevity since it works ... -->
    <dialog class="modal bg-base-200/80 backdrop-blur-sm" :class="{ 'modal-open': isImportModalOpen }">
      <div class="modal-box w-11/12 max-w-5xl flex flex-col h-[85vh] p-0">
        <div class="flex justify-between items-center p-4 sm:p-6 border-b border-base-200 bg-base-100 sticky top-0 z-10">
          <h3 class="font-bold text-xl flex items-center gap-2">
            <FileSpreadsheet class="w-6 h-6 text-success" /> Nhập thực đơn từ Excel
          </h3>
          <button class="btn btn-sm btn-circle btn-ghost" @click="isImportModalOpen = false; importPreviewData = []">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="flex-1 flex flex-col p-4 sm:p-6 gap-6 overflow-hidden bg-base-200/50">
          <div v-if="importPreviewData.length === 0" class="flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all relative overflow-hidden" :class="isDragging ? 'border-primary bg-primary/10 scale-[0.98]' : 'border-base-300 bg-base-100 hover:border-primary/50 hover:bg-base-100/80'" @dragover.prevent="handleDragOver" @dragleave.prevent="handleDragLeave" @drop.prevent="handleDrop">
            <input type="file" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept=".xlsx, .xls" @change="handleFileSelect" />
            <div class="bg-base-200 p-4 rounded-full mb-4"><UploadCloud class="w-10 h-10 text-primary" :class="{'animate-bounce': isDragging}" /></div>
            <p class="font-bold text-xl text-base-content/80">Kéo thả file Excel vào đây</p>
            <p class="text-base-content/50 mt-2">hoặc click để chọn file (.xlsx, .xls)</p>
            <div class="mt-8 text-center relative z-20">
              <div class="divider text-xs text-base-content/40 w-48 mx-auto">HOẶC</div>
              <button class="btn btn-sm btn-outline btn-secondary" @click.stop="loadMockData">Dùng dữ liệu mẫu (Mock) để thử</button>
            </div>
          </div>

          <div v-else class="flex-1 flex flex-col min-h-0 bg-base-100 shadow-sm border border-base-200 rounded-xl overflow-hidden">
            <div class="bg-base-200/50 px-5 py-3 border-b border-base-200 flex justify-between items-center">
              <span class="font-semibold flex items-center gap-2">Preview Dữ liệu <span class="badge badge-sm badge-neutral">{{ importPreviewData.length }} dòng</span></span>
              <div class="flex items-center gap-2">
                <span v-if="importErrorCount > 0" class="badge badge-error gap-1"><AlertCircle class="w-3 h-3"/> {{ importErrorCount }} lỗi</span>
                <span v-else class="badge badge-success gap-1"><CheckCircle2 class="w-3 h-3"/> Hợp lệ 100%</span>
                <button class="btn btn-xs btn-ghost text-base-content/60" @click="importPreviewData = []">Tải file khác</button>
              </div>
            </div>
            
            <div class="flex-1 overflow-auto bg-base-100">
              <table class="table table-pin-rows table-pin-cols w-full">
                <thead><tr class="bg-base-200/50 text-base-content/70"><th class="w-16 text-center">#</th><th class="w-1/3">Tên món</th><th class="w-1/4">Danh mục</th><th class="w-1/5">Giá (VNĐ)</th><th>Trạng thái</th></tr></thead>
                <tbody>
                  <tr v-for="(row, idx) in importPreviewData" :key="row.id" :class="{'bg-error/5 hover:bg-error/10': row.error, 'hover:bg-base-200/50': !row.error}" class="transition-colors group">
                    <td class="text-center text-base-content/50 font-medium">{{ idx + 1 }}</td>
                    <td><input v-model="row.name" @input="updateRowValidation(row)" class="input input-sm w-full bg-transparent border-transparent hover:border-base-300 focus:bg-base-100 focus:border-primary transition-all" :class="{'input-error !border-error': !row.name}" /></td>
                    <td><input v-model="row.category" @input="updateRowValidation(row)" class="input input-sm w-full bg-transparent border-transparent hover:border-base-300 focus:bg-base-100 focus:border-primary transition-all" /></td>
                    <td><div class="relative"><input v-model="row.price" @input="updateRowValidation(row)" class="input input-sm w-full bg-transparent border-transparent hover:border-base-300 focus:bg-base-100 focus:border-primary transition-all pr-8" :class="{'input-error !border-error text-error font-bold': row.error && row.error.includes('Giá')}" /><span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-base-content/40 pointer-events-none group-hover:opacity-0 focus-within:opacity-0 transition-opacity">₫</span></div></td>
                    <td><div v-if="row.error" class="flex items-center gap-1.5 text-error text-sm font-medium bg-error/10 px-2 py-1 rounded-md w-fit"><AlertCircle class="w-4 h-4 shrink-0" /> <span class="line-clamp-1">{{ row.error }}</span></div><div v-else class="flex items-center gap-1.5 text-success text-sm font-medium px-2 py-1"><CheckCircle2 class="w-4 h-4 shrink-0" /> Hợp lệ</div></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="bg-base-100 p-4 border-t border-base-200 flex justify-end gap-3 sticky bottom-0 z-10">
          <button class="btn btn-ghost" @click="isImportModalOpen = false; importPreviewData = []">Hủy</button>
          <button class="btn btn-primary shadow-sm" :disabled="importPreviewData.length === 0 || importErrorCount > 0" @click="isImportModalOpen = false">Xác nhận Lưu <span v-if="validItemsCount > 0">({{ validItemsCount }} món)</span></button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop" @click="isImportModalOpen = false; importPreviewData = []"><button>close</button></form>
    </dialog>
  </div>
</template>
