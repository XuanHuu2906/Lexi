import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums";
import type * as Prisma from "../internal/prismaNamespace";
export type ChatThreadModel = runtime.Types.Result.DefaultSelection<Prisma.$ChatThreadPayload>;
export type AggregateChatThread = {
    _count: ChatThreadCountAggregateOutputType | null;
    _min: ChatThreadMinAggregateOutputType | null;
    _max: ChatThreadMaxAggregateOutputType | null;
};
export type ChatThreadMinAggregateOutputType = {
    id: string | null;
    userId: string | null;
    kind: $Enums.ChatKind | null;
    title: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type ChatThreadMaxAggregateOutputType = {
    id: string | null;
    userId: string | null;
    kind: $Enums.ChatKind | null;
    title: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type ChatThreadCountAggregateOutputType = {
    id: number;
    userId: number;
    kind: number;
    title: number;
    messages: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type ChatThreadMinAggregateInputType = {
    id?: true;
    userId?: true;
    kind?: true;
    title?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type ChatThreadMaxAggregateInputType = {
    id?: true;
    userId?: true;
    kind?: true;
    title?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type ChatThreadCountAggregateInputType = {
    id?: true;
    userId?: true;
    kind?: true;
    title?: true;
    messages?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type ChatThreadAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ChatThreadWhereInput;
    orderBy?: Prisma.ChatThreadOrderByWithRelationInput | Prisma.ChatThreadOrderByWithRelationInput[];
    cursor?: Prisma.ChatThreadWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ChatThreadCountAggregateInputType;
    _min?: ChatThreadMinAggregateInputType;
    _max?: ChatThreadMaxAggregateInputType;
};
export type GetChatThreadAggregateType<T extends ChatThreadAggregateArgs> = {
    [P in keyof T & keyof AggregateChatThread]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateChatThread[P]> : Prisma.GetScalarType<T[P], AggregateChatThread[P]>;
};
export type ChatThreadGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ChatThreadWhereInput;
    orderBy?: Prisma.ChatThreadOrderByWithAggregationInput | Prisma.ChatThreadOrderByWithAggregationInput[];
    by: Prisma.ChatThreadScalarFieldEnum[] | Prisma.ChatThreadScalarFieldEnum;
    having?: Prisma.ChatThreadScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ChatThreadCountAggregateInputType | true;
    _min?: ChatThreadMinAggregateInputType;
    _max?: ChatThreadMaxAggregateInputType;
};
export type ChatThreadGroupByOutputType = {
    id: string;
    userId: string;
    kind: $Enums.ChatKind;
    title: string;
    messages: runtime.JsonValue;
    createdAt: Date;
    updatedAt: Date;
    _count: ChatThreadCountAggregateOutputType | null;
    _min: ChatThreadMinAggregateOutputType | null;
    _max: ChatThreadMaxAggregateOutputType | null;
};
export type GetChatThreadGroupByPayload<T extends ChatThreadGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ChatThreadGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ChatThreadGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ChatThreadGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ChatThreadGroupByOutputType[P]>;
}>>;
export type ChatThreadWhereInput = {
    AND?: Prisma.ChatThreadWhereInput | Prisma.ChatThreadWhereInput[];
    OR?: Prisma.ChatThreadWhereInput[];
    NOT?: Prisma.ChatThreadWhereInput | Prisma.ChatThreadWhereInput[];
    id?: Prisma.StringFilter<"ChatThread"> | string;
    userId?: Prisma.StringFilter<"ChatThread"> | string;
    kind?: Prisma.EnumChatKindFilter<"ChatThread"> | $Enums.ChatKind;
    title?: Prisma.StringFilter<"ChatThread"> | string;
    messages?: Prisma.JsonFilter<"ChatThread">;
    createdAt?: Prisma.DateTimeFilter<"ChatThread"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"ChatThread"> | Date | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
};
export type ChatThreadOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    kind?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    messages?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    user?: Prisma.UserOrderByWithRelationInput;
};
export type ChatThreadWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.ChatThreadWhereInput | Prisma.ChatThreadWhereInput[];
    OR?: Prisma.ChatThreadWhereInput[];
    NOT?: Prisma.ChatThreadWhereInput | Prisma.ChatThreadWhereInput[];
    userId?: Prisma.StringFilter<"ChatThread"> | string;
    kind?: Prisma.EnumChatKindFilter<"ChatThread"> | $Enums.ChatKind;
    title?: Prisma.StringFilter<"ChatThread"> | string;
    messages?: Prisma.JsonFilter<"ChatThread">;
    createdAt?: Prisma.DateTimeFilter<"ChatThread"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"ChatThread"> | Date | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
}, "id">;
export type ChatThreadOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    kind?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    messages?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.ChatThreadCountOrderByAggregateInput;
    _max?: Prisma.ChatThreadMaxOrderByAggregateInput;
    _min?: Prisma.ChatThreadMinOrderByAggregateInput;
};
export type ChatThreadScalarWhereWithAggregatesInput = {
    AND?: Prisma.ChatThreadScalarWhereWithAggregatesInput | Prisma.ChatThreadScalarWhereWithAggregatesInput[];
    OR?: Prisma.ChatThreadScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ChatThreadScalarWhereWithAggregatesInput | Prisma.ChatThreadScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"ChatThread"> | string;
    userId?: Prisma.StringWithAggregatesFilter<"ChatThread"> | string;
    kind?: Prisma.EnumChatKindWithAggregatesFilter<"ChatThread"> | $Enums.ChatKind;
    title?: Prisma.StringWithAggregatesFilter<"ChatThread"> | string;
    messages?: Prisma.JsonWithAggregatesFilter<"ChatThread">;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"ChatThread"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"ChatThread"> | Date | string;
};
export type ChatThreadCreateInput = {
    id?: string;
    kind: $Enums.ChatKind;
    title: string;
    messages?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    user: Prisma.UserCreateNestedOneWithoutChatThreadsInput;
};
export type ChatThreadUncheckedCreateInput = {
    id?: string;
    userId: string;
    kind: $Enums.ChatKind;
    title: string;
    messages?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ChatThreadUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    kind?: Prisma.EnumChatKindFieldUpdateOperationsInput | $Enums.ChatKind;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    messages?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutChatThreadsNestedInput;
};
export type ChatThreadUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    kind?: Prisma.EnumChatKindFieldUpdateOperationsInput | $Enums.ChatKind;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    messages?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ChatThreadCreateManyInput = {
    id?: string;
    userId: string;
    kind: $Enums.ChatKind;
    title: string;
    messages?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ChatThreadUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    kind?: Prisma.EnumChatKindFieldUpdateOperationsInput | $Enums.ChatKind;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    messages?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ChatThreadUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    kind?: Prisma.EnumChatKindFieldUpdateOperationsInput | $Enums.ChatKind;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    messages?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ChatThreadListRelationFilter = {
    every?: Prisma.ChatThreadWhereInput;
    some?: Prisma.ChatThreadWhereInput;
    none?: Prisma.ChatThreadWhereInput;
};
export type ChatThreadOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ChatThreadCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    kind?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    messages?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ChatThreadMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    kind?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ChatThreadMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    kind?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ChatThreadCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.ChatThreadCreateWithoutUserInput, Prisma.ChatThreadUncheckedCreateWithoutUserInput> | Prisma.ChatThreadCreateWithoutUserInput[] | Prisma.ChatThreadUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.ChatThreadCreateOrConnectWithoutUserInput | Prisma.ChatThreadCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.ChatThreadCreateManyUserInputEnvelope;
    connect?: Prisma.ChatThreadWhereUniqueInput | Prisma.ChatThreadWhereUniqueInput[];
};
export type ChatThreadUncheckedCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.ChatThreadCreateWithoutUserInput, Prisma.ChatThreadUncheckedCreateWithoutUserInput> | Prisma.ChatThreadCreateWithoutUserInput[] | Prisma.ChatThreadUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.ChatThreadCreateOrConnectWithoutUserInput | Prisma.ChatThreadCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.ChatThreadCreateManyUserInputEnvelope;
    connect?: Prisma.ChatThreadWhereUniqueInput | Prisma.ChatThreadWhereUniqueInput[];
};
export type ChatThreadUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.ChatThreadCreateWithoutUserInput, Prisma.ChatThreadUncheckedCreateWithoutUserInput> | Prisma.ChatThreadCreateWithoutUserInput[] | Prisma.ChatThreadUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.ChatThreadCreateOrConnectWithoutUserInput | Prisma.ChatThreadCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.ChatThreadUpsertWithWhereUniqueWithoutUserInput | Prisma.ChatThreadUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.ChatThreadCreateManyUserInputEnvelope;
    set?: Prisma.ChatThreadWhereUniqueInput | Prisma.ChatThreadWhereUniqueInput[];
    disconnect?: Prisma.ChatThreadWhereUniqueInput | Prisma.ChatThreadWhereUniqueInput[];
    delete?: Prisma.ChatThreadWhereUniqueInput | Prisma.ChatThreadWhereUniqueInput[];
    connect?: Prisma.ChatThreadWhereUniqueInput | Prisma.ChatThreadWhereUniqueInput[];
    update?: Prisma.ChatThreadUpdateWithWhereUniqueWithoutUserInput | Prisma.ChatThreadUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.ChatThreadUpdateManyWithWhereWithoutUserInput | Prisma.ChatThreadUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.ChatThreadScalarWhereInput | Prisma.ChatThreadScalarWhereInput[];
};
export type ChatThreadUncheckedUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.ChatThreadCreateWithoutUserInput, Prisma.ChatThreadUncheckedCreateWithoutUserInput> | Prisma.ChatThreadCreateWithoutUserInput[] | Prisma.ChatThreadUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.ChatThreadCreateOrConnectWithoutUserInput | Prisma.ChatThreadCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.ChatThreadUpsertWithWhereUniqueWithoutUserInput | Prisma.ChatThreadUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.ChatThreadCreateManyUserInputEnvelope;
    set?: Prisma.ChatThreadWhereUniqueInput | Prisma.ChatThreadWhereUniqueInput[];
    disconnect?: Prisma.ChatThreadWhereUniqueInput | Prisma.ChatThreadWhereUniqueInput[];
    delete?: Prisma.ChatThreadWhereUniqueInput | Prisma.ChatThreadWhereUniqueInput[];
    connect?: Prisma.ChatThreadWhereUniqueInput | Prisma.ChatThreadWhereUniqueInput[];
    update?: Prisma.ChatThreadUpdateWithWhereUniqueWithoutUserInput | Prisma.ChatThreadUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.ChatThreadUpdateManyWithWhereWithoutUserInput | Prisma.ChatThreadUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.ChatThreadScalarWhereInput | Prisma.ChatThreadScalarWhereInput[];
};
export type EnumChatKindFieldUpdateOperationsInput = {
    set?: $Enums.ChatKind;
};
export type ChatThreadCreateWithoutUserInput = {
    id?: string;
    kind: $Enums.ChatKind;
    title: string;
    messages?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ChatThreadUncheckedCreateWithoutUserInput = {
    id?: string;
    kind: $Enums.ChatKind;
    title: string;
    messages?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ChatThreadCreateOrConnectWithoutUserInput = {
    where: Prisma.ChatThreadWhereUniqueInput;
    create: Prisma.XOR<Prisma.ChatThreadCreateWithoutUserInput, Prisma.ChatThreadUncheckedCreateWithoutUserInput>;
};
export type ChatThreadCreateManyUserInputEnvelope = {
    data: Prisma.ChatThreadCreateManyUserInput | Prisma.ChatThreadCreateManyUserInput[];
    skipDuplicates?: boolean;
};
export type ChatThreadUpsertWithWhereUniqueWithoutUserInput = {
    where: Prisma.ChatThreadWhereUniqueInput;
    update: Prisma.XOR<Prisma.ChatThreadUpdateWithoutUserInput, Prisma.ChatThreadUncheckedUpdateWithoutUserInput>;
    create: Prisma.XOR<Prisma.ChatThreadCreateWithoutUserInput, Prisma.ChatThreadUncheckedCreateWithoutUserInput>;
};
export type ChatThreadUpdateWithWhereUniqueWithoutUserInput = {
    where: Prisma.ChatThreadWhereUniqueInput;
    data: Prisma.XOR<Prisma.ChatThreadUpdateWithoutUserInput, Prisma.ChatThreadUncheckedUpdateWithoutUserInput>;
};
export type ChatThreadUpdateManyWithWhereWithoutUserInput = {
    where: Prisma.ChatThreadScalarWhereInput;
    data: Prisma.XOR<Prisma.ChatThreadUpdateManyMutationInput, Prisma.ChatThreadUncheckedUpdateManyWithoutUserInput>;
};
export type ChatThreadScalarWhereInput = {
    AND?: Prisma.ChatThreadScalarWhereInput | Prisma.ChatThreadScalarWhereInput[];
    OR?: Prisma.ChatThreadScalarWhereInput[];
    NOT?: Prisma.ChatThreadScalarWhereInput | Prisma.ChatThreadScalarWhereInput[];
    id?: Prisma.StringFilter<"ChatThread"> | string;
    userId?: Prisma.StringFilter<"ChatThread"> | string;
    kind?: Prisma.EnumChatKindFilter<"ChatThread"> | $Enums.ChatKind;
    title?: Prisma.StringFilter<"ChatThread"> | string;
    messages?: Prisma.JsonFilter<"ChatThread">;
    createdAt?: Prisma.DateTimeFilter<"ChatThread"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"ChatThread"> | Date | string;
};
export type ChatThreadCreateManyUserInput = {
    id?: string;
    kind: $Enums.ChatKind;
    title: string;
    messages?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ChatThreadUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    kind?: Prisma.EnumChatKindFieldUpdateOperationsInput | $Enums.ChatKind;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    messages?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ChatThreadUncheckedUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    kind?: Prisma.EnumChatKindFieldUpdateOperationsInput | $Enums.ChatKind;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    messages?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ChatThreadUncheckedUpdateManyWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    kind?: Prisma.EnumChatKindFieldUpdateOperationsInput | $Enums.ChatKind;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    messages?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ChatThreadSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    kind?: boolean;
    title?: boolean;
    messages?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["chatThread"]>;
export type ChatThreadSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    kind?: boolean;
    title?: boolean;
    messages?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["chatThread"]>;
export type ChatThreadSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    kind?: boolean;
    title?: boolean;
    messages?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["chatThread"]>;
export type ChatThreadSelectScalar = {
    id?: boolean;
    userId?: boolean;
    kind?: boolean;
    title?: boolean;
    messages?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type ChatThreadOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "userId" | "kind" | "title" | "messages" | "createdAt" | "updatedAt", ExtArgs["result"]["chatThread"]>;
export type ChatThreadInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type ChatThreadIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type ChatThreadIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type $ChatThreadPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ChatThread";
    objects: {
        user: Prisma.$UserPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        userId: string;
        kind: $Enums.ChatKind;
        title: string;
        messages: runtime.JsonValue;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["chatThread"]>;
    composites: {};
};
export type ChatThreadGetPayload<S extends boolean | null | undefined | ChatThreadDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ChatThreadPayload, S>;
export type ChatThreadCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ChatThreadFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ChatThreadCountAggregateInputType | true;
};
export interface ChatThreadDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ChatThread'];
        meta: {
            name: 'ChatThread';
        };
    };
    findUnique<T extends ChatThreadFindUniqueArgs>(args: Prisma.SelectSubset<T, ChatThreadFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ChatThreadClient<runtime.Types.Result.GetResult<Prisma.$ChatThreadPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ChatThreadFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ChatThreadFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ChatThreadClient<runtime.Types.Result.GetResult<Prisma.$ChatThreadPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ChatThreadFindFirstArgs>(args?: Prisma.SelectSubset<T, ChatThreadFindFirstArgs<ExtArgs>>): Prisma.Prisma__ChatThreadClient<runtime.Types.Result.GetResult<Prisma.$ChatThreadPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ChatThreadFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ChatThreadFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ChatThreadClient<runtime.Types.Result.GetResult<Prisma.$ChatThreadPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ChatThreadFindManyArgs>(args?: Prisma.SelectSubset<T, ChatThreadFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ChatThreadPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ChatThreadCreateArgs>(args: Prisma.SelectSubset<T, ChatThreadCreateArgs<ExtArgs>>): Prisma.Prisma__ChatThreadClient<runtime.Types.Result.GetResult<Prisma.$ChatThreadPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ChatThreadCreateManyArgs>(args?: Prisma.SelectSubset<T, ChatThreadCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ChatThreadCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ChatThreadCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ChatThreadPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ChatThreadDeleteArgs>(args: Prisma.SelectSubset<T, ChatThreadDeleteArgs<ExtArgs>>): Prisma.Prisma__ChatThreadClient<runtime.Types.Result.GetResult<Prisma.$ChatThreadPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ChatThreadUpdateArgs>(args: Prisma.SelectSubset<T, ChatThreadUpdateArgs<ExtArgs>>): Prisma.Prisma__ChatThreadClient<runtime.Types.Result.GetResult<Prisma.$ChatThreadPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ChatThreadDeleteManyArgs>(args?: Prisma.SelectSubset<T, ChatThreadDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ChatThreadUpdateManyArgs>(args: Prisma.SelectSubset<T, ChatThreadUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ChatThreadUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ChatThreadUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ChatThreadPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ChatThreadUpsertArgs>(args: Prisma.SelectSubset<T, ChatThreadUpsertArgs<ExtArgs>>): Prisma.Prisma__ChatThreadClient<runtime.Types.Result.GetResult<Prisma.$ChatThreadPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ChatThreadCountArgs>(args?: Prisma.Subset<T, ChatThreadCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ChatThreadCountAggregateOutputType> : number>;
    aggregate<T extends ChatThreadAggregateArgs>(args: Prisma.Subset<T, ChatThreadAggregateArgs>): Prisma.PrismaPromise<GetChatThreadAggregateType<T>>;
    groupBy<T extends ChatThreadGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ChatThreadGroupByArgs['orderBy'];
    } : {
        orderBy?: ChatThreadGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ChatThreadGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetChatThreadGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ChatThreadFieldRefs;
}
export interface Prisma__ChatThreadClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    user<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ChatThreadFieldRefs {
    readonly id: Prisma.FieldRef<"ChatThread", 'String'>;
    readonly userId: Prisma.FieldRef<"ChatThread", 'String'>;
    readonly kind: Prisma.FieldRef<"ChatThread", 'ChatKind'>;
    readonly title: Prisma.FieldRef<"ChatThread", 'String'>;
    readonly messages: Prisma.FieldRef<"ChatThread", 'Json'>;
    readonly createdAt: Prisma.FieldRef<"ChatThread", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"ChatThread", 'DateTime'>;
}
export type ChatThreadFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ChatThreadSelect<ExtArgs> | null;
    omit?: Prisma.ChatThreadOmit<ExtArgs> | null;
    include?: Prisma.ChatThreadInclude<ExtArgs> | null;
    where: Prisma.ChatThreadWhereUniqueInput;
};
export type ChatThreadFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ChatThreadSelect<ExtArgs> | null;
    omit?: Prisma.ChatThreadOmit<ExtArgs> | null;
    include?: Prisma.ChatThreadInclude<ExtArgs> | null;
    where: Prisma.ChatThreadWhereUniqueInput;
};
export type ChatThreadFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ChatThreadSelect<ExtArgs> | null;
    omit?: Prisma.ChatThreadOmit<ExtArgs> | null;
    include?: Prisma.ChatThreadInclude<ExtArgs> | null;
    where?: Prisma.ChatThreadWhereInput;
    orderBy?: Prisma.ChatThreadOrderByWithRelationInput | Prisma.ChatThreadOrderByWithRelationInput[];
    cursor?: Prisma.ChatThreadWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ChatThreadScalarFieldEnum | Prisma.ChatThreadScalarFieldEnum[];
};
export type ChatThreadFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ChatThreadSelect<ExtArgs> | null;
    omit?: Prisma.ChatThreadOmit<ExtArgs> | null;
    include?: Prisma.ChatThreadInclude<ExtArgs> | null;
    where?: Prisma.ChatThreadWhereInput;
    orderBy?: Prisma.ChatThreadOrderByWithRelationInput | Prisma.ChatThreadOrderByWithRelationInput[];
    cursor?: Prisma.ChatThreadWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ChatThreadScalarFieldEnum | Prisma.ChatThreadScalarFieldEnum[];
};
export type ChatThreadFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ChatThreadSelect<ExtArgs> | null;
    omit?: Prisma.ChatThreadOmit<ExtArgs> | null;
    include?: Prisma.ChatThreadInclude<ExtArgs> | null;
    where?: Prisma.ChatThreadWhereInput;
    orderBy?: Prisma.ChatThreadOrderByWithRelationInput | Prisma.ChatThreadOrderByWithRelationInput[];
    cursor?: Prisma.ChatThreadWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ChatThreadScalarFieldEnum | Prisma.ChatThreadScalarFieldEnum[];
};
export type ChatThreadCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ChatThreadSelect<ExtArgs> | null;
    omit?: Prisma.ChatThreadOmit<ExtArgs> | null;
    include?: Prisma.ChatThreadInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ChatThreadCreateInput, Prisma.ChatThreadUncheckedCreateInput>;
};
export type ChatThreadCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ChatThreadCreateManyInput | Prisma.ChatThreadCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ChatThreadCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ChatThreadSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ChatThreadOmit<ExtArgs> | null;
    data: Prisma.ChatThreadCreateManyInput | Prisma.ChatThreadCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.ChatThreadIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type ChatThreadUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ChatThreadSelect<ExtArgs> | null;
    omit?: Prisma.ChatThreadOmit<ExtArgs> | null;
    include?: Prisma.ChatThreadInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ChatThreadUpdateInput, Prisma.ChatThreadUncheckedUpdateInput>;
    where: Prisma.ChatThreadWhereUniqueInput;
};
export type ChatThreadUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ChatThreadUpdateManyMutationInput, Prisma.ChatThreadUncheckedUpdateManyInput>;
    where?: Prisma.ChatThreadWhereInput;
    limit?: number;
};
export type ChatThreadUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ChatThreadSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ChatThreadOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ChatThreadUpdateManyMutationInput, Prisma.ChatThreadUncheckedUpdateManyInput>;
    where?: Prisma.ChatThreadWhereInput;
    limit?: number;
    include?: Prisma.ChatThreadIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type ChatThreadUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ChatThreadSelect<ExtArgs> | null;
    omit?: Prisma.ChatThreadOmit<ExtArgs> | null;
    include?: Prisma.ChatThreadInclude<ExtArgs> | null;
    where: Prisma.ChatThreadWhereUniqueInput;
    create: Prisma.XOR<Prisma.ChatThreadCreateInput, Prisma.ChatThreadUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ChatThreadUpdateInput, Prisma.ChatThreadUncheckedUpdateInput>;
};
export type ChatThreadDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ChatThreadSelect<ExtArgs> | null;
    omit?: Prisma.ChatThreadOmit<ExtArgs> | null;
    include?: Prisma.ChatThreadInclude<ExtArgs> | null;
    where: Prisma.ChatThreadWhereUniqueInput;
};
export type ChatThreadDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ChatThreadWhereInput;
    limit?: number;
};
export type ChatThreadDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ChatThreadSelect<ExtArgs> | null;
    omit?: Prisma.ChatThreadOmit<ExtArgs> | null;
    include?: Prisma.ChatThreadInclude<ExtArgs> | null;
};
