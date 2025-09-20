// Thai Astrological Calculations - TypeScript Version

export interface PlanetPositions {
  ascendant: number
  sun: number
  moon: number
  mars: number
  mercury: number
  jupiter: number
  venus: number
  saturn: number
  rahu: number
  ketu: number
  uranus: number
}

export interface CalculationInput {
  day: number
  monthTh: number
  yearBe?: number
  yearBc?: number
  hour: number
  minute: number
  province: string
}

export interface CalculationResult {
  positions: PlanetPositions
  tanuseth: number
  channelOutputs: string[]
  sunPosition: [number, number] // [degrees, minutes]
}

const ensureMonthTh = (monthTh: number): number => {
  if (!Number.isInteger(monthTh) || monthTh < 1 || monthTh > 12) {
    throw new RangeError("`monthTh` must be an integer between 1 and 12")
  }
  return monthTh
}

const ensureInteger = (value: number, label: string): number => {
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    throw new RangeError(`\`${label}\` must be a finite integer`)
  }
  return value
}

const resolveYearBe = (yearBe?: number, yearBc?: number): number => {
  if (yearBe !== undefined) {
    return ensureInteger(yearBe, "yearBe")
  }

  if (yearBc !== undefined) {
    const normalizedYearBc = ensureInteger(yearBc, "yearBc")
    return normalizedYearBc + 543
  }

  throw new TypeError("Either `yearBe` or `yearBc` must be provided")
}

const QUADRANT_ADJUST_TABLE: Record<number, number> = { 0: 0, 1: 244, 2: 427, 3: 488 }

const PROVINCE_TIME_OFFSETS: Record<string, number> = {
  กระบี่: 24,
  กรุงเทพมหานคร: 18,
  กาญจนบุรี: 22,
  กาฬสินธุ์: 6,
  กำแพงเพชร: 22,
  ขอนแก่น: 9,
  จันทบุรี: 12,
  ฉะเชิงเทรา: 16,
  ชลบุรี: 16,
  ชัยนาท: 19,
  ชัยภูมิ: 12,
  ชุมพร: 23,
  เชียงราย: 21,
  เชียงใหม่: 24,
  ตรัง: 22,
  ตราด: 10,
  ตาก: 23,
  นครนายก: 15,
  นครปฐม: 20,
  นครพนม: 1,
  นครราชสีมา: 12,
  นครศรีธรรมราช: 20,
  นครสวรรค์: 20,
  นนทบุรี: 18,
  นราธิวาส: 13,
  น่าน: 17,
  บึงกาฬ: 5,
  บุรีรัมย์: 8,
  ปทุมธานี: 18,
  ประจวบคีรีขันธ์: 21,
  ปราจีนบุรี: 15,
  ปัตตานี: 15,
  พระนครศรีอยุธยา: 18,
  พะเยา: 20,
  พังงา: 26,
  พัทลุง: 20,
  พิจิตร: 19,
  พิษณุโลก: 19,
  เพชรบุรี: 20,
  เพชรบูรณ์: 15,
  แพร่: 19,
  ภูเก็ต: 27,
  มหาสารคาม: 7,
  มุกดาหาร: 1,
  แม่ฮ่องสอน: 28,
  ยโสธร: 3,
  ยะลา: 15,
  ร้อยเอ็ด: 5,
  ระนอง: 26,
  ระยอง: 15,
  ราชบุรี: 21,
  ลพบุรี: 17,
  ลำปาง: 22,
  ลำพูน: 24,
  เลย: 13,
  ศรีสะเกษ: 3,
  สกลนคร: 3,
  สงขลา: 18,
  สตูล: 20,
  สมุทรปราการ: 18,
  สมุทรสงคราม: 20,
  สมุทรสาคร: 19,
  สระแก้ว: 12,
  สระบุรี: 16,
  สิงห์บุรี: 18,
  สุโขทัย: 21,
  สุพรรณบุรี: 20,
  สุราษฎร์ธานี: 23,
  สุรินทร์: 6,
  หนองคาย: 9,
  หนองบัวลำภู: 10,
  อ่างทอง: 18,
  อำนาจเจริญ: 1,
  อุดรธานี: 9,
  อุตรดิตถ์: 20,
  อุทัยธานี: 20,
  อุบลราชธานี: 1,
}

