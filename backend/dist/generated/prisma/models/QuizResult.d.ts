import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums";
import type * as Prisma from "../internal/prismaNamespace";
export type QuizResultModel = runtime.Types.Result.DefaultSelection<Prisma.$QuizResultPayload>;
export type AggregateQuizResult = {
    _count: QuizResultCountAggregateOutputType | null;
    _avg: QuizResultAvgAggregateOutputType | null;
    _sum: QuizResultSumAggregateOutputType | null;
    _min: QuizResultMinAggregateOutputType | null;
    _max: QuizResultMaxAggregateOutputType | null;
};
export type QuizResultAvgAggregateOutputType = {
    score: number | null;
    total: number | null;
};
export type QuizResultSumAggregateOutputType = {
    score: number | null;
    total: number | null;
};
export type QuizResultMinAggregateOutputType = {
    id: string | null;
    userId: string | null;
    score: number | null;
    total: number | null;
    status: $Enums.QuizStatus | null;
    createdAt: Date | null;
    completedAt: Date | null;
};
export type QuizResultMaxAggregateOutputType = {
    id: string | null;
    userId: string | null;
    score: number | null;
    total: number | null;
    status: $Enums.QuizStatus | null;
    createdAt: Date | null;
    completedAt: Date | null;
};
export type QuizResultCountAggregateOutputType = {
    id: number;
    userId: number;
    score: number;
    total: number;
    status: number;
    questions: number;
    createdAt: number;
    completedAt: number;
    _all: number;
};
export type QuizResultAvgAggregateInputType = {
    score?: true;
    total?: true;
};
export type QuizResultSumAggregateInputType = {
    score?: true;
    total?: true;
};
export type QuizResultMinAggregateInputType = {
    id?: true;
    userId?: true;
    score?: true;
    total?: true;
    status?: true;
    createdAt?: true;
    completedAt?: true;
};
export type QuizResultMaxAggregateInputType = {
    id?: true;
    userId?: true;
    score?: true;
    total?: true;
    status?: true;
    createdAt?: true;
    completedAt?: true;
};
export type QuizResultCountAggregateInputType = {
    id?: true;
    userId?: true;
    score?: true;
    total?: true;
    status?: true;
    questions?: true;
    createdAt?: true;
    completedAt?: true;
    _all?: true;
};
export type QuizResultAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.QuizResultWhereInput;
    orderBy?: Prisma.QuizResultOrderByWithRelationInput | Prisma.QuizResultOrderByWithRelationInput[];
    cursor?: Prisma.QuizResultWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | QuizResultCountAggregateInputType;
    _avg?: QuizResultAvgAggregateInputType;
    _sum?: QuizResultSumAggregateInputType;
    _min?: QuizResultMinAggregateInputType;
    _max?: QuizResultMaxAggregateInputType;
};
export type GetQuizResultAggregateType<T extends QuizResultAggregateArgs> = {
    [P in keyof T & keyof AggregateQuizResult]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateQuizResult[P]> : Prisma.GetScalarType<T[P], AggregateQuizResult[P]>;
};
export type QuizResultGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.QuizResultWhereInput;
    orderBy?: Prisma.QuizResultOrderByWithAggregationInput | Prisma.QuizResultOrderByWithAggregationInput[];
    by: Prisma.QuizResultScalarFieldEnum[] | Prisma.QuizResultScalarFieldEnum;
    having?: Prisma.QuizResultScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: QuizResultCountAggregateInputType | true;
    _avg?: QuizResultAvgAggregateInputType;
    _sum?: QuizResultSumAggregateInputType;
    _min?: QuizResultMinAggregateInputType;
    _max?: QuizResultMaxAggregateInputType;
};
export type QuizResultGroupByOutputType = {
    id: string;
    userId: string;
    score: number;
    total: number;
    status: $Enums.QuizStatus;
    questions: runtime.JsonValue | null;
    createdAt: Date;
    completedAt: Date | null;
    _count: QuizResultCountAggregateOutputType | null;
    _avg: QuizResultAvgAggregateOutputType | null;
    _sum: QuizResultSumAggregateOutputType | null;
    _min: QuizResultMinAggregateOutputType | null;
    _max: QuizResultMaxAggregateOutputType | null;
};
export type GetQuizResultGroupByPayload<T extends QuizResultGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<QuizResultGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof QuizResultGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], QuizResultGroupByOutputType[P]> : Prisma.GetScalarType<T[P], QuizResultGroupByOutputType[P]>;
}>>;
export type QuizResultWhereInput = {
    AND?: Prisma.QuizResultWhereInput | Prisma.QuizResultWhereInput[];
    OR?: Prisma.QuizResultWhereInput[];
    NOT?: Prisma.QuizResultWhereInput | Prisma.QuizResultWhereInput[];
    id?: Prisma.StringFilter<"QuizResult"> | string;
    userId?: Prisma.StringFilter<"QuizResult"> | string;
    score?: Prisma.IntFilter<"QuizResult"> | number;
    total?: Prisma.IntFilter<"QuizResult"> | number;
    status?: Prisma.EnumQuizStatusFilter<"QuizResult"> | $Enums.QuizStatus;
    questions?: Prisma.JsonNullableFilter<"QuizResult">;
    createdAt?: Prisma.DateTimeFilter<"QuizResult"> | Date | string;
    completedAt?: Prisma.DateTimeNullableFilter<"QuizResult"> | Date | string | null;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
};
export type QuizResultOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    score?: Prisma.SortOrder;
    total?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    questions?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    completedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    user?: Prisma.UserOrderByWithRelationInput;
};
export type QuizResultWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.QuizResultWhereInput | Prisma.QuizResultWhereInput[];
    OR?: Prisma.QuizResultWhereInput[];
    NOT?: Prisma.QuizResultWhereInput | Prisma.QuizResultWhereInput[];
    userId?: Prisma.StringFilter<"QuizResult"> | string;
    score?: Prisma.IntFilter<"QuizResult"> | number;
    total?: Prisma.IntFilter<"QuizResult"> | number;
    status?: Prisma.EnumQuizStatusFilter<"QuizResult"> | $Enums.QuizStatus;
    questions?: Prisma.JsonNullableFilter<"QuizResult">;
    createdAt?: Prisma.DateTimeFilter<"QuizResult"> | Date | string;
    completedAt?: Prisma.DateTimeNullableFilter<"QuizResult"> | Date | string | null;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
}, "id">;
export type QuizResultOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    score?: Prisma.SortOrder;
    total?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    questions?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    completedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    _count?: Prisma.QuizResultCountOrderByAggregateInput;
    _avg?: Prisma.QuizResultAvgOrderByAggregateInput;
    _max?: Prisma.QuizResultMaxOrderByAggregateInput;
    _min?: Prisma.QuizResultMinOrderByAggregateInput;
    _sum?: Prisma.QuizResultSumOrderByAggregateInput;
};
export type QuizResultScalarWhereWithAggregatesInput = {
    AND?: Prisma.QuizResultScalarWhereWithAggregatesInput | Prisma.QuizResultScalarWhereWithAggregatesInput[];
    OR?: Prisma.QuizResultScalarWhereWithAggregatesInput[];
    NOT?: Prisma.QuizResultScalarWhereWithAggregatesInput | Prisma.QuizResultScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"QuizResult"> | string;
    userId?: Prisma.StringWithAggregatesFilter<"QuizResult"> | string;
    score?: Prisma.IntWithAggregatesFilter<"QuizResult"> | number;
    total?: Prisma.IntWithAggregatesFilter<"QuizResult"> | number;
    status?: Prisma.EnumQuizStatusWithAggregatesFilter<"QuizResult"> | $Enums.QuizStatus;
    questions?: Prisma.JsonNullableWithAggregatesFilter<"QuizResult">;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"QuizResult"> | Date | string;
    completedAt?: Prisma.DateTimeNullableWithAggregatesFilter<"QuizResult"> | Date | string | null;
};
export type QuizResultCreateInput = {
    id?: string;
    score?: number;
    total: number;
    status?: $Enums.QuizStatus;
    questions?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    completedAt?: Date | string | null;
    user: Prisma.UserCreateNestedOneWithoutQuizResultsInput;
};
export type QuizResultUncheckedCreateInput = {
    id?: string;
    userId: string;
    score?: number;
    total: number;
    status?: $Enums.QuizStatus;
    questions?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    completedAt?: Date | string | null;
};
export type QuizResultUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    score?: Prisma.IntFieldUpdateOperationsInput | number;
    total?: Prisma.IntFieldUpdateOperationsInput | number;
    status?: Prisma.EnumQuizStatusFieldUpdateOperationsInput | $Enums.QuizStatus;
    questions?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    completedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    user?: Prisma.UserUpdateOneRequiredWithoutQuizResultsNestedInput;
};
export type QuizResultUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    score?: Prisma.IntFieldUpdateOperationsInput | number;
    total?: Prisma.IntFieldUpdateOperationsInput | number;
    status?: Prisma.EnumQuizStatusFieldUpdateOperationsInput | $Enums.QuizStatus;
    questions?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    completedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type QuizResultCreateManyInput = {
    id?: string;
    userId: string;
    score?: number;
    total: number;
    status?: $Enums.QuizStatus;
    questions?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    completedAt?: Date | string | null;
};
export type QuizResultUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    score?: Prisma.IntFieldUpdateOperationsInput | number;
    total?: Prisma.IntFieldUpdateOperationsInput | number;
    status?: Prisma.EnumQuizStatusFieldUpdateOperationsInput | $Enums.QuizStatus;
    questions?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    completedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type QuizResultUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    score?: Prisma.IntFieldUpdateOperationsInput | number;
    total?: Prisma.IntFieldUpdateOperationsInput | number;
    status?: Prisma.EnumQuizStatusFieldUpdateOperationsInput | $Enums.QuizStatus;
    questions?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    completedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type QuizResultListRelationFilter = {
    every?: Prisma.QuizResultWhereInput;
    some?: Prisma.QuizResultWhereInput;
    none?: Prisma.QuizResultWhereInput;
};
export type QuizResultOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type QuizResultCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    score?: Prisma.SortOrder;
    total?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    questions?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    completedAt?: Prisma.SortOrder;
};
export type QuizResultAvgOrderByAggregateInput = {
    score?: Prisma.SortOrder;
    total?: Prisma.SortOrder;
};
export type QuizResultMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    score?: Prisma.SortOrder;
    total?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    completedAt?: Prisma.SortOrder;
};
export type QuizResultMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    score?: Prisma.SortOrder;
    total?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    completedAt?: Prisma.SortOrder;
};
export type QuizResultSumOrderByAggregateInput = {
    score?: Prisma.SortOrder;
    total?: Prisma.SortOrder;
};
export type QuizResultCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.QuizResultCreateWithoutUserInput, Prisma.QuizResultUncheckedCreateWithoutUserInput> | Prisma.QuizResultCreateWithoutUserInput[] | Prisma.QuizResultUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.QuizResultCreateOrConnectWithoutUserInput | Prisma.QuizResultCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.QuizResultCreateManyUserInputEnvelope;
    connect?: Prisma.QuizResultWhereUniqueInput | Prisma.QuizResultWhereUniqueInput[];
};
export type QuizResultUncheckedCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.QuizResultCreateWithoutUserInput, Prisma.QuizResultUncheckedCreateWithoutUserInput> | Prisma.QuizResultCreateWithoutUserInput[] | Prisma.QuizResultUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.QuizResultCreateOrConnectWithoutUserInput | Prisma.QuizResultCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.QuizResultCreateManyUserInputEnvelope;
    connect?: Prisma.QuizResultWhereUniqueInput | Prisma.QuizResultWhereUniqueInput[];
};
export type QuizResultUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.QuizResultCreateWithoutUserInput, Prisma.QuizResultUncheckedCreateWithoutUserInput> | Prisma.QuizResultCreateWithoutUserInput[] | Prisma.QuizResultUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.QuizResultCreateOrConnectWithoutUserInput | Prisma.QuizResultCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.QuizResultUpsertWithWhereUniqueWithoutUserInput | Prisma.QuizResultUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.QuizResultCreateManyUserInputEnvelope;
    set?: Prisma.QuizResultWhereUniqueInput | Prisma.QuizResultWhereUniqueInput[];
    disconnect?: Prisma.QuizResultWhereUniqueInput | Prisma.QuizResultWhereUniqueInput[];
    delete?: Prisma.QuizResultWhereUniqueInput | Prisma.QuizResultWhereUniqueInput[];
    connect?: Prisma.QuizResultWhereUniqueInput | Prisma.QuizResultWhereUniqueInput[];
    update?: Prisma.QuizResultUpdateWithWhereUniqueWithoutUserInput | Prisma.QuizResultUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.QuizResultUpdateManyWithWhereWithoutUserInput | Prisma.QuizResultUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.QuizResultScalarWhereInput | Prisma.QuizResultScalarWhereInput[];
};
export type QuizResultUncheckedUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.QuizResultCreateWithoutUserInput, Prisma.QuizResultUncheckedCreateWithoutUserInput> | Prisma.QuizResultCreateWithoutUserInput[] | Prisma.QuizResultUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.QuizResultCreateOrConnectWithoutUserInput | Prisma.QuizResultCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.QuizResultUpsertWithWhereUniqueWithoutUserInput | Prisma.QuizResultUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.QuizResultCreateManyUserInputEnvelope;
    set?: Prisma.QuizResultWhereUniqueInput | Prisma.QuizResultWhereUniqueInput[];
    disconnect?: Prisma.QuizResultWhereUniqueInput | Prisma.QuizResultWhereUniqueInput[];
    delete?: Prisma.QuizResultWhereUniqueInput | Prisma.QuizResultWhereUniqueInput[];
    connect?: Prisma.QuizResultWhereUniqueInput | Prisma.QuizResultWhereUniqueInput[];
    update?: Prisma.QuizResultUpdateWithWhereUniqueWithoutUserInput | Prisma.QuizResultUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.QuizResultUpdateManyWithWhereWithoutUserInput | Prisma.QuizResultUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.QuizResultScalarWhereInput | Prisma.QuizResultScalarWhereInput[];
};
export type EnumQuizStatusFieldUpdateOperationsInput = {
    set?: $Enums.QuizStatus;
};
export type QuizResultCreateWithoutUserInput = {
    id?: string;
    score?: number;
    total: number;
    status?: $Enums.QuizStatus;
    questions?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    completedAt?: Date | string | null;
};
export type QuizResultUncheckedCreateWithoutUserInput = {
    id?: string;
    score?: number;
    total: number;
    status?: $Enums.QuizStatus;
    questions?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    completedAt?: Date | string | null;
};
export type QuizResultCreateOrConnectWithoutUserInput = {
    where: Prisma.QuizResultWhereUniqueInput;
    create: Prisma.XOR<Prisma.QuizResultCreateWithoutUserInput, Prisma.QuizResultUncheckedCreateWithoutUserInput>;
};
export type QuizResultCreateManyUserInputEnvelope = {
    data: Prisma.QuizResultCreateManyUserInput | Prisma.QuizResultCreateManyUserInput[];
    skipDuplicates?: boolean;
};
export type QuizResultUpsertWithWhereUniqueWithoutUserInput = {
    where: Prisma.QuizResultWhereUniqueInput;
    update: Prisma.XOR<Prisma.QuizResultUpdateWithoutUserInput, Prisma.QuizResultUncheckedUpdateWithoutUserInput>;
    create: Prisma.XOR<Prisma.QuizResultCreateWithoutUserInput, Prisma.QuizResultUncheckedCreateWithoutUserInput>;
};
export type QuizResultUpdateWithWhereUniqueWithoutUserInput = {
    where: Prisma.QuizResultWhereUniqueInput;
    data: Prisma.XOR<Prisma.QuizResultUpdateWithoutUserInput, Prisma.QuizResultUncheckedUpdateWithoutUserInput>;
};
export type QuizResultUpdateManyWithWhereWithoutUserInput = {
    where: Prisma.QuizResultScalarWhereInput;
    data: Prisma.XOR<Prisma.QuizResultUpdateManyMutationInput, Prisma.QuizResultUncheckedUpdateManyWithoutUserInput>;
};
export type QuizResultScalarWhereInput = {
    AND?: Prisma.QuizResultScalarWhereInput | Prisma.QuizResultScalarWhereInput[];
    OR?: Prisma.QuizResultScalarWhereInput[];
    NOT?: Prisma.QuizResultScalarWhereInput | Prisma.QuizResultScalarWhereInput[];
    id?: Prisma.StringFilter<"QuizResult"> | string;
    userId?: Prisma.StringFilter<"QuizResult"> | string;
    score?: Prisma.IntFilter<"QuizResult"> | number;
    total?: Prisma.IntFilter<"QuizResult"> | number;
    status?: Prisma.EnumQuizStatusFilter<"QuizResult"> | $Enums.QuizStatus;
    questions?: Prisma.JsonNullableFilter<"QuizResult">;
    createdAt?: Prisma.DateTimeFilter<"QuizResult"> | Date | string;
    completedAt?: Prisma.DateTimeNullableFilter<"QuizResult"> | Date | string | null;
};
export type QuizResultCreateManyUserInput = {
    id?: string;
    score?: number;
    total: number;
    status?: $Enums.QuizStatus;
    questions?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    completedAt?: Date | string | null;
};
export type QuizResultUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    score?: Prisma.IntFieldUpdateOperationsInput | number;
    total?: Prisma.IntFieldUpdateOperationsInput | number;
    status?: Prisma.EnumQuizStatusFieldUpdateOperationsInput | $Enums.QuizStatus;
    questions?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    completedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type QuizResultUncheckedUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    score?: Prisma.IntFieldUpdateOperationsInput | number;
    total?: Prisma.IntFieldUpdateOperationsInput | number;
    status?: Prisma.EnumQuizStatusFieldUpdateOperationsInput | $Enums.QuizStatus;
    questions?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    completedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type QuizResultUncheckedUpdateManyWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    score?: Prisma.IntFieldUpdateOperationsInput | number;
    total?: Prisma.IntFieldUpdateOperationsInput | number;
    status?: Prisma.EnumQuizStatusFieldUpdateOperationsInput | $Enums.QuizStatus;
    questions?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    completedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type QuizResultSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    score?: boolean;
    total?: boolean;
    status?: boolean;
    questions?: boolean;
    createdAt?: boolean;
    completedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["quizResult"]>;
