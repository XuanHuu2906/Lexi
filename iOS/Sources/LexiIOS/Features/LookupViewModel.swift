import Foundation
import Observation

extension LookupResult {
    var wordInput: WordInput {
        WordInput(word: term, meaning: meaning, phonetic: phonetic, pos: partOfSpeech,
                  note: contextNote, examples: examples.map { "\($0.en) — \($0.vi)" },
                  synonyms: synonyms, antonyms: antonyms)
    }
}

@MainActor @Observable
final class LookupViewModel {
    var term = "" { didSet { if term != oldValue { result = nil } } }
    var level: CEFRLevel = .b1 { didSet { if level != oldValue { result = nil } } }
    private(set) var result: LookupResult?
    private(set) var busy = false
    private(set) var feedback: FeatureFeedback?
    private let api: any WordServing
    init(api: any WordServing) { self.api = api }

    func lookup() async {
        guard !busy, feedback?.canRetry() != false else { return }
        guard !term.trimmed.isEmpty, term.trimmed.utf16.count <= 100 else {
            feedback = FeatureFeedback(message: "Nhập từ cần tra, tối đa 100 ký tự."); return
        }
        let requested = term; let requestedLevel = level
        busy = true; feedback = nil; result = nil; defer { busy = false }
        do {
            let value = try await api.lookup(term: requested.trimmed, level: requestedLevel)
            try Task.checkCancellation()
            guard term == requested, level == requestedLevel else { return }
            result = value
        } catch { if !isCancellation(error) { feedback = FeatureFeedback(error) } }
    }
}
