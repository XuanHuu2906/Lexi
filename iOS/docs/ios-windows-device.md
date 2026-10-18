# Kết nối iPhone — Windows → WSL

## Đường cài app đã xác minh thành công

**Cập nhật 18/10/2026:** USB passthrough đọc được device info nhưng `xtool dev` bị kẹt ở `[Connecting] 100%` và `ideviceinfo` sau đó báo Mux error. Restart usbmuxd phục hồi việc đọc thông tin, nhưng thử `xtool dev run --usb` vẫn kẹt.

Đã detach/unbind bus `1-2`, trả iPhone về driver Windows; Apple Mobile Device Service tiếp tục chạy. Với WSL mirrored networking hiện có, dùng socket Windows:

```bash
source ~/.local/share/lexi-ios/env.sh
export USBMUXD_SOCKET_ADDRESS=127.0.0.1:27015
ideviceinfo -k ProductType
cd /mnt/d/LearnEnglish/Lexi/iOS
xtool dev run --usb
```

**Kết quả thực:** build, provisioning, signing, installing 100%, verifying 100%, exit code 0. **LexiIOS đã cài thành công** trên `iPhone14,8`, iOS `26.7.1`; chưa có xác nhận mở giao diện Lexi từ người dùng. Không ghi tên cá nhân, UDID, certificate hoặc profile vào tài liệu.

Hiện **không còn attach/forced binding qua usbipd**. Ưu tiên đường socket trên để cài app từ máy này. Biến môi trường chỉ đặt cho lệnh/session, chưa sửa profile hệ thống. Không phải mở firewall hay thêm port forwarding trong môi trường hiện có. Cách này được đối chiếu với [xtool issue #185](https://github.com/xtool-org/xtool/issues/185).

Các mục bên dưới lưu lại quá trình USB passthrough trước đó; lệnh detach/unbind đã được thực hiện để chuyển sang đường cài thành công này.

## Bằng chứng ngày 18/10/2026

- Windows: usbipd-win 5.3.0 nhận Apple Mobile Device, VID:PID `05ac:12a8`, bus `1-2` trong phiên này.
- WSL: LexiUbuntu, `lsusb` thấy Apple USB device, `usbmuxd` active.
- `ideviceinfo -k ProductType`: `iPhone14,8`.
- `ideviceinfo -k ProductVersion`: `26.7.1` (cao hơn minimum iOS 17 của Lexi).
- `xtool devices --usb --no-wait`: exit 0, có output, không stderr. Không lưu UDID/tên cá nhân.
- Đã xác nhận kết nối USB và đọc device info trực tiếp.

## Xác nhận HelloLexi / G1

Ngày 18/10/2026, người dùng xác nhận đã cài **HelloLexi** lên iPhone, mở app và thấy **“Hello, World”**. Ghi nhận **G1 đạt theo xác nhận người dùng**, IOS-0127/0128 hoàn tất; đây là changelog cho kết quả chạy trên thiết bị. Chưa có screenshot/video hoặc log signing trong repo, chưa đo bundle ID sau signing. Không suy ra đã hoàn tất sửa Text/redeploy, signed IPA hoặc G2 của LexiIOS.

## Quy trình đã hoạt động

1. Mở khóa iPhone, cắm cáp, chấp nhận Trust nếu xuất hiện.
2. PowerShell: `rtk proxy usbipd list`. Xác định lại busid của Apple; không mặc định `1-2` đúng sau mỗi lần đổi cổng.
3. PowerShell Administrator: `rtk proxy usbipd bind --busid 1-2`.
4. PowerShell: `rtk proxy usbipd attach --wsl LexiUbuntu --busid 1-2`.

Trong phiên này bước 4 báo `Device busy (exported)`. Đã dùng Administrator:

```powershell
rtk proxy usbipd bind --busid 1-2 --force
```

Sau `bind --force`, attach vẫn báo busy cho đến khi người dùng **rút/cắm lại cáp**. Chạy lại attach sau đó thành công. Restart riêng dịch vụ usbipd đã được thử trước khi cắm lại nhưng không giải quyết lỗi. Apple Mobile Device Service trên Windows không bị dừng (lệnh thử dừng bị lỗi cú pháp, không thực thi).

Kiểm tra trong WSL:

```bash
source ~/.local/share/lexi-ios/env.sh
lsusb
systemctl is-active usbmuxd
ideviceinfo -k ProductType
ideviceinfo -k ProductVersion
xtool devices --usb --no-wait
```

`xtool devices` có thể in UDID/tên thiết bị: không đưa output thô vào git/log công khai. Trong phiên này usbmuxd tự chuyển active khi attach, không cần start thủ công.

## Trả thiết bị về Windows

Trong nhánh passthrough trước đó, iPhone được attach cho WSL với binding **forced**. Các lệnh sau đã được dùng để trả thiết bị về Windows trước lần cài thành công qua socket:

```powershell
rtk proxy usbipd detach --busid 1-2
# PowerShell Administrator:
rtk proxy usbipd unbind --busid 1-2
```

Rút/cắm lại cáp nếu Windows chưa nhận lại. Kiểm tra busid hiện tại trước mỗi thao tác. Detach/unbind và cài qua socket Windows đã thành công trong phiên này. Xem [nhật ký lỗi và cách sửa](../errors/2026-10-18-iphone-connection-install.md) để phân biệt các bước đã thử với giải pháp cuối.
