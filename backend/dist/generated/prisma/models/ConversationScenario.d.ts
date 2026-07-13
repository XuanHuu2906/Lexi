import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums";
import type * as Prisma from "../internal/prismaNamespace";
export type ConversationScenarioModel = runtime.Types.Result.DefaultSelection<Prisma.$ConversationScenarioPayload>;
export type AggregateConversationScenario = {
    _count: ConversationScenarioCountAggregateOutputType | null;
    _min: ConversationScenarioMinAggregateOutputType | null;
    _max: ConversationScenarioMaxAggregateOutputType | null;
};
export type ConversationScenarioMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    description: string | null;
    roleHint: string | null;
    difficulty: $Enums.ScenarioDifficulty | null;
    enabled: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type ConversationScenarioMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    description: string | null;
    roleHint: string | null;
    difficulty: $Enums.ScenarioDifficulty | null;
    enabled: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type ConversationScenarioCountAggregateOutputType = {
    id: number;
    name: number;
    description: number;
    roleHint: number;
    difficulty: number;
    enabled: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type ConversationScenarioMinAggregateInputType = {
    id?: true;
    name?: true;
    description?: true;
    roleHint?: true;
    difficulty?: true;
    enabled?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type ConversationScenarioMaxAggregateInputType = {
    id?: true;
    name?: true;
    description?: true;
    roleHint?: true;
    difficulty?: true;
    enabled?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type ConversationScenarioCountAggregateInputType = {
    id?: true;
    name?: true;
    description?: true;
    roleHint?: true;
    difficulty?: true;
    enabled?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type ConversationScenarioAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ConversationScenarioWhereInput;
    orderBy?: Prisma.ConversationScenarioOrderByWithRelationInput | Prisma.ConversationScenarioOrderByWithRelationInput[];
    cursor?: Prisma.ConversationScenarioWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ConversationScenarioCountAggregateInputType;
    _min?: ConversationScenarioMinAggregateInputType;
    _max?: ConversationScenarioMaxAggregateInputType;
};
export type GetConversationScenarioAggregateType<T extends ConversationScenarioAggregateArgs> = {
    [P in keyof T & keyof AggregateConversationScenario]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateConversationScenario[P]> : Prisma.GetScalarType<T[P], AggregateConversationScenario[P]>;
};
export type ConversationScenarioGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ConversationScenarioWhereInput;
    orderBy?: Prisma.ConversationScenarioOrderByWithAggregationInput | Prisma.ConversationScenarioOrderByWithAggregationInput[];
    by: Prisma.ConversationScenarioScalarFieldEnum[] | Prisma.ConversationScenarioScalarFieldEnum;
    having?: Prisma.ConversationScenarioScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ConversationScenarioCountAggregateInputType | true;
    _min?: ConversationScenarioMinAggregateInputType;
    _max?: ConversationScenarioMaxAggregateInputType;
};
export type ConversationScenarioGroupByOutputType = {
    id: string;
    name: string;
    description: string;
    roleHint: string;
    difficulty: $Enums.ScenarioDifficulty;
    enabled: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count: ConversationScenarioCountAggregateOutputType | null;
    _min: ConversationScenarioMinAggregateOutputType | null;
    _max: ConversationScenarioMaxAggregateOutputType | null;
};
export type GetConversationScenarioGroupByPayload<T extends ConversationScenarioGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ConversationScenarioGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ConversationScenarioGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ConversationScenarioGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ConversationScenarioGroupByOutputType[P]>;
}>>;
export type ConversationScenarioWhereInput = {
    AND?: Prisma.ConversationScenarioWhereInput | Prisma.ConversationScenarioWhereInput[];
    OR?: Prisma.ConversationScenarioWhereInput[];
    NOT?: Prisma.ConversationScenarioWhereInput | Prisma.ConversationScenarioWhereInput[];
    id?: Prisma.StringFilter<"ConversationScenario"> | string;
    name?: Prisma.StringFilter<"ConversationScenario"> | string;
    description?: Prisma.StringFilter<"ConversationScenario"> | string;
    roleHint?: Prisma.StringFilter<"ConversationScenario"> | string;
    difficulty?: Prisma.EnumScenarioDifficultyFilter<"ConversationScenario"> | $Enums.ScenarioDifficulty;
    enabled?: Prisma.BoolFilter<"ConversationScenario"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"ConversationScenario"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"ConversationScenario"> | Date | string;
};
export type ConversationScenarioOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    roleHint?: Prisma.SortOrder;
    difficulty?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ConversationScenarioWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    name?: string;
    AND?: Prisma.ConversationScenarioWhereInput | Prisma.ConversationScenarioWhereInput[];
    OR?: Prisma.ConversationScenarioWhereInput[];
    NOT?: Prisma.ConversationScenarioWhereInput | Prisma.ConversationScenarioWhereInput[];
    description?: Prisma.StringFilter<"ConversationScenario"> | string;
    roleHint?: Prisma.StringFilter<"ConversationScenario"> | string;
    difficulty?: Prisma.EnumScenarioDifficultyFilter<"ConversationScenario"> | $Enums.ScenarioDifficulty;
    enabled?: Prisma.BoolFilter<"ConversationScenario"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"ConversationScenario"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"ConversationScenario"> | Date | string;
}, "id" | "name">;
export type ConversationScenarioOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    roleHint?: Prisma.SortOrder;
    difficulty?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.ConversationScenarioCountOrderByAggregateInput;
    _max?: Prisma.ConversationScenarioMaxOrderByAggregateInput;
    _min?: Prisma.ConversationScenarioMinOrderByAggregateInput;
};
export type ConversationScenarioScalarWhereWithAggregatesInput = {
    AND?: Prisma.ConversationScenarioScalarWhereWithAggregatesInput | Prisma.ConversationScenarioScalarWhereWithAggregatesInput[];
    OR?: Prisma.ConversationScenarioScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ConversationScenarioScalarWhereWithAggregatesInput | Prisma.ConversationScenarioScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"ConversationScenario"> | string;
    name?: Prisma.StringWithAggregatesFilter<"ConversationScenario"> | string;
    description?: Prisma.StringWithAggregatesFilter<"ConversationScenario"> | string;
    roleHint?: Prisma.StringWithAggregatesFilter<"ConversationScenario"> | string;
    difficulty?: Prisma.EnumScenarioDifficultyWithAggregatesFilter<"ConversationScenario"> | $Enums.ScenarioDifficulty;
    enabled?: Prisma.BoolWithAggregatesFilter<"ConversationScenario"> | boolean;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"ConversationScenario"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"ConversationScenario"> | Date | string;
};
export type ConversationScenarioCreateInput = {
    id?: string;
    name: string;
    description: string;
    roleHint: string;
    difficulty?: $Enums.ScenarioDifficulty;
    enabled?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ConversationScenarioUncheckedCreateInput = {
    id?: string;
    name: string;
    description: string;
    roleHint: string;
    difficulty?: $Enums.ScenarioDifficulty;
    enabled?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ConversationScenarioUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    roleHint?: Prisma.StringFieldUpdateOperationsInput | string;
    difficulty?: Prisma.EnumScenarioDifficultyFieldUpdateOperationsInput | $Enums.ScenarioDifficulty;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ConversationScenarioUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    roleHint?: Prisma.StringFieldUpdateOperationsInput | string;
    difficulty?: Prisma.EnumScenarioDifficultyFieldUpdateOperationsInput | $Enums.ScenarioDifficulty;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ConversationScenarioCreateManyInput = {
    id?: string;
    name: string;
    description: string;
    roleHint: string;
    difficulty?: $Enums.ScenarioDifficulty;
    enabled?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ConversationScenarioUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    roleHint?: Prisma.StringFieldUpdateOperationsInput | string;
    difficulty?: Prisma.EnumScenarioDifficultyFieldUpdateOperationsInput | $Enums.ScenarioDifficulty;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ConversationScenarioUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    roleHint?: Prisma.StringFieldUpdateOperationsInput | string;
    difficulty?: Prisma.EnumScenarioDifficultyFieldUpdateOperationsInput | $Enums.ScenarioDifficulty;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ConversationScenarioCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    roleHint?: Prisma.SortOrder;
    difficulty?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ConversationScenarioMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    roleHint?: Prisma.SortOrder;
    difficulty?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ConversationScenarioMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    roleHint?: Prisma.SortOrder;
    difficulty?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type EnumScenarioDifficultyFieldUpdateOperationsInput = {
    set?: $Enums.ScenarioDifficulty;
};
export type ConversationScenarioSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    description?: boolean;
    roleHint?: boolean;
    difficulty?: boolean;
    enabled?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["conversationScenario"]>;
export type ConversationScenarioSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    description?: boolean;
    roleHint?: boolean;
    difficulty?: boolean;
    enabled?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["conversationScenario"]>;
export type ConversationScenarioSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    description?: boolean;
    roleHint?: boolean;
    difficulty?: boolean;
    enabled?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["conversationScenario"]>;
export type ConversationScenarioSelectScalar = {
    id?: boolean;
    name?: boolean;
    description?: boolean;
    roleHint?: boolean;
    difficulty?: boolean;
    enabled?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type ConversationScenarioOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "name" | "description" | "roleHint" | "difficulty" | "enabled" | "createdAt" | "updatedAt", ExtArgs["result"]["conversationScenario"]>;
export type $ConversationScenarioPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ConversationScenario";
    objects: {};
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        name: string;
        description: string;
        roleHint: string;
        difficulty: $Enums.ScenarioDifficulty;
        enabled: boolean;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["conversationScenario"]>;
    composites: {};
};
export type ConversationScenarioGetPayload<S extends boolean | null | undefined | ConversationScenarioDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ConversationScenarioPayload, S>;
export type ConversationScenarioCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ConversationScenarioFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ConversationScenarioCountAggregateInputType | true;
};
export interface ConversationScenarioDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ConversationScenario'];
        meta: {
            name: 'ConversationScenario';
        };
    };
    findUnique<T extends ConversationScenarioFindUniqueArgs>(args: Prisma.SelectSubset<T, ConversationScenarioFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ConversationScenarioClient<runtime.Types.Result.GetResult<Prisma.$ConversationScenarioPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ConversationScenarioFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ConversationScenarioFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ConversationScenarioClient<runtime.Types.Result.GetResult<Prisma.$ConversationScenarioPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ConversationScenarioFindFirstArgs>(args?: Prisma.SelectSubset<T, ConversationScenarioFindFirstArgs<ExtArgs>>): Prisma.Prisma__ConversationScenarioClient<runtime.Types.Result.GetResult<Prisma.$ConversationScenarioPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ConversationScenarioFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ConversationScenarioFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ConversationScenarioClient<runtime.Types.Result.GetResult<Prisma.$ConversationScenarioPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ConversationScenarioFindManyArgs>(args?: Prisma.SelectSubset<T, ConversationScenarioFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ConversationScenarioPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ConversationScenarioCreateArgs>(args: Prisma.SelectSubset<T, ConversationScenarioCreateArgs<ExtArgs>>): Prisma.Prisma__ConversationScenarioClient<runtime.Types.Result.GetResult<Prisma.$ConversationScenarioPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ConversationScenarioCreateManyArgs>(args?: Prisma.SelectSubset<T, ConversationScenarioCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ConversationScenarioCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ConversationScenarioCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ConversationScenarioPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ConversationScenarioDeleteArgs>(args: Prisma.SelectSubset<T, ConversationScenarioDeleteArgs<ExtArgs>>): Prisma.Prisma__ConversationScenarioClient<runtime.Types.Result.GetResult<Prisma.$ConversationScenarioPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ConversationScenarioUpdateArgs>(args: Prisma.SelectSubset<T, ConversationScenarioUpdateArgs<ExtArgs>>): Prisma.Prisma__ConversationScenarioClient<runtime.Types.Result.GetResult<Prisma.$ConversationScenarioPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ConversationScenarioDeleteManyArgs>(args?: Prisma.SelectSubset<T, ConversationScenarioDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ConversationScenarioUpdateManyArgs>(args: Prisma.SelectSubset<T, ConversationScenarioUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ConversationScenarioUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ConversationScenarioUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ConversationScenarioPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ConversationScenarioUpsertArgs>(args: Prisma.SelectSubset<T, ConversationScenarioUpsertArgs<ExtArgs>>): Prisma.Prisma__ConversationScenarioClient<runtime.Types.Result.GetResult<Prisma.$ConversationScenarioPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ConversationScenarioCountArgs>(args?: Prisma.Subset<T, ConversationScenarioCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ConversationScenarioCountAggregateOutputType> : number>;
    aggregate<T extends ConversationScenarioAggregateArgs>(args: Prisma.Subset<T, ConversationScenarioAggregateArgs>): Prisma.PrismaPromise<GetConversationScenarioAggregateType<T>>;
    groupBy<T extends ConversationScenarioGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ConversationScenarioGroupByArgs['orderBy'];
    } : {
        orderBy?: ConversationScenarioGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ConversationScenarioGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetConversationScenarioGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ConversationScenarioFieldRefs;
}
export interface Prisma__ConversationScenarioClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ConversationScenarioFieldRefs {
    readonly id: Prisma.FieldRef<"ConversationScenario", 'String'>;
    readonly name: Prisma.FieldRef<"ConversationScenario", 'String'>;
    readonly description: Prisma.FieldRef<"ConversationScenario", 'String'>;
    readonly roleHint: Prisma.FieldRef<"ConversationScenario", 'String'>;
    readonly difficulty: Prisma.FieldRef<"ConversationScenario", 'ScenarioDifficulty'>;
    readonly enabled: Prisma.FieldRef<"ConversationScenario", 'Boolean'>;
    readonly createdAt: Prisma.FieldRef<"ConversationScenario", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"ConversationScenario", 'DateTime'>;
}
export type ConversationScenarioFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ConversationScenarioSelect<ExtArgs> | null;
    omit?: Prisma.ConversationScenarioOmit<ExtArgs> | null;
    where: Prisma.ConversationScenarioWhereUniqueInput;
};
export type ConversationScenarioFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ConversationScenarioSelect<ExtArgs> | null;
    omit?: Prisma.ConversationScenarioOmit<ExtArgs> | null;
    where: Prisma.ConversationScenarioWhereUniqueInput;
};
export type ConversationScenarioFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ConversationScenarioSelect<ExtArgs> | null;
    omit?: Prisma.ConversationScenarioOmit<ExtArgs> | null;
    where?: Prisma.ConversationScenarioWhereInput;
    orderBy?: Prisma.ConversationScenarioOrderByWithRelationInput | Prisma.ConversationScenarioOrderByWithRelationInput[];
    cursor?: Prisma.ConversationScenarioWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ConversationScenarioScalarFieldEnum | Prisma.ConversationScenarioScalarFieldEnum[];
};
export type ConversationScenarioFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ConversationScenarioSelect<ExtArgs> | null;
    omit?: Prisma.ConversationScenarioOmit<ExtArgs> | null;
    where?: Prisma.ConversationScenarioWhereInput;
    orderBy?: Prisma.ConversationScenarioOrderByWithRelationInput | Prisma.ConversationScenarioOrderByWithRelationInput[];
    cursor?: Prisma.ConversationScenarioWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ConversationScenarioScalarFieldEnum | Prisma.ConversationScenarioScalarFieldEnum[];
};
export type ConversationScenarioFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ConversationScenarioSelect<ExtArgs> | null;
    omit?: Prisma.ConversationScenarioOmit<ExtArgs> | null;
    where?: Prisma.ConversationScenarioWhereInput;
    orderBy?: Prisma.ConversationScenarioOrderByWithRelationInput | Prisma.ConversationScenarioOrderByWithRelationInput[];
    cursor?: Prisma.ConversationScenarioWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ConversationScenarioScalarFieldEnum | Prisma.ConversationScenarioScalarFieldEnum[];
};
export type ConversationScenarioCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ConversationScenarioSelect<ExtArgs> | null;
    omit?: Prisma.ConversationScenarioOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ConversationScenarioCreateInput, Prisma.ConversationScenarioUncheckedCreateInput>;
};
export type ConversationScenarioCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ConversationScenarioCreateManyInput | Prisma.ConversationScenarioCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ConversationScenarioCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ConversationScenarioSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ConversationScenarioOmit<ExtArgs> | null;
    data: Prisma.ConversationScenarioCreateManyInput | Prisma.ConversationScenarioCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ConversationScenarioUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ConversationScenarioSelect<ExtArgs> | null;
    omit?: Prisma.ConversationScenarioOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ConversationScenarioUpdateInput, Prisma.ConversationScenarioUncheckedUpdateInput>;
    where: Prisma.ConversationScenarioWhereUniqueInput;
};
export type ConversationScenarioUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ConversationScenarioUpdateManyMutationInput, Prisma.ConversationScenarioUncheckedUpdateManyInput>;
    where?: Prisma.ConversationScenarioWhereInput;
    limit?: number;
};
export type ConversationScenarioUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ConversationScenarioSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ConversationScenarioOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ConversationScenarioUpdateManyMutationInput, Prisma.ConversationScenarioUncheckedUpdateManyInput>;
    where?: Prisma.ConversationScenarioWhereInput;
    limit?: number;
};
export type ConversationScenarioUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ConversationScenarioSelect<ExtArgs> | null;
    omit?: Prisma.ConversationScenarioOmit<ExtArgs> | null;
    where: Prisma.ConversationScenarioWhereUniqueInput;
    create: Prisma.XOR<Prisma.ConversationScenarioCreateInput, Prisma.ConversationScenarioUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ConversationScenarioUpdateInput, Prisma.ConversationScenarioUncheckedUpdateInput>;
};
export type ConversationScenarioDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ConversationScenarioSelect<ExtArgs> | null;
    omit?: Prisma.ConversationScenarioOmit<ExtArgs> | null;
    where: Prisma.ConversationScenarioWhereUniqueInput;
};
export type ConversationScenarioDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ConversationScenarioWhereInput;
    limit?: number;
};
export type ConversationScenarioDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ConversationScenarioSelect<ExtArgs> | null;
    omit?: Prisma.ConversationScenarioOmit<ExtArgs> | null;
};
