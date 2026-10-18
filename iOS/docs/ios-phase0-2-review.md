# Rà soát Phase 0–2 — 18/10/2026

> **Cập nhật sau rà soát:** Đã kết nối được iPhone với WSL (`iPhone14,8`, iOS `26.7.1`); người dùng xác nhận đã cài HelloLexi và mở thấy “Hello, World”. **G1 đạt theo xác nhận người dùng**, IOS-0127/0128 đã tick. [Runbook USB và changelog](ios-windows-device.md) đã được bổ sung. Các nhận xét dưới đây về thiết bị chưa kết nối, thiếu runbook và 34 checkbox Phase 1 trống là snapshot trước các cập nhật này; không còn là trạng thái hiện tại. G2 vẫn chờ cài/chạy LexiIOS và health HTTPS.

## Kết luận

Chưa đủ bằng chứng để đóng toàn bộ Phase 0–2 theo master. Phần audit/design và skeleton đã làm; build Lexi iOS pass. Còn thiếu backend runtime/staging, dữ liệu test riêng, sửa một backend unit test và kiểm chứng ký/cài/mở/gọi API trên iPhone.

Người dùng đã báo hoàn thành Phase 0/1. Báo cáo này phân biệt **chưa làm** với **chưa có bằng chứng trong phạm vi đã kiểm tra**; việc iPhone không kết nối hiện tại không chứng minh rằng thiết bị chưa từng chạy app.

## Kiểm tra thực tế trong lần rà soát này

| Kiểm tra | Kết quả |
|---|---|
| `scripts/verify-phase0.cjs` | PASS: 176 local links, 11 fixture envelopes, 77 routes, 22 checkbox Phase 0, 6 auth component observations |
| Backend unit tests chạy lại | **46 pass / 1 fail**, 6 suites; lỗi vẫn ở `backend/src/auth/auth.service.spec.ts:137` |
| Lỗi unit backend | `login clears accumulated failures on successful login`: expectation không có `lastActiveAt`, source có cập nhật `lastActiveAt: new Date()`; chưa sửa trong lượt audit |
| Backend e2e source | Vẫn chỉ kiểm `/` trả `Hello World!`; không chứng minh health/auth/DB pipeline và chưa chạy trong lượt này |
| WSL | LexiUbuntu, Ubuntu 24.04.5 LTS, x86_64; swift/xtool/usbmuxd/ideviceinfo/lsusb/git có sẵn |
| Toolchain | Swift 6.4, xtool 1.22.2; Darwin SDK installed, epoch=3/darwinTools=1.1.0/oam=1.3.0 |
| Xcode/SDK metadata | Xcode 27.1 (CFBundleVersion 25183.120.5), iPhoneOS SDK 27.1 |
| Download evidence | Có SHA-256 Swift archive và xtool AppImage trong `~/.local/share/lexi-ios/downloads.sha256`; không tải lại hay rehash binary ở lượt này |
| Windows tooling | Có usbipd và VS Code; extension list có Remote WSL và Swift; chưa chứng minh VS Code Remote WSL session đang mở |
| Device hiện tại | `usbmuxd: inactive`, `ideviceinfo` không tìm thấy paired iPhone; không tự restart daemon/bind USB trong audit |
| HelloLexi | Có source và `HelloLexi.app` tại `/home/lexi/projects/LexiIOS/HelloLexi`; có binary/Info.plist, không thấy `_CodeSignature/CodeResources` hoặc `embedded.mobileprovision` trong artifact đã kiểm |
| Swift test/build Lexi | Bằng chứng từ lượt Phase 2 trước: 12 tests / 2 suites pass, không warning/error trong log cuối; xtool build pass; không chạy lại vì source không đổi |
| API config | `LexiAPIBaseURL` trống; người dùng xác nhận chưa có HTTPS backend |

Raw backend result mới: `.local/phase0-2-backend-tests.json` (gitignored). Không dùng logs chứa dữ liệu tài khoản/thiết bị làm tài liệu công khai.

## Phase 0 — phần còn mở

Master hiện tick 22/35 task. 13 task còn mở được phân loại như sau:

| Task | Việc còn lại / trạng thái mới |
|---|---|
| IOS-0003 | Capture request/response HTTP thật đã làm sạch; 11 fixtures hiện là synthetic/source-derived |
| IOS-0004 | Backend runtime và HTTPS endpoint dùng được từ iPhone; chưa có staging theo xác nhận người dùng |
| IOS-0005 | Xác minh DB test tách biệt, seed account A/B/disabled, words và mock AI; hiện mới có dataset spec |
| IOS-0012 | Đối chiếu model/iOS thiết bị thật với minimum iOS 17; package đã đặt 17 nhưng chưa có device evidence |
| IOS-0017 | Design đã có; test refresh concurrency/reuse chưa có, phần implementation thuộc Phase 4 |
| IOS-0020 | Swift/xtool đã pin trong installer, toolchain/SDK thật đã kiểm; báo cáo Phase 0 còn ghi trạng thái cũ, thiếu file lock/version chuyên biệt |
| IOS-0021 | Đã có bundle ID **dev** `com.xuanhuu.lexi.dev`; namespace/ID đăng ký cho distribution chưa xác minh |
| IOS-0022 | ADP/team/role distribution chưa có theo điều kiện đã chốt |
| IOS-0023 | Chưa có bằng chứng generated Xcode project → archive/export distribution |
| IOS-0024 | Có tài liệu release spike, chưa có exact archive/sign/export commands đã chạy thành công |
| IOS-0025 | Chưa đo bundle ID thực sau device signing/prefix XTL |
| IOS-0026 | macOS runner không khả dụng theo ràng buộc người dùng; release tiếp tục blocked |
| IOS-0033 | Chưa seed/capture live fixtures; mới có dữ liệu tổng hợp |

