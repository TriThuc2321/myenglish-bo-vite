# Phase 0 — Bối cảnh & Nguyên tắc chung

> Áp dụng xuyên suốt mọi phase. Đọc trước khi bắt đầu phase bất kỳ.

## Hiện trạng

- **Đã có (~30%)**: `auth`, `roles`, `permissions`, `cms-users`, `cms-roles`, `cms-teachers`, `teacher-certificate`, `teacher-skill`, `profile`, `test`, `test-section`, `passage`, `paragraph`, `question-group`, `question`, `question-answer`, `test-attempt`, `student-answer`.
- **Còn thiếu (~70%)**: toàn bộ vòng đời học viên — từ Lead → Enrollment → Vận hành lớp → Tài chính → Báo cáo.

## Ưu tiên

- **MVP vận hành**: P1 → P2 → P3 → P4.
- **Mở rộng**: P5 → P6 → P7.

## Ràng buộc kỹ thuật chung (áp cho mọi entity)

| Thành phần         | Yêu cầu                                                                                                                                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Primary key        | UUID v4                                                                                                                                                                                                            |
| Audit              | Embed `AuditMetadata` (created_at, updated_at, created_by, updated_by)                                                                                                                                             |
| Audit log chi tiết | Với entity nhạy cảm (invoice/payment/refund/enrollment/payroll/contract): bắt buộc TypeORM subscriber ghi `before/after` từ Phase 3 trở đi (entity `AuditLog` ra ở P7, nhưng skeleton bảng + subscriber bật từ P3) |
| Soft delete        | `status: ACTIVE \| INACTIVE \| DELETED` (enum `Status`)                                                                                                                                                            |
| Index              | Index trên FK, trường filter/sort thường xuyên                                                                                                                                                                     |
| Phân trang         | List endpoint trả `PaginationDto<T>`                                                                                                                                                                               |
| Authorization      | `@CheckPermissions()` mọi handler; đăng ký subject mới trong CASL factory                                                                                                                                          |
| Env                | Đọc từ `ENV` (`src/configs/env.config.ts`), không dùng `process.env`                                                                                                                                               |
| Multi-campus       | Mọi entity vật lý (room, class, invoice, payment) phải có `campus_id` FK ngay từ P1 — không dùng string tự do                                                                                                      |

## Nguyên tắc nghiệp vụ nền

1. **Tài khoản đăng nhập (login identity):**
   - Segment `ADULT / UNI`: `Student.user_id` là tài khoản login bắt buộc.
   - Segment `KIDS / TEENS`: `Student.user_id` có thể null; thông tin phụ huynh lưu inline trên `Student` (parent_name/phone/email). Khi cần, có thể tạo `User` cho student qua endpoint promote.
2. **Multi-campus là first-class** — không phải string. Entity `Campus` ra ở P1.
3. **Audit log không phải tính năng cuối** — bật subscriber từ P3 để mọi giao dịch tài chính đều có vết.
4. **Cam kết đầu ra (USP)** — phải có workflow rule, không chỉ là cờ boolean. Định nghĩa ở P2, engine đánh giá ở P4.

## Checklist cho mỗi module

- [ ] Scaffold bằng `/new-module` skill
- [ ] Entity + migration + index
- [ ] DTO: `Query*Dto`, `Create*Dto`, `Update*Dto` với class-validator
- [ ] Service: `findAll` trả `PaginationDto`, `findOne`, `create`, `update`, `softDelete`
- [ ] Controller: `@CheckPermissions()` + `@ApiTags` + Swagger DTO
- [ ] CASL: đăng ký subject mới
- [ ] Seed dữ liệu master (nếu có)
- [ ] Unit test service + e2e controller (happy path)
- [ ] Cập nhật `entities/README.md`

## Open Questions phải đóng trước theo phase

| Câu hỏi                                                         | Block phase              | Owner              |
| --------------------------------------------------------------- | ------------------------ | ------------------ |
| Bảng học phí từng course                                        | P3                       | Tài chính / CEO    |
| Chính sách giảm giá / voucher                                   | P3                       | Marketing / CEO    |
| Quy trình hoàn tiền %                                           | P3                       | Tài chính          |
| Sĩ số tối đa / level                                            | P2                       | Học vụ             |
| Số cơ sở + phòng/cơ sở                                          | P2                       | Học vụ / Admin     |
| Tỉ lệ GV/HV                                                     | P2                       | Học vụ             |
| Hệ thống chấm công hiện tại                                     | P6                       | HR                 |
| Cam kết đầu ra (retake/refund/partial) — chi tiết điều kiện đạt | P2 rule + P3 + P4 engine | CEO                |
| Kênh marketing chính                                            | P5                       | Marketing          |
| Kênh thanh toán                                                 | P3                       | Tài chính          |
| Có cho bảo lưu (defer) không? Điều kiện?                        | P2                       | Học vụ             |
| Quy tắc chuyển lớp (transfer) — free hay tính phí?              | P2 + P3                  | Học vụ / Tài chính |
| Doanh thu ghi nhận theo cash hay accrual (phân bổ theo buổi)?   | P3                       | Tài chính / CEO    |
| Speaking/Writing chấm 1 hay 2 examiner (cross-check)?           | P4                       | Học vụ             |
