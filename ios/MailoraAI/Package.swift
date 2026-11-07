// swift-tools-version: 5.9
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "MailoraAI",
    defaultLocalization: "vi",
    platforms: [
        .iOS(.v17),
        .macOS(.v14)
    ],
    products: [
        .library(
            name: "MailoraAI",
            targets: ["MailoraAI"]
        ),
        .executable(
            name: "MailoraAITestsRunner",
            targets: ["MailoraAITestsRunner"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "MailoraAI",
            dependencies: [],
            path: "Sources/MailoraAI"
        ),
        .executableTarget(
            name: "MailoraAITestsRunner",
            dependencies: ["MailoraAI"],
            path: "Sources/MailoraAITestsRunner"
        )
    ]
)
