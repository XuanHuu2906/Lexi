# Phase 8 — AI văn bản

Rà soát và triển khai ngày **19/10/2026**, trên working tree. **25/29 task đã có bằng chứng code/test hoặc xác nhận kiểm thử thiết bị; exit gate chưa đóng.** IOS-0821 được bổ sung xác nhận người dùng trên iPhone sau khi cài bản Phase 8. Không thay đổi backend hoặc đưa API key/provider SDK vào iOS.

Tab **Học** có Gia sư Lexi, Hỏi ngữ pháp, Luyện viết, Đọc theo ngữ cảnh, Hội thoại và Sổ ngữ pháp. Giữ SwiftUI, token Grape/Cloud/Ink, Dynamic Type, native sheets/confirmation và touch target hiện có.

## Tiến độ từng task

| Task | Trạng thái | Bằng chứng / phần còn lại |
| --- | --- | --- |
| IOS-0801 | Xong code | `AIRequestState` + `AIRequestGate`: idle/submitting/success/validation/rate limit/timeout/offline/server error/cancelled. |
| IOS-0802 | Xong code | AI dùng timeout 90s của APIClient; Dừng chờ, cancellation khi rời màn/background, loại phản hồi muộn. Cần đo UX thiết bị. |
| IOS-0803 | Xong code | Không auto retry POST AI; tests cả 9 nhóm AI chỉ gửi một lần khi timeout. 401 rõ ràng vẫn theo policy refresh chung. |
| IOS-0804 | Xong code | Giữ draft, thông báo lỗi, cooldown Retry-After; người dùng chủ động gửi lại. Không bịa quota tiền/số lượt còn lại. |
| IOS-0805 | Xong code | DTO bám controllers/services, fixtures synthetic; score Writing 0…10, role user/assistant, schema sai không thành dữ liệu hợp lệ. |
| IOS-0806 | Xong code | Disclaimer ở các màn kết quả/chat; không tạo đánh giá phát âm trong Phase 8. |
| IOS-0807 | Xong code | Bubble, pending question, loading, scroll anchor, safeAreaInset composer; cần QA keyboard/focus/VoiceOver thật. |
| IOS-0808 | Xong code | `{question,history}`, giữ tối đa 50 prior turns đúng DTO; chỉ gửi các lượt đã nhận response, không tự thêm system role. |
| IOS-0809 | Xong code | Tutor/Q&A giữ trong bộ nhớ phiên app, tách model theo loại; UI nói rõ không có lịch sử bền vững cho hai endpoint này. |
| IOS-0810 | Xong code | Suggested words mở AddWordSheet; grammar mở editor và preview chủ động. Chỉ POST lưu khi người dùng bấm Lưu. |
| IOS-0811 | Xong code | Background/rời màn dừng chờ, giữ draft; logout xóa nội dung; late response không cập nhật session cũ. Không tự gửi lại foreground. |
| IOS-0812 | Xong code | List/search/pagination/detail/editor; nullable title fallback formula, examples từng dòng. |
| IOS-0813 | Xong code | Hỏi ngữ pháp tái dùng `TutorChatView` ở màn riêng trong tab Học (thay sheet riêng); endpoint/history đúng contract. |
| IOS-0814 | Xong code | Create/update/delete + examples; refresh list/detail từ server; lỗi mutation chưa rõ yêu cầu đọc lại trước thử lại. |
| IOS-0815 | Xong code | Đoạn gốc có selection/copy, danh sách từ được giải thích + meaning/reason/note, lưu qua sheet. Dùng phương án danh sách accessible trong design, không đoán offset để tô chữ. |
| IOS-0816 | Xong code | TextEditor, counter 5.000 theo validator.js, validation trước gửi, keyboard dismissal theo LexiPage. |
| IOS-0817 | Xong code | Corrected text/issues/comment/score, original/correction riêng tránh lỗi Unicode offset; dùng bản sửa có confirm và undo. |
| IOS-0818 | Xong code | Không log prompt/transcript/output, không analytics bên ngoài; chỉ aggregate counts trong RAM. |
| IOS-0819 | Xong code | Bốn preset từ `frontend/src/app/(app)/conversation/page.tsx` + custom. IDs preset chỉ là UI key; ID phiên luôn từ server. Không có scenarios endpoint để gọi. |
| IOS-0820 | Xong code | Start → returned ID → serialized reply → end. Metadata checkpoint trước mutation, không giả ID/session. |
| IOS-0821 | Đạt theo xác nhận người dùng | Sau start/reply đã nhận response, vuốt tắt app → mở lại → tiếp tục phiên → end/summary: người dùng xác nhận qua trên iPhone. Test checkpoint/recreation đã có; chưa kiểm force-kill giữa request hoặc hai thiết bị thật. |
| IOS-0822 | Xong code client | Guard serialize start/reply/end trên model; không hứa serialize nhiều thiết bị ở backend. Xem giới hạn bên dưới. |
| IOS-0823 | Xong code | Chỉ set completed/hiện summary sau end ack hoặc GET completed; timeout phải đối soát. |
| IOS-0824 | Xong code | UI trả kết quả một lần; không quảng cáo streaming. |
| IOS-0825 | Xong code | Fixtures missing/null words/grammar, nullable title, examples envelope, summary strings, schema sai và score ngoài giới hạn. |
| IOS-0826 | Một phần | Automated tests 429/invalid/timeout/double tap/cancellation/closed session qua; còn background/foreground thực trên iPhone. |
| IOS-0827 | Một phần | Người dùng đã thử Tutor/Writing trên iPhone. Có runner `scripts/smoke_phase8.py` để kiểm cùng input qua Bearer và cookie/CSRF; runner live và đối chiếu web UI chưa chạy, chưa có phiên đăng nhập test cho runner. |
| IOS-0828 | Một phần | `AIUsage` đếm logical requests/failures/429 trong RAM; runner parity giới hạn tối đa 6 AI POST và đo thời gian/lỗi, không ghi nội dung. Chưa đo live/provider retries/token cost hoặc nghiệm thu rate limit trên thiết bị. |
| IOS-0829 | Một phần | Test input giống prompt injection vẫn là question/user data, render literal không chạy HTML/tool. Chưa red-team content safety/abuse trên backend AI thật. |

