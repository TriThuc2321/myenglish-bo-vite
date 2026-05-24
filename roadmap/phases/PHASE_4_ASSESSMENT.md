# Phase 4 — Bridge Assessment (Gắn ngân hàng đề vào lớp)

> Tận dụng module `test` đã có, **không xây lại** — chỉ thêm bridge entity.

---

## 4.1. Liên kết `test-attempt` ↔ `enrollment`

- Thêm cột `enrollment_id` (nullable) và `class_session_id` (nullable) vào `test_attempt`.
- Migration backfill: attempt cũ giữ null.
- Thêm cột `purpose`: enum `PLACEMENT | PROGRESS | MIDTERM | FINAL | PRACTICE` (§8.5) — thay cho `is_placement_test` boolean để tránh trùng lặp khái niệm với `PlacementResult` ở P5.
  - Khi `purpose = PLACEMENT` → `enrollment_id` luôn null; output ghi nhận ở `PlacementResult` (P5.3).
  - Khi `purpose ∈ {MIDTERM, FINAL, PROGRESS}` → bắt buộc `enrollment_id`.

---

## 4.2. Module `exam-session`

### Entity `ExamSession`

- `class_id`
- `type`: `MIDTERM | FINAL | PROGRESS`
- `test_id`, `scheduled_at`, `duration_minutes`
- `proctor_teacher_id`

### Logic

- Mỗi học viên trong class → tự sinh 1 `test_attempt` khi đến giờ.

---

## 4.3. Module `grading-rubric`

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

## 4.5. Commitment evaluation engine _(mới — phục vụ USP "cam kết đầu ra")_

### Logic

- Mỗi `Enrollment.target_outcome` chạy đối chiếu với `ReportCard` cuối khóa.
- Output: `met | not_met | partially_met`.
- Trigger `RetakePolicy` (link `commitment_policy_code` từ P1.2) — auto tạo enrollment retake hoặc đề xuất refund (P3.5).

### Entity `CommitmentEvaluation`

- `enrollment_id`, `report_card_id`
- `result`, `decided_action`: `RETAKE_FREE | PARTIAL_REFUND | NONE`
- `decided_by`, `decided_at`

---

## 4.4. Module `report-card`

### Entity `ReportCard`

- `enrollment_id`
- `period`: `MIDTERM | FINAL`
- Aggregate: `attendance_rate`, `homework_rate`, `mid_score`, `final_score`, `overall_band/level`
- `teacher_comment`, `released_at`, `released_by`

### Endpoint

- PDF export.
- Trigger email/notification cho parent (thật sự gửi ở Phase 7).

---

## Deliverable

- Học viên thi xong có điểm theo rubric chuẩn IELTS/Cambridge.
- Phụ huynh nhận report card (gửi tay phase này, auto Phase 7).
