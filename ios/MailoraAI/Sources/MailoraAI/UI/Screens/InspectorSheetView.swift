import SwiftUI

/// Design System Token Inspector Bottom Sheet
public struct InspectorSheetView: View {
    @Bindable var variantManager: VariantManager
    @Binding var isPresented: Bool

    private let fontOptions = [
        "Playfair Display, serif",
        "Plus Jakarta Sans, sans-serif",
        "Cinzel, serif",
        "Lora, serif",
        "Montserrat, sans-serif",
        "Inter, sans-serif"
    ]

    private let radiusOptions = ["4px", "8px", "12px", "16px", "24px"]

    public init(variantManager: VariantManager, isPresented: Binding<Bool>) {
        self.variantManager = variantManager
        self._isPresented = isPresented
    }

    public var body: some View {
        NavigationStack {
            Form {
                if let variant = variantManager.activeVariant {
                    Section("Phông Chữ (Typography)") {
                        Picker("Font Tiêu Đề", selection: fontBinding(for: variant)) {
                            ForEach(fontOptions, id: \.self) { font in
                                Text(font.components(separatedBy: ",").first ?? font)
                                    .tag(font)
                            }
                        }
                    }

                    Section("Màu Sắc Nút CTA & Nhận Diện") {
                        TextField("Màu nền nút CTA (Hex)", text: ctaBgBinding(for: variant))
                        TextField("Màu chữ nút CTA (Hex)", text: ctaColorBinding(for: variant))
                        TextField("Màu viền thẻ (Hex)", text: cardBorderBinding(for: variant))
                    }

                    Section("Bo Góc Nút Kêu Gọi Hành Động (CTA Radius)") {
                        Picker("Bo góc", selection: ctaRadiusBinding(for: variant)) {
                            ForEach(radiusOptions, id: \.self) { radius in
                                Text(radius).tag(radius)
                            }
                        }
                        .pickerStyle(.segmented)
                    }
                } else {
                    Text("Chưa chọn biến thể.")
                }
            }
            .navigationTitle("Adaptive Inspector")
            #if os(iOS)
            .navigationBarTitleDisplayMode(.inline)
            #endif
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Xong") { isPresented = false }
                }
            }
        }
    }

    private func fontBinding(for variant: EmailVariant) -> Binding<String> {
        Binding(
            get: { variant.theme.fontFamily },
            set: { newFont in
                variantManager.updateActiveVariant { v in
                    v.theme.fontFamily = newFont
                }
            }
        )
    }

    private func ctaBgBinding(for variant: EmailVariant) -> Binding<String> {
        Binding(
            get: { variant.theme.ctaBg },
            set: { newColor in
                variantManager.updateActiveVariant { v in
                    v.theme.ctaBg = newColor
                }
            }
        )
    }

    private func ctaColorBinding(for variant: EmailVariant) -> Binding<String> {
        Binding(
            get: { variant.theme.ctaColor },
            set: { newColor in
                variantManager.updateActiveVariant { v in
                    v.theme.ctaColor = newColor
                }
            }
        )
    }

    private func cardBorderBinding(for variant: EmailVariant) -> Binding<String> {
        Binding(
            get: { variant.theme.cardBorder },
            set: { newBorder in
                variantManager.updateActiveVariant { v in
                    v.theme.cardBorder = newBorder
                }
            }
        )
    }

    private func ctaRadiusBinding(for variant: EmailVariant) -> Binding<String> {
        Binding(
            get: { variant.theme.ctaRadius },
            set: { newRadius in
                variantManager.updateActiveVariant { v in
                    v.theme.ctaRadius = newRadius
                }
            }
        )
    }
}
