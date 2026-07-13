import { QuizStatus } from '../../generated/prisma/client';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { GenerateQuizDto, SaveQuizProgressDto, SubmitQuizDto } from './dto/quiz.dto';
export declare class QuizService {
    private readonly prisma;
    private readonly ai;
    constructor(prisma: PrismaService, ai: AiService);
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
    get(userId: string, id: string): Promise<{
        quizId: string;
        total: number;
        score: number;
        status: QuizStatus;
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
    private findOwned;
    private stored;
    private selectCycleWords;
    private selectBySrsPriority;
    private shuffle;
    private clientQuestions;
}
