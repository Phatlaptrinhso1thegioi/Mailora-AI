import SwiftUI

/// Authentication Login View
public struct LoginView: View {
    @Environment(AppState.self) private var appState
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
                    Image(systemName: "envelope.badge.shield.halfopen.fill")
                        .font(.system(size: 38))
                        .foregroundStyle(DesignTokens.Colors.primaryGradient)

                    Text("Đăng Nhập Mailora.ai")
                        .font(.system(size: 26, weight: .bold, design: .serif))
                        .foregroundColor(DesignTokens.Colors.textPrimary)

                    Text("Tiếp tục quản trị và sáng tạo chiến dịch email của bạn")
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

                // Fields
                VStack(spacing: DesignTokens.Spacing.md) {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("EMAIL CÔNG VIỆC")
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

                        SecureField("••••••••", text: $password)
                            .padding(DesignTokens.Spacing.md)
                            .background(DesignTokens.Colors.surfaceSubtle)
                            .clipShape(RoundedRectangle(cornerRadius: DesignTokens.Radii.medium))
                    }
                }

                // Submit Button
                MailoraButton(
                    title: "Đăng Nhập Vào Studio",
                    icon: "arrow.right",
                    variant: .primary,
                    isLoading: isLoading
                ) {
                    Task { await performLogin() }
                }

                // Switch to Register
                Button(action: { appState.currentScreen = .signUp }) {
                    Text("Chưa có tài khoản? **Đăng ký nhận 50 credits**")
                        .font(.system(size: 13))
                        .foregroundColor(DesignTokens.Colors.indigo)
                }

                Spacer()
            }
            .padding(.horizontal, DesignTokens.Spacing.xl)
            .background(DesignTokens.Colors.background.ignoresSafeArea())
            .alert("Phiên làm việc đã hết hạn", isPresented: Bindable(appState).showSessionExpiredAlert) {
                Button("OK", role: .cancel) { }
            } message: {
                Text("Để bảo mật tài khoản, phiên đăng nhập được giới hạn trong 24 giờ. Bản nháp của bạn đã được lưu tự động.")
            }
        }
    }

    private func performLogin() async {
        guard !email.isEmpty, !password.isEmpty else {
            errorMessage = "Vui lòng nhập đầy đủ email và mật khẩu."
            return
        }

        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            let session = try await AuthService.shared.signIn(email: email, password: password)
            appState.didAuthenticate(session: session)
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
