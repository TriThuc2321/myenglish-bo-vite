# ROADMAP — English Center Management System

> Lộ trình phát triển hệ thống quản lý trung tâm tiếng Anh.
> Tham chiếu: bản đồ nghiệp vụ tổng thể (business map).
>
> **Phiên bản v3 — 2026-06-10** — thêm Phase 2 IELTS Test Flow (auto-scoring, placement engine, test-result) giữa P1 và Operations; renumber P2→P8; tách placement logic khỏi CRM.

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
- [ ] `enrollment` (skeleton) — chuẩn bị cho Sales WON deal ngay, mở rộng ở P3

**Deliverable:** Quản lý được catalog + có chỗ chứa "Sales đã chốt deal" trước khi vào vận hành.

---

### Phase 2 — IELTS Test Flow (Thi thử & Phân loại đầu vào)

**Mục tiêu:** Khai thác ngân hàng đề đã có (passage, paragraph, question-group, test, test-section) để thực hiện được bài thi IELTS hoàn chỉnh — từ phân công đề, làm bài, chấm điểm, đến trả kết quả.

**Modules hiện có (đã build):**

- `passage`, `paragraph` — ngữ liệu Reading/Listening
- `question-group`, `question`, `question-answer` — câu hỏi theo nhóm
- `test`, `test-section` — cấu trúc đề thi (Full / Section)
- `test-attempt`, `student-answer` — bản ghi làm bài

**Việc cần hoàn thiện:**

- [ ] `test-attempt` — thêm `purpose` enum: `PLACEMENT | PRACTICE | MIDTERM | FINAL | PROGRESS`; liên kết với `student_id` (P1)
- [ ] **Auto-scoring engine** — chấm tự động cho dạng câu hỏi Multiple Choice / True-False-NG / Fill-in-the-blank; trả về `raw_score` + `band_score` theo thang IELTS
- [ ] **Writing / Speaking stub** — tạo `student-answer` kiểu `ESSAY` / `AUDIO_URL`; chờ manual grading (P4 bổ sung rubric)
- [ ] `test-result` — tổng hợp điểm 4 kỹ năng (Listening, Reading, Writing, Speaking) → overall band; lưu snapshot đề + đáp án tại thời điểm thi
- [ ] **Placement flow** — API nhận `student_id` + `test_id` → tạo `test-attempt` purpose=PLACEMENT → chấm → trả `suggested_level` (dùng lại `level` từ P1)
- [ ] **Time-limit enforcement** — mỗi `test-section` có `duration_minutes`; server validate `submitted_at − started_at`
- [ ] **Review mode** — học viên xem lại bài sau khi nộp (đáp án + giải thích)

**Deliverable:** Học viên làm được bài IELTS đầy đủ 4 kỹ năng, hệ thống tự chấm Listening/Reading, ghi nhận kết quả, đề xuất level phù hợp — đủ dữ liệu để xếp lớp ở P3.

---

### Phase 3 — Operations (Vận hành hằng ngày)

**Mục tiêu:** Lớp học chạy được trên hệ thống, hỗ trợ đầy đủ Offline + Online 1:1 + nghiệp vụ học vụ thực tế (chuyển/bảo lưu/thử).

- [ ] `room` — phòng học (FK campus_id)
- [ ] `class` — lớp cụ thể của 1 course (capacity check, override rule); xếp lớp dựa trên `suggested_level` từ P2
- [ ] `schedule` (`class_session`) — lịch học, conflict detection (phòng/GV/HV)
- [ ] `enrollment` (mở rộng) — thêm `class_id`, status: PENDING/RESERVED/ACTIVE/TRANSFERRED/DEFERRED/DROPPED/COMPLETED
- [ ] **Transfer flow** — chuyển lớp có audit
- [ ] **Defer flow** — bảo lưu
- [ ] `attendance` — điểm danh
- [ ] `make-up-class` — học bù
- [ ] `homework` / `homework-submission` — phục vụ Ngữ pháp + IELTS
- [ ] `teacher-availability` (kéo từ P7) — cần trước slot-booking
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

### Phase 5 — Bridge: Assessment ↔ Class (Gắn kết thi cử vào lớp học)

**Mục tiêu:** Gắn kết luồng thi IELTS (P2) vào lớp học thật (P3) + engine cam kết đầu ra.

- [ ] Liên kết `test-attempt` ↔ `enrollment` / `class` qua `purpose` enum (PLACEMENT/PROGRESS/MIDTERM/FINAL/PRACTICE)
- [ ] `exam-session` — buổi thi giữa kỳ / cuối kỳ
- [ ] `grading-rubric` — thang điểm + cross-check 2 examiner cho Speaking/Writing band cao (bổ sung cho Writing/Speaking stub từ P2)
- [ ] `report-card` — phiếu kết quả cuối khóa
- [ ] **`commitment-evaluation`** — engine đối chiếu target_outcome ↔ report card → trigger retake/refund (kết nối `refund` ở P4)

**Deliverable:** Học viên thi xong có điểm theo rubric chuẩn, hệ thống tự đánh giá cam kết đầu ra.

---

### Phase 6 — CRM & Admission (Mở rộng đầu phễu)

**Mục tiêu:** Quản lý từ lúc khách quan tâm đến lúc đóng tiền.

- [ ] `lead` — khách tiềm năng, nguồn marketing, sales follow-up
- [ ] `consultation` — lịch tư vấn, ghi chú
- [ ] `placement-test` — wrapper CRM cho luồng test đầu vào (dùng lại engine P2); lưu lịch sử tư vấn + level đề xuất
- [ ] Conversion funnel: Lead → Consultation → Placement → Enrollment

**Deliverable:** Đo được tỉ lệ chuyển đổi marketing → học viên.

---

