# Phase 2 — SwiftPM app skeleton + network smoke

Ngày: 18/10/2026. Người dùng xác nhận Phase 0/1 đã làm xong; phiên này triển khai Phase 2, không chạy lại audit hoặc sửa backend.

## Phạm vi đã triển khai

- IOS-0201…0204: tạo template bằng xtool trong `.local/template/LexiIOS`, lấy cấu trúc package một library product, Swift tools 6.0 / compiler 6.4, iOS 17+, `LexiIOSApp` và Welcome.
- IOS-0205…0209: icon dùng lại glyph Lexi web, Info.plist không xin quyền mic/push, AppEnvironment kiểm tra HTTPS, AppContainer injection, Launch/Login/Dashboard/Error/Offline placeholders.
- IOS-0211…0214: HTTPTransport, URLSession ephemeral, timeout/cancellation, health envelope theo source NestJS, success/degraded/offline/timeout/error UI và manual retry.
- IOS-0217…0218: README cấu hình/build/pairing/logs và ignore artifacts/certificates/secrets.

Chỉ giữ một Swift target. Core không phụ thuộc SwiftUI để test trên Linux; UI nằm trong `#if canImport(SwiftUI)` và entry point trong `#if os(iOS)`. Không có fake service trong app production; fake chỉ nằm trong test target. API chưa cấu hình không khởi tạo health client.

## Kiểm chứng

- Swift 6.4 và `darwin` SDK đã được xác nhận trong LexiUbuntu.
- `swift test`: **PASS**, 12 Swift Testing tests / 2 suites (có parameterized cases), gồm URLSession qua URLProtocol. Dòng XCTest “0 tests” là runner phụ; kết quả nằm ở Swift Testing bên dưới.
- `xtool dev build`: **PASS**, SwiftUI compile cho iOS; artifact `xtool/LexiIOS.app`, build hoàn tất 38.51 giây. xtool **1.22.2**, Swift **6.4**, Darwin SDK.
- Đã kiểm tra bundle sau build: `com.xuanhuu.lexi.dev`, minimum iOS `17.0`, flavor `development`, URL trống đúng cấu hình; không có ATS exception hoặc usage permission; icon nguồn PNG 1024×1024 RGB. Chưa ký, chưa kiểm tra UI trực quan trên thiết bị.
- IOS-0215: automated tests cho offline/timeout/retry/cancellation; airplane mode trên iPhone còn chờ.
- IOS-0210: build pass; cài/mở Lexi trên iPhone còn chờ bằng chứng. `ideviceinfo -k ProductType` / `ProductVersion` trả `ERROR: No device found!` ở phiên này, chưa chạy signing/install.
- IOS-0216 / G2: **chưa đạt full gate**. Người dùng xác nhận chưa có URL HTTPS backend. Không dùng localhost thay thế và không coi unit tests là bằng chứng gọi API thật từ iPhone.

## Việc còn lại để đóng G2

**Cập nhật cài đặt 18/10/2026:** `xtool dev run --usb` với `USBMUXD_SOCKET_ADDRESS=127.0.0.1:27015` đã build/ký/cài LexiIOS, Installing và Verifying 100%, exit 0. iPhone được Windows quản lý qua Apple Mobile Device Service sau khi detach/unbind USBIP. Phần cài đặt IOS-0210 đã hoàn tất; còn xác nhận mở giao diện app, test mạng trên thiết bị và HTTPS endpoint. Chi tiết trong [runbook thiết bị](ios-windows-device.md).

**Cập nhật kết nối sau báo cáo:** ngày 18/10/2026 đã attach iPhone vào LexiUbuntu, đọc được `iPhone14,8` / iOS `26.7.1`, usbmuxd active và lệnh xtool devices thành công. Xem [runbook USB](ios-windows-device.md). Blocker “không thấy thiết bị” đã được giải quyết trong phiên này; cài/mở app và HTTPS health vẫn chưa kiểm chứng.

1. Cung cấp HTTPS endpoint NestJS reachable từ iPhone, sửa `LexiAPIBaseURL`, build lại.
2. `xtool dev`, mở Lexi, kiểm tra health/database up và lưu screenshot cùng phiên bản iOS (không lưu UDID/Apple ID).
3. Kiểm tra airplane mode/tắt Wi-Fi, timeout và phục hồi qua nút retry; xác nhận VoiceOver/Dynamic Type.

## Nguồn đối chiếu

- Local backend: `backend/src/health/health.controller.ts`, `backend/src/common/interceptors/transform.interceptor.ts`, `backend/src/main.ts`.
- Template sinh bằng xtool đã cài trên WSL.
- [xtool app configuration](https://github.com/xtool-org/xtool/blob/main/Documentation/xtool.docc/Control.md): infoPath/iconPath, resources và app bundle.
- [xtool first app](https://github.com/xtool-org/xtool/blob/main/Documentation/xtool.docc/First-app.tutorial): SwiftPM library, dev build/sign/install.
