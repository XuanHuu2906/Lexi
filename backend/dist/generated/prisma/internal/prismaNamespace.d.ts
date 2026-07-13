import * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../models";
import { type PrismaClient } from "./class";
export type * from '../models';
export type DMMF = typeof runtime.DMMF;
export type PrismaPromise<T> = runtime.Types.Public.PrismaPromise<T>;
export declare const PrismaClientKnownRequestError: typeof runtime.PrismaClientKnownRequestError;
export type PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
export declare const PrismaClientUnknownRequestError: typeof runtime.PrismaClientUnknownRequestError;
export type PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
export declare const PrismaClientRustPanicError: typeof runtime.PrismaClientRustPanicError;
export type PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
export declare const PrismaClientInitializationError: typeof runtime.PrismaClientInitializationError;
export type PrismaClientInitializationError = runtime.PrismaClientInitializationError;
export declare const PrismaClientValidationError: typeof runtime.PrismaClientValidationError;
export type PrismaClientValidationError = runtime.PrismaClientValidationError;
export declare const sql: typeof runtime.sqltag;
export declare const empty: runtime.Sql;
export declare const join: typeof runtime.join;
export declare const raw: typeof runtime.raw;
export declare const Sql: typeof runtime.Sql;
export type Sql = runtime.Sql;
export declare const Decimal: typeof runtime.Decimal;
export type Decimal = runtime.Decimal;
export type DecimalJsLike = runtime.DecimalJsLike;
export type Extension = runtime.Types.Extensions.UserArgs;
export declare const getExtensionContext: typeof runtime.Extensions.getExtensionContext;
export type Args<T, F extends runtime.Operation> = runtime.Types.Public.Args<T, F>;
export type Payload<T, F extends runtime.Operation = never> = runtime.Types.Public.Payload<T, F>;
export type Result<T, A, F extends runtime.Operation> = runtime.Types.Public.Result<T, A, F>;
export type Exact<A, W> = runtime.Types.Public.Exact<A, W>;
export type PrismaVersion = {
    client: string;
    engine: string;
};
export declare const prismaVersion: PrismaVersion;
export type Bytes = runtime.Bytes;
export type JsonObject = runtime.JsonObject;
export type JsonArray = runtime.JsonArray;
export type JsonValue = runtime.JsonValue;
export type InputJsonObject = runtime.InputJsonObject;
export type InputJsonArray = runtime.InputJsonArray;
export type InputJsonValue = runtime.InputJsonValue;
export declare const NullTypes: {
    DbNull: (new (secret: never) => typeof runtime.DbNull);
    JsonNull: (new (secret: never) => typeof runtime.JsonNull);
    AnyNull: (new (secret: never) => typeof runtime.AnyNull);
};
export declare const DbNull: runtime.DbNullClass;
export declare const JsonNull: runtime.JsonNullClass;
export declare const AnyNull: runtime.AnyNullClass;
type SelectAndInclude = {
    select: any;
    include: any;
};
type SelectAndOmit = {
    select: any;
    omit: any;
};
type Prisma__Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};
export type Enumerable<T> = T | Array<T>;
export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
};
export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
} & (T extends SelectAndInclude ? 'Please either choose `select` or `include`.' : T extends SelectAndOmit ? 'Please either choose `select` or `omit`.' : {});
export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
} & K;
type Without<T, U> = {
    [P in Exclude<keyof T, keyof U>]?: never;
};
export type XOR<T, U> = T extends object ? U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : U : T;
type IsObject<T extends any> = T extends Array<any> ? False : T extends Date ? False : T extends Uint8Array ? False : T extends BigInt ? False : T extends object ? True : False;
export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T;
type __Either<O extends object, K extends Key> = Omit<O, K> & {
    [P in K]: Prisma__Pick<O, P & keyof O>;
}[K];
type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>;
type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>;
type _Either<O extends object, K extends Key, strict extends Boolean> = {
    1: EitherStrict<O, K>;
    0: EitherLoose<O, K>;
}[strict];
export type Either<O extends object, K extends Key, strict extends Boolean = 1> = O extends unknown ? _Either<O, K, strict> : never;
export type Union = any;
export type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K];
} & {};
export type IntersectOf<U extends Union> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
export type Overwrite<O extends object, O1 extends object> = {
    [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
} & {};
type _Merge<U extends object> = IntersectOf<Overwrite<U, {
    [K in keyof U]-?: At<U, K>;
}>>;
type Key = string | number | symbol;
type AtStrict<O extends object, K extends Key> = O[K & keyof O];
type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
    1: AtStrict<O, K>;
    0: AtLoose<O, K>;
}[strict];
export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
} & {};
export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
} & {};
type _Record<K extends keyof any, T> = {
    [P in K]: T;
};
type NoExpand<T> = T extends unknown ? T : never;
export type AtLeast<O extends object, K extends string> = NoExpand<O extends unknown ? (K extends keyof O ? {
    [P in K]: O[P];
} & O : O) | {
    [P in keyof O as P extends K ? P : never]-?: O[P];
} & O : never>;
type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;
export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;
export type Boolean = True | False;
export type True = 1;
export type False = 0;
export type Not<B extends Boolean> = {
    0: 1;
    1: 0;
}[B];
export type Extends<A1 extends any, A2 extends any> = [A1] extends [never] ? 0 : A1 extends A2 ? 1 : 0;
export type Has<U extends Union, U1 extends Union> = Not<Extends<Exclude<U1, U>, U1>>;
export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
        0: 0;
        1: 1;
    };
    1: {
        0: 1;
        1: 1;
    };
}[B1][B2];
export type Keys<U extends Union> = U extends unknown ? keyof U : never;
export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O ? O[P] : never;
} : never;
type FieldPaths<T, U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>> = IsObject<T> extends True ? U : T;
export type GetHavingFields<T> = {
    [K in keyof T]: Or<Or<Extends<'OR', K>, Extends<'AND', K>>, Extends<'NOT', K>> extends True ? T[K] extends infer TK ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never> : never : {} extends FieldPaths<T[K]> ? never : K;
}[keyof T];
type _TupleToUnion<T> = T extends (infer E)[] ? E : never;
type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>;
export type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T;
export type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>;
export type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T;
export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>;
type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>;
export declare const ModelName: {
    readonly User: "User";
    readonly RefreshToken: "RefreshToken";
    readonly Setting: "Setting";
    readonly Word: "Word";
    readonly SrsData: "SrsData";
    readonly ReviewLog: "ReviewLog";
    readonly ToeicWord: "ToeicWord";
    readonly ConversationScenario: "ConversationScenario";
    readonly AuditLog: "AuditLog";
    readonly GrammarRule: "GrammarRule";
    readonly QuizResult: "QuizResult";
    readonly ConversationLog: "ConversationLog";
    readonly ChatThread: "ChatThread";
    readonly Streak: "Streak";
    readonly Badge: "Badge";
    readonly UserBadge: "UserBadge";
    readonly Notification: "Notification";
    readonly PushSubscription: "PushSubscription";
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export interface TypeMapCb<GlobalOmitOptions = {}> extends runtime.Types.Utils.Fn<{
    extArgs: runtime.Types.Extensions.InternalArgs;
}, runtime.Types.Utils.Record<string, any>> {
    returns: TypeMap<this['params']['extArgs'], GlobalOmitOptions>;
}
export type TypeMap<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
        omit: GlobalOmitOptions;
    };
    meta: {
        modelProps: "user" | "refreshToken" | "setting" | "word" | "srsData" | "reviewLog" | "toeicWord" | "conversationScenario" | "auditLog" | "grammarRule" | "quizResult" | "conversationLog" | "chatThread" | "streak" | "badge" | "userBadge" | "notification" | "pushSubscription";
        txIsolationLevel: TransactionIsolationLevel;
    };
    model: {
        User: {
            payload: Prisma.$UserPayload<ExtArgs>;
            fields: Prisma.UserFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.UserFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                findFirst: {
                    args: Prisma.UserFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                findMany: {
                    args: Prisma.UserFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>[];
                };
                create: {
                    args: Prisma.UserCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                createMany: {
                    args: Prisma.UserCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>[];
                };
                delete: {
                    args: Prisma.UserDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                update: {
                    args: Prisma.UserUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                deleteMany: {
                    args: Prisma.UserDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.UserUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>[];
                };
                upsert: {
                    args: Prisma.UserUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                aggregate: {
                    args: Prisma.UserAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateUser>;
                };
                groupBy: {
                    args: Prisma.UserGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.UserGroupByOutputType>[];
                };
                count: {
                    args: Prisma.UserCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.UserCountAggregateOutputType> | number;
                };
            };
        };
        RefreshToken: {
            payload: Prisma.$RefreshTokenPayload<ExtArgs>;
            fields: Prisma.RefreshTokenFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.RefreshTokenFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RefreshTokenPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.RefreshTokenFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RefreshTokenPayload>;
                };
                findFirst: {
                    args: Prisma.RefreshTokenFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RefreshTokenPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.RefreshTokenFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RefreshTokenPayload>;
                };
                findMany: {
                    args: Prisma.RefreshTokenFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RefreshTokenPayload>[];
                };
                create: {
                    args: Prisma.RefreshTokenCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RefreshTokenPayload>;
                };
                createMany: {
                    args: Prisma.RefreshTokenCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.RefreshTokenCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RefreshTokenPayload>[];
                };
                delete: {
                    args: Prisma.RefreshTokenDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RefreshTokenPayload>;
                };
                update: {
                    args: Prisma.RefreshTokenUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RefreshTokenPayload>;
                };
                deleteMany: {
                    args: Prisma.RefreshTokenDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.RefreshTokenUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.RefreshTokenUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RefreshTokenPayload>[];
                };
                upsert: {
                    args: Prisma.RefreshTokenUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RefreshTokenPayload>;
                };
                aggregate: {
                    args: Prisma.RefreshTokenAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateRefreshToken>;
                };
                groupBy: {
                    args: Prisma.RefreshTokenGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RefreshTokenGroupByOutputType>[];
                };
                count: {
                    args: Prisma.RefreshTokenCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RefreshTokenCountAggregateOutputType> | number;
                };
            };
        };
        Setting: {
            payload: Prisma.$SettingPayload<ExtArgs>;
            fields: Prisma.SettingFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.SettingFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SettingPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.SettingFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SettingPayload>;
                };
                findFirst: {
                    args: Prisma.SettingFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SettingPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.SettingFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SettingPayload>;
                };
                findMany: {
                    args: Prisma.SettingFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SettingPayload>[];
                };
                create: {
                    args: Prisma.SettingCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SettingPayload>;
                };
                createMany: {
                    args: Prisma.SettingCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.SettingCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SettingPayload>[];
                };
                delete: {
                    args: Prisma.SettingDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SettingPayload>;
                };
                update: {
                    args: Prisma.SettingUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SettingPayload>;
                };
                deleteMany: {
                    args: Prisma.SettingDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.SettingUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.SettingUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SettingPayload>[];
                };
                upsert: {
                    args: Prisma.SettingUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SettingPayload>;
                };
                aggregate: {
                    args: Prisma.SettingAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateSetting>;
                };
                groupBy: {
                    args: Prisma.SettingGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.SettingGroupByOutputType>[];
                };
                count: {
                    args: Prisma.SettingCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.SettingCountAggregateOutputType> | number;
                };
            };
        };
        Word: {
            payload: Prisma.$WordPayload<ExtArgs>;
            fields: Prisma.WordFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.WordFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WordPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.WordFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WordPayload>;
                };
                findFirst: {
                    args: Prisma.WordFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WordPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.WordFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WordPayload>;
                };
                findMany: {
                    args: Prisma.WordFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WordPayload>[];
                };
                create: {
                    args: Prisma.WordCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WordPayload>;
                };
                createMany: {
                    args: Prisma.WordCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.WordCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WordPayload>[];
                };
                delete: {
                    args: Prisma.WordDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WordPayload>;
                };
                update: {
                    args: Prisma.WordUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WordPayload>;
                };
                deleteMany: {
                    args: Prisma.WordDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.WordUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.WordUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WordPayload>[];
                };
                upsert: {
                    args: Prisma.WordUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WordPayload>;
                };
                aggregate: {
                    args: Prisma.WordAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateWord>;
                };
                groupBy: {
                    args: Prisma.WordGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.WordGroupByOutputType>[];
                };
                count: {
                    args: Prisma.WordCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.WordCountAggregateOutputType> | number;
                };
            };
        };
        SrsData: {
            payload: Prisma.$SrsDataPayload<ExtArgs>;
            fields: Prisma.SrsDataFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.SrsDataFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SrsDataPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.SrsDataFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SrsDataPayload>;
                };
                findFirst: {
                    args: Prisma.SrsDataFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SrsDataPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.SrsDataFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SrsDataPayload>;
                };
                findMany: {
                    args: Prisma.SrsDataFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SrsDataPayload>[];
                };
                create: {
                    args: Prisma.SrsDataCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SrsDataPayload>;
                };
                createMany: {
                    args: Prisma.SrsDataCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.SrsDataCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SrsDataPayload>[];
                };
                delete: {
                    args: Prisma.SrsDataDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SrsDataPayload>;
                };
                update: {
                    args: Prisma.SrsDataUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SrsDataPayload>;
                };
                deleteMany: {
                    args: Prisma.SrsDataDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.SrsDataUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.SrsDataUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SrsDataPayload>[];
                };
                upsert: {
                    args: Prisma.SrsDataUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SrsDataPayload>;
                };
                aggregate: {
                    args: Prisma.SrsDataAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateSrsData>;
                };
                groupBy: {
                    args: Prisma.SrsDataGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.SrsDataGroupByOutputType>[];
                };
                count: {
                    args: Prisma.SrsDataCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.SrsDataCountAggregateOutputType> | number;
                };
            };
        };
        ReviewLog: {
            payload: Prisma.$ReviewLogPayload<ExtArgs>;
            fields: Prisma.ReviewLogFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ReviewLogFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ReviewLogPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ReviewLogFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ReviewLogPayload>;
                };
                findFirst: {
                    args: Prisma.ReviewLogFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ReviewLogPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ReviewLogFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ReviewLogPayload>;
                };
                findMany: {
                    args: Prisma.ReviewLogFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ReviewLogPayload>[];
                };
                create: {
                    args: Prisma.ReviewLogCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ReviewLogPayload>;
                };
                createMany: {
                    args: Prisma.ReviewLogCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ReviewLogCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ReviewLogPayload>[];
                };
                delete: {
                    args: Prisma.ReviewLogDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ReviewLogPayload>;
                };
                update: {
                    args: Prisma.ReviewLogUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ReviewLogPayload>;
                };
                deleteMany: {
                    args: Prisma.ReviewLogDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ReviewLogUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ReviewLogUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ReviewLogPayload>[];
                };
                upsert: {
                    args: Prisma.ReviewLogUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ReviewLogPayload>;
                };
                aggregate: {
                    args: Prisma.ReviewLogAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateReviewLog>;
                };
                groupBy: {
                    args: Prisma.ReviewLogGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ReviewLogGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ReviewLogCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ReviewLogCountAggregateOutputType> | number;
                };
            };
        };
        ToeicWord: {
            payload: Prisma.$ToeicWordPayload<ExtArgs>;
            fields: Prisma.ToeicWordFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ToeicWordFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ToeicWordPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ToeicWordFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ToeicWordPayload>;
                };
                findFirst: {
                    args: Prisma.ToeicWordFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ToeicWordPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ToeicWordFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ToeicWordPayload>;
                };
                findMany: {
                    args: Prisma.ToeicWordFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ToeicWordPayload>[];
                };
                create: {
                    args: Prisma.ToeicWordCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ToeicWordPayload>;
                };
                createMany: {
                    args: Prisma.ToeicWordCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ToeicWordCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ToeicWordPayload>[];
                };
                delete: {
                    args: Prisma.ToeicWordDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ToeicWordPayload>;
                };
                update: {
                    args: Prisma.ToeicWordUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ToeicWordPayload>;
                };
                deleteMany: {
                    args: Prisma.ToeicWordDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ToeicWordUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ToeicWordUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ToeicWordPayload>[];
                };
                upsert: {
                    args: Prisma.ToeicWordUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ToeicWordPayload>;
                };
                aggregate: {
                    args: Prisma.ToeicWordAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateToeicWord>;
                };
                groupBy: {
                    args: Prisma.ToeicWordGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ToeicWordGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ToeicWordCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ToeicWordCountAggregateOutputType> | number;
                };
            };
        };
        ConversationScenario: {
            payload: Prisma.$ConversationScenarioPayload<ExtArgs>;
            fields: Prisma.ConversationScenarioFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ConversationScenarioFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ConversationScenarioPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ConversationScenarioFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ConversationScenarioPayload>;
                };
                findFirst: {
                    args: Prisma.ConversationScenarioFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ConversationScenarioPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ConversationScenarioFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ConversationScenarioPayload>;
                };
                findMany: {
                    args: Prisma.ConversationScenarioFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ConversationScenarioPayload>[];
                };
                create: {
                    args: Prisma.ConversationScenarioCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ConversationScenarioPayload>;
                };
                createMany: {
                    args: Prisma.ConversationScenarioCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ConversationScenarioCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ConversationScenarioPayload>[];
                };
                delete: {
                    args: Prisma.ConversationScenarioDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ConversationScenarioPayload>;
                };
                update: {
                    args: Prisma.ConversationScenarioUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ConversationScenarioPayload>;
                };
                deleteMany: {
                    args: Prisma.ConversationScenarioDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ConversationScenarioUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ConversationScenarioUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ConversationScenarioPayload>[];
                };
                upsert: {
                    args: Prisma.ConversationScenarioUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ConversationScenarioPayload>;
                };
                aggregate: {
                    args: Prisma.ConversationScenarioAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateConversationScenario>;
                };
                groupBy: {
                    args: Prisma.ConversationScenarioGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ConversationScenarioGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ConversationScenarioCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ConversationScenarioCountAggregateOutputType> | number;
                };
            };
        };
        AuditLog: {
            payload: Prisma.$AuditLogPayload<ExtArgs>;
            fields: Prisma.AuditLogFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.AuditLogFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuditLogPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.AuditLogFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuditLogPayload>;
                };
                findFirst: {
                    args: Prisma.AuditLogFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuditLogPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.AuditLogFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuditLogPayload>;
                };
                findMany: {
                    args: Prisma.AuditLogFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuditLogPayload>[];
                };
                create: {
                    args: Prisma.AuditLogCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuditLogPayload>;
                };
                createMany: {
                    args: Prisma.AuditLogCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.AuditLogCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuditLogPayload>[];
                };
                delete: {
                    args: Prisma.AuditLogDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuditLogPayload>;
                };
                update: {
                    args: Prisma.AuditLogUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuditLogPayload>;
                };
                deleteMany: {
                    args: Prisma.AuditLogDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.AuditLogUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.AuditLogUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuditLogPayload>[];
                };
                upsert: {
                    args: Prisma.AuditLogUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuditLogPayload>;
                };
                aggregate: {
                    args: Prisma.AuditLogAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateAuditLog>;
                };
                groupBy: {
                    args: Prisma.AuditLogGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AuditLogGroupByOutputType>[];
                };
                count: {
                    args: Prisma.AuditLogCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AuditLogCountAggregateOutputType> | number;
                };
            };
        };
        GrammarRule: {
            payload: Prisma.$GrammarRulePayload<ExtArgs>;
            fields: Prisma.GrammarRuleFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.GrammarRuleFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GrammarRulePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.GrammarRuleFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GrammarRulePayload>;
                };
                findFirst: {
                    args: Prisma.GrammarRuleFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GrammarRulePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.GrammarRuleFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GrammarRulePayload>;
                };
                findMany: {
                    args: Prisma.GrammarRuleFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GrammarRulePayload>[];
                };
                create: {
                    args: Prisma.GrammarRuleCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GrammarRulePayload>;
                };
                createMany: {
                    args: Prisma.GrammarRuleCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.GrammarRuleCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GrammarRulePayload>[];
                };
                delete: {
                    args: Prisma.GrammarRuleDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GrammarRulePayload>;
                };
                update: {
                    args: Prisma.GrammarRuleUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GrammarRulePayload>;
                };
                deleteMany: {
                    args: Prisma.GrammarRuleDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.GrammarRuleUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.GrammarRuleUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GrammarRulePayload>[];
                };
                upsert: {
                    args: Prisma.GrammarRuleUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GrammarRulePayload>;
                };
                aggregate: {
                    args: Prisma.GrammarRuleAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateGrammarRule>;
                };
                groupBy: {
                    args: Prisma.GrammarRuleGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.GrammarRuleGroupByOutputType>[];
                };
                count: {
                    args: Prisma.GrammarRuleCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.GrammarRuleCountAggregateOutputType> | number;
                };
            };
        };
        QuizResult: {
            payload: Prisma.$QuizResultPayload<ExtArgs>;
            fields: Prisma.QuizResultFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.QuizResultFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$QuizResultPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.QuizResultFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$QuizResultPayload>;
                };
                findFirst: {
                    args: Prisma.QuizResultFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$QuizResultPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.QuizResultFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$QuizResultPayload>;
                };
                findMany: {
                    args: Prisma.QuizResultFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$QuizResultPayload>[];
                };
                create: {
                    args: Prisma.QuizResultCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$QuizResultPayload>;
                };
                createMany: {
                    args: Prisma.QuizResultCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.QuizResultCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$QuizResultPayload>[];
                };
                delete: {
                    args: Prisma.QuizResultDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$QuizResultPayload>;
                };
                update: {
                    args: Prisma.QuizResultUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$QuizResultPayload>;
                };
                deleteMany: {
                    args: Prisma.QuizResultDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.QuizResultUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.QuizResultUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$QuizResultPayload>[];
                };
                upsert: {
                    args: Prisma.QuizResultUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$QuizResultPayload>;
                };
                aggregate: {
                    args: Prisma.QuizResultAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateQuizResult>;
                };
                groupBy: {
                    args: Prisma.QuizResultGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.QuizResultGroupByOutputType>[];
                };
                count: {
                    args: Prisma.QuizResultCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.QuizResultCountAggregateOutputType> | number;
                };
            };
        };
        ConversationLog: {
            payload: Prisma.$ConversationLogPayload<ExtArgs>;
            fields: Prisma.ConversationLogFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ConversationLogFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ConversationLogPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ConversationLogFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ConversationLogPayload>;
                };
                findFirst: {
                    args: Prisma.ConversationLogFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ConversationLogPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ConversationLogFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ConversationLogPayload>;
                };
                findMany: {
                    args: Prisma.ConversationLogFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ConversationLogPayload>[];
                };
                create: {
                    args: Prisma.ConversationLogCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ConversationLogPayload>;
                };
                createMany: {
                    args: Prisma.ConversationLogCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ConversationLogCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ConversationLogPayload>[];
                };
                delete: {
                    args: Prisma.ConversationLogDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ConversationLogPayload>;
                };
                update: {
                    args: Prisma.ConversationLogUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ConversationLogPayload>;
                };
                deleteMany: {
                    args: Prisma.ConversationLogDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ConversationLogUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ConversationLogUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ConversationLogPayload>[];
                };
                upsert: {
                    args: Prisma.ConversationLogUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ConversationLogPayload>;
                };
                aggregate: {
                    args: Prisma.ConversationLogAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateConversationLog>;
                };
                groupBy: {
                    args: Prisma.ConversationLogGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ConversationLogGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ConversationLogCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ConversationLogCountAggregateOutputType> | number;
                };
            };
        };
        ChatThread: {
            payload: Prisma.$ChatThreadPayload<ExtArgs>;
            fields: Prisma.ChatThreadFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ChatThreadFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ChatThreadPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ChatThreadFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ChatThreadPayload>;
                };
                findFirst: {
                    args: Prisma.ChatThreadFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ChatThreadPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ChatThreadFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ChatThreadPayload>;
                };
                findMany: {
                    args: Prisma.ChatThreadFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ChatThreadPayload>[];
                };
                create: {
                    args: Prisma.ChatThreadCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ChatThreadPayload>;
                };
                createMany: {
                    args: Prisma.ChatThreadCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ChatThreadCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ChatThreadPayload>[];
                };
                delete: {
                    args: Prisma.ChatThreadDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ChatThreadPayload>;
                };
                update: {
                    args: Prisma.ChatThreadUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ChatThreadPayload>;
                };
                deleteMany: {
                    args: Prisma.ChatThreadDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ChatThreadUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ChatThreadUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ChatThreadPayload>[];
                };
                upsert: {
                    args: Prisma.ChatThreadUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ChatThreadPayload>;
                };
                aggregate: {
                    args: Prisma.ChatThreadAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateChatThread>;
                };
                groupBy: {
                    args: Prisma.ChatThreadGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ChatThreadGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ChatThreadCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ChatThreadCountAggregateOutputType> | number;
                };
            };
        };
        Streak: {
            payload: Prisma.$StreakPayload<ExtArgs>;
            fields: Prisma.StreakFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.StreakFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StreakPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.StreakFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StreakPayload>;
                };
                findFirst: {
                    args: Prisma.StreakFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StreakPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.StreakFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StreakPayload>;
                };
                findMany: {
                    args: Prisma.StreakFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StreakPayload>[];
                };
                create: {
                    args: Prisma.StreakCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StreakPayload>;
                };
                createMany: {
                    args: Prisma.StreakCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.StreakCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StreakPayload>[];
                };
                delete: {
                    args: Prisma.StreakDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StreakPayload>;
                };
                update: {
                    args: Prisma.StreakUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StreakPayload>;
                };
                deleteMany: {
                    args: Prisma.StreakDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.StreakUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.StreakUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StreakPayload>[];
                };
                upsert: {
                    args: Prisma.StreakUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StreakPayload>;
                };
                aggregate: {
                    args: Prisma.StreakAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateStreak>;
                };
                groupBy: {
                    args: Prisma.StreakGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.StreakGroupByOutputType>[];
                };
                count: {
                    args: Prisma.StreakCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.StreakCountAggregateOutputType> | number;
                };
            };
        };
        Badge: {
            payload: Prisma.$BadgePayload<ExtArgs>;
            fields: Prisma.BadgeFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.BadgeFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BadgePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.BadgeFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BadgePayload>;
                };
                findFirst: {
                    args: Prisma.BadgeFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BadgePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.BadgeFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BadgePayload>;
                };
                findMany: {
                    args: Prisma.BadgeFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BadgePayload>[];
                };
                create: {
                    args: Prisma.BadgeCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BadgePayload>;
                };
                createMany: {
                    args: Prisma.BadgeCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.BadgeCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BadgePayload>[];
                };
                delete: {
                    args: Prisma.BadgeDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BadgePayload>;
                };
                update: {
                    args: Prisma.BadgeUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BadgePayload>;
                };
                deleteMany: {
                    args: Prisma.BadgeDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.BadgeUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.BadgeUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BadgePayload>[];
                };
                upsert: {
                    args: Prisma.BadgeUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BadgePayload>;
                };
                aggregate: {
                    args: Prisma.BadgeAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateBadge>;
                };
                groupBy: {
                    args: Prisma.BadgeGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.BadgeGroupByOutputType>[];
                };
                count: {
                    args: Prisma.BadgeCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.BadgeCountAggregateOutputType> | number;
                };
            };
        };
        UserBadge: {
            payload: Prisma.$UserBadgePayload<ExtArgs>;
            fields: Prisma.UserBadgeFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.UserBadgeFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserBadgePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.UserBadgeFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserBadgePayload>;
                };
                findFirst: {
                    args: Prisma.UserBadgeFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserBadgePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.UserBadgeFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserBadgePayload>;
                };
                findMany: {
                    args: Prisma.UserBadgeFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserBadgePayload>[];
                };
                create: {
                    args: Prisma.UserBadgeCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserBadgePayload>;
                };
                createMany: {
                    args: Prisma.UserBadgeCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.UserBadgeCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserBadgePayload>[];
                };
                delete: {
                    args: Prisma.UserBadgeDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserBadgePayload>;
                };
                update: {
                    args: Prisma.UserBadgeUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserBadgePayload>;
                };
                deleteMany: {
                    args: Prisma.UserBadgeDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.UserBadgeUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.UserBadgeUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserBadgePayload>[];
                };
                upsert: {
                    args: Prisma.UserBadgeUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserBadgePayload>;
                };
                aggregate: {
                    args: Prisma.UserBadgeAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateUserBadge>;
                };
                groupBy: {
                    args: Prisma.UserBadgeGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.UserBadgeGroupByOutputType>[];
                };
                count: {
                    args: Prisma.UserBadgeCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.UserBadgeCountAggregateOutputType> | number;
                };
            };
        };
        Notification: {
            payload: Prisma.$NotificationPayload<ExtArgs>;
            fields: Prisma.NotificationFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.NotificationFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$NotificationPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.NotificationFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$NotificationPayload>;
                };
                findFirst: {
                    args: Prisma.NotificationFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$NotificationPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.NotificationFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$NotificationPayload>;
                };
                findMany: {
                    args: Prisma.NotificationFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$NotificationPayload>[];
                };
                create: {
                    args: Prisma.NotificationCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$NotificationPayload>;
                };
                createMany: {
                    args: Prisma.NotificationCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.NotificationCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$NotificationPayload>[];
                };
                delete: {
                    args: Prisma.NotificationDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$NotificationPayload>;
                };
                update: {
                    args: Prisma.NotificationUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$NotificationPayload>;
                };
                deleteMany: {
                    args: Prisma.NotificationDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.NotificationUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.NotificationUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$NotificationPayload>[];
                };
                upsert: {
                    args: Prisma.NotificationUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$NotificationPayload>;
                };
                aggregate: {
                    args: Prisma.NotificationAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateNotification>;
                };
                groupBy: {
                    args: Prisma.NotificationGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.NotificationGroupByOutputType>[];
                };
                count: {
                    args: Prisma.NotificationCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.NotificationCountAggregateOutputType> | number;
                };
            };
        };
        PushSubscription: {
            payload: Prisma.$PushSubscriptionPayload<ExtArgs>;
            fields: Prisma.PushSubscriptionFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.PushSubscriptionFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PushSubscriptionPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.PushSubscriptionFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PushSubscriptionPayload>;
                };
                findFirst: {
                    args: Prisma.PushSubscriptionFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PushSubscriptionPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.PushSubscriptionFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PushSubscriptionPayload>;
                };
                findMany: {
                    args: Prisma.PushSubscriptionFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PushSubscriptionPayload>[];
                };
                create: {
                    args: Prisma.PushSubscriptionCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PushSubscriptionPayload>;
                };
                createMany: {
                    args: Prisma.PushSubscriptionCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.PushSubscriptionCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PushSubscriptionPayload>[];
                };
                delete: {
                    args: Prisma.PushSubscriptionDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PushSubscriptionPayload>;
                };
                update: {
                    args: Prisma.PushSubscriptionUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PushSubscriptionPayload>;
                };
                deleteMany: {
                    args: Prisma.PushSubscriptionDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.PushSubscriptionUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.PushSubscriptionUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PushSubscriptionPayload>[];
                };
                upsert: {
                    args: Prisma.PushSubscriptionUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PushSubscriptionPayload>;
                };
                aggregate: {
                    args: Prisma.PushSubscriptionAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregatePushSubscription>;
                };
                groupBy: {
                    args: Prisma.PushSubscriptionGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PushSubscriptionGroupByOutputType>[];
                };
                count: {
                    args: Prisma.PushSubscriptionCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PushSubscriptionCountAggregateOutputType> | number;
                };
            };
        };
    };
} & {
    other: {
        payload: any;
        operations: {
            $executeRaw: {
                args: [query: TemplateStringsArray | Sql, ...values: any[]];
                result: any;
            };
            $executeRawUnsafe: {
                args: [query: string, ...values: any[]];
                result: any;
            };
            $queryRaw: {
                args: [query: TemplateStringsArray | Sql, ...values: any[]];
                result: any;
            };
            $queryRawUnsafe: {
                args: [query: string, ...values: any[]];
                result: any;
            };
        };
    };
};
export declare const TransactionIsolationLevel: {
    readonly ReadUncommitted: "ReadUncommitted";
    readonly ReadCommitted: "ReadCommitted";
    readonly RepeatableRead: "RepeatableRead";
    readonly Serializable: "Serializable";
};
export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];
export declare const UserScalarFieldEnum: {
    readonly id: "id";
    readonly email: "email";
    readonly passwordHash: "passwordHash";
    readonly provider: "provider";
    readonly emailVerified: "emailVerified";
    readonly role: "role";
    readonly failedLoginAttempts: "failedLoginAttempts";
    readonly lockedUntil: "lockedUntil";
    readonly disabledAt: "disabledAt";
    readonly disabledReason: "disabledReason";
    readonly lastActiveAt: "lastActiveAt";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum];
