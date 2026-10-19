import Foundation

protocol FlashcardServing: Sendable {
    func flashcards(mode: FlashcardMode, scope: FlashcardScope, limit: Int,
                    excluding: Set<String>) async throws -> FlashcardSet
}

protocol FlashcardWordListing: Sendable {
    func list(_ query: WordsQuery) async throws -> WordPage
}
extension WordsAPI: FlashcardWordListing {}

// Presentation-only practice decks. Read the paginated notebook without changing SRS.
// The deployed /review/flashcards endpoint has no cursor/exclusions and repeats its first ten words.
struct NotebookFlashcards: FlashcardServing {
    let words: any FlashcardWordListing
    var cache: OfflineNotebookCache? = nil

    func flashcards(mode: FlashcardMode, scope: FlashcardScope, limit: Int,
                    excluding: Set<String>) async throws -> FlashcardSet {
        guard (1...50).contains(limit) else { throw HTTPError.invalidRequest }
        do {
            let all = try await fetchNotebook()
            // Only save after ALL pages passed validation. A failed write must
            // never block normal online practice (e.g. notebook > cache budget).
            try? await cache?.save(all)
            return Self.makeDeck(words: all, mode: mode, scope: scope,
                                 limit: limit, excluding: excluding)
        } catch {
            guard !Task.isCancelled, Self.isConnectivityFailure(error),
                  let snapshot = await cache?.load() else { throw error }
            return Self.makeDeck(words: snapshot.words, mode: mode, scope: scope,
                                 limit: limit, excluding: excluding, offline: true)
        }
    }

    static func isConnectivityFailure(_ error: any Error) -> Bool {
        switch error as? HTTPError { case .network, .timeout: true; default: false }
    }

    func fetchNotebook() async throws -> [Word] {
        var all: [Word] = []
        var ids = Set<String>()
        var query = WordsQuery(sort: .oldest, limit: 100)
        while true {
            try Task.checkCancellation()
            let page = try await words.list(query)
            try Task.checkCancellation()
            guard page.page == query.page, page.limit == query.limit, page.total >= 0,
                  page.items.count <= query.limit else { throw HTTPError.invalidResponse }
            let fresh = page.items.filter { ids.insert($0.id).inserted }
            all += fresh
            if page.page * page.limit >= page.total { break }
            // Fail instead of showing a false end-of-round if pagination stops advancing.
            guard !fresh.isEmpty else { throw HTTPError.invalidResponse }
            query.page += 1
        }
        return all
    }

    static func makeDeck(words: [Word], mode: FlashcardMode, scope: FlashcardScope,
                         limit: Int, excluding: Set<String>, now: Date = .now,
                         offline: Bool = false) -> FlashcardSet {
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = TimeZone(secondsFromGMT: 7 * 3600)!
        let today = calendar.startOfDay(for: now)
        let tomorrow = calendar.date(byAdding: .day, value: 1, to: today)!
        let addedToday = words.filter {
            guard let date = APIDate.parse($0.createdAt) else { return false }
            return date >= today && date < tomorrow
        }
        let servedScope: FlashcardScope = scope == .today && !addedToday.isEmpty ? .today : .due
        let pool = servedScope == .today ? addedToday : words
        let selected = pool.filter { !excluding.contains($0.id) }.map { word in
            (word: word, due: word.nextReviewAt.flatMap(APIDate.parse) ?? .distantFuture,
             created: APIDate.parse(word.createdAt) ?? .distantPast)
        }.sorted { lhs, rhs in
            if servedScope == .due {
                if lhs.due != rhs.due { return lhs.due < rhs.due }
            }
            return lhs.created == rhs.created ? lhs.word.id < rhs.word.id : lhs.created > rhs.created
        }.prefix(limit).map(\.word)
        let meanings = Array(Set(words.map(\.meaning)))
        let cards = selected.map { word in
            let choices = mode == .guess || mode == .listen
            let options = choices ? ([word.meaning] + meanings.filter { $0 != word.meaning }.shuffled().prefix(3)).shuffled() : nil
            let example = word.examples.first { $0.range(of: word.word, options: .caseInsensitive) != nil }
            var cloze = example
            if let range = cloze?.range(of: word.word, options: .caseInsensitive) { cloze?.replaceSubrange(range, with: "_____") }
            return FlashcardSet.Card(wordId: word.id, term: word.word, meaning: word.meaning,
                                     phonetic: word.phonetic, examples: word.examples, options: options,
                                     answerIndex: options?.firstIndex(of: word.meaning), cloze: mode == .fill ? cloze : nil)
        }
        return FlashcardSet(mode: mode, scope: servedScope, count: cards.count,
                            cards: cards, offline: offline)
    }
}
