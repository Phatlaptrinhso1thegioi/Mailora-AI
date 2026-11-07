# MAILORA.AI — API DOCUMENTATION

All protected endpoints require an `Authorization: Bearer <JWT>` header obtained from Supabase Auth.

---

## 1. POST `/functions/v1/generate-campaign`

Analyzes brand request and generates 4 distinct creative design directions.

### Request Headers
- `Authorization`: `Bearer <access_token>` (Required)
- `Content-Type`: `application/json`
- `X-Idempotency-Key`: `string` (Optional)

### Request Body
```json
{
  "prompt": "Thương hiệu mỹ phẩm cao cấp LUMIÈRE ra mắt tinh chất ban đêm Midnight Elixir...",
  "ctaUrl": "https://lumiere.com/order",
  "model": "gemini-2.5-flash"
}
```

### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "brandName": "LUMIÈRE",
    "industry": "Làm Đẹp & Chăm Sóc Sắc Đẹp",
    "archetype": "luxury_beauty",
    "targetAudience": "Phái đẹp hiện đại 25-45 tuổi",
    "campaignObjective": "Tôn vinh vẻ đẹp nguyên bản",
    "artDirection": "Haute Parfumerie & Luxury Aesthetics",
    "subject": "LUMIÈRE — Tinh Hoa Đánh Thức Làn Da Tỏa Sáng",
    "preheader": "Công thức độc bản chứa phức hợp tinh chất thực vật quý hiếm.",
    "hasExplicitOffer": false,
    "promo": null,
    "variants": [
      {
        "id": "variant_1",
        "style_name": "Haute Parfumerie — Signature Flagship",
        "headline": "LUMIÈRE — Tinh Hoa Đánh Thức Làn Da Tỏa Sáng",
        "subheadline": "Công thức độc bản chứa phức hợp tinh chất quý hiếm",
        "body": "...",
        "primaryCta": "Trải Nghiệm Tinh Hoa Ngay",
        "ctaUrl": "https://lumiere.com/order",
        "benefits": ["Hiệu quả dưỡng ẩm sâu", "Thành phần hữu cơ"],
        "primaryColor": "#6655E8",
        "cardColor": "#FFFFFF"
      }
    ]
  },
  "meta": {
    "requestId": "e7b0e11e-7b7e-4ec6-8968-3e4b30642fa3"
  }
}
```

### Error Response (`402 Payment Required`)
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_CREDITS",
    "message": "INSUFFICIENT_CREDITS: Tài khoản của bạn không đủ credits để tạo chiến dịch này."
  },
  "meta": {
    "requestId": "..."
  }
}
```

---

## 2. POST `/functions/v1/generate-hero`

Generates or fetches an AI hero image matching the archetype. Costs 1 credit.

### Request Body
```json
{
  "prompt": "Studio bottle of perfume surrounded by jasmine flowers, soft lighting",
  "archetype": "luxury_beauty"
}
```

---

## 3. POST `/functions/v1/rewrite-content`

Rewrites selected copy to fit a specific marketing tone.

### Request Body
```json
{
  "content": "Sản phẩm tốt, giao hàng nhanh.",
  "tone": "editorial",
  "context": { "brandName": "LUMIÈRE" }
}
```

---

## 4. POST `/functions/v1/validate-email`

Validates generated email HTML against email-client standards.

### Request Body
```json
{
  "html": "<!DOCTYPE html>...",
  "subject": "Tiêu đề email",
  "preheader": "Đoạn giới thiệu"
}
```

---

## 5. GET `/functions/v1/api-status`

Health check endpoint. Never returns raw API keys or provider secrets.

### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "provider": "Google Gemini",
    "status": "connected",
    "activeModel": "gemini-2.5-flash",
    "fallbackModel": "gemini-2.0-flash",
    "configured": true,
    "checkedAt": "2026-11-07T00:58:10.000Z"
  },
  "meta": {
    "requestId": "..."
  }
}
```