const SIGN_DURATIONS_MINUTES = [120.0, 96.0, 72.0, 120.0, 144.0, 168.0, 168.0, 144.0, 120.0, 72.0, 96.0, 120.0]

const SIGN_PLANETS: Record<number, string> = {
  1: "อาทิตย์",
  2: "จันทร์",
  3: "อังคาร",
  4: "พุธ",
  5: "พฤหัสบดี",
  6: "ศุกร์",
  7: "เสาร์",
  8: "ราหู",
  9: "เกตุ",
  0: "มฤตยู",
}

const MAP_PLANETS: Record<number, number> = {
  0: 3,
  1: 6,
  2: 4,
  3: 2,
  4: 1,
  5: 4,
  6: 6,
  7: 3,
  8: 5,
  9: 7,
  10: 8,
  11: 5,
}

const PLANET_SYMBOLS: Record<string, [string, number | null]> = {
  ascendant: ["ลั", null],
  sun: ["๑", 1],
  moon: ["๒", 2],
  mars: ["๓", 3],
  mercury: ["๔", 4],
  jupiter: ["๕", 5],
  venus: ["๖", 6],
  saturn: ["๗", 7],
  rahu: ["๘", null],
  ketu: ["๙", null],
  uranus: ["๐", null],
}

// Helper Functions
function wrap21600(value: number): number {
  const modValue = value % 21600
  return modValue >= 0 ? modValue : modValue + 21600
}

function calculateBaseValues(
  monthTh: number,
  yearBe: number,
  day: number,
  hour: number,
  minute: number,
): [number, number, number, number, number] {
  const monthNum = ensureMonthTh(monthTh)
  const yearAd = yearBe - 543

  const jy = monthNum > 2 ? yearAd : yearAd - 1
  const jm = monthNum > 2 ? monthNum + 1 : monthNum + 13
  const jc = Math.floor(jy * 0.01)
  const jdBase = Math.floor(jy * 365.25) + Math.floor(jm * 30.6) + day + 1720997 - jc + Math.floor(jc * 0.25)

  let D14: number, E11: number
  if (hour < 12) {
    D14 = jdBase - 1
    E11 = hour / 24 - 0.5 + 1.5
  } else {
    D14 = jdBase
    E11 = hour / 24 - 0.5
  }

  const additionalTime = (hour / 60 + minute) / 60 / 60 / 24
  const E14 = E11 + additionalTime
  const julianDay = D14 + E14

  const relativeJulianDay = Math.round(julianDay - 1954167.5)
  const timeFraction = hour + minute / 60
  const yearRelative1181 = yearBe - 1181

  const solarCeiling = Math.ceil((292207 * yearRelative1181 + 373) / 800)

  const solarAdjF6 =
    yearRelative1181 * 0.25875 +
    Math.trunc(yearRelative1181 / 100 + 0.38) -
    Math.trunc(yearRelative1181 / 4 + 0.5) -
    Math.trunc(yearRelative1181 / 400 + 0.595) -
    5.53375
  const solarAdjDays = Math.trunc(solarAdjF6)
  const solarAdjHours = Math.trunc((solarAdjF6 - solarAdjDays) * 24)
  const solarAdjMinutes = Math.trunc(((solarAdjF6 - solarAdjDays) * 24 - solarAdjHours) * 60)

  const currentTimeF8 = hour * 60 + minute / 60
  const solarAdjTimeF9 = solarAdjHours * 60 + solarAdjMinutes / 60
  const timeComparisonIndicator = currentTimeF8 > solarAdjTimeF9 ? 1 : 2

  let solarCalcYear: number
  if (relativeJulianDay < solarCeiling || (relativeJulianDay === solarCeiling && timeComparisonIndicator === 2)) {
    solarCalcYear = yearRelative1181 - 1
  } else {
    solarCalcYear = yearRelative1181
  }

  const intermediateSolarDate = Math.trunc((solarCalcYear * 292207) / 800 + 373 / 800) + 1

  const B21Val = ((relativeJulianDay - 1) * 800 + Math.trunc((timeFraction * 800) / 24) - 373) % 292207
  const C22Val = B21Val % 24350
  const B22Val = Math.floor(B21Val / 24350)
  const B23Val = Math.floor(C22Val / 811)
  const C23Val = C22Val % 811
  const B24Val = Math.floor(C23Val / 14) - 3
  const D25Val = B22Val * 1800 + B23Val * 60 + B24Val

  const solarPositionMean = wrap21600(D25Val)
  const solarPositionRaw = wrap21600(solarPositionMean - 23)

  const E18Val = B21Val >= 364 ? solarCalcYear - 610 : solarCalcYear - 611
  const solarCalcBase = E18Val * 21600 + solarPositionRaw

  return [relativeJulianDay, timeFraction, solarCalcBase, solarPositionRaw, solarPositionMean]
}

