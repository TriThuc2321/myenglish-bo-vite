# Phase 7 — HR mở rộng (Vòng giáo viên)

> Tính lương, quản lý hợp đồng giáo viên.

---

## 7.1. ~~Module `teacher-availability`~~ _(đã chuyển sang Phase 3.8)_

> Đã đẩy lên P3 vì `slot-booking` phụ thuộc. Phase 7 chỉ còn contract / timesheet / payroll.

---

## 7.2. Module `contract`

### Entity `TeacherContract`

- `teacher_id`
- `start_date`, `end_date`
- `hourly_rate`, `monthly_base` (nullable)
- `allowance` (JSON), `status`

---

## 7.3. Module `timesheet`

### Entity `Timesheet`

- `teacher_id`, `class_session_id`
- `actual_start`, `actual_end`
- `verified_by`, `verified_at`

### Logic

- Auto-generate từ session có `status = DONE` + `teacher_id`.

---

## 7.4. Module `payroll`

### Entity `PayrollPeriod`

- `month`
- `status`: `DRAFT | LOCKED | PAID`

### Entity `PayrollLine`

- `period_id`, `teacher_id`
- `total_hours`, `gross`
- `allowance_total` (phụ cấp: ăn ca, xăng xe, KPI bonus...)
- `pit_tax` (thuế TNCN — cần input thực tế: bậc thang lũy tiến hay khoán?)
- `insurance_deduction` (BHXH/BHYT/BHTN nếu đóng)
- `other_deduction`
- `net`

### Engine

- Tính lương từ contract + timesheet đã verify + allowance/deduction policy.
- _Open Q_: chính sách thuế TNCN cho GV part-time (khấu trừ 10% hay theo bậc thang).

---

## Deliverable

- Cuối tháng 1 click ra bảng lương.
- Online 1:1 booking đầy đủ flow.
