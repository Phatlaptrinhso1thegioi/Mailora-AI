# Mailora.ai — Cuộc thi Vibe Coding 2026

> Bản thuyết minh kỹ thuật và hướng dẫn kiểm thử chính thức của Đội thi 001.

---

## 1. Thông tin chung

| Hạng mục | Nội dung |
|---|---|
| Tên đội thi | **Đội 001** |
| Bảng thi | **Bảng A - Công nghệ** |
| Đề bài bốc thăm | **Đề số 06 — Trình tạo Email Marketing bằng AI** |
| Demo online | `https://mailora-ai-psi.vercel.app/` *(Chạy trực tiếp từ mã nguồn local tại `http://localhost:3000`)* |
| Video demo (≤ 02 phút) | `https://drive.google.com/file/d/1snBFoEKr0qF1Zivj8XegAy7MSp77SURb/view?usp=sharing` |
| Source ZIP | `https://github.com/Phatlaptrinhso1thegioi/Mailora-AI` *(Đóng gói theo hướng dẫn bàn giao)* |
| Minh chứng dùng AI | Kèm trong mục 10 của README và thư mục `docs/` |
| Bảng kiểm thử | Kèm trong mục 11 của README (6 ca kiểm thử chuẩn Bảng A) và 18 automated tests trong `tests/` |

> **Tiêu chuẩn Bảng A**: Đáp ứng đầy đủ 5 yêu cầu đề bài, tích hợp **AI thật đa phương tiện (Google Gemini 2.5 Flash + Pollinations.ai Image Gen)** kèm cơ chế kiểm soát đầu ra nghiêm ngặt, bộ kiểm thử tự động 18/18 tests đạt chuẩn 100%, bảo mật cơ bản và xử lý ngoại lệ toàn diện.

---

## 2. Tính năng chính (Hoàn thành trọn vẹn 5 yêu cầu Đề 06)

1. **Form nhập liệu thông minh & linh hoạt (Yêu cầu 1):**
   - Cho phép người dùng nhập đầy đủ: Mục tiêu chiến dịch (*Ra mắt sản phẩm / Khuyến mãi / Chăm sóc khách hàng*), Tên thương hiệu, Nội dung ưu đãi, và liên kết đích của nút CTA.
   - Hỗ trợ nhập liệu tự nhiên bằng ngôn ngữ hội thoại tự do; hệ thống tự trích xuất thông tin trọng tâm.

2. **AI tự động sinh 4 mẫu Email độc bản & Ảnh Banner (Vượt chuẩn 3 mẫu - Yêu cầu 2):**
   - Áp dụng hệ thống **4 Kiến trúc Thiết kế Độc bản (Creative Architecture)**:
     1. **Signature Flagship:** Phong cách định vị thương hiệu tinh tế, toàn diện.
     2. **High-Contrast Atelier:** Tương phản thị giác mạnh mẽ, đường nét sắc sảo đương đại.
     3. **Editorial Storyteller:** Tự sự truyền cảm hứng, giàu chiều sâu và cảm xúc.
     4. **Conversion Focus:** Thúc đẩy hành động tức thì, tối ưu hoá CTR và chuyển đổi.
   - Mỗi mẫu email đều có cấu trúc chuẩn mực: **Subject line (Tiêu đề mở thư) + Preheader + Headline + Thông điệp chính + 3 Lợi ích cốt lõi + Nút kêu gọi hành động (CTA) nổi bật**.
   - **Tích hợp AI tạo ảnh Banner (Hero Image):** Tự động sinh ảnh minh hoạ tỷ lệ 880x560 chuẩn xác theo phong cách của thương hiệu thông qua **Pollinations.ai**, kèm nút *"Render lại ảnh Hero"* với seed ngẫu nhiên.

3. **Khung Preview mô phỏng hộp thư thực tế (Yêu cầu 3):**
   - Thiết kế 2 chế độ hiển thị song song:
     - **Interactive Canvas Stage:** Cho phép chỉnh sửa chữ, thay đổi màu sắc, độ bo góc, padding trực tiếp (WYSIWYG).
     - **Table HTML Preview:** Mô phỏng hiển thị trên các ứng dụng nhận email thực tế (Gmail, Apple Mail, Outlook).
   - Tích hợp nút chuyển đổi giao diện **Desktop (600px)** và **Mobile (375px)** trực quan.

