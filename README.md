# OfficeOrder - Team Order Dashboard

## Mô tả ứng dụng
**OfficeOrder** là giải pháp quản lý đặt nước và đồ ăn tập trung cho các nhóm hoặc công ty. Mục tiêu chính là giúp mọi người gom nhóm đơn hàng để đặt trực tiếp tại các quán ăn/nước thay vì phải sử dụng các ứng dụng trung gian như Grab hay Shopee Food, từ đó:
- **Tiết kiệm chi phí:** Giảm thiểu phí giao hàng và phí dịch vụ của các ứng dụng bên thứ ba.
- **Tận dụng ưu đãi:** Dễ dàng nhận các khuyến mãi khi mua số lượng lớn (Group buy).
- **Gom nhóm thông minh:** Quản trị viên tạo phiên, chia sẻ Link hoặc mã QR để mọi người cùng chọn món vào một giỏ hàng chung.

## Công nghệ sử dụng
- **Framework:** Nuxt 4 (Compatibility Mode)
- **Styling:** Tailwind CSS 4 & DaisyUI 5
- **State Management:** Pinia (Lưu trữ trạng thái thực đơn và phiên đặt hàng)
- **Validation:** Zod (Xác thực dữ liệu form và thực đơn)
- **Icons:** Lucide Vue
- **Xử lý dữ liệu:** XLSX (Hỗ trợ Import thực đơn từ Excel)

## Hướng dẫn cài đặt

### Yêu cầu hệ thống
- Node.js (Phiên bản LTS trở lên)
- pnpm (Trình quản lý gói khuyến nghị)

### Môi trường phát triển (Development)
1. Clone dự án:
   ```bash
   git clone git@github.com:NeihTzxc/OfficeOrder.git
   cd OfficeOrder
   ```
2. Cài đặt dependencies:
   ```bash
   pnpm install
   ```
3. Chạy server phát triển:
   ```bash
   pnpm run dev
   ```
   Mở trình duyệt và truy cập: `http://localhost:3000`

### Môi trường sản xuất (Production)
1. Xây dựng bản build tối ưu:
   ```bash
   pnpm run build
   ```
2. Xem trước (Preview) bản build trên máy cục bộ:
   ```bash
   pnpm run preview
   ```
3. Triển khai: Deploy thư mục `.output` lên các nền tảng hỗ trợ Nuxt/Node.js.

## Các tính năng chính
- **Quản lý Menu động:** Thiết lập món với nhiều Size và Topping linh hoạt.
- **Import Excel:** Tải danh sách món từ Excel, tự động phát hiện lỗi định dạng và cho phép sửa trực tiếp trên giao diện xem trước.
- **Live Session Monitoring:** Theo dõi số lượng món và tổng tiền của phiên đặt hàng theo thời gian thực.
- **Chia sẻ nhanh:** Hỗ trợ Copy link và hiển thị mã QR Code để mời thành viên tham gia đặt món nhanh chóng.
