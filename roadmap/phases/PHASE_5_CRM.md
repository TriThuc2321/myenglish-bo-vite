# Phase 5 — CRM & Admission (Đầu phễu)

> Quản lý từ lúc khách quan tâm đến lúc đóng tiền.

---

## 5.1. Module `lead`

### Entity `Lead`

- `full_name`, `phone`, `email`
- `source`: `FACEBOOK | ZALO | GOOGLE | REFERRAL | WALK_IN | OTHER` (cần input thực tế)
- `lead_for_student_age` (§2 DATA_CENTER — định tuyến đội sales)
- `interested_program_id`, `interested_level_code`
- `owner_user_id` (sales)
- `status`: `NEW | CONTACTED | QUALIFIED | CONSULTING | PLACEMENT | WON | LOST`
- `score`, `lost_reason`

---

## 5.2. Module `consultation`

### Entity `Consultation`

- `lead_id`, `scheduled_at`
- `mode`: `ONLINE | OFFLINE`
- `consultant_id`, `notes`, `budget`, `need`

---

## 5.3. Module `placement-test`

- Reuse `test` module với `test_attempt.purpose = PLACEMENT` (§4.1 — không dùng boolean `is_placement_test` nữa).

### Entity `PlacementResult`

- `test_attempt_id` (unique — 1 result / attempt)
- `lead_id` (nullable — placement có thể chạy cho lead hoặc student đã có)
- `student_id` (nullable — set khi convert lead → student)
- `recommended_level_id`
- `recommended_course_ids` (JSON)
- `examiner_note`

### Endpoint

- Convert PlacementResult → tạo Enrollment với `status = PENDING` (skeleton từ P1.2).

---

## 5.4. Conversion funnel

### Analytics endpoint

- Count theo từng stage status
- Conversion rate giữa các stage
- Lead by source

---

## Deliverable

- Đo được tỉ lệ chuyển đổi marketing → enroll.
- Sales pipeline rõ owner & next-action.
