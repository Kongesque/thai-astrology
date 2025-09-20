export declare const PLANET_NAME_MAP: Record<string, string>;
export type RulingPlanetInfo = {
    numbers: string[];
    names: string[];
};
export declare const findRulingPlanets: (chart: unknown) => RulingPlanetInfo;
export declare const formatRulingPlanets: ({ names, numbers }: RulingPlanetInfo) => string;
//# sourceMappingURL=ruling-planets.d.ts.map