import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace";
export type ReviewLogModel = runtime.Types.Result.DefaultSelection<Prisma.$ReviewLogPayload>;
export type AggregateReviewLog = {
    _count: ReviewLogCountAggregateOutputType | null;
    _avg: ReviewLogAvgAggregateOutputType | null;
    _sum: ReviewLogSumAggregateOutputType | null;
    _min: ReviewLogMinAggregateOutputType | null;
    _max: ReviewLogMaxAggregateOutputType | null;
};
export type ReviewLogAvgAggregateOutputType = {
    quality: number | null;
};
export type ReviewLogSumAggregateOutputType = {
    quality: number | null;
};
export type ReviewLogMinAggregateOutputType = {
    id: string | null;
    userId: string | null;
    wordId: string | null;
    quality: number | null;
    reviewedAt: Date | null;
};
export type ReviewLogMaxAggregateOutputType = {
    id: string | null;
    userId: string | null;
    wordId: string | null;
    quality: number | null;
    reviewedAt: Date | null;
};
export type ReviewLogCountAggregateOutputType = {
    id: number;
    userId: number;
    wordId: number;
    quality: number;
    reviewedAt: number;
    _all: number;
};
export type ReviewLogAvgAggregateInputType = {
    quality?: true;
};
export type ReviewLogSumAggregateInputType = {
    quality?: true;
};
export type ReviewLogMinAggregateInputType = {
    id?: true;
    userId?: true;
    wordId?: true;
    quality?: true;
    reviewedAt?: true;
};
export type ReviewLogMaxAggregateInputType = {
    id?: true;
    userId?: true;
    wordId?: true;
    quality?: true;
    reviewedAt?: true;
};
export type ReviewLogCountAggregateInputType = {
    id?: true;
    userId?: true;
    wordId?: true;
    quality?: true;
    reviewedAt?: true;
    _all?: true;
};
export type ReviewLogAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ReviewLogWhereInput;
    orderBy?: Prisma.ReviewLogOrderByWithRelationInput | Prisma.ReviewLogOrderByWithRelationInput[];
    cursor?: Prisma.ReviewLogWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ReviewLogCountAggregateInputType;
    _avg?: ReviewLogAvgAggregateInputType;
    _sum?: ReviewLogSumAggregateInputType;
    _min?: ReviewLogMinAggregateInputType;
    _max?: ReviewLogMaxAggregateInputType;
};
export type GetReviewLogAggregateType<T extends ReviewLogAggregateArgs> = {
    [P in keyof T & keyof AggregateReviewLog]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateReviewLog[P]> : Prisma.GetScalarType<T[P], AggregateReviewLog[P]>;
};
export type ReviewLogGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ReviewLogWhereInput;
    orderBy?: Prisma.ReviewLogOrderByWithAggregationInput | Prisma.ReviewLogOrderByWithAggregationInput[];
    by: Prisma.ReviewLogScalarFieldEnum[] | Prisma.ReviewLogScalarFieldEnum;
    having?: Prisma.ReviewLogScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ReviewLogCountAggregateInputType | true;
    _avg?: ReviewLogAvgAggregateInputType;
    _sum?: ReviewLogSumAggregateInputType;
    _min?: ReviewLogMinAggregateInputType;
    _max?: ReviewLogMaxAggregateInputType;
};
export type ReviewLogGroupByOutputType = {
    id: string;
    userId: string;
    wordId: string;
    quality: number;
    reviewedAt: Date;
    _count: ReviewLogCountAggregateOutputType | null;
    _avg: ReviewLogAvgAggregateOutputType | null;
    _sum: ReviewLogSumAggregateOutputType | null;
    _min: ReviewLogMinAggregateOutputType | null;
    _max: ReviewLogMaxAggregateOutputType | null;
};
export type GetReviewLogGroupByPayload<T extends ReviewLogGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ReviewLogGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ReviewLogGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ReviewLogGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ReviewLogGroupByOutputType[P]>;
}>>;
export type ReviewLogWhereInput = {
    AND?: Prisma.ReviewLogWhereInput | Prisma.ReviewLogWhereInput[];
    OR?: Prisma.ReviewLogWhereInput[];
    NOT?: Prisma.ReviewLogWhereInput | Prisma.ReviewLogWhereInput[];
    id?: Prisma.StringFilter<"ReviewLog"> | string;
    userId?: Prisma.StringFilter<"ReviewLog"> | string;
    wordId?: Prisma.StringFilter<"ReviewLog"> | string;
    quality?: Prisma.IntFilter<"ReviewLog"> | number;
    reviewedAt?: Prisma.DateTimeFilter<"ReviewLog"> | Date | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    word?: Prisma.XOR<Prisma.WordScalarRelationFilter, Prisma.WordWhereInput>;
};
export type ReviewLogOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    wordId?: Prisma.SortOrder;
    quality?: Prisma.SortOrder;
    reviewedAt?: Prisma.SortOrder;
    user?: Prisma.UserOrderByWithRelationInput;
    word?: Prisma.WordOrderByWithRelationInput;
};
export type ReviewLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.ReviewLogWhereInput | Prisma.ReviewLogWhereInput[];
    OR?: Prisma.ReviewLogWhereInput[];
    NOT?: Prisma.ReviewLogWhereInput | Prisma.ReviewLogWhereInput[];
    userId?: Prisma.StringFilter<"ReviewLog"> | string;
    wordId?: Prisma.StringFilter<"ReviewLog"> | string;
    quality?: Prisma.IntFilter<"ReviewLog"> | number;
    reviewedAt?: Prisma.DateTimeFilter<"ReviewLog"> | Date | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    word?: Prisma.XOR<Prisma.WordScalarRelationFilter, Prisma.WordWhereInput>;
}, "id">;
export type ReviewLogOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    wordId?: Prisma.SortOrder;
    quality?: Prisma.SortOrder;
    reviewedAt?: Prisma.SortOrder;
    _count?: Prisma.ReviewLogCountOrderByAggregateInput;
    _avg?: Prisma.ReviewLogAvgOrderByAggregateInput;
    _max?: Prisma.ReviewLogMaxOrderByAggregateInput;
    _min?: Prisma.ReviewLogMinOrderByAggregateInput;
    _sum?: Prisma.ReviewLogSumOrderByAggregateInput;
};
export type ReviewLogScalarWhereWithAggregatesInput = {
    AND?: Prisma.ReviewLogScalarWhereWithAggregatesInput | Prisma.ReviewLogScalarWhereWithAggregatesInput[];
    OR?: Prisma.ReviewLogScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ReviewLogScalarWhereWithAggregatesInput | Prisma.ReviewLogScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"ReviewLog"> | string;
    userId?: Prisma.StringWithAggregatesFilter<"ReviewLog"> | string;
    wordId?: Prisma.StringWithAggregatesFilter<"ReviewLog"> | string;
    quality?: Prisma.IntWithAggregatesFilter<"ReviewLog"> | number;
    reviewedAt?: Prisma.DateTimeWithAggregatesFilter<"ReviewLog"> | Date | string;
};
export type ReviewLogCreateInput = {
    id?: string;
    quality: number;
    reviewedAt?: Date | string;
    user: Prisma.UserCreateNestedOneWithoutReviewLogsInput;
    word: Prisma.WordCreateNestedOneWithoutReviewLogsInput;
};
export type ReviewLogUncheckedCreateInput = {
    id?: string;
    userId: string;
    wordId: string;
    quality: number;
    reviewedAt?: Date | string;
};
export type ReviewLogUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    quality?: Prisma.IntFieldUpdateOperationsInput | number;
    reviewedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutReviewLogsNestedInput;
    word?: Prisma.WordUpdateOneRequiredWithoutReviewLogsNestedInput;
};
export type ReviewLogUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    wordId?: Prisma.StringFieldUpdateOperationsInput | string;
    quality?: Prisma.IntFieldUpdateOperationsInput | number;
    reviewedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ReviewLogCreateManyInput = {
    id?: string;
    userId: string;
    wordId: string;
    quality: number;
    reviewedAt?: Date | string;
};
export type ReviewLogUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    quality?: Prisma.IntFieldUpdateOperationsInput | number;
    reviewedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ReviewLogUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    wordId?: Prisma.StringFieldUpdateOperationsInput | string;
    quality?: Prisma.IntFieldUpdateOperationsInput | number;
    reviewedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ReviewLogListRelationFilter = {
    every?: Prisma.ReviewLogWhereInput;
    some?: Prisma.ReviewLogWhereInput;
    none?: Prisma.ReviewLogWhereInput;
};
export type ReviewLogOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ReviewLogCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    wordId?: Prisma.SortOrder;
    quality?: Prisma.SortOrder;
    reviewedAt?: Prisma.SortOrder;
};
export type ReviewLogAvgOrderByAggregateInput = {
    quality?: Prisma.SortOrder;
};
export type ReviewLogMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    wordId?: Prisma.SortOrder;
    quality?: Prisma.SortOrder;
    reviewedAt?: Prisma.SortOrder;
};
export type ReviewLogMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    wordId?: Prisma.SortOrder;
    quality?: Prisma.SortOrder;
    reviewedAt?: Prisma.SortOrder;
};
export type ReviewLogSumOrderByAggregateInput = {
    quality?: Prisma.SortOrder;
};
export type ReviewLogCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.ReviewLogCreateWithoutUserInput, Prisma.ReviewLogUncheckedCreateWithoutUserInput> | Prisma.ReviewLogCreateWithoutUserInput[] | Prisma.ReviewLogUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.ReviewLogCreateOrConnectWithoutUserInput | Prisma.ReviewLogCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.ReviewLogCreateManyUserInputEnvelope;
    connect?: Prisma.ReviewLogWhereUniqueInput | Prisma.ReviewLogWhereUniqueInput[];
};
export type ReviewLogUncheckedCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.ReviewLogCreateWithoutUserInput, Prisma.ReviewLogUncheckedCreateWithoutUserInput> | Prisma.ReviewLogCreateWithoutUserInput[] | Prisma.ReviewLogUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.ReviewLogCreateOrConnectWithoutUserInput | Prisma.ReviewLogCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.ReviewLogCreateManyUserInputEnvelope;
    connect?: Prisma.ReviewLogWhereUniqueInput | Prisma.ReviewLogWhereUniqueInput[];
};
export type ReviewLogUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.ReviewLogCreateWithoutUserInput, Prisma.ReviewLogUncheckedCreateWithoutUserInput> | Prisma.ReviewLogCreateWithoutUserInput[] | Prisma.ReviewLogUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.ReviewLogCreateOrConnectWithoutUserInput | Prisma.ReviewLogCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.ReviewLogUpsertWithWhereUniqueWithoutUserInput | Prisma.ReviewLogUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.ReviewLogCreateManyUserInputEnvelope;
    set?: Prisma.ReviewLogWhereUniqueInput | Prisma.ReviewLogWhereUniqueInput[];
    disconnect?: Prisma.ReviewLogWhereUniqueInput | Prisma.ReviewLogWhereUniqueInput[];
    delete?: Prisma.ReviewLogWhereUniqueInput | Prisma.ReviewLogWhereUniqueInput[];
    connect?: Prisma.ReviewLogWhereUniqueInput | Prisma.ReviewLogWhereUniqueInput[];
    update?: Prisma.ReviewLogUpdateWithWhereUniqueWithoutUserInput | Prisma.ReviewLogUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.ReviewLogUpdateManyWithWhereWithoutUserInput | Prisma.ReviewLogUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.ReviewLogScalarWhereInput | Prisma.ReviewLogScalarWhereInput[];
};
export type ReviewLogUncheckedUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.ReviewLogCreateWithoutUserInput, Prisma.ReviewLogUncheckedCreateWithoutUserInput> | Prisma.ReviewLogCreateWithoutUserInput[] | Prisma.ReviewLogUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.ReviewLogCreateOrConnectWithoutUserInput | Prisma.ReviewLogCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.ReviewLogUpsertWithWhereUniqueWithoutUserInput | Prisma.ReviewLogUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.ReviewLogCreateManyUserInputEnvelope;
    set?: Prisma.ReviewLogWhereUniqueInput | Prisma.ReviewLogWhereUniqueInput[];
    disconnect?: Prisma.ReviewLogWhereUniqueInput | Prisma.ReviewLogWhereUniqueInput[];
    delete?: Prisma.ReviewLogWhereUniqueInput | Prisma.ReviewLogWhereUniqueInput[];
    connect?: Prisma.ReviewLogWhereUniqueInput | Prisma.ReviewLogWhereUniqueInput[];
    update?: Prisma.ReviewLogUpdateWithWhereUniqueWithoutUserInput | Prisma.ReviewLogUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.ReviewLogUpdateManyWithWhereWithoutUserInput | Prisma.ReviewLogUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.ReviewLogScalarWhereInput | Prisma.ReviewLogScalarWhereInput[];
};
export type ReviewLogCreateNestedManyWithoutWordInput = {
    create?: Prisma.XOR<Prisma.ReviewLogCreateWithoutWordInput, Prisma.ReviewLogUncheckedCreateWithoutWordInput> | Prisma.ReviewLogCreateWithoutWordInput[] | Prisma.ReviewLogUncheckedCreateWithoutWordInput[];
    connectOrCreate?: Prisma.ReviewLogCreateOrConnectWithoutWordInput | Prisma.ReviewLogCreateOrConnectWithoutWordInput[];
    createMany?: Prisma.ReviewLogCreateManyWordInputEnvelope;
    connect?: Prisma.ReviewLogWhereUniqueInput | Prisma.ReviewLogWhereUniqueInput[];
};
export type ReviewLogUncheckedCreateNestedManyWithoutWordInput = {
    create?: Prisma.XOR<Prisma.ReviewLogCreateWithoutWordInput, Prisma.ReviewLogUncheckedCreateWithoutWordInput> | Prisma.ReviewLogCreateWithoutWordInput[] | Prisma.ReviewLogUncheckedCreateWithoutWordInput[];
    connectOrCreate?: Prisma.ReviewLogCreateOrConnectWithoutWordInput | Prisma.ReviewLogCreateOrConnectWithoutWordInput[];
    createMany?: Prisma.ReviewLogCreateManyWordInputEnvelope;
    connect?: Prisma.ReviewLogWhereUniqueInput | Prisma.ReviewLogWhereUniqueInput[];
};
export type ReviewLogUpdateManyWithoutWordNestedInput = {
    create?: Prisma.XOR<Prisma.ReviewLogCreateWithoutWordInput, Prisma.ReviewLogUncheckedCreateWithoutWordInput> | Prisma.ReviewLogCreateWithoutWordInput[] | Prisma.ReviewLogUncheckedCreateWithoutWordInput[];
    connectOrCreate?: Prisma.ReviewLogCreateOrConnectWithoutWordInput | Prisma.ReviewLogCreateOrConnectWithoutWordInput[];
    upsert?: Prisma.ReviewLogUpsertWithWhereUniqueWithoutWordInput | Prisma.ReviewLogUpsertWithWhereUniqueWithoutWordInput[];
    createMany?: Prisma.ReviewLogCreateManyWordInputEnvelope;
    set?: Prisma.ReviewLogWhereUniqueInput | Prisma.ReviewLogWhereUniqueInput[];
    disconnect?: Prisma.ReviewLogWhereUniqueInput | Prisma.ReviewLogWhereUniqueInput[];
    delete?: Prisma.ReviewLogWhereUniqueInput | Prisma.ReviewLogWhereUniqueInput[];
    connect?: Prisma.ReviewLogWhereUniqueInput | Prisma.ReviewLogWhereUniqueInput[];
    update?: Prisma.ReviewLogUpdateWithWhereUniqueWithoutWordInput | Prisma.ReviewLogUpdateWithWhereUniqueWithoutWordInput[];
    updateMany?: Prisma.ReviewLogUpdateManyWithWhereWithoutWordInput | Prisma.ReviewLogUpdateManyWithWhereWithoutWordInput[];
    deleteMany?: Prisma.ReviewLogScalarWhereInput | Prisma.ReviewLogScalarWhereInput[];
};
export type ReviewLogUncheckedUpdateManyWithoutWordNestedInput = {
    create?: Prisma.XOR<Prisma.ReviewLogCreateWithoutWordInput, Prisma.ReviewLogUncheckedCreateWithoutWordInput> | Prisma.ReviewLogCreateWithoutWordInput[] | Prisma.ReviewLogUncheckedCreateWithoutWordInput[];
    connectOrCreate?: Prisma.ReviewLogCreateOrConnectWithoutWordInput | Prisma.ReviewLogCreateOrConnectWithoutWordInput[];
    upsert?: Prisma.ReviewLogUpsertWithWhereUniqueWithoutWordInput | Prisma.ReviewLogUpsertWithWhereUniqueWithoutWordInput[];
    createMany?: Prisma.ReviewLogCreateManyWordInputEnvelope;
    set?: Prisma.ReviewLogWhereUniqueInput | Prisma.ReviewLogWhereUniqueInput[];
    disconnect?: Prisma.ReviewLogWhereUniqueInput | Prisma.ReviewLogWhereUniqueInput[];
    delete?: Prisma.ReviewLogWhereUniqueInput | Prisma.ReviewLogWhereUniqueInput[];
    connect?: Prisma.ReviewLogWhereUniqueInput | Prisma.ReviewLogWhereUniqueInput[];
    update?: Prisma.ReviewLogUpdateWithWhereUniqueWithoutWordInput | Prisma.ReviewLogUpdateWithWhereUniqueWithoutWordInput[];
    updateMany?: Prisma.ReviewLogUpdateManyWithWhereWithoutWordInput | Prisma.ReviewLogUpdateManyWithWhereWithoutWordInput[];
    deleteMany?: Prisma.ReviewLogScalarWhereInput | Prisma.ReviewLogScalarWhereInput[];
};
export type ReviewLogCreateWithoutUserInput = {
    id?: string;
    quality: number;
    reviewedAt?: Date | string;
    word: Prisma.WordCreateNestedOneWithoutReviewLogsInput;
};
export type ReviewLogUncheckedCreateWithoutUserInput = {
    id?: string;
    wordId: string;
    quality: number;
    reviewedAt?: Date | string;
};
export type ReviewLogCreateOrConnectWithoutUserInput = {
    where: Prisma.ReviewLogWhereUniqueInput;
    create: Prisma.XOR<Prisma.ReviewLogCreateWithoutUserInput, Prisma.ReviewLogUncheckedCreateWithoutUserInput>;
};
export type ReviewLogCreateManyUserInputEnvelope = {
    data: Prisma.ReviewLogCreateManyUserInput | Prisma.ReviewLogCreateManyUserInput[];
    skipDuplicates?: boolean;
};
export type ReviewLogUpsertWithWhereUniqueWithoutUserInput = {
    where: Prisma.ReviewLogWhereUniqueInput;
    update: Prisma.XOR<Prisma.ReviewLogUpdateWithoutUserInput, Prisma.ReviewLogUncheckedUpdateWithoutUserInput>;
    create: Prisma.XOR<Prisma.ReviewLogCreateWithoutUserInput, Prisma.ReviewLogUncheckedCreateWithoutUserInput>;
};
export type ReviewLogUpdateWithWhereUniqueWithoutUserInput = {
    where: Prisma.ReviewLogWhereUniqueInput;
    data: Prisma.XOR<Prisma.ReviewLogUpdateWithoutUserInput, Prisma.ReviewLogUncheckedUpdateWithoutUserInput>;
};
export type ReviewLogUpdateManyWithWhereWithoutUserInput = {
    where: Prisma.ReviewLogScalarWhereInput;
    data: Prisma.XOR<Prisma.ReviewLogUpdateManyMutationInput, Prisma.ReviewLogUncheckedUpdateManyWithoutUserInput>;
};
export type ReviewLogScalarWhereInput = {
    AND?: Prisma.ReviewLogScalarWhereInput | Prisma.ReviewLogScalarWhereInput[];
    OR?: Prisma.ReviewLogScalarWhereInput[];
    NOT?: Prisma.ReviewLogScalarWhereInput | Prisma.ReviewLogScalarWhereInput[];
    id?: Prisma.StringFilter<"ReviewLog"> | string;
    userId?: Prisma.StringFilter<"ReviewLog"> | string;
    wordId?: Prisma.StringFilter<"ReviewLog"> | string;
    quality?: Prisma.IntFilter<"ReviewLog"> | number;
    reviewedAt?: Prisma.DateTimeFilter<"ReviewLog"> | Date | string;
};
export type ReviewLogCreateWithoutWordInput = {
    id?: string;
    quality: number;
    reviewedAt?: Date | string;
    user: Prisma.UserCreateNestedOneWithoutReviewLogsInput;
};
export type ReviewLogUncheckedCreateWithoutWordInput = {
    id?: string;
    userId: string;
    quality: number;
    reviewedAt?: Date | string;
};
export type ReviewLogCreateOrConnectWithoutWordInput = {
    where: Prisma.ReviewLogWhereUniqueInput;
    create: Prisma.XOR<Prisma.ReviewLogCreateWithoutWordInput, Prisma.ReviewLogUncheckedCreateWithoutWordInput>;
};
export type ReviewLogCreateManyWordInputEnvelope = {
    data: Prisma.ReviewLogCreateManyWordInput | Prisma.ReviewLogCreateManyWordInput[];
    skipDuplicates?: boolean;
};
export type ReviewLogUpsertWithWhereUniqueWithoutWordInput = {
    where: Prisma.ReviewLogWhereUniqueInput;
    update: Prisma.XOR<Prisma.ReviewLogUpdateWithoutWordInput, Prisma.ReviewLogUncheckedUpdateWithoutWordInput>;
    create: Prisma.XOR<Prisma.ReviewLogCreateWithoutWordInput, Prisma.ReviewLogUncheckedCreateWithoutWordInput>;
};
export type ReviewLogUpdateWithWhereUniqueWithoutWordInput = {
    where: Prisma.ReviewLogWhereUniqueInput;
    data: Prisma.XOR<Prisma.ReviewLogUpdateWithoutWordInput, Prisma.ReviewLogUncheckedUpdateWithoutWordInput>;
};
export type ReviewLogUpdateManyWithWhereWithoutWordInput = {
    where: Prisma.ReviewLogScalarWhereInput;
    data: Prisma.XOR<Prisma.ReviewLogUpdateManyMutationInput, Prisma.ReviewLogUncheckedUpdateManyWithoutWordInput>;
};
export type ReviewLogCreateManyUserInput = {
    id?: string;
    wordId: string;
    quality: number;
    reviewedAt?: Date | string;
};
export type ReviewLogUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    quality?: Prisma.IntFieldUpdateOperationsInput | number;
    reviewedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    word?: Prisma.WordUpdateOneRequiredWithoutReviewLogsNestedInput;
};
export type ReviewLogUncheckedUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    wordId?: Prisma.StringFieldUpdateOperationsInput | string;
    quality?: Prisma.IntFieldUpdateOperationsInput | number;
    reviewedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ReviewLogUncheckedUpdateManyWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    wordId?: Prisma.StringFieldUpdateOperationsInput | string;
    quality?: Prisma.IntFieldUpdateOperationsInput | number;
    reviewedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ReviewLogCreateManyWordInput = {
    id?: string;
    userId: string;
    quality: number;
    reviewedAt?: Date | string;
};
export type ReviewLogUpdateWithoutWordInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    quality?: Prisma.IntFieldUpdateOperationsInput | number;
    reviewedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutReviewLogsNestedInput;
};
export type ReviewLogUncheckedUpdateWithoutWordInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    quality?: Prisma.IntFieldUpdateOperationsInput | number;
    reviewedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ReviewLogUncheckedUpdateManyWithoutWordInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    quality?: Prisma.IntFieldUpdateOperationsInput | number;
    reviewedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ReviewLogSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    wordId?: boolean;
    quality?: boolean;
    reviewedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    word?: boolean | Prisma.WordDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["reviewLog"]>;