export type QuizResultSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    score?: boolean;
    total?: boolean;
    status?: boolean;
    questions?: boolean;
    createdAt?: boolean;
    completedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["quizResult"]>;
export type QuizResultSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    score?: boolean;
    total?: boolean;
    status?: boolean;
    questions?: boolean;
    createdAt?: boolean;
    completedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["quizResult"]>;
export type QuizResultSelectScalar = {
    id?: boolean;
    userId?: boolean;
    score?: boolean;
    total?: boolean;
    status?: boolean;
    questions?: boolean;
    createdAt?: boolean;
    completedAt?: boolean;
};
export type QuizResultOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "userId" | "score" | "total" | "status" | "questions" | "createdAt" | "completedAt", ExtArgs["result"]["quizResult"]>;
export type QuizResultInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type QuizResultIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type QuizResultIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type $QuizResultPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "QuizResult";
    objects: {
        user: Prisma.$UserPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        userId: string;
        score: number;
        total: number;
        status: $Enums.QuizStatus;
        questions: runtime.JsonValue | null;
        createdAt: Date;
        completedAt: Date | null;
    }, ExtArgs["result"]["quizResult"]>;
    composites: {};
};
export type QuizResultGetPayload<S extends boolean | null | undefined | QuizResultDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$QuizResultPayload, S>;
export type QuizResultCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<QuizResultFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: QuizResultCountAggregateInputType | true;
};
export interface QuizResultDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['QuizResult'];
        meta: {
            name: 'QuizResult';
        };
    };
    findUnique<T extends QuizResultFindUniqueArgs>(args: Prisma.SelectSubset<T, QuizResultFindUniqueArgs<ExtArgs>>): Prisma.Prisma__QuizResultClient<runtime.Types.Result.GetResult<Prisma.$QuizResultPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends QuizResultFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, QuizResultFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__QuizResultClient<runtime.Types.Result.GetResult<Prisma.$QuizResultPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends QuizResultFindFirstArgs>(args?: Prisma.SelectSubset<T, QuizResultFindFirstArgs<ExtArgs>>): Prisma.Prisma__QuizResultClient<runtime.Types.Result.GetResult<Prisma.$QuizResultPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends QuizResultFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, QuizResultFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__QuizResultClient<runtime.Types.Result.GetResult<Prisma.$QuizResultPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends QuizResultFindManyArgs>(args?: Prisma.SelectSubset<T, QuizResultFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$QuizResultPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends QuizResultCreateArgs>(args: Prisma.SelectSubset<T, QuizResultCreateArgs<ExtArgs>>): Prisma.Prisma__QuizResultClient<runtime.Types.Result.GetResult<Prisma.$QuizResultPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends QuizResultCreateManyArgs>(args?: Prisma.SelectSubset<T, QuizResultCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends QuizResultCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, QuizResultCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$QuizResultPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends QuizResultDeleteArgs>(args: Prisma.SelectSubset<T, QuizResultDeleteArgs<ExtArgs>>): Prisma.Prisma__QuizResultClient<runtime.Types.Result.GetResult<Prisma.$QuizResultPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends QuizResultUpdateArgs>(args: Prisma.SelectSubset<T, QuizResultUpdateArgs<ExtArgs>>): Prisma.Prisma__QuizResultClient<runtime.Types.Result.GetResult<Prisma.$QuizResultPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends QuizResultDeleteManyArgs>(args?: Prisma.SelectSubset<T, QuizResultDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends QuizResultUpdateManyArgs>(args: Prisma.SelectSubset<T, QuizResultUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends QuizResultUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, QuizResultUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$QuizResultPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends QuizResultUpsertArgs>(args: Prisma.SelectSubset<T, QuizResultUpsertArgs<ExtArgs>>): Prisma.Prisma__QuizResultClient<runtime.Types.Result.GetResult<Prisma.$QuizResultPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends QuizResultCountArgs>(args?: Prisma.Subset<T, QuizResultCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], QuizResultCountAggregateOutputType> : number>;
    aggregate<T extends QuizResultAggregateArgs>(args: Prisma.Subset<T, QuizResultAggregateArgs>): Prisma.PrismaPromise<GetQuizResultAggregateType<T>>;
    groupBy<T extends QuizResultGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: QuizResultGroupByArgs['orderBy'];
    } : {
        orderBy?: QuizResultGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, QuizResultGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetQuizResultGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: QuizResultFieldRefs;
}
export interface Prisma__QuizResultClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    user<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface QuizResultFieldRefs {
    readonly id: Prisma.FieldRef<"QuizResult", 'String'>;
    readonly userId: Prisma.FieldRef<"QuizResult", 'String'>;
    readonly score: Prisma.FieldRef<"QuizResult", 'Int'>;
    readonly total: Prisma.FieldRef<"QuizResult", 'Int'>;
    readonly status: Prisma.FieldRef<"QuizResult", 'QuizStatus'>;
    readonly questions: Prisma.FieldRef<"QuizResult", 'Json'>;
    readonly createdAt: Prisma.FieldRef<"QuizResult", 'DateTime'>;
    readonly completedAt: Prisma.FieldRef<"QuizResult", 'DateTime'>;
}
export type QuizResultFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.QuizResultSelect<ExtArgs> | null;
    omit?: Prisma.QuizResultOmit<ExtArgs> | null;
    include?: Prisma.QuizResultInclude<ExtArgs> | null;
    where: Prisma.QuizResultWhereUniqueInput;
};
export type QuizResultFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.QuizResultSelect<ExtArgs> | null;
    omit?: Prisma.QuizResultOmit<ExtArgs> | null;
    include?: Prisma.QuizResultInclude<ExtArgs> | null;
    where: Prisma.QuizResultWhereUniqueInput;
};
export type QuizResultFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.QuizResultSelect<ExtArgs> | null;
    omit?: Prisma.QuizResultOmit<ExtArgs> | null;
    include?: Prisma.QuizResultInclude<ExtArgs> | null;
    where?: Prisma.QuizResultWhereInput;
    orderBy?: Prisma.QuizResultOrderByWithRelationInput | Prisma.QuizResultOrderByWithRelationInput[];
    cursor?: Prisma.QuizResultWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.QuizResultScalarFieldEnum | Prisma.QuizResultScalarFieldEnum[];
};
export type QuizResultFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.QuizResultSelect<ExtArgs> | null;
    omit?: Prisma.QuizResultOmit<ExtArgs> | null;
    include?: Prisma.QuizResultInclude<ExtArgs> | null;
    where?: Prisma.QuizResultWhereInput;
    orderBy?: Prisma.QuizResultOrderByWithRelationInput | Prisma.QuizResultOrderByWithRelationInput[];
    cursor?: Prisma.QuizResultWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.QuizResultScalarFieldEnum | Prisma.QuizResultScalarFieldEnum[];
};
export type QuizResultFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.QuizResultSelect<ExtArgs> | null;
    omit?: Prisma.QuizResultOmit<ExtArgs> | null;
    include?: Prisma.QuizResultInclude<ExtArgs> | null;
    where?: Prisma.QuizResultWhereInput;
    orderBy?: Prisma.QuizResultOrderByWithRelationInput | Prisma.QuizResultOrderByWithRelationInput[];
    cursor?: Prisma.QuizResultWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.QuizResultScalarFieldEnum | Prisma.QuizResultScalarFieldEnum[];
};
export type QuizResultCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.QuizResultSelect<ExtArgs> | null;
    omit?: Prisma.QuizResultOmit<ExtArgs> | null;
    include?: Prisma.QuizResultInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.QuizResultCreateInput, Prisma.QuizResultUncheckedCreateInput>;
};
export type QuizResultCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.QuizResultCreateManyInput | Prisma.QuizResultCreateManyInput[];
    skipDuplicates?: boolean;
};
export type QuizResultCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.QuizResultSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.QuizResultOmit<ExtArgs> | null;
    data: Prisma.QuizResultCreateManyInput | Prisma.QuizResultCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.QuizResultIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type QuizResultUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.QuizResultSelect<ExtArgs> | null;
    omit?: Prisma.QuizResultOmit<ExtArgs> | null;
    include?: Prisma.QuizResultInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.QuizResultUpdateInput, Prisma.QuizResultUncheckedUpdateInput>;
    where: Prisma.QuizResultWhereUniqueInput;
};
export type QuizResultUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.QuizResultUpdateManyMutationInput, Prisma.QuizResultUncheckedUpdateManyInput>;
    where?: Prisma.QuizResultWhereInput;
    limit?: number;
};
export type QuizResultUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.QuizResultSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.QuizResultOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.QuizResultUpdateManyMutationInput, Prisma.QuizResultUncheckedUpdateManyInput>;
    where?: Prisma.QuizResultWhereInput;
    limit?: number;
    include?: Prisma.QuizResultIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type QuizResultUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.QuizResultSelect<ExtArgs> | null;
    omit?: Prisma.QuizResultOmit<ExtArgs> | null;
    include?: Prisma.QuizResultInclude<ExtArgs> | null;
    where: Prisma.QuizResultWhereUniqueInput;
    create: Prisma.XOR<Prisma.QuizResultCreateInput, Prisma.QuizResultUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.QuizResultUpdateInput, Prisma.QuizResultUncheckedUpdateInput>;
};
export type QuizResultDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.QuizResultSelect<ExtArgs> | null;
    omit?: Prisma.QuizResultOmit<ExtArgs> | null;
    include?: Prisma.QuizResultInclude<ExtArgs> | null;
    where: Prisma.QuizResultWhereUniqueInput;
};
export type QuizResultDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.QuizResultWhereInput;
    limit?: number;
};
export type QuizResultDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.QuizResultSelect<ExtArgs> | null;
    omit?: Prisma.QuizResultOmit<ExtArgs> | null;
    include?: Prisma.QuizResultInclude<ExtArgs> | null;
};