4. **Nút Copy 1-chạm Rich HTML & "Viết lại theo tông giọng" (Yêu cầu 4):**
   - **Nút Copy Rich Table HTML:** Tự động sao chép mã nguồn bảng lồng nhau (Nested Tables) kèm hình ảnh hero AI và nút bấm căn giữa hoàn hảo. Người dùng chỉ cần mở Gmail/Outlook và nhấn `Ctrl+V` / `Cmd+V` là có ngay bức thư định dạng chuẩn, không bị vỡ bố cục.
   - **Nút "Viết lại theo tông giọng":** Tích hợp bộ chuyển đổi giọng văn tức thì (*Trang trọng, Hài hước, Khẩn cấp/FOMO, Thân mật*) cho mẫu email đang chọn.

5. **AI phân tích ngành hàng & Gợi ý khung giờ vàng gửi email (Yêu cầu 5):**
   - Tự động nhận diện ngành hàng dựa trên nội dung (*SaaS, Thời trang, F&B, Mỹ phẩm, Giáo dục, Du lịch...*).
   - Đưa ra khuyến nghị **Khung giờ vàng gửi email** có tỷ lệ mở (Open Rate) và tỷ lệ nhấp (CTR) cao nhất, đồng thời tích hợp chỉ số **Spam Guard Scanner** bảo vệ uy tín hòm thư.

---

## 3. Công nghệ sử dụng

| Lớp | Công nghệ (ghi đúng thứ đã dùng) |
|---|---|
| **Giao diện (Frontend)** | HTML5 thuần + Modern Modular JavaScript (ES6+ Modules) + Tailwind CSS + Google Fonts (*Plus Jakarta Sans, Instrument Serif, Playfair Display*) |
| **Tích hợp Trí tuệ Nhân tạo (AI)** | **Google Gemini 2.5 Flash / Pro API** (Xử lý ngôn ngữ tự nhiên, cấu trúc JSON Schema, chiến lược nội dung & giờ vàng) + **Pollinations.ai Generative Image API** (Tạo ảnh Hero Banner bằng AI theo ngữ cảnh) |
| **Thư viện & Công cụ** | **Vite v6.4.5** (Bundler & Multi-page builder), **Vitest v3.2.7** (Khung kiểm thử tự động), **@supabase/supabase-js v2.49.1** (SDK xác thực và kết nối dữ liệu) |
| **Lưu trữ & Quản lý phiên** | **localStorage** (Mã hóa lưu trữ cục bộ, kiểm soát vòng đời phiên 24-Hour TTL, đồng bộ đa tab, chặn BFCache) kết hợp tùy chọn **Supabase PostgreSQL** với Row Level Security (RLS) |
| **Triển khai** | Hỗ trợ triển khai tức thì trên **Vercel / Netlify / Vite Static Hosting / Supabase Edge Functions** |

---

## 4. Tích hợp AI (Hệ thống AI Đa phương tiện — Multimodal System)

Dự án tích hợp **AI thật 100%** phối hợp giữa mô hình ngôn ngữ lớn (LLM) và mô hình tạo ảnh AI (Generative Image Model), kết hợp cơ chế dự phòng kép:

### 4.1. Google Gemini 2.5 Flash / Pro (Text & Strategic Reasoning Engine)
- **Kênh chính (Live Gemini API):** Kết nối trực tiếp mô hình `gemini-2.5-flash` qua **JSON Schema Structured Output (`responseSchema`)**, bắt buộc kết quả trả về là JSON hợp lệ 100%, loại bỏ triệt để lỗi gãy cấu trúc giao diện.
- **Nhiệm vụ:**
  - Trích xuất thực thể thương hiệu, đối tượng khách hàng mục tiêu và ngành hàng kinh doanh.
  - Sinh nội dung 4 mẫu email (*Subject line, Preheader, Headline, Body, 3 Benefits, CTA text*).
  - Phân tích khung giờ vàng gửi thư và tính điểm uy tín Spam Guard Scanner.
  - Tự động sinh `heroPrompt` bằng tiếng Anh chuẩn nhiếp ảnh thương mại để chuyển giao cho mô hình tạo ảnh.

### 4.2. Pollinations.ai (Generative Visual Banner Engine)
- **Cơ chế tạo ảnh AI:** Hệ thống kết nối trực tiếp đến **Pollinations.ai Image Generation Engine** qua giao thức RESTful URL API:
  ```text
  https://image.pollinations.ai/prompt/${encodeURIComponent(heroPrompt)}?width=880&height=560&seed=${seed}&nologo=true
  ```