export type ReviewLogSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    wordId?: boolean;
    quality?: boolean;
    reviewedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    word?: boolean | Prisma.WordDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["reviewLog"]>;
export type ReviewLogSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    wordId?: boolean;
    quality?: boolean;
    reviewedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    word?: boolean | Prisma.WordDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["reviewLog"]>;
export type ReviewLogSelectScalar = {
    id?: boolean;
    userId?: boolean;
    wordId?: boolean;
    quality?: boolean;
    reviewedAt?: boolean;
};
export type ReviewLogOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "userId" | "wordId" | "quality" | "reviewedAt", ExtArgs["result"]["reviewLog"]>;
export type ReviewLogInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    word?: boolean | Prisma.WordDefaultArgs<ExtArgs>;
};
export type ReviewLogIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    word?: boolean | Prisma.WordDefaultArgs<ExtArgs>;
};
export type ReviewLogIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    word?: boolean | Prisma.WordDefaultArgs<ExtArgs>;
};
export type $ReviewLogPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ReviewLog";
    objects: {
        user: Prisma.$UserPayload<ExtArgs>;
        word: Prisma.$WordPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        userId: string;
        wordId: string;
        quality: number;
        reviewedAt: Date;
    }, ExtArgs["result"]["reviewLog"]>;
    composites: {};
};
export type ReviewLogGetPayload<S extends boolean | null | undefined | ReviewLogDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ReviewLogPayload, S>;
export type ReviewLogCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ReviewLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ReviewLogCountAggregateInputType | true;
};
export interface ReviewLogDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ReviewLog'];
        meta: {
            name: 'ReviewLog';
        };
    };
    findUnique<T extends ReviewLogFindUniqueArgs>(args: Prisma.SelectSubset<T, ReviewLogFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ReviewLogClient<runtime.Types.Result.GetResult<Prisma.$ReviewLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ReviewLogFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ReviewLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ReviewLogClient<runtime.Types.Result.GetResult<Prisma.$ReviewLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ReviewLogFindFirstArgs>(args?: Prisma.SelectSubset<T, ReviewLogFindFirstArgs<ExtArgs>>): Prisma.Prisma__ReviewLogClient<runtime.Types.Result.GetResult<Prisma.$ReviewLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ReviewLogFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ReviewLogFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ReviewLogClient<runtime.Types.Result.GetResult<Prisma.$ReviewLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ReviewLogFindManyArgs>(args?: Prisma.SelectSubset<T, ReviewLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ReviewLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ReviewLogCreateArgs>(args: Prisma.SelectSubset<T, ReviewLogCreateArgs<ExtArgs>>): Prisma.Prisma__ReviewLogClient<runtime.Types.Result.GetResult<Prisma.$ReviewLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ReviewLogCreateManyArgs>(args?: Prisma.SelectSubset<T, ReviewLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ReviewLogCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ReviewLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ReviewLogPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ReviewLogDeleteArgs>(args: Prisma.SelectSubset<T, ReviewLogDeleteArgs<ExtArgs>>): Prisma.Prisma__ReviewLogClient<runtime.Types.Result.GetResult<Prisma.$ReviewLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ReviewLogUpdateArgs>(args: Prisma.SelectSubset<T, ReviewLogUpdateArgs<ExtArgs>>): Prisma.Prisma__ReviewLogClient<runtime.Types.Result.GetResult<Prisma.$ReviewLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ReviewLogDeleteManyArgs>(args?: Prisma.SelectSubset<T, ReviewLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ReviewLogUpdateManyArgs>(args: Prisma.SelectSubset<T, ReviewLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ReviewLogUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ReviewLogUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ReviewLogPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ReviewLogUpsertArgs>(args: Prisma.SelectSubset<T, ReviewLogUpsertArgs<ExtArgs>>): Prisma.Prisma__ReviewLogClient<runtime.Types.Result.GetResult<Prisma.$ReviewLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ReviewLogCountArgs>(args?: Prisma.Subset<T, ReviewLogCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ReviewLogCountAggregateOutputType> : number>;
    aggregate<T extends ReviewLogAggregateArgs>(args: Prisma.Subset<T, ReviewLogAggregateArgs>): Prisma.PrismaPromise<GetReviewLogAggregateType<T>>;
    groupBy<T extends ReviewLogGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ReviewLogGroupByArgs['orderBy'];
    } : {
        orderBy?: ReviewLogGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ReviewLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetReviewLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ReviewLogFieldRefs;
}
export interface Prisma__ReviewLogClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    user<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    word<T extends Prisma.WordDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.WordDefaultArgs<ExtArgs>>): Prisma.Prisma__WordClient<runtime.Types.Result.GetResult<Prisma.$WordPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ReviewLogFieldRefs {
    readonly id: Prisma.FieldRef<"ReviewLog", 'String'>;
    readonly userId: Prisma.FieldRef<"ReviewLog", 'String'>;
    readonly wordId: Prisma.FieldRef<"ReviewLog", 'String'>;
    readonly quality: Prisma.FieldRef<"ReviewLog", 'Int'>;
    readonly reviewedAt: Prisma.FieldRef<"ReviewLog", 'DateTime'>;
}
export type ReviewLogFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ReviewLogSelect<ExtArgs> | null;
    omit?: Prisma.ReviewLogOmit<ExtArgs> | null;
    include?: Prisma.ReviewLogInclude<ExtArgs> | null;
    where: Prisma.ReviewLogWhereUniqueInput;
};
export type ReviewLogFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ReviewLogSelect<ExtArgs> | null;
    omit?: Prisma.ReviewLogOmit<ExtArgs> | null;
    include?: Prisma.ReviewLogInclude<ExtArgs> | null;
    where: Prisma.ReviewLogWhereUniqueInput;
};
export type ReviewLogFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ReviewLogSelect<ExtArgs> | null;
    omit?: Prisma.ReviewLogOmit<ExtArgs> | null;
    include?: Prisma.ReviewLogInclude<ExtArgs> | null;
    where?: Prisma.ReviewLogWhereInput;
    orderBy?: Prisma.ReviewLogOrderByWithRelationInput | Prisma.ReviewLogOrderByWithRelationInput[];
    cursor?: Prisma.ReviewLogWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ReviewLogScalarFieldEnum | Prisma.ReviewLogScalarFieldEnum[];
};
export type ReviewLogFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ReviewLogSelect<ExtArgs> | null;
    omit?: Prisma.ReviewLogOmit<ExtArgs> | null;
    include?: Prisma.ReviewLogInclude<ExtArgs> | null;
    where?: Prisma.ReviewLogWhereInput;
    orderBy?: Prisma.ReviewLogOrderByWithRelationInput | Prisma.ReviewLogOrderByWithRelationInput[];
    cursor?: Prisma.ReviewLogWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ReviewLogScalarFieldEnum | Prisma.ReviewLogScalarFieldEnum[];
};
export type ReviewLogFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ReviewLogSelect<ExtArgs> | null;
    omit?: Prisma.ReviewLogOmit<ExtArgs> | null;
    include?: Prisma.ReviewLogInclude<ExtArgs> | null;
    where?: Prisma.ReviewLogWhereInput;
    orderBy?: Prisma.ReviewLogOrderByWithRelationInput | Prisma.ReviewLogOrderByWithRelationInput[];
    cursor?: Prisma.ReviewLogWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ReviewLogScalarFieldEnum | Prisma.ReviewLogScalarFieldEnum[];
};
export type ReviewLogCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ReviewLogSelect<ExtArgs> | null;
    omit?: Prisma.ReviewLogOmit<ExtArgs> | null;
    include?: Prisma.ReviewLogInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ReviewLogCreateInput, Prisma.ReviewLogUncheckedCreateInput>;
};
export type ReviewLogCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ReviewLogCreateManyInput | Prisma.ReviewLogCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ReviewLogCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ReviewLogSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ReviewLogOmit<ExtArgs> | null;
    data: Prisma.ReviewLogCreateManyInput | Prisma.ReviewLogCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.ReviewLogIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type ReviewLogUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ReviewLogSelect<ExtArgs> | null;
    omit?: Prisma.ReviewLogOmit<ExtArgs> | null;
    include?: Prisma.ReviewLogInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ReviewLogUpdateInput, Prisma.ReviewLogUncheckedUpdateInput>;
    where: Prisma.ReviewLogWhereUniqueInput;
};
export type ReviewLogUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ReviewLogUpdateManyMutationInput, Prisma.ReviewLogUncheckedUpdateManyInput>;
    where?: Prisma.ReviewLogWhereInput;
    limit?: number;
};
export type ReviewLogUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ReviewLogSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ReviewLogOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ReviewLogUpdateManyMutationInput, Prisma.ReviewLogUncheckedUpdateManyInput>;
    where?: Prisma.ReviewLogWhereInput;
    limit?: number;
    include?: Prisma.ReviewLogIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type ReviewLogUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ReviewLogSelect<ExtArgs> | null;
    omit?: Prisma.ReviewLogOmit<ExtArgs> | null;
    include?: Prisma.ReviewLogInclude<ExtArgs> | null;
    where: Prisma.ReviewLogWhereUniqueInput;
    create: Prisma.XOR<Prisma.ReviewLogCreateInput, Prisma.ReviewLogUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ReviewLogUpdateInput, Prisma.ReviewLogUncheckedUpdateInput>;
};
export type ReviewLogDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ReviewLogSelect<ExtArgs> | null;
    omit?: Prisma.ReviewLogOmit<ExtArgs> | null;
    include?: Prisma.ReviewLogInclude<ExtArgs> | null;
    where: Prisma.ReviewLogWhereUniqueInput;
};
export type ReviewLogDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ReviewLogWhereInput;
    limit?: number;
};
export type ReviewLogDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ReviewLogSelect<ExtArgs> | null;
    omit?: Prisma.ReviewLogOmit<ExtArgs> | null;
    include?: Prisma.ReviewLogInclude<ExtArgs> | null;
};
