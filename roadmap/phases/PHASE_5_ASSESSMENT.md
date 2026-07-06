# Phase 5 — Bridge Assessment (Gắn ngân hàng đề vào lớp)

> Tận dụng module `test` đã có và engine thi IELTS từ P2, **không xây lại** — chỉ thêm bridge entity để gắn vào lớp học thật (P3) và hoàn thiện grading rubric cho Speaking/Writing.

---

## 5.1. Liên kết `test-attempt` ↔ `enrollment`

- Thêm cột `enrollment_id` (nullable) và `class_session_id` (nullable) vào `test_attempt`.
- Migration backfill: attempt cũ (từ P2) giữ null.
- `purpose` enum đã có từ P2: `PLACEMENT | PRACTICE | MIDTERM | FINAL | PROGRESS`.
  - Khi `purpose = PLACEMENT` → `enrollment_id` luôn null; output ghi nhận ở `PlacementResult` (P6.3).
  - Khi `purpose ∈ {MIDTERM, FINAL, PROGRESS}` → bắt buộc `enrollment_id`.

---

## 5.2. Module `exam-session`

### Entity `ExamSession`

- `class_id`
- `type`: `MIDTERM | FINAL | PROGRESS`
- `test_id`, `scheduled_at`, `duration_minutes`
- `proctor_teacher_id`

### Logic

- Mỗi học viên trong class → tự sinh 1 `test_attempt` khi đến giờ.

---

## 5.3. Module `grading-rubric`

> Bổ sung cho Writing/Speaking stub từ P2 — P2 lưu nội dung; P5 thêm rubric để chấm theo tiêu chí chuẩn IELTS.

### Entity `Rubric`

- `name`
- `skill`: `SPEAKING | WRITING | LISTENING | READING | OTHER`
- `band_min`, `band_max`

### Entity `RubricCriterion`

- `rubric_id`
- `name` (Task Response / Coherence / Lexical / Grammar / Pronunciation)
- `max_score`, `weight`

### Entity `RubricScore`

- `test_attempt_id`, `criterion_id`
- `score`, `examiner_id`, `note`
- `examiner_role`: `PRIMARY | CROSS_CHECK` — cho phép 2 examiner cùng chấm 1 attempt
- Unique (test_attempt_id, criterion_id, examiner_id)

### Cross-check policy

- Speaking/Writing IELTS từ band 6.0+ → bắt buộc 2 examiner; điểm cuối = trung bình hoặc chênh > 1 band thì kích arbitration (examiner thứ 3).
- _Open Q_: Học vụ chốt threshold cụ thể.

> Dùng cho Speaking/Writing IELTS, KET/PET Speaking.

---

## 5.4. Module `report-card`

### Entity `ReportCard`

- `enrollment_id`
- `period`: `MIDTERM | FINAL`
- Aggregate: `attendance_rate`, `homework_rate`, `mid_score`, `final_score`, `overall_band/level`
- `teacher_comment`, `released_at`, `released_by`

### Endpoint

- PDF export.
- Trigger email/notification cho parent (thật sự gửi ở Phase 8).

---

## 5.5. Commitment evaluation engine _(phục vụ USP "cam kết đầu ra")_

### Logic

- Mỗi `Enrollment.target_outcome` chạy đối chiếu với `ReportCard` cuối khóa.
- Output: `met | not_met | partially_met`.
- Trigger `RetakePolicy` (link `commitment_policy_code` từ P1.2) — auto tạo enrollment retake hoặc đề xuất refund (P4.5).

### Entity `CommitmentEvaluation`

- `enrollment_id`, `report_card_id`
- `result`, `decided_action`: `RETAKE_FREE | PARTIAL_REFUND | NONE`
- `decided_by`, `decided_at`

---

## Deliverable

- Học viên thi xong có điểm theo rubric chuẩn IELTS/Cambridge.
- Phụ huynh nhận report card (gửi tay phase này, auto Phase 8).
- Hệ thống tự đánh giá cam kết đầu ra + trigger retake / refund.
