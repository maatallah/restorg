/**
 * Last-Updated: 2026-02-05 13:30
 * Purpose: Configuration hooks for multi-currency support (feature-flagged, not active by default).
 */

export type CurrencyConfig = {
  defaultCurrency: string;
  multiCurrencyEnabled: boolean;
  allowedCurrencies: string[];
  fxProvider?: string;
  fxRefreshMinutes?: number;
};

function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (!value) {
    return fallback;
  }
  return value.toLowerCase() === 'true';
}

function parseList(value: string | undefined): string[] {
  if (!value) {
    return [];
  }
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseNumber(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

// Note: This config is not wired to business logic yet. It is a hook for future activation.
export function getCurrencyConfig(): CurrencyConfig {
  return {
    defaultCurrency: process.env.DEFAULT_CURRENCY ?? 'TND',
    multiCurrencyEnabled: parseBool(process.env.MULTI_CURRENCY_ENABLED, false),
    allowedCurrencies: parseList(process.env.ALLOWED_CURRENCIES),
    fxProvider: process.env.FX_PROVIDER,
    fxRefreshMinutes: parseNumber(process.env.FX_REFRESH_MINUTES),
  };
}