## Contract và quyết định

- `TutorResult.words/grammar` thiếu hoặc null → mảng rỗng cho tương thích; `answer` bắt buộc, nội dung không rỗng. Fields có sai kiểu vẫn fail decoding.
- Giới hạn: question 1.000; history 50 turns; writing 5.000; context/grammar preview 4.000; scenario 200; reply 2.000; grammar title 200. `apiLength` theo validator.js hiện cài: Unicode scalars, trừ presentation selectors; không dùng số Swift grapheme để đánh giá DTO.
- `POST /grammar/:id/examples` **trả `{generated,rule}`**, khác type trả trực tiếp GrammarRule trong wrapper web đang có. Native theo service thực.
- `ConversationSummary.strengths/weaknesses/overall` là **String**, feedback detail nullable. Reply feedback/suggestion optional cho tương thích.
- Grammar update gửi các field của editor, title rỗng gửi `""` để xóa tiêu đề cũ; không ngầm chuyển thành field bị bỏ qua. Preview AI không tự tạo quy tắc.
- Context hiển thị danh sách các từ được giải thích thay vì gắn offset phỏng đoán vào đoạn văn. Writing hiển thị original/correction thành mục riêng. Đây là lựa chọn có chủ đích để xử lý Unicode và nội dung lặp đúng.
- Đề xuất từ/quy tắc không kích hoạt request khi chỉ xem màn hình. AI chỉ chạy khi bấm gửi/xem trước/tạo ví dụ/bắt đầu/kết thúc; các GET lịch sử vẫn chạy khi vào màn/foreground phù hợp.
- Chỉ Conversation lưu trên backend qua các endpoint Phase 8. Không dùng `/chat/threads` ngoài scope để giả lập Tutor history đã đồng bộ. Tutor/Q&A/Writing/Context drafts mất khi process kết thúc hoặc logout; giữ khi đổi tab/background trong cùng session.

## Recovery, quyền riêng tư và giới hạn

`AIRequestGate` chặn thao tác trùng, giữ Retry-After, loại response đến muộn sau cancel/deactivate. Hủy phía client không bảo đảm server/provider đã ngừng xử lý hoặc không tính phí. Stateless AI cho retry chủ động; không auto replay.

