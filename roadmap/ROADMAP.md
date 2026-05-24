# ROADMAP — English Center Management System

> Lộ trình phát triển hệ thống quản lý trung tâm tiếng Anh.
> Tham chiếu: bản đồ nghiệp vụ tổng thể (business map).
>
> **Phiên bản v2 — 2026-05-15** — cập nhật sau review BA: thêm Campus first-class, đẩy `enrollment` skeleton + `teacher-availability` lên sớm, bổ sung Transfer/Defer, gộp thông tin phụ huynh inline trên Student (bỏ entity Guardian), đồng bộ Placement Test (purpose enum), Commitment Evaluation engine, Audit log từ P3.

---

## 1. Hiện trạng (Built)

| Domain            | Module                                                                                                                            |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Identity & Access | `auth`, `roles`, `permissions`, `cms-roles`, `cms-users`, `profile`                                                               |
| HR (cơ bản)       | `cms-teachers`, `teacher-certificate`, `teacher-skill`                                                                            |
| Assessment        | `test`, `test-section`, `passage`, `paragraph`, `question-group`, `question`, `question-answer`, `test-attempt`, `student-answer` |

Khoảng **30%** hệ thống đã hoàn thiện (nền tảng auth + ngân hàng đề + giáo viên).

---

## 2. Roadmap theo Phase

### Phase 1 — Core Academic (Xương sống nghiệp vụ)

**Mục tiêu:** Định nghĩa được "ai học cái gì" + multi-campus foundation.

- [ ] `campus` — cơ sở (first-class entity, dùng FK từ P1 trở đi)
- [ ] `student` — hồ sơ học viên; thông tin phụ huynh lưu inline (parent_name/phone/email)
- [ ] `program` — chương trình đào tạo
- [ ] `level` — cấp độ (code = VARCHAR, không enum cứng)
- [ ] `course` — khóa học cụ thể
- [ ] `syllabus` / `lesson` — giáo trình chi tiết
- [ ] `enrollment` (skeleton) — chuẩn bị cho Sales WON deal ngay, mở rộng ở P2

**Deliverable:** Quản lý được catalog + có chỗ chứa "Sales đã chốt deal" trước khi vào vận hành.

---

### Phase 2 — Operations (Vận hành hằng ngày)

**Mục tiêu:** Lớp học chạy được trên hệ thống, hỗ trợ đầy đủ Offline + Online 1:1 + nghiệp vụ học vụ thực tế (chuyển/bảo lưu/thử).

- [ ] `room` — phòng học (FK campus_id)
- [ ] `class` — lớp cụ thể của 1 course (capacity check, override rule)
- [ ] `schedule` (`class_session`) — lịch học, conflict detection (phòng/GV/HV)
- [ ] `enrollment` (mở rộng) — thêm `class_id`, status: PENDING/RESERVED/ACTIVE/TRANSFERRED/DEFERRED/DROPPED/COMPLETED
- [ ] **Transfer flow** — chuyển lớp có audit
- [ ] **Defer flow** — bảo lưu
- [ ] `attendance` — điểm danh
- [ ] `make-up-class` — học bù
- [ ] `homework` / `homework-submission` — phục vụ Ngữ pháp + IELTS
- [ ] `teacher-availability` (kéo từ P6) — cần trước slot-booking
- [ ] `slot-booking` — Online 1:1

**Deliverable:** Vận hành trọn vẹn 1 khóa, xử lý được tình huống thật (chuyển/bảo lưu/thử/học bù/1:1).

---

### Phase 3 — Finance (Dòng tiền)

**Mục tiêu:** Quản lý học phí, doanh thu, bật audit log.

- [ ] `tuition` — bảng giá học phí (PER_COURSE / PER_SESSION, versioning theo kỳ)
- [ ] `invoice` — hóa đơn (Invoice ↔ Enrollment qua InvoiceLine, FK campus_id)
- [ ] `payment` — thanh toán
- [ ] `revenue-allocation` — phân bổ doanh thu theo buổi (cash vs accrual)
- [ ] `discount` / `voucher` — giảm giá, học bổng
- [ ] `refund` — hoàn tiền theo policy
- [ ] **Audit log subscriber** — bật cho mọi entity tài chính từ phase này

