import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace";
export type BadgeModel = runtime.Types.Result.DefaultSelection<Prisma.$BadgePayload>;
export type AggregateBadge = {
    _count: BadgeCountAggregateOutputType | null;
    _min: BadgeMinAggregateOutputType | null;
    _max: BadgeMaxAggregateOutputType | null;
};
export type BadgeMinAggregateOutputType = {
    id: string | null;
    code: string | null;
    name: string | null;
    description: string | null;
    condition: string | null;
    icon: string | null;
    createdAt: Date | null;
};
export type BadgeMaxAggregateOutputType = {
    id: string | null;
    code: string | null;
    name: string | null;
    description: string | null;
    condition: string | null;
    icon: string | null;
    createdAt: Date | null;
};
export type BadgeCountAggregateOutputType = {
    id: number;
    code: number;
    name: number;
    description: number;
    condition: number;
    icon: number;
    createdAt: number;
    _all: number;
};
export type BadgeMinAggregateInputType = {
    id?: true;
    code?: true;
    name?: true;
    description?: true;
    condition?: true;
    icon?: true;
    createdAt?: true;
};
export type BadgeMaxAggregateInputType = {
    id?: true;
    code?: true;
    name?: true;
    description?: true;
    condition?: true;
    icon?: true;
    createdAt?: true;
};
export type BadgeCountAggregateInputType = {
    id?: true;
    code?: true;
    name?: true;
    description?: true;
    condition?: true;
    icon?: true;
    createdAt?: true;
    _all?: true;
};
export type BadgeAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.BadgeWhereInput;
    orderBy?: Prisma.BadgeOrderByWithRelationInput | Prisma.BadgeOrderByWithRelationInput[];
    cursor?: Prisma.BadgeWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | BadgeCountAggregateInputType;
    _min?: BadgeMinAggregateInputType;
    _max?: BadgeMaxAggregateInputType;
};
export type GetBadgeAggregateType<T extends BadgeAggregateArgs> = {
    [P in keyof T & keyof AggregateBadge]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateBadge[P]> : Prisma.GetScalarType<T[P], AggregateBadge[P]>;
};
export type BadgeGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.BadgeWhereInput;
    orderBy?: Prisma.BadgeOrderByWithAggregationInput | Prisma.BadgeOrderByWithAggregationInput[];
    by: Prisma.BadgeScalarFieldEnum[] | Prisma.BadgeScalarFieldEnum;
    having?: Prisma.BadgeScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: BadgeCountAggregateInputType | true;
    _min?: BadgeMinAggregateInputType;
    _max?: BadgeMaxAggregateInputType;
};
export type BadgeGroupByOutputType = {
    id: string;
    code: string;
    name: string;
    description: string;
    condition: string;
    icon: string | null;
    createdAt: Date;
    _count: BadgeCountAggregateOutputType | null;
    _min: BadgeMinAggregateOutputType | null;
    _max: BadgeMaxAggregateOutputType | null;
};
export type GetBadgeGroupByPayload<T extends BadgeGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<BadgeGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof BadgeGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], BadgeGroupByOutputType[P]> : Prisma.GetScalarType<T[P], BadgeGroupByOutputType[P]>;
}>>;
export type BadgeWhereInput = {
    AND?: Prisma.BadgeWhereInput | Prisma.BadgeWhereInput[];
    OR?: Prisma.BadgeWhereInput[];
    NOT?: Prisma.BadgeWhereInput | Prisma.BadgeWhereInput[];
    id?: Prisma.StringFilter<"Badge"> | string;
    code?: Prisma.StringFilter<"Badge"> | string;
    name?: Prisma.StringFilter<"Badge"> | string;
    description?: Prisma.StringFilter<"Badge"> | string;
    condition?: Prisma.StringFilter<"Badge"> | string;
    icon?: Prisma.StringNullableFilter<"Badge"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"Badge"> | Date | string;
    userBadges?: Prisma.UserBadgeListRelationFilter;
};
export type BadgeOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    condition?: Prisma.SortOrder;
    icon?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    userBadges?: Prisma.UserBadgeOrderByRelationAggregateInput;
};
export type BadgeWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    code?: string;
    AND?: Prisma.BadgeWhereInput | Prisma.BadgeWhereInput[];
    OR?: Prisma.BadgeWhereInput[];
    NOT?: Prisma.BadgeWhereInput | Prisma.BadgeWhereInput[];
    name?: Prisma.StringFilter<"Badge"> | string;
    description?: Prisma.StringFilter<"Badge"> | string;
    condition?: Prisma.StringFilter<"Badge"> | string;
    icon?: Prisma.StringNullableFilter<"Badge"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"Badge"> | Date | string;
    userBadges?: Prisma.UserBadgeListRelationFilter;
}, "id" | "code">;
export type BadgeOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    condition?: Prisma.SortOrder;
    icon?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.BadgeCountOrderByAggregateInput;
    _max?: Prisma.BadgeMaxOrderByAggregateInput;
    _min?: Prisma.BadgeMinOrderByAggregateInput;
};
export type BadgeScalarWhereWithAggregatesInput = {
    AND?: Prisma.BadgeScalarWhereWithAggregatesInput | Prisma.BadgeScalarWhereWithAggregatesInput[];
    OR?: Prisma.BadgeScalarWhereWithAggregatesInput[];
    NOT?: Prisma.BadgeScalarWhereWithAggregatesInput | Prisma.BadgeScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"Badge"> | string;
    code?: Prisma.StringWithAggregatesFilter<"Badge"> | string;
    name?: Prisma.StringWithAggregatesFilter<"Badge"> | string;
    description?: Prisma.StringWithAggregatesFilter<"Badge"> | string;
    condition?: Prisma.StringWithAggregatesFilter<"Badge"> | string;
    icon?: Prisma.StringNullableWithAggregatesFilter<"Badge"> | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Badge"> | Date | string;
};
export type BadgeCreateInput = {
    id?: string;
    code: string;
    name: string;
    description: string;
    condition: string;
    icon?: string | null;
    createdAt?: Date | string;
    userBadges?: Prisma.UserBadgeCreateNestedManyWithoutBadgeInput;
};
export type BadgeUncheckedCreateInput = {
    id?: string;
    code: string;
    name: string;
    description: string;
    condition: string;
    icon?: string | null;
    createdAt?: Date | string;
    userBadges?: Prisma.UserBadgeUncheckedCreateNestedManyWithoutBadgeInput;
};
export type BadgeUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    condition?: Prisma.StringFieldUpdateOperationsInput | string;
    icon?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    userBadges?: Prisma.UserBadgeUpdateManyWithoutBadgeNestedInput;
};
export type BadgeUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    condition?: Prisma.StringFieldUpdateOperationsInput | string;
    icon?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    userBadges?: Prisma.UserBadgeUncheckedUpdateManyWithoutBadgeNestedInput;
};
export type BadgeCreateManyInput = {
    id?: string;
    code: string;
    name: string;
    description: string;
    condition: string;
    icon?: string | null;
    createdAt?: Date | string;
};
export type BadgeUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    condition?: Prisma.StringFieldUpdateOperationsInput | string;
    icon?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type BadgeUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    condition?: Prisma.StringFieldUpdateOperationsInput | string;
    icon?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type BadgeCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    condition?: Prisma.SortOrder;
    icon?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type BadgeMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    condition?: Prisma.SortOrder;
    icon?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type BadgeMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    condition?: Prisma.SortOrder;
    icon?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type BadgeScalarRelationFilter = {
    is?: Prisma.BadgeWhereInput;
    isNot?: Prisma.BadgeWhereInput;
};
export type BadgeCreateNestedOneWithoutUserBadgesInput = {
    create?: Prisma.XOR<Prisma.BadgeCreateWithoutUserBadgesInput, Prisma.BadgeUncheckedCreateWithoutUserBadgesInput>;
    connectOrCreate?: Prisma.BadgeCreateOrConnectWithoutUserBadgesInput;
    connect?: Prisma.BadgeWhereUniqueInput;
};
export type BadgeUpdateOneRequiredWithoutUserBadgesNestedInput = {
    create?: Prisma.XOR<Prisma.BadgeCreateWithoutUserBadgesInput, Prisma.BadgeUncheckedCreateWithoutUserBadgesInput>;
    connectOrCreate?: Prisma.BadgeCreateOrConnectWithoutUserBadgesInput;
    upsert?: Prisma.BadgeUpsertWithoutUserBadgesInput;
    connect?: Prisma.BadgeWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.BadgeUpdateToOneWithWhereWithoutUserBadgesInput, Prisma.BadgeUpdateWithoutUserBadgesInput>, Prisma.BadgeUncheckedUpdateWithoutUserBadgesInput>;
};
export type BadgeCreateWithoutUserBadgesInput = {
    id?: string;
    code: string;
    name: string;
    description: string;
    condition: string;
    icon?: string | null;
    createdAt?: Date | string;
};
export type BadgeUncheckedCreateWithoutUserBadgesInput = {
    id?: string;
    code: string;
    name: string;
    description: string;
    condition: string;
    icon?: string | null;
    createdAt?: Date | string;
};
export type BadgeCreateOrConnectWithoutUserBadgesInput = {
    where: Prisma.BadgeWhereUniqueInput;
    create: Prisma.XOR<Prisma.BadgeCreateWithoutUserBadgesInput, Prisma.BadgeUncheckedCreateWithoutUserBadgesInput>;
};
export type BadgeUpsertWithoutUserBadgesInput = {
    update: Prisma.XOR<Prisma.BadgeUpdateWithoutUserBadgesInput, Prisma.BadgeUncheckedUpdateWithoutUserBadgesInput>;
    create: Prisma.XOR<Prisma.BadgeCreateWithoutUserBadgesInput, Prisma.BadgeUncheckedCreateWithoutUserBadgesInput>;
    where?: Prisma.BadgeWhereInput;
};
export type BadgeUpdateToOneWithWhereWithoutUserBadgesInput = {
    where?: Prisma.BadgeWhereInput;
    data: Prisma.XOR<Prisma.BadgeUpdateWithoutUserBadgesInput, Prisma.BadgeUncheckedUpdateWithoutUserBadgesInput>;
};
export type BadgeUpdateWithoutUserBadgesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    condition?: Prisma.StringFieldUpdateOperationsInput | string;
    icon?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type BadgeUncheckedUpdateWithoutUserBadgesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    condition?: Prisma.StringFieldUpdateOperationsInput | string;
    icon?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type BadgeCountOutputType = {
    userBadges: number;
};
export type BadgeCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    userBadges?: boolean | BadgeCountOutputTypeCountUserBadgesArgs;
};
export type BadgeCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.BadgeCountOutputTypeSelect<ExtArgs> | null;
};
export type BadgeCountOutputTypeCountUserBadgesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UserBadgeWhereInput;
};
export type BadgeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    code?: boolean;
    name?: boolean;
    description?: boolean;
    condition?: boolean;
    icon?: boolean;
    createdAt?: boolean;
    userBadges?: boolean | Prisma.Badge$userBadgesArgs<ExtArgs>;
    _count?: boolean | Prisma.BadgeCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["badge"]>;
