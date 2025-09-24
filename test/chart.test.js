'use strict'

const assert = require('node:assert/strict')

const {
  generateThaiAstrologyChart,
  formatChannelOutputs,
  thlDate,
  thLunarHoliday,
  thlDateFromCivil,
  thLunarHolidayFromCivil,
  createThaiDate,
} = require('../dist')

const SAMPLE_INPUT = {
  day: 15,
  monthTh: 9,
  yearBe: 2566,
  hour: 14,
  minute: 45,
  province: 'กรุงเทพมหานคร',
}

const EXPECTED_ARABIC_CHANNELS = [
  '58',
  '0',
  '9',
  '6',
  '14',
  '23',
  '',
  '',
  'L',
  '',
  '7*',
  '',
]

const EXPECTED_THAI_CHANNELS = [
  '๕๘',
  '๐',
  '๙',
  '๖',
  '๑๔',
  '๒๓',
  '',
  '',
  'ลั',
  '',
  '๗*',
  '',
]

function testSunPosition() {
  const chart = generateThaiAstrologyChart(SAMPLE_INPUT)
  assert.deepEqual(chart.sunPosition, [27, 29])
}

function testFormatChannelOutputs() {
  const chart = generateThaiAstrologyChart(SAMPLE_INPUT)

  assert.deepEqual(formatChannelOutputs(chart), EXPECTED_ARABIC_CHANNELS)
  assert.deepEqual(formatChannelOutputs(chart, 'arabic'), EXPECTED_ARABIC_CHANNELS)
  assert.deepEqual(formatChannelOutputs(chart, 'thai'), EXPECTED_THAI_CHANNELS)
}

function testThaiCivilDateHelpers() {
  const civilInput = { year: 2568, month: 9, day: 24 }

  const viaObject = thlDateFromCivil(civilInput)
  const viaDate = thlDate(createThaiDate(civilInput))

  assert.equal(viaObject, viaDate)
  assert.equal(viaObject, thlDate(civilInput))

  const ceInput = { year: 2025, month: 11, day: 5, calendar: 'CE' }
  assert.equal(thLunarHolidayFromCivil(ceInput), 'วันลอยกระทง')
  assert.equal(thLunarHoliday(createThaiDate({ year: 2568, month: 11, day: 5 })), 'วันลอยกระทง')
}

function run() {
  const tests = [
    ['generateThaiAstrologyChart returns expected sun position', testSunPosition],
    ['formatChannelOutputs renders arabic and thai numerals as expected', testFormatChannelOutputs],
    ['civil date helpers align with Date inputs', testThaiCivilDateHelpers],
  ]

  let passed = 0

  for (const [name, fn] of tests) {
    try {
      fn()
      console.log(`PASS ${name}`)
      passed += 1
    } catch (error) {
      console.error(`FAIL ${name}`)
      console.error(error)
      process.exitCode = 1
      break
    }
  }

  if (passed === tests.length) {
    console.log(`All ${passed} tests passed.`)
  }
}

if (require.main === module) {
  run()
}

module.exports = {
  run,
}
