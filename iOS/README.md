# Lexi iOS

App native SwiftUI iOS 17+, SwiftPM và xtool. Thư mục `iOS/` (đúng chữ hoa) là source-of-truth. Phase 3 đã hoàn tất. **Phase 4 đạt G3 ngày 18/10/2026:** backend native đã deploy; người dùng xác nhận iPhone đăng nhập bằng tài khoản web, tắt hẳn/mở lại giữ phiên, logout rồi login lại. **Phase 5 đã triển khai theme, auth UI và shell 5 tab; 58 Swift tests / 7 suites và iOS build pass.** Còn QA thiết bị/Dynamic Type/VoiceOver/screenshot để đóng gate; xem [trạng thái Phase 5](docs/ios-phase5-status.md) và [design spec](docs/ios-design.md). Các kịch bản mở rộng IOS-0434 tiếp tục được ghi ở [trạng thái Phase 4](docs/ios-phase4-status.md).

## Chạy từ WSL

Đã đối chiếu môi trường ngày 18/10/2026: Swift 6.4, Darwin SDK có trong `swift sdk list`. Package dựa trên template tạo bằng `xtool new LexiIOS --skip-setup`; giữ đúng một library product cho xtool. Toàn bộ source nằm trong một target; SwiftUI được điều kiện hóa để test phần core trên Linux.

```bash
source ~/.local/share/lexi-ios/env.sh
cd /mnt/d/LearnEnglish/Lexi/iOS
swift test
xtool dev build
xtool dev
```

**Cài iPhone trên máy Windows này:** USB passthrough từng treo ở Connecting; đường đã cài thành công là để Windows quản lý iPhone, chạy Apple Mobile Device Service và thêm `export USBMUXD_SOCKET_ADDRESS=127.0.0.1:27015` trong WSL trước `xtool dev run --usb`. Xem [runbook thiết bị](docs/ios-windows-device.md); không attach USBIP đồng thời với đường này.

Nếu WSL có RTK, dùng `rtk proxy swift test` / `rtk proxy xtool dev build`. Từ PowerShell có thể chạy qua `rtk proxy wsl -d LexiUbuntu -u lexi -- bash -lc '...'` với các lệnh trên. Không chạy `swift build` Linux để đánh giá app SwiftUI: chỉ `xtool dev build` kiểm tra phần iOS.

## Cấu hình API

Sửa `LexiAPIBaseURL` trong [Resources/Info.plist](Resources/Info.plist) thành URL HTTPS backend/ingress đã triển khai, rồi build lại. `LexiBuildFlavor` chấp nhận `development`, `staging`, `production`. URL là cấu hình công khai, không chứa password/token.

- NestJS hiện có `GET /health`, không global prefix: base URL ví dụ `https://api.example.com` (chỉ minh họa, không phải server Lexi).
- Nếu ingress thêm `/api`, base URL phải bao gồm `/api`; app nối thêm `/health` và giữ prefix.
- Không dùng HTTP, localhost, query string, fragment hoặc credentials trong URL. Không nới ATS. URL staging do người dùng cung cấp ngày 18/10/2026: `https://lexi-backend-tf32.onrender.com`, đã cấu hình trong Info.plist. Public health smoke đã pass; lần đầu database down rồi lần tiếp theo up. Nếu URL bị bỏ trống, app báo chưa cấu hình và không gửi request.
- Health response từ `backend/src/health/health.controller.ts` qua `TransformInterceptor`: `{"success":true,"data":{"status":"ok","database":"up","uptime":123.5,"timestamp":"2026-10-18T01:02:03.456Z"}}`.
- `database: "down"` vẫn có thể HTTP 200: app báo dịch vụ chưa sẵn sàng. Chỉ `status: ok` + `database: up` mới báo `API reachable`.

Transport dùng session ephemeral không cookie/credential/cache; timeout read 15 giây, AI 90 giây, audio 120 giây, resource tối đa 120 giây. Chỉ theo redirect HTTPS cùng origin. Không ghi token, body hay nội dung lỗi server vào log. GET đọc an toàn được opt-in retry một lần khi lỗi mạng tạm thời; mutations/AI/streak/badges không tự retry. Health retry thủ công, 429 hiển thị cooldown theo Retry-After; request bị hủy khi màn Welcome rời view hierarchy.

## Smoke staging — Phase 3