function getQuadrantVals(value: number): [number, number, number] {
  const wrappedInput = wrap21600(value)
  const quadrant = Math.floor(wrappedInput / 5400) + 1
  const signMultiplier = [1, 2].includes(quadrant) ? -1 : 1

  let quadrantVal: number
  if (quadrant === 1) quadrantVal = wrappedInput
  else if (quadrant === 2) quadrantVal = 10800 - wrappedInput
  else if (quadrant === 3) quadrantVal = wrappedInput - 10800
  else quadrantVal = 21600 - wrappedInput

  return [quadrant, quadrantVal, signMultiplier]
}

function getTableAdj(quadrantVal: number): number {
  const baseIndex = Math.floor(quadrantVal / 1800)
  const val1 = QUADRANT_ADJUST_TABLE[baseIndex % 4]
  const val2 = QUADRANT_ADJUST_TABLE[(baseIndex + 1) % 4]
  const interpFactor = quadrantVal / 1800 - baseIndex
  const adj = Math.round((interpFactor * (val2 - val1) + val1) * 60)
  return adj
}

function getSecondaryAdjParams(value: number): [number, number, number] {
  const wrappedInput = wrap21600(value)
  const quadrant = Math.floor(wrappedInput / 5400) + 1

  let secondaryVal: number
  if (quadrant === 1) secondaryVal = 5400 - wrappedInput
  else if (quadrant === 2) secondaryVal = wrappedInput - 5400
  else if (quadrant === 3) secondaryVal = 16200 - wrappedInput
  else secondaryVal = wrappedInput - 16200

  const baseIndex = Math.floor(secondaryVal / 1800)
  const val1 = QUADRANT_ADJUST_TABLE[baseIndex % 4]
  const val2 = QUADRANT_ADJUST_TABLE[(baseIndex + 1) % 4]
  const interpFactor = secondaryVal / 1800 - baseIndex
  const interpAdj = Math.round(interpFactor * (val2 - val1) + val1 + 0.5)
  const g66Val = Math.floor(interpAdj / 2)
  const signMultSecondary = [1, 4].includes(quadrant) ? 1 : -1

  return [g66Val, signMultSecondary, interpAdj]
}

function applyPlanetaryAdjustments(
  initialPos: number,
  baseCalcVal: number,
  constants: { k51: number; k67Base: number; k87Mult: number },
): number {
  // First Adjustment Cycle
  const val51 = initialPos - constants.k51
  const [, quadVal1, signMult1] = getQuadrantVals(val51)
  const adj1 = getTableAdj(quadVal1)
  const [g66Val1, signMultSec1] = getSecondaryAdjParams(wrap21600(val51))
  const denom1 = constants.k67Base + g66Val1 * signMultSec1
  const appliedAdj1 = denom1 !== 0 ? Math.round((adj1 * 60) / denom1) : 0
  const posAfterAdj1 = initialPos + appliedAdj1 * signMult1

  // Second Adjustment Cycle
  const val71 = wrap21600(posAfterAdj1) - baseCalcVal
  const [, quadVal2, signMult2] = getQuadrantVals(val71)
  const adj2 = getTableAdj(quadVal2)
  const f86Val = Math.round(Math.round(adj2 / 60) / 3)
  const f87Val = Math.round(denom1 * constants.k87Mult)
  const f88Val = f86Val + f87Val
  const [, signMultSec2, f85Val] = getSecondaryAdjParams(wrap21600(val71))
  const denom2 = f88Val + f85Val * signMultSec2
  const appliedAdj2 = denom2 !== 0 ? Math.round((adj2 * 60) / denom2) : 0
  const finalPos = wrap21600(posAfterAdj1) + appliedAdj2 * signMult2

  return wrap21600(finalPos)
}

