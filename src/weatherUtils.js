// ─── Temperature helpers ──────────────────────────────────────────────────────

/** Converts Celsius to Fahrenheit */
function celsiusToFahrenheit(celsius) {
  return Math.round((celsius * 9) / 5 + 32);
}

/** Converts Fahrenheit to Celsius */
function fahrenheitToCelsius(f) {
  return Math.round(((f - 32) * 5) / 9);
}

/** Returns a human-readable label for a temperature in Celsius */
function classifyTemperature(celsius) {
  if (celsius <= 0) return "Freezing";
  if (celsius < 10) return "Cold";
  if (celsius < 20) return "Cool";
  if (celsius < 30) return "Warm";
  return "Hot";
}

// ─── Data processing ──────────────────────────────────────────────────────────

/** Filters out null values from an array */
function filterNulls(arr) {
  return arr.filter((v) => v !== null);
}

/** Calculates the average of a numeric array (ignores nulls) */
function calcAverage(values) {
  const clean = filterNulls(values);
  if (clean.length === 0) throw new Error("Cannot calculate average of empty array");
  return parseFloat((clean.reduce((a, b) => a + b, 0) / clean.length).toFixed(2));
}

/** Returns the max value from a numeric array (ignores nulls) */
function calcMax(values) {
  const clean = filterNulls(values);
  if (clean.length === 0) throw new Error("Cannot calculate max of empty array");
  return Math.max(...clean);
}

/** Returns the min value from a numeric array (ignores nulls) */
function calcMin(values) {
  const clean = filterNulls(values);
  if (clean.length === 0) throw new Error("Cannot calculate min of empty array");
  return Math.min(...clean);
}

// ─── Forecast helpers ─────────────────────────────────────────────────────────

/** Filters hourly data to a specific date (YYYY-MM-DD) */
function filterHourlyByDate(hourly, date) {
  const indices = hourly.time
    .map((t, i) => (t.startsWith(date) ? i : -1))
    .filter((i) => i !== -1);

  const result = {
    time:           indices.map((i) => hourly.time[i]),
    temperature_2m: indices.map((i) => hourly.temperature_2m[i]),
  };

  if (hourly.precipitation_probability) {
    result.precipitation_probability = indices.map((i) => hourly.precipitation_probability[i]);
  }

  if (hourly.wind_speed_10m) {
    result.wind_speed_10m = indices.map((i) => hourly.wind_speed_10m[i]);
  }

  return result;
}

/** Builds a weather summary object from daily data at a given index */
function buildDailySummary(daily, index) {
  if (index < 0 || index >= daily.time.length)
    throw new RangeError(`Index ${index} is out of bounds`);

  const max    = daily.temperature_2m_max[index];
  const min    = daily.temperature_2m_min[index];
  const precip = daily.precipitation_sum[index];

  if (max === null || min === null)
    throw new Error("Temperature data is null for this day");

  return {
    date:               daily.time[index],
    avgTemp:            parseFloat(((max + min) / 2).toFixed(2)),
    maxTemp:            max,
    minTemp:            min,
    totalPrecipitation: precip !== null ? precip : 0,
  };
}

/** Returns true if average precipitation probability >= 50% */
function isRainyDay(precipProbabilities) {
  const clean = filterNulls(precipProbabilities);
  if (clean.length === 0) return false;
  const avg = clean.reduce((a, b) => a + b, 0) / clean.length;
  return avg >= 50;
}

module.exports = {
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
};