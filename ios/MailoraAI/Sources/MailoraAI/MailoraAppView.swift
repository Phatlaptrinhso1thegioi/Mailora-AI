import SwiftUI

/// Root SwiftUI Content View coordinating Anti-Flash Guard and Screen Transitions
public struct MailoraAppView: View {
    @State private var appState = AppState()
    @Environment(\.scenePhase) private var scenePhase

    public init() {}

    public var body: some View {
        ZStack {
            // Screen Routing
            Group {
                switch appState.currentScreen {
                case .welcome:
                    WelcomeView()
                case .login:
                    LoginView()
                case .signUp:
                    SignUpView()
                case .studio:
                    StudioView()
                }
            }
            .environment(appState)

            // Anti-Flash Guard (covers screen during initial async authentication check)
            if appState.isVerifyingSession {
                LoadingOverlayView(message: "Đang xác thực bảo mật Mailora.ai...")
                    .zIndex(999)
            }
        }
        .task {
            await appState.verifySessionOnLaunch()
        }
        .onChange(of: scenePhase) { _, newPhase in
            if newPhase == .active {
                appState.handleAppForeground()
            }
        }
    }
}