Full smoke ngày 18/10/2026 đã **PASS cả 5 GET** với token kiểm thử; [bằng chứng không chứa credentials](docs/evidence/phase3-staging-smoke-2026-10-18.md). Phase 3 đã hoàn tất 30/30 task theo [báo cáo](docs/ios-phase3-status.md). Các lệnh dưới đây dùng để chạy lại khi cần.

Từ WSL, public health không cần token (không thay full smoke):

```bash
cd /mnt/d/LearnEnglish/Lexi/iOS
export LEXI_API_BASE_URL=https://lexi-backend-tf32.onrender.com
bash scripts/smoke-api.sh --public-only
```

Full smoke cần access token của **tài khoản thử nghiệm trên cùng backend**. Với auth web hiện tại: đăng nhập Lexi web, F12 → Application → Cookies → domain website → sao chép Value của `access_token` (không lấy `refresh_token`). Cookie HttpOnly không đọc được bằng `document.cookie`; không thay backend để bỏ HttpOnly. Token có hạn ngắn, lấy sau khi đăng nhập mới. Không gửi token vào chat hoặc commit vào repo.

```bash
read -r -s -p 'Access token (ẩn): ' LEXI_TEST_TOKEN
printf '\n'
export LEXI_TEST_TOKEN
mkdir -p .local
bash scripts/smoke-api.sh > .local/phase3-staging-smoke.log 2>&1
smoke_status=$?
unset LEXI_TEST_TOKEN
cat .local/phase3-staging-smoke.log
test "$smoke_status" -eq 0
```

Script chỉ GET health, me, words, due, stats; không gọi AI hoặc GET streak/badges có side effect. Không retry, không theo redirect, không in response body/token; 401 cần token mới, 429 phải chờ. File log chỉ chứa PASS/FAIL và route/status, có thể dùng để xác minh IOS-0325. Khi WSL có RTK, prefix `rtk proxy` cho lệnh chạy script/tests.

Kiểm tra local và tái tạo fixtures (dữ liệu tổng hợp, không phải HTTP captures):

```bash
python3 scripts/generate-contract-fixtures.py
python3 -B scripts/test_smoke_api.py
swift test
xtool dev build
```

AuthAPI đã nối `/auth/mobile/*` vào UI và SessionActor. Staging ngày 18/10 khoảng 11:49 UTC đã xác minh đủ bốn routes, health/database up, validation/unknown credential/no-store/không Set-Cookie; xem [evidence rollout và iPhone](docs/evidence/phase4-rollout-2026-10-18.md). Refresh token lưu Keychain `WhenUnlockedThisDeviceOnly`, access chỉ ở memory; 401 refresh/retry một lần, offline giữ phiên để retry. Xem [ADR-006](docs/adr-006-native-auth.md) về replay, logout và giới hạn runtime.

## iPhone và kiểm tra thủ công

**Bản Phase 5 ngày 18/10/2026 đã được cài lên iPhone 14 Plus** qua `xtool dev run --usb` với socket Windows: Installing và Verifying đều 100%. Chưa có xác nhận kiểm tra giao diện bản này; dùng checklist bên dưới và báo cáo Phase 5 để nghiệm thu.

1. Dùng quy trình USB passthrough/pairing Phase 1, mở khóa iPhone, Trust máy và bật Developer Mode nếu thiết bị yêu cầu.
2. Chạy `xtool dev` ở thư mục package; mở app Lexi trên iPhone. Signing có thể yêu cầu thao tác Apple ID của chính bạn; không đưa credential vào repo.
3. Khi đã có HTTPS API: kiểm tra `Đã kết nối Lexi`, bật chế độ máy bay và tắt Wi-Fi → `Không có kết nối mạng`, bật lại mạng → bấm `Kiểm tra lại` → phục hồi.
4. Kiểm tra timeout trên endpoint thử nghiệm được kiểm soát, HTTP lỗi/JSON sai và database down; không báo reachable trong các trường hợp này.
5. Backend native đã deploy; khi kiểm thử lại: đăng nhập/đăng ký, force-quit rồi mở lại, mất mạng/khôi phục, logout/đổi account và cỡ chữ lớn/VoiceOver. Ba bước login cùng account web, relaunch giữ phiên và logout/login lại đã được người dùng xác nhận cho Phase 4; không mặc nhiên coi UI Phase 5 đã được xác nhận. Home/Settings dùng email từ `/users/me`; các màn học còn trạng thái đang chuẩn bị. Thực hiện [checklist Phase 5](docs/ios-phase5-status.md) để kiểm tra 5 tab, nested navigation, logout confirmation và accessibility. Không ghi password/token hoặc PII vào evidence.

