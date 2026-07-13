import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace";
export type PushSubscriptionModel = runtime.Types.Result.DefaultSelection<Prisma.$PushSubscriptionPayload>;
export type AggregatePushSubscription = {
    _count: PushSubscriptionCountAggregateOutputType | null;
    _min: PushSubscriptionMinAggregateOutputType | null;
    _max: PushSubscriptionMaxAggregateOutputType | null;
};
export type PushSubscriptionMinAggregateOutputType = {
    id: string | null;
    userId: string | null;
    endpoint: string | null;
    p256dh: string | null;
    auth: string | null;
    createdAt: Date | null;
};
export type PushSubscriptionMaxAggregateOutputType = {
    id: string | null;
    userId: string | null;
    endpoint: string | null;
    p256dh: string | null;
    auth: string | null;
    createdAt: Date | null;
};
export type PushSubscriptionCountAggregateOutputType = {
    id: number;
    userId: number;
    endpoint: number;
    p256dh: number;
    auth: number;
    createdAt: number;
    _all: number;
};
export type PushSubscriptionMinAggregateInputType = {
    id?: true;
    userId?: true;
    endpoint?: true;
    p256dh?: true;
    auth?: true;
    createdAt?: true;
};
export type PushSubscriptionMaxAggregateInputType = {
    id?: true;
    userId?: true;
    endpoint?: true;
    p256dh?: true;
    auth?: true;
    createdAt?: true;
};
export type PushSubscriptionCountAggregateInputType = {
    id?: true;
    userId?: true;
    endpoint?: true;
    p256dh?: true;
    auth?: true;
    createdAt?: true;
    _all?: true;
};
export type PushSubscriptionAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PushSubscriptionWhereInput;
    orderBy?: Prisma.PushSubscriptionOrderByWithRelationInput | Prisma.PushSubscriptionOrderByWithRelationInput[];
    cursor?: Prisma.PushSubscriptionWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | PushSubscriptionCountAggregateInputType;
    _min?: PushSubscriptionMinAggregateInputType;
    _max?: PushSubscriptionMaxAggregateInputType;
};
export type GetPushSubscriptionAggregateType<T extends PushSubscriptionAggregateArgs> = {
    [P in keyof T & keyof AggregatePushSubscription]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregatePushSubscription[P]> : Prisma.GetScalarType<T[P], AggregatePushSubscription[P]>;
};
export type PushSubscriptionGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PushSubscriptionWhereInput;
    orderBy?: Prisma.PushSubscriptionOrderByWithAggregationInput | Prisma.PushSubscriptionOrderByWithAggregationInput[];
    by: Prisma.PushSubscriptionScalarFieldEnum[] | Prisma.PushSubscriptionScalarFieldEnum;
    having?: Prisma.PushSubscriptionScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: PushSubscriptionCountAggregateInputType | true;
    _min?: PushSubscriptionMinAggregateInputType;
    _max?: PushSubscriptionMaxAggregateInputType;
};
export type PushSubscriptionGroupByOutputType = {
    id: string;
    userId: string;
    endpoint: string;
    p256dh: string;
    auth: string;
    createdAt: Date;
    _count: PushSubscriptionCountAggregateOutputType | null;
    _min: PushSubscriptionMinAggregateOutputType | null;
    _max: PushSubscriptionMaxAggregateOutputType | null;
};
export type GetPushSubscriptionGroupByPayload<T extends PushSubscriptionGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<PushSubscriptionGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof PushSubscriptionGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], PushSubscriptionGroupByOutputType[P]> : Prisma.GetScalarType<T[P], PushSubscriptionGroupByOutputType[P]>;
}>>;
export type PushSubscriptionWhereInput = {
    AND?: Prisma.PushSubscriptionWhereInput | Prisma.PushSubscriptionWhereInput[];
    OR?: Prisma.PushSubscriptionWhereInput[];
    NOT?: Prisma.PushSubscriptionWhereInput | Prisma.PushSubscriptionWhereInput[];
    id?: Prisma.StringFilter<"PushSubscription"> | string;
    userId?: Prisma.StringFilter<"PushSubscription"> | string;
    endpoint?: Prisma.StringFilter<"PushSubscription"> | string;
    p256dh?: Prisma.StringFilter<"PushSubscription"> | string;
    auth?: Prisma.StringFilter<"PushSubscription"> | string;
    createdAt?: Prisma.DateTimeFilter<"PushSubscription"> | Date | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
};
export type PushSubscriptionOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    endpoint?: Prisma.SortOrder;
    p256dh?: Prisma.SortOrder;
    auth?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    user?: Prisma.UserOrderByWithRelationInput;
};
export type PushSubscriptionWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    endpoint?: string;
    AND?: Prisma.PushSubscriptionWhereInput | Prisma.PushSubscriptionWhereInput[];
    OR?: Prisma.PushSubscriptionWhereInput[];
    NOT?: Prisma.PushSubscriptionWhereInput | Prisma.PushSubscriptionWhereInput[];
    userId?: Prisma.StringFilter<"PushSubscription"> | string;
    p256dh?: Prisma.StringFilter<"PushSubscription"> | string;
    auth?: Prisma.StringFilter<"PushSubscription"> | string;
    createdAt?: Prisma.DateTimeFilter<"PushSubscription"> | Date | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
}, "id" | "endpoint">;
export type PushSubscriptionOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    endpoint?: Prisma.SortOrder;
    p256dh?: Prisma.SortOrder;
    auth?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.PushSubscriptionCountOrderByAggregateInput;
    _max?: Prisma.PushSubscriptionMaxOrderByAggregateInput;
    _min?: Prisma.PushSubscriptionMinOrderByAggregateInput;
};
export type PushSubscriptionScalarWhereWithAggregatesInput = {
    AND?: Prisma.PushSubscriptionScalarWhereWithAggregatesInput | Prisma.PushSubscriptionScalarWhereWithAggregatesInput[];
    OR?: Prisma.PushSubscriptionScalarWhereWithAggregatesInput[];
    NOT?: Prisma.PushSubscriptionScalarWhereWithAggregatesInput | Prisma.PushSubscriptionScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"PushSubscription"> | string;
    userId?: Prisma.StringWithAggregatesFilter<"PushSubscription"> | string;
    endpoint?: Prisma.StringWithAggregatesFilter<"PushSubscription"> | string;
    p256dh?: Prisma.StringWithAggregatesFilter<"PushSubscription"> | string;
    auth?: Prisma.StringWithAggregatesFilter<"PushSubscription"> | string;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"PushSubscription"> | Date | string;
};
export type PushSubscriptionCreateInput = {
    id?: string;
    endpoint: string;
    p256dh: string;
    auth: string;
    createdAt?: Date | string;
    user: Prisma.UserCreateNestedOneWithoutPushSubscriptionsInput;
};
export type PushSubscriptionUncheckedCreateInput = {
    id?: string;
    userId: string;
    endpoint: string;
    p256dh: string;
    auth: string;
    createdAt?: Date | string;
};
export type PushSubscriptionUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    endpoint?: Prisma.StringFieldUpdateOperationsInput | string;
    p256dh?: Prisma.StringFieldUpdateOperationsInput | string;
    auth?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutPushSubscriptionsNestedInput;
};
export type PushSubscriptionUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    endpoint?: Prisma.StringFieldUpdateOperationsInput | string;
    p256dh?: Prisma.StringFieldUpdateOperationsInput | string;
    auth?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PushSubscriptionCreateManyInput = {
    id?: string;
    userId: string;
    endpoint: string;
    p256dh: string;
    auth: string;
    createdAt?: Date | string;
};
export type PushSubscriptionUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    endpoint?: Prisma.StringFieldUpdateOperationsInput | string;
    p256dh?: Prisma.StringFieldUpdateOperationsInput | string;
    auth?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PushSubscriptionUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    endpoint?: Prisma.StringFieldUpdateOperationsInput | string;
    p256dh?: Prisma.StringFieldUpdateOperationsInput | string;
    auth?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PushSubscriptionListRelationFilter = {
    every?: Prisma.PushSubscriptionWhereInput;
    some?: Prisma.PushSubscriptionWhereInput;
    none?: Prisma.PushSubscriptionWhereInput;
};
export type PushSubscriptionOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type PushSubscriptionCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    endpoint?: Prisma.SortOrder;
    p256dh?: Prisma.SortOrder;
    auth?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type PushSubscriptionMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    endpoint?: Prisma.SortOrder;
    p256dh?: Prisma.SortOrder;
    auth?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type PushSubscriptionMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    endpoint?: Prisma.SortOrder;
    p256dh?: Prisma.SortOrder;
    auth?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type PushSubscriptionCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.PushSubscriptionCreateWithoutUserInput, Prisma.PushSubscriptionUncheckedCreateWithoutUserInput> | Prisma.PushSubscriptionCreateWithoutUserInput[] | Prisma.PushSubscriptionUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.PushSubscriptionCreateOrConnectWithoutUserInput | Prisma.PushSubscriptionCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.PushSubscriptionCreateManyUserInputEnvelope;
    connect?: Prisma.PushSubscriptionWhereUniqueInput | Prisma.PushSubscriptionWhereUniqueInput[];
};
export type PushSubscriptionUncheckedCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.PushSubscriptionCreateWithoutUserInput, Prisma.PushSubscriptionUncheckedCreateWithoutUserInput> | Prisma.PushSubscriptionCreateWithoutUserInput[] | Prisma.PushSubscriptionUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.PushSubscriptionCreateOrConnectWithoutUserInput | Prisma.PushSubscriptionCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.PushSubscriptionCreateManyUserInputEnvelope;
    connect?: Prisma.PushSubscriptionWhereUniqueInput | Prisma.PushSubscriptionWhereUniqueInput[];
};
export type PushSubscriptionUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.PushSubscriptionCreateWithoutUserInput, Prisma.PushSubscriptionUncheckedCreateWithoutUserInput> | Prisma.PushSubscriptionCreateWithoutUserInput[] | Prisma.PushSubscriptionUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.PushSubscriptionCreateOrConnectWithoutUserInput | Prisma.PushSubscriptionCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.PushSubscriptionUpsertWithWhereUniqueWithoutUserInput | Prisma.PushSubscriptionUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.PushSubscriptionCreateManyUserInputEnvelope;
    set?: Prisma.PushSubscriptionWhereUniqueInput | Prisma.PushSubscriptionWhereUniqueInput[];
    disconnect?: Prisma.PushSubscriptionWhereUniqueInput | Prisma.PushSubscriptionWhereUniqueInput[];
    delete?: Prisma.PushSubscriptionWhereUniqueInput | Prisma.PushSubscriptionWhereUniqueInput[];
    connect?: Prisma.PushSubscriptionWhereUniqueInput | Prisma.PushSubscriptionWhereUniqueInput[];
    update?: Prisma.PushSubscriptionUpdateWithWhereUniqueWithoutUserInput | Prisma.PushSubscriptionUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.PushSubscriptionUpdateManyWithWhereWithoutUserInput | Prisma.PushSubscriptionUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.PushSubscriptionScalarWhereInput | Prisma.PushSubscriptionScalarWhereInput[];
};
export type PushSubscriptionUncheckedUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.PushSubscriptionCreateWithoutUserInput, Prisma.PushSubscriptionUncheckedCreateWithoutUserInput> | Prisma.PushSubscriptionCreateWithoutUserInput[] | Prisma.PushSubscriptionUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.PushSubscriptionCreateOrConnectWithoutUserInput | Prisma.PushSubscriptionCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.PushSubscriptionUpsertWithWhereUniqueWithoutUserInput | Prisma.PushSubscriptionUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.PushSubscriptionCreateManyUserInputEnvelope;
    set?: Prisma.PushSubscriptionWhereUniqueInput | Prisma.PushSubscriptionWhereUniqueInput[];
    disconnect?: Prisma.PushSubscriptionWhereUniqueInput | Prisma.PushSubscriptionWhereUniqueInput[];
    delete?: Prisma.PushSubscriptionWhereUniqueInput | Prisma.PushSubscriptionWhereUniqueInput[];
    connect?: Prisma.PushSubscriptionWhereUniqueInput | Prisma.PushSubscriptionWhereUniqueInput[];
    update?: Prisma.PushSubscriptionUpdateWithWhereUniqueWithoutUserInput | Prisma.PushSubscriptionUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.PushSubscriptionUpdateManyWithWhereWithoutUserInput | Prisma.PushSubscriptionUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.PushSubscriptionScalarWhereInput | Prisma.PushSubscriptionScalarWhereInput[];
};
export type PushSubscriptionCreateWithoutUserInput = {
    id?: string;
    endpoint: string;
    p256dh: string;
    auth: string;
    createdAt?: Date | string;
};
export type PushSubscriptionUncheckedCreateWithoutUserInput = {
    id?: string;
    endpoint: string;
    p256dh: string;
    auth: string;
    createdAt?: Date | string;
};
export type PushSubscriptionCreateOrConnectWithoutUserInput = {
    where: Prisma.PushSubscriptionWhereUniqueInput;
    create: Prisma.XOR<Prisma.PushSubscriptionCreateWithoutUserInput, Prisma.PushSubscriptionUncheckedCreateWithoutUserInput>;
};
export type PushSubscriptionCreateManyUserInputEnvelope = {
    data: Prisma.PushSubscriptionCreateManyUserInput | Prisma.PushSubscriptionCreateManyUserInput[];
    skipDuplicates?: boolean;
};
export type PushSubscriptionUpsertWithWhereUniqueWithoutUserInput = {
    where: Prisma.PushSubscriptionWhereUniqueInput;
    update: Prisma.XOR<Prisma.PushSubscriptionUpdateWithoutUserInput, Prisma.PushSubscriptionUncheckedUpdateWithoutUserInput>;
    create: Prisma.XOR<Prisma.PushSubscriptionCreateWithoutUserInput, Prisma.PushSubscriptionUncheckedCreateWithoutUserInput>;
};
export type PushSubscriptionUpdateWithWhereUniqueWithoutUserInput = {
    where: Prisma.PushSubscriptionWhereUniqueInput;
    data: Prisma.XOR<Prisma.PushSubscriptionUpdateWithoutUserInput, Prisma.PushSubscriptionUncheckedUpdateWithoutUserInput>;
};
export type PushSubscriptionUpdateManyWithWhereWithoutUserInput = {
    where: Prisma.PushSubscriptionScalarWhereInput;
    data: Prisma.XOR<Prisma.PushSubscriptionUpdateManyMutationInput, Prisma.PushSubscriptionUncheckedUpdateManyWithoutUserInput>;
};
export type PushSubscriptionScalarWhereInput = {
    AND?: Prisma.PushSubscriptionScalarWhereInput | Prisma.PushSubscriptionScalarWhereInput[];
    OR?: Prisma.PushSubscriptionScalarWhereInput[];
    NOT?: Prisma.PushSubscriptionScalarWhereInput | Prisma.PushSubscriptionScalarWhereInput[];
    id?: Prisma.StringFilter<"PushSubscription"> | string;
    userId?: Prisma.StringFilter<"PushSubscription"> | string;
    endpoint?: Prisma.StringFilter<"PushSubscription"> | string;
    p256dh?: Prisma.StringFilter<"PushSubscription"> | string;
    auth?: Prisma.StringFilter<"PushSubscription"> | string;
    createdAt?: Prisma.DateTimeFilter<"PushSubscription"> | Date | string;
};
export type PushSubscriptionCreateManyUserInput = {
    id?: string;
    endpoint: string;
    p256dh: string;
    auth: string;
    createdAt?: Date | string;
};
export type PushSubscriptionUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    endpoint?: Prisma.StringFieldUpdateOperationsInput | string;
    p256dh?: Prisma.StringFieldUpdateOperationsInput | string;
    auth?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PushSubscriptionUncheckedUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    endpoint?: Prisma.StringFieldUpdateOperationsInput | string;
    p256dh?: Prisma.StringFieldUpdateOperationsInput | string;
    auth?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PushSubscriptionUncheckedUpdateManyWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    endpoint?: Prisma.StringFieldUpdateOperationsInput | string;
    p256dh?: Prisma.StringFieldUpdateOperationsInput | string;
    auth?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PushSubscriptionSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    endpoint?: boolean;
    p256dh?: boolean;
    auth?: boolean;
    createdAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["pushSubscription"]>;
