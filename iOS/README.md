# Lexi iOS

Ứng dụng học tiếng Anh native SwiftUI (iOS 17+) dành cho iPhone, hỗ trợ biên dịch, kiểm thử và nạp trực tiếp lên iPhone thật từ cả **Linux** và **Windows** mà không cần máy tính macOS (sử dụng Swift Toolchain, `xtool` và `usbmuxd`).

---

## 📌 Trạng thái dự án (Project Status)

- **Mốc hiện tại:** Phase 11 — Phiên bản `0.2.0 (2)`.
- **Kiểm thử:** **177 Swift unit tests PASS**, hệ thống build iOS PASS.
- **Tính năng cốt lõi:**
  - Hệ thống 5 tab: Dashboard, Học (Tutor, Grammar, Writing, Conversation), Ôn tập (Review, Flashcards theo vòng 10 từ, Quiz), Tra từ & Từ vựng, Cài đặt.
  - Xử lý âm thanh & phát âm: TTS giọng đọc bản xứ, thu âm WAV, nghe lại và gửi chấm phát âm qua backend.
  - Quản lý tài khoản & bảo mật: Xóa tài khoản, quyền đồng ý xử lý AI/audio (`LexiAIEnabled`, `LexiAudioEnabled`), lưu từ vựng thủ công khi tắt AI, log redaction.
- **Tài liệu chi tiết:**
  - [Trạng thái Phase 11](docs/ios-phase11-status.md) | [Bằng chứng Phase 11](docs/evidence/phase11-verification-2026-10-20.md) | [Kế hoạch tổng thể](docs/LEXI_IOS_MASTER_IMPLEMENTATION_PLAN.md)
  - [Sổ tay giải quyết sự cố WSL & xtool](docs/LEXI_IOS_TROUBLESHOOTING_WSL_XTOOL.md) | [Runbook kết nối iPhone từ Windows](docs/ios-windows-device.md)

---

## ⚙️ Yêu cầu hệ thống (Prerequisites)

1. **Thiết bị & Phần cứng:**
   - iPhone thật chạy iOS 17+ (đã bật **Developer Mode** và chọn **Tin cậy máy tính** khi cắm cáp).
   - Cáp kết nối USB Lightning/Type-C truyền dữ liệu tốt.
   - Tài khoản Apple ID cá nhân (dùng để ký mã tự động thông qua xtool, không bắt buộc tài khoản trả phí Apple Developer Program).
2. **Công cụ phát triển (Toolchain):**
   - **Swift Toolchain:** Swift 6.0 trở lên.
   - **Darwin SDK:** iOS SDK (trích xuất từ Apple Xcode `.xip` thông qua `xtool setup`).
   - **xtool:** Bộ công cụ mã nguồn mở hỗ trợ build, sign và deploy app iOS trên Linux/Windows.
   - **usbmuxd & libimobiledevice:** Dịch vụ và thư viện giao tiếp với thiết bị iOS qua cổng USB.

---

## 🐧 Hướng dẫn dành cho Linux (Native Linux)

Dành cho các hệ điều hành Linux trực tiếp (Ubuntu, Debian, Fedora, Arch Linux...).

### 1. Cài đặt các gói phụ thuộc hệ thống

- **Trên Ubuntu / Debian (22.04 / 24.04):**
  ```bash
  sudo apt-get update
  sudo apt-get install -y \
    ca-certificates curl git gnupg2 binutils libc6-dev libcurl4-openssl-dev \
    libedit2 libgcc-13-dev libncurses-dev libpython3-dev libsqlite3-0 \
    libstdc++-13-dev libxml2-dev libz3-dev pkg-config tzdata zip unzip zlib1g-dev \
    usbmuxd libimobiledevice-utils usbutils libfuse2t64 rsync
  ```

- **Trên Fedora (40+):**
  ```bash
  sudo dnf install -y \
    curl git usbmuxd libimobiledevice-utils usbutils fuse-libs rsync \
    binutils gcc-c++ libcurl-devel libxml2-devel libedit-devel sqlite-devel
  ```

- **Trên Arch Linux:**
  ```bash
  sudo pacman -S usbmuxd libimobiledevice usbutils rsync git curl
  ```

### 2. Cài đặt Swift & xtool & Darwin SDK

