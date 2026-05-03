import type { CreateRoutingRulePayload, RuleType } from "@/types/governance";
import { useEffect, useState } from "react";

// Common ISO 3166-1 alpha-2 country codes for the geo picker
const COMMON_COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "NL", name: "Netherlands" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "IN", name: "India" },
  { code: "CN", name: "China" },
  { code: "RU", name: "Russia" },
  { code: "PL", name: "Poland" },
  { code: "UA", name: "Ukraine" },
  { code: "SG", name: "Singapore" },
  { code: "NZ", name: "New Zealand" },
];

// Common IANA timezones
const COMMON_TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Kiev",
  "Europe/Warsaw",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Asia/Singapore",
  "Asia/Kolkata",
  "Asia/Shanghai",
  "Australia/Sydney",
  "Pacific/Auckland",
];

const RULE_TYPES: { value: RuleType; label: string; icon: string; desc: string }[] = [
  { value: "geo", label: "Geo", icon: "🌍", desc: "Redirect by visitor country" },
  { value: "device", label: "Device", icon: "📱", desc: "Redirect by device type" },
  { value: "time_window", label: "Time Window", icon: "🕐", desc: "Redirect by time of day" },
  { value: "referrer", label: "Referrer", icon: "🔗", desc: "Redirect by referring site" },
  { value: "percentage", label: "A/B Split", icon: "⚖️", desc: "Send a % of traffic to another URL" },
];

interface AddRuleModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  existingRuleCount: number;
  onClose: () => void;
  onSubmit: (payload: CreateRoutingRulePayload) => Promise<void>;
}

