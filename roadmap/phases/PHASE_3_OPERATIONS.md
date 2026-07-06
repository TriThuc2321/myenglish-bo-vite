# Phase 3 — Operations (Vận hành lớp)

> **Mục tiêu**: Một khoá học chạy được trọn vẹn trên hệ thống. Bao gồm requirement đặc thù Online 1:1 (§4 DATA_CENTER) và homework (§5).
>
> **Pre-condition**: `suggested_level` từ P2 (IELTS Test Flow) để xếp lớp; `campus`, `course`, `enrollment` skeleton từ P1.

---

## 3.1. Module `room`

### Entity `Room`

- `campus_id` FK Campus (P1.0) — **không dùng string**
- `name`, `capacity`
- `facilities` (JSON), `is_active`

> _Open question_: cần biết số cơ sở + số phòng/cơ sở để seed.

---

## 3.2. Module `class`

### Entity `Class`

- `course_id` FK
- `campus_id` FK Campus (null nếu pure online)
- `code` (auto, ví dụ `IELTS-4.5-W-2026-A`)
- `start_date`, `expected_end_date`, `actual_end_date`
- `max_students` (mặc định lấy từ Course; Online 1:1 = 1 — §8.3)
- `current_enrollment_count` (denormalized, sync khi enroll/drop)
- `primary_teacher_id`, `assistant_teacher_ids` (array — §8.2)
- `delivery_mode` (kế thừa từ Course, cho phép override **chỉ khi** Course.delivery_mode ≠ `OFFLINE_ONLY` — không cho biến offline-only course thành online)
- `meeting_url` (bắt buộc nếu delivery*mode = ONLINE*\*)
- `status`: `PLANNED | OPEN_FOR_ENROLL | ONGOING | FINISHED | CANCELLED`

### Business rule

- **Capacity check**: từ chối enrollment khi `current_enrollment_count >= max_students`. Override yêu cầu permission `class.over_capacity`.
- **Xếp lớp**: ưu tiên khớp `suggested_level_id` từ `TestResult` (P2.5) với `class.course.level_id`.

---

## 3.3. Module `schedule`

### Entity `ClassSession`

- `class_id`, `session_no`, `lesson_id` (nullable, mapping Syllabus)
- `room_id` (null nếu online)
- `teacher_id` (cho phép khác primary khi thay GV)
- `start_at`, `end_at`
- `status`: `SCHEDULED | DONE | CANCELLED | RESCHEDULED`
- `meeting_url_override`

### Conflict checks (raw SQL, có index)

- Phòng không trùng giờ (chỉ offline)
- GV không trùng giờ (mọi mode)
- Học viên không trùng giờ (khi enroll song song nhiều class — §8.1)

### Bulk generator

- Từ `start_date` + frequency → sinh đủ N session.

---

## 3.4. Module `enrollment` _(mở rộng từ skeleton P1.2)_

### Entity `Enrollment` (extend từ P1.2)

> 1 student có thể học song song nhiều skill IELTS — §3.5 + §8.1.

- `student_id`, `course_id` (từ P1)
- `class_id` (thêm ở P3 — nullable cho PENDING/RESERVED)
- `enrolled_at`, `start_date`, `end_date`
- `status`: `PENDING | RESERVED | ACTIVE | TRANSFERRED | DEFERRED | DROPPED | COMPLETED`
- `target_outcome`, `commitment_policy_code`, `is_retake` (từ P1)
- `transferred_from_enrollment_id`, `deferred_until` (audit chuyển lớp / bảo lưu)

### Sub-flow: Transfer (chuyển lớp)

- Endpoint `POST /enrollments/:id/transfer` — body: `target_class_id`, `reason`
- Tạo enrollment mới với `transferred_from_enrollment_id`, đóng enrollment cũ status `TRANSFERRED`
- Validation: cùng course (hoặc course tương đương — cần policy CEO)
- Tài chính: chính sách chênh lệch học phí (cần input — Open Q)

### Sub-flow: Defer (bảo lưu)

- Endpoint `POST /enrollments/:id/defer` — body: `until_date`, `reason`
- Status → `DEFERRED`; release slot trong class hiện tại
- Khi reactivate: tạo enrollment mới link `transferred_from_enrollment_id`

---

## 3.5. Module `attendance`

### Entity `Attendance`

- `class_session_id`, `enrollment_id`
- `status`: `PRESENT | ABSENT | LATE | EXCUSED`
- `note`, `marked_by`, `marked_at`

### API

- Bulk endpoint: GV điểm danh cả buổi 1 lần.

---

## 3.6. Module `make-up-class`

### Entity `MakeUp`

- `original_attendance_id` → `target_class_session_id` (§8.4)

### Validation

- Chỉ cho phép make-up trong cùng course/level.

---

## 3.7. Module `homework` _(bổ sung từ §5 DATA_CENTER)_

### Entity `Homework`

- `lesson_id` (template) HOẶC `class_session_id` (instance)
- `title`, `description`, `due_at`, `attachments`

### Entity `HomeworkSubmission`

- `homework_id`, `enrollment_id`, `submitted_at`
- `content`, `score`, `feedback`

> Reuse cho cả chương trình Ngữ pháp (§5).

---

## 3.8. Module `teacher-availability` _(kéo lên từ P7 vì slot-booking phụ thuộc)_

### Entity `TeacherAvailability`

- `teacher_id`
- `weekday` HOẶC `specific_date`
- `start_time`, `end_time`, `is_recurring`

> Trước đây ở P7.1. Đẩy lên P3 vì `slot-booking` (3.9) không thể chạy nếu thiếu availability. P7 sẽ chỉ còn contract/timesheet/payroll.

---

## 3.9. Module `slot-booking` _(cho Online 1:1 — §4)_

### Entity `SlotBooking`

- `teacher_id`, `enrollment_id` (bắt buộc — không booking tự do, phải gắn enrollment đã đóng tiền)
- `start_at`, `end_at`, `status`, `meeting_url`
- Tiêu thụ slot từ `teacher-availability` (3.8) — validate không trùng + nằm trong availability window.

---

## Deliverable

- Mở lớp → xếp lịch (offline + online 1:1) → enroll → điểm danh → giao homework.
- Conflict detection chạy ổn (phòng / GV / học viên).
