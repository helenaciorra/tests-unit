const {
  celsiusToFahrenheit,
  fahrenheitToCelsius,
  classifyTemperature,
  filterNulls,
  calcAverage,
  calcMax,
  calcMin,
  filterHourlyByDate,
  buildDailySummary,
  isRainyDay,
} = require("./weatherUtils");

// Shared test data representing realistic Open-Meteo API responses

const mockHourly = {
  time: [
    "2024-06-01T00:00", "2024-06-01T06:00", "2024-06-01T12:00", "2024-06-01T18:00",
    "2024-06-02T00:00", "2024-06-02T06:00",
  ],
  temperature_2m: [18, 20, 28, 25, 17, null],
  precipitation_probability: [10, 20, 80, 60, 30, null],
};

const mockDaily = {
  time: ["2024-06-01", "2024-06-02", "2024-06-03"],
  temperature_2m_max:  [30,  25, null],
  temperature_2m_min:  [18,  15, null],
  precipitation_sum:   [5.2, 0,  null],
};

// Temperature conversion: Celsius <> Fahrenheit across common reference points, including inverse relationship with celsiusToFahrenheit

describe("celsiusToFahrenheit()", () => {
  it.each([
    [0,   32 ],
    [100, 212],
    [-40, -40],
    [37,  99 ],
    [20,  68 ],
  ])("%d°C → %d°F", (celsius, expected) => {
    expect(celsiusToFahrenheit(celsius)).toBe(expected);
  });
});

describe("fahrenheitToCelsius()", () => {
  it.each([
    [32,  0  ],
    [212, 100],
    [-40, -40],
    [68,  20 ],
  ])("%d°F → %d°C", (f, expected) => {
    expect(fahrenheitToCelsius(f)).toBe(expected);
  });

  it("is inverse of celsiusToFahrenheit", () => {
    expect(fahrenheitToCelsius(celsiusToFahrenheit(25))).toBe(25);
  });
});

// Temperature classification: labels across all defined ranges, including boundary at 0°C

describe("classifyTemperature()", () => {
  it.each([
    [-10, "Freezing"],
    [0,   "Freezing"],
    [5,   "Cold"    ],
    [15,  "Cool"    ],
    [25,  "Warm"    ],
    [35,  "Hot"     ],
  ])("%d°C → '%s'", (temp, label) => {
    expect(classifyTemperature(temp)).toBe(label);
  });
});

// Null filtering: removal of null values from mixed arrays of different types

describe("filterNulls()", () => {
  it("removes null values from array", () => {
    expect(filterNulls([1, null, 2, null, 3])).toEqual([1, 2, 3]);
  });

  it("returns same array when no nulls", () => {
    expect(filterNulls([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it("returns empty array when all nulls", () => {
    expect(filterNulls([null, null])).toEqual([]);
  });

  it("works with strings", () => {
    expect(filterNulls(["a", null, "b"])).toEqual(["a", "b"]);
  });
});

// Average calculation: correct result, null handling, rounding, and error on empty input

describe("calcAverage()", () => {
  it("calculates average correctly", () => {
    expect(calcAverage([10, 20, 30])).toBe(20);
  });

  it("ignores null values", () => {
    expect(calcAverage([10, null, 30])).toBe(20);
  });

  it("returns value rounded to 2 decimal places", () => {
    expect(calcAverage([1, 2, 3, 4])).toBe(2.5);
  });

  it("throws for empty array", () => {
    expect(() => calcAverage([])).toThrow();
  });

  it("throws when all values are null", () => {
    expect(() => calcAverage([null, null])).toThrow();
  });
});

// Maximum and Minimum value: correct result, null handling, and error on empty input

describe("calcMax()", () => {
  it("returns max value", () => {
    expect(calcMax([5, 10, 3, 8])).toBe(10);
  });

  it("ignores nulls", () => {
    expect(calcMax([null, 5, null, 10])).toBe(10);
  });

  it("throws for empty array", () => {
    expect(() => calcMax([])).toThrow();
  });
});

describe("calcMin()", () => {
  it("returns min value", () => {
    expect(calcMin([5, 10, 3, 8])).toBe(3);
  });

  it("ignores nulls", () => {
    expect(calcMin([null, 5, null, 1])).toBe(1);
  });

  it("throws for empty array", () => {
    expect(() => calcMin([])).toThrow();
  });
});

// Hourly data filtering: date-based slicing, unknown dates, and optional field propagation

describe("filterHourlyByDate()", () => {
  it("returns only entries matching the given date", () => {
    const result = filterHourlyByDate(mockHourly, "2024-06-01");
    expect(result.time).toHaveLength(4);
    result.time.forEach((t) => expect(t).toMatch(/^2024-06-01/));
  });

  it("returns empty arrays for a date not in the data", () => {
    const result = filterHourlyByDate(mockHourly, "2099-01-01");
    expect(result.time).toHaveLength(0);
    expect(result.temperature_2m).toHaveLength(0);
  });

  it("carries through optional precipitation_probability", () => {
    const result = filterHourlyByDate(mockHourly, "2024-06-01");
    expect(result.precipitation_probability).toBeDefined();
    expect(result.precipitation_probability).toHaveLength(4);
  });

  it("carries through optional wind_speed_10m", () => {
    const hourlyWithWind = {
    time: mockHourly.time,
    temperature_2m: mockHourly.temperature_2m,
    wind_speed_10m: [12, 15, 20, 18, 10, null],
    };
  
    const result = filterHourlyByDate(hourlyWithWind, "2024-06-01");
    expect(result.wind_speed_10m).toBeDefined();
    expect(result.wind_speed_10m).toHaveLength(4);
  });
});

// Daily summary builder: full object shape, null precipitation fallback, out-of-bounds index, and null temperature guard

describe("buildDailySummary()", () => {
  it("builds correct summary for index 0", () => {
    const summary = buildDailySummary(mockDaily, 0);
    expect(summary).toEqual({
      date:               "2024-06-01",
      avgTemp:            24,
      maxTemp:            30,
      minTemp:            18,
      totalPrecipitation: 5.2,
    });
  });

  it("uses 0 for precipitation when null", () => {
    const daily = {
      time:               ["2024-06-05"],
      temperature_2m_max: [28],
      temperature_2m_min: [18],
      precipitation_sum:  [null],
    };
    expect(buildDailySummary(daily, 0).totalPrecipitation).toBe(0);
  });

  it("throws RangeError for out-of-bounds index", () => {
    expect(() => buildDailySummary(mockDaily, 99)).toThrow(RangeError);
    expect(() => buildDailySummary(mockDaily, -1)).toThrow(RangeError);
  });

  it("throws when temperature data is null", () => {
    expect(() => buildDailySummary(mockDaily, 2)).toThrow("Temperature data is null");
  });
});

// Rain detection: average probability threshold at 50%, null handling, and empty input edge cases

describe("isRainyDay()", () => {
  it("returns true when average probability >= 50%", () => {
    expect(isRainyDay([50, 80, 60])).toBe(true);
  });

  it("returns false when average probability < 50%", () => {
    expect(isRainyDay([10, 20, 30])).toBe(false);
  });

  it("ignores null values in calculation", () => {
    expect(isRainyDay([null, 80, 60])).toBe(true);
  });

  it("returns false for empty array", () => {
    expect(isRainyDay([])).toBe(false);
  });

  it("returns false when all values are null", () => {
    expect(isRainyDay([null, null])).toBe(false);
  });
});