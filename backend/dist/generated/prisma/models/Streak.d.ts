import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace";
export type StreakModel = runtime.Types.Result.DefaultSelection<Prisma.$StreakPayload>;
export type AggregateStreak = {
    _count: StreakCountAggregateOutputType | null;
    _avg: StreakAvgAggregateOutputType | null;
    _sum: StreakSumAggregateOutputType | null;
    _min: StreakMinAggregateOutputType | null;
    _max: StreakMaxAggregateOutputType | null;
};
export type StreakAvgAggregateOutputType = {
    currentStreak: number | null;
    longestStreak: number | null;
    streakFreezes: number | null;
};
export type StreakSumAggregateOutputType = {
    currentStreak: number | null;
    longestStreak: number | null;
    streakFreezes: number | null;
};
export type StreakMinAggregateOutputType = {
    id: string | null;
    userId: string | null;
    currentStreak: number | null;
    longestStreak: number | null;
    streakFreezes: number | null;
    lastActiveDate: Date | null;
};
export type StreakMaxAggregateOutputType = {
    id: string | null;
    userId: string | null;
    currentStreak: number | null;
    longestStreak: number | null;
    streakFreezes: number | null;
    lastActiveDate: Date | null;
};
export type StreakCountAggregateOutputType = {
    id: number;
    userId: number;
    currentStreak: number;
    longestStreak: number;
    streakFreezes: number;
    lastActiveDate: number;
    _all: number;
};
export type StreakAvgAggregateInputType = {
    currentStreak?: true;
    longestStreak?: true;
    streakFreezes?: true;
};
export type StreakSumAggregateInputType = {
    currentStreak?: true;
    longestStreak?: true;
    streakFreezes?: true;
};
export type StreakMinAggregateInputType = {
    id?: true;
    userId?: true;
    currentStreak?: true;
    longestStreak?: true;
    streakFreezes?: true;
    lastActiveDate?: true;
};
export type StreakMaxAggregateInputType = {
    id?: true;
    userId?: true;
    currentStreak?: true;
    longestStreak?: true;
    streakFreezes?: true;
    lastActiveDate?: true;
};
export type StreakCountAggregateInputType = {
    id?: true;
    userId?: true;
    currentStreak?: true;
    longestStreak?: true;
    streakFreezes?: true;
    lastActiveDate?: true;
    _all?: true;
};
export type StreakAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.StreakWhereInput;
    orderBy?: Prisma.StreakOrderByWithRelationInput | Prisma.StreakOrderByWithRelationInput[];
    cursor?: Prisma.StreakWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | StreakCountAggregateInputType;
    _avg?: StreakAvgAggregateInputType;
    _sum?: StreakSumAggregateInputType;
    _min?: StreakMinAggregateInputType;
    _max?: StreakMaxAggregateInputType;
};
export type GetStreakAggregateType<T extends StreakAggregateArgs> = {
    [P in keyof T & keyof AggregateStreak]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateStreak[P]> : Prisma.GetScalarType<T[P], AggregateStreak[P]>;
};
export type StreakGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.StreakWhereInput;
    orderBy?: Prisma.StreakOrderByWithAggregationInput | Prisma.StreakOrderByWithAggregationInput[];
    by: Prisma.StreakScalarFieldEnum[] | Prisma.StreakScalarFieldEnum;
    having?: Prisma.StreakScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: StreakCountAggregateInputType | true;
    _avg?: StreakAvgAggregateInputType;
    _sum?: StreakSumAggregateInputType;
    _min?: StreakMinAggregateInputType;
    _max?: StreakMaxAggregateInputType;
};
export type StreakGroupByOutputType = {
    id: string;
    userId: string;
    currentStreak: number;
    longestStreak: number;
    streakFreezes: number;
    lastActiveDate: Date | null;
    _count: StreakCountAggregateOutputType | null;
    _avg: StreakAvgAggregateOutputType | null;
    _sum: StreakSumAggregateOutputType | null;
    _min: StreakMinAggregateOutputType | null;
    _max: StreakMaxAggregateOutputType | null;
};
export type GetStreakGroupByPayload<T extends StreakGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<StreakGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof StreakGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], StreakGroupByOutputType[P]> : Prisma.GetScalarType<T[P], StreakGroupByOutputType[P]>;
}>>;
export type StreakWhereInput = {
    AND?: Prisma.StreakWhereInput | Prisma.StreakWhereInput[];
    OR?: Prisma.StreakWhereInput[];
    NOT?: Prisma.StreakWhereInput | Prisma.StreakWhereInput[];
    id?: Prisma.StringFilter<"Streak"> | string;
    userId?: Prisma.StringFilter<"Streak"> | string;
    currentStreak?: Prisma.IntFilter<"Streak"> | number;
    longestStreak?: Prisma.IntFilter<"Streak"> | number;
    streakFreezes?: Prisma.IntFilter<"Streak"> | number;
    lastActiveDate?: Prisma.DateTimeNullableFilter<"Streak"> | Date | string | null;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
};
export type StreakOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    currentStreak?: Prisma.SortOrder;
    longestStreak?: Prisma.SortOrder;
    streakFreezes?: Prisma.SortOrder;
    lastActiveDate?: Prisma.SortOrderInput | Prisma.SortOrder;
    user?: Prisma.UserOrderByWithRelationInput;
};
export type StreakWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    userId?: string;
    AND?: Prisma.StreakWhereInput | Prisma.StreakWhereInput[];
    OR?: Prisma.StreakWhereInput[];
    NOT?: Prisma.StreakWhereInput | Prisma.StreakWhereInput[];
    currentStreak?: Prisma.IntFilter<"Streak"> | number;
    longestStreak?: Prisma.IntFilter<"Streak"> | number;
    streakFreezes?: Prisma.IntFilter<"Streak"> | number;
    lastActiveDate?: Prisma.DateTimeNullableFilter<"Streak"> | Date | string | null;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
}, "id" | "userId">;
export type StreakOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    currentStreak?: Prisma.SortOrder;
    longestStreak?: Prisma.SortOrder;
    streakFreezes?: Prisma.SortOrder;
    lastActiveDate?: Prisma.SortOrderInput | Prisma.SortOrder;
    _count?: Prisma.StreakCountOrderByAggregateInput;
    _avg?: Prisma.StreakAvgOrderByAggregateInput;
    _max?: Prisma.StreakMaxOrderByAggregateInput;
    _min?: Prisma.StreakMinOrderByAggregateInput;
    _sum?: Prisma.StreakSumOrderByAggregateInput;
};
export type StreakScalarWhereWithAggregatesInput = {
    AND?: Prisma.StreakScalarWhereWithAggregatesInput | Prisma.StreakScalarWhereWithAggregatesInput[];
    OR?: Prisma.StreakScalarWhereWithAggregatesInput[];
    NOT?: Prisma.StreakScalarWhereWithAggregatesInput | Prisma.StreakScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"Streak"> | string;
    userId?: Prisma.StringWithAggregatesFilter<"Streak"> | string;
    currentStreak?: Prisma.IntWithAggregatesFilter<"Streak"> | number;
    longestStreak?: Prisma.IntWithAggregatesFilter<"Streak"> | number;
    streakFreezes?: Prisma.IntWithAggregatesFilter<"Streak"> | number;
    lastActiveDate?: Prisma.DateTimeNullableWithAggregatesFilter<"Streak"> | Date | string | null;
};
export type StreakCreateInput = {
    id?: string;
    currentStreak?: number;
    longestStreak?: number;
    streakFreezes?: number;
    lastActiveDate?: Date | string | null;
    user: Prisma.UserCreateNestedOneWithoutStreakInput;
};
export type StreakUncheckedCreateInput = {
    id?: string;
    userId: string;
    currentStreak?: number;
    longestStreak?: number;
    streakFreezes?: number;
    lastActiveDate?: Date | string | null;
};
export type StreakUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    currentStreak?: Prisma.IntFieldUpdateOperationsInput | number;
    longestStreak?: Prisma.IntFieldUpdateOperationsInput | number;
    streakFreezes?: Prisma.IntFieldUpdateOperationsInput | number;
    lastActiveDate?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    user?: Prisma.UserUpdateOneRequiredWithoutStreakNestedInput;
};
export type StreakUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    currentStreak?: Prisma.IntFieldUpdateOperationsInput | number;
    longestStreak?: Prisma.IntFieldUpdateOperationsInput | number;
    streakFreezes?: Prisma.IntFieldUpdateOperationsInput | number;
    lastActiveDate?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type StreakCreateManyInput = {
    id?: string;
    userId: string;
    currentStreak?: number;
    longestStreak?: number;
    streakFreezes?: number;
    lastActiveDate?: Date | string | null;
};
export type StreakUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    currentStreak?: Prisma.IntFieldUpdateOperationsInput | number;
    longestStreak?: Prisma.IntFieldUpdateOperationsInput | number;
    streakFreezes?: Prisma.IntFieldUpdateOperationsInput | number;
    lastActiveDate?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type StreakUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    currentStreak?: Prisma.IntFieldUpdateOperationsInput | number;
    longestStreak?: Prisma.IntFieldUpdateOperationsInput | number;
    streakFreezes?: Prisma.IntFieldUpdateOperationsInput | number;
    lastActiveDate?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type StreakNullableScalarRelationFilter = {
    is?: Prisma.StreakWhereInput | null;
    isNot?: Prisma.StreakWhereInput | null;
};
export type StreakCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    currentStreak?: Prisma.SortOrder;
    longestStreak?: Prisma.SortOrder;
    streakFreezes?: Prisma.SortOrder;
    lastActiveDate?: Prisma.SortOrder;
};
export type StreakAvgOrderByAggregateInput = {
    currentStreak?: Prisma.SortOrder;
    longestStreak?: Prisma.SortOrder;
    streakFreezes?: Prisma.SortOrder;
};
export type StreakMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    currentStreak?: Prisma.SortOrder;
    longestStreak?: Prisma.SortOrder;
    streakFreezes?: Prisma.SortOrder;
    lastActiveDate?: Prisma.SortOrder;
};
export type StreakMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    currentStreak?: Prisma.SortOrder;
    longestStreak?: Prisma.SortOrder;
    streakFreezes?: Prisma.SortOrder;
    lastActiveDate?: Prisma.SortOrder;
};
export type StreakSumOrderByAggregateInput = {
    currentStreak?: Prisma.SortOrder;
    longestStreak?: Prisma.SortOrder;
    streakFreezes?: Prisma.SortOrder;
};
export type StreakCreateNestedOneWithoutUserInput = {
    create?: Prisma.XOR<Prisma.StreakCreateWithoutUserInput, Prisma.StreakUncheckedCreateWithoutUserInput>;
    connectOrCreate?: Prisma.StreakCreateOrConnectWithoutUserInput;
    connect?: Prisma.StreakWhereUniqueInput;
};
export type StreakUncheckedCreateNestedOneWithoutUserInput = {
    create?: Prisma.XOR<Prisma.StreakCreateWithoutUserInput, Prisma.StreakUncheckedCreateWithoutUserInput>;
    connectOrCreate?: Prisma.StreakCreateOrConnectWithoutUserInput;
    connect?: Prisma.StreakWhereUniqueInput;
};
export type StreakUpdateOneWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.StreakCreateWithoutUserInput, Prisma.StreakUncheckedCreateWithoutUserInput>;
    connectOrCreate?: Prisma.StreakCreateOrConnectWithoutUserInput;
    upsert?: Prisma.StreakUpsertWithoutUserInput;
    disconnect?: Prisma.StreakWhereInput | boolean;
    delete?: Prisma.StreakWhereInput | boolean;
    connect?: Prisma.StreakWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.StreakUpdateToOneWithWhereWithoutUserInput, Prisma.StreakUpdateWithoutUserInput>, Prisma.StreakUncheckedUpdateWithoutUserInput>;
};
export type StreakUncheckedUpdateOneWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.StreakCreateWithoutUserInput, Prisma.StreakUncheckedCreateWithoutUserInput>;
    connectOrCreate?: Prisma.StreakCreateOrConnectWithoutUserInput;
    upsert?: Prisma.StreakUpsertWithoutUserInput;
    disconnect?: Prisma.StreakWhereInput | boolean;
    delete?: Prisma.StreakWhereInput | boolean;
    connect?: Prisma.StreakWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.StreakUpdateToOneWithWhereWithoutUserInput, Prisma.StreakUpdateWithoutUserInput>, Prisma.StreakUncheckedUpdateWithoutUserInput>;
};
export type StreakCreateWithoutUserInput = {
    id?: string;
    currentStreak?: number;
    longestStreak?: number;
    streakFreezes?: number;
    lastActiveDate?: Date | string | null;
};
export type StreakUncheckedCreateWithoutUserInput = {
    id?: string;
    currentStreak?: number;
    longestStreak?: number;
    streakFreezes?: number;
    lastActiveDate?: Date | string | null;
};
export type StreakCreateOrConnectWithoutUserInput = {
    where: Prisma.StreakWhereUniqueInput;
    create: Prisma.XOR<Prisma.StreakCreateWithoutUserInput, Prisma.StreakUncheckedCreateWithoutUserInput>;
};
export type StreakUpsertWithoutUserInput = {
    update: Prisma.XOR<Prisma.StreakUpdateWithoutUserInput, Prisma.StreakUncheckedUpdateWithoutUserInput>;
    create: Prisma.XOR<Prisma.StreakCreateWithoutUserInput, Prisma.StreakUncheckedCreateWithoutUserInput>;
    where?: Prisma.StreakWhereInput;
};
export type StreakUpdateToOneWithWhereWithoutUserInput = {
    where?: Prisma.StreakWhereInput;
    data: Prisma.XOR<Prisma.StreakUpdateWithoutUserInput, Prisma.StreakUncheckedUpdateWithoutUserInput>;
};
export type StreakUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    currentStreak?: Prisma.IntFieldUpdateOperationsInput | number;
    longestStreak?: Prisma.IntFieldUpdateOperationsInput | number;
    streakFreezes?: Prisma.IntFieldUpdateOperationsInput | number;
    lastActiveDate?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type StreakUncheckedUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    currentStreak?: Prisma.IntFieldUpdateOperationsInput | number;
    longestStreak?: Prisma.IntFieldUpdateOperationsInput | number;
    streakFreezes?: Prisma.IntFieldUpdateOperationsInput | number;
    lastActiveDate?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type StreakSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    currentStreak?: boolean;
    longestStreak?: boolean;
    streakFreezes?: boolean;
    lastActiveDate?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["streak"]>;
