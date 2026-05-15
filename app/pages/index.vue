<template>
  <div class="flex flex-col gap-6">
    <h1 class="text-3xl font-bold">Dashboard</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="stat bg-base-100 rounded-box shadow">
        <div class="stat-title">Phiên đang mở</div>
        <div class="stat-value text-primary">2</div>
        <div class="stat-desc">21 ly đang chờ</div>
      </div>
      
      <div class="stat bg-base-100 rounded-box shadow">
        <div class="stat-title">Tổng đơn hôm nay</div>
        <div class="stat-value text-secondary">45</div>
        <div class="stat-desc">↗︎ 14% so với hôm qua</div>
      </div>
      
      <div class="stat bg-base-100 rounded-box shadow">
        <div class="stat-title">Thành viên nợ tiền</div>
        <div class="stat-value text-error">5</div>
        <div class="stat-desc">Tổng cộng: 150.000đ</div>
      </div>
      
      <div class="stat bg-base-100 rounded-box shadow">
        <div class="stat-title">Tổng chi tiêu tháng</div>
        <div class="stat-value">2.4M</div>
        <div class="stat-desc">↘︎ 90.000đ</div>
      </div>
    </div>
  </div>
</template>
