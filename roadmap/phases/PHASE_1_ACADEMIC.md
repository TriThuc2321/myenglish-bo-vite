# Phase 1 — Core Academic (Catalog đào tạo)

> **Mục tiêu**: Mô hình hoá toàn bộ catalog Program → Track → Level → Course → Syllabus → Lesson dựa trên §3 DATA_CENTER, đồng thời chuẩn bị skeleton cho Enrollment + Campus để các phase sau không phải migrate.
> **Pre-condition**: tách `student` khỏi `user` (yêu cầu §2 DATA_CENTER).

---

## 1.0. Module `campus` _(thêm mới — first-class entity)_

### Entity `Campus`

- `code` (unique, ví dụ `MYE-Q1`, `MYE-TD`), `name`, `address`, `phone`
- `is_active`

> **Lý do nâng lên P1**: nếu để `campus` là string tự do trên `Room` (P2), báo cáo doanh thu theo cơ sở (P3) và payroll theo cơ sở (P6) sẽ phải migrate dữ liệu. Đưa lên P1 chi phí thấp.

---

## 1.1. Module `student`

### Design: Student luôn có User

Mỗi `Student` được tạo kèm một `User` record trong cùng transaction. Dữ liệu cá nhân (`full_name`, `dob`, `gender`, `phone`, `email`) lưu trên `User`; `Student` chỉ giữ metadata học thuật và tuyển sinh. Điều này tránh data duplication và cho phép student đăng nhập qua Google OAuth — không cần tạo thêm entity.

**Luồng kích hoạt tài khoản:**

1. Admin tạo student → `User` được tạo với `email_verified = false`.
2. Student đăng nhập lần đầu bằng Google OAuth (dùng đúng email admin đã nhập) → hệ thống tự động set `email_verified = true` và `provider = GOOGLE`.
3. Không có endpoint `activate-account` riêng; toàn bộ kích hoạt diễn ra tự động qua Google OAuth.

### Entity `Student`

- `user_id` FK **NOT NULL** → `users` (luôn tạo cùng Student)
- `entry_level_code` (nullable, set sau Placement Test)
- `student_code` (unique, format `MYE-{yyyy}-{seq}`)
- `segment`: enum `KIDS | TEENS | UNI | ADULT`
- **Thông tin phụ huynh (inline trên Student, không tách entity riêng):**
  - `parent_name`, `parent_phone`, `parent_email`, `parent_relationship` (mom/dad/other)
- `note`

> Các trường `full_name`, `dob`, `gender`, `phone`, `email` **không còn trên Student** — truy cập qua `student.user.*`.
> `primary_campus_id` đã bỏ khỏi Student ở giai đoạn này; phân tích theo cơ sở sẽ dựa vào dữ liệu Class/Enrollment ở P2.

### API

- CRUD `student` (create tự động tạo `User` kèm theo)
- Query: filter theo segment, level, status; keyword search trên `studentCode`, `user.firstName`, `user.lastName`, `user.email`, `user.phone`

### Business rule

- `segment ∈ {KIDS, TEENS}` → bắt buộc có `parent_name` + `parent_phone`.
- Không còn ràng buộc `userId` bắt buộc theo segment — mọi segment đều tự động có User ngay khi tạo.

### CASL subject mới

`student`, `campus`

---

## 1.2. Module `enrollment` _(skeleton — đẩy lên từ P2)_

> **Lý do đẩy sớm**: P5 (Sales) cần `target_outcome` (cam kết đầu ra) ngay khi WON deal, trước khi P2 hoàn thành. Để tránh chỗ chứa tạm, đưa skeleton ra P1.

### Entity `Enrollment`

- `student_id`, `course_id` (chưa cần `class_id` ở P1 — sẽ thêm ở P2)
- `enrolled_at`, `target_outcome` (JSON — cam kết đầu ra §1.1)
- `commitment_policy_code` (link tới policy retake/refund — cần CEO chốt)
- `is_retake` (boolean)
- `status`: `PENDING | RESERVED | ACTIVE | TRANSFERRED | DEFERRED | DROPPED | COMPLETED`
  - `PENDING`: sales đã ghi nhận, chưa đóng tiền
  - `RESERVED`: đã đóng cọc, chưa xếp lớp
  - `ACTIVE`: đã xếp lớp (gắn `class_id` ở P2)

### API (P1 mức tối thiểu)

- Create từ PlacementResult (P5) hoặc tay
- Update status
- Chưa cần attendance/transfer/defer flow — để P2

---

## 1.2. Module `program`

### Entity `Program`

- `code`: `CAMBRIDGE | IELTS | COMMUNICATION | GRAMMAR`
- `name`, `description`, `is_active`

### Seed

4 program từ §3.2 + §5 DATA_CENTER.

---

## 1.3. Module `level`

### Entity `Level`

- `program_id` FK
- `code`: **VARCHAR + UNIQUE (program_id, code)** — không dùng enum cứng. Lý do: program mới (TOEIC, IELTS Computer-based, etc.) sẽ thêm liên tục, enum buộc phải migration mỗi lần.
- `name`, `display_order`, `age_min`, `age_max`

### Seed code gợi ý

`STARTERS`, `MOVERS`, `FLYERS`, `KET`, `PET`, `PRE_IELTS`, `IELTS_4_5_5`, `IELTS_6_6_5`, `COMM_1..4`.

### Seed

Level cho cả 4 program từ §3.3 → §3.6.

---

## 1.4. Module `course`

### Entity `Course` (toàn bộ trường từ §3.7)

- `program_id`, `level_id`
- `code`, `name`
- `track`: enum `KIDS | TEENS | ADULTS | EXAM_PREP`
- `age_min`, `age_max`
- `total_sessions` (mặc định 16; Communication = 8)
- `session_duration_minutes` (mặc định 90)
- `delivery_mode`: enum `OFFLINE | ONLINE_1_1 | ONLINE_GROUP`
- `tuition_base` (DECIMAL)
- `tuition_unit`: enum `PER_COURSE | PER_SESSION` (Online 1:1 thường PER_SESSION — §8.6)
- `is_active`

### Bulk seed

Tất cả khoá từ §3.3 → §3.6: Baby Dolphin, Young Dolphin, Pre Starters, Starters, Movers, Flyers, KET 1–7, PET 1–8, Pre IELTS 1–5, Skill courses (W/R/L/S × band), Communication 1–4.

---

## 1.5. Module `syllabus` & `lesson`

### Entity `Syllabus` (1-1 với Course)

- `course_id`, `overview`
- `learning_outcomes` (JSON array — phục vụ "cam kết đầu ra" §1.1)

### Entity `Lesson`

- `syllabus_id`, `session_no` (1..N)
- `title`, `objectives`, `materials_url`
- `homework_template` (chuẩn bị cho Phase 2/4 `homework`)

### Endpoint

- Clone syllabus giữa các khoá tương tự.

---

## Deliverable

- Catalog hoàn chỉnh để Sales tư vấn & xếp lớp.
- API list/search course theo program, level, age range, delivery mode.
- Seed migration đầy đủ (Campus + Program + Level + Course).
- Enrollment skeleton sẵn sàng để P5 (Sales) ghi nhận deal ngay.
