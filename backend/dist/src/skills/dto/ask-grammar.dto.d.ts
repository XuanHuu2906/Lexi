export declare class ChatTurnDto {
    role: 'user' | 'assistant';
    content: string;
}
export declare class AskGrammarDto {
    history?: ChatTurnDto[];
    question: string;
}