function getSignIndex(finalPos: number): number {
  const signIndex = Math.floor(Math.trunc(finalPos / 1800))
  return signIndex === 12 ? 0 : signIndex
}

function calculateSunPrecisePosition(
  monthTh: number,
  yearBe: number,
  day: number,
  hour: number,
  minute: number,
): number {
  const G_VALS_SUN: Record<number, number> = { 0: 0.0, 1: 35.0, 2: 67.0, 3: 94.0, 4: 116.0, 5: 129.0, 6: 134.0 }
  const [, , , , solarPositionMean] = calculateBaseValues(monthTh, yearBe, day, hour, minute)
  const d26Raw = solarPositionMean - 4800
  const anomalyBaseB26 = wrap21600(d26Raw)
  const quadrant = Math.floor(Math.trunc(anomalyBaseB26 / 5400)) + 1
  const signMult = [1, 2].includes(quadrant) ? -1 : 1

  let quadrantValB28: number
  if (quadrant === 1) quadrantValB28 = anomalyBaseB26
  else if (quadrant === 2) quadrantValB28 = 10800 - anomalyBaseB26
  else if (quadrant === 3) quadrantValB28 = anomalyBaseB26 - 10800
  else quadrantValB28 = 21600 - anomalyBaseB26

  const e27Val = Math.floor(Math.trunc(quadrantValB28 / 900))
  const e28Val = e27Val + 1
  const gE27 = G_VALS_SUN[e27Val] ?? G_VALS_SUN[6]
  const gE28 = G_VALS_SUN[e28Val] ?? G_VALS_SUN[6]
  const interpFactor = quadrantValB28 / 900 - e27Val
  const sunAdjE29 = Math.floor(Math.trunc(interpFactor * (gE28 - gE27) + gE27))
  const d30Val = solarPositionMean + sunAdjE29 * signMult
  const finalPosB30 = wrap21600(d30Val)

  return finalPosB30
}

// Planet calculation functions
export function calculateUranus(monthTh: number, yearBe: number, day: number, hour: number, minute: number): number {
  const [, , solarCalcBase, solarPositionRaw] = calculateBaseValues(monthTh, yearBe, day, hour, minute)
  const g45 = Math.floor(Math.trunc(solarCalcBase / 84))
  const g47 = Math.floor(solarCalcBase / 7224)
  const initialPos = (g45 + g47 + 16277) % 21600
  const val51 = initialPos - 7440
  const [, quadVal1, signMult1] = getQuadrantVals(val51)
  const adj1 = getTableAdj(quadVal1)
  const [g66Val1, signMultSec1] = getSecondaryAdjParams(wrap21600(val51))
  const denom1 = 38640 + g66Val1 * signMultSec1
  const appliedAdj1 = denom1 !== 0 ? Math.round((adj1 * 60) / denom1) : 0
  const posAfterAdj1 = initialPos + appliedAdj1 * signMult1
  const val71 = wrap21600(posAfterAdj1) - solarPositionRaw
  const [, quadVal2, signMult2] = getQuadrantVals(val71)
  const adj2 = getTableAdj(quadVal2)
  const g86Val = Math.round(Math.round(adj2 / 60) / 3)
  const g87Val = Math.round((denom1 * 3) / 7)
  const g88Val = g86Val + g87Val
  const [, signMultSec2, g85Val] = getSecondaryAdjParams(wrap21600(val71))
  const denom2 = g88Val + g85Val * signMultSec2
  const appliedAdj2 = denom2 !== 0 ? Math.round((adj2 * 60) / denom2) : 0
  const finalPos = wrap21600(posAfterAdj1) + appliedAdj2 * signMult2
  const finalWrappedPos = wrap21600(finalPos)
  return getSignIndex(finalWrappedPos)
}