export declare const RefreshTokenScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly tokenHash: "tokenHash";
    readonly expiresAt: "expiresAt";
    readonly revokedAt: "revokedAt";
    readonly createdAt: "createdAt";
};
export type RefreshTokenScalarFieldEnum = (typeof RefreshTokenScalarFieldEnum)[keyof typeof RefreshTokenScalarFieldEnum];
export declare const SettingScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly dailyGoal: "dailyGoal";
    readonly cefrLevel: "cefrLevel";
    readonly topics: "topics";
    readonly reminderTime: "reminderTime";
    readonly timeZone: "timeZone";
    readonly notifyEnabled: "notifyEnabled";
    readonly ttsVoice: "ttsVoice";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type SettingScalarFieldEnum = (typeof SettingScalarFieldEnum)[keyof typeof SettingScalarFieldEnum];
export declare const WordScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly term: "term";
    readonly meaning: "meaning";
    readonly phonetic: "phonetic";
    readonly partOfSpeech: "partOfSpeech";
    readonly examples: "examples";
    readonly synonyms: "synonyms";
    readonly antonyms: "antonyms";
    readonly topic: "topic";
    readonly note: "note";
    readonly status: "status";
    readonly quizzedInCycle: "quizzedInCycle";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type WordScalarFieldEnum = (typeof WordScalarFieldEnum)[keyof typeof WordScalarFieldEnum];
