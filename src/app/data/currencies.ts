export interface Currency {
  symbol: string
  code: string
  name: string
  format: string
}

interface CurrencyData {
  [region: string]: Currency[]
}

export const currencies: CurrencyData[] = [
  {
    "North America": [
      { symbol: "$", code: "USD", name: "US Dollar", format: "#,##0.00" },
      { symbol: "$", code: "CAD", name: "Canadian Dollar", format: "#,##0.00" },
      { symbol: "$", code: "MXN", name: "Mexican Peso", format: "#,##0.00" },
    ],
    Europe: [
      { symbol: "€", code: "EUR", name: "Euro", format: "#,##0.00" },
      { symbol: "£", code: "GBP", name: "British Pound", format: "#,##0.00" },
      { symbol: "₣", code: "CHF", name: "Swiss Franc", format: "#,##0.00" },
      { symbol: "kr", code: "SEK", name: "Swedish Krona", format: "#,##0" },
      { symbol: "kr", code: "NOK", name: "Norwegian Krone", format: "#,##0" },
      { symbol: "kr", code: "DKK", name: "Danish Krone", format: "#,##0" },
      { symbol: "zł", code: "PLN", name: "Polish Zloty", format: "#,##0.00" },
      { symbol: "Kč", code: "CZK", name: "Czech Koruna", format: "#,##0" },
      { symbol: "Ft", code: "HUF", name: "Hungarian Forint", format: "#,##0" },
      { symbol: "₺", code: "TRY", name: "Turkish Lira", format: "#,##0.00" },
    ],
    Asia: [
      { symbol: "¥", code: "JPY", name: "Japanese Yen", format: "#,##0" },
      { symbol: "¥", code: "CNY", name: "Chinese Yuan", format: "#,##0.00" },
      { symbol: "₹", code: "INR", name: "Indian Rupee", format: "#,##0.00" },
      { symbol: "₩", code: "KRW", name: "South Korean Won", format: "#,##0" },
      {
        symbol: "$",
        code: "SGD",
        name: "Singapore Dollar",
        format: "#,##0.00",
      },
      {
        symbol: "$",
        code: "HKD",
        name: "Hong Kong Dollar",
        format: "#,##0.00",
      },
      { symbol: "₫", code: "VND", name: "Vietnamese Dong", format: "#,##0" },
      { symbol: "₱", code: "PHP", name: "Philippine Peso", format: "#,##0.00" },
      { symbol: "฿", code: "THB", name: "Thai Baht", format: "#,##0.00" },
    ],
    "Australia & Pacific": [
      {
        symbol: "$",
        code: "AUD",
        name: "Australian Dollar",
        format: "#,##0.00",
      },
      {
        symbol: "$",
        code: "NZD",
        name: "New Zealand Dollar",
        format: "#,##0.00",
      },
      { symbol: "$", code: "FJD", name: "Fijian Dollar", format: "#,##0.00" },
      {
        symbol: "K",
        code: "PGK",
        name: "Papua New Guinean Kina",
        format: "#,##0.00",
      },
    ],
    "South America": [
      { symbol: "R$", code: "BRL", name: "Brazilian Real", format: "#,##0.00" },
      { symbol: "$", code: "ARS", name: "Argentine Peso", format: "#,##0.00" },
      { symbol: "$", code: "COP", name: "Colombian Peso", format: "#,##0" },
      { symbol: "$", code: "CLP", name: "Chilean Peso", format: "#,##0" },
      { symbol: "S/", code: "PEN", name: "Peruvian Sol", format: "#,##0.00" },
    ],
    Africa: [
      {
        symbol: "R",
        code: "ZAR",
        name: "South African Rand",
        format: "#,##0.00",
      },
      { symbol: "₦", code: "NGN", name: "Nigerian Naira", format: "#,##0.00" },
      { symbol: "E£", code: "EGP", name: "Egyptian Pound", format: "#,##0.00" },
      {
        symbol: "KSh",
        code: "KES",
        name: "Kenyan Shilling",
        format: "#,##0.00",
      },
      { symbol: "₵", code: "GHS", name: "Ghanaian Cedi", format: "#,##0.00" },
    ],
    "Middle East": [
      {
        symbol: "د.إ",
        code: "AED",
        name: "United Arab Emirates Dirham",
        format: "#,##0.00",
      },
      { symbol: "﷼", code: "SAR", name: "Saudi Riyal", format: "#,##0.00" },
      { symbol: "ع.د", code: "IQD", name: "Iraqi Dinar", format: "#,##0" },
      { symbol: "﷼", code: "IRR", name: "Iranian Rial", format: "#,##0" },
    ],
  },
]