export function AddRuleModal({
  isOpen,
  isSubmitting,
  existingRuleCount,
  onClose,
  onSubmit,
}: AddRuleModalProps) {
  const [ruleType, setRuleType] = useState<RuleType>("geo");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [error, setError] = useState("");

  // geo
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [countrySearch, setCountrySearch] = useState("");
  const [customCountry, setCustomCountry] = useState("");

  // device
  const [deviceTypes, setDeviceTypes] = useState<string[]>([]);

  // time_window
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [timezone, setTimezone] = useState("UTC");

  // referrer
  const [referrerPattern, setReferrerPattern] = useState("");

  // percentage
  const [weight, setWeight] = useState(50);

  useEffect(() => {
    if (!isOpen) {
      setRuleType("geo");
      setDestinationUrl("");
      setError("");
      setSelectedCountries([]);
      setCountrySearch("");
      setCustomCountry("");
      setDeviceTypes([]);
      setStartTime("09:00");
      setEndTime("17:00");
      setTimezone("UTC");
      setReferrerPattern("");
      setWeight(50);
    }
  }, [isOpen]);

  const toggleCountry = (code: string) => {
    setSelectedCountries((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  };

  const addCustomCountry = () => {
    const code = customCountry.trim().toUpperCase();
    if (code.length === 2 && !selectedCountries.includes(code)) {
      setSelectedCountries((prev) => [...prev, code]);
    }
    setCustomCountry("");
  };

  const toggleDevice = (type: string) => {
    setDeviceTypes((prev) =>
      prev.includes(type) ? prev.filter((d) => d !== type) : [...prev, type],
    );
  };

  const buildConditions = (): Record<string, unknown> => {
    switch (ruleType) {
      case "geo":
        return { countries: selectedCountries };
      case "device":
        return { device_types: deviceTypes };
      case "time_window":
        return { start_time: startTime, end_time: endTime, timezone };
      case "referrer":
        return { referrer_pattern: referrerPattern.trim() };
      case "percentage":
        return {};
    }
  };

  const validate = (): string => {
    if (!destinationUrl.trim()) return "Destination URL is required.";
    try {
      new URL(destinationUrl.trim());
    } catch {
      return "Please enter a valid URL (e.g., https://example.com).";
    }
    if (ruleType === "geo" && selectedCountries.length === 0)
      return "Select at least one country.";
    if (ruleType === "device" && deviceTypes.length === 0)
      return "Select at least one device type.";
    if (ruleType === "referrer" && !referrerPattern.trim())
      return "Referrer pattern is required.";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    await onSubmit({
      ruleType,
      destinationUrl: destinationUrl.trim(),
      conditions: buildConditions(),
      weight: ruleType === "percentage" ? weight : undefined,
      priority: existingRuleCount,
    });
  };

  const filteredCountries = COMMON_COUNTRIES.filter(
    (c) =>
      !countrySearch ||
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.code.toLowerCase().includes(countrySearch.toLowerCase()),
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-xl border border-neutral-200 dark:border-white/[0.08] bg-white dark:bg-neutral-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 dark:border-white/[0.06] px-5 py-4 shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Add Routing Rule
            </h3>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Rules are evaluated in order — first match wins.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-8 w-8 rounded-md border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="p-5 space-y-5">
            {error && (
              <div className="rounded-lg border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            {/* Rule type selector */}
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-[0.04em] text-neutral-500">
                Rule Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {RULE_TYPES.map((rt) => (
                  <button
                    key={rt.value}
                    type="button"
                    onClick={() => setRuleType(rt.value)}
                    className={`flex flex-col gap-0.5 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                      ruleType === rt.value
                        ? "border-violet-500 bg-violet-500/10 text-violet-300"
                        : "border-neutral-200 dark:border-white/[0.07] hover:border-neutral-300 dark:hover:border-white/[0.12] text-neutral-600 dark:text-neutral-300"
                    }`}
                  >
                    <span className="text-base leading-none">{rt.icon}</span>
                    <span className="text-[12px] font-semibold mt-1">{rt.label}</span>
                    <span className="text-[10.5px] text-neutral-400 leading-snug">
                      {rt.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Condition-specific fields */}
            {ruleType === "geo" && (
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.04em] text-neutral-500">
                  Countries
                </label>
                <input
                  type="text"
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  placeholder="Search countries…"
                  className="gov-field-input mb-2"
                />
                <div className="grid grid-cols-2 gap-1 max-h-40 overflow-y-auto rounded-lg border border-neutral-200 dark:border-white/[0.07] p-2">
                  {filteredCountries.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => toggleCountry(c.code)}
                      className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-xs transition-colors ${
                        selectedCountries.includes(c.code)
                          ? "bg-violet-500/20 text-violet-300"
                          : "hover:bg-neutral-100 dark:hover:bg-white/[0.04] text-neutral-600 dark:text-neutral-300"
                      }`}
                    >
                      <span
                        className={`w-3 h-3 rounded-sm border flex-shrink-0 flex items-center justify-center text-[9px] ${
                          selectedCountries.includes(c.code)
                            ? "border-violet-500 bg-violet-500 text-white"
                            : "border-neutral-300 dark:border-neutral-600"
                        }`}
                      >
                        {selectedCountries.includes(c.code) && "✓"}
                      </span>
                      <span className="font-mono text-[10px] text-neutral-400 w-6">{c.code}</span>
                      <span className="truncate">{c.name}</span>
                    </button>
                  ))}
                </div>
                {/* Custom ISO code input */}
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={customCountry}
                    onChange={(e) => setCustomCountry(e.target.value.toUpperCase().slice(0, 2))}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomCountry())}
                    placeholder="Custom code (e.g. UA)"
                    maxLength={2}
                    className="gov-field-input flex-1 font-mono uppercase"
                  />
                  <button
                    type="button"
                    onClick={addCustomCountry}
                    className="px-3 rounded-lg border border-neutral-200 dark:border-white/[0.07] text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/[0.04] transition-colors"
                  >
                    Add
                  </button>
                </div>
                {selectedCountries.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedCountries.map((code) => (
                      <span
                        key={code}
                        className="inline-flex items-center gap-1 rounded-md bg-violet-500/15 px-2 py-0.5 text-[11px] font-mono text-violet-300"
                      >
                        {code}
                        <button
                          type="button"
                          onClick={() => toggleCountry(code)}
                          className="text-violet-400 hover:text-red-400 ml-0.5"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {ruleType === "device" && (
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.04em] text-neutral-500">
                  Device Types
                </label>
                <div className="flex flex-col gap-2">
                  {(["mobile", "tablet", "desktop"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleDevice(type)}
                      className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
                        deviceTypes.includes(type)
                          ? "border-violet-500 bg-violet-500/10 text-violet-300"
                          : "border-neutral-200 dark:border-white/[0.07] hover:border-neutral-300 dark:hover:border-white/[0.12] text-neutral-600 dark:text-neutral-300"
                      }`}
                    >
                      <span className="text-lg">
                        {type === "mobile" ? "📱" : type === "tablet" ? "⬛" : "🖥️"}
                      </span>
                      <span className="text-sm font-medium capitalize">{type}</span>
                      {deviceTypes.includes(type) && (
                        <span className="ml-auto text-violet-400 text-xs">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {ruleType === "time_window" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.04em] text-neutral-500">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="gov-field-input font-mono"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.04em] text-neutral-500">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="gov-field-input font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.04em] text-neutral-500">
                    Timezone
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="gov-field-input"
                  >
                    {COMMON_TIMEZONES.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Overnight windows (e.g. 22:00 – 06:00) are supported.
                </p>
              </div>
            )}

            {ruleType === "referrer" && (
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.04em] text-neutral-500">
                  Referrer Pattern (regex)
                </label>
                <input
                  type="text"
                  value={referrerPattern}
                  onChange={(e) => setReferrerPattern(e.target.value)}
                  placeholder="twitter\.com|x\.com"
                  className="gov-field-input font-mono"
                />
                <p className="mt-1.5 text-[11px] text-neutral-400">
                  Matches against the HTTP Referer header. Use | for multiple patterns.
                </p>
              </div>
            )}

            {ruleType === "percentage" && (
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.04em] text-neutral-500">
                  Traffic Weight — {weight}%
                </label>
                <input
                  type="range"
                  min={1}
                  max={99}
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full accent-violet-500"
                />
                <div className="flex justify-between text-[10px] text-neutral-400 font-mono mt-1">
                  <span>1%</span>
                  <span>50%</span>
                  <span>99%</span>
                </div>
                {/* A/B preview */}
                <div className="mt-3 rounded-lg overflow-hidden border border-neutral-200 dark:border-white/[0.06] p-3">
                  <p className="text-[10.5px] text-neutral-400 uppercase tracking-[0.05em] font-mono mb-2">
                    Split Preview
                  </p>
                  <div className="flex h-5 rounded overflow-hidden gap-0.5">
                    <div
                      className="bg-neutral-300/40 dark:bg-white/10 transition-all"
                      style={{ flex: 100 - weight }}
                      title={`Default destination — ${100 - weight}%`}
                    />
                    <div
                      className="bg-gradient-to-r from-violet-500 to-purple-400 transition-all"
                      style={{ flex: weight }}
                      title={`This rule — ${weight}%`}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5 text-[10.5px] font-mono text-neutral-400">
                    <span>◼ Default ({100 - weight}%)</span>
                    <span>◼ This rule ({weight}%)</span>
                  </div>
                </div>
                <p className="mt-1.5 text-[11px] text-neutral-400">
                  Multiple percentage rules share the remaining traffic proportionally.
                </p>
              </div>
            )}

            {/* Destination URL */}
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.04em] text-neutral-500">
                Destination URL *
              </label>
              <input
                type="url"
                value={destinationUrl}
                onChange={(e) => setDestinationUrl(e.target.value)}
                placeholder="https://example.com/landing"
                className="gov-field-input"
                autoComplete="off"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="shrink-0 flex gap-3 justify-end border-t border-neutral-200 dark:border-white/[0.06] px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/[0.05] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
            >
              {isSubmitting ? "Adding…" : "Add Rule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
