// swift-tools-version: 6.0
import PackageDescription

// Based on `xtool new LexiIOS` (installed toolchain, 2026-10-18).
let package = Package(
    name: "LexiIOS",
    platforms: [.iOS(.v17), .macOS(.v14)],
    products: [.library(name: "LexiIOS", targets: ["LexiIOS"])],
    targets: [
        .target(name: "LexiIOS"),
        .testTarget(name: "LexiIOSTests", dependencies: ["LexiIOS"], resources: [.copy("Fixtures")]),
    ],
    swiftLanguageModes: [.v6]
)
