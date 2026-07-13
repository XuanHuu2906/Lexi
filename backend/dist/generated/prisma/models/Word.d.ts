import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums";
import type * as Prisma from "../internal/prismaNamespace";
export type WordModel = runtime.Types.Result.DefaultSelection<Prisma.$WordPayload>;
export type AggregateWord = {
    _count: WordCountAggregateOutputType | null;
    _min: WordMinAggregateOutputType | null;
    _max: WordMaxAggregateOutputType | null;
};
export type WordMinAggregateOutputType = {
    id: string | null;
    userId: string | null;
    term: string | null;
    meaning: string | null;
    phonetic: string | null;
    partOfSpeech: string | null;
    topic: string | null;
    note: string | null;
    status: $Enums.WordStatus | null;
    quizzedInCycle: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type WordMaxAggregateOutputType = {
    id: string | null;
    userId: string | null;
    term: string | null;
    meaning: string | null;
    phonetic: string | null;
    partOfSpeech: string | null;
    topic: string | null;
    note: string | null;
    status: $Enums.WordStatus | null;
    quizzedInCycle: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type WordCountAggregateOutputType = {
    id: number;
    userId: number;
    term: number;
    meaning: number;
    phonetic: number;
    partOfSpeech: number;
    examples: number;
    synonyms: number;
    antonyms: number;
    topic: number;
    note: number;
    status: number;
    quizzedInCycle: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type WordMinAggregateInputType = {
    id?: true;
    userId?: true;
    term?: true;
    meaning?: true;
    phonetic?: true;
    partOfSpeech?: true;
    topic?: true;
    note?: true;
    status?: true;
    quizzedInCycle?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type WordMaxAggregateInputType = {
    id?: true;
    userId?: true;
    term?: true;
    meaning?: true;
    phonetic?: true;
    partOfSpeech?: true;
    topic?: true;
    note?: true;
    status?: true;
    quizzedInCycle?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type WordCountAggregateInputType = {
    id?: true;
    userId?: true;
    term?: true;
    meaning?: true;
    phonetic?: true;
    partOfSpeech?: true;
    examples?: true;
    synonyms?: true;
    antonyms?: true;
    topic?: true;
    note?: true;
    status?: true;
    quizzedInCycle?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type WordAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.WordWhereInput;
    orderBy?: Prisma.WordOrderByWithRelationInput | Prisma.WordOrderByWithRelationInput[];
    cursor?: Prisma.WordWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | WordCountAggregateInputType;
    _min?: WordMinAggregateInputType;
    _max?: WordMaxAggregateInputType;
};
export type GetWordAggregateType<T extends WordAggregateArgs> = {
    [P in keyof T & keyof AggregateWord]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateWord[P]> : Prisma.GetScalarType<T[P], AggregateWord[P]>;
};
export type WordGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.WordWhereInput;
    orderBy?: Prisma.WordOrderByWithAggregationInput | Prisma.WordOrderByWithAggregationInput[];
    by: Prisma.WordScalarFieldEnum[] | Prisma.WordScalarFieldEnum;
    having?: Prisma.WordScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: WordCountAggregateInputType | true;
    _min?: WordMinAggregateInputType;
    _max?: WordMaxAggregateInputType;
};
export type WordGroupByOutputType = {
    id: string;
    userId: string;
    term: string;
    meaning: string;
    phonetic: string | null;
    partOfSpeech: string | null;
    examples: string[];
    synonyms: string[];
    antonyms: string[];
    topic: string | null;
    note: string | null;
    status: $Enums.WordStatus;
    quizzedInCycle: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count: WordCountAggregateOutputType | null;
    _min: WordMinAggregateOutputType | null;
    _max: WordMaxAggregateOutputType | null;
};
export type GetWordGroupByPayload<T extends WordGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<WordGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof WordGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], WordGroupByOutputType[P]> : Prisma.GetScalarType<T[P], WordGroupByOutputType[P]>;
}>>;
export type WordWhereInput = {
    AND?: Prisma.WordWhereInput | Prisma.WordWhereInput[];
    OR?: Prisma.WordWhereInput[];
    NOT?: Prisma.WordWhereInput | Prisma.WordWhereInput[];
    id?: Prisma.StringFilter<"Word"> | string;
    userId?: Prisma.StringFilter<"Word"> | string;
    term?: Prisma.StringFilter<"Word"> | string;
    meaning?: Prisma.StringFilter<"Word"> | string;
    phonetic?: Prisma.StringNullableFilter<"Word"> | string | null;
    partOfSpeech?: Prisma.StringNullableFilter<"Word"> | string | null;
    examples?: Prisma.StringNullableListFilter<"Word">;
    synonyms?: Prisma.StringNullableListFilter<"Word">;
    antonyms?: Prisma.StringNullableListFilter<"Word">;
    topic?: Prisma.StringNullableFilter<"Word"> | string | null;
    note?: Prisma.StringNullableFilter<"Word"> | string | null;
    status?: Prisma.EnumWordStatusFilter<"Word"> | $Enums.WordStatus;
    quizzedInCycle?: Prisma.BoolFilter<"Word"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"Word"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Word"> | Date | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    srsData?: Prisma.XOR<Prisma.SrsDataNullableScalarRelationFilter, Prisma.SrsDataWhereInput> | null;
    reviewLogs?: Prisma.ReviewLogListRelationFilter;
};
export type WordOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    term?: Prisma.SortOrder;
    meaning?: Prisma.SortOrder;
    phonetic?: Prisma.SortOrderInput | Prisma.SortOrder;
    partOfSpeech?: Prisma.SortOrderInput | Prisma.SortOrder;
    examples?: Prisma.SortOrder;
    synonyms?: Prisma.SortOrder;
    antonyms?: Prisma.SortOrder;
    topic?: Prisma.SortOrderInput | Prisma.SortOrder;
    note?: Prisma.SortOrderInput | Prisma.SortOrder;
    status?: Prisma.SortOrder;
    quizzedInCycle?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    user?: Prisma.UserOrderByWithRelationInput;
    srsData?: Prisma.SrsDataOrderByWithRelationInput;
    reviewLogs?: Prisma.ReviewLogOrderByRelationAggregateInput;
};
export type WordWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    userId_term?: Prisma.WordUserIdTermCompoundUniqueInput;
    AND?: Prisma.WordWhereInput | Prisma.WordWhereInput[];
    OR?: Prisma.WordWhereInput[];
    NOT?: Prisma.WordWhereInput | Prisma.WordWhereInput[];
    userId?: Prisma.StringFilter<"Word"> | string;
    term?: Prisma.StringFilter<"Word"> | string;
    meaning?: Prisma.StringFilter<"Word"> | string;
    phonetic?: Prisma.StringNullableFilter<"Word"> | string | null;
    partOfSpeech?: Prisma.StringNullableFilter<"Word"> | string | null;
    examples?: Prisma.StringNullableListFilter<"Word">;
    synonyms?: Prisma.StringNullableListFilter<"Word">;
    antonyms?: Prisma.StringNullableListFilter<"Word">;
    topic?: Prisma.StringNullableFilter<"Word"> | string | null;
    note?: Prisma.StringNullableFilter<"Word"> | string | null;
    status?: Prisma.EnumWordStatusFilter<"Word"> | $Enums.WordStatus;
    quizzedInCycle?: Prisma.BoolFilter<"Word"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"Word"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Word"> | Date | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    srsData?: Prisma.XOR<Prisma.SrsDataNullableScalarRelationFilter, Prisma.SrsDataWhereInput> | null;
    reviewLogs?: Prisma.ReviewLogListRelationFilter;
}, "id" | "userId_term">;
export type WordOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    term?: Prisma.SortOrder;
    meaning?: Prisma.SortOrder;
    phonetic?: Prisma.SortOrderInput | Prisma.SortOrder;
    partOfSpeech?: Prisma.SortOrderInput | Prisma.SortOrder;
    examples?: Prisma.SortOrder;
    synonyms?: Prisma.SortOrder;
    antonyms?: Prisma.SortOrder;
    topic?: Prisma.SortOrderInput | Prisma.SortOrder;
    note?: Prisma.SortOrderInput | Prisma.SortOrder;
    status?: Prisma.SortOrder;
    quizzedInCycle?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.WordCountOrderByAggregateInput;
    _max?: Prisma.WordMaxOrderByAggregateInput;
    _min?: Prisma.WordMinOrderByAggregateInput;
};
export type WordScalarWhereWithAggregatesInput = {
    AND?: Prisma.WordScalarWhereWithAggregatesInput | Prisma.WordScalarWhereWithAggregatesInput[];
    OR?: Prisma.WordScalarWhereWithAggregatesInput[];
    NOT?: Prisma.WordScalarWhereWithAggregatesInput | Prisma.WordScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"Word"> | string;
    userId?: Prisma.StringWithAggregatesFilter<"Word"> | string;
    term?: Prisma.StringWithAggregatesFilter<"Word"> | string;
    meaning?: Prisma.StringWithAggregatesFilter<"Word"> | string;
    phonetic?: Prisma.StringNullableWithAggregatesFilter<"Word"> | string | null;
    partOfSpeech?: Prisma.StringNullableWithAggregatesFilter<"Word"> | string | null;
    examples?: Prisma.StringNullableListFilter<"Word">;
    synonyms?: Prisma.StringNullableListFilter<"Word">;
    antonyms?: Prisma.StringNullableListFilter<"Word">;
    topic?: Prisma.StringNullableWithAggregatesFilter<"Word"> | string | null;
    note?: Prisma.StringNullableWithAggregatesFilter<"Word"> | string | null;
    status?: Prisma.EnumWordStatusWithAggregatesFilter<"Word"> | $Enums.WordStatus;
    quizzedInCycle?: Prisma.BoolWithAggregatesFilter<"Word"> | boolean;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Word"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"Word"> | Date | string;
};
export type WordCreateInput = {
    id?: string;
    term: string;
    meaning: string;
    phonetic?: string | null;
    partOfSpeech?: string | null;
    examples?: Prisma.WordCreateexamplesInput | string[];
    synonyms?: Prisma.WordCreatesynonymsInput | string[];
    antonyms?: Prisma.WordCreateantonymsInput | string[];
    topic?: string | null;
    note?: string | null;
    status?: $Enums.WordStatus;
    quizzedInCycle?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    user: Prisma.UserCreateNestedOneWithoutWordsInput;
    srsData?: Prisma.SrsDataCreateNestedOneWithoutWordInput;
    reviewLogs?: Prisma.ReviewLogCreateNestedManyWithoutWordInput;
};
export type WordUncheckedCreateInput = {
    id?: string;
    userId: string;
    term: string;
    meaning: string;
    phonetic?: string | null;
    partOfSpeech?: string | null;
    examples?: Prisma.WordCreateexamplesInput | string[];
    synonyms?: Prisma.WordCreatesynonymsInput | string[];
    antonyms?: Prisma.WordCreateantonymsInput | string[];
    topic?: string | null;
    note?: string | null;
    status?: $Enums.WordStatus;
    quizzedInCycle?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    srsData?: Prisma.SrsDataUncheckedCreateNestedOneWithoutWordInput;
    reviewLogs?: Prisma.ReviewLogUncheckedCreateNestedManyWithoutWordInput;
};
export type WordUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    term?: Prisma.StringFieldUpdateOperationsInput | string;
    meaning?: Prisma.StringFieldUpdateOperationsInput | string;
    phonetic?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    partOfSpeech?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    examples?: Prisma.WordUpdateexamplesInput | string[];
    synonyms?: Prisma.WordUpdatesynonymsInput | string[];
    antonyms?: Prisma.WordUpdateantonymsInput | string[];
    topic?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumWordStatusFieldUpdateOperationsInput | $Enums.WordStatus;
    quizzedInCycle?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutWordsNestedInput;
    srsData?: Prisma.SrsDataUpdateOneWithoutWordNestedInput;
    reviewLogs?: Prisma.ReviewLogUpdateManyWithoutWordNestedInput;
};
export type WordUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    term?: Prisma.StringFieldUpdateOperationsInput | string;
    meaning?: Prisma.StringFieldUpdateOperationsInput | string;
    phonetic?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    partOfSpeech?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    examples?: Prisma.WordUpdateexamplesInput | string[];
    synonyms?: Prisma.WordUpdatesynonymsInput | string[];
    antonyms?: Prisma.WordUpdateantonymsInput | string[];
    topic?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumWordStatusFieldUpdateOperationsInput | $Enums.WordStatus;
    quizzedInCycle?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    srsData?: Prisma.SrsDataUncheckedUpdateOneWithoutWordNestedInput;
    reviewLogs?: Prisma.ReviewLogUncheckedUpdateManyWithoutWordNestedInput;
};
export type WordCreateManyInput = {
    id?: string;
    userId: string;
    term: string;
    meaning: string;
    phonetic?: string | null;
    partOfSpeech?: string | null;
    examples?: Prisma.WordCreateexamplesInput | string[];
    synonyms?: Prisma.WordCreatesynonymsInput | string[];
    antonyms?: Prisma.WordCreateantonymsInput | string[];
    topic?: string | null;
    note?: string | null;
    status?: $Enums.WordStatus;
    quizzedInCycle?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type WordUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    term?: Prisma.StringFieldUpdateOperationsInput | string;
    meaning?: Prisma.StringFieldUpdateOperationsInput | string;
    phonetic?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    partOfSpeech?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    examples?: Prisma.WordUpdateexamplesInput | string[];
    synonyms?: Prisma.WordUpdatesynonymsInput | string[];
    antonyms?: Prisma.WordUpdateantonymsInput | string[];
    topic?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumWordStatusFieldUpdateOperationsInput | $Enums.WordStatus;
    quizzedInCycle?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type WordUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    term?: Prisma.StringFieldUpdateOperationsInput | string;
    meaning?: Prisma.StringFieldUpdateOperationsInput | string;
    phonetic?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    partOfSpeech?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    examples?: Prisma.WordUpdateexamplesInput | string[];
    synonyms?: Prisma.WordUpdatesynonymsInput | string[];
    antonyms?: Prisma.WordUpdateantonymsInput | string[];
    topic?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumWordStatusFieldUpdateOperationsInput | $Enums.WordStatus;
    quizzedInCycle?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type WordListRelationFilter = {
    every?: Prisma.WordWhereInput;
    some?: Prisma.WordWhereInput;
    none?: Prisma.WordWhereInput;
};
export type WordOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type WordUserIdTermCompoundUniqueInput = {
    userId: string;
    term: string;
};
export type WordCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    term?: Prisma.SortOrder;
    meaning?: Prisma.SortOrder;
    phonetic?: Prisma.SortOrder;
    partOfSpeech?: Prisma.SortOrder;
    examples?: Prisma.SortOrder;
    synonyms?: Prisma.SortOrder;
    antonyms?: Prisma.SortOrder;
    topic?: Prisma.SortOrder;
    note?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    quizzedInCycle?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type WordMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    term?: Prisma.SortOrder;
    meaning?: Prisma.SortOrder;
    phonetic?: Prisma.SortOrder;
    partOfSpeech?: Prisma.SortOrder;
    topic?: Prisma.SortOrder;
    note?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    quizzedInCycle?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type WordMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    term?: Prisma.SortOrder;
    meaning?: Prisma.SortOrder;
    phonetic?: Prisma.SortOrder;
    partOfSpeech?: Prisma.SortOrder;
    topic?: Prisma.SortOrder;
    note?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    quizzedInCycle?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type WordScalarRelationFilter = {
    is?: Prisma.WordWhereInput;
    isNot?: Prisma.WordWhereInput;
};
export type WordCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.WordCreateWithoutUserInput, Prisma.WordUncheckedCreateWithoutUserInput> | Prisma.WordCreateWithoutUserInput[] | Prisma.WordUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.WordCreateOrConnectWithoutUserInput | Prisma.WordCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.WordCreateManyUserInputEnvelope;
    connect?: Prisma.WordWhereUniqueInput | Prisma.WordWhereUniqueInput[];
};
export type WordUncheckedCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.WordCreateWithoutUserInput, Prisma.WordUncheckedCreateWithoutUserInput> | Prisma.WordCreateWithoutUserInput[] | Prisma.WordUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.WordCreateOrConnectWithoutUserInput | Prisma.WordCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.WordCreateManyUserInputEnvelope;
    connect?: Prisma.WordWhereUniqueInput | Prisma.WordWhereUniqueInput[];
};
export type WordUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.WordCreateWithoutUserInput, Prisma.WordUncheckedCreateWithoutUserInput> | Prisma.WordCreateWithoutUserInput[] | Prisma.WordUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.WordCreateOrConnectWithoutUserInput | Prisma.WordCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.WordUpsertWithWhereUniqueWithoutUserInput | Prisma.WordUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.WordCreateManyUserInputEnvelope;
    set?: Prisma.WordWhereUniqueInput | Prisma.WordWhereUniqueInput[];
    disconnect?: Prisma.WordWhereUniqueInput | Prisma.WordWhereUniqueInput[];
    delete?: Prisma.WordWhereUniqueInput | Prisma.WordWhereUniqueInput[];
    connect?: Prisma.WordWhereUniqueInput | Prisma.WordWhereUniqueInput[];
    update?: Prisma.WordUpdateWithWhereUniqueWithoutUserInput | Prisma.WordUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.WordUpdateManyWithWhereWithoutUserInput | Prisma.WordUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.WordScalarWhereInput | Prisma.WordScalarWhereInput[];
};
export type WordUncheckedUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.WordCreateWithoutUserInput, Prisma.WordUncheckedCreateWithoutUserInput> | Prisma.WordCreateWithoutUserInput[] | Prisma.WordUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.WordCreateOrConnectWithoutUserInput | Prisma.WordCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.WordUpsertWithWhereUniqueWithoutUserInput | Prisma.WordUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.WordCreateManyUserInputEnvelope;
    set?: Prisma.WordWhereUniqueInput | Prisma.WordWhereUniqueInput[];
    disconnect?: Prisma.WordWhereUniqueInput | Prisma.WordWhereUniqueInput[];
    delete?: Prisma.WordWhereUniqueInput | Prisma.WordWhereUniqueInput[];
    connect?: Prisma.WordWhereUniqueInput | Prisma.WordWhereUniqueInput[];
    update?: Prisma.WordUpdateWithWhereUniqueWithoutUserInput | Prisma.WordUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.WordUpdateManyWithWhereWithoutUserInput | Prisma.WordUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.WordScalarWhereInput | Prisma.WordScalarWhereInput[];
};
export type WordCreateexamplesInput = {
    set: string[];
};
export type WordCreatesynonymsInput = {
    set: string[];
};
export type WordCreateantonymsInput = {
    set: string[];
};
export type WordUpdateexamplesInput = {
    set?: string[];
    push?: string | string[];
};
export type WordUpdatesynonymsInput = {
    set?: string[];
    push?: string | string[];
};
export type WordUpdateantonymsInput = {
    set?: string[];
    push?: string | string[];
};
export type EnumWordStatusFieldUpdateOperationsInput = {
    set?: $Enums.WordStatus;
};
export type WordCreateNestedOneWithoutSrsDataInput = {
    create?: Prisma.XOR<Prisma.WordCreateWithoutSrsDataInput, Prisma.WordUncheckedCreateWithoutSrsDataInput>;
    connectOrCreate?: Prisma.WordCreateOrConnectWithoutSrsDataInput;
    connect?: Prisma.WordWhereUniqueInput;
};
export type WordUpdateOneRequiredWithoutSrsDataNestedInput = {
    create?: Prisma.XOR<Prisma.WordCreateWithoutSrsDataInput, Prisma.WordUncheckedCreateWithoutSrsDataInput>;
    connectOrCreate?: Prisma.WordCreateOrConnectWithoutSrsDataInput;
    upsert?: Prisma.WordUpsertWithoutSrsDataInput;
    connect?: Prisma.WordWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.WordUpdateToOneWithWhereWithoutSrsDataInput, Prisma.WordUpdateWithoutSrsDataInput>, Prisma.WordUncheckedUpdateWithoutSrsDataInput>;
};
export type WordCreateNestedOneWithoutReviewLogsInput = {
    create?: Prisma.XOR<Prisma.WordCreateWithoutReviewLogsInput, Prisma.WordUncheckedCreateWithoutReviewLogsInput>;
    connectOrCreate?: Prisma.WordCreateOrConnectWithoutReviewLogsInput;
    connect?: Prisma.WordWhereUniqueInput;
};
export type WordUpdateOneRequiredWithoutReviewLogsNestedInput = {
    create?: Prisma.XOR<Prisma.WordCreateWithoutReviewLogsInput, Prisma.WordUncheckedCreateWithoutReviewLogsInput>;
    connectOrCreate?: Prisma.WordCreateOrConnectWithoutReviewLogsInput;
    upsert?: Prisma.WordUpsertWithoutReviewLogsInput;
    connect?: Prisma.WordWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.WordUpdateToOneWithWhereWithoutReviewLogsInput, Prisma.WordUpdateWithoutReviewLogsInput>, Prisma.WordUncheckedUpdateWithoutReviewLogsInput>;
};
export type WordCreateWithoutUserInput = {
    id?: string;
    term: string;
    meaning: string;
    phonetic?: string | null;
    partOfSpeech?: string | null;
    examples?: Prisma.WordCreateexamplesInput | string[];
    synonyms?: Prisma.WordCreatesynonymsInput | string[];
    antonyms?: Prisma.WordCreateantonymsInput | string[];
    topic?: string | null;
    note?: string | null;
    status?: $Enums.WordStatus;
    quizzedInCycle?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    srsData?: Prisma.SrsDataCreateNestedOneWithoutWordInput;
    reviewLogs?: Prisma.ReviewLogCreateNestedManyWithoutWordInput;
};
export type WordUncheckedCreateWithoutUserInput = {
    id?: string;
    term: string;
    meaning: string;
    phonetic?: string | null;
    partOfSpeech?: string | null;
    examples?: Prisma.WordCreateexamplesInput | string[];
    synonyms?: Prisma.WordCreatesynonymsInput | string[];
    antonyms?: Prisma.WordCreateantonymsInput | string[];
    topic?: string | null;
    note?: string | null;
    status?: $Enums.WordStatus;
    quizzedInCycle?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    srsData?: Prisma.SrsDataUncheckedCreateNestedOneWithoutWordInput;
    reviewLogs?: Prisma.ReviewLogUncheckedCreateNestedManyWithoutWordInput;
};
export type WordCreateOrConnectWithoutUserInput = {
    where: Prisma.WordWhereUniqueInput;
    create: Prisma.XOR<Prisma.WordCreateWithoutUserInput, Prisma.WordUncheckedCreateWithoutUserInput>;
};
export type WordCreateManyUserInputEnvelope = {
    data: Prisma.WordCreateManyUserInput | Prisma.WordCreateManyUserInput[];
    skipDuplicates?: boolean;
};
export type WordUpsertWithWhereUniqueWithoutUserInput = {
    where: Prisma.WordWhereUniqueInput;
    update: Prisma.XOR<Prisma.WordUpdateWithoutUserInput, Prisma.WordUncheckedUpdateWithoutUserInput>;
    create: Prisma.XOR<Prisma.WordCreateWithoutUserInput, Prisma.WordUncheckedCreateWithoutUserInput>;
};
export type WordUpdateWithWhereUniqueWithoutUserInput = {
    where: Prisma.WordWhereUniqueInput;
    data: Prisma.XOR<Prisma.WordUpdateWithoutUserInput, Prisma.WordUncheckedUpdateWithoutUserInput>;
};
export type WordUpdateManyWithWhereWithoutUserInput = {
    where: Prisma.WordScalarWhereInput;
    data: Prisma.XOR<Prisma.WordUpdateManyMutationInput, Prisma.WordUncheckedUpdateManyWithoutUserInput>;
};
export type WordScalarWhereInput = {
    AND?: Prisma.WordScalarWhereInput | Prisma.WordScalarWhereInput[];
    OR?: Prisma.WordScalarWhereInput[];
    NOT?: Prisma.WordScalarWhereInput | Prisma.WordScalarWhereInput[];
    id?: Prisma.StringFilter<"Word"> | string;
    userId?: Prisma.StringFilter<"Word"> | string;
    term?: Prisma.StringFilter<"Word"> | string;
    meaning?: Prisma.StringFilter<"Word"> | string;
    phonetic?: Prisma.StringNullableFilter<"Word"> | string | null;
    partOfSpeech?: Prisma.StringNullableFilter<"Word"> | string | null;
    examples?: Prisma.StringNullableListFilter<"Word">;
    synonyms?: Prisma.StringNullableListFilter<"Word">;
    antonyms?: Prisma.StringNullableListFilter<"Word">;
    topic?: Prisma.StringNullableFilter<"Word"> | string | null;
    note?: Prisma.StringNullableFilter<"Word"> | string | null;
    status?: Prisma.EnumWordStatusFilter<"Word"> | $Enums.WordStatus;
    quizzedInCycle?: Prisma.BoolFilter<"Word"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"Word"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Word"> | Date | string;
};
export type WordCreateWithoutSrsDataInput = {
    id?: string;
    term: string;
    meaning: string;
    phonetic?: string | null;
    partOfSpeech?: string | null;
    examples?: Prisma.WordCreateexamplesInput | string[];
    synonyms?: Prisma.WordCreatesynonymsInput | string[];
    antonyms?: Prisma.WordCreateantonymsInput | string[];
    topic?: string | null;
    note?: string | null;
    status?: $Enums.WordStatus;
    quizzedInCycle?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    user: Prisma.UserCreateNestedOneWithoutWordsInput;
    reviewLogs?: Prisma.ReviewLogCreateNestedManyWithoutWordInput;
};
export type WordUncheckedCreateWithoutSrsDataInput = {
    id?: string;
    userId: string;
    term: string;
    meaning: string;
    phonetic?: string | null;
    partOfSpeech?: string | null;
    examples?: Prisma.WordCreateexamplesInput | string[];
    synonyms?: Prisma.WordCreatesynonymsInput | string[];
    antonyms?: Prisma.WordCreateantonymsInput | string[];
    topic?: string | null;
    note?: string | null;
    status?: $Enums.WordStatus;
    quizzedInCycle?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    reviewLogs?: Prisma.ReviewLogUncheckedCreateNestedManyWithoutWordInput;
};
export type WordCreateOrConnectWithoutSrsDataInput = {
    where: Prisma.WordWhereUniqueInput;
    create: Prisma.XOR<Prisma.WordCreateWithoutSrsDataInput, Prisma.WordUncheckedCreateWithoutSrsDataInput>;
};
export type WordUpsertWithoutSrsDataInput = {
    update: Prisma.XOR<Prisma.WordUpdateWithoutSrsDataInput, Prisma.WordUncheckedUpdateWithoutSrsDataInput>;
    create: Prisma.XOR<Prisma.WordCreateWithoutSrsDataInput, Prisma.WordUncheckedCreateWithoutSrsDataInput>;
    where?: Prisma.WordWhereInput;
};
export type WordUpdateToOneWithWhereWithoutSrsDataInput = {
    where?: Prisma.WordWhereInput;
    data: Prisma.XOR<Prisma.WordUpdateWithoutSrsDataInput, Prisma.WordUncheckedUpdateWithoutSrsDataInput>;
};
export type WordUpdateWithoutSrsDataInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    term?: Prisma.StringFieldUpdateOperationsInput | string;
    meaning?: Prisma.StringFieldUpdateOperationsInput | string;
    phonetic?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    partOfSpeech?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    examples?: Prisma.WordUpdateexamplesInput | string[];
    synonyms?: Prisma.WordUpdatesynonymsInput | string[];
    antonyms?: Prisma.WordUpdateantonymsInput | string[];
    topic?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumWordStatusFieldUpdateOperationsInput | $Enums.WordStatus;
    quizzedInCycle?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutWordsNestedInput;
    reviewLogs?: Prisma.ReviewLogUpdateManyWithoutWordNestedInput;
};
export type WordUncheckedUpdateWithoutSrsDataInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    term?: Prisma.StringFieldUpdateOperationsInput | string;
    meaning?: Prisma.StringFieldUpdateOperationsInput | string;
    phonetic?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    partOfSpeech?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    examples?: Prisma.WordUpdateexamplesInput | string[];
    synonyms?: Prisma.WordUpdatesynonymsInput | string[];
    antonyms?: Prisma.WordUpdateantonymsInput | string[];
    topic?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumWordStatusFieldUpdateOperationsInput | $Enums.WordStatus;
    quizzedInCycle?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    reviewLogs?: Prisma.ReviewLogUncheckedUpdateManyWithoutWordNestedInput;
};
export type WordCreateWithoutReviewLogsInput = {
    id?: string;
    term: string;
    meaning: string;
    phonetic?: string | null;
    partOfSpeech?: string | null;
    examples?: Prisma.WordCreateexamplesInput | string[];
    synonyms?: Prisma.WordCreatesynonymsInput | string[];
    antonyms?: Prisma.WordCreateantonymsInput | string[];
    topic?: string | null;
    note?: string | null;
    status?: $Enums.WordStatus;
    quizzedInCycle?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    user: Prisma.UserCreateNestedOneWithoutWordsInput;
    srsData?: Prisma.SrsDataCreateNestedOneWithoutWordInput;
};
export type WordUncheckedCreateWithoutReviewLogsInput = {
    id?: string;
    userId: string;
    term: string;
    meaning: string;
    phonetic?: string | null;
    partOfSpeech?: string | null;
    examples?: Prisma.WordCreateexamplesInput | string[];
    synonyms?: Prisma.WordCreatesynonymsInput | string[];
    antonyms?: Prisma.WordCreateantonymsInput | string[];
    topic?: string | null;
    note?: string | null;
    status?: $Enums.WordStatus;
    quizzedInCycle?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    srsData?: Prisma.SrsDataUncheckedCreateNestedOneWithoutWordInput;
};
export type WordCreateOrConnectWithoutReviewLogsInput = {
    where: Prisma.WordWhereUniqueInput;
    create: Prisma.XOR<Prisma.WordCreateWithoutReviewLogsInput, Prisma.WordUncheckedCreateWithoutReviewLogsInput>;
};
export type WordUpsertWithoutReviewLogsInput = {
    update: Prisma.XOR<Prisma.WordUpdateWithoutReviewLogsInput, Prisma.WordUncheckedUpdateWithoutReviewLogsInput>;
    create: Prisma.XOR<Prisma.WordCreateWithoutReviewLogsInput, Prisma.WordUncheckedCreateWithoutReviewLogsInput>;
    where?: Prisma.WordWhereInput;
};
export type WordUpdateToOneWithWhereWithoutReviewLogsInput = {
    where?: Prisma.WordWhereInput;
    data: Prisma.XOR<Prisma.WordUpdateWithoutReviewLogsInput, Prisma.WordUncheckedUpdateWithoutReviewLogsInput>;
};
export type WordUpdateWithoutReviewLogsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    term?: Prisma.StringFieldUpdateOperationsInput | string;
    meaning?: Prisma.StringFieldUpdateOperationsInput | string;
    phonetic?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    partOfSpeech?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    examples?: Prisma.WordUpdateexamplesInput | string[];
    synonyms?: Prisma.WordUpdatesynonymsInput | string[];
    antonyms?: Prisma.WordUpdateantonymsInput | string[];
    topic?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumWordStatusFieldUpdateOperationsInput | $Enums.WordStatus;
    quizzedInCycle?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutWordsNestedInput;
    srsData?: Prisma.SrsDataUpdateOneWithoutWordNestedInput;
};
export type WordUncheckedUpdateWithoutReviewLogsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    term?: Prisma.StringFieldUpdateOperationsInput | string;
    meaning?: Prisma.StringFieldUpdateOperationsInput | string;
    phonetic?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    partOfSpeech?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    examples?: Prisma.WordUpdateexamplesInput | string[];
    synonyms?: Prisma.WordUpdatesynonymsInput | string[];
    antonyms?: Prisma.WordUpdateantonymsInput | string[];
    topic?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumWordStatusFieldUpdateOperationsInput | $Enums.WordStatus;
    quizzedInCycle?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    srsData?: Prisma.SrsDataUncheckedUpdateOneWithoutWordNestedInput;
};
export type WordCreateManyUserInput = {
    id?: string;
    term: string;
    meaning: string;
    phonetic?: string | null;
    partOfSpeech?: string | null;
    examples?: Prisma.WordCreateexamplesInput | string[];
    synonyms?: Prisma.WordCreatesynonymsInput | string[];
    antonyms?: Prisma.WordCreateantonymsInput | string[];
    topic?: string | null;
    note?: string | null;
    status?: $Enums.WordStatus;
    quizzedInCycle?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type WordUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    term?: Prisma.StringFieldUpdateOperationsInput | string;
    meaning?: Prisma.StringFieldUpdateOperationsInput | string;
    phonetic?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    partOfSpeech?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    examples?: Prisma.WordUpdateexamplesInput | string[];
    synonyms?: Prisma.WordUpdatesynonymsInput | string[];
    antonyms?: Prisma.WordUpdateantonymsInput | string[];
    topic?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumWordStatusFieldUpdateOperationsInput | $Enums.WordStatus;
    quizzedInCycle?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    srsData?: Prisma.SrsDataUpdateOneWithoutWordNestedInput;
    reviewLogs?: Prisma.ReviewLogUpdateManyWithoutWordNestedInput;
};
export type WordUncheckedUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    term?: Prisma.StringFieldUpdateOperationsInput | string;
    meaning?: Prisma.StringFieldUpdateOperationsInput | string;
    phonetic?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    partOfSpeech?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    examples?: Prisma.WordUpdateexamplesInput | string[];
    synonyms?: Prisma.WordUpdatesynonymsInput | string[];
    antonyms?: Prisma.WordUpdateantonymsInput | string[];
    topic?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumWordStatusFieldUpdateOperationsInput | $Enums.WordStatus;
    quizzedInCycle?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    srsData?: Prisma.SrsDataUncheckedUpdateOneWithoutWordNestedInput;
    reviewLogs?: Prisma.ReviewLogUncheckedUpdateManyWithoutWordNestedInput;
};
export type WordUncheckedUpdateManyWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    term?: Prisma.StringFieldUpdateOperationsInput | string;
    meaning?: Prisma.StringFieldUpdateOperationsInput | string;
    phonetic?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    partOfSpeech?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    examples?: Prisma.WordUpdateexamplesInput | string[];
    synonyms?: Prisma.WordUpdatesynonymsInput | string[];
    antonyms?: Prisma.WordUpdateantonymsInput | string[];
    topic?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumWordStatusFieldUpdateOperationsInput | $Enums.WordStatus;
    quizzedInCycle?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type WordCountOutputType = {
    reviewLogs: number;
};
export type WordCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    reviewLogs?: boolean | WordCountOutputTypeCountReviewLogsArgs;
};
export type WordCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WordCountOutputTypeSelect<ExtArgs> | null;
};
export type WordCountOutputTypeCountReviewLogsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ReviewLogWhereInput;
};
export type WordSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    term?: boolean;
    meaning?: boolean;
    phonetic?: boolean;
    partOfSpeech?: boolean;
    examples?: boolean;
    synonyms?: boolean;
    antonyms?: boolean;
    topic?: boolean;
    note?: boolean;
    status?: boolean;
    quizzedInCycle?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    srsData?: boolean | Prisma.Word$srsDataArgs<ExtArgs>;
    reviewLogs?: boolean | Prisma.Word$reviewLogsArgs<ExtArgs>;
    _count?: boolean | Prisma.WordCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["word"]>;