Build output ở terminal và `xtool/LexiIOS.app`; xem Info.plist đã merge trong bundle để xác nhận cấu hình. Có thể lưu output vào `.local/` (gitignored) để chẩn đoán; loại Apple ID/device ID/token trước khi chia sẻ. [Báo cáo Phase 2](docs/ios-phase2-status.md) phân biệt test/build với bằng chứng thiết bị.

Icon PNG 1024×1024 RGB dùng lại nét vẽ `frontend/public/icon.svg`, bỏ nền trong suốt và để iOS bo góc. Tái tạo bằng `python scripts/generate-app-icon.py` khi có Pillow. Không cần Pillow để build app vì PNG được lưu trong repo.

## Tài liệu nền

- [Rà soát phần còn thiếu Phase 0–2 (18/10/2026)](docs/ios-phase0-2-review.md)

- [Báo cáo Phase 0 và trạng thái task](docs/ios-phase0-audit.md)
- [Master implementation plan](docs/LEXI_IOS_MASTER_IMPLEMENTATION_PLAN.md)
- [API contract](docs/contracts/mobile-api.md)
- [Quyết định kiến trúc](docs/ios-decisions.md)
- [Release feasibility](docs/ios-release-spike.md)
- [Backlog bước tiếp theo](docs/ios-phase0-backlog.md)

Đích hiện tại: iPhone cá nhân, Windows/WSL/xtool. Có iPhone/cáp; chưa có ADP và không thể dùng macOS/thuê máy, nên TestFlight/App Store còn blocked.

Chạy lại audit từ root repo khi backend dependencies đã có:

```powershell
rtk proxy node iOS/scripts/audit-phase0.cjs
rtk proxy node iOS/scripts/probe-auth-baseline.cjs
rtk proxy node iOS/scripts/verify-phase0.cjs
```

Lệnh đầu sinh inventory từ TypeScript source. Lệnh thứ hai probe component auth bằng input giả và sinh error fixture từ filter thật, không gọi DB/API/Apple và không xác minh chữ ký JWT. Lệnh cuối kiểm cấu trúc tài liệu/fixture và tóm tắt kết quả unit test nếu đã chạy. Không dùng các probe này thay test e2e hoặc bằng chứng iPhone.


Kết nối với iPhone:

Nếu not shared:
usbipd bind --busid 1-2
usbipd list
usbipd attach --wsl --busid 1-2
Sau đó sẽ thành Shared
Get-Service | Where-Object {
    $_.DisplayName -match "Apple|Mobile Device"
}

Get-Service | Where-Object {
    $_.DisplayName -match "Apple Mobile Device" -and $_.Status -eq "Running"
} | Stop-Service

usbipd attach --wsl --busid 1-2
usbipd list

Vào Ubuntu:
wsl -d LexiUbuntu
lsusb
sudo service usbmuxd restart
ideviceinfo
xtool devices --no-wait

pass: 123


Mỗi lần code trên Win xong:

mkdir -p ~/projects/LexiIOS/LexiApp

rsync -av \
  --exclude='.build/' \
  --exclude='xtool/' \
  --exclude='.git/' \
  --exclude='.swiftpm/' \
  /mnt/d/LearnEnglish/Lexi/iOS/ \
  ~/projects/LexiIOS/LexiApp/

xtool devices --no-wait

cd ~/projects/LexiIOS/LexiApp
xtool dev

cách 2:

nano ~/deploy-lexi.sh

#!/bin/bash
set -e

echo "Syncing Lexi from Windows..."

rsync -av \
  --exclude='.build/' \
  --exclude='xtool/' \
  --exclude='.git/' \
  --exclude='.swiftpm/' \
  /mnt/d/LearnEnglish/Lexi/iOS/ \
  ~/projects/LexiIOS/LexiApp/

cd ~/projects/LexiIOS/LexiApp

echo "Checking iPhone..."
xtool devices --no-wait

echo "Building and installing Lexi..."
xtool dev

chmod +x ~/deploy-lexi.sh

sau đó chỉ cần chạy
~/deploy-lexi.sh

Nếu chạy xong bị timeout:
Trong PowerShell Administrator, chạy:
Start-Service -Name "Apple Mobile Device Service"
Get-Service -Name "Apple Mobile Device Service"
Test-NetConnection 127.0.0.1 -Port 27015
