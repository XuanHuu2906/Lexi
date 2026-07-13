import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace";
export type UserBadgeModel = runtime.Types.Result.DefaultSelection<Prisma.$UserBadgePayload>;
export type AggregateUserBadge = {
    _count: UserBadgeCountAggregateOutputType | null;
    _min: UserBadgeMinAggregateOutputType | null;
    _max: UserBadgeMaxAggregateOutputType | null;
};
export type UserBadgeMinAggregateOutputType = {
    id: string | null;
    userId: string | null;
    badgeId: string | null;
    earnedAt: Date | null;
};
export type UserBadgeMaxAggregateOutputType = {
    id: string | null;
    userId: string | null;
    badgeId: string | null;
    earnedAt: Date | null;
};
export type UserBadgeCountAggregateOutputType = {
    id: number;
    userId: number;
    badgeId: number;
    earnedAt: number;
    _all: number;
};
export type UserBadgeMinAggregateInputType = {
    id?: true;
    userId?: true;
    badgeId?: true;
    earnedAt?: true;
};
export type UserBadgeMaxAggregateInputType = {
    id?: true;
    userId?: true;
    badgeId?: true;
    earnedAt?: true;
};
export type UserBadgeCountAggregateInputType = {
    id?: true;
    userId?: true;
    badgeId?: true;
    earnedAt?: true;
    _all?: true;
};
export type UserBadgeAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UserBadgeWhereInput;
    orderBy?: Prisma.UserBadgeOrderByWithRelationInput | Prisma.UserBadgeOrderByWithRelationInput[];
    cursor?: Prisma.UserBadgeWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | UserBadgeCountAggregateInputType;
    _min?: UserBadgeMinAggregateInputType;
    _max?: UserBadgeMaxAggregateInputType;
};
export type GetUserBadgeAggregateType<T extends UserBadgeAggregateArgs> = {
    [P in keyof T & keyof AggregateUserBadge]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateUserBadge[P]> : Prisma.GetScalarType<T[P], AggregateUserBadge[P]>;
};
export type UserBadgeGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UserBadgeWhereInput;
    orderBy?: Prisma.UserBadgeOrderByWithAggregationInput | Prisma.UserBadgeOrderByWithAggregationInput[];
    by: Prisma.UserBadgeScalarFieldEnum[] | Prisma.UserBadgeScalarFieldEnum;
    having?: Prisma.UserBadgeScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: UserBadgeCountAggregateInputType | true;
    _min?: UserBadgeMinAggregateInputType;
    _max?: UserBadgeMaxAggregateInputType;
};
export type UserBadgeGroupByOutputType = {
    id: string;
    userId: string;
    badgeId: string;
    earnedAt: Date;
    _count: UserBadgeCountAggregateOutputType | null;
    _min: UserBadgeMinAggregateOutputType | null;
    _max: UserBadgeMaxAggregateOutputType | null;
};
export type GetUserBadgeGroupByPayload<T extends UserBadgeGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<UserBadgeGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof UserBadgeGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], UserBadgeGroupByOutputType[P]> : Prisma.GetScalarType<T[P], UserBadgeGroupByOutputType[P]>;
}>>;
export type UserBadgeWhereInput = {
    AND?: Prisma.UserBadgeWhereInput | Prisma.UserBadgeWhereInput[];
    OR?: Prisma.UserBadgeWhereInput[];
    NOT?: Prisma.UserBadgeWhereInput | Prisma.UserBadgeWhereInput[];
    id?: Prisma.StringFilter<"UserBadge"> | string;
    userId?: Prisma.StringFilter<"UserBadge"> | string;
    badgeId?: Prisma.StringFilter<"UserBadge"> | string;
    earnedAt?: Prisma.DateTimeFilter<"UserBadge"> | Date | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    badge?: Prisma.XOR<Prisma.BadgeScalarRelationFilter, Prisma.BadgeWhereInput>;
};
export type UserBadgeOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    badgeId?: Prisma.SortOrder;
    earnedAt?: Prisma.SortOrder;
    user?: Prisma.UserOrderByWithRelationInput;
    badge?: Prisma.BadgeOrderByWithRelationInput;
};
export type UserBadgeWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    userId_badgeId?: Prisma.UserBadgeUserIdBadgeIdCompoundUniqueInput;
    AND?: Prisma.UserBadgeWhereInput | Prisma.UserBadgeWhereInput[];
    OR?: Prisma.UserBadgeWhereInput[];
    NOT?: Prisma.UserBadgeWhereInput | Prisma.UserBadgeWhereInput[];
    userId?: Prisma.StringFilter<"UserBadge"> | string;
    badgeId?: Prisma.StringFilter<"UserBadge"> | string;
    earnedAt?: Prisma.DateTimeFilter<"UserBadge"> | Date | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    badge?: Prisma.XOR<Prisma.BadgeScalarRelationFilter, Prisma.BadgeWhereInput>;
}, "id" | "userId_badgeId">;
export type UserBadgeOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    badgeId?: Prisma.SortOrder;
    earnedAt?: Prisma.SortOrder;
    _count?: Prisma.UserBadgeCountOrderByAggregateInput;
    _max?: Prisma.UserBadgeMaxOrderByAggregateInput;
    _min?: Prisma.UserBadgeMinOrderByAggregateInput;
};
export type UserBadgeScalarWhereWithAggregatesInput = {
    AND?: Prisma.UserBadgeScalarWhereWithAggregatesInput | Prisma.UserBadgeScalarWhereWithAggregatesInput[];
    OR?: Prisma.UserBadgeScalarWhereWithAggregatesInput[];
    NOT?: Prisma.UserBadgeScalarWhereWithAggregatesInput | Prisma.UserBadgeScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"UserBadge"> | string;
    userId?: Prisma.StringWithAggregatesFilter<"UserBadge"> | string;
    badgeId?: Prisma.StringWithAggregatesFilter<"UserBadge"> | string;
    earnedAt?: Prisma.DateTimeWithAggregatesFilter<"UserBadge"> | Date | string;
};
export type UserBadgeCreateInput = {
    id?: string;
    earnedAt?: Date | string;
    user: Prisma.UserCreateNestedOneWithoutUserBadgesInput;
    badge: Prisma.BadgeCreateNestedOneWithoutUserBadgesInput;
};
export type UserBadgeUncheckedCreateInput = {
    id?: string;
    userId: string;
    badgeId: string;
    earnedAt?: Date | string;
};
export type UserBadgeUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    earnedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutUserBadgesNestedInput;
    badge?: Prisma.BadgeUpdateOneRequiredWithoutUserBadgesNestedInput;
};
export type UserBadgeUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    badgeId?: Prisma.StringFieldUpdateOperationsInput | string;
    earnedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UserBadgeCreateManyInput = {
    id?: string;
    userId: string;
    badgeId: string;
    earnedAt?: Date | string;
};
export type UserBadgeUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    earnedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UserBadgeUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    badgeId?: Prisma.StringFieldUpdateOperationsInput | string;
    earnedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UserBadgeListRelationFilter = {
    every?: Prisma.UserBadgeWhereInput;
    some?: Prisma.UserBadgeWhereInput;
    none?: Prisma.UserBadgeWhereInput;
};
export type UserBadgeOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type UserBadgeUserIdBadgeIdCompoundUniqueInput = {
    userId: string;
    badgeId: string;
};
export type UserBadgeCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    badgeId?: Prisma.SortOrder;
    earnedAt?: Prisma.SortOrder;
};
export type UserBadgeMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    badgeId?: Prisma.SortOrder;
    earnedAt?: Prisma.SortOrder;
};
export type UserBadgeMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    badgeId?: Prisma.SortOrder;
    earnedAt?: Prisma.SortOrder;
};
export type UserBadgeCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.UserBadgeCreateWithoutUserInput, Prisma.UserBadgeUncheckedCreateWithoutUserInput> | Prisma.UserBadgeCreateWithoutUserInput[] | Prisma.UserBadgeUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.UserBadgeCreateOrConnectWithoutUserInput | Prisma.UserBadgeCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.UserBadgeCreateManyUserInputEnvelope;
    connect?: Prisma.UserBadgeWhereUniqueInput | Prisma.UserBadgeWhereUniqueInput[];
};
export type UserBadgeUncheckedCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.UserBadgeCreateWithoutUserInput, Prisma.UserBadgeUncheckedCreateWithoutUserInput> | Prisma.UserBadgeCreateWithoutUserInput[] | Prisma.UserBadgeUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.UserBadgeCreateOrConnectWithoutUserInput | Prisma.UserBadgeCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.UserBadgeCreateManyUserInputEnvelope;
    connect?: Prisma.UserBadgeWhereUniqueInput | Prisma.UserBadgeWhereUniqueInput[];
};
export type UserBadgeUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.UserBadgeCreateWithoutUserInput, Prisma.UserBadgeUncheckedCreateWithoutUserInput> | Prisma.UserBadgeCreateWithoutUserInput[] | Prisma.UserBadgeUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.UserBadgeCreateOrConnectWithoutUserInput | Prisma.UserBadgeCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.UserBadgeUpsertWithWhereUniqueWithoutUserInput | Prisma.UserBadgeUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.UserBadgeCreateManyUserInputEnvelope;
    set?: Prisma.UserBadgeWhereUniqueInput | Prisma.UserBadgeWhereUniqueInput[];
    disconnect?: Prisma.UserBadgeWhereUniqueInput | Prisma.UserBadgeWhereUniqueInput[];
    delete?: Prisma.UserBadgeWhereUniqueInput | Prisma.UserBadgeWhereUniqueInput[];
    connect?: Prisma.UserBadgeWhereUniqueInput | Prisma.UserBadgeWhereUniqueInput[];
    update?: Prisma.UserBadgeUpdateWithWhereUniqueWithoutUserInput | Prisma.UserBadgeUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.UserBadgeUpdateManyWithWhereWithoutUserInput | Prisma.UserBadgeUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.UserBadgeScalarWhereInput | Prisma.UserBadgeScalarWhereInput[];
};
export type UserBadgeUncheckedUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.UserBadgeCreateWithoutUserInput, Prisma.UserBadgeUncheckedCreateWithoutUserInput> | Prisma.UserBadgeCreateWithoutUserInput[] | Prisma.UserBadgeUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.UserBadgeCreateOrConnectWithoutUserInput | Prisma.UserBadgeCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.UserBadgeUpsertWithWhereUniqueWithoutUserInput | Prisma.UserBadgeUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.UserBadgeCreateManyUserInputEnvelope;
    set?: Prisma.UserBadgeWhereUniqueInput | Prisma.UserBadgeWhereUniqueInput[];
    disconnect?: Prisma.UserBadgeWhereUniqueInput | Prisma.UserBadgeWhereUniqueInput[];
    delete?: Prisma.UserBadgeWhereUniqueInput | Prisma.UserBadgeWhereUniqueInput[];
    connect?: Prisma.UserBadgeWhereUniqueInput | Prisma.UserBadgeWhereUniqueInput[];
    update?: Prisma.UserBadgeUpdateWithWhereUniqueWithoutUserInput | Prisma.UserBadgeUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.UserBadgeUpdateManyWithWhereWithoutUserInput | Prisma.UserBadgeUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.UserBadgeScalarWhereInput | Prisma.UserBadgeScalarWhereInput[];
};
export type UserBadgeCreateNestedManyWithoutBadgeInput = {
    create?: Prisma.XOR<Prisma.UserBadgeCreateWithoutBadgeInput, Prisma.UserBadgeUncheckedCreateWithoutBadgeInput> | Prisma.UserBadgeCreateWithoutBadgeInput[] | Prisma.UserBadgeUncheckedCreateWithoutBadgeInput[];
    connectOrCreate?: Prisma.UserBadgeCreateOrConnectWithoutBadgeInput | Prisma.UserBadgeCreateOrConnectWithoutBadgeInput[];
    createMany?: Prisma.UserBadgeCreateManyBadgeInputEnvelope;
    connect?: Prisma.UserBadgeWhereUniqueInput | Prisma.UserBadgeWhereUniqueInput[];
};
export type UserBadgeUncheckedCreateNestedManyWithoutBadgeInput = {
    create?: Prisma.XOR<Prisma.UserBadgeCreateWithoutBadgeInput, Prisma.UserBadgeUncheckedCreateWithoutBadgeInput> | Prisma.UserBadgeCreateWithoutBadgeInput[] | Prisma.UserBadgeUncheckedCreateWithoutBadgeInput[];
    connectOrCreate?: Prisma.UserBadgeCreateOrConnectWithoutBadgeInput | Prisma.UserBadgeCreateOrConnectWithoutBadgeInput[];
    createMany?: Prisma.UserBadgeCreateManyBadgeInputEnvelope;
    connect?: Prisma.UserBadgeWhereUniqueInput | Prisma.UserBadgeWhereUniqueInput[];
};
export type UserBadgeUpdateManyWithoutBadgeNestedInput = {
    create?: Prisma.XOR<Prisma.UserBadgeCreateWithoutBadgeInput, Prisma.UserBadgeUncheckedCreateWithoutBadgeInput> | Prisma.UserBadgeCreateWithoutBadgeInput[] | Prisma.UserBadgeUncheckedCreateWithoutBadgeInput[];
    connectOrCreate?: Prisma.UserBadgeCreateOrConnectWithoutBadgeInput | Prisma.UserBadgeCreateOrConnectWithoutBadgeInput[];
    upsert?: Prisma.UserBadgeUpsertWithWhereUniqueWithoutBadgeInput | Prisma.UserBadgeUpsertWithWhereUniqueWithoutBadgeInput[];
    createMany?: Prisma.UserBadgeCreateManyBadgeInputEnvelope;
    set?: Prisma.UserBadgeWhereUniqueInput | Prisma.UserBadgeWhereUniqueInput[];
    disconnect?: Prisma.UserBadgeWhereUniqueInput | Prisma.UserBadgeWhereUniqueInput[];
    delete?: Prisma.UserBadgeWhereUniqueInput | Prisma.UserBadgeWhereUniqueInput[];
    connect?: Prisma.UserBadgeWhereUniqueInput | Prisma.UserBadgeWhereUniqueInput[];
    update?: Prisma.UserBadgeUpdateWithWhereUniqueWithoutBadgeInput | Prisma.UserBadgeUpdateWithWhereUniqueWithoutBadgeInput[];
    updateMany?: Prisma.UserBadgeUpdateManyWithWhereWithoutBadgeInput | Prisma.UserBadgeUpdateManyWithWhereWithoutBadgeInput[];
    deleteMany?: Prisma.UserBadgeScalarWhereInput | Prisma.UserBadgeScalarWhereInput[];
};
export type UserBadgeUncheckedUpdateManyWithoutBadgeNestedInput = {
    create?: Prisma.XOR<Prisma.UserBadgeCreateWithoutBadgeInput, Prisma.UserBadgeUncheckedCreateWithoutBadgeInput> | Prisma.UserBadgeCreateWithoutBadgeInput[] | Prisma.UserBadgeUncheckedCreateWithoutBadgeInput[];
    connectOrCreate?: Prisma.UserBadgeCreateOrConnectWithoutBadgeInput | Prisma.UserBadgeCreateOrConnectWithoutBadgeInput[];
    upsert?: Prisma.UserBadgeUpsertWithWhereUniqueWithoutBadgeInput | Prisma.UserBadgeUpsertWithWhereUniqueWithoutBadgeInput[];
    createMany?: Prisma.UserBadgeCreateManyBadgeInputEnvelope;
    set?: Prisma.UserBadgeWhereUniqueInput | Prisma.UserBadgeWhereUniqueInput[];
    disconnect?: Prisma.UserBadgeWhereUniqueInput | Prisma.UserBadgeWhereUniqueInput[];
    delete?: Prisma.UserBadgeWhereUniqueInput | Prisma.UserBadgeWhereUniqueInput[];
    connect?: Prisma.UserBadgeWhereUniqueInput | Prisma.UserBadgeWhereUniqueInput[];
    update?: Prisma.UserBadgeUpdateWithWhereUniqueWithoutBadgeInput | Prisma.UserBadgeUpdateWithWhereUniqueWithoutBadgeInput[];
    updateMany?: Prisma.UserBadgeUpdateManyWithWhereWithoutBadgeInput | Prisma.UserBadgeUpdateManyWithWhereWithoutBadgeInput[];
    deleteMany?: Prisma.UserBadgeScalarWhereInput | Prisma.UserBadgeScalarWhereInput[];
};
export type UserBadgeCreateWithoutUserInput = {
    id?: string;
    earnedAt?: Date | string;
    badge: Prisma.BadgeCreateNestedOneWithoutUserBadgesInput;
};
export type UserBadgeUncheckedCreateWithoutUserInput = {
    id?: string;
    badgeId: string;
    earnedAt?: Date | string;
};
export type UserBadgeCreateOrConnectWithoutUserInput = {
    where: Prisma.UserBadgeWhereUniqueInput;
    create: Prisma.XOR<Prisma.UserBadgeCreateWithoutUserInput, Prisma.UserBadgeUncheckedCreateWithoutUserInput>;
};
export type UserBadgeCreateManyUserInputEnvelope = {
    data: Prisma.UserBadgeCreateManyUserInput | Prisma.UserBadgeCreateManyUserInput[];
    skipDuplicates?: boolean;
};
export type UserBadgeUpsertWithWhereUniqueWithoutUserInput = {
    where: Prisma.UserBadgeWhereUniqueInput;
    update: Prisma.XOR<Prisma.UserBadgeUpdateWithoutUserInput, Prisma.UserBadgeUncheckedUpdateWithoutUserInput>;
    create: Prisma.XOR<Prisma.UserBadgeCreateWithoutUserInput, Prisma.UserBadgeUncheckedCreateWithoutUserInput>;
};
export type UserBadgeUpdateWithWhereUniqueWithoutUserInput = {
    where: Prisma.UserBadgeWhereUniqueInput;
    data: Prisma.XOR<Prisma.UserBadgeUpdateWithoutUserInput, Prisma.UserBadgeUncheckedUpdateWithoutUserInput>;
};
export type UserBadgeUpdateManyWithWhereWithoutUserInput = {
    where: Prisma.UserBadgeScalarWhereInput;
    data: Prisma.XOR<Prisma.UserBadgeUpdateManyMutationInput, Prisma.UserBadgeUncheckedUpdateManyWithoutUserInput>;
};
export type UserBadgeScalarWhereInput = {
    AND?: Prisma.UserBadgeScalarWhereInput | Prisma.UserBadgeScalarWhereInput[];
    OR?: Prisma.UserBadgeScalarWhereInput[];
    NOT?: Prisma.UserBadgeScalarWhereInput | Prisma.UserBadgeScalarWhereInput[];
    id?: Prisma.StringFilter<"UserBadge"> | string;
    userId?: Prisma.StringFilter<"UserBadge"> | string;
    badgeId?: Prisma.StringFilter<"UserBadge"> | string;
    earnedAt?: Prisma.DateTimeFilter<"UserBadge"> | Date | string;
};
export type UserBadgeCreateWithoutBadgeInput = {
    id?: string;
    earnedAt?: Date | string;
    user: Prisma.UserCreateNestedOneWithoutUserBadgesInput;
};
export type UserBadgeUncheckedCreateWithoutBadgeInput = {
    id?: string;
    userId: string;
    earnedAt?: Date | string;
};
export type UserBadgeCreateOrConnectWithoutBadgeInput = {
    where: Prisma.UserBadgeWhereUniqueInput;
    create: Prisma.XOR<Prisma.UserBadgeCreateWithoutBadgeInput, Prisma.UserBadgeUncheckedCreateWithoutBadgeInput>;
};
export type UserBadgeCreateManyBadgeInputEnvelope = {
    data: Prisma.UserBadgeCreateManyBadgeInput | Prisma.UserBadgeCreateManyBadgeInput[];
    skipDuplicates?: boolean;
};
export type UserBadgeUpsertWithWhereUniqueWithoutBadgeInput = {
    where: Prisma.UserBadgeWhereUniqueInput;
    update: Prisma.XOR<Prisma.UserBadgeUpdateWithoutBadgeInput, Prisma.UserBadgeUncheckedUpdateWithoutBadgeInput>;
    create: Prisma.XOR<Prisma.UserBadgeCreateWithoutBadgeInput, Prisma.UserBadgeUncheckedCreateWithoutBadgeInput>;
};
export type UserBadgeUpdateWithWhereUniqueWithoutBadgeInput = {
    where: Prisma.UserBadgeWhereUniqueInput;
    data: Prisma.XOR<Prisma.UserBadgeUpdateWithoutBadgeInput, Prisma.UserBadgeUncheckedUpdateWithoutBadgeInput>;
};
export type UserBadgeUpdateManyWithWhereWithoutBadgeInput = {
    where: Prisma.UserBadgeScalarWhereInput;
    data: Prisma.XOR<Prisma.UserBadgeUpdateManyMutationInput, Prisma.UserBadgeUncheckedUpdateManyWithoutBadgeInput>;
};
export type UserBadgeCreateManyUserInput = {
    id?: string;
    badgeId: string;
    earnedAt?: Date | string;
};
export type UserBadgeUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    earnedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    badge?: Prisma.BadgeUpdateOneRequiredWithoutUserBadgesNestedInput;
};
export type UserBadgeUncheckedUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    badgeId?: Prisma.StringFieldUpdateOperationsInput | string;
    earnedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UserBadgeUncheckedUpdateManyWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    badgeId?: Prisma.StringFieldUpdateOperationsInput | string;
    earnedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UserBadgeCreateManyBadgeInput = {
    id?: string;
    userId: string;
    earnedAt?: Date | string;
};
export type UserBadgeUpdateWithoutBadgeInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    earnedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutUserBadgesNestedInput;
};
export type UserBadgeUncheckedUpdateWithoutBadgeInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    earnedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UserBadgeUncheckedUpdateManyWithoutBadgeInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    earnedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UserBadgeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    badgeId?: boolean;
    earnedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    badge?: boolean | Prisma.BadgeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["userBadge"]>;