**Deliverable:** Báo cáo doanh thu theo campus/course/period, công nợ học viên, audit trail đầy đủ.

---

### Phase 4 — Bridge: Assessment ↔ Class (Tận dụng module Test đã có)

**Mục tiêu:** Gắn ngân hàng đề/bài test hiện có vào lớp học thật + engine cam kết đầu ra.

- [ ] Liên kết `test-attempt` ↔ `enrollment` / `class` qua `purpose` enum (PLACEMENT/PROGRESS/MIDTERM/FINAL/PRACTICE)
- [ ] `exam-session` — buổi thi giữa kỳ / cuối kỳ
- [ ] `grading-rubric` — thang điểm + cross-check 2 examiner cho Speaking/Writing band cao
- [ ] `report-card` — phiếu kết quả cuối khóa
- [ ] **`commitment-evaluation`** — engine đối chiếu target_outcome ↔ report card → trigger retake/refund

**Deliverable:** Học viên thi xong có điểm theo rubric chuẩn, hệ thống tự đánh giá cam kết đầu ra.

---

### Phase 5 — CRM & Admission (Mở rộng đầu phễu)

**Mục tiêu:** Quản lý từ lúc khách quan tâm đến lúc đóng tiền.

- [ ] `lead` — khách tiềm năng, nguồn marketing, sales follow-up
- [ ] `consultation` — lịch tư vấn, ghi chú
- [ ] `placement-test` — flow test đầu vào, output ra level đề xuất
- [ ] Conversion funnel: Lead → Consultation → Placement → Enrollment

**Deliverable:** Đo được tỉ lệ chuyển đổi marketing → học viên.

---

### Phase 6 — HR mở rộng (Hoàn thiện vòng giáo viên)

**Mục tiêu:** Tính lương, quản lý hợp đồng giáo viên.

- [x] ~~`teacher-availability`~~ — đã đẩy lên P2 (vì slot-booking phụ thuộc)
- [ ] `contract` — hợp đồng, mức lương theo giờ
- [ ] `timesheet` — chấm công theo buổi dạy thực tế
- [ ] `payroll` — tính lương kỳ + phụ cấp + thuế TNCN + BHXH

**Deliverable:** Tự động tính lương cuối tháng, đầy đủ thuế/bảo hiểm.

---

### Phase 7 — Communication & Analytics

**Mục tiêu:** Trải nghiệm người dùng và ra quyết định.

- [ ] `notification` — thông báo in-app, email, SMS, push
- [ ] `email-template` — mẫu thông báo lịch học, kết quả, hóa đơn
- [ ] `parent-portal` — phụ huynh xem điểm danh, kết quả, học phí
- [ ] `feedback` — đánh giá giáo viên, NPS
- [ ] `dashboard` — KPI vận hành (sĩ số, doanh thu, chuyên cần)
- [ ] `report` — báo cáo định kỳ
- [ ] `audit-log` — vết thao tác quan trọng

**Deliverable:** Hệ thống vận hành minh bạch, có insight.

---

## 3. Ma trận Module ↔ Domain

