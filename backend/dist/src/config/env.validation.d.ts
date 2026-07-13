export declare enum NodeEnv {
    Development = "development",
    Production = "production",
    Test = "test"
}
export declare class EnvironmentVariables {
    NODE_ENV: NodeEnv;
    PORT: number;
    CORS_ORIGIN: string;
    DATABASE_URL: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    JWT_ACCESS_EXPIRES: string;
    JWT_REFRESH_EXPIRES_DAYS: number;
    AI_API_KEY?: string;
    AI_MODEL?: string;
    AI_BASE_URL?: string;
    RESEND_KEY?: string;
    EMAIL_FROM?: string;
    VAPID_PUBLIC_KEY?: string;
    VAPID_PRIVATE_KEY?: string;
    VAPID_SUBJECT?: string;
    REDIS_URL?: string;
}
export declare function validateEnv(config: Record<string, unknown>): EnvironmentVariables;