export function calculateKetu(monthTh: number, yearBe: number, day: number, hour: number, minute: number): number {
  const [relativeJulianDay, timeFraction] = calculateBaseValues(monthTh, yearBe, day, hour, minute)
  const i46Val = (relativeJulianDay - 1 - 344) % 679
  const i49Val = Math.trunc(((i46Val + timeFraction / 24) * 21600) / 679)
  const i50Val = i49Val % 21600
  const finalPos = wrap21600(21600 - i50Val)
  return getSignIndex(finalPos)
}

export function calculateRahu(monthTh: number, yearBe: number, day: number, hour: number, minute: number): number {
  const [, , solarCalcBase] = calculateBaseValues(monthTh, yearBe, day, hour, minute)
  const h45Val = Math.floor(solarCalcBase / 20)
  const h47Val = Math.floor(solarCalcBase / 265)
  const h49Val = h45Val + h47Val
  const h50Val = h49Val % 21600
  const finalPos = wrap21600(15150 - h50Val)
  return getSignIndex(finalPos)
}

export function calculateSaturn(monthTh: number, yearBe: number, day: number, hour: number, minute: number): number {
  const [, , solarCalcBase, solarPositionRaw] = calculateBaseValues(monthTh, yearBe, day, hour, minute)
  const f45 = Math.floor(Math.trunc(solarCalcBase / 30))
  const f47 = Math.floor((solarCalcBase * 6) / 10000)
  const initialPos = (f45 + f47 + 11944) % 21600
  const constants = { k51: 14820, k67Base: 3780, k87Mult: 7 / 6 }
  const finalPos = applyPlanetaryAdjustments(initialPos, solarPositionRaw, constants)
  return getSignIndex(finalPos)
}

export function calculateVenus(monthTh: number, yearBe: number, day: number, hour: number, minute: number): number {
  const [, , solarCalcBase, solarPositionRaw] = calculateBaseValues(monthTh, yearBe, day, hour, minute)
  const e45 = Math.floor(Math.trunc((solarCalcBase * 5) / 3))
  const e47 = Math.floor((solarCalcBase * 10) / 243)
  const venusMeanPos = (e45 - e47 + 10944) % 21600
  const val51 = solarPositionRaw - 4800
  const [, quadVal1, signMult1] = getQuadrantVals(val51)
  const adj1 = getTableAdj(quadVal1)
  const [g66Val1, signMultSec1] = getSecondaryAdjParams(wrap21600(val51))
  const denom1 = 19200 + g66Val1 * signMultSec1
  const appliedAdj1 = denom1 !== 0 ? Math.round((adj1 * 60) / denom1) : 0
  const posAfterAdj1 = solarPositionRaw + appliedAdj1 * signMult1
  const val71 = wrap21600(posAfterAdj1) - venusMeanPos
  const [, quadVal2, signMult2] = getQuadrantVals(val71)
  const adj2 = getTableAdj(quadVal2)
  const e86Val = Math.round(Math.round(adj2 / 60) / 3)
  const e87Val = 60 * 11
  const e88Val = e86Val + e87Val
  const [, signMultSec2, e85Val] = getSecondaryAdjParams(wrap21600(val71))
  const denom2 = e88Val + e85Val * signMultSec2
  const appliedAdj2 = denom2 !== 0 ? Math.round((adj2 * 60) / denom2) : 0
  const finalPos = wrap21600(posAfterAdj1) + appliedAdj2 * signMult2
  return getSignIndex(wrap21600(finalPos))
}

export function calculateJupiter(monthTh: number, yearBe: number, day: number, hour: number, minute: number): number {
  const [, , solarCalcBase, solarPositionRaw] = calculateBaseValues(monthTh, yearBe, day, hour, minute)
  const d45 = Math.floor(Math.trunc(solarCalcBase / 12))
  const d47 = Math.floor(solarCalcBase / 1032)
  const initialPos = (d45 + d47 + 14297) % 21600
  const constants = { k51: 10320, k67Base: 5520, k87Mult: 3 / 7 }
  const finalPos = applyPlanetaryAdjustments(initialPos, solarPositionRaw, constants)
  return getSignIndex(finalPos)
}