export type WordSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    term?: boolean;
    meaning?: boolean;
    phonetic?: boolean;
    partOfSpeech?: boolean;
    examples?: boolean;
    synonyms?: boolean;
    antonyms?: boolean;
    topic?: boolean;
    note?: boolean;
    status?: boolean;
    quizzedInCycle?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["word"]>;
export type WordSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    term?: boolean;
    meaning?: boolean;
    phonetic?: boolean;
    partOfSpeech?: boolean;
    examples?: boolean;
    synonyms?: boolean;
    antonyms?: boolean;
    topic?: boolean;
    note?: boolean;
    status?: boolean;
    quizzedInCycle?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["word"]>;
export type WordSelectScalar = {
    id?: boolean;
    userId?: boolean;
    term?: boolean;
    meaning?: boolean;
    phonetic?: boolean;
    partOfSpeech?: boolean;
    examples?: boolean;
    synonyms?: boolean;
    antonyms?: boolean;
    topic?: boolean;
    note?: boolean;
    status?: boolean;
    quizzedInCycle?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type WordOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "userId" | "term" | "meaning" | "phonetic" | "partOfSpeech" | "examples" | "synonyms" | "antonyms" | "topic" | "note" | "status" | "quizzedInCycle" | "createdAt" | "updatedAt", ExtArgs["result"]["word"]>;
export type WordInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    srsData?: boolean | Prisma.Word$srsDataArgs<ExtArgs>;
    reviewLogs?: boolean | Prisma.Word$reviewLogsArgs<ExtArgs>;
    _count?: boolean | Prisma.WordCountOutputTypeDefaultArgs<ExtArgs>;
};
export type WordIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type WordIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type $WordPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Word";
    objects: {
        user: Prisma.$UserPayload<ExtArgs>;
        srsData: Prisma.$SrsDataPayload<ExtArgs> | null;
        reviewLogs: Prisma.$ReviewLogPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        userId: string;
        term: string;
        meaning: string;
        phonetic: string | null;
        partOfSpeech: string | null;
        examples: string[];
        synonyms: string[];
        antonyms: string[];
        topic: string | null;
        note: string | null;
        status: $Enums.WordStatus;
        quizzedInCycle: boolean;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["word"]>;
    composites: {};
};
export type WordGetPayload<S extends boolean | null | undefined | WordDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$WordPayload, S>;
export type WordCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<WordFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: WordCountAggregateInputType | true;
};
export interface WordDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Word'];
        meta: {
            name: 'Word';
        };
    };
    findUnique<T extends WordFindUniqueArgs>(args: Prisma.SelectSubset<T, WordFindUniqueArgs<ExtArgs>>): Prisma.Prisma__WordClient<runtime.Types.Result.GetResult<Prisma.$WordPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends WordFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, WordFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__WordClient<runtime.Types.Result.GetResult<Prisma.$WordPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends WordFindFirstArgs>(args?: Prisma.SelectSubset<T, WordFindFirstArgs<ExtArgs>>): Prisma.Prisma__WordClient<runtime.Types.Result.GetResult<Prisma.$WordPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends WordFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, WordFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__WordClient<runtime.Types.Result.GetResult<Prisma.$WordPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends WordFindManyArgs>(args?: Prisma.SelectSubset<T, WordFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$WordPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends WordCreateArgs>(args: Prisma.SelectSubset<T, WordCreateArgs<ExtArgs>>): Prisma.Prisma__WordClient<runtime.Types.Result.GetResult<Prisma.$WordPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends WordCreateManyArgs>(args?: Prisma.SelectSubset<T, WordCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends WordCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, WordCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$WordPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends WordDeleteArgs>(args: Prisma.SelectSubset<T, WordDeleteArgs<ExtArgs>>): Prisma.Prisma__WordClient<runtime.Types.Result.GetResult<Prisma.$WordPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends WordUpdateArgs>(args: Prisma.SelectSubset<T, WordUpdateArgs<ExtArgs>>): Prisma.Prisma__WordClient<runtime.Types.Result.GetResult<Prisma.$WordPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends WordDeleteManyArgs>(args?: Prisma.SelectSubset<T, WordDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends WordUpdateManyArgs>(args: Prisma.SelectSubset<T, WordUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends WordUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, WordUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$WordPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends WordUpsertArgs>(args: Prisma.SelectSubset<T, WordUpsertArgs<ExtArgs>>): Prisma.Prisma__WordClient<runtime.Types.Result.GetResult<Prisma.$WordPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends WordCountArgs>(args?: Prisma.Subset<T, WordCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], WordCountAggregateOutputType> : number>;
    aggregate<T extends WordAggregateArgs>(args: Prisma.Subset<T, WordAggregateArgs>): Prisma.PrismaPromise<GetWordAggregateType<T>>;
    groupBy<T extends WordGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: WordGroupByArgs['orderBy'];
    } : {
        orderBy?: WordGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, WordGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWordGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: WordFieldRefs;
}
export interface Prisma__WordClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    user<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    srsData<T extends Prisma.Word$srsDataArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Word$srsDataArgs<ExtArgs>>): Prisma.Prisma__SrsDataClient<runtime.Types.Result.GetResult<Prisma.$SrsDataPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    reviewLogs<T extends Prisma.Word$reviewLogsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Word$reviewLogsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ReviewLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface WordFieldRefs {
    readonly id: Prisma.FieldRef<"Word", 'String'>;
    readonly userId: Prisma.FieldRef<"Word", 'String'>;
    readonly term: Prisma.FieldRef<"Word", 'String'>;
    readonly meaning: Prisma.FieldRef<"Word", 'String'>;
    readonly phonetic: Prisma.FieldRef<"Word", 'String'>;
    readonly partOfSpeech: Prisma.FieldRef<"Word", 'String'>;
    readonly examples: Prisma.FieldRef<"Word", 'String[]'>;
    readonly synonyms: Prisma.FieldRef<"Word", 'String[]'>;
    readonly antonyms: Prisma.FieldRef<"Word", 'String[]'>;
    readonly topic: Prisma.FieldRef<"Word", 'String'>;
    readonly note: Prisma.FieldRef<"Word", 'String'>;
    readonly status: Prisma.FieldRef<"Word", 'WordStatus'>;
    readonly quizzedInCycle: Prisma.FieldRef<"Word", 'Boolean'>;
    readonly createdAt: Prisma.FieldRef<"Word", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"Word", 'DateTime'>;
}
export type WordFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WordSelect<ExtArgs> | null;
    omit?: Prisma.WordOmit<ExtArgs> | null;
    include?: Prisma.WordInclude<ExtArgs> | null;
    where: Prisma.WordWhereUniqueInput;
};
export type WordFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WordSelect<ExtArgs> | null;
    omit?: Prisma.WordOmit<ExtArgs> | null;
    include?: Prisma.WordInclude<ExtArgs> | null;
    where: Prisma.WordWhereUniqueInput;
};
export type WordFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WordSelect<ExtArgs> | null;
    omit?: Prisma.WordOmit<ExtArgs> | null;
    include?: Prisma.WordInclude<ExtArgs> | null;
    where?: Prisma.WordWhereInput;
    orderBy?: Prisma.WordOrderByWithRelationInput | Prisma.WordOrderByWithRelationInput[];
    cursor?: Prisma.WordWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.WordScalarFieldEnum | Prisma.WordScalarFieldEnum[];
};
export type WordFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WordSelect<ExtArgs> | null;
    omit?: Prisma.WordOmit<ExtArgs> | null;
    include?: Prisma.WordInclude<ExtArgs> | null;
    where?: Prisma.WordWhereInput;
    orderBy?: Prisma.WordOrderByWithRelationInput | Prisma.WordOrderByWithRelationInput[];
    cursor?: Prisma.WordWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.WordScalarFieldEnum | Prisma.WordScalarFieldEnum[];
};
export type WordFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WordSelect<ExtArgs> | null;
    omit?: Prisma.WordOmit<ExtArgs> | null;
    include?: Prisma.WordInclude<ExtArgs> | null;
    where?: Prisma.WordWhereInput;
    orderBy?: Prisma.WordOrderByWithRelationInput | Prisma.WordOrderByWithRelationInput[];
    cursor?: Prisma.WordWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.WordScalarFieldEnum | Prisma.WordScalarFieldEnum[];
};
export type WordCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WordSelect<ExtArgs> | null;
    omit?: Prisma.WordOmit<ExtArgs> | null;
    include?: Prisma.WordInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.WordCreateInput, Prisma.WordUncheckedCreateInput>;
};
export type WordCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.WordCreateManyInput | Prisma.WordCreateManyInput[];
    skipDuplicates?: boolean;
};
export type WordCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WordSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.WordOmit<ExtArgs> | null;
    data: Prisma.WordCreateManyInput | Prisma.WordCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.WordIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type WordUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WordSelect<ExtArgs> | null;
    omit?: Prisma.WordOmit<ExtArgs> | null;
    include?: Prisma.WordInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.WordUpdateInput, Prisma.WordUncheckedUpdateInput>;
    where: Prisma.WordWhereUniqueInput;
};
export type WordUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.WordUpdateManyMutationInput, Prisma.WordUncheckedUpdateManyInput>;
    where?: Prisma.WordWhereInput;
    limit?: number;
};
export type WordUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WordSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.WordOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.WordUpdateManyMutationInput, Prisma.WordUncheckedUpdateManyInput>;
    where?: Prisma.WordWhereInput;
    limit?: number;
    include?: Prisma.WordIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type WordUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WordSelect<ExtArgs> | null;
    omit?: Prisma.WordOmit<ExtArgs> | null;
    include?: Prisma.WordInclude<ExtArgs> | null;
    where: Prisma.WordWhereUniqueInput;
    create: Prisma.XOR<Prisma.WordCreateInput, Prisma.WordUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.WordUpdateInput, Prisma.WordUncheckedUpdateInput>;
};
export type WordDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WordSelect<ExtArgs> | null;
    omit?: Prisma.WordOmit<ExtArgs> | null;
    include?: Prisma.WordInclude<ExtArgs> | null;
    where: Prisma.WordWhereUniqueInput;
};
export type WordDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.WordWhereInput;
    limit?: number;
};
export type Word$srsDataArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SrsDataSelect<ExtArgs> | null;
    omit?: Prisma.SrsDataOmit<ExtArgs> | null;
    include?: Prisma.SrsDataInclude<ExtArgs> | null;
    where?: Prisma.SrsDataWhereInput;
};
export type Word$reviewLogsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type WordDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WordSelect<ExtArgs> | null;
    omit?: Prisma.WordOmit<ExtArgs> | null;
    include?: Prisma.WordInclude<ExtArgs> | null;
};
