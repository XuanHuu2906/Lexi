# Lexi Backend

Backend của dự án Lexi, được xây dựng bằng Java và Spring Boot. Phiên bản hiện tại cung cấp nền tảng REST API: kiểm tra trạng thái ứng dụng, định dạng phản hồi, xử lý lỗi tập trung, validation và log theo request ID.

## Công nghệ

| Thành phần | Công nghệ / phiên bản trong dự án |
| --- | --- |
| Ngôn ngữ | Java 21 |
| Framework | Spring Boot 4.1.1 |
| HTTP API | Spring Web MVC |
| Validation | Jakarta Bean Validation qua Spring Boot Validation |
| Theo dõi ứng dụng | Spring Boot Actuator |
| Build | Maven Wrapper, Maven 3.9.16 |
| Kiểm thử | JUnit Jupiter, Spring Boot Test, MockMvc, AssertJ |

## Chức năng hiện có

- API `GET /health` trả về trạng thái và thời gian UTC.
- Kiểu phản hồi thành công `ApiResponse<T>` và phản hồi lỗi `ApiErrorResponse`.
- Xử lý lỗi validation, JSON không hợp lệ, `ResourceNotFoundException` và lỗi ngoài dự kiến.
- Từ chối thuộc tính JSON không được khai báo trong DTO.
- Nhận hoặc tạo `X-Request-ID`, trả lại qua response header và đưa vào log.
- Cấu hình riêng cho các profile `dev`, `test`, `prod`, có kiểm tra tính hợp lệ khi khởi động.

**Trạng thái tích hợp:** JWT, CORS và database hiện mới có các lớp đọc cấu hình. Dự án chưa triển khai xác thực JWT, áp dụng chính sách CORS hay kết nối cơ sở dữ liệu; chưa có dependency JDBC/JPA hoặc PostgreSQL driver. Bạn có thể chạy phiên bản hiện tại mà không cần cài PostgreSQL.

## Yêu cầu

- Cài JDK 21 và cấu hình `JAVA_HOME` trỏ đến thư mục JDK.
- Có kết nối Internet trong lần chạy đầu để Maven Wrapper tải Maven và các dependency.

Dự án đã kèm Maven Wrapper nên không bắt buộc cài Maven riêng. Chạy các lệnh bên dưới tại thư mục gốc `lexi-backend`.

## Chạy ứng dụng

### Windows (PowerShell)

```powershell
.\mvnw.cmd spring-boot:run
```

### Linux / macOS

```bash
sh ./mvnw spring-boot:run
```

Ứng dụng mặc định dùng profile `dev` và lắng nghe tại `http://localhost:8080`.

Kiểm tra bằng PowerShell:

```powershell
Invoke-RestMethod -Uri http://localhost:8080/health
```

Hoặc bằng curl trên Linux / macOS:

```bash
curl -i http://localhost:8080/health
```

Ví dụ response body (`timestamp` thay đổi theo thời điểm gọi):

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2026-10-03T00:00:00Z"
  }
}
```

## Cấu hình môi trường

| File | Vai trò |
| --- | --- |
| `src/main/resources/application.yml` | Cấu hình chung, cổng HTTP, profile mặc định và định dạng log |
| `src/main/resources/application-dev.yml` | Giá trị mặc định để phát triển trên máy cá nhân |
| `src/main/resources/application-test.yml` | Giá trị cố định cho kiểm thử |
| `src/main/resources/application-prod.yml` | Đọc cấu hình triển khai từ biến môi trường |

| Biến môi trường | Mặc định ở `dev` | Ý nghĩa |
| --- | --- | --- |
| `SPRING_PROFILES_ACTIVE` | `dev` khi không chọn profile | Chọn profile hoạt động |
| `SERVER_PORT` | `8080` | Cổng HTTP |
| `JWT_SECRET` | `dev-only-secret-change-me` | Giá trị cấu hình khóa JWT; bắt buộc cung cấp ở `prod` |
| `JWT_ACCESS_EXPIRES` | `15m` | Giá trị cấu hình thời hạn access token, dạng Duration |
| `JWT_REFRESH_EXPIRES_DAYS` | `30` | Giá trị cấu hình thời hạn refresh token theo ngày, tối thiểu `1` |
| `DATABASE_URL` | `jdbc:postgresql://localhost:5432/lexi` | URL database dự kiến; bắt buộc cung cấp ở `prod` |
| `CORS_ORIGIN` | Không được tham chiếu trong profile `dev` | Danh sách origin cho cấu hình `prod`, phân cách bằng dấu phẩy; bắt buộc cung cấp |