Test backend lỗi là tồn đọng chất lượng cần sửa riêng; không được diễn giải thành toàn bộ đăng nhập runtime hỏng. Chưa chạy e2e nên cũng chưa chứng minh đăng nhập runtime đúng.

## Phase 1 — công việc đã có nhưng checklist chưa phản ánh

Master vẫn để trống **34/34** checkbox. Không dùng con số này để kết luận 34 việc chưa làm:

- **Đã có bằng chứng đáng kể:** WSL dev distro, Swift/xtool, công cụ USB, Darwin SDK; template HelloLexi và artifact build; `scripts/check-env.sh`. Tương ứng các nhóm IOS-0102/0103, 0106…0112, 0116, 0125/0126/0130/0133, với giới hạn từng kiểm tra nêu ở bảng trên.
- **Chưa lưu đủ tài liệu:** thiếu `docs/ios-toolchain-versions.md` (IOS-0117); thiếu `docs/ios-windows-device.md` và lệnh USB bind/attach thực sự đã hoạt động (IOS-0121/0134). README hiện có hướng dẫn chung, chưa thay thế runbook theo máy thực tế.
- **Chưa có bằng chứng hoàn tất:** pairing/trust/Developer Mode, ký–cài–mở HelloLexi, thay Text rồi redeploy, signed IPA, generated Xcode project (IOS-0119…0129, 0131/0132). Có template/build artifact chỉ chứng minh một phần, không chứng minh toàn bộ nhóm này.
- **Cần đối chiếu thêm:** nguồn XIP/license và bước Apple authentication (IOS-0113…0115), kiểm thử USB disconnect/reconnect và reboot; không đọc credential hoặc lịch sử terminal để suy luận.
- **Khác kế hoạch:** HelloLexi nằm trên filesystem Linux, nhưng package Lexi Phase 2 và build scratch hiện ở `/mnt/d/LearnEnglish/Lexi/iOS`, chưa theo khuyến nghị IOS-0105 cho workspace Linux. Build vẫn pass; đây là chênh lệch bố trí/performance, không phải lỗi compile.

**G1:** người dùng báo đã hoàn thành, nhưng repo/artifact được kiểm chưa đủ bằng chứng độc lập về app chạy trên iPhone. Nếu đã chạy, chỉ cần bổ sung device/iOS + screenshot và log sạch, không cần làm lại toàn bộ cài đặt toolchain.

## Phase 2 — ba task chưa đóng

Master tick **15/18** task, phù hợp phần code/build hiện có:

| Task | Còn thiếu |
|---|---|
| IOS-0210 | Build đã pass; cần ký/cài/mở **LexiIOS** trên iPhone |
| IOS-0215 | Mock tests offline/timeout/retry pass; cần airplane mode/tắt Wi-Fi, timeout/retry và kiểm tra không crash trên thiết bị |
| IOS-0216 | Cấu hình HTTPS backend, gọi `/health` thật từ iPhone và xác nhận database up |

IOS-0213 đã tick theo implementation + fixture tests, **không** chứng minh live HTTP. UI Dynamic Type/VoiceOver chưa kiểm trực quan trên iPhone. G2 còn yêu cầu tái tạo build từ clean checkout; lượt trước mới build workspace hiện có, không phải clean clone trên WSL mới.

## Tài liệu cần đồng bộ

`ios-phase0-audit.md` và `ios-release-spike.md` là snapshot 17/10, còn ghi chưa có Ubuntu/Swift/xtool; trạng thái này đã cũ. Checklist Phase 1 chưa cập nhật. Giữ nguyên snapshot lịch sử, dùng báo cáo này làm bản đối chiếu mới; không tick hàng loạt chỉ vì có binary.

## Thứ tự xử lý

1. Sửa assertion backend và chạy lại 47 unit tests.
2. Bổ sung version lock/runbook USB và bằng chứng G1 đã có; khôi phục kết nối thiết bị để ký/cài Lexi.
3. Chuẩn bị backend/DB test riêng và HTTPS endpoint, seed/capture fixtures sạch.
4. Hoàn tất ba task Phase 2 trên iPhone, kiểm tra tái tạo build và đóng G2.
5. Giữ distribution/App Store blocked theo điều kiện hiện tại. Native auth, Keychain và refresh tests là công việc Phase 4; không xem chúng là phần code Phase 2 bị bỏ sót.