export type PushSubscriptionSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    endpoint?: boolean;
    p256dh?: boolean;
    auth?: boolean;
    createdAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["pushSubscription"]>;
export type PushSubscriptionSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    endpoint?: boolean;
    p256dh?: boolean;
    auth?: boolean;
    createdAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["pushSubscription"]>;
export type PushSubscriptionSelectScalar = {
    id?: boolean;
    userId?: boolean;
    endpoint?: boolean;
    p256dh?: boolean;
    auth?: boolean;
    createdAt?: boolean;
};
export type PushSubscriptionOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "userId" | "endpoint" | "p256dh" | "auth" | "createdAt", ExtArgs["result"]["pushSubscription"]>;
export type PushSubscriptionInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type PushSubscriptionIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type PushSubscriptionIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type $PushSubscriptionPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "PushSubscription";
    objects: {
        user: Prisma.$UserPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        userId: string;
        endpoint: string;
        p256dh: string;
        auth: string;
        createdAt: Date;
    }, ExtArgs["result"]["pushSubscription"]>;
    composites: {};
};
export type PushSubscriptionGetPayload<S extends boolean | null | undefined | PushSubscriptionDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$PushSubscriptionPayload, S>;
export type PushSubscriptionCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<PushSubscriptionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: PushSubscriptionCountAggregateInputType | true;
};
export interface PushSubscriptionDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['PushSubscription'];
        meta: {
            name: 'PushSubscription';
        };
    };
    findUnique<T extends PushSubscriptionFindUniqueArgs>(args: Prisma.SelectSubset<T, PushSubscriptionFindUniqueArgs<ExtArgs>>): Prisma.Prisma__PushSubscriptionClient<runtime.Types.Result.GetResult<Prisma.$PushSubscriptionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends PushSubscriptionFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, PushSubscriptionFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__PushSubscriptionClient<runtime.Types.Result.GetResult<Prisma.$PushSubscriptionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends PushSubscriptionFindFirstArgs>(args?: Prisma.SelectSubset<T, PushSubscriptionFindFirstArgs<ExtArgs>>): Prisma.Prisma__PushSubscriptionClient<runtime.Types.Result.GetResult<Prisma.$PushSubscriptionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends PushSubscriptionFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, PushSubscriptionFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__PushSubscriptionClient<runtime.Types.Result.GetResult<Prisma.$PushSubscriptionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends PushSubscriptionFindManyArgs>(args?: Prisma.SelectSubset<T, PushSubscriptionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PushSubscriptionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends PushSubscriptionCreateArgs>(args: Prisma.SelectSubset<T, PushSubscriptionCreateArgs<ExtArgs>>): Prisma.Prisma__PushSubscriptionClient<runtime.Types.Result.GetResult<Prisma.$PushSubscriptionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends PushSubscriptionCreateManyArgs>(args?: Prisma.SelectSubset<T, PushSubscriptionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends PushSubscriptionCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, PushSubscriptionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PushSubscriptionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends PushSubscriptionDeleteArgs>(args: Prisma.SelectSubset<T, PushSubscriptionDeleteArgs<ExtArgs>>): Prisma.Prisma__PushSubscriptionClient<runtime.Types.Result.GetResult<Prisma.$PushSubscriptionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends PushSubscriptionUpdateArgs>(args: Prisma.SelectSubset<T, PushSubscriptionUpdateArgs<ExtArgs>>): Prisma.Prisma__PushSubscriptionClient<runtime.Types.Result.GetResult<Prisma.$PushSubscriptionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends PushSubscriptionDeleteManyArgs>(args?: Prisma.SelectSubset<T, PushSubscriptionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends PushSubscriptionUpdateManyArgs>(args: Prisma.SelectSubset<T, PushSubscriptionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends PushSubscriptionUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, PushSubscriptionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PushSubscriptionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends PushSubscriptionUpsertArgs>(args: Prisma.SelectSubset<T, PushSubscriptionUpsertArgs<ExtArgs>>): Prisma.Prisma__PushSubscriptionClient<runtime.Types.Result.GetResult<Prisma.$PushSubscriptionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends PushSubscriptionCountArgs>(args?: Prisma.Subset<T, PushSubscriptionCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], PushSubscriptionCountAggregateOutputType> : number>;
    aggregate<T extends PushSubscriptionAggregateArgs>(args: Prisma.Subset<T, PushSubscriptionAggregateArgs>): Prisma.PrismaPromise<GetPushSubscriptionAggregateType<T>>;
    groupBy<T extends PushSubscriptionGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: PushSubscriptionGroupByArgs['orderBy'];
    } : {
        orderBy?: PushSubscriptionGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, PushSubscriptionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPushSubscriptionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: PushSubscriptionFieldRefs;
}
export interface Prisma__PushSubscriptionClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    user<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface PushSubscriptionFieldRefs {
    readonly id: Prisma.FieldRef<"PushSubscription", 'String'>;
    readonly userId: Prisma.FieldRef<"PushSubscription", 'String'>;
    readonly endpoint: Prisma.FieldRef<"PushSubscription", 'String'>;
    readonly p256dh: Prisma.FieldRef<"PushSubscription", 'String'>;
    readonly auth: Prisma.FieldRef<"PushSubscription", 'String'>;
    readonly createdAt: Prisma.FieldRef<"PushSubscription", 'DateTime'>;
}
export type PushSubscriptionFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PushSubscriptionSelect<ExtArgs> | null;
    omit?: Prisma.PushSubscriptionOmit<ExtArgs> | null;
    include?: Prisma.PushSubscriptionInclude<ExtArgs> | null;
    where: Prisma.PushSubscriptionWhereUniqueInput;
};
export type PushSubscriptionFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PushSubscriptionSelect<ExtArgs> | null;
    omit?: Prisma.PushSubscriptionOmit<ExtArgs> | null;
    include?: Prisma.PushSubscriptionInclude<ExtArgs> | null;
    where: Prisma.PushSubscriptionWhereUniqueInput;
};
export type PushSubscriptionFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PushSubscriptionSelect<ExtArgs> | null;
    omit?: Prisma.PushSubscriptionOmit<ExtArgs> | null;
    include?: Prisma.PushSubscriptionInclude<ExtArgs> | null;
    where?: Prisma.PushSubscriptionWhereInput;
    orderBy?: Prisma.PushSubscriptionOrderByWithRelationInput | Prisma.PushSubscriptionOrderByWithRelationInput[];
    cursor?: Prisma.PushSubscriptionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PushSubscriptionScalarFieldEnum | Prisma.PushSubscriptionScalarFieldEnum[];
};
export type PushSubscriptionFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PushSubscriptionSelect<ExtArgs> | null;
    omit?: Prisma.PushSubscriptionOmit<ExtArgs> | null;
    include?: Prisma.PushSubscriptionInclude<ExtArgs> | null;
    where?: Prisma.PushSubscriptionWhereInput;
    orderBy?: Prisma.PushSubscriptionOrderByWithRelationInput | Prisma.PushSubscriptionOrderByWithRelationInput[];
    cursor?: Prisma.PushSubscriptionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PushSubscriptionScalarFieldEnum | Prisma.PushSubscriptionScalarFieldEnum[];
};
export type PushSubscriptionFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PushSubscriptionSelect<ExtArgs> | null;
    omit?: Prisma.PushSubscriptionOmit<ExtArgs> | null;
    include?: Prisma.PushSubscriptionInclude<ExtArgs> | null;
    where?: Prisma.PushSubscriptionWhereInput;
    orderBy?: Prisma.PushSubscriptionOrderByWithRelationInput | Prisma.PushSubscriptionOrderByWithRelationInput[];
    cursor?: Prisma.PushSubscriptionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PushSubscriptionScalarFieldEnum | Prisma.PushSubscriptionScalarFieldEnum[];
};
export type PushSubscriptionCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PushSubscriptionSelect<ExtArgs> | null;
    omit?: Prisma.PushSubscriptionOmit<ExtArgs> | null;
    include?: Prisma.PushSubscriptionInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.PushSubscriptionCreateInput, Prisma.PushSubscriptionUncheckedCreateInput>;
};
export type PushSubscriptionCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.PushSubscriptionCreateManyInput | Prisma.PushSubscriptionCreateManyInput[];
    skipDuplicates?: boolean;
};
export type PushSubscriptionCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PushSubscriptionSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.PushSubscriptionOmit<ExtArgs> | null;
    data: Prisma.PushSubscriptionCreateManyInput | Prisma.PushSubscriptionCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.PushSubscriptionIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type PushSubscriptionUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PushSubscriptionSelect<ExtArgs> | null;
    omit?: Prisma.PushSubscriptionOmit<ExtArgs> | null;
    include?: Prisma.PushSubscriptionInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.PushSubscriptionUpdateInput, Prisma.PushSubscriptionUncheckedUpdateInput>;
    where: Prisma.PushSubscriptionWhereUniqueInput;
};
export type PushSubscriptionUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.PushSubscriptionUpdateManyMutationInput, Prisma.PushSubscriptionUncheckedUpdateManyInput>;
    where?: Prisma.PushSubscriptionWhereInput;
    limit?: number;
};
export type PushSubscriptionUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PushSubscriptionSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.PushSubscriptionOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.PushSubscriptionUpdateManyMutationInput, Prisma.PushSubscriptionUncheckedUpdateManyInput>;
    where?: Prisma.PushSubscriptionWhereInput;
    limit?: number;
    include?: Prisma.PushSubscriptionIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type PushSubscriptionUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PushSubscriptionSelect<ExtArgs> | null;
    omit?: Prisma.PushSubscriptionOmit<ExtArgs> | null;
    include?: Prisma.PushSubscriptionInclude<ExtArgs> | null;
    where: Prisma.PushSubscriptionWhereUniqueInput;
    create: Prisma.XOR<Prisma.PushSubscriptionCreateInput, Prisma.PushSubscriptionUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.PushSubscriptionUpdateInput, Prisma.PushSubscriptionUncheckedUpdateInput>;
};
export type PushSubscriptionDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PushSubscriptionSelect<ExtArgs> | null;
    omit?: Prisma.PushSubscriptionOmit<ExtArgs> | null;
    include?: Prisma.PushSubscriptionInclude<ExtArgs> | null;
    where: Prisma.PushSubscriptionWhereUniqueInput;
};
export type PushSubscriptionDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PushSubscriptionWhereInput;
    limit?: number;
};
export type PushSubscriptionDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PushSubscriptionSelect<ExtArgs> | null;
    omit?: Prisma.PushSubscriptionOmit<ExtArgs> | null;
    include?: Prisma.PushSubscriptionInclude<ExtArgs> | null;
};
