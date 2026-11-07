# Mailora.ai — Production SaaS iOS Application Architecture

This document outlines the architectural blueprint, design system, and technical specifications for the **Mailora.ai iOS Application**, designed according to the `saas-ios-app-architect` standard.

---

## 1. Delivery Architecture

### Primary: Native SwiftUI Architecture (Default)
- **Target SDK**: iOS 17.0+ / macOS 14.0+
- **Language**: Swift 6 (Modern Concurrency, `@Observable` state macros, `async/await`, `Sendable`).
- **Core Pattern**: Clean Modular Architecture with strict separation of concerns across Configuration, Core, Models, Services, Domain, and UI layers.
- **Location**: `ios/MailoraAI/`

### Secondary: Hybrid WebView Architecture (Escape Hatch)
- **Framework**: Capacitor 6.x
- **Config**: `ios/capacitor.config.json`
- **Use Case**: Allows wrapping existing Vite bundle (`npm run build` $\rightarrow$ `dist/`) to directly preserve legacy web canvases while retaining native push notifications and biometric auth.

---

## 2. Modular Project Structure

```
ios/MailoraAI/
├── Package.swift                             # Swift Package Manager Manifest
├── Sources/MailoraAI/
│   ├── Configuration/
│   │   ├── AppConfig.swift                  # Client URLs, public keys, 24h TTL constant, feature flags
│   │   └── DesignTokens.swift               # Mailora Navy, Indigo, Emerald, Radii, Spacing, Gradients
│   ├── Core/
│   │   ├── AppState.swift                   # Navigation coordinator, 24h TTL, Anti-Flash guard, Prompt Handoff
│   │   ├── KeychainManager.swift            # iOS Security framework (SecItem) JWT & timestamp storage
│   │   └── DraftStorage.swift               # Emergency local draft backup on session expiry
│   ├── Models/
│   │   ├── UserSession.swift                # Supabase UserProfile & Session representations
│   │   ├── CampaignModels.swift             # CreativeBrief, CampaignResponse, EmailVariant (4-variant schema)
│   │   ├── CreditModels.swift               # CreditBalance, CreditTransaction, TransactionType
│   │   ├── BrandKit.swift                   # BrandKit tokens & DesignSystemTokens
│   │   └── QAReport.swift                   # Dynamic 100-point rubric breakdown
│   ├── Services/
│   │   ├── NetworkClient.swift              # URLSession wrapper with exponential backoff & Bearer auth
│   │   ├── AuthService.swift                # Supabase GoTrue REST: signIn, signUp, signOut
│   │   ├── CreditsService.swift             # Supabase Profiles credit reader & atomic verification
│   │   ├── MediaService.swift               # Supabase Storage scoped to {user_id}/...
│   │   └── AIEngineService.swift            # Cloud Edge Function proxy + local offline engine fallback
│   ├── Domain/
│   │   ├── BrandIntelligence.swift          # Pure Swift 8-archetype brand classifier & token generator
│   │   ├── OfferValidator.swift             # Anti-Fabrication Guard (strips unrequested discounts/offers)
│   │   ├── ResponseValidator.swift          # Strict 4-variant schema & URL safety validator
│   │   ├── VariantManager.swift             # 0..3 index-clamped multi-variant coordinator
│   │   ├── QualityAssurance.swift           # 100-point dynamic QA evaluation engine
│   │   └── AdaptiveLocalEngine.swift        # Deterministic 100% offline campaign generator
│   ├── UI/
│   │   ├── Components/
│   │   │   ├── LoadingOverlayView.swift     # Anti-Flash branded curtain
│   │   │   ├── MailoraButton.swift          # Standard Design System button
│   │   │   ├── CreditBadgeView.swift        # Live credit counter pill
│   │   │   ├── ApiStatusBadgeView.swift     # Cloud Proxy vs. Adaptive Engine status
│   │   │   └── QAScoreBadgeView.swift       # Animated QA score pill
│   │   └── Screens/
│   │       ├── WelcomeView.swift            # Public entry, unforced browsing, dynamic CTA
│   │       ├── LoginView.swift              # Auth screen with prompt handoff & TTL alerts
│   │       ├── SignUpView.swift             # Registration with 50 credits bonus
│   │       ├── StudioView.swift             # Workspace, top bar, preview card, floating action bar
│   │       ├── PromptSheetView.swift        # Creative brief modal with chips & archetype selector
│   │       ├── VariantCarouselView.swift    # 4-variant tab switcher
│   │       ├── EmailCardPreview.swift       # Live rendered email card with hero image
│   │       ├── InspectorSheetView.swift     # Token adjustment: typography, colors, padding, radii
│   │       └── ExportSheetView.swift        # Responsive HTML table code & clipboard export
│   └── MailoraAppView.swift                 # Root SwiftUI view & scene phase observer
└── Tests/MailoraAITests/
    ├── BrandIntelligenceTests.swift        # Archetype classification & token verification
    ├── OfferValidatorTests.swift            # Anti-fabrication discount detection & neutralization
    ├── ResponseValidatorTests.swift         # 4-variant count & schema enforcement
    ├── VariantManagerTests.swift            # Index clamping & active variant mutation
    └── SessionTTLTests.swift                # 24h Keychain TTL expiration & Prompt Handoff
```