export type UserBadgeSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    badgeId?: boolean;
    earnedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    badge?: boolean | Prisma.BadgeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["userBadge"]>;
export type UserBadgeSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    badgeId?: boolean;
    earnedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    badge?: boolean | Prisma.BadgeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["userBadge"]>;
export type UserBadgeSelectScalar = {
    id?: boolean;
    userId?: boolean;
    badgeId?: boolean;
    earnedAt?: boolean;
};
export type UserBadgeOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "userId" | "badgeId" | "earnedAt", ExtArgs["result"]["userBadge"]>;
export type UserBadgeInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    badge?: boolean | Prisma.BadgeDefaultArgs<ExtArgs>;
};
export type UserBadgeIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    badge?: boolean | Prisma.BadgeDefaultArgs<ExtArgs>;
};
export type UserBadgeIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    badge?: boolean | Prisma.BadgeDefaultArgs<ExtArgs>;
};
export type $UserBadgePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "UserBadge";
    objects: {
        user: Prisma.$UserPayload<ExtArgs>;
        badge: Prisma.$BadgePayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        userId: string;
        badgeId: string;
        earnedAt: Date;
    }, ExtArgs["result"]["userBadge"]>;
    composites: {};
};
export type UserBadgeGetPayload<S extends boolean | null | undefined | UserBadgeDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$UserBadgePayload, S>;
export type UserBadgeCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<UserBadgeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: UserBadgeCountAggregateInputType | true;
};
export interface UserBadgeDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['UserBadge'];
        meta: {
            name: 'UserBadge';
        };
    };
    findUnique<T extends UserBadgeFindUniqueArgs>(args: Prisma.SelectSubset<T, UserBadgeFindUniqueArgs<ExtArgs>>): Prisma.Prisma__UserBadgeClient<runtime.Types.Result.GetResult<Prisma.$UserBadgePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends UserBadgeFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, UserBadgeFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__UserBadgeClient<runtime.Types.Result.GetResult<Prisma.$UserBadgePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends UserBadgeFindFirstArgs>(args?: Prisma.SelectSubset<T, UserBadgeFindFirstArgs<ExtArgs>>): Prisma.Prisma__UserBadgeClient<runtime.Types.Result.GetResult<Prisma.$UserBadgePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends UserBadgeFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, UserBadgeFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__UserBadgeClient<runtime.Types.Result.GetResult<Prisma.$UserBadgePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends UserBadgeFindManyArgs>(args?: Prisma.SelectSubset<T, UserBadgeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UserBadgePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends UserBadgeCreateArgs>(args: Prisma.SelectSubset<T, UserBadgeCreateArgs<ExtArgs>>): Prisma.Prisma__UserBadgeClient<runtime.Types.Result.GetResult<Prisma.$UserBadgePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends UserBadgeCreateManyArgs>(args?: Prisma.SelectSubset<T, UserBadgeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends UserBadgeCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, UserBadgeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UserBadgePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends UserBadgeDeleteArgs>(args: Prisma.SelectSubset<T, UserBadgeDeleteArgs<ExtArgs>>): Prisma.Prisma__UserBadgeClient<runtime.Types.Result.GetResult<Prisma.$UserBadgePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends UserBadgeUpdateArgs>(args: Prisma.SelectSubset<T, UserBadgeUpdateArgs<ExtArgs>>): Prisma.Prisma__UserBadgeClient<runtime.Types.Result.GetResult<Prisma.$UserBadgePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends UserBadgeDeleteManyArgs>(args?: Prisma.SelectSubset<T, UserBadgeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends UserBadgeUpdateManyArgs>(args: Prisma.SelectSubset<T, UserBadgeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends UserBadgeUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, UserBadgeUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UserBadgePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends UserBadgeUpsertArgs>(args: Prisma.SelectSubset<T, UserBadgeUpsertArgs<ExtArgs>>): Prisma.Prisma__UserBadgeClient<runtime.Types.Result.GetResult<Prisma.$UserBadgePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends UserBadgeCountArgs>(args?: Prisma.Subset<T, UserBadgeCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], UserBadgeCountAggregateOutputType> : number>;
    aggregate<T extends UserBadgeAggregateArgs>(args: Prisma.Subset<T, UserBadgeAggregateArgs>): Prisma.PrismaPromise<GetUserBadgeAggregateType<T>>;
    groupBy<T extends UserBadgeGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: UserBadgeGroupByArgs['orderBy'];
    } : {
        orderBy?: UserBadgeGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, UserBadgeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserBadgeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: UserBadgeFieldRefs;
}
export interface Prisma__UserBadgeClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    user<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    badge<T extends Prisma.BadgeDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.BadgeDefaultArgs<ExtArgs>>): Prisma.Prisma__BadgeClient<runtime.Types.Result.GetResult<Prisma.$BadgePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface UserBadgeFieldRefs {
    readonly id: Prisma.FieldRef<"UserBadge", 'String'>;
    readonly userId: Prisma.FieldRef<"UserBadge", 'String'>;
    readonly badgeId: Prisma.FieldRef<"UserBadge", 'String'>;
    readonly earnedAt: Prisma.FieldRef<"UserBadge", 'DateTime'>;
}
export type UserBadgeFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserBadgeSelect<ExtArgs> | null;
    omit?: Prisma.UserBadgeOmit<ExtArgs> | null;
    include?: Prisma.UserBadgeInclude<ExtArgs> | null;
    where: Prisma.UserBadgeWhereUniqueInput;
};
export type UserBadgeFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserBadgeSelect<ExtArgs> | null;
    omit?: Prisma.UserBadgeOmit<ExtArgs> | null;
    include?: Prisma.UserBadgeInclude<ExtArgs> | null;
    where: Prisma.UserBadgeWhereUniqueInput;
};
export type UserBadgeFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserBadgeSelect<ExtArgs> | null;
    omit?: Prisma.UserBadgeOmit<ExtArgs> | null;
    include?: Prisma.UserBadgeInclude<ExtArgs> | null;
    where?: Prisma.UserBadgeWhereInput;
    orderBy?: Prisma.UserBadgeOrderByWithRelationInput | Prisma.UserBadgeOrderByWithRelationInput[];
    cursor?: Prisma.UserBadgeWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.UserBadgeScalarFieldEnum | Prisma.UserBadgeScalarFieldEnum[];
};
export type UserBadgeFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserBadgeSelect<ExtArgs> | null;
    omit?: Prisma.UserBadgeOmit<ExtArgs> | null;
    include?: Prisma.UserBadgeInclude<ExtArgs> | null;
    where?: Prisma.UserBadgeWhereInput;
    orderBy?: Prisma.UserBadgeOrderByWithRelationInput | Prisma.UserBadgeOrderByWithRelationInput[];
    cursor?: Prisma.UserBadgeWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.UserBadgeScalarFieldEnum | Prisma.UserBadgeScalarFieldEnum[];
};
export type UserBadgeFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserBadgeSelect<ExtArgs> | null;
    omit?: Prisma.UserBadgeOmit<ExtArgs> | null;
    include?: Prisma.UserBadgeInclude<ExtArgs> | null;
    where?: Prisma.UserBadgeWhereInput;
    orderBy?: Prisma.UserBadgeOrderByWithRelationInput | Prisma.UserBadgeOrderByWithRelationInput[];
    cursor?: Prisma.UserBadgeWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.UserBadgeScalarFieldEnum | Prisma.UserBadgeScalarFieldEnum[];
};
export type UserBadgeCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserBadgeSelect<ExtArgs> | null;
    omit?: Prisma.UserBadgeOmit<ExtArgs> | null;
    include?: Prisma.UserBadgeInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.UserBadgeCreateInput, Prisma.UserBadgeUncheckedCreateInput>;
};
export type UserBadgeCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.UserBadgeCreateManyInput | Prisma.UserBadgeCreateManyInput[];
    skipDuplicates?: boolean;
};
export type UserBadgeCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserBadgeSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.UserBadgeOmit<ExtArgs> | null;
    data: Prisma.UserBadgeCreateManyInput | Prisma.UserBadgeCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.UserBadgeIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type UserBadgeUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserBadgeSelect<ExtArgs> | null;
    omit?: Prisma.UserBadgeOmit<ExtArgs> | null;
    include?: Prisma.UserBadgeInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.UserBadgeUpdateInput, Prisma.UserBadgeUncheckedUpdateInput>;
    where: Prisma.UserBadgeWhereUniqueInput;
};
export type UserBadgeUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.UserBadgeUpdateManyMutationInput, Prisma.UserBadgeUncheckedUpdateManyInput>;
    where?: Prisma.UserBadgeWhereInput;
    limit?: number;
};
export type UserBadgeUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserBadgeSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.UserBadgeOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.UserBadgeUpdateManyMutationInput, Prisma.UserBadgeUncheckedUpdateManyInput>;
    where?: Prisma.UserBadgeWhereInput;
    limit?: number;
    include?: Prisma.UserBadgeIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type UserBadgeUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserBadgeSelect<ExtArgs> | null;
    omit?: Prisma.UserBadgeOmit<ExtArgs> | null;
    include?: Prisma.UserBadgeInclude<ExtArgs> | null;
    where: Prisma.UserBadgeWhereUniqueInput;
    create: Prisma.XOR<Prisma.UserBadgeCreateInput, Prisma.UserBadgeUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.UserBadgeUpdateInput, Prisma.UserBadgeUncheckedUpdateInput>;
};
export type UserBadgeDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserBadgeSelect<ExtArgs> | null;
    omit?: Prisma.UserBadgeOmit<ExtArgs> | null;
    include?: Prisma.UserBadgeInclude<ExtArgs> | null;
    where: Prisma.UserBadgeWhereUniqueInput;
};
export type UserBadgeDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UserBadgeWhereInput;
    limit?: number;
};
export type UserBadgeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserBadgeSelect<ExtArgs> | null;
    omit?: Prisma.UserBadgeOmit<ExtArgs> | null;
    include?: Prisma.UserBadgeInclude<ExtArgs> | null;
};
