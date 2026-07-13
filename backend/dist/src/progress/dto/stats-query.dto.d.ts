export declare const STATS_PERIODS: readonly ["week", "month", "all"];
export type StatsPeriod = (typeof STATS_PERIODS)[number];
export declare class StatsQueryDto {
    period?: StatsPeriod;
}
