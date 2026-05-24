# MYENGLISH — Business Data Sheet

> Tài liệu mô tả nghiệp vụ thực tế của trung tâm MYENGLISH.
> Dùng làm **input duy nhất** cho việc thiết kế domain model và roadmap CRM/LMS.
> Mọi entity / module / flow trong `ROADMAP.md` phải truy nguyên về file này.

---

## 1. Hồ sơ trung tâm

| Trường          | Giá trị                                                                 |
| --------------- | ----------------------------------------------------------------------- |
| Tên thương hiệu | MYENGLISH                                                               |
| Slogan          | Better English, Better Life!                                            |
| CEO & Founder   | Nguyễn Thị Anh Đào                                                      |
| Lĩnh vực        | Đào tạo Anh ngữ (thiếu nhi, thiếu niên, người lớn, luyện thi chứng chỉ) |
| Tầm nhìn        | Xây dựng cộng đồng học tập năng động, đào tạo công dân toàn cầu         |
| Sứ mệnh         | "Tiếng Anh tốt hơn để cuộc sống tốt đẹp hơn"                            |

### 1.1. Giá trị cốt lõi (USP) — _ràng buộc tới sản phẩm CRM_

| USP                      | Hệ quả tới hệ thống                                                           |
| ------------------------ | ----------------------------------------------------------------------------- |
| Cá nhân hoá lộ trình học | Cần `placement-test` → đề xuất `level`; `student.entry_level` lưu được        |
| Cam kết đầu ra           | Cần `learning-outcome` / `target-band` gắn vào `enrollment`; tracking tiến độ |
| Đội ngũ GV chất lượng    | Cần `teacher-certificate`, `teacher-skill`, `feedback` (đã có một phần)       |
| Ứng dụng công nghệ       | Hệ thống phải lo cả phần học online 1:1 (xem §4)                              |

---

## 2. Phân khúc khách hàng (Customer Segments)

| Segment      | Độ tuổi | Người ra quyết định  | Người chi trả        | Kênh tiếp cận chính                |
| ------------ | ------- | -------------------- | -------------------- | ---------------------------------- |
| Thiếu nhi    | 5–11    | Phụ huynh            | Phụ huynh            | Marketing tới phụ huynh            |
| Thiếu niên   | 12–17   | Phụ huynh + học viên | Phụ huynh            | Marketing tới phụ huynh + học viên |
| Sinh viên    | 18–22   | Học viên             | Học viên / Phụ huynh | Direct                             |
| Người đi làm | 23+     | Học viên             | Học viên             | Direct                             |

**Hệ quả thiết kế:**

- Entity `student` PHẢI tách khỏi `user`; có quan hệ N–N với `guardian` (phụ huynh) cho segment < 18 tuổi.
- `guardian` cần được mời vào `parent-portal` (Phase 7) để xem điểm danh, kết quả, học phí.
- `lead` (Phase 5) cần trường `lead_for_student_age` để định tuyến sales đúng đội tư vấn.

---

## 3. Catalog chương trình đào tạo

### 3.1. Cấu trúc phân cấp (cần model hoá)

```
Program (chương trình chủ lực)
  └── Track (nhánh con: Kids / Teens / Adults / Exam-prep)
        └── Level (cấp độ)
              └── Course (khoá học cụ thể, có thời lượng + học phí)
                    └── Class (lớp mở thực tế, có lịch + GV + phòng)
```

### 3.2. Ba chương trình chủ lực (Program)

1. **Cambridge** — Starters, Movers, Flyers, KET, PET
2. **IELTS** — Pre IELTS → IELTS 4.0–5.5 → IELTS 6.0–6.5+
3. **Giao tiếp** — Communication cho sinh viên / người đi làm

### 3.3. Tiếng Anh thiếu nhi (5–11 tuổi)

| Level      | Độ tuổi | Khoá học                           | Thời lượng           |
| ---------- | ------- | ---------------------------------- | -------------------- |
| Pre-school | 5–6     | Baby Dolphin 1, 2                  | 8 tuần · 2 buổi/tuần |
| Starters   | 6–8     | Young Dolphin 1, 2 · Pre JD 1A, 1B | 8 tuần · 2 buổi/tuần |
| Starters   | 6–8     | Junior Dolphin 2A, 2B              | 8 tuần · 2 buổi/tuần |
| Starters   | 6–8     | Pre Starters 1–3 · Starters 1–5    | 8 tuần · 2 buổi/tuần |
| Movers     | 8–10    | Pre Movers 1, 2 · Movers 1–5       | 8 tuần · 2 buổi/tuần |
| Flyers     | 11–12   | Pre Flyers 1, 2 · Flyers 1–6       | 8 tuần · 2 buổi/tuần |

### 3.4. Luyện thi Cambridge (12+)

