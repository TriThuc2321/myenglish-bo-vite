# Phase 2 — IELTS Test Flow (Thi thử & Phân loại đầu vào)

> **Mục tiêu**: Khai thác ngân hàng đề đã có (`passage`, `paragraph`, `question-group`, `test`, `test-section`, `test-attempt`, `student-answer`) để thực hiện được bài thi IELTS hoàn chỉnh — từ phân công đề, làm bài, chấm điểm tự động, đến trả kết quả và đề xuất level.
>
> **Pre-condition**: `student` và `level` từ P1 phải có trước khi chạy placement flow.

---

## Modules hiện có (đã build — không xây lại)

| Module                                          | Mô tả                            |
| ----------------------------------------------- | -------------------------------- |
| `passage`, `paragraph`                          | Ngữ liệu Reading / Listening     |
| `question-group`, `question`, `question-answer` | Câu hỏi theo nhóm, đáp án        |
| `test`, `test-section`                          | Cấu trúc đề thi (Full / Section) |
| `test-attempt`, `student-answer`                | Bản ghi làm bài của học viên     |

---

## 2.1. Mở rộng `test-attempt` — purpose & student link

### Thêm vào entity `TestAttempt`

- `student_id` FK → `students` (bắt buộc từ P2 — liên kết attempt với học viên thật)
- `purpose`: enum `PLACEMENT | PRACTICE | MIDTERM | FINAL | PROGRESS`
  - `PLACEMENT` — placement test trước khi enroll (enrollment_id = null)
  - `PRACTICE` — học viên luyện tập tự do
  - `MIDTERM | FINAL | PROGRESS` — thi trong khóa (gắn enrollment từ P5)
- `started_at`, `submitted_at` (đã có hoặc thêm để enforce time-limit)

> `purpose` thay thế `is_placement_test` boolean; tránh trùng khái niệm với `PlacementResult` ở P6.

---

## 2.2. Auto-scoring engine

### Logic

Chạy sau khi học viên submit (`submitted_at` được set):

1. Với mỗi `student_answer` của attempt → so khớp `question_answer.is_correct`.
2. Tính `raw_score` (số câu đúng) cho từng `test_section`.
3. Map `raw_score` → `band_score` theo bảng IELTS (Listening: 0–40, Reading: 0–40).
4. Ghi kết quả vào `TestResult` (2.4).

### Câu hỏi hỗ trợ auto-score

| Dạng                     | Cách chấm                                    |
| ------------------------ | -------------------------------------------- |
| Multiple Choice          | So khớp `answer_id`                          |
| True / False / Not Given | So khớp string                               |
| Fill-in-the-blank        | Normalize + so khớp (case-insensitive, trim) |

### Câu hỏi cần manual grading (stub)

- `Writing` — lưu `student_answer.content` (ESSAY). Điểm chờ examiner nhập thủ công.
- `Speaking` — lưu `student_answer.audio_url`. Điểm chờ examiner nhập thủ công.
- P5 (Bridge Assessment) sẽ bổ sung `grading-rubric` + cross-check policy.

---

## 2.3. Time-limit enforcement

- Mỗi `TestSection` có `duration_minutes`.
- Khi submit: server validate `submitted_at − started_at ≤ section.duration_minutes + grace (30s)`.
- Quá giờ: server tự động submit với đáp án đã có, đánh dấu `auto_submitted = true`.

---

## 2.4. Module `test-result`

### Entity `TestResult`

- `test_attempt_id` (unique — 1 result per attempt)
- Điểm từng kỹ năng: `listening_score`, `reading_score`, `writing_score`, `speaking_score` (nullable cho manual grading)
- `overall_band` (DECIMAL — tính trung bình 4 kỹ năng, làm tròn theo thang IELTS 0.5)
- `status`: `PARTIAL | COMPLETE` (PARTIAL khi Writing/Speaking chưa có điểm)
- `finalized_at` (set khi tất cả skill đã có điểm)
- Snapshot `test_id` + phiên bản đề tại thời điểm thi (tránh thay đổi ngân hàng đề ảnh hưởng kết quả cũ)

### API

- `GET /test-attempts/:id/result` — trả kết quả kèm breakdown theo section
- `PATCH /test-results/:id/manual-score` — examiner nhập điểm Writing/Speaking

---

## 2.5. Placement flow

### Luồng

```
Admin chọn student_id + test_id (purpose=PLACEMENT)
       ↓
POST /test-attempts → tạo TestAttempt (purpose=PLACEMENT, student_id)
       ↓
Học viên làm bài → Submit
       ↓
Auto-scoring engine chạy → sinh TestResult
       ↓
GET /test-results/:id → trả overall_band + suggested_level_id
       ↓
Admin xác nhận → ghi student.entry_level_code (P1.1)
```

### Suggested level logic

- Lookup bảng `Level` theo `program_id` + `band_score` range.
- Trả `suggested_level_id` và `recommended_course_ids` (JSON) trong response.
- Chưa tạo `PlacementResult` entity ở P2 — đó là CRM wrapper, nằm ở P6.

---

## 2.6. Review mode

- Sau khi `TestResult.status = COMPLETE` (tất cả skill có điểm):
  - `GET /test-attempts/:id/review` — trả toàn bộ câu hỏi, đáp án học viên, đáp án đúng, giải thích.
  - Không cho sửa — read-only.
- Flag `test.is_review_enabled` trên entity `Test` để tắt review cho đề thi chính thức nếu cần.

---

## CASL subjects mới

`test_result`

---

## Deliverable

- Học viên làm được bài IELTS đầy đủ 4 kỹ năng.
- Hệ thống tự chấm Listening / Reading; ghi nhận Writing / Speaking stub cho examiner.
- `TestResult` với overall band + suggested level sẵn sàng trả về.
- Đủ dữ liệu để xếp lớp ở P3 (Operations).
