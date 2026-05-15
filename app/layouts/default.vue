<template>
  <div class="drawer lg:drawer-open">
    <input id="main-drawer" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content flex flex-col min-h-screen bg-base-200">
      <!-- Navbar / Header -->
      <Header />
      
      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <slot />
      </main>
    </div> 
    
    <div class="drawer-side z-50">
      <label for="main-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
      <Sidebar />
    </div>
  </div>
</template>
