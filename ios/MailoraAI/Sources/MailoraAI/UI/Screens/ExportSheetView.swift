import SwiftUI
#if canImport(UIKit)
import UIKit
#elseif canImport(AppKit)
import AppKit
#endif

/// Export & HTML Generation Bottom Sheet
public struct ExportSheetView: View {
    public let variant: EmailVariant
    public let heroImageUrl: String
    @Binding var isPresented: Bool
    @State private var hasCopied = false

    public init(variant: EmailVariant, heroImageUrl: String, isPresented: Binding<Bool>) {
        self.variant = variant
        self.heroImageUrl = heroImageUrl
        self._isPresented = isPresented
    }

    public var generatedHtml: String {
        """
        <!DOCTYPE html>
        <html lang="vi">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>\(variant.subject)</title>
        </head>
        <body style="margin:0;padding:0;background-color:\(variant.theme.bgOuter);font-family:\(variant.theme.bodyFont);">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td align="center" style="padding: 40px 15px;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background-color:\(variant.theme.cardBg);border:\(variant.theme.cardBorder);border-radius:16px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.05);">
                  <tr>
                    <td>
                      <img src="\(heroImageUrl)" alt="Hero Image" width="600" style="display:block;width:100%;height:auto;max-height:280px;object-fit:cover;">
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 32px 28px;">
                      <p style="margin:0 0 10px 0;font-size:12px;font-weight:700;color:\(variant.theme.eyebrowColor);letter-spacing:1px;text-transform:uppercase;">\(variant.eyebrow)</p>
                      <h1 style="margin:0 0 16px 0;font-size:24px;line-height:1.3;font-family:\(variant.theme.fontFamily);color:\(variant.theme.headlineColor);">\(variant.headline)</h1>
                      <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:\(variant.theme.bodyColor);">\(variant.body)</p>
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td align="center">
                            <a href="\(variant.ctaUrl)" style="display:inline-block;padding:14px 32px;background-color:\(variant.theme.ctaBg);color:\(variant.theme.ctaColor);text-decoration:none;font-weight:700;border-radius:\(variant.theme.ctaRadius);font-size:15px;">\(variant.ctaText)</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
        """
    }

    public var body: some View {
        NavigationStack {
            VStack(spacing: DesignTokens.Spacing.md) {
                HStack {
                    Text("Mã HTML Email (Bulletproof Table)")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(DesignTokens.Colors.textPrimary)
                    Spacer()
                    if hasCopied {
                        Text("Đã sao chép!")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(DesignTokens.Colors.emerald)
                    }
                }
                .padding(.horizontal)

                ScrollView {
                    Text(generatedHtml)
                        .font(.system(size: 11, design: .monospaced))
                        .padding()
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(DesignTokens.Colors.surfaceSubtle)
                        .clipShape(RoundedRectangle(cornerRadius: DesignTokens.Radii.medium))
                }
                .padding(.horizontal)

                MailoraButton(
                    title: hasCopied ? "Đã Sao Chép HTML Vào Clipboard" : "Sao Chép Toàn Bộ Mã HTML",
                    icon: hasCopied ? "checkmark" : "doc.on.doc",
                    variant: hasCopied ? .secondary : .primary
                ) {
                    copyToClipboard()
                }
                .padding()
            }
            .navigationTitle("Xuất Chiến Dịch Email")
            #if os(iOS)
            .navigationBarTitleDisplayMode(.inline)
            #endif
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Đóng") { isPresented = false }
                }
            }
        }
    }

    private func copyToClipboard() {
        #if canImport(UIKit)
        UIPasteboard.general.string = generatedHtml
        let feedback = UINotificationFeedbackGenerator()
        feedback.notificationOccurred(.success)
        #elseif canImport(AppKit)
        NSPasteboard.general.clearContents()
        NSPasteboard.general.setString(generatedHtml, forType: .string)
        #endif
        hasCopied = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.5) {
            hasCopied = false
        }
    }
}
