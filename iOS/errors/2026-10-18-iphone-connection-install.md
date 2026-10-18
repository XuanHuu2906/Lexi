# Lỗi kết nối và cài Lexi lên iPhone — 18/10/2026

## Kết quả cuối cùng

**LexiIOS đã được build, ký và cài thành công lên iPhone.** Lệnh xtool kết thúc với exit code `0`, `[Installing] 100%` và `[Verifying] 100%`.

Đường hoạt động trên máy này: **iPhone → driver Apple trên Windows → Apple Mobile Device Service → socket localhost → xtool trong WSL**.

USB passthrough bằng usbipd đã đọc được thông tin iPhone, nhưng bị kẹt khi cài app. Vì vậy, cấu hình cuối đã **detach/unbind USBIP** và chuyển sang socket của dịch vụ Apple trên Windows. Không dùng đồng thời hai đường cho cùng thiết bị.

Chỉ xác nhận việc cài đặt từ output công cụ; tại thời điểm ghi lỗi, chưa có xác nhận người dùng mở màn Welcome của Lexi. HelloLexi trước đó đã được người dùng xác nhận mở và thấy “Hello, World”.

## Môi trường đã kiểm tra

| Thành phần | Giá trị |
|---|---|
| Máy phát triển | Windows + WSL2, networking mode `mirrored` |
| Distro | `LexiUbuntu`, Ubuntu 24.04.5 LTS, x86_64 |
| Swift / xtool | Swift 6.4 / xtool 1.22.2 |
| SDK | Darwin SDK installed; Xcode/iPhoneOS SDK 27.1 |
| usbipd-win | 5.3.0 |
| iPhone | ProductType `iPhone14,8`, iOS `26.7.1` |
| Thiết bị USB | Apple Mobile Device, VID:PID `05ac:12a8` |
| BUSID trong phiên | `1-2`; phải kiểm tra lại khi đổi cổng/cắm lại |
| Package | `D:\LearnEnglish\Lexi\iOS` / `/mnt/d/LearnEnglish/Lexi/iOS` |

## 1. Không truy cập được WSL từ phiên chạy lệnh

**Lỗi:**

```text
Access is denied.
Wsl/EnumerateDistros/Service/E_ACCESSDENIED
Wsl/Service/E_ACCESSDENIED
```

**Bối cảnh:** lệnh WSL bị giới hạn bởi sandbox của phiên trợ lý. Đây chưa phải lỗi iPhone hoặc Swift.

**Cách xử lý đã hiệu quả:** xin quyền chạy lệnh WSL ngoài sandbox rồi chạy lại. Khi đó thấy distro LexiUbuntu và dùng được Swift/xtool.

**Phân biệt:** quyền chạy ngoài sandbox không tự biến PowerShell thành Administrator. `usbipd bind` vẫn cần UAC riêng như mục 3.

## 2. Windows thấy iPhone nhưng WSL không thấy

**Dấu hiệu:**

```text
usbipd list: Apple Mobile Device ... Not shared
lsusb: chỉ có Linux root hubs
usbmuxd: inactive
ERROR: No device found!
```

**Nguyên nhân xác định trong phiên:** iPhone đang do Windows quản lý; chưa chia sẻ/attach qua USBIP. Khi chưa đặt socket Windows, công cụ trong WSL dùng đường kết nối local và không thấy thiết bị.

**Cách đã thử để thiết lập passthrough:**

```powershell
# PowerShell: xác định đúng iPhone và BUSID hiện tại.
rtk proxy usbipd list

# PowerShell Administrator; 1-2 là BUSID thực trong phiên này.
rtk proxy usbipd bind --busid 1-2

# PowerShell thông thường.
rtk proxy usbipd attach --wsl LexiUbuntu --busid 1-2
```

Sau khi xử lý lỗi busy ở mục 4, WSL thấy iPhone, usbmuxd tự active, đọc được model/iOS. **Việc này chỉ chứng minh kết nối/đọc thông tin, chưa chứng minh cài app được.**

## 3. usbipd bind bị từ chối quyền

**Lỗi:**

```text
usbipd: error: Access denied; this operation requires administrator privileges.
```

**Cách xử lý đã hiệu quả:** chạy `usbipd bind` trong tiến trình Windows có quyền Administrator, chấp nhận hộp thoại UAC. Phiên này dùng `Start-Process -Verb RunAs` để nâng quyền riêng lệnh usbipd; không cần chạy toàn bộ môi trường phát triển bằng Administrator.

**Kết quả:** trạng thái thiết bị chuyển từ `Not shared` sang `Shared`.

## 4. Attach báo Device busy (exported)

**Lỗi:**

```text
The device appears to be used by Windows
Attach Request for 1-2 failed - Device busy (exported)
Failed to attach device with busid '1-2'
```

Thông báo của usbipd cho biết thiết bị đang bị Windows sử dụng. Không xác định được tiến trình nào giữ thiết bị; không kết luận Apple Mobile Device Service là nguyên nhân duy nhất.

**Các bước và kết quả thực tế:**

1. `bind` thông thường: share được, attach vẫn lỗi.
2. Chạy `rtk proxy usbipd bind --busid 1-2 --force` bằng Administrator: trạng thái thành `Shared (forced)`, nhưng attach vẫn lỗi ngay sau đó.
3. Restart riêng dịch vụ `usbipd` trên Windows: chưa giải quyết được.
4. Người dùng **rút cáp, cắm lại**, rồi chạy lại attach: **thành công**.

`--force` chuyển quyền sử dụng thiết bị khỏi driver Windows; chỉ là bước đã thử trong nhánh passthrough. Không cần lặp lại bước này cho cách cài thành công qua socket ở cuối tài liệu.