1. **Cài đặt Swift Toolchain (Swift 6.x):**
   - Tải Swift từ trang chủ [swift.org/download](https://www.swift.org/download/) phù hợp với distro của bạn.
   - Hoặc tham khảo script cài đặt: `bash scripts/install-wsl-toolchain.sh` (áp dụng cho Ubuntu 24.04).
   - Đảm bảo lệnh `swift --version` hiển thị đúng phiên bản và nằm trong biến môi trường `$PATH`.

2. **Cài đặt xtool:**
   - Tải `xtool-x86_64.AppImage` từ [xtool releases](https://github.com/xtool-org/xtool/releases).
   - Cấp quyền thực thi và đưa vào thư mục binary người dùng:
     ```bash
     chmod +x xtool-x86_64.AppImage
     mkdir -p ~/.local/bin
     mv xtool-x86_64.AppImage ~/.local/bin/xtool
     export PATH="$HOME/.local/bin:$PATH"
     ```

3. **Cài đặt Darwin SDK cho xtool:**
   - Tải file `Xcode_*.xip` từ trang Apple Developer.
   - Tiến hành nạp SDK bằng lệnh `xtool sdk install`:
     ```bash
     xtool sdk install /path/to/Xcode_xx.xip
     # Hoặc thêm cờ --slim để tiết kiệm dung lượng ổ cứng:
     xtool sdk install /path/to/Xcode_xx.xip --slim
     ```
   - Xác minh trạng thái SDK:
     ```bash
     xtool sdk status
     # hoặc:
     swift sdk list
     ```

### 3. Kết nối iPhone trên Linux

1. Cắm cáp USB iPhone vào máy tính.
2. Khởi động dịch vụ `usbmuxd` (udev cũng sẽ tự động kích hoạt dịch vụ này khi cắm iPhone):
   ```bash
   sudo systemctl start usbmuxd
   ```
3. Mở khóa màn hình iPhone -> Nhấn **"Tin cậy máy tính này" (Trust this computer)** và nhập mật mã mở khóa.
   - Thực hiện ghép đôi bảo mật từ Linux:
     ```bash
     idevicepair pair
     # Kiểm tra ghép đôi thành công:
     idevicepair validate
     ```
4. Bật **Developer Mode** trên iPhone (nếu chưa bật):
   - Mở *Cài đặt (Settings)* > *Quyền riêng tư & Bảo mật (Privacy & Security)* > *Chế độ nhà phát triển (Developer Mode)*.
   - Gạt bật và khởi động lại iPhone theo hướng dẫn trên màn hình.
5. Kiểm tra thiết bị trong terminal:
   ```bash
   # Kiểm tra đọc thông tin thiết bị
   ideviceinfo -k ProductType
   
   # Kiểm tra xtool nhận diện thiết bị qua USB (bắt buộc dùng cờ --usb để tránh lỗi quyền quét mạng)
   xtool devices --usb --no-wait
   ```

### 4. Build, Test và Deploy trên Linux

```bash
# Di chuyển vào thư mục dự án iOS
cd iOS

# 1. Chạy unit tests (chạy core models/actors trên Linux)
swift test

# 2. Đăng nhập Apple ID để ký app (chỉ cần làm lần đầu tiên)
xtool auth
# Chọn chế độ 1 (Password) nếu dùng Apple ID miễn phí, hoặc 0 nếu có tài khoản Developer trả phí

# 3. Build thử nghiệm ứng dụng iOS
xtool dev build

# 4. Biên dịch, tự động ký mã và nạp trực tiếp lên iPhone qua USB
xtool dev
# Hoặc chỉ định rõ cờ --usb:
xtool dev run --usb
```

> 📱 **Lưu ý mở app lần đầu trên iPhone (Untrusted Developer):**  
> Khi cài app bằng Apple ID cá nhân miễn phí, nếu bấm vào app mà iOS hiện thông báo *"Nhà phát triển không đáng tin cậy"*:  
> 1. Vào **Cài đặt (Settings)** > **Cài đặt chung (General)**.  
> 2. Chọn **Quản lý VPN & Thiết bị (VPN & Device Management)**.  
> 3. Chọn Apple ID của bạn > Nhấn **Tin cậy (Trust)**.  
> Sau bước này bạn có thể mở và sử dụng app bình thường.

---

## 🪟 Hướng dẫn dành cho Windows (Windows 10/11 + WSL2)

Mô hình hoạt động: Bạn có thể viết mã trên Windows (bằng VS Code/Cursor), lưu trữ mã nguồn trên ổ Windows (ví dụ: `D:\LearnEnglish\Lexi\iOS`), và sử dụng **WSL2** để chạy Swift + `xtool` nhằm biên dịch và nạp app lên iPhone.

```text
[ Windows Host ] ──(Quản lý USB / Apple Service)──► [ iPhone ]
       │                                                   ▲
       │ (Code / Socket 27015)                             │ (Deploy app)
       ▼                                                   │
 [ WSL2 Ubuntu ] ──(Swift + xtool dev)──────────────────────┘
```

### 1. Chuẩn bị môi trường WSL2

1. Khởi tạo một máy ảo WSL2 Ubuntu (ví dụ: `LexiUbuntu` dựa trên Ubuntu 24.04):
   ```powershell
   wsl --install -d Ubuntu-24.04
   ```
2. Trong terminal của WSL2, chạy các script thiết lập toolchain đã chuẩn bị sẵn:
   ```bash
   # Chạy bằng quyền root để cài các package cơ sở
   sudo bash scripts/bootstrap-wsl-root.sh

   # Cài đặt Swift toolchain và xtool (chạy với user thường)
   bash scripts/install-wsl-toolchain.sh

   # Nạp biến môi trường cho phiên làm việc
   source ~/.local/share/lexi-ios/env.sh
   ```

### 2. Kết nối iPhone từ Windows vào WSL2

Có 2 phương pháp kết nối. **Phương án 1 là phương án được khuyến nghị nhất** vì đã kiểm chứng cài đặt thành công 100% và không bị kẹt ở bước `[Connecting] 100%`.

#### 🔹 Phương án 1 (Khuyên dùng): Windows Socket Relay qua cổng 27015

Trong cơ chế này, Windows giữ quyền quản lý USB của iPhone qua **Apple Mobile Device Service (AMDS)**. Socket lắng nghe tại `127.0.0.1:27015` trên Windows sẽ chuyển tiếp tín hiệu cho WSL2.

1. **Cắm iPhone vào Windows qua cáp USB**, mở khóa màn hình và chọn **Tin cậy (Trust)**.
2. **Kiểm tra trên Windows (PowerShell Administrator):**
   ```powershell
   # Đảm bảo dịch vụ Apple Mobile Device Service đang chạy
   Get-Service -Name "Apple Mobile Device Service"
   
   # Nếu dịch vụ chưa chạy:
   Start-Service -Name "Apple Mobile Device Service"

   # Kiểm tra cổng 27015 đang lắng nghe (Listen)
   Test-NetConnection 127.0.0.1 -Port 27015
   ```
3. **Trong WSL2**, trỏ biến môi trường về Windows:
   ```bash
   export USBMUXD_SOCKET_ADDRESS=127.0.0.1:27015

   # Kiểm tra nhận diện thiết bị
   ideviceinfo -k ProductType
   xtool devices --no-wait
   ```

#### 🔹 Phương án 2: USB Passthrough bằng `usbipd-win`

Nếu bạn muốn chuyển tiếp toàn bộ cổng USB vật lý trực tiếp vào máy ảo WSL2:
1. Cài đặt `usbipd-win` trên Windows.
2. Trên PowerShell (Administrator):
   ```powershell
   # Liệt kê thiết bị và lấy BUSID của iPhone (VID:PID 05ac:12a8)
   usbipd list

   # Chia sẻ thiết bị (ví dụ BUSID là 1-2)
   usbipd bind --busid 1-2

   # Gắn thiết bị vào máy ảo WSL2
   usbipd attach --wsl LexiUbuntu --busid 1-2
   ```
3. Trong WSL2:
   ```bash
   lsusb
   sudo service usbmuxd restart
   ideviceinfo -k ProductType
   ```
> ⚠️ **Lưu ý:** Nếu gặp lỗi `Device busy (exported)`, dùng `usbipd bind --force --busid <BUSID>` và rút/cắm lại cáp USB. Nếu `xtool dev` bị kẹt ở `[Connecting] 100%`, hãy ngắt attach (`usbipd detach` & `usbipd unbind`) và chuyển hẳn về **Phương án 1 (Socket Relay)**.

### 3. Quy trình đồng bộ mã & triển khai từ Windows

Để tránh suy giảm hiệu năng biên dịch qua hệ thống file mount `/mnt/d/`, hãy đồng bộ mã từ thư mục làm việc Windows sang thư mục native Linux trên WSL trước khi build.

#### Cách 1: Script tự động trong WSL (`~/deploy-lexi.sh`)

Tạo script thực thi trong thư mục home của WSL:
```bash
cat << 'EOF' > ~/deploy-lexi.sh
#!/usr/bin/env bash
set -euo pipefail

# Đường dẫn mã nguồn Windows và thư mục build nội bộ WSL
SOURCE="/mnt/d/LearnEnglish/Lexi/iOS/"   # Thay bằng đường dẫn thực tế của bạn
TARGET="$HOME/projects/LexiIOS/LexiApp/"

# Sử dụng relay socket từ Windows
export USBMUXD_SOCKET_ADDRESS="127.0.0.1:27015"

echo "== [1/3] Đang đồng bộ mã nguồn (loại bỏ file cũ) =="
mkdir -p "$TARGET"
# BẮT BUỘC có cờ --delete để tránh lỗi trùng lặp khai báo View cũ
rsync -av --delete \
  --exclude='.build/' \
  --exclude='xtool/' \
  --exclude='.git/' \
  --exclude='.swiftpm/' \
  "$SOURCE" "$TARGET"

cd "$TARGET"

echo "== [2/3] Kiểm tra kết nối iPhone qua Windows relay =="
timeout 10 ideviceinfo -k ProductType || {
  echo "LỖI: Không tìm thấy iPhone qua cổng 27015. Hãy kiểm tra cáp và Apple Mobile Device Service trên Windows." >&2
  exit 1
}
xtool devices --no-wait

echo "== [3/3] Build & Cài đặt Lexi lên iPhone =="
xtool dev
EOF

chmod +x ~/deploy-lexi.sh
```

Mỗi lần chỉnh sửa code xong trên Windows, chỉ cần mở terminal WSL và chạy:
```bash
~/deploy-lexi.sh
```

#### Cách 2: Chạy 1-Click từ Windows PowerShell

Bạn có thể kích hoạt toàn bộ quy trình mà không cần mở terminal WSL thủ công. Trong PowerShell, chạy:

```powershell
wsl -d LexiUbuntu -- bash -lc '
set -e
source ~/.local/share/lexi-ios/env.sh
export USBMUXD_SOCKET_ADDRESS=127.0.0.1:27015

# Đồng bộ mã nguồn từ ổ D vào thư mục Linux
rsync -av --delete \
  --exclude=".build/" \
  --exclude="xtool/" \
  --exclude=".git/" \
  --exclude=".swiftpm/" \
  /mnt/d/LearnEnglish/Lexi/iOS/ \
  ~/projects/LexiIOS/LexiApp/

cd ~/projects/LexiIOS/LexiApp

# Kiểm tra iPhone & deploy
timeout 15 ideviceinfo -k ProductType
xtool dev
'
```

---

## 🌐 Cấu hình Backend API & Môi trường

File cấu hình chính tại [Resources/Info.plist](Resources/Info.plist):
- `LexiAPIBaseURL`: URL HTTPS của backend (Ví dụ staging: `https://lexi-backend-tf32.onrender.com`).
- `LexiBuildFlavor`: Nhận giá trị `development`, `staging`, hoặc `production`.
- `LexiAIEnabled` / `LexiAudioEnabled`: Bật/tắt các tính năng AI & xử lý âm thanh bên ngoài ở cấp build.

### Tiêu chuẩn kết nối:
- Bắt buộc giao thức HTTPS bảo mật, không dùng HTTP, localhost hay credentials trong URL.
- Ứng dụng tuân thủ Apple ATS (App Transport Security) chuẩn.
- Endpoint kiểm tra sức khỏe hệ thống: `GET /health` (`status: "ok"` và `database: "up"` biểu thị kết nối sẵn sàng).

### Chạy kiểm tra API (Smoke Test):
```bash
# Kiểm tra public health check không cần token
export LEXI_API_BASE_URL=https://lexi-backend-tf32.onrender.com
bash scripts/smoke-api.sh --public-only

# Chạy full smoke test với access token thử nghiệm
read -r -s -p 'Nhập Access token kiểm thử: ' LEXI_TEST_TOKEN; echo
export LEXI_TEST_TOKEN
bash scripts/smoke-api.sh
unset LEXI_TEST_TOKEN
```

---

## 🧪 Kiểm thử, Tăng phiên bản & Xác thực Phase

### 1. Chạy Unit Tests
```bash
# Kiểm thử toàn bộ các bộ test nghiệp vụ độc lập
swift test
```

### 2. Tăng số hiệu Build (Build Number)
Script sẽ kiểm tra và từ chối nếu số hiệu build không tăng tuần tự:
```bash
python3 scripts/set-version.py --version 0.2.0 --build 3
```

### 3. Kiểm tra kiểm định Phase
Chạy script kiểm tra mã nguồn, bảo mật và tính toàn vẹn bundle:
```bash
bash scripts/verify-phase11.sh
```

---

## 🛠️ Xử lý sự cố thường gặp (Troubleshooting)

| Vấn đề | Nguyên nhân | Cách khắc phục |
|---|---|---|
| `invalid redeclaration of 'DashboardView'` | Lệnh `rsync` cũ không có cờ `--delete`, khiến các file Swift đã xóa ở nguồn vẫn còn tồn tại trong thư mục đích WSL. | Luôn dùng `rsync -av --delete ...` khi đồng bộ code sang WSL. |
| `xtool dev` bị kẹt ở `[Connecting] 100%` | Kết nối qua USBIPD passthrough bị treo hoặc nghẽn lớp truyền dữ liệu usbmuxd. | Chuyển sang **Phương án 1 (Socket Relay `127.0.0.1:27015`)** qua Windows AMDS. |
| `xtool devices` báo `Error: Operation not permitted` | Mặc định lệnh quét cả thiết bị mạng (`--all`), yêu cầu quyền socket raw của root. | Thêm cờ `--usb`: `xtool devices --usb --no-wait`. |
| `ERROR: No device found!` khi chạy `ideviceinfo` | `usbmuxd` bị desync/treo sau khi cắm rút cáp, hoặc iPhone chưa ghép đôi/chưa mở khóa. | Chạy `sudo systemctl restart usbmuxd`, rút/cắm lại cáp, mở khóa iPhone và chạy `idevicepair pair`. |
| `usbipd: Device busy (exported)` | Driver Windows đang độc quyền quản lý thiết bị. | Trong PowerShell Administrator: chạy `usbipd bind --force --busid <BUSID>` rồi rút và cắm lại cáp USB. |
| Quên mật khẩu sudo / `lexi is not in sudoers` | User trong WSL thiếu quyền thực thi quản trị. | Mở PowerShell: `wsl -d LexiUbuntu -u root`, chạy `usermod -aG sudo lexi && passwd lexi`. |
| Timeout kết nối cổng `27015` trên Windows | Apple Mobile Device Service chưa được bật trên host Windows. | Mở PowerShell Administrator và chạy: `Start-Service -Name "Apple Mobile Device Service"`. |
| Mở app trên iPhone báo `"Untrusted Developer"` | App ký bằng Apple ID cá nhân miễn phí (Personal Team), iOS yêu cầu xác nhận nhà phát triển tin cậy. | Vào **Cài đặt** > **Cài đặt chung** > **Quản lý VPN & Thiết bị** > chọn Apple ID > nhấn **Tin cậy (Trust)**. |
| `xtool dev` báo lỗi `409 Conflict: There are no current IOS devices...` | Vừa thu hồi (revoke) chứng chỉ cũ giữa phiên làm việc khiến profile bị gián đoạn. | Chạy lại `xtool dev` lần thứ hai để hoàn tất quy trình tạo chứng chỉ và profile mới. |

---

## 📚 Tài liệu tham khảo quan trọng

- 📖 [Kế hoạch triển khai tổng thể (Master Implementation Plan)](docs/LEXI_IOS_MASTER_IMPLEMENTATION_PLAN.md)
- 📖 [Sổ tay khắc phục lỗi WSL2 & xtool chi tiết](docs/LEXI_IOS_TROUBLESHOOTING_WSL_XTOOL.md)
- 📖 [Runbook kết nối iPhone từ Windows](docs/ios-windows-device.md)
- 📖 [Đồng bộ thiết kế giao diện từ Web (Design System Sync)](docs/LEXI_IOS_DESIGN_SYSTEM_FROM_WEB.md)
- 📖 [Kiến trúc xác thực Native (ADR-006)](docs/adr-006-native-auth.md)
- 📖 [Báo cáo trạng thái Phase 11](docs/ios-phase11-status.md)
