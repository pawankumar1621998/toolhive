"use client";

import { useState, useEffect } from "react";
import { Tool } from "@/types";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import {
  MapPin,
  Globe,
  Plane,
  DollarSign,
  ArrowRight,
  Clock,
  Check,
  Loader2,
} from "lucide-react";
import { useAIGenerate } from "@/hooks/useAIGenerate";

// Shared styles
const inputClass =
  "w-full border border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-orange-500/30";
const cardClass =
  "rounded-xl border border-card-border bg-background-subtle p-4";
const primaryBtn =
  "h-11 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed";

// City data with coordinates
const CITIES: Record<string, { lat: number; lng: number; country: string }> = {
  "New York": { lat: 40.7128, lng: -74.006, country: "USA" },
  "Los Angeles": { lat: 34.0522, lng: -118.2437, country: "USA" },
  London: { lat: 51.5074, lng: -0.1278, country: "UK" },
  Paris: { lat: 48.8566, lng: 2.3522, country: "France" },
  Tokyo: { lat: 35.6762, lng: 139.6503, country: "Japan" },
  Sydney: { lat: -33.8688, lng: 151.2093, country: "Australia" },
  Dubai: { lat: 25.2048, lng: 55.2708, country: "UAE" },
  Singapore: { lat: 1.3521, lng: 103.8198, country: "Singapore" },
  "Hong Kong": { lat: 22.3193, lng: 114.1694, country: "China" },
  Mumbai: { lat: 19.076, lng: 72.8777, country: "India" },
  Berlin: { lat: 52.52, lng: 13.405, country: "Germany" },
  Toronto: { lat: 43.6532, lng: -79.3832, country: "Canada" },
  "San Francisco": { lat: 37.7749, lng: -122.4194, country: "USA" },
  Chicago: { lat: 41.8781, lng: -87.6298, country: "USA" },
  Miami: { lat: 25.7617, lng: -80.1918, country: "USA" },
  Bangkok: { lat: 13.7563, lng: 100.5018, country: "Thailand" },
  Istanbul: { lat: 41.0082, lng: 28.9784, country: "Turkey" },
  Rome: { lat: 41.9028, lng: 12.4964, country: "Italy" },
  Madrid: { lat: 40.4168, lng: -3.7038, country: "Spain" },
  Amsterdam: { lat: 52.3676, lng: 4.9041, country: "Netherlands" },
};

// Haversine formula for distance calculation
const haversineDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Estimate travel time based on distance
const estimateTravelTime = (distanceKm: number): { hours: number; minutes: number } => {
  // Average flight speed: 900 km/h + 2 hours for takeoff/landing
  const flightHours = distanceKm / 900;
  const totalHours = flightHours + 2;
  return {
    hours: Math.floor(totalHours),
    minutes: Math.round((totalHours % 1) * 60),
  };
};