export function calculateMercury(monthTh: number, yearBe: number, day: number, hour: number, minute: number): number {
  const [, , solarCalcBase, solarPositionRaw] = calculateBaseValues(monthTh, yearBe, day, hour, minute)
  const c45 = Math.floor(Math.trunc((solarCalcBase * 7) / 46))
  const c47 = Math.floor(solarCalcBase * 4)
  const mercuryMeanPos = (c45 + c47 + 10642) % 21600
  const val51 = solarPositionRaw - 13200
  const [, quadVal1, signMult1] = getQuadrantVals(val51)
  const adj1 = getTableAdj(quadVal1)
  const [g66Val1, signMultSec1] = getSecondaryAdjParams(wrap21600(val51))
  const denom1 = 6000 + g66Val1 * signMultSec1
  const appliedAdj1 = denom1 !== 0 ? Math.round((adj1 * 60) / denom1) : 0
  const posAfterAdj1 = solarPositionRaw + appliedAdj1 * signMult1
  const val71 = wrap21600(posAfterAdj1) - mercuryMeanPos
  const [, quadVal2, signMult2] = getQuadrantVals(val71)
  const adj2 = getTableAdj(quadVal2)
  const c86Val = Math.round(Math.round(adj2 / 60) / 3)
  const c87Val = 60 * 21
  const c88Val = c86Val + c87Val
  const [, signMultSec2, c85Val] = getSecondaryAdjParams(wrap21600(val71))
  const denom2 = c88Val + c85Val * signMultSec2
  const appliedAdj2 = denom2 !== 0 ? Math.round((adj2 * 60) / denom2) : 0
  const finalPos = wrap21600(posAfterAdj1) + appliedAdj2 * signMult2
  return getSignIndex(wrap21600(finalPos))
}

export function calculateMars(monthTh: number, yearBe: number, day: number, hour: number, minute: number): number {
  const [, , solarCalcBase, solarPositionRaw] = calculateBaseValues(monthTh, yearBe, day, hour, minute)
  const b45 = Math.floor(Math.trunc(solarCalcBase / 2))
  const b47 = Math.floor((solarCalcBase * 16) / 505)
  const initialPos = (b45 + b47 + 5420) % 21600
  const constants = { k51: 7620, k67Base: 2700, k87Mult: 4 / 15 }
  const finalPos = applyPlanetaryAdjustments(initialPos, solarPositionRaw, constants)
  return getSignIndex(finalPos)
}

export function calculateMoon(monthTh: number, yearBe: number, day: number, hour: number, minute: number): number {
  const G_VALS_MOON: Record<number, number> = { 0: 0.0, 1: 77.0, 2: 148.0, 3: 209.0, 4: 256.0, 5: 286.0, 6: 296.0 }
  const [relativeJulianDay, timeFraction, , , solarPositionMean] = calculateBaseValues(
    monthTh,
    yearBe,
    day,
    hour,
    minute,
  )
  const b34Val = ((relativeJulianDay - 1) * 703 + 650 + Math.trunc((timeFraction * 703) / 24)) % 20760
  const b35Val = Math.floor(b34Val / 692)
  const b36Val = b34Val % 692
  const d33Val = b35Val * 720 + Math.trunc(1.04 * b36Val) - 40 + solarPositionMean
  const d34Val = wrap21600(d33Val)
  const d35Val = (relativeJulianDay - 1 - 621) % 3232
  const e36Val = Math.trunc(((d35Val + timeFraction / 24) / 3232) * 21600) + 2
  const d36Val = wrap21600(e36Val)
  const d37ValRaw = d34Val - d36Val
  const b37Val = wrap21600(d37ValRaw)
  const b38Val = Math.floor(Math.trunc(b37Val / 5400)) + 1
  const b40Val = [1, 2].includes(b38Val) ? -1 : 1

  let quadrantValB39: number
  if (b38Val === 1) quadrantValB39 = b37Val
  else if (b38Val === 2) quadrantValB39 = 10800 - b37Val
  else if (b38Val === 3) quadrantValB39 = b37Val - 10800
  else quadrantValB39 = 21600 - b37Val

  const e38Val = Math.floor(Math.trunc(quadrantValB39 / 900))
  const e39Val = e38Val + 1
  const gE38 = G_VALS_MOON[e38Val] ?? G_VALS_MOON[6]
  const gE39 = G_VALS_MOON[e39Val] ?? G_VALS_MOON[6]
  const interpFactorE40 = quadrantValB39 / 900 - e38Val
  const e40Val = Math.floor(Math.trunc(interpFactorE40 * (gE39 - gE38) + gE38))
  const d42Val = d34Val + e40Val * b40Val
  const b42Val = wrap21600(d42Val)
  const b43Val = Math.floor(b42Val / 1800)
  const finalSignIndex = b43Val < 12 ? b43Val : 0
  return finalSignIndex
}