export declare const SrsDataScalarFieldEnum: {
    readonly id: "id";
    readonly wordId: "wordId";
    readonly interval: "interval";
    readonly easeFactor: "easeFactor";
    readonly repetitions: "repetitions";
    readonly lastQuality: "lastQuality";
    readonly lastReviewedAt: "lastReviewedAt";
    readonly nextReviewAt: "nextReviewAt";
};
export type SrsDataScalarFieldEnum = (typeof SrsDataScalarFieldEnum)[keyof typeof SrsDataScalarFieldEnum];
export declare const ReviewLogScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly wordId: "wordId";
    readonly quality: "quality";
    readonly reviewedAt: "reviewedAt";
};
export type ReviewLogScalarFieldEnum = (typeof ReviewLogScalarFieldEnum)[keyof typeof ReviewLogScalarFieldEnum];
export declare const ToeicWordScalarFieldEnum: {
    readonly id: "id";
    readonly term: "term";
    readonly display: "display";
    readonly pos: "pos";
    readonly ipa: "ipa";
    readonly meaning: "meaning";
    readonly group: "group";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type ToeicWordScalarFieldEnum = (typeof ToeicWordScalarFieldEnum)[keyof typeof ToeicWordScalarFieldEnum];
export declare const ConversationScenarioScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly description: "description";
    readonly roleHint: "roleHint";
    readonly difficulty: "difficulty";
    readonly enabled: "enabled";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type ConversationScenarioScalarFieldEnum = (typeof ConversationScenarioScalarFieldEnum)[keyof typeof ConversationScenarioScalarFieldEnum];
export declare const AuditLogScalarFieldEnum: {
    readonly id: "id";
    readonly adminId: "adminId";
    readonly adminEmail: "adminEmail";
    readonly action: "action";
    readonly target: "target";
    readonly reason: "reason";
    readonly before: "before";
    readonly after: "after";
    readonly createdAt: "createdAt";
};
export type AuditLogScalarFieldEnum = (typeof AuditLogScalarFieldEnum)[keyof typeof AuditLogScalarFieldEnum];
export declare const GrammarRuleScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly title: "title";
    readonly formula: "formula";
    readonly explanation: "explanation";
    readonly examples: "examples";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type GrammarRuleScalarFieldEnum = (typeof GrammarRuleScalarFieldEnum)[keyof typeof GrammarRuleScalarFieldEnum];
export declare const QuizResultScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly score: "score";
    readonly total: "total";
    readonly status: "status";
    readonly questions: "questions";
    readonly createdAt: "createdAt";
    readonly completedAt: "completedAt";
};
export type QuizResultScalarFieldEnum = (typeof QuizResultScalarFieldEnum)[keyof typeof QuizResultScalarFieldEnum];
export declare const ConversationLogScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly scenario: "scenario";
    readonly transcript: "transcript";
    readonly feedback: "feedback";
    readonly status: "status";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type ConversationLogScalarFieldEnum = (typeof ConversationLogScalarFieldEnum)[keyof typeof ConversationLogScalarFieldEnum];