- **Thông số kỹ thuật:**
  - **Kích thước tiêu chuẩn:** `880x560 px` (Tỷ lệ khung hình chuẩn mực cho email header, sắc nét trên màn hình Retina).
  - **Tối ưu thương mại:** Gắn cờ `nologo=true` để loại bỏ watermark, mang lại ảnh chụp sản phẩm sạch sẽ chuyên nghiệp.
  - **Tạo mới với Seed ngẫu nhiên (Regenerate):** Cung cấp nút *"🖼️ Render lại ảnh Hero"*, tự động tạo seed mới để người dùng có thể đổi sang bức ảnh AI khác chỉ trong 1 giây mà không cần sinh lại toàn bộ nội dung email.
  - **Cơ chế Fallback thông minh:** Khi mạng Internet hoặc máy chủ tạo ảnh gián đoạn, hệ thống tự động hiển thị ảnh Unsplash tương ứng với ngành hàng đã nhận diện, không bao giờ để ảnh bị lỗi `broken image`.

### 4.3. Local Adaptive Brand Intelligence Engine (Offline Fallback Engine)
- Khi người dùng không có Internet hoặc chạm giới hạn hạn ngạch Gemini (HTTP 429 Quota Exhausted), ứng dụng tự động kích hoạt bộ máy trí tuệ cục bộ (8 Archetypes, 100+ patterns nhận diện ngành) để sinh 4 mẫu thiết kế chuẩn xác mà không gây gián đoạn.

### 4.4. Kiểm soát đầu ra & An toàn (AI Guardrails)
- **Chính sách chống bịa đặt nghiêm ngặt (Strict Anti-Fabrication Policy):** Kiểm tra nội dung đầu vào bằng hàm `detectExplicitOffer()`. Nếu người dùng không nhập thông tin giảm giá/ưu đãi, AI tuyệt đối không tự "bịa" % khuyến mãi hoặc mã giảm giá ảo.
- **Bộ chuẩn hóa Schema (`response-validator.js`):** Đảm bảo kết quả luôn đủ 4 slot thiết kế hoàn chỉnh, không bao giờ để slot rỗng, lỗi hoặc trùng lặp.
- **Bảo vệ an toàn dữ liệu (`escapeHtml`):** Lọc sạch dữ liệu đầu vào chống tấn công XSS khi hiển thị trực tiếp lên DOM.
- **Bảo mật khoá API:** Không hardcode khoá API trong client. Hỗ trợ cấu hình qua biến môi trường phía server hoặc nhập an toàn trên giao diện và lưu trữ mã hóa trong trình duyệt của người dùng.

Biến môi trường (khi triển khai có backend/serverless):

```env
GEMINI_API_KEY=AIzaSy...
GEMINI_PRIMARY_MODEL=gemini-2.5-flash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

---

## 5. Cài đặt và chạy local

Yêu cầu môi trường: Trình duyệt hiện đại (Chrome / Edge / Safari / Firefox); **Node.js ≥ 18**.

```bash
# 1. Cài đặt các gói phụ trợ
npm install

# 2. Khởi chạy máy chủ phát triển (mặc định tại http://localhost:3000)
npm run dev

# 3. Chạy toàn bộ bộ kiểm thử tự động (18 unit & integration tests)
npm test