Conversation checkpoint chỉ có **ID/pending/transcript count**, namespace API origin + user ID; không lưu lời nhắn, đề bài hay transcript ra UserDefaults. Relaunch tải từ server. Pending start không có ID → tải history, chọn phiên thực hoặc xác nhận đã kiểm tra rồi mới cho bắt đầu mới. Pending reply/end → GET trạng thái trước khi tiếp tục. Đọc lại chưa phải chứng minh request cũ đã kết thúc; UI nhắc kiểm tra thêm trước khi gửi tiếp.

Backend Conversation hiện đọc transcript rồi `update` sau AI, không có optimistic version/idempotency. Guard iOS không ngăn race giữa web và iPhone hoặc giữa hai thiết bị. Không mở offline replay; không tuyên bố exactly-once. Backend start cũng chưa có operation ID để xác định chắc chắn một request timeout. Grammar mutations chưa có idempotency; đọc list/detail trước retry chỉ là đối soát tốt nhất, không bảo đảm không trùng.

`AIUsage` đếm yêu cầu logic ở feature, **không** phải số HTTP replay sau 401, số provider retry của backend hoặc tiền thực tế. Không lưu counter lâu dài và không gửi analytics. iOS không giữ provider keys. Chưa kiểm chứng model có từ chối yêu cầu độc hại hoặc không lộ thông tin server; cần bài red-team live riêng trước khi đóng IOS-0829.

## Kiểm chứng và bước tiếp theo

Xem [bằng chứng Phase 8](evidence/phase8-verification-2026-10-19.md). Chạy lại từ PowerShell tại package:

```powershell
rtk proxy wsl -d LexiUbuntu -- bash /mnt/d/LearnEnglish/Lexi/iOS/scripts/verify-phase8.sh
```

1. Trên iPhone, vào Học, thử cả Tutor/Q&A/Writing/Context; chủ động gửi dữ liệu thử không nhạy cảm. Kiểm lỗi mạng, 429, background, keyboard/Dynamic Type và VoiceOver.
2. Lưu từ/quy tắc từ đề xuất; đối chiếu thư viện trên web. Preview không được lưu trước khi xác nhận. CRUD và examples phải cập nhật đúng bản ghi.
3. Bắt đầu Conversation, reply/end, xem lại history trên web và iPhone; force-kill giữa request, mở lại đối soát, không bấm gửi lại khi kết quả chưa rõ.
4. So contract với web trên cùng endpoint/input; AI có thể sinh lời khác nên không so văn bản từng ký tự. Đo logical requests cùng metrics backend/provider không chứa prompt.
5. Kiểm content safety/abuse/ownership bằng tài khoản test riêng và môi trường được phép; không dùng mock tests để đóng gate live.

## Bổ sung kiểm chứng thiết bị và runner

Ngày 19/10/2026 đã kiểm GET `/health` thành công, ký/cài Phase 8 lên `iPhone14,8` qua socket Windows (exit 0, Installing/Verifying). Người dùng trả lời “oke hết rồi” cho lượt thử Tutor, Writing + dùng bản sửa/hoàn tác, Conversation start/reply → force-kill sau response → relaunch/resume → end/summary. Đây là xác nhận người dùng; không có screenshot/video và không suy ra các lỗi mạng, 429, VoiceOver hoặc content safety đã qua.

Runner parity: xem `rtk proxy python scripts/smoke_phase8.py --help`. Cấu hình `LEXI_API_BASE_URL` bằng HTTPS staging đã xác minh, rồi chạy `rtk proxy python scripts/smoke_phase8.py --run --login` trong terminal tương tác. Nhập tài khoản thử nghiệm qua prompt ẩn; không gửi credential vào chat. Runner tạo phiên đăng nhập tạm, xác minh cùng account, gọi tối đa 6 AI POST (Tutor/Q&A/Writing × native/web), dừng ở lỗi đầu, không retry và thu hồi các phiên tạm. Output `PHASE8_REPORT` chỉ có metadata/timing/counts. Không phải kiểm UI hoặc đo hóa đơn provider. Kiểm offline bằng `rtk proxy python -B -m unittest discover -s scripts -p 'test_*.py'`.

Rà soát source backend cho IOS-0829 còn thấy `ai.service.ts` ghi `err.message`/`String(err)` vào logger ở nhánh provider/JSON parse/unexpected error. Nội dung lỗi có thể chứa trích đoạn response; cần kiểm redaction backend trước khi đóng privacy/content-safety gate. Chưa sửa hoặc deploy backend trong lượt này.