export declare const ChatThreadScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly kind: "kind";
    readonly title: "title";
    readonly messages: "messages";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type ChatThreadScalarFieldEnum = (typeof ChatThreadScalarFieldEnum)[keyof typeof ChatThreadScalarFieldEnum];
export declare const StreakScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly currentStreak: "currentStreak";
    readonly longestStreak: "longestStreak";
    readonly streakFreezes: "streakFreezes";
    readonly lastActiveDate: "lastActiveDate";
};
export type StreakScalarFieldEnum = (typeof StreakScalarFieldEnum)[keyof typeof StreakScalarFieldEnum];
export declare const BadgeScalarFieldEnum: {
    readonly id: "id";
    readonly code: "code";
    readonly name: "name";
    readonly description: "description";
    readonly condition: "condition";
    readonly icon: "icon";
    readonly createdAt: "createdAt";
};
export type BadgeScalarFieldEnum = (typeof BadgeScalarFieldEnum)[keyof typeof BadgeScalarFieldEnum];
export declare const UserBadgeScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly badgeId: "badgeId";
    readonly earnedAt: "earnedAt";
};
export type UserBadgeScalarFieldEnum = (typeof UserBadgeScalarFieldEnum)[keyof typeof UserBadgeScalarFieldEnum];
export declare const NotificationScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly content: "content";
    readonly type: "type";
    readonly read: "read";
    readonly sentAt: "sentAt";
};
export type NotificationScalarFieldEnum = (typeof NotificationScalarFieldEnum)[keyof typeof NotificationScalarFieldEnum];
export declare const PushSubscriptionScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly endpoint: "endpoint";
    readonly p256dh: "p256dh";
    readonly auth: "auth";
    readonly createdAt: "createdAt";
};
export type PushSubscriptionScalarFieldEnum = (typeof PushSubscriptionScalarFieldEnum)[keyof typeof PushSubscriptionScalarFieldEnum];
export declare const SortOrder: {
    readonly asc: "asc";
    readonly desc: "desc";
};
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
export declare const NullableJsonNullValueInput: {
    readonly DbNull: runtime.DbNullClass;
    readonly JsonNull: runtime.JsonNullClass;
};
export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput];
export declare const JsonNullValueInput: {
    readonly JsonNull: runtime.JsonNullClass;
};
export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput];
export declare const QueryMode: {
    readonly default: "default";
    readonly insensitive: "insensitive";
};
export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];
export declare const NullsOrder: {
    readonly first: "first";
    readonly last: "last";
};
export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];
export declare const JsonNullValueFilter: {
    readonly DbNull: runtime.DbNullClass;
    readonly JsonNull: runtime.JsonNullClass;
    readonly AnyNull: runtime.AnyNullClass;
};
export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter];
export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>;
export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>;
export type EnumAuthProviderFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AuthProvider'>;
export type ListEnumAuthProviderFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AuthProvider[]'>;
export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>;
export type EnumUserRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserRole'>;
export type ListEnumUserRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserRole[]'>;
export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>;
export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>;
export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>;
export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>;
export type EnumCefrLevelFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CefrLevel'>;
export type ListEnumCefrLevelFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CefrLevel[]'>;
export type EnumTtsVoiceFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TtsVoice'>;
export type ListEnumTtsVoiceFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TtsVoice[]'>;
export type EnumWordStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'WordStatus'>;
export type ListEnumWordStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'WordStatus[]'>;
export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>;
export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>;
export type EnumScenarioDifficultyFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ScenarioDifficulty'>;
export type ListEnumScenarioDifficultyFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ScenarioDifficulty[]'>;
export type EnumAuditActionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AuditAction'>;
export type ListEnumAuditActionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AuditAction[]'>;
export type EnumQuizStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QuizStatus'>;
export type ListEnumQuizStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QuizStatus[]'>;
export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>;
export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>;
export type EnumConversationStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ConversationStatus'>;
export type ListEnumConversationStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ConversationStatus[]'>;
export type EnumChatKindFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ChatKind'>;
export type ListEnumChatKindFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ChatKind[]'>;
export type EnumNotificationTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'NotificationType'>;
export type ListEnumNotificationTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'NotificationType[]'>;
export type BatchPayload = {
    count: number;
};
export declare const defineExtension: runtime.Types.Extensions.ExtendsHook<"define", TypeMapCb, runtime.Types.Extensions.DefaultArgs>;
export type DefaultPrismaClient = PrismaClient;
export type ErrorFormat = 'pretty' | 'colorless' | 'minimal';
export type PrismaClientOptions = ({
    adapter: runtime.SqlDriverAdapterFactory;
    accelerateUrl?: never;
} | {
    accelerateUrl: string;
    adapter?: never;
}) & {
    errorFormat?: ErrorFormat;
    log?: (LogLevel | LogDefinition)[];
    transactionOptions?: {
        maxWait?: number;
        timeout?: number;
        isolationLevel?: TransactionIsolationLevel;
    };
    omit?: GlobalOmitConfig;
    comments?: runtime.SqlCommenterPlugin[];
    queryPlanCacheMaxSize?: number;
};
export type GlobalOmitConfig = {
    user?: Prisma.UserOmit;
    refreshToken?: Prisma.RefreshTokenOmit;
    setting?: Prisma.SettingOmit;
    word?: Prisma.WordOmit;
    srsData?: Prisma.SrsDataOmit;
    reviewLog?: Prisma.ReviewLogOmit;
    toeicWord?: Prisma.ToeicWordOmit;
    conversationScenario?: Prisma.ConversationScenarioOmit;
    auditLog?: Prisma.AuditLogOmit;
    grammarRule?: Prisma.GrammarRuleOmit;
    quizResult?: Prisma.QuizResultOmit;
    conversationLog?: Prisma.ConversationLogOmit;
    chatThread?: Prisma.ChatThreadOmit;
    streak?: Prisma.StreakOmit;
    badge?: Prisma.BadgeOmit;
    userBadge?: Prisma.UserBadgeOmit;
    notification?: Prisma.NotificationOmit;
    pushSubscription?: Prisma.PushSubscriptionOmit;
};
export type LogLevel = 'info' | 'query' | 'warn' | 'error';
export type LogDefinition = {
    level: LogLevel;
    emit: 'stdout' | 'event';
};
export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;
export type GetLogType<T> = CheckIsLogLevel<T extends LogDefinition ? T['level'] : T>;
export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition> ? GetLogType<T[number]> : never;
export type QueryEvent = {
    timestamp: Date;
    query: string;
    params: string;
    duration: number;
    target: string;
};
export type LogEvent = {
    timestamp: Date;
    message: string;
    target: string;
};
export type PrismaAction = 'findUnique' | 'findUniqueOrThrow' | 'findMany' | 'findFirst' | 'findFirstOrThrow' | 'create' | 'createMany' | 'createManyAndReturn' | 'update' | 'updateMany' | 'updateManyAndReturn' | 'upsert' | 'delete' | 'deleteMany' | 'executeRaw' | 'queryRaw' | 'aggregate' | 'count' | 'runCommandRaw' | 'findRaw' | 'groupBy';
export type TransactionClient = Omit<DefaultPrismaClient, runtime.ITXClientDenyList>;
