# Phase 6 — CRM & Admission (Đầu phễu)

> Quản lý từ lúc khách quan tâm đến lúc đóng tiền.

---

## 6.1. Module `lead`

### Entity `Lead`

- `full_name`, `phone`, `email`
- `source`: `FACEBOOK | ZALO | GOOGLE | REFERRAL | WALK_IN | OTHER` (cần input thực tế)
- `lead_for_student_age` (§2 DATA_CENTER — định tuyến đội sales)
- `interested_program_id`, `interested_level_code`
- `owner_user_id` (sales)
- `status`: `NEW | CONTACTED | QUALIFIED | CONSULTING | PLACEMENT | WON | LOST`
- `score`, `lost_reason`

---

## 6.2. Module `consultation`

### Entity `Consultation`

- `lead_id`, `scheduled_at`
- `mode`: `ONLINE | OFFLINE`
- `consultant_id`, `notes`, `budget`, `need`

---

## 6.3. Module `placement-test` _(CRM wrapper — dùng lại engine P2)_

> Engine auto-scoring và `TestResult` đã có ở P2. P6 chỉ thêm CRM context: lưu lịch sử tư vấn, liên kết lead, snapshot level đề xuất.

- Reuse `test` module với `test_attempt.purpose = PLACEMENT`.

### Entity `PlacementResult`

- `test_attempt_id` (unique — 1 result / attempt; `TestResult` đã tính band ở P2)
- `lead_id` (nullable — placement có thể chạy cho lead hoặc student đã có)
- `student_id` (nullable — set khi convert lead → student)
- `recommended_level_id`
- `recommended_course_ids` (JSON)
- `examiner_note`

### Endpoint

- Convert PlacementResult → tạo Enrollment với `status = PENDING` (skeleton từ P1.2).

---

## 6.4. Conversion funnel

### Analytics endpoint

- Count theo từng stage status
- Conversion rate giữa các stage
- Lead by source

---

## Deliverable

- Đo được tỉ lệ chuyển đổi marketing → enroll.
- Sales pipeline rõ owner & next-action.
