# Unit Test Suite

Unit tests for data processing utilities that handle [Open-Meteo API](https://open-meteo.com/) responses — covering temperature conversion, null handling, data aggregation, and forecast summarisation.

![Unit Tests](https://github.com/helenaciorra/tests-unit/actions/workflows/unit-tests.yml/badge.svg)

---

## Stack

| Tool       | Version | Role                     |
|------------|---------|--------------------------|
| JavaScript | ES2020  | No transpilation needed  |
| Jest       | ^29.7   | Test runner + assertions |

---

## Structure

```
tests-unit/
├── src/
│   ├── weatherUtils.js       # Utility functions under test
│   └── weatherUtils.test.js  # Full test suite (44 tests)
├── .github/
│   └── workflows/
│       └── unit-tests.yml    # CI/CD — runs on every push
├── jest.config.js            # Coverage thresholds enforced
└── package.json
```

---

## Functions tested

| Function                | What it does                                               |
|-------------------------|------------------------------------------------------------|
| `celsiusToFahrenheit()` | Converts °C to °F across common reference points          |
| `fahrenheitToCelsius()` | Converts °F to °C, verified as inverse of the above       |
| `classifyTemperature()` | Returns a human-readable label for a given temperature     |
| `filterNulls()`         | Removes null values from mixed-type arrays                 |
| `calcAverage()`         | Mean of a numeric array, ignoring nulls                    |
| `calcMax()`             | Maximum value, ignoring nulls                              |
| `calcMin()`             | Minimum value, ignoring nulls                              |
| `filterHourlyByDate()`  | Slices hourly data to a specific date, propagates optional fields |
| `buildDailySummary()`   | Builds a summary object from daily forecast data           |
| `isRainyDay()`          | Detects rainy days based on average precipitation probability |

---

## Scenarios covered

**Temperature conversion**
- ✅ Celsius to Fahrenheit across common reference points (0°, 100°, −40°, 37°, 20°)
- ✅ Fahrenheit to Celsius with the same reference set
- ✅ Inverse relationship: `fahrenheitToCelsius(celsiusToFahrenheit(x)) === x`

**Temperature classification**
- ✅ All defined ranges: Freezing, Cold, Cool, Warm, Hot
- ✅ Boundary at 0°C classified as Freezing (inclusive `<= 0`)

**Null filtering**
- ✅ Removes nulls from numeric and string arrays
- ✅ Returns original array unchanged when no nulls present
- ✅ Returns empty array when all values are null

**Data aggregation (average, max, min)**
- ✅ Correct result for clean arrays
- ✅ Null values ignored in all calculations
- ✅ Result rounded to 2 decimal places (average)
- ✅ Throws on empty array and on all-null array

**Hourly data filtering**
- ✅ Returns only entries matching the requested date
- ✅ Returns empty arrays for dates not present in the data
- ✅ Propagates optional `precipitation_probability` field
- ✅ Propagates optional `wind_speed_10m` field

**Daily summary builder**
- ✅ Full object shape: `date`, `avgTemp`, `maxTemp`, `minTemp`, `totalPrecipitation`
- ✅ Falls back to `0` when `precipitation_sum` is null
- ✅ Throws `RangeError` for out-of-bounds index (positive and negative)
- ✅ Throws `Error` when temperature data is null

**Rain detection**
- ✅ Returns `true` when average probability ≥ 50%
- ✅ Returns `false` when average probability < 50%
- ✅ Ignores null values in probability calculation
- ✅ Returns `false` for empty array and all-null array

---

## Technical decisions

**Coverage enforced as a CI gate** — `coverageThreshold` in `jest.config.js` makes Jest fail if coverage drops below 90% for lines and functions, and 80% for branches. If any PR introduces untested code, it will fail the pipeline.

**100% coverage achieved and maintained** — during development, the coverage report flagged line 68 (`wind_speed_10m` propagation in `filterHourlyByDate`) as uncovered. A dedicated test was added to exercise that branch, bringing all metrics to 100%.

**`it.each` for conversion and classification tests** — functions like `celsiusToFahrenheit` and `classifyTemperature` have multiple discrete input/output pairs. `it.each` expresses these as a table, generates descriptive test names automatically (e.g. `0°C → 32°F`), and avoids duplicating identical test structure.

**Inverse relationship test** — `fahrenheitToCelsius(celsiusToFahrenheit(25)) === 25` verifies a mathematical property that fixed-value tests alone cannot guarantee. This is a solution that eliminates the need to install a dedicated library.

**Shared fixtures declared at file scope** — `mockHourly` and `mockDaily` are defined once at the top of the test file and reused across all `describe` blocks. This avoids recreating identical objects per test and makes it clear which data is shared across groups.

**`RangeError` over generic `Error`** — `buildDailySummary` throws `RangeError` specifically for out-of-bounds index access, not a generic `Error`. This allows callers to distinguish between programming mistakes (wrong index) and data issues (null temperature). The test asserts the specific error type with `toThrow(RangeError)`.

**0°C boundary decision** — the initial implementation used `celsius < 0` to classify Freezing, which placed 0°C in the Cold category. After the test revealed this, the boundary was changed to `celsius <= 0`.

**Null handling as a first-class concern** — the Open-Meteo API returns `null` for unavailable data points rather than omitting the field. Every aggregation function (`calcAverage`, `calcMax`, `calcMin`, `isRainyDay`) is explicitly tested against arrays containing nulls, all-null arrays, and empty arrays, ensuring none of them fail silently on real API data.

---

## How to run

```bash
npm install
npm test          # run all tests with coverage
npm run test:watch  # interactive watch mode
```

Coverage report is generated at `./coverage/index.html` after each run.

---

## CI/CD

The GitHub Actions workflow runs automatically on every push to `main` or `develop` and on pull requests to `main`. The coverage report is uploaded as an artifact after each run and retained for 15 days.
