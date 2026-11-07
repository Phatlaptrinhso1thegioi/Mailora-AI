import SwiftUI

/// Authentication Sign Up View
public struct SignUpView: View {
    @Environment(AppState.self) private var appState
    @State private var fullName = ""
    @State private var email = ""
    @State private var password = ""
    @State private var isLoading = false
    @State private var errorMessage: String?

    public init() {}

    public var body: some View {
        NavigationStack {
            VStack(spacing: DesignTokens.Spacing.xl) {
                // Top Dismiss
                HStack {
                    Button(action: { appState.currentScreen = .welcome }) {
                        Image(systemName: "xmark")
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(DesignTokens.Colors.textSecondary)
                            .padding(8)
                            .background(Circle().fill(DesignTokens.Colors.surfaceSubtle))
                    }
                    Spacer()
                }

                Spacer()

                // Brand Header
                VStack(spacing: DesignTokens.Spacing.xs) {
                    Image(systemName: "sparkles")
                        .font(.system(size: 38))
                        .foregroundStyle(DesignTokens.Colors.primaryGradient)

                    Text("Khởi Tạo Tài Khoản")
                        .font(.system(size: 26, weight: .bold, design: .serif))
                        .foregroundColor(DesignTokens.Colors.textPrimary)

                    Text("Nhận ngay 50 Credits miễn phí tạo chiến dịch email")
                        .font(.system(size: 14))
                        .foregroundColor(DesignTokens.Colors.textSecondary)
                }

                // Error Banner
                if let err = errorMessage {
                    HStack(spacing: 8) {
                        Image(systemName: "exclamationmark.circle.fill")
                            .foregroundColor(DesignTokens.Colors.rose)
                        Text(err)
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(DesignTokens.Colors.rose)
                        Spacer()
                    }
                    .padding(DesignTokens.Spacing.md)
                    .background(DesignTokens.Colors.rose.opacity(0.1))
                    .clipShape(RoundedRectangle(cornerRadius: DesignTokens.Radii.small))
                }

                // Input Fields
                VStack(spacing: DesignTokens.Spacing.md) {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("HỌ VÀ TÊN")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(DesignTokens.Colors.textMuted)

                        TextField("Nguyễn Thiện Phát", text: $fullName)
                            .padding(DesignTokens.Spacing.md)
                            .background(DesignTokens.Colors.surfaceSubtle)
                            .clipShape(RoundedRectangle(cornerRadius: DesignTokens.Radii.medium))
                    }

                    VStack(alignment: .leading, spacing: 6) {
                        Text("EMAIL")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(DesignTokens.Colors.textMuted)

                        #if os(iOS)
                        TextField("creator@company.com", text: $email)
                            .keyboardType(.emailAddress)
                            .textInputAutocapitalization(.never)
                            .padding(DesignTokens.Spacing.md)
                            .background(DesignTokens.Colors.surfaceSubtle)
                            .clipShape(RoundedRectangle(cornerRadius: DesignTokens.Radii.medium))
                        #else
                        TextField("creator@company.com", text: $email)
                            .padding(DesignTokens.Spacing.md)
                            .background(DesignTokens.Colors.surfaceSubtle)
                            .clipShape(RoundedRectangle(cornerRadius: DesignTokens.Radii.medium))
                        #endif
                    }

                    VStack(alignment: .leading, spacing: 6) {
                        Text("MẬT KHẨU")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(DesignTokens.Colors.textMuted)

                        SecureField("Tối thiểu 6 ký tự", text: $password)
                            .padding(DesignTokens.Spacing.md)
                            .background(DesignTokens.Colors.surfaceSubtle)
                            .clipShape(RoundedRectangle(cornerRadius: DesignTokens.Radii.medium))
                    }
                }

                // Submit Button
                MailoraButton(
                    title: "Tạo Tài Khoản & Mở Studio",
                    icon: "sparkles",
                    variant: .primary,
                    isLoading: isLoading
                ) {
                    Task { await performSignUp() }
                }

                // Switch to Login
                Button(action: { appState.currentScreen = .login }) {
                    Text("Đã có tài khoản? **Đăng nhập ngay**")
                        .font(.system(size: 13))
                        .foregroundColor(DesignTokens.Colors.indigo)
                }

                Spacer()
            }
            .padding(.horizontal, DesignTokens.Spacing.xl)
            .background(DesignTokens.Colors.background.ignoresSafeArea())
        }
    }

    private func performSignUp() async {
        guard !email.isEmpty, !password.isEmpty else {
            errorMessage = "Vui lòng điền đầy đủ email và mật khẩu."
            return
        }

        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            let session = try await AuthService.shared.signUp(email: email, password: password, fullName: fullName)
            appState.didAuthenticate(session: session)
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
