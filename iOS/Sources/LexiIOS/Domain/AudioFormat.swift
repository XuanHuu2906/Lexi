import Foundation

enum AudioFailure: Error, Equatable, Sendable {
    case permissionDenied, unavailable, invalidWAV, tooLarge, tooShort, tooLong, silent, interrupted
    var message: String {
        switch self {
        case .permissionDenied: "Micro chưa được cho phép. Bạn có thể bật quyền Micro cho Lexi trong Cài đặt iPhone."
        case .unavailable: "Chưa thể sử dụng âm thanh. Kiểm tra micro/tai nghe rồi thử lại."
        case .invalidWAV: "Bản ghi chưa đúng định dạng âm thanh. Hãy ghi lại trước khi gửi."
        case .tooLarge: "Bản ghi vượt giới hạn 5 MiB. Hãy ghi một đoạn ngắn hơn."
        case .tooShort: "Bản ghi quá ngắn. Hãy đọc rõ câu mẫu rồi bấm Dừng."
        case .tooLong: "Mỗi bản ghi tối đa 60 giây. Hãy ghi một đoạn ngắn hơn."
        case .silent: "Chưa thu được âm thanh. Kiểm tra micro và thử đọc lại."
        case .interrupted: "Âm thanh đã dừng do cuộc gọi, đổi tai nghe hoặc rời màn hình. Hãy ghi lại khi sẵn sàng."
        }
    }
}

struct WAVInfo: Equatable, Sendable {
    let sampleRate: Int
    let channels: Int
    let bitsPerSample: Int
    let frames: Int
    let byteCount: Int
    var duration: TimeInterval { Double(frames) / Double(sampleRate) }
}

enum WAVValidator {
    static let maxBytes = 5 * 1024 * 1024
    static let maxDuration: TimeInterval = 60

    static func inspect(file: URL) throws -> WAVInfo {
        let size = try file.resourceValues(forKeys: [.fileSizeKey]).fileSize ?? 0
        guard size <= maxBytes else { throw AudioFailure.tooLarge }
        return try inspect(Data(contentsOf: file, options: .mappedIfSafe))
    }

    static func inspect(_ bytes: Data) throws -> WAVInfo {
        guard bytes.count <= maxBytes else { throw AudioFailure.tooLarge }
        let b = [UInt8](bytes)
        func u16(_ p: Int) -> Int { Int(b[p]) | (Int(b[p + 1]) << 8) }
        func u32(_ p: Int) -> Int { u16(p) | (u16(p + 2) << 16) }
        func tag(_ p: Int) -> String { String(bytes: b[p..<(p + 4)], encoding: .ascii) ?? "" }
        guard b.count >= 44, tag(0) == "RIFF", tag(8) == "WAVE", u32(4) + 8 == b.count else { throw AudioFailure.invalidWAV }
        var offset = 12
        var validFormat = false
        var dataRange: Range<Int>?
        while offset + 8 <= b.count {
            let size = u32(offset + 4), start = offset + 8
            guard size <= b.count - start else { throw AudioFailure.invalidWAV }
            switch tag(offset) {
            case "fmt ":
                guard !validFormat, size >= 16, u16(start) == 1, u16(start + 2) == 1,
                      u32(start + 4) == 16_000, u32(start + 8) == 32_000,
                      u16(start + 12) == 2, u16(start + 14) == 16 else { throw AudioFailure.invalidWAV }
                validFormat = true
            case "data":
                guard dataRange == nil, size % 2 == 0 else { throw AudioFailure.invalidWAV }
                dataRange = start..<(start + size)
            default: break // Recorder may include JUNK, LIST, or other RIFF metadata.
            }
            offset = start + size + size % 2
        }
        guard validFormat, let dataRange, offset == b.count else { throw AudioFailure.invalidWAV }
        let info = WAVInfo(sampleRate: 16_000, channels: 1, bitsPerSample: 16,
                           frames: dataRange.count / 2, byteCount: b.count)
        guard info.duration >= 0.3 else { throw AudioFailure.tooShort }
        guard info.duration <= maxDuration + 0.1 else { throw AudioFailure.tooLong }
        guard b[dataRange].contains(where: { $0 != 0 }) else { throw AudioFailure.silent }
        return info
    }
}

struct AudioClip: Sendable {
    let file: URL
    let info: WAVInfo
}

enum AudioTemporaryFiles {
    static var directory: URL { FileManager.default.temporaryDirectory.appendingPathComponent("LexiAudio", isDirectory: true) }
    static func create(extension suffix: String) throws -> URL {
        try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
        let file = directory.appendingPathComponent(UUID().uuidString).appendingPathExtension(suffix)
        guard FileManager.default.createFile(atPath: file.path, contents: nil) else { throw AudioFailure.unavailable }
        #if os(iOS)
        try FileManager.default.setAttributes([.protectionKey: FileProtectionType.complete], ofItemAtPath: file.path)
        #endif
        return file
    }
    static func remove(_ file: URL?) {
        guard let file, file.deletingLastPathComponent().standardizedFileURL == directory.standardizedFileURL else { return }
        try? FileManager.default.removeItem(at: file)
    }
    // Called once on app launch to remove files left by a terminated process.
    static func clearAbandoned() {
        for file in (try? FileManager.default.contentsOfDirectory(at: directory, includingPropertiesForKeys: nil)) ?? [] {
            guard UUID(uuidString: file.deletingPathExtension().lastPathComponent) != nil,
                  ["wav", "multipart"].contains(file.pathExtension) else { continue }
            remove(file)
        }
    }
}
