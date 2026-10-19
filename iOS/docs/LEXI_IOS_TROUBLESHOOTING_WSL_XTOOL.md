# Lexi iOS — Nhật ký lỗi và hướng dẫn khắc phục Windows / WSL2 / xtool / iPhone

> **Ngày tổng hợp:** 19/10/2026  
> **Dự án:** [XuanHuu2906/Lexi](https://github.com/XuanHuu2906/Lexi), thư mục `iOS/`  
> **Mục tiêu:** Đồng bộ mã SwiftUI từ Windows sang WSL2, build và cài Lexi lên iPhone thật bằng `xtool`.  
> **Kết quả cuối cùng:** Người dùng đã xác nhận **cài đặt thành công** sau khi chuyển sang phương án iPhone do Windows quản lý và WSL kết nối qua socket `127.0.0.1:27015`.

## 1. Môi trường và các đường dẫn đã sử dụng

| Thành phần | Giá trị trong phiên xử lý |
|---|---|
| Windows | Máy Windows có PowerShell, WSL2 và `usbipd-win` |
| Bản phân phối WSL | `LexiUbuntu` |
| User Linux | `lexi` |
| Nguồn mã iOS trên ổ Windows | `D:\LearnEnglish\Lexi\iOS\` |
| Đường dẫn nguồn nhìn từ WSL | `/mnt/d/LearnEnglish/Lexi/iOS/` |
| Bản sao dùng để build trên WSL | `/home/lexi/projects/LexiIOS/LexiApp/` |
| iPhone | Thiết bị có tên `Hwux`, được `xtool` liệt kê ở chế độ `[usb]` |
| VID:PID USB | `05ac:12a8` (Apple Mobile Device) |
| BUSID đã thấy trên Windows | `1-2` (**có thể thay đổi** sau rút/cắm cáp) |
| Mạng WSL trong log | `mirrored` |
| Cổng chuyển tiếp thiết bị đã xác nhận | `127.0.0.1:27015` trên Windows |

**Chú ý về trạng thái xác minh:** Nội dung dưới đây phân biệt **lỗi đã quan sát trong terminal**, **nguyên nhân được suy luận** và **giải pháp đã được kiểm chứng sau cùng**. Không coi mọi nguyên nhân nghi ngờ trước đó là kết luận chắc chắn.

---

## 2. Lỗi Swift: `invalid redeclaration of 'DashboardView'`

### Dấu hiệu

```text
Sources/LexiIOS/Views/LearningViews.swift:21:8:
error: invalid redeclaration of 'DashboardView'
```

Log biên dịch ở WSL có **cả** `LearningViews.swift` và `PlaceholderViews.swift`. Trong khi đó, tại thời điểm kiểm tra, nhánh GitHub `main` có `LearningViews.swift` định nghĩa `DashboardView` nhưng **không có** `PlaceholderViews.swift`.

### Nguyên nhân có khả năng cao

Script đồng bộ cũ dùng:

```bash
rsync -av \
  --exclude='.build/' \
  --exclude='xtool/' \
  --exclude='.git/' \
  --exclude='.swiftpm/' \
  /mnt/d/LearnEnglish/Lexi/iOS/ \
  ~/projects/LexiIOS/LexiApp/
```

`rsync -av` **không xóa** file đích đã bị xóa ở nguồn. Vì vậy `PlaceholderViews.swift` có thể đã bị xóa trên Windows nhưng còn sót trong WSL, tạo thêm một khai báo `DashboardView` và gây lỗi biên dịch.

> Đây là **chẩn đoán có cơ sở từ log và repo GitHub**, nhưng cuộc trao đổi chưa ghi nhận kết quả `grep` thực tế của file local để khẳng định 100% nội dung của `PlaceholderViews.swift`.

### Cách kiểm tra

Chạy trong Ubuntu:

```bash
cd ~/projects/LexiIOS/LexiApp

grep -RnE '^[[:space:]]*(struct|class|enum)[[:space:]]+DashboardView\b' Sources/
```

Nếu thấy từ hai khai báo trở lên trong cùng Swift module, mở và xử lý bản khai báo trùng. Không xóa cả file nếu trong đó còn những View khác đang được sử dụng.

### Cách ngăn lỗi lặp lại

Dùng `--delete` để đồng bộ cả việc **xóa file cũ**:

```bash
# XEM TRƯỚC những gì sẽ thay đổi/xóa (an toàn, không ghi file)
rsync -avn --delete \
  --exclude='.build/' \
  --exclude='xtool/' \
  --exclude='.git/' \
  --exclude='.swiftpm/' \
  /mnt/d/LearnEnglish/Lexi/iOS/ \
  ~/projects/LexiIOS/LexiApp/
```

Nếu danh sách hợp lý:

```bash
rsync -av --delete \
  --exclude='.build/' \
  --exclude='xtool/' \
  --exclude='.git/' \
  --exclude='.swiftpm/' \
  /mnt/d/LearnEnglish/Lexi/iOS/ \
  ~/projects/LexiIOS/LexiApp/
```

**Cảnh báo:** `--delete` có thể xóa các file **chỉ tồn tại tại đích WSL** và không được exclude. Sao lưu những file riêng ở WSL, luôn kiểm tra bằng `-n` khi mới sửa quy trình. `--exclude` mặc định bảo vệ các thư mục tương ứng khỏi đồng bộ/xóa; không thêm `--delete-excluded` một cách vô tình.

---

## 3. Lỗi quản trị WSL: quên mật khẩu `sudo` và `lexi is not in the sudoers file`

### Dấu hiệu

```text
[sudo] password for lexi:
Sorry, try again.
```

Và sau đó:

```text
lexi is not in the sudoers file.
```

Người dùng cũng từng chạy `wsl -d LexiUbuntu` **bên trong Ubuntu** và gặp:

```text
Command 'wsl' not found
```

### Giải thích

- `wsl.exe` là lệnh phía **Windows/PowerShell**, không phải lệnh dùng từ shell Ubuntu thông thường.
- Mật khẩu user Linux khác với mật khẩu Windows / iPhone / Apple ID.
- Khi `lexi` không nằm trong nhóm có quyền `sudo`, biết mật khẩu vẫn chưa đủ để chạy lệnh quản trị.

### Quy trình phục hồi đã được hướng dẫn

**Mở PowerShell trên Windows:**

```powershell
wsl -d LexiUbuntu -u root
```

**Trong shell `root` của Ubuntu:**

```bash
usermod -aG sudo lexi
passwd lexi
id lexi
```

Đặt mật khẩu mới qua `passwd` và kiểm tra đầu ra `id lexi` có nhóm `sudo`. Không đưa mật khẩu vào câu lệnh hay tài liệu.

**Thoát về PowerShell**, rồi khởi động lại phiên WSL để nhận nhóm mới:

```powershell
wsl --terminate LexiUbuntu
wsl -d LexiUbuntu -u lexi
```

**Trong Ubuntu, xác minh:**

```bash
sudo whoami
```

Kết quả mong muốn: `root`.

**Bằng chứng từ phiên xử lý:** Về sau lệnh `sudo service usbmuxd restart` đã chạy, nhưng không có log riêng xác nhận toàn bộ lệnh phục hồi ở trên đã được thực hiện theo đúng thứ tự này.

---

## 4. USB nhìn thấy iPhone nhưng `ideviceinfo` không thấy

### Dấu hiệu đã gặp

```text
$ lsusb
Bus 001 Device 004: ID 05ac:12a8 Apple, Inc. iPhone ...

$ ideviceinfo -k DeviceName
ERROR: No device found!

$ xtool devices --no-wait
Hwux [usb]: ...
```

### Ý nghĩa

`lsusb` nhìn thấy thiết bị vật lý và `xtool devices` liệt kê được tên iPhone, **nhưng điều đó không đảm bảo mọi giao tiếp cần thiết để cài app đã hoạt động**. Khi dùng USB passthrough, lớp `usbmuxd`/pairing và đường cài đặt có thể vẫn trục trặc.

### Các kiểm tra hữu ích

```bash
lsusb
sudo service usbmuxd status
idevice_id -l
timeout 10 ideviceinfo -k DeviceName
xtool devices --no-wait
```

Không nên khẳng định “kết nối hoàn chỉnh” chỉ vì `xtool devices` thấy `Hwux`.

---

## 5. xtool build xong nhưng treo ở `[Connecting] 100%`

### Dấu hiệu

```text
Build complete!
[Unpacking app] 100%
[Preparing device] 100%
[Provisioning] 100%
[Signing] 100%
[Packaging] 100%
[Connecting] 100%
```

Tiến trình đứng ở đây tới khoảng **20 phút**. Không thấy log tiếp theo xác nhận cài ứng dụng thành công.

### Phân tích

- Swift compile, đóng gói và ký app đã đi qua những giai đoạn hiển thị trong log.
- Điểm dừng thuộc luồng kết nối/cài đặt lên iPhone, **không phải lỗi SwiftUI trong đoạn log này**.
- Việc `ideviceinfo` về sau đọc được `Hwux` trong chế độ USBIPD vẫn **không khắc phục** tình trạng xtool treo ở `[Connecting] 100%`.

### Cách đã khắc phục được trong trường hợp này

**Chuyển khỏi phương án USBIPD trực tiếp sang để Windows quản lý iPhone và cho WSL kết nối qua cổng `127.0.0.1:27015`.** Cấu hình cuối cùng đã được xác nhận bằng lệnh kiểm tra và người dùng báo `xtool dev` cài thành công.

Chi tiết ở mục 7.

---

## 6. `usbipd attach`: `Device busy (exported)`

### Dấu hiệu

Tại thời điểm xảy ra lỗi, `usbipd list` cho thấy iPhone với `BUSID 1-2`. Lệnh:

```powershell
usbipd attach --wsl --busid 1-2
```

Trả về:

```text
WSL usbip: error: Attach Request for 1-2 failed - Device busy (exported)
usbipd: warning: The device appears to be used by Windows;
stop the software using the device, or bind the device using the '--force' option.
usbipd: error: Failed to attach device with busid '1-2'.
```

Thử:

```powershell
usbipd bind --force --busid 1-2
```

Windows báo:

```text
usbipd: warning: A reboot may be required before the changes take effect.
```

### Bài học

- `Shared` **khác** `Attached`: `Shared` nghĩa là đã được chia sẻ nhưng chưa gắn vào WSL.
- `--force` là tùy chọn của `usbipd bind`, **không phải** `usbipd attach`.
- Driver bị Windows giữ có thể cần giải phóng, rút/cắm lại, hoặc khởi động lại Windows để thay đổi driver có hiệu lực.
- Không lặp `bind --force` liên tục khi vẫn báo busy.

**Quan trọng:** Đây là nhánh xử lý **USBIPD trực tiếp**, nhưng phương án cuối cùng cài thành công là **Windows relay**. Không trộn hai cấu hình: khi sử dụng relay, **không attach iPhone vào WSL bằng `usbipd`**.

Để trả quyền iPhone về Windows (nếu đang attached), trong PowerShell Administrator và dùng BUSID **thực tế**:

```powershell
usbipd list
usbipd detach --busid 1-2   # Chỉ khi đang Attached
usbipd unbind --busid 1-2
```

Việc `unbind` được dùng khi chuyển hẳn sang phương án Windows quản lý USB. Nếu trước đó đã dùng `bind --force`, có thể cần khởi động lại Windows để driver trở lại bình thường.

---

## 7. Cấu hình cuối cùng đã thành công: Windows Apple Mobile Device + socket `27015`

### 7.1. Kiến trúc kết nối

```text
iPhone (cáp USB)
    |
    v
Windows: Apple Mobile Device Service / bộ phận quản lý thiết bị Apple
    |
    +-- Socket/relay lắng nghe trên 127.0.0.1:27015
    |
    v
WSL2: LexiUbuntu (networking mode: mirrored)
    |
    +-- USBMUXD_SOCKET_ADDRESS=127.0.0.1:27015
    |
    +-- ideviceinfo / xtool
    |
    v
Lexi iOS: xtool dev -> iPhone
```

**Giới hạn điều đã xác nhận:** Log xác nhận **Apple Mobile Device Service chạy** và **cổng 27015 có listener**. Log không xác định chính xác tiến trình nào sở hữu cổng `27015`; vì vậy không mặc định rằng bản thân dịch vụ AMDS tự mở cổng này. Một thành phần relay/forwarder phải được thiết lập phù hợp khi tái tạo môi trường mới.

### 7.2. Kiểm tra trên Windows (PowerShell Administrator)

```powershell
Get-Service -Name "Apple Mobile Device Service"
Get-NetTCPConnection -LocalPort 27015 -State Listen -ErrorAction SilentlyContinue
```

**Kết quả thực tế đã quan sát:**

```text
Status   Name               DisplayName
------   ----               -----------
Running  Apple Mobile De... Apple Mobile Device Service
```

Và:

```text
LocalAddress  LocalPort  State
127.0.0.1     27015      Listen
```

Ban đầu `Start-Service` in liên tiếp cảnh báo `Waiting for service ... to start...`. Về sau khi kiểm tra lại, dịch vụ đã ở trạng thái `Running`. Nếu tái diễn, kiểm tra driver/thiết bị đang bị USBIPD chiếm và trạng thái dịch vụ trước khi kết luận đã khởi động thành công.

### 7.3. Kiểm tra trên Ubuntu WSL

```bash
# Trong LexiUbuntu
export USBMUXD_SOCKET_ADDRESS=127.0.0.1:27015

ideviceinfo -k DeviceName
xtool devices --no-wait
```

**Kết quả thực tế đã quan sát:**

```text
Hwux
Hwux [usb]: <UDID-đã-ẩn>
```

Sau khi đã cấu hình socket trên, người dùng chạy lại và **xác nhận cài Lexi thành công**.

> Trong cơ chế relay, `lsusb` trong Ubuntu không nhất thiết nhìn thấy iPhone: thiết bị có thể do Windows giữ. Tiêu chí kiểm tra ưu tiên là dịch vụ/relay Windows, `ideviceinfo`, `xtool devices` và kết quả cài đặt thực tế.

### 7.4. Chạy app

```bash
cd ~/projects/LexiIOS/LexiApp
export USBMUXD_SOCKET_ADDRESS=127.0.0.1:27015
xtool dev
```

Mở khóa iPhone, giữ cáp ổn định, chấp nhận Trust nếu iPhone hỏi. Nếu app cài và mở được, coi đó là bằng chứng thiết bị thực tế; **không chỉ dựa vào** `[Connecting] 100%`.

### 7.5. Khi mất kết nối ở các phiên sau

**PowerShell Windows:**

```powershell
Get-Service -Name "Apple Mobile Device Service"
Get-NetTCPConnection -LocalPort 27015 -State Listen -ErrorAction SilentlyContinue
usbipd list
```

**Ubuntu WSL:**

```bash
export USBMUXD_SOCKET_ADDRESS=127.0.0.1:27015
timeout 10 ideviceinfo -k DeviceName
xtool devices --no-wait
```

Nếu `27015` không lắng nghe, khôi phục/chạy lại thành phần chuyển tiếp socket trên Windows; **chỉ chạy AMDS không tự đảm bảo có listener `27015`**. Nếu `usbipd list` hiển thị `Attached`, xem lại việc vô tình chuyển iPhone khỏi Windows khi đang sử dụng relay.

---

## 8. Script đồng bộ và cài app khuyến nghị

Tên gợi ý: `sync-lexi-ios.sh`, chạy trong **LexiUbuntu**.

```bash
#!/usr/bin/env bash
set -euo pipefail

SOURCE="/mnt/d/LearnEnglish/Lexi/iOS/"
TARGET="$HOME/projects/LexiIOS/LexiApp/"

# Kết nối qua relay trên Windows (đã hoạt động với WSL mirrored).
export USBMUXD_SOCKET_ADDRESS="127.0.0.1:27015"

if [[ ! -d "$SOURCE" ]]; then
  echo "ERROR: Không tìm thấy nguồn iOS: $SOURCE" >&2
  exit 1
fi

mkdir -p "$TARGET"

echo "== Preview sync (gồm file sẽ xóa) =="
rsync -avn --delete \
  --exclude='.build/' \
  --exclude='xtool/' \
  --exclude='.git/' \
  --exclude='.swiftpm/' \
  "$SOURCE" "$TARGET"

# Chỉ thực hiện xóa/cập nhật sau khi đã xem preview.
read -r -p "Tiếp tục đồng bộ và deploy? [y/N]: " CONFIRM
if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
  echo "Đã hủy, không thay đổi file."
  exit 0
fi

rsync -av --delete \
  --exclude='.build/' \
  --exclude='xtool/' \
  --exclude='.git/' \
  --exclude='.swiftpm/' \
  "$SOURCE" "$TARGET"

cd "$TARGET"

echo "== Checking iPhone via Windows relay =="
if ! timeout 10 ideviceinfo -k DeviceName; then
  echo "ERROR: Không truy cập được iPhone qua 127.0.0.1:27015" >&2
  echo "Hãy kiểm tra AMDS và listener TCP 27015 trên Windows." >&2
  exit 1
fi

xtool devices --no-wait

echo "== Building & installing Lexi =="
xtool dev
```

**Ưu điểm:**

1. Tránh file Swift cũ tồn đọng do thiếu `--delete`.
2. Kiểm tra việc xóa file trước khi đồng bộ.
3. Luôn đặt socket relay đúng cho tiến trình xtool.
4. Dừng nếu `ideviceinfo` không giao tiếp được với iPhone.

**Lưu ý:** Script này chỉ tái sử dụng một listener relay **đã đang chạy trên Windows**; nó **không tự cài hoặc khởi chạy** phần mềm relay cổng `27015`. Không đưa mật khẩu hay khóa Apple vào script.

---

## 9. Checklist mỗi lần làm việc với Lexi iOS

### Trên Windows

- [ ] iPhone cắm bằng cáp dữ liệu, mở khóa.
- [ ] iPhone do Windows quản lý nếu sử dụng relay (không `usbipd attach --wsl`).
- [ ] `Apple Mobile Device Service` đang `Running`.
- [ ] Cổng `127.0.0.1:27015` đang `Listen`.
- [ ] Mã nguồn mới nhất nằm tại `D:\LearnEnglish\Lexi\iOS\`.

### Trong `LexiUbuntu`

- [ ] Đặt `USBMUXD_SOCKET_ADDRESS=127.0.0.1:27015`.
- [ ] `ideviceinfo -k DeviceName` in `Hwux`.
- [ ] `xtool devices --no-wait` thấy iPhone.
- [ ] Đồng bộ Windows → WSL, có xem trước `--delete` nếu cần.
- [ ] Đứng ở `~/projects/LexiIOS/LexiApp` trước khi chạy xtool.
- [ ] `xtool dev` cài và chạy app được trên iPhone thật.

---

## 10. Tra nhanh theo lỗi

| Triệu chứng | Kiểm tra trước | Hướng xử lý |
|---|---|---|
| `invalid redeclaration of DashboardView` | `grep` khai báo và so sánh file Windows/WSL | Xóa/đổi tên khai báo trùng; đồng bộ với `rsync --delete` sau khi dry-run |
| `wsl: command not found` ở Ubuntu | Đang ở shell Linux hay PowerShell? | Chạy `wsl -d LexiUbuntu` trong PowerShell Windows |
| Quên mật khẩu `sudo` | Có thể vào `root` từ PowerShell không? | `wsl -d LexiUbuntu -u root` → `passwd lexi` |
| `lexi is not in sudoers` | `id lexi` | Root chạy `usermod -aG sudo lexi`, mở lại phiên WSL |
| `lsusb` thấy nhưng `ideviceinfo` không thấy | `idevice_id -l`, `usbmuxd`, pairing, socket | Kiểm tra đường giao tiếp; không đồng nhất USB detect với install |
| USBIPD `Device busy (exported)` | Windows có đang giữ driver/thiết bị không? | Thoát app chiếm USB, xem xét `bind --force` + reboot nếu tiếp tục USBIPD; hoặc chuyển sang relay |
| `usbipd` là `Shared` | Trạng thái có phải `Attached` không? | `Shared` chưa phải attach WSL; **không attach nếu dùng Windows relay** |
| AMDS chờ khởi động | `Get-Service`, `sc.exe queryex` | Kiểm tra trạng thái dịch vụ và quyền quản lý USB; reboot nếu thay đổi driver chưa có hiệu lực |
| WSL `ideviceinfo` báo No device trên relay | Env socket, listener `27015` | Bật relay, export `USBMUXD_SOCKET_ADDRESS`, kiểm tra AMDS |
| xtool kẹt `[Connecting] 100%` | `ideviceinfo` và phương thức kết nối USB | Trường hợp này khắc phục bằng Windows USB relay `127.0.0.1:27015` |

---

## 11. Điều đã xác nhận và điều chưa được xác nhận

**Đã xác nhận qua log và phản hồi của người dùng:**

- Windows từng cho thấy `Apple Mobile Device Service` là `Running`.
- Windows từng cho thấy `127.0.0.1:27015` ở trạng thái `Listen`.
- Khi đặt `USBMUXD_SOCKET_ADDRESS=127.0.0.1:27015`, `ideviceinfo` và `xtool devices` đều nhận `Hwux`.
- Người dùng xác nhận **đã cài Lexi thành công** sau khi đổi sang phương án này.

**Chưa có bằng chứng riêng trong cuộc trao đổi:**

- Chính xác tiến trình nào lắng nghe cổng `27015` và cách khởi chạy relay từ một máy Windows sạch.
- File local `PlaceholderViews.swift` có những khai báo nào, vì chưa có kết quả `grep` nội dung từ WSL.
- Bằng chứng đầy đủ rằng mọi chức năng trong Lexi iOS/health API hoạt động; lần thành công này xác nhận **deploy lên iPhone**, không tự chứng minh hoàn tất toàn bộ Phase 2 trở đi.

## 12. Ghi chú bảo mật và vận hành

- Không chia sẻ mật khẩu Linux, Apple ID, token, UDID hoặc log chứa thông tin đăng nhập ở nơi công khai. Có thể che UDID trong issue công khai.
- `xtool dev` là đường **build/deploy development**; không đồng nghĩa đã có IPA phân phối App Store/TestFlight.
- Không xóa `.build/`, SDK hoặc cài lại toolchain để chữa một lỗi chỉ liên quan đến USB và chuyển tiếp socket.
- Không cấu hình **đồng thời** USBIPD direct attach và Windows relay cho cùng một iPhone.

---

**Trạng thái cuối:** Đã giải quyết được trở ngại deploy Lexi từ Windows/WSL lên iPhone thật bằng xtool theo lời xác nhận của người dùng (19/10/2026). Tài liệu này phục vụ tái lập môi trường và khắc phục sự cố trong các phiên phát triển sau.
