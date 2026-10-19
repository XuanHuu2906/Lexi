# Phase 9 — Audio native, TTS, Pronunciation, Dictation

Triển khai ngày **19/10/2026**, working tree. **21/35 task có bằng chứng code/test hoặc quyết định kỹ thuật; exit gate chưa đóng.** Chưa suy ra microphone/Azure hoạt động chỉ vì build thành công. Không sửa backend, không đưa provider key vào iOS.

## Trạng thái từng task

| Task | Trạng thái | Bằng chứng / phần còn lại |
| --- | --- | --- |
| IOS-0901 | Xong code | `SpeechSynthesizing`, adapter `StudySpeech` dùng AVSpeechSynthesizer. |
| IOS-0902 | Xong code | Locale Mỹ/Anh, voice fallback và thông báo thiếu giọng. |
| IOS-0903 | Xong code | Coordinator giữ một audio owner; play/stop/switch, dừng khi rời màn. |
| IOS-0904 | Đã chốt | Playback/spokenAudio, phát khi silent mode nhưng chỉ do user bấm, không background audio. |
| IOS-0905 | Xong code | Tốc độ local + voice account, label, native controls; cần QA VoiceOver. |
| IOS-0906 | Chờ thiết bị | Bluetooth, silent switch, cuộc gọi/background thực. |
| IOS-0907 | Xong code/test | Chỉ xin permission sau Record, denied + Settings, ngăn start muộn sau rời màn. |
| IOS-0908 | Xong, đã kiểm artifact | Info.plist có NSMicrophoneUsageDescription qua infoPath. |
| IOS-0909 | Một phần | AVFoundation target iOS build PASS; đang chờ thử capture thật. |
| IOS-0910 | Đã chốt code | playAndRecord/default, speaker/HFP, interruption/disconnect/reset stop; không chạy đồng thời TTS/mic, không hứa echo cancellation. |
| IOS-0911 | Xong code/test | Recorder tự dừng 60s; giới hạn thời lượng/file 5 MiB trước upload. |
| IOS-0912 | Chờ thiết bị | AVAudioRecorder yêu cầu PCM16/mono/16k và validator kiểm bytes sau stop; cần bản ghi thật. Không dùng AVAudioConverter riêng. |
| IOS-0913 | Xong code/test | RIFF chunks/padding/fmt/data length, frames, duration và encoding. |
| IOS-0914 | Chưa kích hoạt | Chỉ cần endpoint transcoding nếu native WAV không hoạt động; chưa đổi backend. |
| IOS-0915 | Xong code/test | Empty/too-short/too-long/zero PCM/permission/error, cancellation và temp cleanup. |
| IOS-0916 | Xong code | Gửi sau confirmation riêng; nghe/xóa không upload. |
| IOS-0917 | Xong code | Câu mẫu, Record/Stop, preview/delete, submit, kết quả/feedback. |
| IOS-0918 | Xong code/test | Multipart boundary/CRLF, referenceText, audio binary, WAV MIME/filename. |
| IOS-0919 | Xong code/test | URLSession file upload; body stream-copy 64 KiB, cleanup defer. |
| IOS-0920 | Xong code/test | Score 0…100 từ backend, transcript/mispronounced/feedback, không bịa điểm. |
| IOS-0921 | Xong code | Chỉ audio; không biến lỗi Azure thành text success hoặc auto fallback. |
| IOS-0922 | Một phần | Synthetic WAV và permission/state tests; chưa đủ file giọng thật/silence/Azure unconfigured live. |
| IOS-0923 | Chờ thiết bị | Yên tĩnh/ồn/tai nghe/app resume. |
| IOS-0924 | Một phần | Consent và client cleanup đã có; retention/logging server/provider chưa nghiệm thu. |
| IOS-0925 | Xong code/test | Generate API + CEFR/count, nghe bình thường/chậm, nhập câu; không lộ đáp án trước submit. |
| IOS-0926 | Xong code/test | Explain API, đối chiếu đáp án/câu đã gửi/feedback, giữ draft khi lỗi. |
| IOS-0927 | Hoãn optional | Không bật Apple Speech-to-text; không xin Speech permission. |
| IOS-0928 | Chưa áp dụng | Không dùng Speech framework; Dictation nhập bằng bàn phím. |
| IOS-0929 | Một phần | Code suspend/deactivate cleanup, test late response; chưa profile resource leaks trên iPhone. |
| IOS-0930 | Một phần | Có interruption/disconnect/cancellation handlers; chưa test cuộc gọi/tai nghe thật. |
| IOS-0931 | Chờ live | Cần WAV fixture có lời nói và recording iPhone gửi staging/nhận Azure response. |
| IOS-0932 | Xong code/test | Validate ≤5 MiB, format/MIME và bytes multipart thật. |
| IOS-0933 | Chưa đo | Scope giới hạn 60s; chưa profile memory/battery ở thời lượng tối đa, không cho record 3 phút. |
| IOS-0934 | Chưa nghiệm thu | Contract theo backend/web source; chưa so UX web/iPhone cùng reference. |
| IOS-0935 | Xong | [Định dạng, session, privacy và fallback](ios-audio-format.md). |

## Kiểm chứng

- **145 Swift tests / 14 suites PASS**; gồm 16 tests audio mới. Fixtures tổng hợp, không gửi âm thanh thật trong automated tests.
- `xtool dev build` **PASS**, log lần cuối 0 warnings/0 errors.
- Artifact có microphone purpose string; không có background audio hoặc Speech Recognition permission.
- `git diff --check -- .` PASS.
- Cài iPhone và kết quả người dùng sẽ được ghi trong [bằng chứng Phase 9](evidence/phase9-verification-2026-10-19.md).

## Lượt thử thiết bị

1. Học → Luyện phát âm → Nghe mẫu; Ghi âm → cấp quyền → đọc câu → Dừng → nghe bản ghi. Chưa gửi ở bước này.
2. Gửi chấm → xác nhận; kiểm có score/transcript/feedback. Nếu lỗi, giữ nguyên thông báo để phân biệt 503/provider với lỗi WAV; không tự retry liên tục.
3. Học/Ôn tập → Nghe chép chính tả → tạo bài → Nghe/Nghe chậm → nhập → Kiểm tra → Câu tiếp theo.
4. Thu một bản khác rồi về Home/chuyển nền: micro phải dừng; quay lại không còn bản ghi tạm. Thử quyền denied→Settings→allow nếu có thể.
5. TTS ở silent mode, chuyển giữa từ, thay tốc độ/giọng; tiếp tục test Bluetooth/disconnect/cuộc gọi và VoiceOver.