export type StreakSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    currentStreak?: boolean;
    longestStreak?: boolean;
    streakFreezes?: boolean;
    lastActiveDate?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["streak"]>;
export type StreakSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    currentStreak?: boolean;
    longestStreak?: boolean;
    streakFreezes?: boolean;
    lastActiveDate?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["streak"]>;
export type StreakSelectScalar = {
    id?: boolean;
    userId?: boolean;
    currentStreak?: boolean;
    longestStreak?: boolean;
    streakFreezes?: boolean;
    lastActiveDate?: boolean;
};
export type StreakOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "userId" | "currentStreak" | "longestStreak" | "streakFreezes" | "lastActiveDate", ExtArgs["result"]["streak"]>;
export type StreakInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type StreakIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type StreakIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type $StreakPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Streak";
    objects: {
        user: Prisma.$UserPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        userId: string;
        currentStreak: number;
        longestStreak: number;
        streakFreezes: number;
        lastActiveDate: Date | null;
    }, ExtArgs["result"]["streak"]>;
    composites: {};
};
export type StreakGetPayload<S extends boolean | null | undefined | StreakDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$StreakPayload, S>;
export type StreakCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<StreakFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: StreakCountAggregateInputType | true;
};
export interface StreakDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Streak'];
        meta: {
            name: 'Streak';
        };
    };
    findUnique<T extends StreakFindUniqueArgs>(args: Prisma.SelectSubset<T, StreakFindUniqueArgs<ExtArgs>>): Prisma.Prisma__StreakClient<runtime.Types.Result.GetResult<Prisma.$StreakPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends StreakFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, StreakFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__StreakClient<runtime.Types.Result.GetResult<Prisma.$StreakPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends StreakFindFirstArgs>(args?: Prisma.SelectSubset<T, StreakFindFirstArgs<ExtArgs>>): Prisma.Prisma__StreakClient<runtime.Types.Result.GetResult<Prisma.$StreakPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends StreakFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, StreakFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__StreakClient<runtime.Types.Result.GetResult<Prisma.$StreakPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends StreakFindManyArgs>(args?: Prisma.SelectSubset<T, StreakFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$StreakPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends StreakCreateArgs>(args: Prisma.SelectSubset<T, StreakCreateArgs<ExtArgs>>): Prisma.Prisma__StreakClient<runtime.Types.Result.GetResult<Prisma.$StreakPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends StreakCreateManyArgs>(args?: Prisma.SelectSubset<T, StreakCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends StreakCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, StreakCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$StreakPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends StreakDeleteArgs>(args: Prisma.SelectSubset<T, StreakDeleteArgs<ExtArgs>>): Prisma.Prisma__StreakClient<runtime.Types.Result.GetResult<Prisma.$StreakPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends StreakUpdateArgs>(args: Prisma.SelectSubset<T, StreakUpdateArgs<ExtArgs>>): Prisma.Prisma__StreakClient<runtime.Types.Result.GetResult<Prisma.$StreakPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends StreakDeleteManyArgs>(args?: Prisma.SelectSubset<T, StreakDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends StreakUpdateManyArgs>(args: Prisma.SelectSubset<T, StreakUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends StreakUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, StreakUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$StreakPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends StreakUpsertArgs>(args: Prisma.SelectSubset<T, StreakUpsertArgs<ExtArgs>>): Prisma.Prisma__StreakClient<runtime.Types.Result.GetResult<Prisma.$StreakPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends StreakCountArgs>(args?: Prisma.Subset<T, StreakCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], StreakCountAggregateOutputType> : number>;
    aggregate<T extends StreakAggregateArgs>(args: Prisma.Subset<T, StreakAggregateArgs>): Prisma.PrismaPromise<GetStreakAggregateType<T>>;
    groupBy<T extends StreakGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: StreakGroupByArgs['orderBy'];
    } : {
        orderBy?: StreakGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, StreakGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetStreakGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: StreakFieldRefs;
}
export interface Prisma__StreakClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    user<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface StreakFieldRefs {
    readonly id: Prisma.FieldRef<"Streak", 'String'>;
    readonly userId: Prisma.FieldRef<"Streak", 'String'>;
    readonly currentStreak: Prisma.FieldRef<"Streak", 'Int'>;
    readonly longestStreak: Prisma.FieldRef<"Streak", 'Int'>;
    readonly streakFreezes: Prisma.FieldRef<"Streak", 'Int'>;
    readonly lastActiveDate: Prisma.FieldRef<"Streak", 'DateTime'>;
}
export type StreakFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StreakSelect<ExtArgs> | null;
    omit?: Prisma.StreakOmit<ExtArgs> | null;
    include?: Prisma.StreakInclude<ExtArgs> | null;
    where: Prisma.StreakWhereUniqueInput;
};
export type StreakFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StreakSelect<ExtArgs> | null;
    omit?: Prisma.StreakOmit<ExtArgs> | null;
    include?: Prisma.StreakInclude<ExtArgs> | null;
    where: Prisma.StreakWhereUniqueInput;
};
export type StreakFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StreakSelect<ExtArgs> | null;
    omit?: Prisma.StreakOmit<ExtArgs> | null;
    include?: Prisma.StreakInclude<ExtArgs> | null;
    where?: Prisma.StreakWhereInput;
    orderBy?: Prisma.StreakOrderByWithRelationInput | Prisma.StreakOrderByWithRelationInput[];
    cursor?: Prisma.StreakWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.StreakScalarFieldEnum | Prisma.StreakScalarFieldEnum[];
};
export type StreakFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StreakSelect<ExtArgs> | null;
    omit?: Prisma.StreakOmit<ExtArgs> | null;
    include?: Prisma.StreakInclude<ExtArgs> | null;
    where?: Prisma.StreakWhereInput;
    orderBy?: Prisma.StreakOrderByWithRelationInput | Prisma.StreakOrderByWithRelationInput[];
    cursor?: Prisma.StreakWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.StreakScalarFieldEnum | Prisma.StreakScalarFieldEnum[];
};
export type StreakFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StreakSelect<ExtArgs> | null;
    omit?: Prisma.StreakOmit<ExtArgs> | null;
    include?: Prisma.StreakInclude<ExtArgs> | null;
    where?: Prisma.StreakWhereInput;
    orderBy?: Prisma.StreakOrderByWithRelationInput | Prisma.StreakOrderByWithRelationInput[];
    cursor?: Prisma.StreakWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.StreakScalarFieldEnum | Prisma.StreakScalarFieldEnum[];
};
export type StreakCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StreakSelect<ExtArgs> | null;
    omit?: Prisma.StreakOmit<ExtArgs> | null;
    include?: Prisma.StreakInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.StreakCreateInput, Prisma.StreakUncheckedCreateInput>;
};
export type StreakCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.StreakCreateManyInput | Prisma.StreakCreateManyInput[];
    skipDuplicates?: boolean;
};
export type StreakCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StreakSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.StreakOmit<ExtArgs> | null;
    data: Prisma.StreakCreateManyInput | Prisma.StreakCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.StreakIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type StreakUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StreakSelect<ExtArgs> | null;
    omit?: Prisma.StreakOmit<ExtArgs> | null;
    include?: Prisma.StreakInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.StreakUpdateInput, Prisma.StreakUncheckedUpdateInput>;
    where: Prisma.StreakWhereUniqueInput;
};
export type StreakUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.StreakUpdateManyMutationInput, Prisma.StreakUncheckedUpdateManyInput>;
    where?: Prisma.StreakWhereInput;
    limit?: number;
};
export type StreakUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StreakSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.StreakOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.StreakUpdateManyMutationInput, Prisma.StreakUncheckedUpdateManyInput>;
    where?: Prisma.StreakWhereInput;
    limit?: number;
    include?: Prisma.StreakIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type StreakUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StreakSelect<ExtArgs> | null;
    omit?: Prisma.StreakOmit<ExtArgs> | null;
    include?: Prisma.StreakInclude<ExtArgs> | null;
    where: Prisma.StreakWhereUniqueInput;
    create: Prisma.XOR<Prisma.StreakCreateInput, Prisma.StreakUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.StreakUpdateInput, Prisma.StreakUncheckedUpdateInput>;
};
export type StreakDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StreakSelect<ExtArgs> | null;
    omit?: Prisma.StreakOmit<ExtArgs> | null;
    include?: Prisma.StreakInclude<ExtArgs> | null;
    where: Prisma.StreakWhereUniqueInput;
};
export type StreakDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.StreakWhereInput;
    limit?: number;
};
export type StreakDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StreakSelect<ExtArgs> | null;
    omit?: Prisma.StreakOmit<ExtArgs> | null;
    include?: Prisma.StreakInclude<ExtArgs> | null;
};
