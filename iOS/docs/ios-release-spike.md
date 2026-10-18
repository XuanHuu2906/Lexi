# Release feasibility — BLOCKED, device development tiếp tục

> **Cập nhật 18/10/2026:** Swift 6.4 / xtool 1.22.2 / Darwin SDK đã hoạt động; iPhone `iPhone14,8` chạy iOS `26.7.1` đã kết nối WSL. Người dùng xác nhận HelloLexi đã cài/mở và hiển thị “Hello, World”: **G1 đạt theo xác nhận người dùng**. Ledger bên dưới là snapshot audit 17/10, chưa phản ánh cập nhật này. Distribution vẫn blocked; G1 không chứng minh archive/TestFlight. Xem [runbook thiết bị](ios-windows-device.md).

Ngày đánh giá: 17/10/2026. Chủ quyết định tài nguyên/tài khoản: chủ dự án. Người thực hiện audit tài liệu: Codex. Chưa có người/runner được cấp quyền thực hiện signing distribution.

## Điều kiện thực tế

- Người dùng có iPhone và cáp dữ liệu; model/iOS chưa ghi nhận, chưa thử USB/pairing.
- Không có Apple Developer Program trả phí.
- Không thể dùng macOS CI hoặc thuê máy Mac. Vì vậy phương án mặc định của master chưa khả dụng.
- WSL2 có sẵn nhưng chỉ thấy `docker-desktop` (Stopped); chưa có Ubuntu. Swift, xtool và usbipd không tìm thấy trên Windows PATH; chưa kiểm toolchain trong Linux development vì chưa có distro đó.
- API staging HTTPS, Team ID, bundle ID đã đăng ký: chưa có thông tin xác minh.

## Quyết định

Ưu tiên G1/G2 trên thiết bị cá nhân. Distribution G6/G7 **không đạt**. Không coi `.ipa` development hoặc việc sinh Xcode project là bằng chứng TestFlight/App Store. Không tự thay mục tiêu bằng một dịch vụ macOS mà người dùng không thể dùng.

Tài liệu [xtool Linux/Windows](https://github.com/xtool-org/xtool/blob/main/Documentation/xtool.docc/Installation-Linux.md) tại lần đọc chỉ dẫn Swift 6.4 và Xcode 27 XIP, cùng lựa chọn Apple ID password cho tài khoản chưa có membership (private APIs). Đây là đường **cần thử**, chưa chứng minh chạy trên thiết bị này. Người dùng tự đăng nhập Apple tại công cụ; không lưu password/2FA vào repo.

[Release xtool 1.22.2](https://github.com/xtool-org/xtool/releases/tag/1.22.2) là candidate thấy từ latest ngày audit; [installation ở tag 1.22.2](https://github.com/xtool-org/xtool/blob/1.22.2/Documentation/xtool.docc/Installation-Linux.md) cũng chỉ dẫn Swift 6.4/Xcode 27. Chưa tải, chưa kiểm checksum, chưa lock installed version. Khi cài phải lưu hash/version thật và kết quả smoke. Không tick “pin verified” chỉ vì đọc tài liệu.

Apple phân biệt thử trên thiết bị với khả năng phân phối theo [developer account](https://developer.apple.com/help/account/basics/about-your-developer-account). Đường [upload builds](https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds/) còn cần app record, bundle/version đúng và processing hoàn tất. Đây không phải một cách chuyển chữ ký development thành distribution.

## Spike thực thi khi các điều kiện phát hành được mở lại

| Bước | Input / thao tác | Pass evidence |
|---|---|---|
| R0 | Membership/role, bundle ID thuộc quyền chủ dự án, nguồn build khả dụng | Ghi xác nhận tài nguyên, không ghi key |
| R1 | Minimal SwiftPM app tại commit cố định; `xtool dev generate-xcode-project` | Output project/scheme/path thật và log sạch |
| R2 | Clean checkout trên môi trường archive được hỗ trợ | Build + archive app product; không phụ thuộc file WSL ngoài repo |
| R3 | Apple Distribution certificate/profile + entitlements tương ứng | Archive/export hợp lệ, bundle ID không bị đổi ngoài ý muốn |
| R4 | Upload bằng công cụ Apple hỗ trợ | App Store Connect processed build ID, không chỉ exit code upload |
| R5 | TestFlight fresh install + update trên iPhone | Device/iOS, video/screenshot, login/health smoke |

Không hardcode scheme hoặc lệnh archive chưa đo. Nếu R1/R2 thất bại, điều chỉnh packaging dùng cùng Swift source, ghi chi phí/phụ thuộc; không tự ZIP Payload để claim release.

## Evidence ledger

| Bằng chứng | Trạng thái |
|---|---|
| Source commit audit | 87760f17f0e40ae87447bf6cda9e2609ae0642a5 |
| Installed xtool / Swift / Darwin SDK | Chưa có bằng chứng |
| iPhone model / iOS / dev bundle ID | Chưa đo |
| Hello-world build/install/open | NOT RUN |
| Generated project | NOT RUN |
| Archive / distribution export | BLOCKED |
| Upload accepted / TestFlight install | BLOCKED |
| App Review | NOT SUBMITTED |

## Bundle, secrets và privacy

Bundle ID dev/distribution chưa chọn vì chưa xác minh namespace quyền sở hữu. Ghi bundle ID thực sau device signing; kiểm prefix ở bước đó. Không dùng `com.example` làm release ID. CI secrets tương lai cần scope theo environment, keychain tạm, cleanup, rotation; hiện không tạo hay lưu certificate/key/profile.

Trước public release: deletion endpoint + UX xác nhận + revoke sessions + retention policy; privacy policy cho email/progress/AI/audio; demo account sạch và screenshots. [Apple account deletion](https://developer.apple.com/help/app-review/guideline-reference/5-1-1-account-deletion) yêu cầu có đường khởi tạo xóa trong app khi có tạo tài khoản. NestJS hiện chưa có `DELETE /users/me`.

Review lại blocker khi người dùng thay đổi điều kiện Apple/build resources; không chờ xong UI mới xem ledger này.