export function calculateSun(monthTh: number, yearBe: number, day: number, hour: number, minute: number): number {
  const finalPosB30 = calculateSunPrecisePosition(monthTh, yearBe, day, hour, minute)
  return getSignIndex(finalPosB30)
}

export function calculateSunDegrees(
  monthTh: number,
  yearBe: number,
  day: number,
  hour: number,
  minute: number,
): number {
  const finalPosB30 = calculateSunPrecisePosition(monthTh, yearBe, day, hour, minute)
  const f30Val = finalPosB30 % 1800
  const d31Val = Math.trunc(f30Val / 60)
  return d31Val
}

export function calculateSunMinutes(
  monthTh: number,
  yearBe: number,
  day: number,
  hour: number,
  minute: number,
): number {
  const finalPosB30 = calculateSunPrecisePosition(monthTh, yearBe, day, hour, minute)
  const f30Val = finalPosB30 % 1800
  const f31Val = Math.trunc(f30Val % 60)
  return f31Val
}

export function calculateAscendant(
  day: number,
  monthTh: number,
  yearBe: number,
  hour: number,
  minute: number,
  province: string,
): number {
  const sunPrecisePosB30 = calculateSunPrecisePosition(monthTh, yearBe, day, hour, minute)
  const sunSignIndex = Math.floor(Math.trunc(sunPrecisePosB30 / 1800))
  const sunPosInSignMinutesArc = sunPrecisePosB30 % 1800
  const sunDegreesInSign = Math.trunc(sunPosInSignMinutesArc / 60)
  const sunMinutesInDegree = Math.trunc(sunPosInSignMinutesArc % 60)
  const provinceOffsetMin = PROVINCE_TIME_OFFSETS[province] ?? 18
  const localTimeMin = hour * 60 + minute
  const cumulativeDurationAtSunSignStart = SIGN_DURATIONS_MINUTES.slice(0, sunSignIndex).reduce(
    (sum, duration) => sum + duration,
    0,
  )
  const sunProgressTotalDegrees = sunDegreesInSign + sunMinutesInDegree / 60
  const sunSignDuration = SIGN_DURATIONS_MINUTES[sunSignIndex]
  const sunDurationInCurrentSign = sunSignDuration > 0 ? sunSignDuration * (sunProgressTotalDegrees / 30) : 0
  const sunTotalProgressionMin = cumulativeDurationAtSunSignStart + sunDurationInCurrentSign
  const sunriseTimeMinutes = 360 + provinceOffsetMin
  let j19Val = (localTimeMin - sunriseTimeMinutes) % 1440
  if (j19Val < 0) j19Val += 1440
  let ascendantTimeMin = (sunTotalProgressionMin + j19Val) % 1440
  if (ascendantTimeMin < 0) ascendantTimeMin += 1440

  let ascendantSignIndex = 0
  let cumulativeTime = 0.0
  let degreesInAscendantSign = 0.0

  for (let i = 0; i < SIGN_DURATIONS_MINUTES.length; i++) {
    const signDuration = SIGN_DURATIONS_MINUTES[i]
    if (signDuration <= 0) continue

    const startOfSign = cumulativeTime
    const endOfSign = cumulativeTime + signDuration

    let fallsInSign = false
    if (startOfSign < endOfSign) {
      if (ascendantTimeMin >= startOfSign && ascendantTimeMin < endOfSign) {
        fallsInSign = true
      }
    } else {
      if (ascendantTimeMin >= startOfSign || ascendantTimeMin < endOfSign) {
        fallsInSign = true
      }
    }

    if (fallsInSign) {
      ascendantSignIndex = i
      let timeIntoAscendantSign = (ascendantTimeMin - startOfSign) % 1440
      if (timeIntoAscendantSign < 0) timeIntoAscendantSign += 1440
      degreesInAscendantSign = (timeIntoAscendantSign * 30) / signDuration
      break
    }

    cumulativeTime = endOfSign % 1440
  }

  const k35Val = (ascendantSignIndex * 30 + degreesInAscendantSign) * 60
  const k36Val = Math.trunc(k35Val / 1800)
  return k36Val
}

