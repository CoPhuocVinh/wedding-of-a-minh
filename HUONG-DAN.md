# Hướng dẫn cài đặt & đưa thiệp cưới lên mạng

Gồm 3 bước: (1) tạo Google Sheet + Apps Script làm nơi lưu dữ liệu, (2) đưa web lên Vercel, (3) dùng trang `/admin`.

---

## Bước 1 — Google Sheet + Apps Script (~5 phút)

1. Vào [sheets.new](https://sheets.new) tạo một Google Sheet mới, đặt tên ví dụ **"Thiệp cưới Minh & Linh"**.
2. Menu **Tiện ích mở rộng → Apps Script**.
3. Xoá hết code mẫu trong `Code.gs`, dán toàn bộ nội dung file [`apps-script/Code.gs`](apps-script/Code.gs) vào → bấm 💾 **Lưu**.
4. Ở thanh trên, chọn hàm **`setup`** → bấm **▶ Chạy**.
   - Google hỏi cấp quyền → **Xem xét quyền** → chọn tài khoản của bạn.
   - Nếu hiện "Google chưa xác minh ứng dụng này": bấm **Nâng cao → Đi tới … (không an toàn)** → **Cho phép**. (Đây là script của chính bạn nên an toàn.)
5. Xem **Nhật ký thực thi** bên dưới, copy dòng **`SECRET = …`** (chuỗi dài). Đây là `APPS_SCRIPT_SECRET`.
   - Sheet sẽ có thêm 3 tab: `content`, `guests`, `wishes`. Drive có thêm thư mục **"Thiệp cưới - Ảnh & nhạc"**.
6. Bấm **Triển khai → Tuỳ chọn triển khai mới**:
   - Bánh răng ⚙ → **Ứng dụng web**
   - **Thực thi dưới dạng:** Tôi
   - **Người có quyền truy cập:** Bất kỳ ai
   - Bấm **Triển khai**, copy **URL ứng dụng web** (dạng `https://script.google.com/macros/s/…/exec`). Đây là `APPS_SCRIPT_URL`.

> Link Web App không lộ dữ liệu: mọi yêu cầu phải kèm `SECRET`, và SECRET chỉ nằm trên server Vercel.

**Khi cần cập nhật code Apps Script sau này:** dán code mới → Lưu → **Triển khai → Quản lý triển khai → ✏️ → Phiên bản: Phiên bản mới → Triển khai**. URL giữ nguyên, không phải sửa gì trên Vercel.

---

## Bước 2 — Đưa lên Vercel (~10 phút)

### 2.1 Đưa code lên GitHub
1. Tạo repo mới (để **Private**) trên [github.com/new](https://github.com/new), ví dụ `wedding-minh-linh`.
2. Trong thư mục dự án:
   ```bash
   git init
   git add .
   git commit -m "Thiệp cưới Minh & Linh"
   git branch -M main
   git remote add origin https://github.com/<tên-bạn>/wedding-minh-linh.git
   git push -u origin main
   ```

### 2.2 Tạo project trên Vercel
1. Vào [vercel.com/new](https://vercel.com/new) → đăng nhập bằng GitHub → **Import** repo vừa tạo.
2. Mở mục **Environment Variables**, thêm:

   | Name | Value |
   |---|---|
   | `STORAGE_DRIVER` | `apps-script` |
   | `APPS_SCRIPT_URL` | URL ở bước 1.6 |
   | `APPS_SCRIPT_SECRET` | SECRET ở bước 1.5 |
   | `ADMIN_USERNAME` | *(tuỳ chọn, mặc định `admin`)* |
   | `ADMIN_PASSWORD` | *(tuỳ chọn, mặc định `admin`)* |

3. Bấm **Deploy**. Khoảng 1–2 phút sau có link dạng `https://wedding-minh-linh.vercel.app`.

> ⚠️ Phải nhập đủ 3 biến đầu **trước** khi Deploy — lúc build Vercel sẽ đọc dữ liệu từ Sheet.
>
> ⚠️ Nếu để mặc định `admin` / `admin`, ai đoán được là vào sửa/xoá được khách mời. Nên đặt `ADMIN_PASSWORD` riêng rồi **Redeploy** (Deployments → ⋯ → Redeploy).

**Tên miền riêng (tuỳ chọn):** Vercel → Project → **Settings → Domains** → thêm tên miền bạn đã mua, làm theo hướng dẫn trỏ DNS.

**Cập nhật code sau này:** `git add . && git commit -m "…" && git push` → Vercel tự deploy lại.

---

## Bước 3 — Dùng trang quản trị

Vào `https://<link-của-bạn>/admin` → đăng nhập.

| Tab | Làm gì |
|---|---|
| **Nội dung** | Tên, bố mẹ, lịch nhà trai/nhà gái (âm lịch tự tính), ảnh bìa, dress code, số tài khoản + QR mừng cưới, tiêu đề/ảnh khi chia sẻ link |
| **Ảnh** | Tải nhiều ảnh cùng lúc, kéo thả sắp xếp album, xoá, "Đặt làm…" ảnh bìa / nền đếm ngược / ảnh cảm ơn / thumbnail |
| **Các phần** | Kéo thả đổi thứ tự các phần, bật/tắt, sửa tiêu đề |
| **Khách mời** | Chọn Nhà trai / Nhà gái → dán danh sách (mỗi dòng một khách, vd `Anh Phước Vinh`) → Xem trước → Lưu. Mỗi khách có nút **Copy link** và **Copy lời mời** để gửi Zalo |
| **Lời chúc** | Ẩn / xoá lời chúc khách gửi |

**Đường dẫn:**
- `/` — thiệp chung nhà trai · `/ten-khach` — khách nhà trai
- `/g` — thiệp chung nhà gái · `/g/ten-khach` — khách nhà gái

**Lần đầu:** Sheet còn trống nên web dùng dữ liệu có sẵn trong code (đã điền thông tin từ thiệp giấy). Lần đầu bạn sửa và bấm **Lưu thay đổi**, dữ liệu sẽ được ghi vào Sheet. Danh sách khách bắt đầu trống — thêm khách ở tab **Khách mời**.

**Mẹo:**
- Sửa trong admin → thiệp cập nhật ngay. Sửa tay trực tiếp trong Sheet → tối đa 5 phút sau mới hiện.
- Ảnh và nhạc lưu trong Drive thư mục "Thiệp cưới - Ảnh & nhạc". Xoá trong admin thì file trên Drive vào thùng rác (chỉ khi không còn dùng ở đâu).
- Ảnh đẹp nhất khi dùng file gốc (gửi qua Drive/cáp, **không** qua Zalo vì Zalo nén ảnh). Web tự nén còn tối đa 2400px khi tải lên.
- Đổi nhạc nền: thay file `public/music/nhac-nen.mp3` rồi push lại.

---

## Chạy trên máy (cho người sửa code)

```bash
pnpm install
pnpm dev            # http://localhost:3000, admin: admin / admin
```

Mặc định `.env.local` dùng `STORAGE_DRIVER=local` (lưu vào `data/db.local.json` + `public/uploads/`). Muốn dùng Sheet thật khi chạy máy, copy `.env.example` thành `.env.local` và điền giá trị.