## 5. xtool kẹt ở Connecting, sau đó có Mux error

**Dấu hiệu:** build và ký thành công, nhưng quá trình dừng tại:

```text
[Provisioning] 100%
[Signing] 100%
[Packaging] 100%
[Connecting] 100%
```

Chưa có `[Installing]` hoặc `[Verifying]`. Kiểm tra bằng `ideviceinfo` sau đó trả:

```text
ERROR: Could not connect to lockdownd: Mux error (-8)
```

**Đã thử:**

- Gửi Ctrl+C qua terminal: tiến trình không thoát ngay. Xác định PID của lần chạy xtool bị kẹt và gửi TERM cho đúng tiến trình đó; không kill tất cả tiến trình WSL.
- Restart `usbmuxd` trong WSL: **khôi phục được việc đọc model**, nhưng chưa sửa được bước cài.
- Chạy `xtool dev run --usb` để chỉ dùng USB: vẫn kẹt ở Connecting.
- Giới hạn thời gian chờ bằng `timeout`; đây là biện pháp tránh chờ vô hạn, không phải cách sửa kết nối.
- Người dùng kiểm tra điện thoại: không có hộp thoại Trust/cảnh báo mới cần chấp nhận.

**Nhận định:** hiện tượng phù hợp báo cáo về xtool qua WSL USB passthrough trong [issue #19](https://github.com/xtool-org/xtool/issues/19) và [issue #185](https://github.com/xtool-org/xtool/issues/185). Chưa xác định nguyên nhân gốc ở driver/protocol; không phải lỗi Swift compile hay provisioning vì các bước đó đã hoàn tất.

## 6. Cách sửa đã cài được app

### Bước A — Trả iPhone về Windows

Chỉ cần bước này nếu máy đang attach/share bằng USBIP. Kiểm tra BUSID trước, không dùng `1-2` cho thiết bị khác:

```powershell
rtk proxy usbipd list
rtk proxy usbipd detach --busid 1-2

# PowerShell Administrator:
rtk proxy usbipd unbind --busid 1-2
```

Phiên này đã thực hiện cả detach và unbind, bao gồm bỏ forced binding. Apple Mobile Device Service trên Windows vẫn đang chạy.

### Bước B — Dùng socket của dịch vụ Apple từ WSL

Các lệnh sau chạy **trong terminal WSL LexiUbuntu**. Swift/xtool được cài ở WSL; không yêu cầu cài RTK trong distro:

```bash
source ~/.local/share/lexi-ios/env.sh
export USBMUXD_SOCKET_ADDRESS=127.0.0.1:27015

# Kiểm tra trước khi cài; không in toàn bộ device info chứa định danh riêng.
ideviceinfo -k ProductType
ideviceinfo -k ProductVersion

cd /mnt/d/LearnEnglish/Lexi/iOS
xtool dev run --usb
```

Lần thực thi thành công dùng `timeout -k 10 120 xtool dev run --usb` để giới hạn thời gian; lệnh hoàn thành bình thường trước timeout. Không cần thêm timeout nếu chạy tương tác và kết nối ổn định.

### Bước C — Kiểm tra kết quả

```text
Build complete! (2.06 secs)
[Provisioning] 100%
[Signing] 100%
[Packaging] 100%
[Connecting] 100%
[Installing] 100%
[Verifying] 100%
exit code: 0
```

**Đây là bằng chứng cài thành công**, khác với việc chỉ thấy Connecting 100%.

Không mở thêm firewall, không thêm port forwarding, không cài thêm package và không đổi cấu hình networking trong lượt sửa này: mirrored networking và dịch vụ Apple đã có sẵn. `USBMUXD_SOCKET_ADDRESS` chỉ được đặt trong session/lệnh, chưa thêm vào shell profile. Mở terminal WSL mới thì cần export lại.

## 7. Lỗi câu lệnh phụ trong lúc chẩn đoán

Có hai lỗi PowerShell do cách quote lệnh lồng nhau, không phải lỗi từ iPhone:

- `The term '.DisplayName' is not recognized`: biến `$_` bị shell ngoài xử lý mất trước khi đến PowerShell con. Đã dùng truy vấn trực tiếp `Get-Service -DisplayName '*Apple*','*iPod*'` để kiểm tra thay thế.
- `The string is missing the terminator: "`: lệnh thử dừng Apple Mobile Device Service lỗi parse và **không thực thi**. Dịch vụ Apple không bị dừng; không cần khởi động lại do lệnh này. Việc dừng dịch vụ không nằm trong giải pháp cài thành công.

Khi cần viết lệnh PowerShell có nhiều tầng quote, nên dùng file `.ps1` thay vì ghép chuỗi dài.

## Lần sau dùng cách nào?

1. Cắm iPhone, mở khóa và giữ màn hình sáng khi cài.
2. Để Windows quản lý USB; bảo đảm Apple Mobile Device Service hoạt động.
3. Trong WSL, export `USBMUXD_SOCKET_ADDRESS=127.0.0.1:27015` rồi kiểm tra bằng `ideviceinfo -k ProductType`.
4. Chạy `xtool dev run --usb` từ thư mục package.
5. Chỉ báo cài xong khi Installing/Verifying hoàn tất và lệnh exit 0.

Nếu chỉ đọc được model nhưng cài bị kẹt, kiểm tra có đang quay lại đường USBIP hay chưa export biến trong terminal mới. Không lặp bind/force hoặc restart dịch vụ vô hạn.

Runbook liên quan: [Kết nối iPhone — Windows → WSL](../docs/ios-windows-device.md). Sau khi mở Lexi, thông báo “Chưa cấu hình kết nối” là trạng thái API URL đang để trống, **không phải lỗi cài app**.
