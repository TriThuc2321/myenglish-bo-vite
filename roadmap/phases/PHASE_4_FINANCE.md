# Phase 4 — Finance (Dòng tiền)

> **Pre-condition**: đóng open questions về học phí, chính sách giảm giá, hoàn tiền, kênh thanh toán (§9 DATA_CENTER).

---

## 4.1. Module `tuition`

### Entity `TuitionPlan` (hỗ trợ 2 mô hình — §8.6)

- `course_id`
- `unit`: `PER_COURSE | PER_SESSION`
- `amount`, `currency` (mặc định VND)
- `effective_from`, `effective_to` (versioning theo kỳ)

---

## 4.2. Module `invoice`

### Entity `Invoice`

- `code` (auto)
- `student_id`, `payer_name`, `payer_phone` (người trả thực tế — snapshot tại thời điểm phát hành)
- `campus_id` FK Campus (để báo cáo doanh thu theo cơ sở)
- `issued_at`, `due_at`
- `subtotal`, `discount_total`, `tax_total`, `total`, `paid_amount`, `balance`
- `status`: `DRAFT | ISSUED | PARTIALLY_PAID | PAID | CANCELLED | REFUNDED`

> **Quan hệ Invoice ↔ Enrollment là N-N qua `InvoiceLine.enrollment_id`** — bỏ field `Invoice.enrollment_id` trực tiếp. Lý do: 1 HV IELTS thường enroll 4 skill courses, gộp 1 invoice; đồng thời 1 enrollment có thể chia nhiều invoice (đóng đợt).

### Entity `InvoiceLine`

- `invoice_id`
- `enrollment_id` (nullable — null khi line là voucher/phí khác)
- `line_type`: `TUITION | SESSION | MATERIAL | FEE | VOUCHER`
- `description`, `qty`, `unit_price`, `amount`

### Revenue recognition

- `Invoice.total` ghi nhận **cash basis** khi `Payment` về.
- Song song, sinh `RevenueAllocation` (entity phụ) phân bổ doanh thu theo số buổi đã dạy — phục vụ accrual/báo cáo quản trị.
- _Open Q_: CEO/Tài chính chọn cash hay accrual làm chuẩn báo cáo chính.

---

## 4.3. Module `payment`

### Entity `Payment`

- `invoice_id`, `amount`
- `method`: `CASH | BANK_TRANSFER | VNPAY | MOMO | OTHER`
- `paid_at`, `reference_code`, `note`, `recorded_by`

### Hook

- Mỗi payment mới → cập nhật `invoice.paid_amount` + status.

---

## 4.4. Module `discount` / `voucher`

### Entity `Voucher`

- `code`
- `type`: `PERCENT | AMOUNT | SCHOLARSHIP`
- `value`, `usage_limit`, `valid_from/to`
- `conditions` (JSON)

### Entity `VoucherRedemption`

- `voucher_id`, `invoice_id`, `applied_amount`

---

## 4.5. Module `refund`

### Entity `Refund`

- `invoice_id`, `enrollment_id`
- `reason`, `amount`, `method`
- `processed_at`, `processed_by`
- `policy_applied` (link tới chính sách hoàn tiền — cần input nghiệp vụ)

> Refund có thể được trigger bởi `commitment-evaluation` engine ở P5.

---

## 4.6. Báo cáo cơ bản

- Doanh thu theo period / course / **campus_id** (đã có FK Campus từ P1).
- Công nợ học viên (balance > 0).
- Phân bổ doanh thu accrual (nếu chọn — §4.2).

---

## 4.7. Audit log bật từ phase này

- Subscriber TypeORM cho `Invoice`, `Payment`, `Refund`, `VoucherRedemption`, `Enrollment` ghi `before/after` vào bảng `audit_log` (entity chính thức ra ở P8.6, nhưng bảng + subscriber tạo từ P4).

---

## Deliverable

- Hoá đơn → thu tiền → đối soát → hoàn tiền minh bạch.
- Báo cáo doanh thu theo nhiều chiều.
