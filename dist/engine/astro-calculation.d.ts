export interface PlanetPositions {
    ascendant: number;
    sun: number;
    moon: number;
    mars: number;
    mercury: number;
    jupiter: number;
    venus: number;
    saturn: number;
    rahu: number;
    ketu: number;
    uranus: number;
}
export interface CalculationInput {
    day: number;
    monthTh: number;
    yearBe?: number;
    yearBc?: number;
    hour: number;
    minute: number;
    province: string;
}
export interface CalculationResult {
    positions: PlanetPositions;
    tanuseth: number;
    channelOutputs: string[];
    sunPosition: [number, number];
}
export declare function calculateUranus(monthTh: number, yearBe: number, day: number, hour: number, minute: number): number;
export declare function calculateKetu(monthTh: number, yearBe: number, day: number, hour: number, minute: number): number;
export declare function calculateRahu(monthTh: number, yearBe: number, day: number, hour: number, minute: number): number;
export declare function calculateSaturn(monthTh: number, yearBe: number, day: number, hour: number, minute: number): number;
export declare function calculateVenus(monthTh: number, yearBe: number, day: number, hour: number, minute: number): number;
export declare function calculateJupiter(monthTh: number, yearBe: number, day: number, hour: number, minute: number): number;
export declare function calculateMercury(monthTh: number, yearBe: number, day: number, hour: number, minute: number): number;
export declare function calculateMars(monthTh: number, yearBe: number, day: number, hour: number, minute: number): number;
export declare function calculateMoon(monthTh: number, yearBe: number, day: number, hour: number, minute: number): number;
export declare function calculateSun(monthTh: number, yearBe: number, day: number, hour: number, minute: number): number;
export declare function calculateSunDegrees(monthTh: number, yearBe: number, day: number, hour: number, minute: number): number;
export declare function calculateSunMinutes(monthTh: number, yearBe: number, day: number, hour: number, minute: number): number;
export declare function calculateAscendant(day: number, monthTh: number, yearBe: number, hour: number, minute: number, province: string): number;
export declare function calculateTanuseth(positions: Record<string, number>, ascSign: number): number;
export declare function calculateAllPositions(input: CalculationInput): CalculationResult;
//# sourceMappingURL=astro-calculation.d.ts.map