| Level | Độ tuổi | Khoá học | Thời lượng           |
| ----- | ------- | -------- | -------------------- |
| KET   | 12–15   | KET 1–7  | 8 tuần · 2 buổi/tuần |
| PET   | 15+     | PET 1–8  | 8 tuần · 2 buổi/tuần |

### 3.5. Luyện thi IELTS

| Band mục tiêu | Khoá học                              | Thời lượng           |
| ------------- | ------------------------------------- | -------------------- |
| Pre IELTS     | Pre IELTS 1–5                         | 8 tuần · 2 buổi/tuần |
| 4.0 – 5.5     | Write/Read/Listen 1A–1D + Speak 1A–1D | 8 tuần · 2 buổi/tuần |
| 6.0 – 6.5     | Write/Read/Listen 2A–2D + Speak 2A–2D | 8 tuần · 2 buổi/tuần |

> Lưu ý: ở band IELTS, mỗi **kỹ năng** (Read / Write / Listen / Speak) là **một course riêng** → một học viên có thể enroll song song nhiều course cùng band → `enrollment` là N–N giữa student và course.

### 3.6. Tiếng Anh giao tiếp (người lớn)

| Đối tượng                | Khoá học                 | Thời lượng         |
| ------------------------ | ------------------------ | ------------------ |
| Sinh viên / người đi làm | Communication 1, 2, 3, 4 | 8 buổi · 1h30/buổi |

### 3.7. Khung tham số chung (cần lưu trên entity `course`)

| Trường                     | Ghi chú                                             |
| -------------------------- | --------------------------------------------------- |
| `program_id`               | Cambridge / IELTS / Communication / Grammar         |
| `track`                    | Kids / Teens / Adults / Exam-prep                   |
| `level_code`               | Starters / Movers / Flyers / KET / PET / IELTS-band |
| `age_min`, `age_max`       | Giới hạn tuổi đầu vào                               |
| `total_sessions`           | 16 (8 tuần × 2 buổi) hoặc 8 (Communication)         |
| `session_duration_minutes` | 90 cho Communication; còn lại theo policy           |
| `delivery_mode`            | `offline` / `online-1-1` / `online-group`           |
| `tuition_base`             | Học phí gốc                                         |

---

## 4. Hình thức đào tạo (Delivery modes)

| Mode                  | Đặc điểm                                     | Hệ quả hệ thống                                                                        |
| --------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------- |
| Offline tại trung tâm | Lớp nhóm, có phòng học                       | Cần `room`, `schedule` chống trùng phòng                                               |
| Online 1:1            | Lịch linh hoạt theo học viên, 1 thầy – 1 trò | `class.capacity = 1`; `schedule` chống trùng GV nhưng KHÔNG cần room; cần link meeting |
| Online nhóm (suy ra)  | Có thể có trong tương lai                    | Giữ `delivery_mode` đủ tổng quát                                                       |

**Yêu cầu đặc thù cho Online 1:1:**

- `teacher-availability` (Phase 6) phải có **trước** khi mở slot 1:1.
- Học viên tự chọn slot → cần flow `slot-booking` (chưa có trong roadmap, cần thêm vào Phase 2 hoặc Phase 6).
- `tuition` của 1:1 tính theo **buổi**, không theo khoá → bảng giá cần hỗ trợ cả 2 mô hình (per-course / per-session).

---

## 5. Chương trình phụ — Ngữ pháp

| Đặc điểm                  | Ghi chú                                      |
| ------------------------- | -------------------------------------------- |
| Bám chương trình Bộ GD&ĐT | Có thể nhóm theo lớp 6/7/8/9/10/11/12        |
| Hoạt động                 | Phân tích đề, luyện bài tập, bổ sung từ vựng |
| Giao bài                  | Bài tập về nhà mỗi buổi, kiểm tra buổi sau   |
| Lịch học                  | Linh hoạt theo yêu cầu                       |

**Hệ quả:** cần `homework` / `assignment` entity (chưa có trong roadmap) → thêm vào Phase 2 hoặc Phase 4.

---

## 6. Vòng đời học viên (Customer Lifecycle)

```
Lead  →  Consultation  →  Placement Test  →  Enrollment  →  Active Learning
  │            │                │                │                 │
  │            │                │                │                 ├─→ Attendance per session
  │            │                │                │                 ├─→ Homework / Assignment
  │            │                │                │                 ├─→ Mid-term + Final test
  │            │                │                │                 └─→ Report card → Parent
  │            │                │                │
  │            │                │                └─→ Invoice → Payment → (Discount / Refund)
  │            │                │
  │            │                └─→ Output: đề xuất Level → Course phù hợp
  │            │
  │            └─→ Ghi chú tư vấn, nhu cầu, ngân sách
  │
  └─→ Nguồn marketing, lead score, sales owner
```

→ Mapping vào Roadmap:

- Lead → Consultation → Placement: **Phase 5 (CRM & Admission)**
- Enrollment → Attendance → Homework: **Phase 2 (Operations)** + bổ sung `homework`
- Test → Report card: **Phase 4 (Bridge Assessment)**
- Invoice → Payment → Refund: **Phase 3 (Finance)**

---

## 7. Vai trò người dùng hệ thống (Personas)

| Persona                          | Hành động chính                                     | Module liên quan                             |
| -------------------------------- | --------------------------------------------------- | -------------------------------------------- |
| Học viên (Student)               | Xem lịch, làm bài test, xem điểm, nộp homework      | profile, test, attendance, report-card       |
| Phụ huynh (Guardian)             | Theo dõi con, xem học phí, nhận thông báo           | parent-portal, notification, invoice         |
| Giáo viên (Teacher)              | Dạy lớp, chấm bài, điểm danh, chấm Speaking/Writing | class, attendance, grading-rubric, timesheet |
| Tư vấn viên (Sales / Consultant) | Quản lý lead, đặt lịch tư vấn, đăng ký test đầu vào | lead, consultation, placement-test           |
| Học vụ (Academic Admin)          | Mở lớp, xếp lịch, xếp phòng, chuyển lớp             | class, schedule, room, enrollment            |
| Kế toán (Finance)                | Phát hành hoá đơn, ghi nhận thanh toán, hoàn tiền   | invoice, payment, refund                     |
| Nhân sự (HR)                     | Hợp đồng GV, chấm công, tính lương                  | contract, timesheet, payroll                 |
| Quản lý / CEO                    | Dashboard KPI, báo cáo doanh thu, chuyên cần        | dashboard, report, audit-log                 |

---

## 8. Quy tắc & ràng buộc nghiệp vụ (Business Rules)

1. **Một học viên** có thể enroll **nhiều khoá đồng thời** (đặc biệt IELTS chia 4 kỹ năng).
2. **Một lớp (class)** chỉ thuộc đúng **một course**; có 1 GV chính, có thể có GV phụ/thay thế.
3. **Online 1:1**: lớp có capacity = 1, không bắt buộc room, bắt buộc có link học online.
4. **Học bù (make-up)**: học viên vắng có thể được xếp vào buổi khác cùng course/level → cần liên kết `attendance` ↔ `make-up-class`.
5. **Placement Test** không nằm trong `enrollment` — là một **test miễn phí trước bán hàng** → tách flow khỏi `test-attempt` thông thường, hoặc có flag.
6. **Học phí**: có thể theo **khoá** (mặc định) hoặc theo **buổi** (1:1) → bảng giá cần linh hoạt.
7. **Cam kết đầu ra**: nếu học viên không đạt target band/level → có thể được học lại miễn phí → cần policy `retake` gắn vào `enrollment`.
8. **Phụ huynh < 18 tuổi** là bắt buộc — học viên nhỏ tuổi không tự đăng nhập được, hoặc dùng tài khoản phụ huynh.

---

## 9. Khoảng trống dữ liệu chưa đủ thông tin (Open Questions)

> Những điểm cần đội nghiệp vụ MYENGLISH cung cấp thêm để hoàn thiện model:

- [ ] Bảng học phí cụ thể từng course (chưa có số liệu).
- [ ] Chính sách giảm giá / học bổng / voucher (có những loại nào, điều kiện gì).
- [ ] Sĩ số tối đa mỗi class theo từng level.
- [ ] Tỉ lệ GV / học viên theo level.
- [ ] Cơ sở vật chất hiện có (bao nhiêu cơ sở, bao nhiêu phòng/cơ sở).
- [ ] Quy trình hoàn tiền chi tiết (% theo thời điểm nghỉ).
- [ ] Chính sách cam kết đầu ra chi tiết (retake free / refund / partial).
- [ ] Hệ thống chấm công GV hiện tại (giấy / excel / phần mềm khác).
- [ ] Kênh marketing chính (Facebook / Zalo / Google / referral).
- [ ] Kênh thanh toán đang dùng (bank / VNPay / Momo / tiền mặt).

---

## 10. Truy xuất chéo (Cross-reference với ROADMAP.md)

| Section file này        | Phase trong ROADMAP                                             |
| ----------------------- | --------------------------------------------------------------- |
| §2 Segment, §7 Personas | Phase 1 (`student`), Phase 5 (`lead`)                           |
| §3 Catalog              | Phase 1 (`program`, `level`, `course`, `syllabus`)              |
| §4 Delivery mode        | Phase 2 (`class`, `schedule`), Phase 6 (`teacher-availability`) |
| §5 Ngữ pháp / Homework  | Bổ sung vào Phase 2 hoặc Phase 4 (chưa có trong roadmap)        |
| §6 Lifecycle            | Phase 2 → Phase 5                                               |
| §8 Business rules       | Ràng buộc validation xuyên suốt mọi phase                       |
| §9 Open questions       | Phải đóng trước khi vào Phase 3 (Finance) và Phase 6 (HR+)      |
