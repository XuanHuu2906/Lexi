#if os(iOS)
import AVFoundation
import Foundation
import Observation

@MainActor final class MicrophonePermissionService: MicrophonePermissionProviding {
    func request() async -> Bool { await AVAudioApplication.requestRecordPermission() }
}

// Single audio owner across TTS and recording/playback; never restart after an interruption.
@MainActor final class AudioSessionCoordinator: NSObject {
    static let shared = AudioSessionCoordinator()
    private var owner: UUID?
    private var stopCurrent: (() -> Void)?
    private var observers: [NSObjectProtocol] = []
    override private init() {
        super.init()
        observers.append(NotificationCenter.default.addObserver(forName: AVAudioSession.interruptionNotification,
            object: nil, queue: .main) { [weak self] notification in
                let began = (notification.userInfo?[AVAudioSessionInterruptionTypeKey] as? UInt) == AVAudioSession.InterruptionType.began.rawValue
                if began { Task { @MainActor in self?.stopAll() } }
            })
        observers.append(NotificationCenter.default.addObserver(forName: AVAudioSession.routeChangeNotification,
            object: nil, queue: .main) { [weak self] notification in
                let reason = notification.userInfo?[AVAudioSessionRouteChangeReasonKey] as? UInt
                if reason == AVAudioSession.RouteChangeReason.oldDeviceUnavailable.rawValue {
                    Task { @MainActor in self?.stopAll() }
                }
            })
        observers.append(NotificationCenter.default.addObserver(forName: AVAudioSession.mediaServicesWereResetNotification,
            object: nil, queue: .main) { [weak self] _ in Task { @MainActor in self?.stopAll() } })
    }
    func activate(owner: UUID, recording: Bool, stop: @escaping () -> Void) throws {
        stopAll()
        let session = AVAudioSession.sharedInstance()
        if recording {
            try session.setCategory(.playAndRecord, mode: .default, options: [.defaultToSpeaker, .allowBluetoothHFP])
        } else { try session.setCategory(.playback, mode: .spokenAudio) }
        try session.setActive(true)
        self.owner = owner; stopCurrent = stop
    }
    func release(owner: UUID) {
        guard self.owner == owner else { return }
        self.owner = nil; stopCurrent = nil
        try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
    }
    func stopAll() {
        let stop = stopCurrent; stopCurrent = nil; owner = nil; stop?()
        try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
    }
}

@MainActor @Observable
final class NativeAudioRecorder: NSObject, AudioRecording, AVAudioRecorderDelegate, AVAudioPlayerDelegate {
    private let owner = UUID()
    private var recorder: AVAudioRecorder?
    private var player: AVAudioPlayer?
    private var file: URL?
    private var monitor: Task<Void, Never>?
    private(set) var elapsed: TimeInterval = 0
    private(set) var playing = false
    var onFinish: ((Result<AudioClip, AudioFailure>) -> Void)?

    func start() throws {
        discard()
        do {
            try AudioSessionCoordinator.shared.activate(owner: owner, recording: true) { [weak self] in self?.interrupted() }
            let url = try AudioTemporaryFiles.create(extension: "wav"); file = url
            let recording = try AVAudioRecorder(url: url, settings: [
                AVFormatIDKey: kAudioFormatLinearPCM, AVSampleRateKey: 16_000,
                AVNumberOfChannelsKey: 1, AVLinearPCMBitDepthKey: 16,
                AVLinearPCMIsFloatKey: false, AVLinearPCMIsBigEndianKey: false,
            ])
            recording.delegate = self
            guard recording.prepareToRecord(), recording.record(forDuration: WAVValidator.maxDuration) else { throw AudioFailure.unavailable }
            recorder = recording; elapsed = 0
            monitor = Task { [weak self] in
                while !Task.isCancelled {
                    do { try await Task.sleep(for: .milliseconds(200)) } catch { return }
                    guard let self, let recorder = self.recorder else { return }
                    self.elapsed = recorder.currentTime
                }
            }
        } catch { discard(); throw AudioFailure.unavailable }
    }
    func stop() {
        guard let recorder else { return }
        elapsed = recorder.currentTime
        recorder.stop(); self.recorder = nil; monitor?.cancel(); monitor = nil
        AudioSessionCoordinator.shared.release(owner: owner)
        guard let file else { onFinish?(.failure(.unavailable)); return }
        self.file = nil
        do { onFinish?(.success(AudioClip(file: file, info: try WAVValidator.inspect(file: file)))) }
        catch { AudioTemporaryFiles.remove(file); onFinish?(.failure(error as? AudioFailure ?? .invalidWAV)) }
    }
    func discard() {
        monitor?.cancel(); monitor = nil
        recorder?.delegate = nil; recorder?.stop(); recorder = nil
        stopPlayback(); AudioTemporaryFiles.remove(file); file = nil
        AudioSessionCoordinator.shared.release(owner: owner)
    }
    private func interrupted() {
        let recording = recorder != nil
        discard()
        if recording { onFinish?(.failure(.interrupted)) }
    }
    func play(_ clip: AudioClip) throws {
        stopPlayback()
        try AudioSessionCoordinator.shared.activate(owner: owner, recording: false) { [weak self] in self?.stopPlayback() }
        do {
            let player = try AVAudioPlayer(contentsOf: clip.file)
            player.delegate = self; self.player = player
            guard player.prepareToPlay(), player.play() else { throw AudioFailure.unavailable }
            playing = true
        } catch { stopPlayback(); throw error }
    }
    func stopPlayback() {
        player?.delegate = nil; player?.stop(); player = nil; playing = false
        if recorder == nil { AudioSessionCoordinator.shared.release(owner: owner) }
    }
    nonisolated func audioRecorderDidFinishRecording(_ recorder: AVAudioRecorder, successfully flag: Bool) {
        let id = ObjectIdentifier(recorder)
        Task { @MainActor [weak self] in
            guard let self, let current = self.recorder, ObjectIdentifier(current) == id else { return }
            if flag { self.stop() } else { self.discard(); self.onFinish?(.failure(.unavailable)) }
        }
    }
    nonisolated func audioRecorderEncodeErrorDidOccur(_ recorder: AVAudioRecorder, error: (any Error)?) {
        let id = ObjectIdentifier(recorder)
        Task { @MainActor [weak self] in
            guard let self, let current = self.recorder, ObjectIdentifier(current) == id else { return }
            self.discard(); self.onFinish?(.failure(.unavailable))
        }
    }
    nonisolated func audioPlayerDidFinishPlaying(_ player: AVAudioPlayer, successfully flag: Bool) {
        let id = ObjectIdentifier(player)
        Task { @MainActor [weak self] in
            guard let self, let current = self.player, ObjectIdentifier(current) == id else { return }
            self.stopPlayback()
        }
    }
}
#endif
