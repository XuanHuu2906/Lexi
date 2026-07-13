import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums";
import type * as Prisma from "../internal/prismaNamespace";
export type ConversationLogModel = runtime.Types.Result.DefaultSelection<Prisma.$ConversationLogPayload>;
export type AggregateConversationLog = {
    _count: ConversationLogCountAggregateOutputType | null;
    _min: ConversationLogMinAggregateOutputType | null;
    _max: ConversationLogMaxAggregateOutputType | null;
};
export type ConversationLogMinAggregateOutputType = {
    id: string | null;
    userId: string | null;
    scenario: string | null;
    feedback: string | null;
    status: $Enums.ConversationStatus | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type ConversationLogMaxAggregateOutputType = {
    id: string | null;
    userId: string | null;
    scenario: string | null;
    feedback: string | null;
    status: $Enums.ConversationStatus | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type ConversationLogCountAggregateOutputType = {
    id: number;
    userId: number;
    scenario: number;
    transcript: number;
    feedback: number;
    status: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type ConversationLogMinAggregateInputType = {
    id?: true;
    userId?: true;
    scenario?: true;
    feedback?: true;
    status?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type ConversationLogMaxAggregateInputType = {
    id?: true;
    userId?: true;
    scenario?: true;
    feedback?: true;
    status?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type ConversationLogCountAggregateInputType = {
    id?: true;
    userId?: true;
    scenario?: true;
    transcript?: true;
    feedback?: true;
    status?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type ConversationLogAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ConversationLogWhereInput;
    orderBy?: Prisma.ConversationLogOrderByWithRelationInput | Prisma.ConversationLogOrderByWithRelationInput[];
    cursor?: Prisma.ConversationLogWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ConversationLogCountAggregateInputType;
    _min?: ConversationLogMinAggregateInputType;
    _max?: ConversationLogMaxAggregateInputType;
};
export type GetConversationLogAggregateType<T extends ConversationLogAggregateArgs> = {
    [P in keyof T & keyof AggregateConversationLog]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateConversationLog[P]> : Prisma.GetScalarType<T[P], AggregateConversationLog[P]>;
};
export type ConversationLogGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ConversationLogWhereInput;
    orderBy?: Prisma.ConversationLogOrderByWithAggregationInput | Prisma.ConversationLogOrderByWithAggregationInput[];
    by: Prisma.ConversationLogScalarFieldEnum[] | Prisma.ConversationLogScalarFieldEnum;
    having?: Prisma.ConversationLogScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ConversationLogCountAggregateInputType | true;
    _min?: ConversationLogMinAggregateInputType;
    _max?: ConversationLogMaxAggregateInputType;
};
export type ConversationLogGroupByOutputType = {
    id: string;
    userId: string;
    scenario: string;
    transcript: runtime.JsonValue;
    feedback: string | null;
    status: $Enums.ConversationStatus;
    createdAt: Date;
    updatedAt: Date;
    _count: ConversationLogCountAggregateOutputType | null;
    _min: ConversationLogMinAggregateOutputType | null;
    _max: ConversationLogMaxAggregateOutputType | null;
};
export type GetConversationLogGroupByPayload<T extends ConversationLogGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ConversationLogGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ConversationLogGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ConversationLogGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ConversationLogGroupByOutputType[P]>;
}>>;
export type ConversationLogWhereInput = {
    AND?: Prisma.ConversationLogWhereInput | Prisma.ConversationLogWhereInput[];
    OR?: Prisma.ConversationLogWhereInput[];
    NOT?: Prisma.ConversationLogWhereInput | Prisma.ConversationLogWhereInput[];
    id?: Prisma.StringFilter<"ConversationLog"> | string;
    userId?: Prisma.StringFilter<"ConversationLog"> | string;
    scenario?: Prisma.StringFilter<"ConversationLog"> | string;
    transcript?: Prisma.JsonFilter<"ConversationLog">;
    feedback?: Prisma.StringNullableFilter<"ConversationLog"> | string | null;
    status?: Prisma.EnumConversationStatusFilter<"ConversationLog"> | $Enums.ConversationStatus;
    createdAt?: Prisma.DateTimeFilter<"ConversationLog"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"ConversationLog"> | Date | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
};
export type ConversationLogOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    scenario?: Prisma.SortOrder;
    transcript?: Prisma.SortOrder;
    feedback?: Prisma.SortOrderInput | Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    user?: Prisma.UserOrderByWithRelationInput;
};
export type ConversationLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.ConversationLogWhereInput | Prisma.ConversationLogWhereInput[];
    OR?: Prisma.ConversationLogWhereInput[];
    NOT?: Prisma.ConversationLogWhereInput | Prisma.ConversationLogWhereInput[];
    userId?: Prisma.StringFilter<"ConversationLog"> | string;
    scenario?: Prisma.StringFilter<"ConversationLog"> | string;
    transcript?: Prisma.JsonFilter<"ConversationLog">;
    feedback?: Prisma.StringNullableFilter<"ConversationLog"> | string | null;
    status?: Prisma.EnumConversationStatusFilter<"ConversationLog"> | $Enums.ConversationStatus;
    createdAt?: Prisma.DateTimeFilter<"ConversationLog"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"ConversationLog"> | Date | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
}, "id">;
export type ConversationLogOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    scenario?: Prisma.SortOrder;
    transcript?: Prisma.SortOrder;
    feedback?: Prisma.SortOrderInput | Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.ConversationLogCountOrderByAggregateInput;
    _max?: Prisma.ConversationLogMaxOrderByAggregateInput;
    _min?: Prisma.ConversationLogMinOrderByAggregateInput;
};
export type ConversationLogScalarWhereWithAggregatesInput = {
    AND?: Prisma.ConversationLogScalarWhereWithAggregatesInput | Prisma.ConversationLogScalarWhereWithAggregatesInput[];
    OR?: Prisma.ConversationLogScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ConversationLogScalarWhereWithAggregatesInput | Prisma.ConversationLogScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"ConversationLog"> | string;
    userId?: Prisma.StringWithAggregatesFilter<"ConversationLog"> | string;
    scenario?: Prisma.StringWithAggregatesFilter<"ConversationLog"> | string;
    transcript?: Prisma.JsonWithAggregatesFilter<"ConversationLog">;
    feedback?: Prisma.StringNullableWithAggregatesFilter<"ConversationLog"> | string | null;
    status?: Prisma.EnumConversationStatusWithAggregatesFilter<"ConversationLog"> | $Enums.ConversationStatus;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"ConversationLog"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"ConversationLog"> | Date | string;
};
export type ConversationLogCreateInput = {
    id?: string;
    scenario: string;
    transcript?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    feedback?: string | null;
    status?: $Enums.ConversationStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    user: Prisma.UserCreateNestedOneWithoutConversationLogsInput;
};
export type ConversationLogUncheckedCreateInput = {
    id?: string;
    userId: string;
    scenario: string;
    transcript?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    feedback?: string | null;
    status?: $Enums.ConversationStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ConversationLogUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    scenario?: Prisma.StringFieldUpdateOperationsInput | string;
    transcript?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    feedback?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumConversationStatusFieldUpdateOperationsInput | $Enums.ConversationStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutConversationLogsNestedInput;
};
export type ConversationLogUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    scenario?: Prisma.StringFieldUpdateOperationsInput | string;
    transcript?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    feedback?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumConversationStatusFieldUpdateOperationsInput | $Enums.ConversationStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ConversationLogCreateManyInput = {
    id?: string;
    userId: string;
    scenario: string;
    transcript?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    feedback?: string | null;
    status?: $Enums.ConversationStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ConversationLogUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    scenario?: Prisma.StringFieldUpdateOperationsInput | string;
    transcript?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    feedback?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumConversationStatusFieldUpdateOperationsInput | $Enums.ConversationStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ConversationLogUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    scenario?: Prisma.StringFieldUpdateOperationsInput | string;
    transcript?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    feedback?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumConversationStatusFieldUpdateOperationsInput | $Enums.ConversationStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ConversationLogListRelationFilter = {
    every?: Prisma.ConversationLogWhereInput;
    some?: Prisma.ConversationLogWhereInput;
    none?: Prisma.ConversationLogWhereInput;
};
export type ConversationLogOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ConversationLogCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    scenario?: Prisma.SortOrder;
    transcript?: Prisma.SortOrder;
    feedback?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ConversationLogMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    scenario?: Prisma.SortOrder;
    feedback?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ConversationLogMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    scenario?: Prisma.SortOrder;
    feedback?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ConversationLogCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.ConversationLogCreateWithoutUserInput, Prisma.ConversationLogUncheckedCreateWithoutUserInput> | Prisma.ConversationLogCreateWithoutUserInput[] | Prisma.ConversationLogUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.ConversationLogCreateOrConnectWithoutUserInput | Prisma.ConversationLogCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.ConversationLogCreateManyUserInputEnvelope;
    connect?: Prisma.ConversationLogWhereUniqueInput | Prisma.ConversationLogWhereUniqueInput[];
};
export type ConversationLogUncheckedCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.ConversationLogCreateWithoutUserInput, Prisma.ConversationLogUncheckedCreateWithoutUserInput> | Prisma.ConversationLogCreateWithoutUserInput[] | Prisma.ConversationLogUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.ConversationLogCreateOrConnectWithoutUserInput | Prisma.ConversationLogCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.ConversationLogCreateManyUserInputEnvelope;
    connect?: Prisma.ConversationLogWhereUniqueInput | Prisma.ConversationLogWhereUniqueInput[];
};
export type ConversationLogUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.ConversationLogCreateWithoutUserInput, Prisma.ConversationLogUncheckedCreateWithoutUserInput> | Prisma.ConversationLogCreateWithoutUserInput[] | Prisma.ConversationLogUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.ConversationLogCreateOrConnectWithoutUserInput | Prisma.ConversationLogCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.ConversationLogUpsertWithWhereUniqueWithoutUserInput | Prisma.ConversationLogUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.ConversationLogCreateManyUserInputEnvelope;
    set?: Prisma.ConversationLogWhereUniqueInput | Prisma.ConversationLogWhereUniqueInput[];
    disconnect?: Prisma.ConversationLogWhereUniqueInput | Prisma.ConversationLogWhereUniqueInput[];
    delete?: Prisma.ConversationLogWhereUniqueInput | Prisma.ConversationLogWhereUniqueInput[];
    connect?: Prisma.ConversationLogWhereUniqueInput | Prisma.ConversationLogWhereUniqueInput[];
    update?: Prisma.ConversationLogUpdateWithWhereUniqueWithoutUserInput | Prisma.ConversationLogUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.ConversationLogUpdateManyWithWhereWithoutUserInput | Prisma.ConversationLogUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.ConversationLogScalarWhereInput | Prisma.ConversationLogScalarWhereInput[];
};
export type ConversationLogUncheckedUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.ConversationLogCreateWithoutUserInput, Prisma.ConversationLogUncheckedCreateWithoutUserInput> | Prisma.ConversationLogCreateWithoutUserInput[] | Prisma.ConversationLogUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.ConversationLogCreateOrConnectWithoutUserInput | Prisma.ConversationLogCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.ConversationLogUpsertWithWhereUniqueWithoutUserInput | Prisma.ConversationLogUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.ConversationLogCreateManyUserInputEnvelope;
    set?: Prisma.ConversationLogWhereUniqueInput | Prisma.ConversationLogWhereUniqueInput[];
    disconnect?: Prisma.ConversationLogWhereUniqueInput | Prisma.ConversationLogWhereUniqueInput[];
    delete?: Prisma.ConversationLogWhereUniqueInput | Prisma.ConversationLogWhereUniqueInput[];
    connect?: Prisma.ConversationLogWhereUniqueInput | Prisma.ConversationLogWhereUniqueInput[];
    update?: Prisma.ConversationLogUpdateWithWhereUniqueWithoutUserInput | Prisma.ConversationLogUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.ConversationLogUpdateManyWithWhereWithoutUserInput | Prisma.ConversationLogUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.ConversationLogScalarWhereInput | Prisma.ConversationLogScalarWhereInput[];
};
export type EnumConversationStatusFieldUpdateOperationsInput = {
    set?: $Enums.ConversationStatus;
};
export type ConversationLogCreateWithoutUserInput = {
    id?: string;
    scenario: string;
    transcript?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    feedback?: string | null;
    status?: $Enums.ConversationStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ConversationLogUncheckedCreateWithoutUserInput = {
    id?: string;
    scenario: string;
    transcript?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    feedback?: string | null;
    status?: $Enums.ConversationStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ConversationLogCreateOrConnectWithoutUserInput = {
    where: Prisma.ConversationLogWhereUniqueInput;
    create: Prisma.XOR<Prisma.ConversationLogCreateWithoutUserInput, Prisma.ConversationLogUncheckedCreateWithoutUserInput>;
};
export type ConversationLogCreateManyUserInputEnvelope = {
    data: Prisma.ConversationLogCreateManyUserInput | Prisma.ConversationLogCreateManyUserInput[];
    skipDuplicates?: boolean;
};
export type ConversationLogUpsertWithWhereUniqueWithoutUserInput = {
    where: Prisma.ConversationLogWhereUniqueInput;
    update: Prisma.XOR<Prisma.ConversationLogUpdateWithoutUserInput, Prisma.ConversationLogUncheckedUpdateWithoutUserInput>;
    create: Prisma.XOR<Prisma.ConversationLogCreateWithoutUserInput, Prisma.ConversationLogUncheckedCreateWithoutUserInput>;
};
export type ConversationLogUpdateWithWhereUniqueWithoutUserInput = {
    where: Prisma.ConversationLogWhereUniqueInput;
    data: Prisma.XOR<Prisma.ConversationLogUpdateWithoutUserInput, Prisma.ConversationLogUncheckedUpdateWithoutUserInput>;
};
export type ConversationLogUpdateManyWithWhereWithoutUserInput = {
    where: Prisma.ConversationLogScalarWhereInput;
    data: Prisma.XOR<Prisma.ConversationLogUpdateManyMutationInput, Prisma.ConversationLogUncheckedUpdateManyWithoutUserInput>;
};
export type ConversationLogScalarWhereInput = {
    AND?: Prisma.ConversationLogScalarWhereInput | Prisma.ConversationLogScalarWhereInput[];
    OR?: Prisma.ConversationLogScalarWhereInput[];
    NOT?: Prisma.ConversationLogScalarWhereInput | Prisma.ConversationLogScalarWhereInput[];
    id?: Prisma.StringFilter<"ConversationLog"> | string;
    userId?: Prisma.StringFilter<"ConversationLog"> | string;
    scenario?: Prisma.StringFilter<"ConversationLog"> | string;
    transcript?: Prisma.JsonFilter<"ConversationLog">;
    feedback?: Prisma.StringNullableFilter<"ConversationLog"> | string | null;
    status?: Prisma.EnumConversationStatusFilter<"ConversationLog"> | $Enums.ConversationStatus;
    createdAt?: Prisma.DateTimeFilter<"ConversationLog"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"ConversationLog"> | Date | string;
};
export type ConversationLogCreateManyUserInput = {
    id?: string;
    scenario: string;
    transcript?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    feedback?: string | null;
    status?: $Enums.ConversationStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ConversationLogUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    scenario?: Prisma.StringFieldUpdateOperationsInput | string;
    transcript?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    feedback?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumConversationStatusFieldUpdateOperationsInput | $Enums.ConversationStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ConversationLogUncheckedUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    scenario?: Prisma.StringFieldUpdateOperationsInput | string;
    transcript?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    feedback?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumConversationStatusFieldUpdateOperationsInput | $Enums.ConversationStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ConversationLogUncheckedUpdateManyWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    scenario?: Prisma.StringFieldUpdateOperationsInput | string;
    transcript?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    feedback?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumConversationStatusFieldUpdateOperationsInput | $Enums.ConversationStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ConversationLogSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    scenario?: boolean;
    transcript?: boolean;
    feedback?: boolean;
    status?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["conversationLog"]>;
export type ConversationLogSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    scenario?: boolean;
    transcript?: boolean;
    feedback?: boolean;
    status?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["conversationLog"]>;
export type ConversationLogSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    scenario?: boolean;
    transcript?: boolean;
    feedback?: boolean;
    status?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["conversationLog"]>;
export type ConversationLogSelectScalar = {
    id?: boolean;
    userId?: boolean;
    scenario?: boolean;
    transcript?: boolean;
    feedback?: boolean;
    status?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type ConversationLogOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "userId" | "scenario" | "transcript" | "feedback" | "status" | "createdAt" | "updatedAt", ExtArgs["result"]["conversationLog"]>;
export type ConversationLogInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type ConversationLogIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type ConversationLogIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type $ConversationLogPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ConversationLog";
    objects: {
        user: Prisma.$UserPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        userId: string;
        scenario: string;
        transcript: runtime.JsonValue;
        feedback: string | null;
        status: $Enums.ConversationStatus;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["conversationLog"]>;
    composites: {};
};
export type ConversationLogGetPayload<S extends boolean | null | undefined | ConversationLogDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ConversationLogPayload, S>;
export type ConversationLogCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ConversationLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ConversationLogCountAggregateInputType | true;
};
export interface ConversationLogDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ConversationLog'];
        meta: {
            name: 'ConversationLog';
        };
    };
    findUnique<T extends ConversationLogFindUniqueArgs>(args: Prisma.SelectSubset<T, ConversationLogFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ConversationLogClient<runtime.Types.Result.GetResult<Prisma.$ConversationLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ConversationLogFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ConversationLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ConversationLogClient<runtime.Types.Result.GetResult<Prisma.$ConversationLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ConversationLogFindFirstArgs>(args?: Prisma.SelectSubset<T, ConversationLogFindFirstArgs<ExtArgs>>): Prisma.Prisma__ConversationLogClient<runtime.Types.Result.GetResult<Prisma.$ConversationLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ConversationLogFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ConversationLogFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ConversationLogClient<runtime.Types.Result.GetResult<Prisma.$ConversationLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ConversationLogFindManyArgs>(args?: Prisma.SelectSubset<T, ConversationLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ConversationLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ConversationLogCreateArgs>(args: Prisma.SelectSubset<T, ConversationLogCreateArgs<ExtArgs>>): Prisma.Prisma__ConversationLogClient<runtime.Types.Result.GetResult<Prisma.$ConversationLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ConversationLogCreateManyArgs>(args?: Prisma.SelectSubset<T, ConversationLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ConversationLogCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ConversationLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ConversationLogPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ConversationLogDeleteArgs>(args: Prisma.SelectSubset<T, ConversationLogDeleteArgs<ExtArgs>>): Prisma.Prisma__ConversationLogClient<runtime.Types.Result.GetResult<Prisma.$ConversationLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ConversationLogUpdateArgs>(args: Prisma.SelectSubset<T, ConversationLogUpdateArgs<ExtArgs>>): Prisma.Prisma__ConversationLogClient<runtime.Types.Result.GetResult<Prisma.$ConversationLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ConversationLogDeleteManyArgs>(args?: Prisma.SelectSubset<T, ConversationLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ConversationLogUpdateManyArgs>(args: Prisma.SelectSubset<T, ConversationLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ConversationLogUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ConversationLogUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ConversationLogPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ConversationLogUpsertArgs>(args: Prisma.SelectSubset<T, ConversationLogUpsertArgs<ExtArgs>>): Prisma.Prisma__ConversationLogClient<runtime.Types.Result.GetResult<Prisma.$ConversationLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ConversationLogCountArgs>(args?: Prisma.Subset<T, ConversationLogCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ConversationLogCountAggregateOutputType> : number>;
    aggregate<T extends ConversationLogAggregateArgs>(args: Prisma.Subset<T, ConversationLogAggregateArgs>): Prisma.PrismaPromise<GetConversationLogAggregateType<T>>;
    groupBy<T extends ConversationLogGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ConversationLogGroupByArgs['orderBy'];
    } : {
        orderBy?: ConversationLogGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ConversationLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetConversationLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ConversationLogFieldRefs;
}
export interface Prisma__ConversationLogClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    user<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ConversationLogFieldRefs {
    readonly id: Prisma.FieldRef<"ConversationLog", 'String'>;
    readonly userId: Prisma.FieldRef<"ConversationLog", 'String'>;
    readonly scenario: Prisma.FieldRef<"ConversationLog", 'String'>;
    readonly transcript: Prisma.FieldRef<"ConversationLog", 'Json'>;
    readonly feedback: Prisma.FieldRef<"ConversationLog", 'String'>;
    readonly status: Prisma.FieldRef<"ConversationLog", 'ConversationStatus'>;
    readonly createdAt: Prisma.FieldRef<"ConversationLog", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"ConversationLog", 'DateTime'>;
}
export type ConversationLogFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ConversationLogSelect<ExtArgs> | null;
    omit?: Prisma.ConversationLogOmit<ExtArgs> | null;
    include?: Prisma.ConversationLogInclude<ExtArgs> | null;
    where: Prisma.ConversationLogWhereUniqueInput;
};
export type ConversationLogFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ConversationLogSelect<ExtArgs> | null;
    omit?: Prisma.ConversationLogOmit<ExtArgs> | null;
    include?: Prisma.ConversationLogInclude<ExtArgs> | null;
    where: Prisma.ConversationLogWhereUniqueInput;
};
export type ConversationLogFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ConversationLogSelect<ExtArgs> | null;
    omit?: Prisma.ConversationLogOmit<ExtArgs> | null;
    include?: Prisma.ConversationLogInclude<ExtArgs> | null;
    where?: Prisma.ConversationLogWhereInput;
    orderBy?: Prisma.ConversationLogOrderByWithRelationInput | Prisma.ConversationLogOrderByWithRelationInput[];
    cursor?: Prisma.ConversationLogWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ConversationLogScalarFieldEnum | Prisma.ConversationLogScalarFieldEnum[];
};
export type ConversationLogFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ConversationLogSelect<ExtArgs> | null;
    omit?: Prisma.ConversationLogOmit<ExtArgs> | null;
    include?: Prisma.ConversationLogInclude<ExtArgs> | null;
    where?: Prisma.ConversationLogWhereInput;
    orderBy?: Prisma.ConversationLogOrderByWithRelationInput | Prisma.ConversationLogOrderByWithRelationInput[];
    cursor?: Prisma.ConversationLogWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ConversationLogScalarFieldEnum | Prisma.ConversationLogScalarFieldEnum[];
};
export type ConversationLogFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ConversationLogSelect<ExtArgs> | null;
    omit?: Prisma.ConversationLogOmit<ExtArgs> | null;
    include?: Prisma.ConversationLogInclude<ExtArgs> | null;
    where?: Prisma.ConversationLogWhereInput;
    orderBy?: Prisma.ConversationLogOrderByWithRelationInput | Prisma.ConversationLogOrderByWithRelationInput[];
    cursor?: Prisma.ConversationLogWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ConversationLogScalarFieldEnum | Prisma.ConversationLogScalarFieldEnum[];
};
export type ConversationLogCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ConversationLogSelect<ExtArgs> | null;
    omit?: Prisma.ConversationLogOmit<ExtArgs> | null;
    include?: Prisma.ConversationLogInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ConversationLogCreateInput, Prisma.ConversationLogUncheckedCreateInput>;
};
export type ConversationLogCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ConversationLogCreateManyInput | Prisma.ConversationLogCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ConversationLogCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ConversationLogSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ConversationLogOmit<ExtArgs> | null;
    data: Prisma.ConversationLogCreateManyInput | Prisma.ConversationLogCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.ConversationLogIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type ConversationLogUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ConversationLogSelect<ExtArgs> | null;
    omit?: Prisma.ConversationLogOmit<ExtArgs> | null;
    include?: Prisma.ConversationLogInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ConversationLogUpdateInput, Prisma.ConversationLogUncheckedUpdateInput>;
    where: Prisma.ConversationLogWhereUniqueInput;
};
export type ConversationLogUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ConversationLogUpdateManyMutationInput, Prisma.ConversationLogUncheckedUpdateManyInput>;
    where?: Prisma.ConversationLogWhereInput;
    limit?: number;
};
export type ConversationLogUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ConversationLogSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ConversationLogOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ConversationLogUpdateManyMutationInput, Prisma.ConversationLogUncheckedUpdateManyInput>;
    where?: Prisma.ConversationLogWhereInput;
    limit?: number;
    include?: Prisma.ConversationLogIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type ConversationLogUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ConversationLogSelect<ExtArgs> | null;
    omit?: Prisma.ConversationLogOmit<ExtArgs> | null;
    include?: Prisma.ConversationLogInclude<ExtArgs> | null;
    where: Prisma.ConversationLogWhereUniqueInput;
    create: Prisma.XOR<Prisma.ConversationLogCreateInput, Prisma.ConversationLogUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ConversationLogUpdateInput, Prisma.ConversationLogUncheckedUpdateInput>;
};
export type ConversationLogDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ConversationLogSelect<ExtArgs> | null;
    omit?: Prisma.ConversationLogOmit<ExtArgs> | null;
    include?: Prisma.ConversationLogInclude<ExtArgs> | null;
    where: Prisma.ConversationLogWhereUniqueInput;
};
export type ConversationLogDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ConversationLogWhereInput;
    limit?: number;
};
export type ConversationLogDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ConversationLogSelect<ExtArgs> | null;
    omit?: Prisma.ConversationLogOmit<ExtArgs> | null;
    include?: Prisma.ConversationLogInclude<ExtArgs> | null;
};
