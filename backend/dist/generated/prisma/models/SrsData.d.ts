import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace";
export type SrsDataModel = runtime.Types.Result.DefaultSelection<Prisma.$SrsDataPayload>;
export type AggregateSrsData = {
    _count: SrsDataCountAggregateOutputType | null;
    _avg: SrsDataAvgAggregateOutputType | null;
    _sum: SrsDataSumAggregateOutputType | null;
    _min: SrsDataMinAggregateOutputType | null;
    _max: SrsDataMaxAggregateOutputType | null;
};
export type SrsDataAvgAggregateOutputType = {
    interval: number | null;
    easeFactor: number | null;
    repetitions: number | null;
    lastQuality: number | null;
};
export type SrsDataSumAggregateOutputType = {
    interval: number | null;
    easeFactor: number | null;
    repetitions: number | null;
    lastQuality: number | null;
};
export type SrsDataMinAggregateOutputType = {
    id: string | null;
    wordId: string | null;
    interval: number | null;
    easeFactor: number | null;
    repetitions: number | null;
    lastQuality: number | null;
    lastReviewedAt: Date | null;
    nextReviewAt: Date | null;
};
export type SrsDataMaxAggregateOutputType = {
    id: string | null;
    wordId: string | null;
    interval: number | null;
    easeFactor: number | null;
    repetitions: number | null;
    lastQuality: number | null;
    lastReviewedAt: Date | null;
    nextReviewAt: Date | null;
};
export type SrsDataCountAggregateOutputType = {
    id: number;
    wordId: number;
    interval: number;
    easeFactor: number;
    repetitions: number;
    lastQuality: number;
    lastReviewedAt: number;
    nextReviewAt: number;
    _all: number;
};
export type SrsDataAvgAggregateInputType = {
    interval?: true;
    easeFactor?: true;
    repetitions?: true;
    lastQuality?: true;
};
export type SrsDataSumAggregateInputType = {
    interval?: true;
    easeFactor?: true;
    repetitions?: true;
    lastQuality?: true;
};
export type SrsDataMinAggregateInputType = {
    id?: true;
    wordId?: true;
    interval?: true;
    easeFactor?: true;
    repetitions?: true;
    lastQuality?: true;
    lastReviewedAt?: true;
    nextReviewAt?: true;
};
export type SrsDataMaxAggregateInputType = {
    id?: true;
    wordId?: true;
    interval?: true;
    easeFactor?: true;
    repetitions?: true;
    lastQuality?: true;
    lastReviewedAt?: true;
    nextReviewAt?: true;
};
export type SrsDataCountAggregateInputType = {
    id?: true;
    wordId?: true;
    interval?: true;
    easeFactor?: true;
    repetitions?: true;
    lastQuality?: true;
    lastReviewedAt?: true;
    nextReviewAt?: true;
    _all?: true;
};
export type SrsDataAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SrsDataWhereInput;
    orderBy?: Prisma.SrsDataOrderByWithRelationInput | Prisma.SrsDataOrderByWithRelationInput[];
    cursor?: Prisma.SrsDataWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | SrsDataCountAggregateInputType;
    _avg?: SrsDataAvgAggregateInputType;
    _sum?: SrsDataSumAggregateInputType;
    _min?: SrsDataMinAggregateInputType;
    _max?: SrsDataMaxAggregateInputType;
};
export type GetSrsDataAggregateType<T extends SrsDataAggregateArgs> = {
    [P in keyof T & keyof AggregateSrsData]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateSrsData[P]> : Prisma.GetScalarType<T[P], AggregateSrsData[P]>;
};
export type SrsDataGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SrsDataWhereInput;
    orderBy?: Prisma.SrsDataOrderByWithAggregationInput | Prisma.SrsDataOrderByWithAggregationInput[];
    by: Prisma.SrsDataScalarFieldEnum[] | Prisma.SrsDataScalarFieldEnum;
    having?: Prisma.SrsDataScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: SrsDataCountAggregateInputType | true;
    _avg?: SrsDataAvgAggregateInputType;
    _sum?: SrsDataSumAggregateInputType;
    _min?: SrsDataMinAggregateInputType;
    _max?: SrsDataMaxAggregateInputType;
};
export type SrsDataGroupByOutputType = {
    id: string;
    wordId: string;
    interval: number;
    easeFactor: number;
    repetitions: number;
    lastQuality: number | null;
    lastReviewedAt: Date | null;
    nextReviewAt: Date;
    _count: SrsDataCountAggregateOutputType | null;
    _avg: SrsDataAvgAggregateOutputType | null;
    _sum: SrsDataSumAggregateOutputType | null;
    _min: SrsDataMinAggregateOutputType | null;
    _max: SrsDataMaxAggregateOutputType | null;
};
export type GetSrsDataGroupByPayload<T extends SrsDataGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<SrsDataGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof SrsDataGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], SrsDataGroupByOutputType[P]> : Prisma.GetScalarType<T[P], SrsDataGroupByOutputType[P]>;
}>>;
export type SrsDataWhereInput = {
    AND?: Prisma.SrsDataWhereInput | Prisma.SrsDataWhereInput[];
    OR?: Prisma.SrsDataWhereInput[];
    NOT?: Prisma.SrsDataWhereInput | Prisma.SrsDataWhereInput[];
    id?: Prisma.StringFilter<"SrsData"> | string;
    wordId?: Prisma.StringFilter<"SrsData"> | string;
    interval?: Prisma.IntFilter<"SrsData"> | number;
    easeFactor?: Prisma.FloatFilter<"SrsData"> | number;
    repetitions?: Prisma.IntFilter<"SrsData"> | number;
    lastQuality?: Prisma.IntNullableFilter<"SrsData"> | number | null;
    lastReviewedAt?: Prisma.DateTimeNullableFilter<"SrsData"> | Date | string | null;
    nextReviewAt?: Prisma.DateTimeFilter<"SrsData"> | Date | string;
    word?: Prisma.XOR<Prisma.WordScalarRelationFilter, Prisma.WordWhereInput>;
};
export type SrsDataOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    wordId?: Prisma.SortOrder;
    interval?: Prisma.SortOrder;
    easeFactor?: Prisma.SortOrder;
    repetitions?: Prisma.SortOrder;
    lastQuality?: Prisma.SortOrderInput | Prisma.SortOrder;
    lastReviewedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    nextReviewAt?: Prisma.SortOrder;
    word?: Prisma.WordOrderByWithRelationInput;
};
export type SrsDataWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    wordId?: string;
    AND?: Prisma.SrsDataWhereInput | Prisma.SrsDataWhereInput[];
    OR?: Prisma.SrsDataWhereInput[];
    NOT?: Prisma.SrsDataWhereInput | Prisma.SrsDataWhereInput[];
    interval?: Prisma.IntFilter<"SrsData"> | number;
    easeFactor?: Prisma.FloatFilter<"SrsData"> | number;
    repetitions?: Prisma.IntFilter<"SrsData"> | number;
    lastQuality?: Prisma.IntNullableFilter<"SrsData"> | number | null;
    lastReviewedAt?: Prisma.DateTimeNullableFilter<"SrsData"> | Date | string | null;
    nextReviewAt?: Prisma.DateTimeFilter<"SrsData"> | Date | string;
    word?: Prisma.XOR<Prisma.WordScalarRelationFilter, Prisma.WordWhereInput>;
}, "id" | "wordId">;
export type SrsDataOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    wordId?: Prisma.SortOrder;
    interval?: Prisma.SortOrder;
    easeFactor?: Prisma.SortOrder;
    repetitions?: Prisma.SortOrder;
    lastQuality?: Prisma.SortOrderInput | Prisma.SortOrder;
    lastReviewedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    nextReviewAt?: Prisma.SortOrder;
    _count?: Prisma.SrsDataCountOrderByAggregateInput;
    _avg?: Prisma.SrsDataAvgOrderByAggregateInput;
    _max?: Prisma.SrsDataMaxOrderByAggregateInput;
    _min?: Prisma.SrsDataMinOrderByAggregateInput;
    _sum?: Prisma.SrsDataSumOrderByAggregateInput;
};
export type SrsDataScalarWhereWithAggregatesInput = {
    AND?: Prisma.SrsDataScalarWhereWithAggregatesInput | Prisma.SrsDataScalarWhereWithAggregatesInput[];
    OR?: Prisma.SrsDataScalarWhereWithAggregatesInput[];
    NOT?: Prisma.SrsDataScalarWhereWithAggregatesInput | Prisma.SrsDataScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"SrsData"> | string;
    wordId?: Prisma.StringWithAggregatesFilter<"SrsData"> | string;
    interval?: Prisma.IntWithAggregatesFilter<"SrsData"> | number;
    easeFactor?: Prisma.FloatWithAggregatesFilter<"SrsData"> | number;
    repetitions?: Prisma.IntWithAggregatesFilter<"SrsData"> | number;
    lastQuality?: Prisma.IntNullableWithAggregatesFilter<"SrsData"> | number | null;
    lastReviewedAt?: Prisma.DateTimeNullableWithAggregatesFilter<"SrsData"> | Date | string | null;
    nextReviewAt?: Prisma.DateTimeWithAggregatesFilter<"SrsData"> | Date | string;
};
export type SrsDataCreateInput = {
    id?: string;
    interval?: number;
    easeFactor?: number;
    repetitions?: number;
    lastQuality?: number | null;
    lastReviewedAt?: Date | string | null;
    nextReviewAt?: Date | string;
    word: Prisma.WordCreateNestedOneWithoutSrsDataInput;
};
export type SrsDataUncheckedCreateInput = {
    id?: string;
    wordId: string;
    interval?: number;
    easeFactor?: number;
    repetitions?: number;
    lastQuality?: number | null;
    lastReviewedAt?: Date | string | null;
    nextReviewAt?: Date | string;
};
export type SrsDataUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    interval?: Prisma.IntFieldUpdateOperationsInput | number;
    easeFactor?: Prisma.FloatFieldUpdateOperationsInput | number;
    repetitions?: Prisma.IntFieldUpdateOperationsInput | number;
    lastQuality?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    lastReviewedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    nextReviewAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    word?: Prisma.WordUpdateOneRequiredWithoutSrsDataNestedInput;
};
export type SrsDataUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    wordId?: Prisma.StringFieldUpdateOperationsInput | string;
    interval?: Prisma.IntFieldUpdateOperationsInput | number;
    easeFactor?: Prisma.FloatFieldUpdateOperationsInput | number;
    repetitions?: Prisma.IntFieldUpdateOperationsInput | number;
    lastQuality?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    lastReviewedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    nextReviewAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SrsDataCreateManyInput = {
    id?: string;
    wordId: string;
    interval?: number;
    easeFactor?: number;
    repetitions?: number;
    lastQuality?: number | null;
    lastReviewedAt?: Date | string | null;
    nextReviewAt?: Date | string;
};
export type SrsDataUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    interval?: Prisma.IntFieldUpdateOperationsInput | number;
    easeFactor?: Prisma.FloatFieldUpdateOperationsInput | number;
    repetitions?: Prisma.IntFieldUpdateOperationsInput | number;
    lastQuality?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    lastReviewedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    nextReviewAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SrsDataUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    wordId?: Prisma.StringFieldUpdateOperationsInput | string;
    interval?: Prisma.IntFieldUpdateOperationsInput | number;
    easeFactor?: Prisma.FloatFieldUpdateOperationsInput | number;
    repetitions?: Prisma.IntFieldUpdateOperationsInput | number;
    lastQuality?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    lastReviewedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    nextReviewAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SrsDataNullableScalarRelationFilter = {
    is?: Prisma.SrsDataWhereInput | null;
    isNot?: Prisma.SrsDataWhereInput | null;
};
export type SrsDataCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    wordId?: Prisma.SortOrder;
    interval?: Prisma.SortOrder;
    easeFactor?: Prisma.SortOrder;
    repetitions?: Prisma.SortOrder;
    lastQuality?: Prisma.SortOrder;
    lastReviewedAt?: Prisma.SortOrder;
    nextReviewAt?: Prisma.SortOrder;
};
export type SrsDataAvgOrderByAggregateInput = {
    interval?: Prisma.SortOrder;
    easeFactor?: Prisma.SortOrder;
    repetitions?: Prisma.SortOrder;
    lastQuality?: Prisma.SortOrder;
};
export type SrsDataMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    wordId?: Prisma.SortOrder;
    interval?: Prisma.SortOrder;
    easeFactor?: Prisma.SortOrder;
    repetitions?: Prisma.SortOrder;
    lastQuality?: Prisma.SortOrder;
    lastReviewedAt?: Prisma.SortOrder;
    nextReviewAt?: Prisma.SortOrder;
};
export type SrsDataMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    wordId?: Prisma.SortOrder;
    interval?: Prisma.SortOrder;
    easeFactor?: Prisma.SortOrder;
    repetitions?: Prisma.SortOrder;
    lastQuality?: Prisma.SortOrder;
    lastReviewedAt?: Prisma.SortOrder;
    nextReviewAt?: Prisma.SortOrder;
};
export type SrsDataSumOrderByAggregateInput = {
    interval?: Prisma.SortOrder;
    easeFactor?: Prisma.SortOrder;
    repetitions?: Prisma.SortOrder;
    lastQuality?: Prisma.SortOrder;
};
export type SrsDataCreateNestedOneWithoutWordInput = {
    create?: Prisma.XOR<Prisma.SrsDataCreateWithoutWordInput, Prisma.SrsDataUncheckedCreateWithoutWordInput>;
    connectOrCreate?: Prisma.SrsDataCreateOrConnectWithoutWordInput;
    connect?: Prisma.SrsDataWhereUniqueInput;
};
export type SrsDataUncheckedCreateNestedOneWithoutWordInput = {
    create?: Prisma.XOR<Prisma.SrsDataCreateWithoutWordInput, Prisma.SrsDataUncheckedCreateWithoutWordInput>;
    connectOrCreate?: Prisma.SrsDataCreateOrConnectWithoutWordInput;
    connect?: Prisma.SrsDataWhereUniqueInput;
};
export type SrsDataUpdateOneWithoutWordNestedInput = {
    create?: Prisma.XOR<Prisma.SrsDataCreateWithoutWordInput, Prisma.SrsDataUncheckedCreateWithoutWordInput>;
    connectOrCreate?: Prisma.SrsDataCreateOrConnectWithoutWordInput;
    upsert?: Prisma.SrsDataUpsertWithoutWordInput;
    disconnect?: Prisma.SrsDataWhereInput | boolean;
    delete?: Prisma.SrsDataWhereInput | boolean;
    connect?: Prisma.SrsDataWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.SrsDataUpdateToOneWithWhereWithoutWordInput, Prisma.SrsDataUpdateWithoutWordInput>, Prisma.SrsDataUncheckedUpdateWithoutWordInput>;
};
export type SrsDataUncheckedUpdateOneWithoutWordNestedInput = {
    create?: Prisma.XOR<Prisma.SrsDataCreateWithoutWordInput, Prisma.SrsDataUncheckedCreateWithoutWordInput>;
    connectOrCreate?: Prisma.SrsDataCreateOrConnectWithoutWordInput;
    upsert?: Prisma.SrsDataUpsertWithoutWordInput;
    disconnect?: Prisma.SrsDataWhereInput | boolean;
    delete?: Prisma.SrsDataWhereInput | boolean;
    connect?: Prisma.SrsDataWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.SrsDataUpdateToOneWithWhereWithoutWordInput, Prisma.SrsDataUpdateWithoutWordInput>, Prisma.SrsDataUncheckedUpdateWithoutWordInput>;
};
export type FloatFieldUpdateOperationsInput = {
    set?: number;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type SrsDataCreateWithoutWordInput = {
    id?: string;
    interval?: number;
    easeFactor?: number;
    repetitions?: number;
    lastQuality?: number | null;
    lastReviewedAt?: Date | string | null;
    nextReviewAt?: Date | string;
};
export type SrsDataUncheckedCreateWithoutWordInput = {
    id?: string;
    interval?: number;
    easeFactor?: number;
    repetitions?: number;
    lastQuality?: number | null;
    lastReviewedAt?: Date | string | null;
    nextReviewAt?: Date | string;
};
export type SrsDataCreateOrConnectWithoutWordInput = {
    where: Prisma.SrsDataWhereUniqueInput;
    create: Prisma.XOR<Prisma.SrsDataCreateWithoutWordInput, Prisma.SrsDataUncheckedCreateWithoutWordInput>;
};
export type SrsDataUpsertWithoutWordInput = {
    update: Prisma.XOR<Prisma.SrsDataUpdateWithoutWordInput, Prisma.SrsDataUncheckedUpdateWithoutWordInput>;
    create: Prisma.XOR<Prisma.SrsDataCreateWithoutWordInput, Prisma.SrsDataUncheckedCreateWithoutWordInput>;
    where?: Prisma.SrsDataWhereInput;
};
export type SrsDataUpdateToOneWithWhereWithoutWordInput = {
    where?: Prisma.SrsDataWhereInput;
    data: Prisma.XOR<Prisma.SrsDataUpdateWithoutWordInput, Prisma.SrsDataUncheckedUpdateWithoutWordInput>;
};
export type SrsDataUpdateWithoutWordInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    interval?: Prisma.IntFieldUpdateOperationsInput | number;
    easeFactor?: Prisma.FloatFieldUpdateOperationsInput | number;
    repetitions?: Prisma.IntFieldUpdateOperationsInput | number;
    lastQuality?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    lastReviewedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    nextReviewAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SrsDataUncheckedUpdateWithoutWordInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    interval?: Prisma.IntFieldUpdateOperationsInput | number;
    easeFactor?: Prisma.FloatFieldUpdateOperationsInput | number;
    repetitions?: Prisma.IntFieldUpdateOperationsInput | number;
    lastQuality?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    lastReviewedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    nextReviewAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SrsDataSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    wordId?: boolean;
    interval?: boolean;
    easeFactor?: boolean;
    repetitions?: boolean;
    lastQuality?: boolean;
    lastReviewedAt?: boolean;
    nextReviewAt?: boolean;
    word?: boolean | Prisma.WordDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["srsData"]>;
export type SrsDataSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    wordId?: boolean;
    interval?: boolean;
    easeFactor?: boolean;
    repetitions?: boolean;
    lastQuality?: boolean;
    lastReviewedAt?: boolean;
    nextReviewAt?: boolean;
    word?: boolean | Prisma.WordDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["srsData"]>;
export type SrsDataSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    wordId?: boolean;
    interval?: boolean;
    easeFactor?: boolean;
    repetitions?: boolean;
    lastQuality?: boolean;
    lastReviewedAt?: boolean;
    nextReviewAt?: boolean;
    word?: boolean | Prisma.WordDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["srsData"]>;
export type SrsDataSelectScalar = {
    id?: boolean;
    wordId?: boolean;
    interval?: boolean;
    easeFactor?: boolean;
    repetitions?: boolean;
    lastQuality?: boolean;
    lastReviewedAt?: boolean;
    nextReviewAt?: boolean;
};
export type SrsDataOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "wordId" | "interval" | "easeFactor" | "repetitions" | "lastQuality" | "lastReviewedAt" | "nextReviewAt", ExtArgs["result"]["srsData"]>;
export type SrsDataInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    word?: boolean | Prisma.WordDefaultArgs<ExtArgs>;
};
export type SrsDataIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    word?: boolean | Prisma.WordDefaultArgs<ExtArgs>;
};
export type SrsDataIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    word?: boolean | Prisma.WordDefaultArgs<ExtArgs>;
};
export type $SrsDataPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "SrsData";
    objects: {
        word: Prisma.$WordPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        wordId: string;
        interval: number;
        easeFactor: number;
        repetitions: number;
        lastQuality: number | null;
        lastReviewedAt: Date | null;
        nextReviewAt: Date;
    }, ExtArgs["result"]["srsData"]>;
    composites: {};
};
export type SrsDataGetPayload<S extends boolean | null | undefined | SrsDataDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$SrsDataPayload, S>;
export type SrsDataCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<SrsDataFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: SrsDataCountAggregateInputType | true;
};
export interface SrsDataDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['SrsData'];
        meta: {
            name: 'SrsData';
        };
    };
    findUnique<T extends SrsDataFindUniqueArgs>(args: Prisma.SelectSubset<T, SrsDataFindUniqueArgs<ExtArgs>>): Prisma.Prisma__SrsDataClient<runtime.Types.Result.GetResult<Prisma.$SrsDataPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends SrsDataFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, SrsDataFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__SrsDataClient<runtime.Types.Result.GetResult<Prisma.$SrsDataPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends SrsDataFindFirstArgs>(args?: Prisma.SelectSubset<T, SrsDataFindFirstArgs<ExtArgs>>): Prisma.Prisma__SrsDataClient<runtime.Types.Result.GetResult<Prisma.$SrsDataPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends SrsDataFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, SrsDataFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__SrsDataClient<runtime.Types.Result.GetResult<Prisma.$SrsDataPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends SrsDataFindManyArgs>(args?: Prisma.SelectSubset<T, SrsDataFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SrsDataPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends SrsDataCreateArgs>(args: Prisma.SelectSubset<T, SrsDataCreateArgs<ExtArgs>>): Prisma.Prisma__SrsDataClient<runtime.Types.Result.GetResult<Prisma.$SrsDataPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends SrsDataCreateManyArgs>(args?: Prisma.SelectSubset<T, SrsDataCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends SrsDataCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, SrsDataCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SrsDataPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends SrsDataDeleteArgs>(args: Prisma.SelectSubset<T, SrsDataDeleteArgs<ExtArgs>>): Prisma.Prisma__SrsDataClient<runtime.Types.Result.GetResult<Prisma.$SrsDataPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends SrsDataUpdateArgs>(args: Prisma.SelectSubset<T, SrsDataUpdateArgs<ExtArgs>>): Prisma.Prisma__SrsDataClient<runtime.Types.Result.GetResult<Prisma.$SrsDataPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends SrsDataDeleteManyArgs>(args?: Prisma.SelectSubset<T, SrsDataDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends SrsDataUpdateManyArgs>(args: Prisma.SelectSubset<T, SrsDataUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends SrsDataUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, SrsDataUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SrsDataPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends SrsDataUpsertArgs>(args: Prisma.SelectSubset<T, SrsDataUpsertArgs<ExtArgs>>): Prisma.Prisma__SrsDataClient<runtime.Types.Result.GetResult<Prisma.$SrsDataPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends SrsDataCountArgs>(args?: Prisma.Subset<T, SrsDataCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], SrsDataCountAggregateOutputType> : number>;
    aggregate<T extends SrsDataAggregateArgs>(args: Prisma.Subset<T, SrsDataAggregateArgs>): Prisma.PrismaPromise<GetSrsDataAggregateType<T>>;
    groupBy<T extends SrsDataGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: SrsDataGroupByArgs['orderBy'];
    } : {
        orderBy?: SrsDataGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, SrsDataGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSrsDataGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: SrsDataFieldRefs;
}
export interface Prisma__SrsDataClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    word<T extends Prisma.WordDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.WordDefaultArgs<ExtArgs>>): Prisma.Prisma__WordClient<runtime.Types.Result.GetResult<Prisma.$WordPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface SrsDataFieldRefs {
    readonly id: Prisma.FieldRef<"SrsData", 'String'>;
    readonly wordId: Prisma.FieldRef<"SrsData", 'String'>;
    readonly interval: Prisma.FieldRef<"SrsData", 'Int'>;
    readonly easeFactor: Prisma.FieldRef<"SrsData", 'Float'>;
    readonly repetitions: Prisma.FieldRef<"SrsData", 'Int'>;
    readonly lastQuality: Prisma.FieldRef<"SrsData", 'Int'>;
    readonly lastReviewedAt: Prisma.FieldRef<"SrsData", 'DateTime'>;
    readonly nextReviewAt: Prisma.FieldRef<"SrsData", 'DateTime'>;
}
export type SrsDataFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SrsDataSelect<ExtArgs> | null;
    omit?: Prisma.SrsDataOmit<ExtArgs> | null;
    include?: Prisma.SrsDataInclude<ExtArgs> | null;
    where: Prisma.SrsDataWhereUniqueInput;
};
export type SrsDataFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SrsDataSelect<ExtArgs> | null;
    omit?: Prisma.SrsDataOmit<ExtArgs> | null;
    include?: Prisma.SrsDataInclude<ExtArgs> | null;
    where: Prisma.SrsDataWhereUniqueInput;
};
export type SrsDataFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SrsDataSelect<ExtArgs> | null;
    omit?: Prisma.SrsDataOmit<ExtArgs> | null;
    include?: Prisma.SrsDataInclude<ExtArgs> | null;
    where?: Prisma.SrsDataWhereInput;
    orderBy?: Prisma.SrsDataOrderByWithRelationInput | Prisma.SrsDataOrderByWithRelationInput[];
    cursor?: Prisma.SrsDataWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.SrsDataScalarFieldEnum | Prisma.SrsDataScalarFieldEnum[];
};
export type SrsDataFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SrsDataSelect<ExtArgs> | null;
    omit?: Prisma.SrsDataOmit<ExtArgs> | null;
    include?: Prisma.SrsDataInclude<ExtArgs> | null;
    where?: Prisma.SrsDataWhereInput;
    orderBy?: Prisma.SrsDataOrderByWithRelationInput | Prisma.SrsDataOrderByWithRelationInput[];
    cursor?: Prisma.SrsDataWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.SrsDataScalarFieldEnum | Prisma.SrsDataScalarFieldEnum[];
};
export type SrsDataFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SrsDataSelect<ExtArgs> | null;
    omit?: Prisma.SrsDataOmit<ExtArgs> | null;
    include?: Prisma.SrsDataInclude<ExtArgs> | null;
    where?: Prisma.SrsDataWhereInput;
    orderBy?: Prisma.SrsDataOrderByWithRelationInput | Prisma.SrsDataOrderByWithRelationInput[];
    cursor?: Prisma.SrsDataWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.SrsDataScalarFieldEnum | Prisma.SrsDataScalarFieldEnum[];
};
export type SrsDataCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SrsDataSelect<ExtArgs> | null;
    omit?: Prisma.SrsDataOmit<ExtArgs> | null;
    include?: Prisma.SrsDataInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.SrsDataCreateInput, Prisma.SrsDataUncheckedCreateInput>;
};
export type SrsDataCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.SrsDataCreateManyInput | Prisma.SrsDataCreateManyInput[];
    skipDuplicates?: boolean;
};
export type SrsDataCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SrsDataSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.SrsDataOmit<ExtArgs> | null;
    data: Prisma.SrsDataCreateManyInput | Prisma.SrsDataCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.SrsDataIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type SrsDataUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SrsDataSelect<ExtArgs> | null;
    omit?: Prisma.SrsDataOmit<ExtArgs> | null;
    include?: Prisma.SrsDataInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.SrsDataUpdateInput, Prisma.SrsDataUncheckedUpdateInput>;
    where: Prisma.SrsDataWhereUniqueInput;
};
export type SrsDataUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.SrsDataUpdateManyMutationInput, Prisma.SrsDataUncheckedUpdateManyInput>;
    where?: Prisma.SrsDataWhereInput;
    limit?: number;
};
export type SrsDataUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SrsDataSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.SrsDataOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.SrsDataUpdateManyMutationInput, Prisma.SrsDataUncheckedUpdateManyInput>;
    where?: Prisma.SrsDataWhereInput;
    limit?: number;
    include?: Prisma.SrsDataIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type SrsDataUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SrsDataSelect<ExtArgs> | null;
    omit?: Prisma.SrsDataOmit<ExtArgs> | null;
    include?: Prisma.SrsDataInclude<ExtArgs> | null;
    where: Prisma.SrsDataWhereUniqueInput;
    create: Prisma.XOR<Prisma.SrsDataCreateInput, Prisma.SrsDataUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.SrsDataUpdateInput, Prisma.SrsDataUncheckedUpdateInput>;
};
export type SrsDataDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SrsDataSelect<ExtArgs> | null;
    omit?: Prisma.SrsDataOmit<ExtArgs> | null;
    include?: Prisma.SrsDataInclude<ExtArgs> | null;
    where: Prisma.SrsDataWhereUniqueInput;
};
export type SrsDataDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SrsDataWhereInput;
    limit?: number;
};
export type SrsDataDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SrsDataSelect<ExtArgs> | null;
    omit?: Prisma.SrsDataOmit<ExtArgs> | null;
    include?: Prisma.SrsDataInclude<ExtArgs> | null;
};
