import { GenerateQuizDto, SaveQuizProgressDto, SubmitQuizDto } from './dto/quiz.dto';
import { QuizService } from './quiz.service';
export declare class QuizController {
    private readonly quizService;
    constructor(quizService: QuizService);
    generate(userId: string, dto: GenerateQuizDto): Promise<{
        quizId: string;
        total: number;
        questions: {
            index: number;
            term: string;
            question: string;
            options: string[];
        }[];
    }>;
    submit(userId: string, dto: SubmitQuizDto): Promise<{
        quizId: string;
        score: number;
        total: number;
        results: {
            index: number;
            correct: boolean;
            yourAnswer: number;
            answerIndex: number;
            explanation: string;
        }[];
    }>;
    get(userId: string, id: string): Promise<{
        quizId: string;
        total: number;
        score: number;
        status: import("../../generated/prisma/enums").QuizStatus;
        questions: {
            answerIndex?: number | undefined;
            explanation?: string | undefined;
            index: number;
            term: string;
            question: string;
            options: string[];
            userAnswer: number | null;
        }[];
    }>;
    saveProgress(userId: string, id: string, dto: SaveQuizProgressDto): Promise<{
        saved: boolean;
    }>;
}
