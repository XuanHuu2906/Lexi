# Phase 9 — Định dạng âm thanh và vòng đời

Ngày 19/10/2026. Source SwiftUI/Swift 6, không gọi trực tiếp Azure/provider từ iPhone.

## Thu âm

- `NativeAudioRecorder` dùng AVAudioRecorder với linear PCM, **16.000 Hz, mono, signed 16-bit little-endian**, file `.wav` thực. AVAudioRecorder thực hiện encoding/chuyển sample rate của đầu vào theo settings; không đổi đuôi M4A/AAC thành WAV và không thêm transcoding server. Đây là đường AVAudioRecorder, không phải implementation AVAudioEngine/AVAudioConverter riêng. Xem [settings của AVAudioRecorder](https://developer.apple.com/documentation/avfaudio/avaudiorecorder/init(url:settings:)-5whyq).
- Tối đa **60 giây**, tương ứng khoảng 1,92 MB PCM cộng header, dưới giới hạn file **5 MiB** của backend. Không thu 3 phút trong scope bản này vì backend dùng `recognizeOnceAsync` cho câu/đoạn ngắn. Thời gian tối thiểu 0,3 giây; đầu vào toàn số 0 bị từ chối. Đây không phải voice-activity detection: nền ồn/âm thanh không phải lời nói còn được Azure đánh giá.
- Sau Dừng/auto-stop: đọc RIFF/WAVE và từng chunk, kiểm declared length, fmt PCM=1, channel/rate/byteRate/blockAlign/bits, data length chẵn, frame count/duration và dung lượng. Hỗ trợ chunk phụ và padding; không giả header luôn 44 byte. Header sai hoặc format khác bị chặn trước upload.
- Chỉ hỏi quyền khi bấm **Ghi âm** bằng [AVAudioApplication.requestRecordPermission](https://developer.apple.com/documentation/avfaudio/avaudioapplication/requestrecordpermission(completionhandler:)). `NSMicrophoneUsageDescription` được nhúng qua `xtool.yml` → `Resources/Info.plist`. Không xin quyền Apple Speech Recognition.

## Audio session và TTS

- `AudioSessionCoordinator` giữ một chủ sở hữu cho TTS/thu/nghe lại. Chuyển nguồn dừng nguồn trước; không chạy đồng thời TTS và micro.
- TTS/nghe lại: category `.playback`, mode `.spokenAudio`, chỉ phát khi người dùng chủ động. Chủ đích **vẫn phát khi iPhone ở silent mode**, tuân theo âm lượng media. Không bật background audio.
- Thu: `.playAndRecord`, `.default`, `.defaultToSpeaker` + `.allowBluetoothHFP`. Không hứa echo cancellation vì không mở playback đồng thời recording. Cần kiểm tuyến Bluetooth/tai nghe thực trên iPhone.
- Dừng khi audio interruption bắt đầu, tai nghe đang dùng bị ngắt hoặc media services reset; không tự resume. Apple mô tả [interruption notifications](https://developer.apple.com/documentation/avfaudio/avaudiosession/interruptionnotification) và [route changes](https://developer.apple.com/documentation/avfaudio/avaudiosession/routechangenotification). Background/rời màn/logout hủy capture/playback; audio permission dialog ở trạng thái inactive không bị coi là background.
- TTS dùng EN_US → en-US, EN_GB → en-GB theo tài khoản; khi chưa tải Settings dùng `me.setting`. Fallback sang giọng tiếng Anh có sẵn kèm thông báo; không có voice thì báo lỗi. Tốc độ Chậm/Vừa/Nhanh lưu riêng trên thiết bị, áp dụng ngay; nút Nghe chậm trong Dictation không thay setting.

## Upload và contract

`POST /pronunciation/score`:

```text
Content-Type: multipart/form-data; boundary=<UUID>
referenceText: câu mẫu (1…1.000 ký tự theo DTO)
audio: recording.wav, Content-Type: audio/wav, WAV binary thật
```

- `MultipartAudio` stream-copy file theo chunk 64 KiB vào file multipart tạm; dùng [URLSession.upload(for:fromFile:)](https://developer.apple.com/documentation/foundation/urlsession/upload(for:fromfile:)) qua `HTTPTransport.upload`.
- Dùng chung APIClient: Bearer/không cookie, kiểm session trước/sau request, timeout audio 120s, response envelope/HTTP errors. Session resource timeout đã tăng từ 20s lên 120s để không cắt sớm request AI/audio dài hơn. GET vẫn có timeout riêng 15s; AI JSON 90s.
- Không retry upload khi timeout/mất mạng/5xx. Chỉ replay một lần sau **401 rõ ràng** và refresh credential thành công, cùng file/form body. POST không follow redirect để tránh replay audio sang route khác.
- Response: `{score:0…100, transcriptHeard:string, mispronounced:string[], feedback:string}`. Bản ghi gắn với câu mẫu lúc thu; thay câu mẫu phải ghi lại trước khi gửi. Kết quả được render literal text, không thực thi markup/actions.
- Backend có Azure Speech → đánh giá âm học và tạo góp ý. Có audio nhưng Azure chưa cấu hình → **503**, không có audio thì backend mới dùng `recognizedText`. iOS chỉ triển khai audio và **không tự gửi recognizedText hay chuyển sang chấm text khi lỗi**.

Dictation: `POST /dictation/generate` với `{level,count}` (1…20), nhận `{sentences:string[]}`; từng câu phải có nội dung và ≤500 ký tự để dùng endpoint tiếp theo. `POST /dictation/explain` với `{reference,attempt}` (1…500), nhận `{feedback:string}`. Câu đáp án được đọc bằng TTS nhưng không xuất hiện trong UI/VoiceOver trước khi gửi thành công. Không giả điểm số: contract chỉ có góp ý. Bản nháp giữ khi lỗi/hủy; đổi bài đang làm cần xác nhận.

## File tạm và privacy

- Bản ghi và multipart chỉ nằm trong thư mục tạm riêng `LexiAudio`, tên UUID không chứa user/reference/transcript, file protection `.complete` trên iOS. Không ghi audio, prompt, token hoặc response ra log/analytics.
- Upload chỉ sau nút Gửi + confirmation nêu rõ Lexi/Azure/dịch vụ AI. Nghe lại, xóa hoặc từ chối gửi không gọi API.
- File multipart được xóa trong `defer` ở mọi kết quả; bản ghi giữ để nghe/retry trong màn hiện tại và xóa khi ghi lại/xóa/rời màn/background/logout. App launch dọn các file UUID `.wav`/`.multipart` còn sót do process bị kill, chỉ trong thư mục riêng.
- Client cancel không bảo đảm server/provider đã ngừng xử lý. Chính sách retention phía server/provider, logging redaction và consent/legal copy trước phát hành còn cần xác minh riêng; không suy ra backend “không lưu âm thanh” từ cleanup client.

## Kiểm chứng

Chạy `rtk proxy wsl -d LexiUbuntu -- bash /mnt/d/LearnEnglish/Lexi/iOS/scripts/verify-phase9.sh`.
Unit tests dùng WAV tổng hợp, không phải recording người thật. Bao phủ RIFF/chunks, invalid PCM/oversize/silent/too-short/too-long, binary multipart, timeout/no retry, 401 refresh, cancellation/cleanup, permission lifecycle, reference binding và Dictation. Runtime micro, Azure, Bluetooth/interruption và memory/battery được ghi riêng trong [trạng thái Phase 9](ios-phase9-status.md).