---

## 3. Security and API Integration Layer

1. **Zero Client Secrets**:
   - Private Gemini API keys and Service Role Keys are NEVER included in `AppConfig.swift` or `Info.plist`.
   - All AI generation runs through Supabase Edge Functions (`/functions/v1/generate-campaign`) or the offline fallback engine.
2. **Bearer Token Authentication**:
   - `NetworkClient` retrieves the active JWT from `KeychainManager` and attaches `Authorization: Bearer <token>`.
3. **Idempotency Guard**:
   - All mutating requests that consume credits send an `X-Idempotency-Key: UUIDv4` header so network retries never double-charge.
4. **Anti-Fabrication Guard**:
   - `OfferValidator` scans generated variants. If the user prompt did not explicitly contain discount keywords (`giảm 20%`, `30% off`, `voucher`, `tặng`), any hallucinated promo boxes or discount claims are stripped.

---

## 4. Authentication, Routing, and Session TTL

1. **Public Entry vs. Protected Workspace**:
   - Users on `WelcomeView` can browse freely without abrupt redirects.
   - If an authenticated session exists, the primary CTA dynamically updates to `"Vào Studio Của Bạn →"`.
2. **Anti-Flash Guard**:
   - On launch, `appState.isVerifyingSession` covers the screen with `LoadingOverlayView`.
   - Prevents unauthenticated content flashes before Keychain verification completes.
3. **24-Hour Time-Bounded Session TTL**:
   - The login timestamp is stored in Keychain (`mailora_auth_timestamp`).
   - On launch and app foreground (`scenePhase == .active`), if `Date().timeIntervalSince(authDate) > 86400`:
     1. Automatically backs up unsaved drafts to `DraftStorage`.
     2. Clears Keychain tokens.
     3. Smoothly redirects to `LoginView` with a clear explanation alert.
4. **Prompt Handoff**:
   - Prompts typed on the Welcome screen are preserved in `AppState.pendingPrompt`.
   - Immediately handed off to `StudioView` once registration or login finishes.

---

## 5. Synchronized 4-Variant System

| Index | Variant Name | Visual Tone | Archetype Adaptation |
|:---:|:---|:---|:---|
| **0** | **Signature Flagship** | Chuyên nghiệp, Đẳng cấp thương hiệu cốt lõi | Font Serif thanh lịch, viền sang trọng, CTA chính thống |
| **1** | **High-Contrast Atelier** | Sáng tạo & Cảm xúc, tương phản cao | Nền tối kiến trúc, điểm nhấn vàng/amber, typography sắc sảo |
| **2** | **Direct Momentum** | Gấp rút, tối đa chuyển đổi, kích thích hành động | Viền đỏ nổi bật, CTA lớn, urgency badge |
| **3** | **Editorial Zen** | Tối giản, không gian thở thoáng đãng | Font Lora tao nhã, bo góc mềm mại, nội dung tinh giản |

---

## 6. How to Build & Run

### Open in Xcode
```bash
cd ios/MailoraAI
open Package.swift
```

### Run Unit Tests via CLI
```bash
cd ios/MailoraAI
swift test
```
