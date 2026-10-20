# Phase 9 — Bằng chứng ngày 19/10/2026

Working tree, không phải commit/release distribution. Múi giờ Asia/Ho_Chi_Minh.

| Kiểm tra | Kết quả | Giới hạn |
| --- | --- | --- |
| Swift unit/contract/feature tests | **145 tests / 14 suites PASS** | WAV tổng hợp; không phải capture/device tests. |
| xtool iOS build | **PASS, 0 warnings/0 errors** | Chưa tự chứng minh audio device/Azure. |
| Built Info.plist | **PASS** | Microphone purpose present, background audio false, Speech permission absent. |
| git diff --check -- . | **PASS** | Không phải runtime. |
| Cài iPhone bằng xtool | **PASS** | Log có Signing, Installing, Verifying, 100%; bản đã cài trước các commit hardening mới hơn. |
| Recording/playback/chấm phát âm iPhone | **PASS theo xác nhận người dùng** | Người dùng trả lời “oke hết rồi” cho các bước nghe mẫu, ghi âm, dừng, nghe lại, gửi chấm. Không có HTTP capture/điểm cụ thể; chưa thay thế lượt WAV fixture độc lập. |
| Dictation iPhone | **PASS theo xác nhận người dùng** | Cùng xác nhận cho tạo bài, nghe/nghe chậm, nhập đáp án và kiểm tra. Không suy ra các tình huống offline/gián đoạn. |

## Bộ test mới

- RIFF size, PCM tag/rate/channels/bits/byteRate/blockAlign, chunk phụ lẻ có padding, truncated file, duration/frame count, silence toàn số 0 và >5 MiB.
- Multipart có referenceText UTF-8, audio/wav và binary WAV đúng, không có recognizedText; file upload không gán httpBody, Bearer không cookie, timeout120.
- Timeout không reupload; 401 refresh mới replay cùng body; cancellation xóa multipart; invalid WAV/reference không gửi network.
- Dictation path/method/body/90s timeout, count/schema/range validation; không tự thêm điểm số.
- Permission chỉ khi record; denied không start/upload; rời màn hoặc cancel lúc prompt đang mở không kích micro muộn.
- Chưa submit không upload, đổi reference không dùng audio cũ; background xóa file và loại score muộn; double submit/429 không tăng request ngoài ý muốn.
- Dictation lỗi/hủy giữ draft; chỉ advance sau response được nhận, đóng session xóa nội dung.

## Reproduce

```powershell
rtk proxy wsl -d LexiUbuntu -- bash /mnt/d/LearnEnglish/Lexi/iOS/scripts/verify-phase9.sh
rtk git diff --check -- .
```

Logs gitignored: `.local/phase9-swift-tests.log`, `.local/phase9-ios-build.log`; install log riêng `.local/phase9-device-install.log` có thể chứa device/signing identifiers, không chép vào báo cáo public. Không gửi audio/prompt hoặc gọi provider trực tiếp từ runner.

## Bổ sung bằng chứng ảnh iPhone — 19/10/2026

Người dùng gửi ảnh màn **Học → Luyện phát âm**: phần **Bản ghi của bạn** hiện `4,8 giây · Sẵn sàng nghe lại`; sau gửi chấm app hiển thị `Chưa thể hoàn tất yêu cầu...`. Điều này xác nhận UI đã đến trạng thái có bản ghi và xảy ra lỗi request/kết quả. **Chưa có log HTTP/status hoặc bằng chứng Azure trả điểm.** Chưa xác minh playback thực sự nghe được qua loa, Bluetooth, WAV được server chấp nhận hoặc nguồn lỗi thuộc Azure.

Đã mở [runbook xác định HTTP/Azure/Render](../phase9-pronunciation-failure-diagnosis.md) và thay đổi message để lần cài build mới phân biệt trạng thái lỗi an toàn. **Không đổi IOS-0931 hoặc exit gate thành PASS.** Không lưu ảnh, bản ghi hoặc khóa bí mật trong GitHub.

## Xác nhận tiếp theo từ người dùng — 19/10/2026

Người dùng trả lời **“oke hết rồi”** cho lượt thử: Học → Luyện phát âm → Nghe mẫu → Ghi âm → đọc câu mẫu → Dừng → Nghe bản ghi → Gửi chấm phát âm; và Học → Nghe chép chính tả → Tạo bài nghe → Nghe/Nghe chậm → nhập đáp án → Kiểm tra. Đây là bằng chứng nghiệm thu chức năng chính trên bản iPhone đã cài, sau báo cáo lỗi ở trên. Chưa xác định nguyên nhân lỗi cũ hoặc thay đổi cấu hình backend nào đã khắc phục nó.

IOS-0909 và IOS-0912 được đánh dấu đạt: recorder xuất WAV trực tiếp và validator kiểm cấu trúc/PCM trước khi cho phép gửi. IOS-0931 vẫn còn lượt WAV fixture lời nói độc lập. Kiểm thử background/silent/Bluetooth/cuộc gọi, permission denied, profiling và server/provider retention vẫn cần bằng chứng riêng. Không lưu recording hoặc suy đoán build SHA từ xác nhận bằng lời.