function TripDistance() {
  const [city1, setCity1] = useState("");
  const [city2, setCity2] = useState("");
  const [result, setResult] = useState<{
    distance: number;
    travelTime: { hours: number; minutes: number };
    city1Data: { lat: number; lng: number; country: string };
    city2Data: { lat: number; lng: number; country: string };
  } | null>(null);

  const handleCalculate = () => {
    if (!CITIES[city1] || !CITIES[city2]) {
      return;
    }

    const city1Data = CITIES[city1];
    const city2Data = CITIES[city2];
    const distance = Math.round(
      haversineDistance(city1Data.lat, city1Data.lng, city2Data.lat, city2Data.lng)
    );
    const travelTime = estimateTravelTime(distance);

    setResult({ distance, travelTime, city1Data, city2Data });
  };

  return (
    <div className="space-y-6">
      <div className={cardClass}>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-orange-500" />
          Trip Distance Calculator
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground-secondary">
              From City
            </label>
            <select
              value={city1}
              onChange={(e) => setCity1(e.target.value)}
              className={inputClass}
            >
              <option value="">Select city</option>
              {Object.keys(CITIES).map((city) => (
                <option key={city} value={city}>
                  {city}, {CITIES[city].country}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
              <ArrowRight className="w-6 h-6 text-orange-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground-secondary">
              To City
            </label>
            <select
              value={city2}
              onChange={(e) => setCity2(e.target.value)}
              className={inputClass}
            >
              <option value="">Select city</option>
              {Object.keys(CITIES).map((city) => (
                <option key={city} value={city}>
                  {city}, {CITIES[city].country}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleCalculate}
          disabled={!city1 || !city2}
          className={clsx("mt-4 w-full", primaryBtn)}
        >
          Calculate Distance
        </button>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={cardClass}>
              <div className="text-sm text-foreground-muted mb-1">Origin</div>
              <div className="text-xl font-bold">{city1}</div>
              <div className="text-sm text-foreground-muted">
                {result.city1Data.country}
              </div>
            </div>
            <div className={cardClass}>
              <div className="text-sm text-foreground-muted mb-1">Destination</div>
              <div className="text-xl font-bold">{city2}</div>
              <div className="text-sm text-foreground-muted">
                {result.city2Data.country}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={cardClass}>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <MapPin className="w-7 h-7 text-orange-500" />
                </div>
                <div>
                  <div className="text-sm text-foreground-muted">Total Distance</div>
                  <div className="text-3xl font-bold">
                    {result.distance.toLocaleString()}
                    <span className="text-lg text-foreground-muted ml-1">km</span>
                  </div>
                </div>
              </div>
            </div>
            <div className={cardClass}>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Plane className="w-7 h-7 text-blue-500" />
                </div>
                <div>
                  <div className="text-sm text-foreground-muted">Estimated Flight Time</div>
                  <div className="text-3xl font-bold">
                    {result.travelTime.hours}h {result.travelTime.minutes}m
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Visual representation */}
          <div className={cardClass}>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="text-4xl mb-2">🌍</div>
                <div className="font-semibold">{city1}</div>
              </div>
              <div className="flex-1 mx-4">
                <div className="h-2 bg-gradient-to-r from-orange-500 via-blue-500 to-green-500 rounded-full" />
                <div className="text-center text-sm text-foreground-muted mt-2">
                  {result.distance.toLocaleString()} km
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">🏁</div>
                <div className="font-semibold">{city2}</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Timezone data
const TIMEZONES: Record<string, { offset: number; cities: string[] }> = {
  "America/New_York": { offset: -5, cities: ["New York", "Boston", "Miami", "Washington D.C."] },
  "America/Los_Angeles": { offset: -8, cities: ["Los Angeles", "San Francisco", "Seattle", "Las Vegas"] },
  "America/Chicago": { offset: -6, cities: ["Chicago", "Dallas", "Houston", "Denver"] },
  "Europe/London": { offset: 0, cities: ["London", "Dublin", "Lisbon"] },
  "Europe/Paris": { offset: 1, cities: ["Paris", "Berlin", "Amsterdam", "Madrid", "Rome"] },
  "Europe/Moscow": { offset: 3, cities: ["Moscow", "Istanbul", "Dubai"] },
  "Asia/Tokyo": { offset: 9, cities: ["Tokyo", "Seoul", "Beijing"] },
  "Asia/Shanghai": { offset: 8, cities: ["Shanghai", "Hong Kong", "Singapore"] },
  "Asia/Mumbai": { offset: 5.5, cities: ["Mumbai", "Delhi", "Bangalore"] },
  "Australia/Sydney": { offset: 10, cities: ["Sydney", "Melbourne", "Brisbane"] },
};

function WorldTimezoneConverter() {
  const [baseCity, setBaseCity] = useState("New York");
  const [baseTime, setBaseTime] = useState("12:00");
  const [baseAmPm, setBaseAmPm] = useState("PM");

  const getTimeInZone = (
    city: string,
    baseCityName: string,
    baseTimeValue: string,
    baseAmPmValue: string
  ): { hours: number; minutes: number; ampm: string; timeStr: string } => {
    // Find base timezone
    let baseOffset = 0;
    for (const [tz, data] of Object.entries(TIMEZONES)) {
      if (data.cities.includes(baseCityName)) {
        baseOffset = data.offset;
        break;
      }
    }

    // Find target timezone
    let targetOffset = 0;
    for (const [tz, data] of Object.entries(TIMEZONES)) {
      if (data.cities.includes(city)) {
        targetOffset = data.offset;
        break;
      }
    }

    // Calculate offset difference
    const diff = targetOffset - baseOffset;

    // Parse base time
    let [hours, minutes] = baseTimeValue.split(":").map(Number);
    if (baseAmPmValue === "PM" && hours !== 12) hours += 12;
    if (baseAmPmValue === "AM" && hours === 12) hours = 0;

    // Apply offset
    let totalMinutes = hours * 60 + minutes + diff * 60;
    if (totalMinutes < 0) totalMinutes += 24 * 60;
    totalMinutes = totalMinutes % (24 * 60);

    const resultHours = Math.floor(totalMinutes / 60);
    const resultMinutes = totalMinutes % 60;
    const isPm = resultHours >= 12;
    const displayHours = isPm ? (resultHours % 12 || 12) : (resultHours % 12 || 12);

    return {
      hours: resultHours,
      minutes: resultMinutes,
      ampm: isPm ? "PM" : "AM",
      timeStr: `${displayHours}:${String(resultMinutes).padStart(2, "0")}`,
    };
  };

  const allCities = Object.values(TIMEZONES).flatMap((tz) => tz.cities);

  return (
    <div className="space-y-6">
      <div className={cardClass}>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-500" />
          World Timezone Converter
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground-secondary">
              Base City
            </label>
            <select
              value={baseCity}
              onChange={(e) => setBaseCity(e.target.value)}
              className={inputClass}
            >
              {allCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground-secondary">
              Time
            </label>
            <div className="flex gap-2">
              <input
                type="time"
                value={baseTime}
                onChange={(e) => setBaseTime(e.target.value)}
                className={inputClass}
              />
              <select
                value={baseAmPm}
                onChange={(e) => setBaseAmPm(e.target.value)}
                className={inputClass}
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>
          <div className={cardClass}>
            <div className="text-center">
              <div className="text-sm text-foreground-muted">Your Time</div>
              <div className="text-2xl font-bold">
                {baseTime} {baseAmPm}
              </div>
            </div>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {allCities.map((city) => {
          const timeInfo = getTimeInZone(city, baseCity, baseTime, baseAmPm);
          const isCurrentCity = city === baseCity;

          return (
            <div
              key={city}
              className={clsx(
                cardClass,
                isCurrentCity && "ring-2 ring-orange-500"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <div className="font-semibold">{city}</div>
                    {isCurrentCity && (
                      <div className="text-xs text-orange-500">Base City</div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold font-mono">{timeInfo.timeStr}</div>
                  <div className="text-sm text-foreground-muted">{timeInfo.ampm}</div>
                </div>
              </div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

function TravelPackingList() {
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState("7");
  const [tripType, setTripType] = useState<"business" | "leisure" | "adventure">("leisure");
  const [packingList, setPackingList] = useState<string[]>([]);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const { generate, output } = useAIGenerate("travel-packing-list");

  const handleGenerate = async () => {
    if (!destination.trim()) return;
    setLoading(true);
    setPackingList([]);
    setCheckedItems(new Set());

    await generate({
      task: "packing_list",
      destination,
      duration: parseInt(duration) || 7,
      tripType,
    });
  };

  // Parse output when available
  useEffect(() => {
    if (output && loading) {
      const items = output
        .split("\n")
        .map((line: string) => line.replace(/^[-*.\d\s]+/, "").trim())
        .filter((line: string) => line.length > 2);
      setPackingList(items.slice(0, 25));
      setLoading(false);
    }
  }, [output, loading]);

  const toggleItem = (item: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(item)) {
        next.delete(item);
      } else {
        next.add(item);
      }
      return next;
    });
  };

  const packedCount = checkedItems.size;
  const totalCount = packingList.length;

  return (
    <div className="space-y-6">
      <div className={cardClass}>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Plane className="w-5 h-5 text-orange-500" />
          Travel Packing List Generator
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground-secondary">
              Destination
            </label>
            <input
              type="text"
              placeholder="e.g., Tokyo, Japan"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground-secondary">
              Duration (days)
            </label>
            <input
              type="number"
              min="1"
              max="90"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground-secondary">
              Trip Type
            </label>
            <select
              value={tripType}
              onChange={(e) => setTripType(e.target.value as any)}
              className={inputClass}
            >
              <option value="leisure">Leisure / Vacation</option>
              <option value="business">Business</option>
              <option value="adventure">Adventure</option>
            </select>
          </div>
        </div>

        <button onClick={handleGenerate} disabled={!destination.trim() || loading} className={clsx("mt-4 w-full", primaryBtn)}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : null}
          {loading ? "Generating..." : "Generate Packing List"}
        </button>
      </div>

      {loading && (
        <div className={cardClass}>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
          </div>
        </div>
      )}

      {packingList.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Packing List</h3>
            <div className="text-sm text-foreground-muted">
              {packedCount} / {totalCount} packed
            </div>
          </div>

          <div className="h-2 bg-background rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-300"
              style={{ width: `${(packedCount / totalCount) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {packingList.map((item, index) => {
              const isChecked = checkedItems.has(item);
              return (
                <div
                  key={index}
                  onClick={() => toggleItem(item)}
                  className={clsx(
                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                    isChecked
                      ? "bg-green-500/10 border-green-500/30"
                      : "bg-background border-border hover:border-orange-500/30"
                  )}
                >
                  <div
                    className={clsx(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                      isChecked ? "bg-green-500 border-green-500" : "border-border"
                    )}
                  >
                    {isChecked && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <span className={clsx(isChecked && "line-through text-foreground-muted")}>
                    {item}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Exchange rates (as of May 2026 - demo rates)
const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.12,
  JPY: 149.50,
  AUD: 1.53,
  CAD: 1.36,
  CHF: 0.91,
  CNY: 7.24,
  SGD: 1.35,
  HKD: 7.82,
  KRW: 1342.50,
  MXN: 17.15,
  BRL: 4.97,
  NZD: 1.65,
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  JPY: "¥",
  AUD: "A$",
  CAD: "C$",
  CHF: "CHF",
  CNY: "¥",
  SGD: "S$",
  HKD: "HK$",
  KRW: "₩",
  MXN: "MX$",
  BRL: "R$",
  NZD: "NZ$",
};

function TravelCurrency() {
  const [amount, setAmount] = useState("100");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [results, setResults] = useState<Record<string, number>>({});

  const handleConvert = () => {
    const numAmount = parseFloat(amount) || 0;
    const fromRate = EXCHANGE_RATES[fromCurrency] || 1;

    const newResults: Record<string, number> = {};
    for (const [currency, rate] of Object.entries(EXCHANGE_RATES)) {
      const valueInUSD = numAmount / fromRate;
      newResults[currency] = valueInUSD * rate;
    }
    setResults(newResults);
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <div className="space-y-6">
      <div className={cardClass}>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-orange-500" />
          Currency Converter
        </h3>

        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2 text-foreground-secondary">
              Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex-shrink-0">
            <label className="block text-sm font-medium mb-2 text-foreground-secondary">
              From
            </label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className={inputClass}
            >
              {Object.keys(EXCHANGE_RATES).map((currency) => (
                <option key={currency} value={currency}>
                  {currency} ({CURRENCY_SYMBOLS[currency]})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={swapCurrencies}
            className="p-3 rounded-xl bg-background border border-border hover:border-orange-500/50 transition-colors"
            title="Swap currencies"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="flex-shrink-0">
            <label className="block text-sm font-medium mb-2 text-foreground-secondary">
              To
            </label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className={inputClass}
            >
              {Object.keys(EXCHANGE_RATES).map((currency) => (
                <option key={currency} value={currency}>
                  {currency} ({CURRENCY_SYMBOLS[currency]})
                </option>
              ))}
            </select>
          </div>

          <button onClick={handleConvert} className={primaryBtn}>
            Convert
          </button>
        </div>
      </div>

      {results[toCurrency] && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className={cardClass}>
            <div className="text-center py-8">
              <div className="text-sm text-foreground-muted mb-2">
                {parseFloat(amount).toLocaleString()} {fromCurrency}
              </div>
              <div className="text-4xl font-bold text-orange-500">
                {results[toCurrency].toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                {toCurrency}
              </div>
              <div className="text-sm text-foreground-muted mt-2">
                {CURRENCY_SYMBOLS[toCurrency]}
                {results[toCurrency].toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          </div>

          <h3 className="font-semibold">All Conversions</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(results).map(([currency, value]) => (
              <div
                key={currency}
                className={clsx(
                  cardClass,
                  currency === toCurrency && "ring-2 ring-orange-500"
                )}
              >
                <div className="text-xs text-foreground-muted mb-1">{currency}</div>
                <div className="font-mono font-semibold">
                  {CURRENCY_SYMBOLS[currency]}
                  {value.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-foreground-muted text-center">
            Exchange rates are approximate and for demo purposes only.
          </p>
        </motion.div>
      )}
    </div>
  );
}

export default function TravelWorkspace({ tool }: { tool: Tool }) {
  switch (tool.slug) {
    case "trip-distance":
      return <TripDistance />;
    case "world-timezone":
      return <WorldTimezoneConverter />;
    case "travel-packing-list":
      return <TravelPackingList />;
    case "travel-currency":
      return <TravelCurrency />;
    default:
      return (
        <div className="text-center py-12 text-foreground-muted">
          Tool not found: {tool.name}
        </div>
      );
  }
}