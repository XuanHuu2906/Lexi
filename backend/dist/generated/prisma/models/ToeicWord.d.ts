import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace";
export type ToeicWordModel = runtime.Types.Result.DefaultSelection<Prisma.$ToeicWordPayload>;
export type AggregateToeicWord = {
    _count: ToeicWordCountAggregateOutputType | null;
    _min: ToeicWordMinAggregateOutputType | null;
    _max: ToeicWordMaxAggregateOutputType | null;
};
export type ToeicWordMinAggregateOutputType = {
    id: string | null;
    term: string | null;
    display: string | null;
    pos: string | null;
    ipa: string | null;
    meaning: string | null;
    group: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type ToeicWordMaxAggregateOutputType = {
    id: string | null;
    term: string | null;
    display: string | null;
    pos: string | null;
    ipa: string | null;
    meaning: string | null;
    group: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type ToeicWordCountAggregateOutputType = {
    id: number;
    term: number;
    display: number;
    pos: number;
    ipa: number;
    meaning: number;
    group: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type ToeicWordMinAggregateInputType = {
    id?: true;
    term?: true;
    display?: true;
    pos?: true;
    ipa?: true;
    meaning?: true;
    group?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type ToeicWordMaxAggregateInputType = {
    id?: true;
    term?: true;
    display?: true;
    pos?: true;
    ipa?: true;
    meaning?: true;
    group?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type ToeicWordCountAggregateInputType = {
    id?: true;
    term?: true;
    display?: true;
    pos?: true;
    ipa?: true;
    meaning?: true;
    group?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type ToeicWordAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ToeicWordWhereInput;
    orderBy?: Prisma.ToeicWordOrderByWithRelationInput | Prisma.ToeicWordOrderByWithRelationInput[];
    cursor?: Prisma.ToeicWordWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ToeicWordCountAggregateInputType;
    _min?: ToeicWordMinAggregateInputType;
    _max?: ToeicWordMaxAggregateInputType;
};
export type GetToeicWordAggregateType<T extends ToeicWordAggregateArgs> = {
    [P in keyof T & keyof AggregateToeicWord]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateToeicWord[P]> : Prisma.GetScalarType<T[P], AggregateToeicWord[P]>;
};
export type ToeicWordGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ToeicWordWhereInput;
    orderBy?: Prisma.ToeicWordOrderByWithAggregationInput | Prisma.ToeicWordOrderByWithAggregationInput[];
    by: Prisma.ToeicWordScalarFieldEnum[] | Prisma.ToeicWordScalarFieldEnum;
    having?: Prisma.ToeicWordScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ToeicWordCountAggregateInputType | true;
    _min?: ToeicWordMinAggregateInputType;
    _max?: ToeicWordMaxAggregateInputType;
};
export type ToeicWordGroupByOutputType = {
    id: string;
    term: string;
    display: string | null;
    pos: string | null;
    ipa: string | null;
    meaning: string | null;
    group: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: ToeicWordCountAggregateOutputType | null;
    _min: ToeicWordMinAggregateOutputType | null;
    _max: ToeicWordMaxAggregateOutputType | null;
};
export type GetToeicWordGroupByPayload<T extends ToeicWordGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ToeicWordGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ToeicWordGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ToeicWordGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ToeicWordGroupByOutputType[P]>;
}>>;
export type ToeicWordWhereInput = {
    AND?: Prisma.ToeicWordWhereInput | Prisma.ToeicWordWhereInput[];
    OR?: Prisma.ToeicWordWhereInput[];
    NOT?: Prisma.ToeicWordWhereInput | Prisma.ToeicWordWhereInput[];
    id?: Prisma.StringFilter<"ToeicWord"> | string;
    term?: Prisma.StringFilter<"ToeicWord"> | string;
    display?: Prisma.StringNullableFilter<"ToeicWord"> | string | null;
    pos?: Prisma.StringNullableFilter<"ToeicWord"> | string | null;
    ipa?: Prisma.StringNullableFilter<"ToeicWord"> | string | null;
    meaning?: Prisma.StringNullableFilter<"ToeicWord"> | string | null;
    group?: Prisma.StringNullableFilter<"ToeicWord"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"ToeicWord"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"ToeicWord"> | Date | string;
};
export type ToeicWordOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    term?: Prisma.SortOrder;
    display?: Prisma.SortOrderInput | Prisma.SortOrder;
    pos?: Prisma.SortOrderInput | Prisma.SortOrder;
    ipa?: Prisma.SortOrderInput | Prisma.SortOrder;
    meaning?: Prisma.SortOrderInput | Prisma.SortOrder;
    group?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ToeicWordWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    term?: string;
    AND?: Prisma.ToeicWordWhereInput | Prisma.ToeicWordWhereInput[];
    OR?: Prisma.ToeicWordWhereInput[];
    NOT?: Prisma.ToeicWordWhereInput | Prisma.ToeicWordWhereInput[];
    display?: Prisma.StringNullableFilter<"ToeicWord"> | string | null;
    pos?: Prisma.StringNullableFilter<"ToeicWord"> | string | null;
    ipa?: Prisma.StringNullableFilter<"ToeicWord"> | string | null;
    meaning?: Prisma.StringNullableFilter<"ToeicWord"> | string | null;
    group?: Prisma.StringNullableFilter<"ToeicWord"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"ToeicWord"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"ToeicWord"> | Date | string;
}, "id" | "term">;
export type ToeicWordOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    term?: Prisma.SortOrder;
    display?: Prisma.SortOrderInput | Prisma.SortOrder;
    pos?: Prisma.SortOrderInput | Prisma.SortOrder;
    ipa?: Prisma.SortOrderInput | Prisma.SortOrder;
    meaning?: Prisma.SortOrderInput | Prisma.SortOrder;
    group?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.ToeicWordCountOrderByAggregateInput;
    _max?: Prisma.ToeicWordMaxOrderByAggregateInput;
    _min?: Prisma.ToeicWordMinOrderByAggregateInput;
};
export type ToeicWordScalarWhereWithAggregatesInput = {
    AND?: Prisma.ToeicWordScalarWhereWithAggregatesInput | Prisma.ToeicWordScalarWhereWithAggregatesInput[];
    OR?: Prisma.ToeicWordScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ToeicWordScalarWhereWithAggregatesInput | Prisma.ToeicWordScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"ToeicWord"> | string;
    term?: Prisma.StringWithAggregatesFilter<"ToeicWord"> | string;
    display?: Prisma.StringNullableWithAggregatesFilter<"ToeicWord"> | string | null;
    pos?: Prisma.StringNullableWithAggregatesFilter<"ToeicWord"> | string | null;
    ipa?: Prisma.StringNullableWithAggregatesFilter<"ToeicWord"> | string | null;
    meaning?: Prisma.StringNullableWithAggregatesFilter<"ToeicWord"> | string | null;
    group?: Prisma.StringNullableWithAggregatesFilter<"ToeicWord"> | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"ToeicWord"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"ToeicWord"> | Date | string;
};
export type ToeicWordCreateInput = {
    id?: string;
    term: string;
    display?: string | null;
    pos?: string | null;
    ipa?: string | null;
    meaning?: string | null;
    group?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ToeicWordUncheckedCreateInput = {
    id?: string;
    term: string;
    display?: string | null;
    pos?: string | null;
    ipa?: string | null;
    meaning?: string | null;
    group?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ToeicWordUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    term?: Prisma.StringFieldUpdateOperationsInput | string;
    display?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    pos?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    ipa?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    meaning?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    group?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ToeicWordUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    term?: Prisma.StringFieldUpdateOperationsInput | string;
    display?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    pos?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    ipa?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    meaning?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    group?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ToeicWordCreateManyInput = {
    id?: string;
    term: string;
    display?: string | null;
    pos?: string | null;
    ipa?: string | null;
    meaning?: string | null;
    group?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ToeicWordUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    term?: Prisma.StringFieldUpdateOperationsInput | string;
    display?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    pos?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    ipa?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    meaning?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    group?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ToeicWordUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    term?: Prisma.StringFieldUpdateOperationsInput | string;
    display?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    pos?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    ipa?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    meaning?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    group?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ToeicWordCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    term?: Prisma.SortOrder;
    display?: Prisma.SortOrder;
    pos?: Prisma.SortOrder;
    ipa?: Prisma.SortOrder;
    meaning?: Prisma.SortOrder;
    group?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ToeicWordMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    term?: Prisma.SortOrder;
    display?: Prisma.SortOrder;
    pos?: Prisma.SortOrder;
    ipa?: Prisma.SortOrder;
    meaning?: Prisma.SortOrder;
    group?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ToeicWordMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    term?: Prisma.SortOrder;
    display?: Prisma.SortOrder;
    pos?: Prisma.SortOrder;
    ipa?: Prisma.SortOrder;
    meaning?: Prisma.SortOrder;
    group?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ToeicWordSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    term?: boolean;
    display?: boolean;
    pos?: boolean;
    ipa?: boolean;
    meaning?: boolean;
    group?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["toeicWord"]>;
export type ToeicWordSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    term?: boolean;
    display?: boolean;
    pos?: boolean;
    ipa?: boolean;
    meaning?: boolean;
    group?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["toeicWord"]>;
export type ToeicWordSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    term?: boolean;
    display?: boolean;
    pos?: boolean;
    ipa?: boolean;
    meaning?: boolean;
    group?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["toeicWord"]>;
export type ToeicWordSelectScalar = {
    id?: boolean;
    term?: boolean;
    display?: boolean;
    pos?: boolean;
    ipa?: boolean;
    meaning?: boolean;
    group?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type ToeicWordOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "term" | "display" | "pos" | "ipa" | "meaning" | "group" | "createdAt" | "updatedAt", ExtArgs["result"]["toeicWord"]>;
export type $ToeicWordPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ToeicWord";
    objects: {};
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        term: string;
        display: string | null;
        pos: string | null;
        ipa: string | null;
        meaning: string | null;
        group: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["toeicWord"]>;
    composites: {};
};
export type ToeicWordGetPayload<S extends boolean | null | undefined | ToeicWordDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ToeicWordPayload, S>;
export type ToeicWordCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ToeicWordFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ToeicWordCountAggregateInputType | true;
};
export interface ToeicWordDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ToeicWord'];
        meta: {
            name: 'ToeicWord';
        };
    };
    findUnique<T extends ToeicWordFindUniqueArgs>(args: Prisma.SelectSubset<T, ToeicWordFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ToeicWordClient<runtime.Types.Result.GetResult<Prisma.$ToeicWordPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ToeicWordFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ToeicWordFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ToeicWordClient<runtime.Types.Result.GetResult<Prisma.$ToeicWordPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ToeicWordFindFirstArgs>(args?: Prisma.SelectSubset<T, ToeicWordFindFirstArgs<ExtArgs>>): Prisma.Prisma__ToeicWordClient<runtime.Types.Result.GetResult<Prisma.$ToeicWordPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ToeicWordFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ToeicWordFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ToeicWordClient<runtime.Types.Result.GetResult<Prisma.$ToeicWordPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ToeicWordFindManyArgs>(args?: Prisma.SelectSubset<T, ToeicWordFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ToeicWordPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ToeicWordCreateArgs>(args: Prisma.SelectSubset<T, ToeicWordCreateArgs<ExtArgs>>): Prisma.Prisma__ToeicWordClient<runtime.Types.Result.GetResult<Prisma.$ToeicWordPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ToeicWordCreateManyArgs>(args?: Prisma.SelectSubset<T, ToeicWordCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ToeicWordCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ToeicWordCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ToeicWordPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ToeicWordDeleteArgs>(args: Prisma.SelectSubset<T, ToeicWordDeleteArgs<ExtArgs>>): Prisma.Prisma__ToeicWordClient<runtime.Types.Result.GetResult<Prisma.$ToeicWordPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ToeicWordUpdateArgs>(args: Prisma.SelectSubset<T, ToeicWordUpdateArgs<ExtArgs>>): Prisma.Prisma__ToeicWordClient<runtime.Types.Result.GetResult<Prisma.$ToeicWordPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ToeicWordDeleteManyArgs>(args?: Prisma.SelectSubset<T, ToeicWordDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ToeicWordUpdateManyArgs>(args: Prisma.SelectSubset<T, ToeicWordUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ToeicWordUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ToeicWordUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ToeicWordPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ToeicWordUpsertArgs>(args: Prisma.SelectSubset<T, ToeicWordUpsertArgs<ExtArgs>>): Prisma.Prisma__ToeicWordClient<runtime.Types.Result.GetResult<Prisma.$ToeicWordPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ToeicWordCountArgs>(args?: Prisma.Subset<T, ToeicWordCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ToeicWordCountAggregateOutputType> : number>;
    aggregate<T extends ToeicWordAggregateArgs>(args: Prisma.Subset<T, ToeicWordAggregateArgs>): Prisma.PrismaPromise<GetToeicWordAggregateType<T>>;
    groupBy<T extends ToeicWordGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ToeicWordGroupByArgs['orderBy'];
    } : {
        orderBy?: ToeicWordGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ToeicWordGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetToeicWordGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ToeicWordFieldRefs;
}
export interface Prisma__ToeicWordClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ToeicWordFieldRefs {
    readonly id: Prisma.FieldRef<"ToeicWord", 'String'>;
    readonly term: Prisma.FieldRef<"ToeicWord", 'String'>;
    readonly display: Prisma.FieldRef<"ToeicWord", 'String'>;
    readonly pos: Prisma.FieldRef<"ToeicWord", 'String'>;
    readonly ipa: Prisma.FieldRef<"ToeicWord", 'String'>;
    readonly meaning: Prisma.FieldRef<"ToeicWord", 'String'>;
    readonly group: Prisma.FieldRef<"ToeicWord", 'String'>;
    readonly createdAt: Prisma.FieldRef<"ToeicWord", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"ToeicWord", 'DateTime'>;
}
export type ToeicWordFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ToeicWordSelect<ExtArgs> | null;
    omit?: Prisma.ToeicWordOmit<ExtArgs> | null;
    where: Prisma.ToeicWordWhereUniqueInput;
};
export type ToeicWordFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ToeicWordSelect<ExtArgs> | null;
    omit?: Prisma.ToeicWordOmit<ExtArgs> | null;
    where: Prisma.ToeicWordWhereUniqueInput;
};
export type ToeicWordFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ToeicWordSelect<ExtArgs> | null;
    omit?: Prisma.ToeicWordOmit<ExtArgs> | null;
    where?: Prisma.ToeicWordWhereInput;
    orderBy?: Prisma.ToeicWordOrderByWithRelationInput | Prisma.ToeicWordOrderByWithRelationInput[];
    cursor?: Prisma.ToeicWordWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ToeicWordScalarFieldEnum | Prisma.ToeicWordScalarFieldEnum[];
};
export type ToeicWordFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ToeicWordSelect<ExtArgs> | null;
    omit?: Prisma.ToeicWordOmit<ExtArgs> | null;
    where?: Prisma.ToeicWordWhereInput;
    orderBy?: Prisma.ToeicWordOrderByWithRelationInput | Prisma.ToeicWordOrderByWithRelationInput[];
    cursor?: Prisma.ToeicWordWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ToeicWordScalarFieldEnum | Prisma.ToeicWordScalarFieldEnum[];
};
export type ToeicWordFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ToeicWordSelect<ExtArgs> | null;
    omit?: Prisma.ToeicWordOmit<ExtArgs> | null;
    where?: Prisma.ToeicWordWhereInput;
    orderBy?: Prisma.ToeicWordOrderByWithRelationInput | Prisma.ToeicWordOrderByWithRelationInput[];
    cursor?: Prisma.ToeicWordWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ToeicWordScalarFieldEnum | Prisma.ToeicWordScalarFieldEnum[];
};
export type ToeicWordCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ToeicWordSelect<ExtArgs> | null;
    omit?: Prisma.ToeicWordOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ToeicWordCreateInput, Prisma.ToeicWordUncheckedCreateInput>;
};
export type ToeicWordCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ToeicWordCreateManyInput | Prisma.ToeicWordCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ToeicWordCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ToeicWordSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ToeicWordOmit<ExtArgs> | null;
    data: Prisma.ToeicWordCreateManyInput | Prisma.ToeicWordCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ToeicWordUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ToeicWordSelect<ExtArgs> | null;
    omit?: Prisma.ToeicWordOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ToeicWordUpdateInput, Prisma.ToeicWordUncheckedUpdateInput>;
    where: Prisma.ToeicWordWhereUniqueInput;
};
export type ToeicWordUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ToeicWordUpdateManyMutationInput, Prisma.ToeicWordUncheckedUpdateManyInput>;
    where?: Prisma.ToeicWordWhereInput;
    limit?: number;
};
export type ToeicWordUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ToeicWordSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ToeicWordOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ToeicWordUpdateManyMutationInput, Prisma.ToeicWordUncheckedUpdateManyInput>;
    where?: Prisma.ToeicWordWhereInput;
    limit?: number;
};
export type ToeicWordUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ToeicWordSelect<ExtArgs> | null;
    omit?: Prisma.ToeicWordOmit<ExtArgs> | null;
    where: Prisma.ToeicWordWhereUniqueInput;
    create: Prisma.XOR<Prisma.ToeicWordCreateInput, Prisma.ToeicWordUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ToeicWordUpdateInput, Prisma.ToeicWordUncheckedUpdateInput>;
};
export type ToeicWordDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ToeicWordSelect<ExtArgs> | null;
    omit?: Prisma.ToeicWordOmit<ExtArgs> | null;
    where: Prisma.ToeicWordWhereUniqueInput;
};
export type ToeicWordDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ToeicWordWhereInput;
    limit?: number;
};
export type ToeicWordDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ToeicWordSelect<ExtArgs> | null;
    omit?: Prisma.ToeicWordOmit<ExtArgs> | null;
};