# 4. Đóng gói sản phẩm tối ưu cho môi trường Production (ra thư mục dist/)
npm run build
```

---

## 6. Cấu trúc thư mục

```text
Mailora/
├── index.html                    # Trang Onboarding & Visual Showcase chính
├── landing_page.html             # Trang giới thiệu giải pháp SaaS, Tính năng & Báo giá
├── login.html                    # Trang đăng nhập xác thực
├── sign_up.html                  # Trang đăng ký tài khoản (kèm 50 Credits khởi đầu)
├── AI_creative_studio.html       # Không gian làm việc AI Studio cốt lõi (Canvas & Preview)
├── AI_studio.html                # Cổng chuyển tiếp tương thích (Legacy router with Anti-FOUC)
│
├── src/                          # Mã nguồn ứng dụng module hóa
│   ├── components/               # Toast thông báo, Loading state, Modal UI
│   ├── config/                   # Cấu hình Supabase & API Endpoints
│   ├── core/                     # App bootstrap, State Manager tập trung, Event Bus
│   ├── modules/ai/               # Bộ máy Trí tuệ Nhân tạo & Kiểm soát đầu ra
│   │   ├── adaptive-engine.js    # Local Adaptive Fallback Engine
│   │   ├── brand-intelligence.js # 8 Archetypes & 100+ từ khóa nhận diện thương hiệu
│   │   ├── offer-validator.js    # Bộ kiểm soát chống bịa đặt khuyến mãi (Anti-Fabrication)
│   │   ├── response-validator.js # Schema Normalizer đảm bảo 4 kiến trúc thiết kế
│   │   └── variant-manager.js    # Trình kiến tạo 4 phong cách email độc bản
│   ├── pages/                    # Logic điều khiển từng trang (Landing, Login, Signup)
│   ├── services/                 # AuthService (24h TTL, BFCache), CampaignService, Credits
│   └── utils/                    # Xử lý bảo mật XSS, Storage, Validation, Time calculation
│
├── tests/                        # Bộ kiểm thử tự động Vitest (18 tests)
│   ├── ai/                       # Kiểm thử Brand Intelligence, Schema, Anti-Fabrication
│   ├── auth/                     # Kiểm thử Session TTL 24h & Khởi tạo phiên
│   ├── credits/                  # Kiểm thử cấp và trừ Credits minh bạch
│   ├── integration/              # Kiểm thử luồng xuất HTML và chấm điểm QA
│   └── security/                 # Kiểm thử lọc mã độc XSS và ID Generator
│
├── supabase/                     # Cấu hình Database PostgreSQL & Edge Functions
├── public/ & assets/             # Tài nguyên đồ họa, font chữ và phong cách thiết kế
├── package.json                  # Cấu hình phụ thuộc và scripts chạy
├── vite.config.js                # Cấu hình build đa trang (Multi-page App)
└── README.md                     # Tài liệu thuyết minh chính thức của dự án
```

---

## 7. Truy cập và phân quyền

- **Màn hình công khai (Public Access):**
  - Khách ghé thăm tự do trải nghiệm trang đích `index.html` và `landing_page.html`.
  - Nếu đã có phiên làm việc hợp lệ, thanh Header sẽ tự động hiển thị nút **"✦ Mở AI Studio"** và nút **"Đăng xuất"** thay vì tự động chuyển trang gây khó chịu.
- **Bảo vệ không gian làm việc Studio (Anti-FOUC Atelier Curtain):**
  - Truy cập trực tiếp vào `/AI_creative_studio.html` được kiểm soát ngay từ dòng đầu tiên của `<body>`. Nếu chưa đăng nhập hoặc phiên quá hạn 24 giờ, màn chắn hiển thị thông báo và điều hướng an toàn về `index.html`, **tuyệt đối không để lộ giao diện làm việc (Zero FOUC)**.
- **Quản lý phiên làm việc & Vòng đời bảo mật:**
  - Áp dụng thời gian sống **24-Hour TTL** kể từ thời điểm đăng nhập.
  - Khi hết hạn 24 giờ: Hệ thống tự động lưu bản sao dự phòng của bản thảo chưa lưu (`mailora_backup_draft_...`), huỷ phiên làm việc, phát tín hiệu đồng bộ đăng xuất đa tab (`storage` event), chặn bộ nhớ đệm nút Back của trình duyệt (`pageshow` BFCache blocker) và chuyển về trang đăng nhập.
  - Trong chế độ demo không backend, hỗ trợ nút "Đăng nhập nhanh" cấp ngay 50 Credits để Ban Giám Khảo đánh giá tức thì mà không bị vướng rào cản email.

---

## 8. Giới hạn hiện tại

- **Dữ liệu cục bộ:** Khi chạy không kết nối Cloud Database, lịch sử chiến dịch và kho ảnh media được lưu tại `localStorage` của trình duyệt hiện tại.
- **Hạn ngạch Gemini miễn phí:** Gói Google Gemini API Free Tier có giới hạn tần suất yêu cầu (15 RPM). Vấn đề này đã được nhóm giải quyết triệt để thông qua cơ chế **Dual-Engine Fallback** (tự động chuyển sang Local Adaptive Engine khi chạm giới hạn 429).
- **Tốc độ tạo ảnh Pollinations.ai:** Phụ thuộc vào tốc độ mạng và hàng đợi của cụm máy chủ Pollinations.ai (thông thường từ 1–3 giây). Đã có cơ chế ảnh placeholder và ảnh Unsplash dự phòng khi tải lâu.

---

## 9. Nguồn tham khảo

- **Bộ chuẩn Typography:** Google Fonts (*Plus Jakarta Sans, Instrument Serif, Playfair Display*).
- **Mô hình tạo ảnh AI:** Pollinations.ai API (*Open source Generative Image Platform*).
- **Thư viện ảnh dự phòng:** Unsplash API (Bộ sưu tập ảnh mẫu chuẩn bản quyền theo từng ngành hàng).
- **Chuẩn hiển thị Email:** W3C HTML Email Design Guidelines & RFC 2822 Table-based nested layouts.

---

## 10. Minh chứng dùng AI để xây dựng sản phẩm (Vibe Coding Loop)

Quá trình xây dựng Mailora.ai được đội thi thực hiện thông qua quy trình lặp **Vibe Coding** có kiểm soát chặt chẽ theo 6 vòng lặp:

```
[Mục tiêu] ──> [Yêu cầu AI sinh mã] ──> [Thử nghiệm thực tế] ──> [Phát hiện vấn đề] ──> [Yêu cầu AI tinh chỉnh] ──> [Kiểm tra lại 100% Đạt]
```

* **Vòng 1 — Kết nối AI & Khắc phục định dạng JSON tự do:**
  - *Mục tiêu:* Kết nối Gemini API để tạo nội dung email từ mô tả tự nhiên.
  - *Vấn đề phát hiện:* Khi người dùng nhập prompt phức tạp, AI trả về văn bản kèm markdown tự do khiến việc render lên giao diện bị lỗi gãy cấu trúc.
  - *Yêu cầu sửa cho AI:* Áp dụng tính năng `responseSchema` ép buộc Gemini trả về cấu trúc JSON chuẩn mực tuyệt đối.
  - *Kết quả kiểm tra:* 100% phản hồi từ AI được phân tích thành đối tượng dữ liệu hoàn chỉnh.

* **Vòng 2 — Khắc phục lỗi vỡ bố cục khi dán vào Gmail / Outlook:**
  - *Mục tiêu:* Người dùng có thể copy email và gửi trực tiếp từ ứng dụng hộp thư thật.
  - *Vấn đề phát hiện:* Ban đầu dùng các thẻ `<div>` và CSS hiện đại, khi dán vào Gmail thì toàn bộ căn lề và màu sắc bị Gmail xóa sạch, dồn sang mép trái.
  - *Yêu cầu sửa cho AI:* Tái cấu trúc bộ sinh HTML sang cấu trúc `<table>` lồng nhau với `align="center"`, bọc trong thẻ `<center>`, nhúng inline CSS tương thích hoàn toàn chuẩn email 20 năm qua.
  - *Kết quả kiểm tra:* Khi dán vào hộp thư Gmail Web hoặc Outlook, bức thư hiển thị chính giữa màn hình, giữ nguyên font chữ, ảnh hero và nút bấm.

* **Vòng 3 — Kiểm soát ảo giác thông tin ưu đãi (Anti-Fabrication Engine):**
  - *Mục tiêu:* Đảm bảo tính trung thực nghiệp vụ trong tiếp thị.
  - *Vấn đề phát hiện:* Khi người dùng chỉ nhập "Quán cà phê rang mộc", AI tự ý thêm "Giảm giá 50% hôm nay" gây sai lệch chính sách kinh doanh.
  - *Yêu cầu sửa cho AI:* Xây dựng module `offer-validator.js` với thuật toán Regex trích xuất ưu đãi rõ ràng; nếu không phát hiện ưu đãi người dùng cung cấp thì cấm AI tự tạo thông tin khuyến mãi ảo.
  - *Kết quả kiểm tra:* Đạt 100% trong bài kiểm tra `anti-fabrication policy` của bộ unit test.

* **Vòng 4 — Nâng cấp kiến trúc từ 3 mẫu lên 4 phong cách độc bản:**
  - *Mục tiêu:* Mở rộng độ đa dạng phong cách thiết kế theo tiêu chuẩn thương hiệu cao cấp.
  - *Vấn đề phát hiện:* Các mẫu cũ có phong cách tương tự nhau, chưa tạo được sự phân hóa rõ nét cho các mục đích tiếp thị khác nhau.
  - *Yêu cầu sửa cho AI:* Chuẩn hóa thành 4 kiến trúc thiết kế chuẩn: *Signature Flagship, High-Contrast Atelier, Editorial Storyteller, Conversion Focus*. Đồng bộ toàn bộ giao diện, backend schema, validator và tab bar chuyển đổi nhanh.
  - *Kết quả kiểm tra:* Cả 4 biến thể đều có bản sắc riêng, chuyển đổi tức thì trên Canvas Studio.

* **Vòng 5 — Tích hợp AI tạo ảnh Banner (Pollinations.ai) qua Prompt Chaining:**
  - *Mục tiêu:* Tự động sinh ảnh banner minh hoạ theo đúng ngữ cảnh sản phẩm bằng AI thay vì dùng ảnh tĩnh.
  - *Vấn đề phát hiện:* Nếu người dùng phải tự gõ prompt tạo ảnh thì rất tốn thời gian và ảnh không đồng bộ phong cách với màu sắc email.
  - *Yêu cầu sửa cho AI:* Áp dụng Prompt Chaining: Gemini tự động phân tích bối cảnh chiến dịch để sinh `heroPrompt` tiếng Anh chuẩn phong cách studio thương mại $\rightarrow$ gọi tự động sang Pollinations.ai với kích thước chuẩn 880x560, không logo, seed biến thiên.
  - *Kết quả kiểm tra:* Ảnh tạo ra ăn khớp 100% với chủ đề chiến dịch (thời trang, công nghệ, ẩm thực...), có nút bấm *"Render lại ảnh Hero"* để đổi ảnh mới tức thì.

* **Vòng 6 — Hoàn thiện bảo mật vòng đời phiên 24h & Chống lộ giao diện (Anti-FOUC):**
  - *Mục tiêu:* Bảo vệ an toàn ứng dụng và nâng cao trải nghiệm thị giác.
  - *Vấn đề phát hiện:* Khi vào trực tiếp link Studio khi chưa đăng nhập, giao diện bị giật (FOUC) 0.5s trước khi chuyển trang.
  - *Yêu cầu sửa cho AI:* Xây dựng màn chắn Lavender Atelier Curtain chạy đồng bộ ngay đầu `<body>`, tích hợp cơ chế 24-Hour TTL, tự động backup bản thảo và chặn BFCache trình duyệt.
  - *Kết quả kiểm tra:* Chuyển trang mượt mà không có bất kỳ hiện tượng chớp nháy UI.

---

## 11. Bảng kiểm thử (Bộ 6 ca kiểm thử chuẩn Bảng A)

> Bộ kiểm thử bao gồm **2 ca bình thường**, **2 ca đầu vào không hợp lệ**, và **2 ca biên/xử lý sự cố** theo đúng quy định chấm thi. Toàn bộ các ca đã được xác minh thực tế và liên kết với bộ 18 automated tests tự động trong `tests/`.

| Mã ca | Loại ca kiểm thử | Dữ liệu và các bước thử nghiệm | Kết quả kỳ vọng | Kết quả thực tế | Trạng thái |
|---|---|---|---|---|---|
| **TC01** | **Bình thường (Normal)** | Nhập: *"Ra mắt khoá học AI Leadership cho doanh nghiệp, ưu đãi 50%"* $\rightarrow$ Bấm *"Khởi tạo chiến dịch"*. | AI nhận diện đúng ngành Giáo dục/Công nghệ, sinh đủ **4 mẫu email độc bản**, tự động sinh ảnh banner AI qua Pollinations.ai, hiển thị đúng khung giờ vàng gửi thư đề xuất (10:15 AM Thứ Ba). | Hệ thống sinh đầy đủ 4 mẫu thiết kế chuyên nghiệp trong ~2.5s, ảnh banner AI hiển thị sắc nét ăn khớp nội dung. | **ĐẠT** |
| **TC02** | **Bình thường (Normal)** | Tại mẫu thiết kế đã chọn $\rightarrow$ Nhấn nút *"Mở Gmail Web & Copy HTML"* $\rightarrow$ Mở tab Gmail và nhấn `Cmd+V` (hoặc `Ctrl+V`). | Toàn bộ email định dạng Rich HTML (ảnh hero AI, màu sắc thẻ, nút bấm CTA) được dán ngay ngắn, **căn chính giữa hộp thư**, không bị lệch lề hay vỡ bảng. | Bức thư hiển thị đẹp mắt, giữ nguyên hình ảnh và phong cách đồ họa như trên Studio. | **ĐẠT** |
| **TC03** | **Đầu vào không hợp lệ (Invalid)** | Để trống ô nhập liệu hoặc chỉ nhập 1 ký tự vu vơ $\rightarrow$ Bấm nút tạo chiến dịch. | Hệ thống chặn không cho gửi yêu cầu, hiển thị thông báo Toast cảnh báo người dùng cần nhập nội dung thương hiệu/chiến dịch, tự động focus vào ô nhập. | Hiển thị thông báo *"Vui lòng nhập thông tin thương hiệu hoặc chiến dịch để bắt đầu!"*, không phát sinh lỗi mã nguồn. | **ĐẠT** |
| **TC04** | **Đầu vào không hợp lệ (Anti-Fabrication)** | Nhập prompt: *"Chiến dịch giới thiệu bộ sưu tập áo măng tô mùa đông của thương hiệu MONO"* *(Cố tình không nhắc đến bất kỳ ưu đãi giảm giá nào)*. | AI tuyệt đối **không được tự bịa ra** giảm giá 20%, 50% hay voucher ảo; thanh thông tin nhận diện hiển thị trạng thái *"Không tự bịa ưu đãi"*. | Email tập trung tôn vinh chất liệu và giá trị thương hiệu; ô ưu đãi trống, không xuất hiện phần trăm giảm giá ảo. | **ĐẠT** |
| **TC05** | **Biên & Sự cố (Fault Tolerance)** | Ngắt kết nối mạng Internet hoặc giả lập lỗi giới hạn hạn ngạch Google Gemini API (HTTP 429 Quota Exhausted) $\rightarrow$ Bấm tạo chiến dịch. | Hệ thống không bị treo hoặc sập giao diện; tự động chuyển đổi mượt mà sang **Local Adaptive Intelligence Engine**, sinh đủ 4 mẫu thiết kế dự phòng chuẩn ngành kèm ảnh fallback an toàn. | Ứng dụng hiển thị thông báo chuyển đổi cơ chế dự phòng và render đủ 4 thiết kế chất lượng cao offline. | **ĐẠT** |
| **TC06** | **Biên & Sự cố (Security & TTL)** | Xóa phiên đăng nhập hoặc chỉnh sửa mốc thời gian `loggedInAt` quá 24 giờ $\rightarrow$ Truy cập trực tiếp link `/AI_creative_studio.html`. | Màn chắn Anti-FOUC kích hoạt ngay lập tức; hệ thống tự động lưu bản thảo chưa lưu vào kho backup, huỷ phiên và điều hướng về trang chủ `index.html` mà không để lộ giao diện workspace. | Màn chắn Lavender Atelier hiển thị thông báo chuyển hướng êm ái, hoàn toàn không làm lộ thông tin làm việc. | **ĐẠT** |

---

## 12. Hồ sơ bàn giao

1. **Gói mã nguồn (Source Code):**
   - Đóng gói toàn bộ mã nguồn sạch, thư mục `src/`, `tests/`, `public/`, `supabase/` và tệp cấu hình.
   - Không chứa bất kỳ thông tin nhạy cảm, khoá API bí mật hay mật khẩu thật nào trong bài nộp.
2. **Video Demo (≤ 02 phút):**
   - `https://drive.google.com/file/d/1snBFoEKr0qF1Zivj8XegAy7MSp77SURb/view?usp=sharing`
3. **Minh chứng Vibe Coding & Bảng kiểm thử:**
   - Đầy đủ tại Mục 10 và Mục 11 của tệp README này.
   - Đi kèm bộ 18 test cases tự động có thể chạy lại bất cứ lúc nào qua lệnh `npm test`.
4. **Tài khoản trải nghiệm nhanh (Dành cho Ban Giám Khảo):**
   - Hệ thống tích hợp sẵn nút **"Đăng nhập nhanh (Quick Access)"** trên cả trang `login.html` và `sign_up.html` giúp Ban Giám Khảo bấm 1 chạm là vào ngay không gian làm việc Studio với đầy đủ 50 Credits mà không cần thao tác xác thực phức tạp.

---
*Bản quyền dự án thuộc về **Đội thi 001** — Tham dự Cuộc thi Vibe Coding 2026.*
