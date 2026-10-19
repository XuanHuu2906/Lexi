import Foundation
import Observation

@MainActor @Observable
final class AIFeatures {
    let usage = AIUsage()
    let tutor: AIChatViewModel
    let grammarQA: AIChatViewModel
    let writing: WritingViewModel
    let context: ContextViewModel
    let grammar: GrammarViewModel
    let conversation: ConversationViewModel
    init(api: LexiAPI, userID: String) {
        tutor = AIChatViewModel(kind: .tutor, api: api.aiText, usage: usage)
        grammarQA = AIChatViewModel(kind: .grammar, api: api.aiText, usage: usage)
        writing = WritingViewModel(api: api.aiText, usage: usage)
        context = ContextViewModel(api: api.aiText, usage: usage)
        grammar = GrammarViewModel(api: api.grammar, usage: usage)
        conversation = ConversationViewModel(api: api.conversation,
            store: ConversationCheckpointStore(defaults: .standard,
                namespace: api.client.environment.apiBaseURL.absoluteString + "|" + userID), usage: usage)
    }
    func suspend() {
        for gate in [tutor.request, grammarQA.request, writing.request, context.request, grammar.request, grammar.read, conversation.request] { gate.cancel() }
    }
    func deactivate(clear: Bool) {
        tutor.deactivate(); grammarQA.deactivate(); writing.deactivate(); context.deactivate(); grammar.deactivate()
        conversation.deactivate(clear: clear)
    }
}