| Domain               | Đã có           | Còn thiếu                                                                                                                               | Phase  |
| -------------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 0. Foundation        | —               | `campus`, audit-log skeleton                                                                                                            | P1, P3 |
| 1. Identity & Access | ✅ Đầy đủ       | promote student account flow                                                                                                            | P1     |
| 2. Academic          | —               | `student` (parent info inline), `program`, `level`, `course`, `syllabus`, `lesson`, `enrollment` (skeleton)                             | P1     |
| 3. Operations        | —               | `room`, `class`, `schedule`, `enrollment+`, transfer/defer, `attendance`, `make-up`, `homework`, `teacher-availability`, `slot-booking` | P2     |
| 4. Finance           | —               | `tuition`, `invoice` (N-N via line), `payment`, `revenue-allocation`, `voucher`, `refund`                                               | P3     |
| 5. Assessment        | ✅ Ngân hàng đề | `purpose` enum, `exam-session`, `rubric` (cross-check), `report-card`, `commitment-evaluation`                                          | P4     |
| 6. CRM & Admission   | —               | `lead`, `consultation`, `placement-test`, `placement-result`                                                                            | P5     |
| 7. HR                | 🟡 Cơ bản       | `contract`, `timesheet`, `payroll` (PIT + BHXH)                                                                                         | P6     |
| 8. Communication     | —               | `notification` + opt-in, `email-template`, `parent-portal`                                                                              | P7     |
| X. Analytics         | —               | `dashboard`, `report`, `audit-log` (UI)                                                                                                 | P7     |

---

## 4. Ưu tiên triển khai

```
P1 (Academic + Campus + Enrollment skeleton)
       ↓
P2 (Operations: class, schedule, transfer/defer, availability, slot-booking)
       ↓
P3 (Finance + Audit log subscriber on)
       ↓
P4 (Bridge Assessment + Commitment Evaluation engine)
       ↓
─────────── MVP vận hành ───────────
       ↓
P5 (CRM) → P6 (HR+) → P7 (Comm & Analytics + Audit UI)
```

P1 → P4 là **MVP vận hành**. P5 trở đi là mở rộng.

---

## 5. Changelog v2 (2026-05-15)

| Thay đổi                                                                               | Lý do                                                                   |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Thêm `campus` first-class ở P1                                                         | Tránh migrate string khi P3 báo cáo theo cơ sở                          |
| Bỏ entity `Guardian` riêng — gộp thông tin phụ huynh thành field inline trên `Student` | Đơn giản hoá; parent-portal dùng magic link, không cần guardian account |
| Bỏ Trial flow                                                                          | Ngoài phạm vi MVP; có thể bổ sung sau khi nghiệp vụ chốt policy         |
| `enrollment` skeleton lên P1                                                           | Sales WON deal cần chỗ chứa trước khi P2 vận hành                       |
| `Level.code` chuyển VARCHAR                                                            | Tránh enum migration mỗi program mới                                    |
| Thêm Transfer / Defer flow vào P2                                                      | Nghiệp vụ hằng ngày, không có sẽ thiếu                                  |
| `teacher-availability` chuyển P6 → P2                                                  | `slot-booking` phụ thuộc                                                |
| `class.current_enrollment_count` + capacity rule                                       | Thiếu trong v1                                                          |
| `Invoice ↔ Enrollment` qua `InvoiceLine` (N-N)                                         | 1 HV IELTS enroll 4 skill cùng lúc, gộp 1 invoice                       |
| Thêm `revenue-allocation` + cash/accrual policy                                        | Báo cáo doanh thu chính xác                                             |
| `Invoice.campus_id` FK                                                                 | Báo cáo doanh thu theo cơ sở chạy được                                  |
| Audit log subscriber bật từ P3 (UI ở P7)                                               | Compliance: mọi giao dịch tài chính có vết                              |
| Bỏ `is_placement_test` boolean, dùng `test_attempt.purpose` enum                       | Tránh trùng khái niệm với PlacementResult                               |
| `RubricScore.examiner_role` + cross-check policy                                       | Speaking/Writing IELTS band cao cần 2 examiner                          |
| Thêm `commitment-evaluation` engine ở P4                                               | USP "cam kết đầu ra" cần workflow, không chỉ flag                       |
| `Payroll` thêm PIT/BHXH                                                                | Tuân thủ luật VN                                                        |
| `Notification` thêm preference + retry + rate limit                                    | Chống spam, GDPR-ish                                                    |
| Bổ sung Open Questions: defer, transfer fee, revenue basis, cross-examiner             | Phải đóng trước khi vào phase tương ứng                                 |
