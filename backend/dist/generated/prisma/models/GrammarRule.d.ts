import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace";
export type GrammarRuleModel = runtime.Types.Result.DefaultSelection<Prisma.$GrammarRulePayload>;
export type AggregateGrammarRule = {
    _count: GrammarRuleCountAggregateOutputType | null;
    _min: GrammarRuleMinAggregateOutputType | null;
    _max: GrammarRuleMaxAggregateOutputType | null;
};
export type GrammarRuleMinAggregateOutputType = {
    id: string | null;
    userId: string | null;
    title: string | null;
    formula: string | null;
    explanation: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type GrammarRuleMaxAggregateOutputType = {
    id: string | null;
    userId: string | null;
    title: string | null;
    formula: string | null;
    explanation: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type GrammarRuleCountAggregateOutputType = {
    id: number;
    userId: number;
    title: number;
    formula: number;
    explanation: number;
    examples: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type GrammarRuleMinAggregateInputType = {
    id?: true;
    userId?: true;
    title?: true;
    formula?: true;
    explanation?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type GrammarRuleMaxAggregateInputType = {
    id?: true;
    userId?: true;
    title?: true;
    formula?: true;
    explanation?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type GrammarRuleCountAggregateInputType = {
    id?: true;
    userId?: true;
    title?: true;
    formula?: true;
    explanation?: true;
    examples?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type GrammarRuleAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.GrammarRuleWhereInput;
    orderBy?: Prisma.GrammarRuleOrderByWithRelationInput | Prisma.GrammarRuleOrderByWithRelationInput[];
    cursor?: Prisma.GrammarRuleWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | GrammarRuleCountAggregateInputType;
    _min?: GrammarRuleMinAggregateInputType;
    _max?: GrammarRuleMaxAggregateInputType;
};
export type GetGrammarRuleAggregateType<T extends GrammarRuleAggregateArgs> = {
    [P in keyof T & keyof AggregateGrammarRule]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateGrammarRule[P]> : Prisma.GetScalarType<T[P], AggregateGrammarRule[P]>;
};
export type GrammarRuleGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.GrammarRuleWhereInput;
    orderBy?: Prisma.GrammarRuleOrderByWithAggregationInput | Prisma.GrammarRuleOrderByWithAggregationInput[];
    by: Prisma.GrammarRuleScalarFieldEnum[] | Prisma.GrammarRuleScalarFieldEnum;
    having?: Prisma.GrammarRuleScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: GrammarRuleCountAggregateInputType | true;
    _min?: GrammarRuleMinAggregateInputType;
    _max?: GrammarRuleMaxAggregateInputType;
};
export type GrammarRuleGroupByOutputType = {
    id: string;
    userId: string;
    title: string | null;
    formula: string;
    explanation: string;
    examples: string[];
    createdAt: Date;
    updatedAt: Date;
    _count: GrammarRuleCountAggregateOutputType | null;
    _min: GrammarRuleMinAggregateOutputType | null;
    _max: GrammarRuleMaxAggregateOutputType | null;
};
export type GetGrammarRuleGroupByPayload<T extends GrammarRuleGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<GrammarRuleGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof GrammarRuleGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], GrammarRuleGroupByOutputType[P]> : Prisma.GetScalarType<T[P], GrammarRuleGroupByOutputType[P]>;
}>>;
export type GrammarRuleWhereInput = {
    AND?: Prisma.GrammarRuleWhereInput | Prisma.GrammarRuleWhereInput[];
    OR?: Prisma.GrammarRuleWhereInput[];
    NOT?: Prisma.GrammarRuleWhereInput | Prisma.GrammarRuleWhereInput[];
    id?: Prisma.StringFilter<"GrammarRule"> | string;
    userId?: Prisma.StringFilter<"GrammarRule"> | string;
    title?: Prisma.StringNullableFilter<"GrammarRule"> | string | null;
    formula?: Prisma.StringFilter<"GrammarRule"> | string;
    explanation?: Prisma.StringFilter<"GrammarRule"> | string;
    examples?: Prisma.StringNullableListFilter<"GrammarRule">;
    createdAt?: Prisma.DateTimeFilter<"GrammarRule"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"GrammarRule"> | Date | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
};
export type GrammarRuleOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    title?: Prisma.SortOrderInput | Prisma.SortOrder;
    formula?: Prisma.SortOrder;
    explanation?: Prisma.SortOrder;
    examples?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    user?: Prisma.UserOrderByWithRelationInput;
};
export type GrammarRuleWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.GrammarRuleWhereInput | Prisma.GrammarRuleWhereInput[];
    OR?: Prisma.GrammarRuleWhereInput[];
    NOT?: Prisma.GrammarRuleWhereInput | Prisma.GrammarRuleWhereInput[];
    userId?: Prisma.StringFilter<"GrammarRule"> | string;
    title?: Prisma.StringNullableFilter<"GrammarRule"> | string | null;
    formula?: Prisma.StringFilter<"GrammarRule"> | string;
    explanation?: Prisma.StringFilter<"GrammarRule"> | string;
    examples?: Prisma.StringNullableListFilter<"GrammarRule">;
    createdAt?: Prisma.DateTimeFilter<"GrammarRule"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"GrammarRule"> | Date | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
}, "id">;
export type GrammarRuleOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    title?: Prisma.SortOrderInput | Prisma.SortOrder;
    formula?: Prisma.SortOrder;
    explanation?: Prisma.SortOrder;
    examples?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.GrammarRuleCountOrderByAggregateInput;
    _max?: Prisma.GrammarRuleMaxOrderByAggregateInput;
    _min?: Prisma.GrammarRuleMinOrderByAggregateInput;
};
export type GrammarRuleScalarWhereWithAggregatesInput = {
    AND?: Prisma.GrammarRuleScalarWhereWithAggregatesInput | Prisma.GrammarRuleScalarWhereWithAggregatesInput[];
    OR?: Prisma.GrammarRuleScalarWhereWithAggregatesInput[];
    NOT?: Prisma.GrammarRuleScalarWhereWithAggregatesInput | Prisma.GrammarRuleScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"GrammarRule"> | string;
    userId?: Prisma.StringWithAggregatesFilter<"GrammarRule"> | string;
    title?: Prisma.StringNullableWithAggregatesFilter<"GrammarRule"> | string | null;
    formula?: Prisma.StringWithAggregatesFilter<"GrammarRule"> | string;
    explanation?: Prisma.StringWithAggregatesFilter<"GrammarRule"> | string;
    examples?: Prisma.StringNullableListFilter<"GrammarRule">;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"GrammarRule"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"GrammarRule"> | Date | string;
};
export type GrammarRuleCreateInput = {
    id?: string;
    title?: string | null;
    formula: string;
    explanation: string;
    examples?: Prisma.GrammarRuleCreateexamplesInput | string[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
    user: Prisma.UserCreateNestedOneWithoutGrammarRulesInput;
};
export type GrammarRuleUncheckedCreateInput = {
    id?: string;
    userId: string;
    title?: string | null;
    formula: string;
    explanation: string;
    examples?: Prisma.GrammarRuleCreateexamplesInput | string[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type GrammarRuleUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    formula?: Prisma.StringFieldUpdateOperationsInput | string;
    explanation?: Prisma.StringFieldUpdateOperationsInput | string;
    examples?: Prisma.GrammarRuleUpdateexamplesInput | string[];
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutGrammarRulesNestedInput;
};
export type GrammarRuleUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    formula?: Prisma.StringFieldUpdateOperationsInput | string;
    explanation?: Prisma.StringFieldUpdateOperationsInput | string;
    examples?: Prisma.GrammarRuleUpdateexamplesInput | string[];
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type GrammarRuleCreateManyInput = {
    id?: string;
    userId: string;
    title?: string | null;
    formula: string;
    explanation: string;
    examples?: Prisma.GrammarRuleCreateexamplesInput | string[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type GrammarRuleUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    formula?: Prisma.StringFieldUpdateOperationsInput | string;
    explanation?: Prisma.StringFieldUpdateOperationsInput | string;
    examples?: Prisma.GrammarRuleUpdateexamplesInput | string[];
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type GrammarRuleUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    formula?: Prisma.StringFieldUpdateOperationsInput | string;
    explanation?: Prisma.StringFieldUpdateOperationsInput | string;
    examples?: Prisma.GrammarRuleUpdateexamplesInput | string[];
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type GrammarRuleListRelationFilter = {
    every?: Prisma.GrammarRuleWhereInput;
    some?: Prisma.GrammarRuleWhereInput;
    none?: Prisma.GrammarRuleWhereInput;
};
export type GrammarRuleOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type GrammarRuleCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    formula?: Prisma.SortOrder;
    explanation?: Prisma.SortOrder;
    examples?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type GrammarRuleMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    formula?: Prisma.SortOrder;
    explanation?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type GrammarRuleMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    formula?: Prisma.SortOrder;
    explanation?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type GrammarRuleCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.GrammarRuleCreateWithoutUserInput, Prisma.GrammarRuleUncheckedCreateWithoutUserInput> | Prisma.GrammarRuleCreateWithoutUserInput[] | Prisma.GrammarRuleUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.GrammarRuleCreateOrConnectWithoutUserInput | Prisma.GrammarRuleCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.GrammarRuleCreateManyUserInputEnvelope;
    connect?: Prisma.GrammarRuleWhereUniqueInput | Prisma.GrammarRuleWhereUniqueInput[];
};
export type GrammarRuleUncheckedCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.GrammarRuleCreateWithoutUserInput, Prisma.GrammarRuleUncheckedCreateWithoutUserInput> | Prisma.GrammarRuleCreateWithoutUserInput[] | Prisma.GrammarRuleUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.GrammarRuleCreateOrConnectWithoutUserInput | Prisma.GrammarRuleCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.GrammarRuleCreateManyUserInputEnvelope;
    connect?: Prisma.GrammarRuleWhereUniqueInput | Prisma.GrammarRuleWhereUniqueInput[];
};
export type GrammarRuleUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.GrammarRuleCreateWithoutUserInput, Prisma.GrammarRuleUncheckedCreateWithoutUserInput> | Prisma.GrammarRuleCreateWithoutUserInput[] | Prisma.GrammarRuleUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.GrammarRuleCreateOrConnectWithoutUserInput | Prisma.GrammarRuleCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.GrammarRuleUpsertWithWhereUniqueWithoutUserInput | Prisma.GrammarRuleUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.GrammarRuleCreateManyUserInputEnvelope;
    set?: Prisma.GrammarRuleWhereUniqueInput | Prisma.GrammarRuleWhereUniqueInput[];
    disconnect?: Prisma.GrammarRuleWhereUniqueInput | Prisma.GrammarRuleWhereUniqueInput[];
    delete?: Prisma.GrammarRuleWhereUniqueInput | Prisma.GrammarRuleWhereUniqueInput[];
    connect?: Prisma.GrammarRuleWhereUniqueInput | Prisma.GrammarRuleWhereUniqueInput[];
    update?: Prisma.GrammarRuleUpdateWithWhereUniqueWithoutUserInput | Prisma.GrammarRuleUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.GrammarRuleUpdateManyWithWhereWithoutUserInput | Prisma.GrammarRuleUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.GrammarRuleScalarWhereInput | Prisma.GrammarRuleScalarWhereInput[];
};
export type GrammarRuleUncheckedUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.GrammarRuleCreateWithoutUserInput, Prisma.GrammarRuleUncheckedCreateWithoutUserInput> | Prisma.GrammarRuleCreateWithoutUserInput[] | Prisma.GrammarRuleUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.GrammarRuleCreateOrConnectWithoutUserInput | Prisma.GrammarRuleCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.GrammarRuleUpsertWithWhereUniqueWithoutUserInput | Prisma.GrammarRuleUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.GrammarRuleCreateManyUserInputEnvelope;
    set?: Prisma.GrammarRuleWhereUniqueInput | Prisma.GrammarRuleWhereUniqueInput[];
    disconnect?: Prisma.GrammarRuleWhereUniqueInput | Prisma.GrammarRuleWhereUniqueInput[];
    delete?: Prisma.GrammarRuleWhereUniqueInput | Prisma.GrammarRuleWhereUniqueInput[];
    connect?: Prisma.GrammarRuleWhereUniqueInput | Prisma.GrammarRuleWhereUniqueInput[];
    update?: Prisma.GrammarRuleUpdateWithWhereUniqueWithoutUserInput | Prisma.GrammarRuleUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.GrammarRuleUpdateManyWithWhereWithoutUserInput | Prisma.GrammarRuleUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.GrammarRuleScalarWhereInput | Prisma.GrammarRuleScalarWhereInput[];
};
export type GrammarRuleCreateexamplesInput = {
    set: string[];
};
export type GrammarRuleUpdateexamplesInput = {
    set?: string[];
    push?: string | string[];
};
export type GrammarRuleCreateWithoutUserInput = {
    id?: string;
    title?: string | null;
    formula: string;
    explanation: string;
    examples?: Prisma.GrammarRuleCreateexamplesInput | string[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type GrammarRuleUncheckedCreateWithoutUserInput = {
    id?: string;
    title?: string | null;
    formula: string;
    explanation: string;
    examples?: Prisma.GrammarRuleCreateexamplesInput | string[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type GrammarRuleCreateOrConnectWithoutUserInput = {
    where: Prisma.GrammarRuleWhereUniqueInput;
    create: Prisma.XOR<Prisma.GrammarRuleCreateWithoutUserInput, Prisma.GrammarRuleUncheckedCreateWithoutUserInput>;
};
export type GrammarRuleCreateManyUserInputEnvelope = {
    data: Prisma.GrammarRuleCreateManyUserInput | Prisma.GrammarRuleCreateManyUserInput[];
    skipDuplicates?: boolean;
};
export type GrammarRuleUpsertWithWhereUniqueWithoutUserInput = {
    where: Prisma.GrammarRuleWhereUniqueInput;
    update: Prisma.XOR<Prisma.GrammarRuleUpdateWithoutUserInput, Prisma.GrammarRuleUncheckedUpdateWithoutUserInput>;
    create: Prisma.XOR<Prisma.GrammarRuleCreateWithoutUserInput, Prisma.GrammarRuleUncheckedCreateWithoutUserInput>;
};
export type GrammarRuleUpdateWithWhereUniqueWithoutUserInput = {
    where: Prisma.GrammarRuleWhereUniqueInput;
    data: Prisma.XOR<Prisma.GrammarRuleUpdateWithoutUserInput, Prisma.GrammarRuleUncheckedUpdateWithoutUserInput>;
};
export type GrammarRuleUpdateManyWithWhereWithoutUserInput = {
    where: Prisma.GrammarRuleScalarWhereInput;
    data: Prisma.XOR<Prisma.GrammarRuleUpdateManyMutationInput, Prisma.GrammarRuleUncheckedUpdateManyWithoutUserInput>;
};
export type GrammarRuleScalarWhereInput = {
    AND?: Prisma.GrammarRuleScalarWhereInput | Prisma.GrammarRuleScalarWhereInput[];
    OR?: Prisma.GrammarRuleScalarWhereInput[];
    NOT?: Prisma.GrammarRuleScalarWhereInput | Prisma.GrammarRuleScalarWhereInput[];
    id?: Prisma.StringFilter<"GrammarRule"> | string;
    userId?: Prisma.StringFilter<"GrammarRule"> | string;
    title?: Prisma.StringNullableFilter<"GrammarRule"> | string | null;
    formula?: Prisma.StringFilter<"GrammarRule"> | string;
    explanation?: Prisma.StringFilter<"GrammarRule"> | string;
    examples?: Prisma.StringNullableListFilter<"GrammarRule">;
    createdAt?: Prisma.DateTimeFilter<"GrammarRule"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"GrammarRule"> | Date | string;
};
export type GrammarRuleCreateManyUserInput = {
    id?: string;
    title?: string | null;
    formula: string;
    explanation: string;
    examples?: Prisma.GrammarRuleCreateexamplesInput | string[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type GrammarRuleUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    formula?: Prisma.StringFieldUpdateOperationsInput | string;
    explanation?: Prisma.StringFieldUpdateOperationsInput | string;
    examples?: Prisma.GrammarRuleUpdateexamplesInput | string[];
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type GrammarRuleUncheckedUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    formula?: Prisma.StringFieldUpdateOperationsInput | string;
    explanation?: Prisma.StringFieldUpdateOperationsInput | string;
    examples?: Prisma.GrammarRuleUpdateexamplesInput | string[];
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type GrammarRuleUncheckedUpdateManyWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    formula?: Prisma.StringFieldUpdateOperationsInput | string;
    explanation?: Prisma.StringFieldUpdateOperationsInput | string;
    examples?: Prisma.GrammarRuleUpdateexamplesInput | string[];
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type GrammarRuleSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    title?: boolean;
    formula?: boolean;
    explanation?: boolean;
    examples?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["grammarRule"]>;
export type GrammarRuleSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    title?: boolean;
    formula?: boolean;
    explanation?: boolean;
    examples?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["grammarRule"]>;
export type GrammarRuleSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    title?: boolean;
    formula?: boolean;
    explanation?: boolean;
    examples?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["grammarRule"]>;
export type GrammarRuleSelectScalar = {
    id?: boolean;
    userId?: boolean;
    title?: boolean;
    formula?: boolean;
    explanation?: boolean;
    examples?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type GrammarRuleOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "userId" | "title" | "formula" | "explanation" | "examples" | "createdAt" | "updatedAt", ExtArgs["result"]["grammarRule"]>;
export type GrammarRuleInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type GrammarRuleIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type GrammarRuleIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type $GrammarRulePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "GrammarRule";
    objects: {
        user: Prisma.$UserPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        userId: string;
        title: string | null;
        formula: string;
        explanation: string;
        examples: string[];
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["grammarRule"]>;
    composites: {};
};
export type GrammarRuleGetPayload<S extends boolean | null | undefined | GrammarRuleDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$GrammarRulePayload, S>;
export type GrammarRuleCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<GrammarRuleFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: GrammarRuleCountAggregateInputType | true;
};
export interface GrammarRuleDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['GrammarRule'];
        meta: {
            name: 'GrammarRule';
        };
    };
    findUnique<T extends GrammarRuleFindUniqueArgs>(args: Prisma.SelectSubset<T, GrammarRuleFindUniqueArgs<ExtArgs>>): Prisma.Prisma__GrammarRuleClient<runtime.Types.Result.GetResult<Prisma.$GrammarRulePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends GrammarRuleFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, GrammarRuleFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__GrammarRuleClient<runtime.Types.Result.GetResult<Prisma.$GrammarRulePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends GrammarRuleFindFirstArgs>(args?: Prisma.SelectSubset<T, GrammarRuleFindFirstArgs<ExtArgs>>): Prisma.Prisma__GrammarRuleClient<runtime.Types.Result.GetResult<Prisma.$GrammarRulePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends GrammarRuleFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, GrammarRuleFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__GrammarRuleClient<runtime.Types.Result.GetResult<Prisma.$GrammarRulePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends GrammarRuleFindManyArgs>(args?: Prisma.SelectSubset<T, GrammarRuleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$GrammarRulePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends GrammarRuleCreateArgs>(args: Prisma.SelectSubset<T, GrammarRuleCreateArgs<ExtArgs>>): Prisma.Prisma__GrammarRuleClient<runtime.Types.Result.GetResult<Prisma.$GrammarRulePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends GrammarRuleCreateManyArgs>(args?: Prisma.SelectSubset<T, GrammarRuleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends GrammarRuleCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, GrammarRuleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$GrammarRulePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends GrammarRuleDeleteArgs>(args: Prisma.SelectSubset<T, GrammarRuleDeleteArgs<ExtArgs>>): Prisma.Prisma__GrammarRuleClient<runtime.Types.Result.GetResult<Prisma.$GrammarRulePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends GrammarRuleUpdateArgs>(args: Prisma.SelectSubset<T, GrammarRuleUpdateArgs<ExtArgs>>): Prisma.Prisma__GrammarRuleClient<runtime.Types.Result.GetResult<Prisma.$GrammarRulePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends GrammarRuleDeleteManyArgs>(args?: Prisma.SelectSubset<T, GrammarRuleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends GrammarRuleUpdateManyArgs>(args: Prisma.SelectSubset<T, GrammarRuleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends GrammarRuleUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, GrammarRuleUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$GrammarRulePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends GrammarRuleUpsertArgs>(args: Prisma.SelectSubset<T, GrammarRuleUpsertArgs<ExtArgs>>): Prisma.Prisma__GrammarRuleClient<runtime.Types.Result.GetResult<Prisma.$GrammarRulePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends GrammarRuleCountArgs>(args?: Prisma.Subset<T, GrammarRuleCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], GrammarRuleCountAggregateOutputType> : number>;
    aggregate<T extends GrammarRuleAggregateArgs>(args: Prisma.Subset<T, GrammarRuleAggregateArgs>): Prisma.PrismaPromise<GetGrammarRuleAggregateType<T>>;
    groupBy<T extends GrammarRuleGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: GrammarRuleGroupByArgs['orderBy'];
    } : {
        orderBy?: GrammarRuleGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, GrammarRuleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGrammarRuleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: GrammarRuleFieldRefs;
}
export interface Prisma__GrammarRuleClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    user<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface GrammarRuleFieldRefs {
    readonly id: Prisma.FieldRef<"GrammarRule", 'String'>;
    readonly userId: Prisma.FieldRef<"GrammarRule", 'String'>;
    readonly title: Prisma.FieldRef<"GrammarRule", 'String'>;
    readonly formula: Prisma.FieldRef<"GrammarRule", 'String'>;
    readonly explanation: Prisma.FieldRef<"GrammarRule", 'String'>;
    readonly examples: Prisma.FieldRef<"GrammarRule", 'String[]'>;
    readonly createdAt: Prisma.FieldRef<"GrammarRule", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"GrammarRule", 'DateTime'>;
}
export type GrammarRuleFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.GrammarRuleSelect<ExtArgs> | null;
    omit?: Prisma.GrammarRuleOmit<ExtArgs> | null;
    include?: Prisma.GrammarRuleInclude<ExtArgs> | null;
    where: Prisma.GrammarRuleWhereUniqueInput;
};
export type GrammarRuleFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.GrammarRuleSelect<ExtArgs> | null;
    omit?: Prisma.GrammarRuleOmit<ExtArgs> | null;
    include?: Prisma.GrammarRuleInclude<ExtArgs> | null;
    where: Prisma.GrammarRuleWhereUniqueInput;
};
export type GrammarRuleFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.GrammarRuleSelect<ExtArgs> | null;
    omit?: Prisma.GrammarRuleOmit<ExtArgs> | null;
    include?: Prisma.GrammarRuleInclude<ExtArgs> | null;
    where?: Prisma.GrammarRuleWhereInput;
    orderBy?: Prisma.GrammarRuleOrderByWithRelationInput | Prisma.GrammarRuleOrderByWithRelationInput[];
    cursor?: Prisma.GrammarRuleWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.GrammarRuleScalarFieldEnum | Prisma.GrammarRuleScalarFieldEnum[];
};
export type GrammarRuleFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.GrammarRuleSelect<ExtArgs> | null;
    omit?: Prisma.GrammarRuleOmit<ExtArgs> | null;
    include?: Prisma.GrammarRuleInclude<ExtArgs> | null;
    where?: Prisma.GrammarRuleWhereInput;
    orderBy?: Prisma.GrammarRuleOrderByWithRelationInput | Prisma.GrammarRuleOrderByWithRelationInput[];
    cursor?: Prisma.GrammarRuleWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.GrammarRuleScalarFieldEnum | Prisma.GrammarRuleScalarFieldEnum[];
};
export type GrammarRuleFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.GrammarRuleSelect<ExtArgs> | null;
    omit?: Prisma.GrammarRuleOmit<ExtArgs> | null;
    include?: Prisma.GrammarRuleInclude<ExtArgs> | null;
    where?: Prisma.GrammarRuleWhereInput;
    orderBy?: Prisma.GrammarRuleOrderByWithRelationInput | Prisma.GrammarRuleOrderByWithRelationInput[];
    cursor?: Prisma.GrammarRuleWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.GrammarRuleScalarFieldEnum | Prisma.GrammarRuleScalarFieldEnum[];
};
export type GrammarRuleCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.GrammarRuleSelect<ExtArgs> | null;
    omit?: Prisma.GrammarRuleOmit<ExtArgs> | null;
    include?: Prisma.GrammarRuleInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.GrammarRuleCreateInput, Prisma.GrammarRuleUncheckedCreateInput>;
};
export type GrammarRuleCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.GrammarRuleCreateManyInput | Prisma.GrammarRuleCreateManyInput[];
    skipDuplicates?: boolean;
};
export type GrammarRuleCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.GrammarRuleSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.GrammarRuleOmit<ExtArgs> | null;
    data: Prisma.GrammarRuleCreateManyInput | Prisma.GrammarRuleCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.GrammarRuleIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type GrammarRuleUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.GrammarRuleSelect<ExtArgs> | null;
    omit?: Prisma.GrammarRuleOmit<ExtArgs> | null;
    include?: Prisma.GrammarRuleInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.GrammarRuleUpdateInput, Prisma.GrammarRuleUncheckedUpdateInput>;
    where: Prisma.GrammarRuleWhereUniqueInput;
};
export type GrammarRuleUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.GrammarRuleUpdateManyMutationInput, Prisma.GrammarRuleUncheckedUpdateManyInput>;
    where?: Prisma.GrammarRuleWhereInput;
    limit?: number;
};
export type GrammarRuleUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.GrammarRuleSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.GrammarRuleOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.GrammarRuleUpdateManyMutationInput, Prisma.GrammarRuleUncheckedUpdateManyInput>;
    where?: Prisma.GrammarRuleWhereInput;
    limit?: number;
    include?: Prisma.GrammarRuleIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type GrammarRuleUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.GrammarRuleSelect<ExtArgs> | null;
    omit?: Prisma.GrammarRuleOmit<ExtArgs> | null;
    include?: Prisma.GrammarRuleInclude<ExtArgs> | null;
    where: Prisma.GrammarRuleWhereUniqueInput;
    create: Prisma.XOR<Prisma.GrammarRuleCreateInput, Prisma.GrammarRuleUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.GrammarRuleUpdateInput, Prisma.GrammarRuleUncheckedUpdateInput>;
};
export type GrammarRuleDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.GrammarRuleSelect<ExtArgs> | null;
    omit?: Prisma.GrammarRuleOmit<ExtArgs> | null;
    include?: Prisma.GrammarRuleInclude<ExtArgs> | null;
    where: Prisma.GrammarRuleWhereUniqueInput;
};
export type GrammarRuleDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.GrammarRuleWhereInput;
    limit?: number;
};
export type GrammarRuleDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.GrammarRuleSelect<ExtArgs> | null;
    omit?: Prisma.GrammarRuleOmit<ExtArgs> | null;
    include?: Prisma.GrammarRuleInclude<ExtArgs> | null;
};
