# Phase 7 — Communication & Analytics

> Trải nghiệm người dùng và ra quyết định.

---

## 7.1. Module `notification`

### Entity `Notification`

- `user_id`
- `channel`: `IN_APP | EMAIL | SMS | PUSH`
- `type`, `payload`
- `status`, `read_at`
- `retry_count`, `last_error`

### Entity `NotificationPreference` (opt-in/opt-out)

- `user_id`, `notification_type`, `channel`, `enabled`
- Mặc định: transactional (invoice/schedule/report) bật; marketing tắt — tuân thủ Luật Quảng cáo VN.

### Worker queue

- Đẩy notif theo trigger: enroll, payment, report card, schedule change.
- Rate limit per user/channel để tránh spam.
- Retry policy: exponential backoff, max 3 lần.

---

## 7.2. Module `email-template`

### Entity `EmailTemplate`

- `code`, `subject`, `body` (handlebars), `locale`

### Seed

- welcome, invoice, report-card, schedule-change.

---

## 7.3. Module `parent-portal`

- View-only access link gửi qua email/SMS dùng `parent_email` / `parent_phone` trên `Student`.
- Token-based magic link (không cần guardian account riêng) — scope theo student_id.

### Endpoint

- Child overview, attendance, report card, invoice, payment status.

---

## 7.4. Module `feedback`

### Entity `Feedback`

- `target_type`: `TEACHER | CLASS | CENTER`
- `target_id`, `student_id`
- `rating`, `comment`, `nps`

---

## 7.5. Module `dashboard` & `report`

### KPI

- Số học viên active
- Doanh thu kỳ
- Chuyên cần TB
- NPS
- Conversion funnel

### Report định kỳ

- Cron → email cho CEO / Quản lý.

---

## 7.6. Module `audit-log` _(subscriber đã bật từ P3 — phase này hoàn thiện UI + API)_

### Entity `AuditLog` (bảng đã tạo từ P3)

- `user_id`, `action`
- `subject_type`, `subject_id`
- `before`, `after` (JSON diff)
- `ip`, `ua`, `at`

### Mở rộng ở P7

- API tra cứu + filter audit log
- UI cho admin xem lịch sử thay đổi entity
- Subscriber bổ sung: `contract`, `payroll`, `voucher_redemption`, `commitment_evaluation`

---

## Deliverable

- Trải nghiệm phụ huynh / học viên đầy đủ.
- Ban giám đốc có dashboard ra quyết định.