### Phase 7 — HR mở rộng (Hoàn thiện vòng giáo viên)

**Mục tiêu:** Tính lương, quản lý hợp đồng giáo viên.

- [x] ~~`teacher-availability`~~ — đã đẩy lên P3 (vì slot-booking phụ thuộc)
- [ ] `contract` — hợp đồng, mức lương theo giờ
- [ ] `timesheet` — chấm công theo buổi dạy thực tế
- [ ] `payroll` — tính lương kỳ + phụ cấp + thuế TNCN + BHXH

**Deliverable:** Tự động tính lương cuối tháng, đầy đủ thuế/bảo hiểm.

---

### Phase 8 — Communication & Analytics

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

| Domain               | Đã có                                                                         | Còn thiếu                                                                                                                               | Phase  |
| -------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 0. Foundation        | —                                                                             | `campus`, audit-log skeleton                                                                                                            | P1, P4 |
| 1. Identity & Access | ✅ Đầy đủ                                                                     | promote student account flow                                                                                                            | P1     |
| 2. Academic          | —                                                                             | `student` (parent info inline), `program`, `level`, `course`, `syllabus`, `lesson`, `enrollment` (skeleton)                             | P1     |
| 2. IELTS Test Flow   | 🟡 Ngân hàng đề (passage, paragraph, question-group, test, test-section, ...) | `purpose` enum, auto-scoring, `test-result`, placement flow, time-limit, review mode                                                    | P2     |
| 3. Operations        | —                                                                             | `room`, `class`, `schedule`, `enrollment+`, transfer/defer, `attendance`, `make-up`, `homework`, `teacher-availability`, `slot-booking` | P3     |
| 4. Finance           | —                                                                             | `tuition`, `invoice` (N-N via line), `payment`, `revenue-allocation`, `voucher`, `refund`                                               | P4     |
| 5. Assessment Bridge | ✅ Ngân hàng đề + test flow (P2)                                              | `exam-session`, `rubric` (cross-check), `report-card`, `commitment-evaluation`                                                          | P5     |
| 6. CRM & Admission   | —                                                                             | `lead`, `consultation`, `placement-test` (CRM wrapper), `placement-result`                                                              | P6     |
| 7. HR                | 🟡 Cơ bản                                                                     | `contract`, `timesheet`, `payroll` (PIT + BHXH)                                                                                         | P7     |
| 8. Communication     | —                                                                             | `notification` + opt-in, `email-template`, `parent-portal`                                                                              | P8     |
| X. Analytics         | —                                                                             | `dashboard`, `report`, `audit-log` (UI)                                                                                                 | P8     |

---

## 4. Ưu tiên triển khai

```
P1 (Academic + Campus + Enrollment skeleton)
       ↓
P2 (IELTS Test Flow: auto-scoring, placement, test-result)
       ↓
P3 (Operations: class, schedule, transfer/defer, availability, slot-booking)
       ↓
P4 (Finance + Audit log subscriber on)
       ↓
P5 (Bridge Assessment ↔ Class + Commitment Evaluation engine)
       ↓
─────────── MVP vận hành ───────────
       ↓
P6 (CRM) → P7 (HR+) → P8 (Comm & Analytics + Audit UI)
```

P1 → P5 là **MVP vận hành**. P6 trở đi là mở rộng.

---

## 5. Changelog v3 (2026-06-10)

| Thay đổi                                                                                                | Lý do                                                                                    |
| ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Thêm **Phase 2 — IELTS Test Flow** (mới) giữa P1 và P2 (Operations)                                     | Cần hoàn thiện luồng thi + auto-scoring + placement trước khi xếp lớp ở P3               |
| Renumber toàn bộ: P2→P3, P3→P4, P4→P5, P5→P6, P6→P7, P7→P8                                              | Giữ thứ tự dependency đúng                                                               |
| P2 bổ sung: `purpose` enum, auto-scoring engine, `test-result`, placement flow, time-limit, review mode | Khai thác ngân hàng đề đã có (passage, paragraph, question-group, test, test-section)    |
| `teacher-availability` reference cập nhật P6→P3 (Operations)                                            | Đồng bộ với renumber                                                                     |
| `placement-test` ở P6 (CRM) giờ là wrapper CRM dùng lại engine P2                                       | Tránh duplicate logic; P2 chứa engine, P6 chứa CRM context (lead, consultation, history) |
| P5 (Bridge) cập nhật note: rubric là bổ sung cho Writing/Speaking stub từ P2; refund link tới P4        | Làm rõ dependency giữa P2 → P5 và P4 → P5                                                |
| MVP mở rộng từ P1→P4 thành P1→P5                                                                        | P5 (commitment-evaluation) là USP cốt lõi, cần nằm trong MVP                             |

---

## 6. Changelog v2 (2026-05-15)

| Thay đổi                                                                               | Lý do                                                                   |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Thêm `campus` first-class ở P1                                                         | Tránh migrate string khi P3 báo cáo theo cơ sở                          |
| Bỏ entity `Guardian` riêng — gộp thông tin phụ huynh thành field inline trên `Student` | Đơn giản hoá; parent-portal dùng magic link, không cần guardian account |
| Bỏ Trial flow                                                                          | Ngoài phạm vi MVP; có thể bổ sung sau khi nghiệp vụ chốt policy         |
| `enrollment` skeleton lên P1                                                           | Sales WON deal cần chỗ chứa trước khi P3 vận hành                       |
| `Level.code` chuyển VARCHAR                                                            | Tránh enum migration mỗi program mới                                    |
| Thêm Transfer / Defer flow vào P3 (Operations)                                         | Nghiệp vụ hằng ngày, không có sẽ thiếu                                  |
| `teacher-availability` chuyển P7 → P3 (Operations)                                     | `slot-booking` phụ thuộc                                                |
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