export function calculateTanuseth(positions: Record<string, number>, ascSign: number): number {
  try {
    const lord1Idx = MAP_PLANETS[ascSign]
    const lord1Name = SIGN_PLANETS[lord1Idx]
    const sign1 = positions[lord1Name]

    const lord2Idx = MAP_PLANETS[sign1]
    const lord2Name = SIGN_PLANETS[lord2Idx]
    const sign2 = positions[lord2Name]

    const m36 = ((sign1 - ascSign) % 12) + 1
    const m38 = ((sign2 - sign1) % 12) + 1

    const result = (m36 * m38) % 7 || 7
    return result
  } catch {
    return -1
  }
}

export function calculateAllPositions(input: CalculationInput): CalculationResult {
  const { day, monthTh, yearBe, yearBc, hour, minute, province } = input
  const normalizedYearBe = resolveYearBe(yearBe, yearBc)

  const positions: PlanetPositions = {
    ascendant: calculateAscendant(day, monthTh, normalizedYearBe, hour, minute, province),
    sun: calculateSun(monthTh, normalizedYearBe, day, hour, minute),
    moon: calculateMoon(monthTh, normalizedYearBe, day, hour, minute),
    mars: calculateMars(monthTh, normalizedYearBe, day, hour, minute),
    mercury: calculateMercury(monthTh, normalizedYearBe, day, hour, minute),
    jupiter: calculateJupiter(monthTh, normalizedYearBe, day, hour, minute),
    venus: calculateVenus(monthTh, normalizedYearBe, day, hour, minute),
    saturn: calculateSaturn(monthTh, normalizedYearBe, day, hour, minute),
    rahu: calculateRahu(monthTh, normalizedYearBe, day, hour, minute),
    ketu: calculateKetu(monthTh, normalizedYearBe, day, hour, minute),
    uranus: calculateUranus(monthTh, normalizedYearBe, day, hour, minute),
  }

  const planetPositionsForTanuseth = {
    ลัคนา: positions.ascendant,
    อาทิตย์: positions.sun,
    จันทร์: positions.moon,
    อังคาร: positions.mars,
    พุธ: positions.mercury,
    พฤหัสบดี: positions.jupiter,
    ศุกร์: positions.venus,
    เสาร์: positions.saturn,
    ราหู: positions.rahu,
    เกตุ: positions.ketu,
    มฤตยู: positions.uranus,
  }

  const tanuseth = calculateTanuseth(planetPositionsForTanuseth, positions.ascendant)
  const sunDeg = calculateSunDegrees(monthTh, normalizedYearBe, day, hour, minute)
  const sunMin = calculateSunMinutes(monthTh, normalizedYearBe, day, hour, minute)

  // Generate channel outputs
  const outputArray: string[] = new Array(13).fill("")

  if (tanuseth !== -1) {
    for (let ch = 0; ch < 12; ch++) {
      let channelOutput = ""

      // Check each planet for this channel
      Object.entries(positions).forEach(([planetKey, position]) => {
        if (position === ch) {
          const [symbol, tanusethNum] = PLANET_SYMBOLS[planetKey]
          channelOutput += symbol
          if (tanusethNum !== null && tanuseth === tanusethNum) {
            channelOutput += "*"
          }
        }
      })

      outputArray[ch] = channelOutput
    }
  }

  return {
    positions,
    tanuseth,
    channelOutputs: outputArray.slice(0, 12),
    sunPosition: [sunDeg, sunMin],
  }
}