Profile `dev` đặt `lexi.cors.allowed-origins` thành `http://localhost:5173`. Profile `test` dùng secret `test-secret-only` và URL `jdbc:postgresql://localhost:5432/lexi_test`.

Ví dụ chọn profile và đổi cổng trên PowerShell:

```powershell
$env:SPRING_PROFILES_ACTIVE = "dev"
$env:SERVER_PORT = "8081"
.\mvnw.cmd spring-boot:run
```

Trên Linux / macOS:

```bash
SPRING_PROFILES_ACTIVE=dev SERVER_PORT=8081 sh ./mvnw spring-boot:run
```

Khi dùng `prod`, cần đặt `JWT_SECRET`, `DATABASE_URL` và `CORS_ORIGIN` trong môi trường chạy. Dùng secret riêng cho môi trường triển khai thay cho giá trị phát triển. Các giá trị này hiện chỉ được đọc và kiểm tra cấu hình như mô tả ở trên.

Dự án chưa cấu hình tự động đọc file `.env`; hãy thiết lập biến môi trường trong terminal, IDE hoặc nền tảng triển khai.

## API và xử lý lỗi

### Kiểm tra trạng thái

| Method | Endpoint | Mục đích |
| --- | --- | --- |
| `GET` | `/health` | Kiểm tra API Lexi, trả về `success`, `data.status` và `data.timestamp` |
| `GET` | `/actuator/health` | Kiểm tra trạng thái qua Spring Boot Actuator, dùng định dạng response của Actuator |

Health check hiện tại phản ánh trạng thái ứng dụng, chưa kiểm tra kết nối database.

### Phản hồi lỗi

Các lỗi được `GlobalExceptionHandler` xử lý có cấu trúc:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Malformed JSON request",
  "error": "Bad Request",
  "path": "/example",
  "timestamp": "2026-10-03T00:00:00Z"
}
```

`/example` chỉ minh họa trường `path`, không phải endpoint có sẵn.

| Trường hợp | HTTP status | `message` |
| --- | --- | --- |
| DTO không thỏa mãn validation | `400` | Mảng thông báo lỗi của các trường |
| JSON sai cú pháp, sai kiểu hoặc có thuộc tính không được khai báo | `400` | `Malformed JSON request` |
| Ném `ResourceNotFoundException` | `404` | Thông báo từ exception |
| Lỗi ngoài dự kiến | `500` | `Internal server error` |

### Request ID và log

Client có thể gửi header `X-Request-ID` dài từ 1 đến 100 ký tự, gồm chữ cái ASCII, chữ số, dấu chấm, gạch dưới hoặc gạch ngang. Nếu header thiếu hoặc không hợp lệ, server tạo UUID mới.

Request ID được trả về qua header `X-Request-ID` và xuất hiện trong log dưới dạng `[requestId=...]`. Mỗi request được ghi lại method, đường dẫn, HTTP status và thời gian xử lý theo mili giây.

## Kiểm thử và đóng gói

### Windows (PowerShell)

```powershell
# Chạy toàn bộ test
.\mvnw.cmd test

# Chạy test và tạo JAR
.\mvnw.cmd clean package

# Chạy JAR đã đóng gói
java -jar target/lexi-backend-0.0.1-SNAPSHOT.jar
```

### Linux / macOS

```bash
sh ./mvnw test
sh ./mvnw clean package
java -jar target/lexi-backend-0.0.1-SNAPSHOT.jar
```

Các test hiện có kiểm tra việc khởi tạo application context, binding cấu hình, health API, validation, định dạng lỗi, bean `Clock` và request ID. Các endpoint `/__test/*` chỉ được khai báo trong bộ test.

## Cấu trúc dự án

```text
lexi-backend/
├── .mvn/wrapper/                  # Cấu hình Maven Wrapper
├── mvnw                          # Wrapper cho Linux / macOS
├── mvnw.cmd                      # Wrapper cho Windows
├── pom.xml                       # Dependency và cấu hình build
└── src/
    ├── main/
    │   ├── java/com/lexi/
    │   │   ├── LexiBackendApplication.java
    │   │   ├── common/
    │   │   │   ├── api/           # Kiểu phản hồi thành công
    │   │   │   ├── error/         # Kiểu phản hồi lỗi và exception handler
    │   │   │   ├── time/          # Clock dùng UTC
    │   │   │   └── web/           # Filter request ID và log HTTP
    │   │   ├── config/            # Properties cho security, CORS, database
    │   │   └── health/            # Health controller và response
    │   └── resources/            # Cấu hình chung và các profile
    └── test/java/com/lexi/        # Các bài kiểm thử
```