export type BadgeSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    code?: boolean;
    name?: boolean;
    description?: boolean;
    condition?: boolean;
    icon?: boolean;
    createdAt?: boolean;
}, ExtArgs["result"]["badge"]>;
export type BadgeSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    code?: boolean;
    name?: boolean;
    description?: boolean;
    condition?: boolean;
    icon?: boolean;
    createdAt?: boolean;
}, ExtArgs["result"]["badge"]>;
export type BadgeSelectScalar = {
    id?: boolean;
    code?: boolean;
    name?: boolean;
    description?: boolean;
    condition?: boolean;
    icon?: boolean;
    createdAt?: boolean;
};
export type BadgeOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "code" | "name" | "description" | "condition" | "icon" | "createdAt", ExtArgs["result"]["badge"]>;
export type BadgeInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    userBadges?: boolean | Prisma.Badge$userBadgesArgs<ExtArgs>;
    _count?: boolean | Prisma.BadgeCountOutputTypeDefaultArgs<ExtArgs>;
};
export type BadgeIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type BadgeIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $BadgePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Badge";
    objects: {
        userBadges: Prisma.$UserBadgePayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        code: string;
        name: string;
        description: string;
        condition: string;
        icon: string | null;
        createdAt: Date;
    }, ExtArgs["result"]["badge"]>;
    composites: {};
};
export type BadgeGetPayload<S extends boolean | null | undefined | BadgeDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$BadgePayload, S>;
export type BadgeCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<BadgeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: BadgeCountAggregateInputType | true;
};
export interface BadgeDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Badge'];
        meta: {
            name: 'Badge';
        };
    };
    findUnique<T extends BadgeFindUniqueArgs>(args: Prisma.SelectSubset<T, BadgeFindUniqueArgs<ExtArgs>>): Prisma.Prisma__BadgeClient<runtime.Types.Result.GetResult<Prisma.$BadgePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends BadgeFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, BadgeFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__BadgeClient<runtime.Types.Result.GetResult<Prisma.$BadgePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends BadgeFindFirstArgs>(args?: Prisma.SelectSubset<T, BadgeFindFirstArgs<ExtArgs>>): Prisma.Prisma__BadgeClient<runtime.Types.Result.GetResult<Prisma.$BadgePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends BadgeFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, BadgeFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__BadgeClient<runtime.Types.Result.GetResult<Prisma.$BadgePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends BadgeFindManyArgs>(args?: Prisma.SelectSubset<T, BadgeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$BadgePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends BadgeCreateArgs>(args: Prisma.SelectSubset<T, BadgeCreateArgs<ExtArgs>>): Prisma.Prisma__BadgeClient<runtime.Types.Result.GetResult<Prisma.$BadgePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends BadgeCreateManyArgs>(args?: Prisma.SelectSubset<T, BadgeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends BadgeCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, BadgeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$BadgePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends BadgeDeleteArgs>(args: Prisma.SelectSubset<T, BadgeDeleteArgs<ExtArgs>>): Prisma.Prisma__BadgeClient<runtime.Types.Result.GetResult<Prisma.$BadgePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends BadgeUpdateArgs>(args: Prisma.SelectSubset<T, BadgeUpdateArgs<ExtArgs>>): Prisma.Prisma__BadgeClient<runtime.Types.Result.GetResult<Prisma.$BadgePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends BadgeDeleteManyArgs>(args?: Prisma.SelectSubset<T, BadgeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends BadgeUpdateManyArgs>(args: Prisma.SelectSubset<T, BadgeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends BadgeUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, BadgeUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$BadgePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends BadgeUpsertArgs>(args: Prisma.SelectSubset<T, BadgeUpsertArgs<ExtArgs>>): Prisma.Prisma__BadgeClient<runtime.Types.Result.GetResult<Prisma.$BadgePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends BadgeCountArgs>(args?: Prisma.Subset<T, BadgeCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], BadgeCountAggregateOutputType> : number>;
    aggregate<T extends BadgeAggregateArgs>(args: Prisma.Subset<T, BadgeAggregateArgs>): Prisma.PrismaPromise<GetBadgeAggregateType<T>>;
    groupBy<T extends BadgeGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: BadgeGroupByArgs['orderBy'];
    } : {
        orderBy?: BadgeGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, BadgeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBadgeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: BadgeFieldRefs;
}
export interface Prisma__BadgeClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    userBadges<T extends Prisma.Badge$userBadgesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Badge$userBadgesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UserBadgePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface BadgeFieldRefs {
    readonly id: Prisma.FieldRef<"Badge", 'String'>;
    readonly code: Prisma.FieldRef<"Badge", 'String'>;
    readonly name: Prisma.FieldRef<"Badge", 'String'>;
    readonly description: Prisma.FieldRef<"Badge", 'String'>;
    readonly condition: Prisma.FieldRef<"Badge", 'String'>;
    readonly icon: Prisma.FieldRef<"Badge", 'String'>;
    readonly createdAt: Prisma.FieldRef<"Badge", 'DateTime'>;
}
export type BadgeFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.BadgeSelect<ExtArgs> | null;
    omit?: Prisma.BadgeOmit<ExtArgs> | null;
    include?: Prisma.BadgeInclude<ExtArgs> | null;
    where: Prisma.BadgeWhereUniqueInput;
};
export type BadgeFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.BadgeSelect<ExtArgs> | null;
    omit?: Prisma.BadgeOmit<ExtArgs> | null;
    include?: Prisma.BadgeInclude<ExtArgs> | null;
    where: Prisma.BadgeWhereUniqueInput;
};
export type BadgeFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.BadgeSelect<ExtArgs> | null;
    omit?: Prisma.BadgeOmit<ExtArgs> | null;
    include?: Prisma.BadgeInclude<ExtArgs> | null;
    where?: Prisma.BadgeWhereInput;
    orderBy?: Prisma.BadgeOrderByWithRelationInput | Prisma.BadgeOrderByWithRelationInput[];
    cursor?: Prisma.BadgeWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.BadgeScalarFieldEnum | Prisma.BadgeScalarFieldEnum[];
};
export type BadgeFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.BadgeSelect<ExtArgs> | null;
    omit?: Prisma.BadgeOmit<ExtArgs> | null;
    include?: Prisma.BadgeInclude<ExtArgs> | null;
    where?: Prisma.BadgeWhereInput;
    orderBy?: Prisma.BadgeOrderByWithRelationInput | Prisma.BadgeOrderByWithRelationInput[];
    cursor?: Prisma.BadgeWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.BadgeScalarFieldEnum | Prisma.BadgeScalarFieldEnum[];
};
export type BadgeFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.BadgeSelect<ExtArgs> | null;
    omit?: Prisma.BadgeOmit<ExtArgs> | null;
    include?: Prisma.BadgeInclude<ExtArgs> | null;
    where?: Prisma.BadgeWhereInput;
    orderBy?: Prisma.BadgeOrderByWithRelationInput | Prisma.BadgeOrderByWithRelationInput[];
    cursor?: Prisma.BadgeWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.BadgeScalarFieldEnum | Prisma.BadgeScalarFieldEnum[];
};
export type BadgeCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.BadgeSelect<ExtArgs> | null;
    omit?: Prisma.BadgeOmit<ExtArgs> | null;
    include?: Prisma.BadgeInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.BadgeCreateInput, Prisma.BadgeUncheckedCreateInput>;
};
export type BadgeCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.BadgeCreateManyInput | Prisma.BadgeCreateManyInput[];
    skipDuplicates?: boolean;
};
export type BadgeCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.BadgeSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.BadgeOmit<ExtArgs> | null;
    data: Prisma.BadgeCreateManyInput | Prisma.BadgeCreateManyInput[];
    skipDuplicates?: boolean;
};
export type BadgeUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.BadgeSelect<ExtArgs> | null;
    omit?: Prisma.BadgeOmit<ExtArgs> | null;
    include?: Prisma.BadgeInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.BadgeUpdateInput, Prisma.BadgeUncheckedUpdateInput>;
    where: Prisma.BadgeWhereUniqueInput;
};
export type BadgeUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.BadgeUpdateManyMutationInput, Prisma.BadgeUncheckedUpdateManyInput>;
    where?: Prisma.BadgeWhereInput;
    limit?: number;
};
export type BadgeUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.BadgeSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.BadgeOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.BadgeUpdateManyMutationInput, Prisma.BadgeUncheckedUpdateManyInput>;
    where?: Prisma.BadgeWhereInput;
    limit?: number;
};
export type BadgeUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.BadgeSelect<ExtArgs> | null;
    omit?: Prisma.BadgeOmit<ExtArgs> | null;
    include?: Prisma.BadgeInclude<ExtArgs> | null;
    where: Prisma.BadgeWhereUniqueInput;
    create: Prisma.XOR<Prisma.BadgeCreateInput, Prisma.BadgeUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.BadgeUpdateInput, Prisma.BadgeUncheckedUpdateInput>;
};
export type BadgeDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.BadgeSelect<ExtArgs> | null;
    omit?: Prisma.BadgeOmit<ExtArgs> | null;
    include?: Prisma.BadgeInclude<ExtArgs> | null;
    where: Prisma.BadgeWhereUniqueInput;
};
export type BadgeDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.BadgeWhereInput;
    limit?: number;
};
export type Badge$userBadgesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type BadgeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.BadgeSelect<ExtArgs> | null;
    omit?: Prisma.BadgeOmit<ExtArgs> | null;
    include?: Prisma.BadgeInclude<ExtArgs> | null;
};
