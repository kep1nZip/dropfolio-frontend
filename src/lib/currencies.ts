/**
 * Currencies a user can pick for *display*. Every price in the database and the API stays in
 * USD (Steam Market's base) — this list only drives conversion at render time.
 *
 * Codes must be ones the rates provider (open.er-api.com) actually returns; `/api/rates`
 * silently drops any code it has no rate for, and the selector hides those.
 */
export interface CurrencyInfo {
  code: string;
  name: string;
  /** Only set when the default `en-US` rendering reads badly for the people using it. */
  locale?: string;
}

export const DEFAULT_CURRENCY = 'USD';

export const CURRENCIES: readonly CurrencyInfo[] = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'IDR', name: 'Indonesian Rupiah', locale: 'id-ID' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'MYR', name: 'Malaysian Ringgit' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'HKD', name: 'Hong Kong Dollar' },
  { code: 'TWD', name: 'New Taiwan Dollar' },
  { code: 'KRW', name: 'South Korean Won' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'THB', name: 'Thai Baht' },
  { code: 'VND', name: 'Vietnamese Dong' },
  { code: 'PHP', name: 'Philippine Peso' },
  { code: 'BND', name: 'Brunei Dollar' },
  { code: 'NZD', name: 'New Zealand Dollar' },
  { code: 'SEK', name: 'Swedish Krona' },
  { code: 'NOK', name: 'Norwegian Krone' },
  { code: 'DKK', name: 'Danish Krone' },
  { code: 'PLN', name: 'Polish Zloty' },
  { code: 'CZK', name: 'Czech Koruna' },
  { code: 'HUF', name: 'Hungarian Forint' },
  { code: 'RON', name: 'Romanian Leu' },
  { code: 'TRY', name: 'Turkish Lira' },
  { code: 'RUB', name: 'Russian Ruble' },
  { code: 'UAH', name: 'Ukrainian Hryvnia' },
  { code: 'KZT', name: 'Kazakhstani Tenge' },
  { code: 'BRL', name: 'Brazilian Real' },
  { code: 'MXN', name: 'Mexican Peso' },
  { code: 'ARS', name: 'Argentine Peso' },
  { code: 'CLP', name: 'Chilean Peso' },
  { code: 'COP', name: 'Colombian Peso' },
  { code: 'PEN', name: 'Peruvian Sol' },
  { code: 'ZAR', name: 'South African Rand' },
  { code: 'EGP', name: 'Egyptian Pound' },
  { code: 'NGN', name: 'Nigerian Naira' },
  { code: 'KES', name: 'Kenyan Shilling' },
  { code: 'AED', name: 'UAE Dirham' },
  { code: 'SAR', name: 'Saudi Riyal' },
  { code: 'QAR', name: 'Qatari Riyal' },
  { code: 'KWD', name: 'Kuwaiti Dinar' },
  { code: 'ILS', name: 'Israeli Shekel' },
  { code: 'PKR', name: 'Pakistani Rupee' },
  { code: 'BDT', name: 'Bangladeshi Taka' },
  { code: 'LKR', name: 'Sri Lankan Rupee' },
];

export const CURRENCY_CODES: readonly string[] = CURRENCIES.map((currency) => currency.code);

export function getCurrency(code: string): CurrencyInfo | undefined {
  return CURRENCIES.find((currency) => currency.code === code);
}

export function isSupportedCurrency(code: unknown): code is string {
  return typeof code === 'string' && CURRENCY_CODES.includes(code);
}