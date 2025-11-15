export interface Currency {
  symbol: string;
  code: string;
  name: string;
  format: string;
}

interface CurrencyData {
  [region: string]: Currency[];
}

export const currencies: CurrencyData[] = [
  {
    "North America": [
      { symbol: "$", code: "USD", name: "US Dollar", format: "#,##0.00" },
      { symbol: "$", code: "CAD", name: "Canadian Dollar", format: "#,##0.00" },
      { symbol: "$", code: "MXN", name: "Mexican Peso", format: "#,##0.00" },
      // Central America
      {
        symbol: "L",
        code: "HNL",
        name: "Honduran Lempira",
        format: "#,##0.00",
      },
      {
        symbol: "C$",
        code: "NIO",
        name: "Nicaraguan Córdoba",
        format: "#,##0.00",
      },
      {
        symbol: "Q",
        code: "GTQ",
        name: "Guatemalan Quetzal",
        format: "#,##0.00",
      },
      {
        symbol: "B/.",
        code: "PAB",
        name: "Panamanian Balboa",
        format: "#,##0.00",
      },
      {
        symbol: "₡",
        code: "CRC",
        name: "Costa Rican Colón",
        format: "#,##0.00",
      },
      {
        symbol: "$",
        code: "SVC",
        name: "Salvadoran Colón (historic)",
        format: "#,##0.00",
      },
      // Caribbean
      { symbol: "$", code: "BSD", name: "Bahamian Dollar", format: "#,##0.00" },
      {
        symbol: "$",
        code: "BBD",
        name: "Barbadian Dollar",
        format: "#,##0.00",
      },
      { symbol: "$", code: "JMD", name: "Jamaican Dollar", format: "#,##0.00" },
      {
        symbol: "$",
        code: "TTD",
        name: "Trinidad and Tobago Dollar",
        format: "#,##0.00",
      },
      {
        symbol: "$",
        code: "XCD",
        name: "East Caribbean Dollar",
        format: "#,##0.00",
      },
      { symbol: "$", code: "DOP", name: "Dominican Peso", format: "#,##0.00" },
      { symbol: "$", code: "CUP", name: "Cuban Peso", format: "#,##0.00" },
      {
        symbol: "$",
        code: "CUC",
        name: "Cuban Convertible Peso (historic)",
        format: "#,##0.00",
      },
      { symbol: "ƒ", code: "AWG", name: "Aruban Florin", format: "#,##0.00" },
      {
        symbol: "ƒ",
        code: "ANG",
        name: "Netherlands Antillean Guilder",
        format: "#,##0.00",
      },
      { symbol: "$", code: "HTG", name: "Haitian Gourde", format: "#,##0.00" },
      {
        symbol: "$",
        code: "KYD",
        name: "Cayman Islands Dollar",
        format: "#,##0.00",
      },
      { symbol: "$", code: "BZD", name: "Belize Dollar", format: "#,##0.00" },
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
      { symbol: "₽", code: "RUB", name: "Russian Ruble", format: "#,##0.00" },
      {
        symbol: "₴",
        code: "UAH",
        name: "Ukrainian Hryvnia",
        format: "#,##0.00",
      },
      { symbol: "lei", code: "RON", name: "Romanian Leu", format: "#,##0.00" },
      { symbol: "лв", code: "BGN", name: "Bulgarian Lev", format: "#,##0.00" },
      { symbol: "kr", code: "ISK", name: "Icelandic Króna", format: "#,##0" },
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
      { symbol: "Rp", code: "IDR", name: "Indonesian Rupiah", format: "#,##0" },
      {
        symbol: "RM",
        code: "MYR",
        name: "Malaysian Ringgit",
        format: "#,##0.00",
      },
      {
        symbol: "NT$",
        code: "TWD",
        name: "New Taiwan Dollar",
        format: "#,##0.00",
      },
      {
        symbol: "₪",
        code: "ILS",
        name: "Israeli New Shekel",
        format: "#,##0.00",
      },
      { symbol: "₨", code: "PKR", name: "Pakistani Rupee", format: "#,##0.00" },
      {
        symbol: "৳",
        code: "BDT",
        name: "Bangladeshi Taka",
        format: "#,##0.00",
      },
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
      { symbol: "WS$", code: "WST", name: "Samoan Tālā", format: "#,##0.00" },
      { symbol: "T$", code: "TOP", name: "Tongan Paʻanga", format: "#,##0.00" },
      {
        symbol: "SI$",
        code: "SBD",
        name: "Solomon Islands Dollar",
        format: "#,##0.00",
      },
      { symbol: "Vt", code: "VUV", name: "Vanuatu Vatu", format: "#,##0" },
    ],
    "South America": [
      { symbol: "R$", code: "BRL", name: "Brazilian Real", format: "#,##0.00" },
      { symbol: "$", code: "ARS", name: "Argentine Peso", format: "#,##0.00" },
      { symbol: "$", code: "COP", name: "Colombian Peso", format: "#,##0" },
      { symbol: "$", code: "CLP", name: "Chilean Peso", format: "#,##0" },
      { symbol: "S/", code: "PEN", name: "Peruvian Sol", format: "#,##0.00" },
      { symbol: "$U", code: "UYU", name: "Uruguayan Peso", format: "#,##0.00" },
      { symbol: "₲", code: "PYG", name: "Paraguayan Guaraní", format: "#,##0" },
      {
        symbol: "Bs.",
        code: "BOB",
        name: "Bolivian Boliviano",
        format: "#,##0.00",
      },
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
      {
        symbol: "د.م",
        code: "MAD",
        name: "Moroccan Dirham",
        format: "#,##0.00",
      },
      {
        symbol: "د.ت",
        code: "TND",
        name: "Tunisian Dinar",
        format: "#,##0.00",
      },
      {
        symbol: "د.ج",
        code: "DZD",
        name: "Algerian Dinar",
        format: "#,##0.00",
      },
      { symbol: "USh", code: "UGX", name: "Ugandan Shilling", format: "#,##0" },
      {
        symbol: "TSh",
        code: "TZS",
        name: "Tanzanian Shilling",
        format: "#,##0",
      },
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
      {
        symbol: "د.ك",
        code: "KWD",
        name: "Kuwaiti Dinar",
        format: "#,##0.000",
      },
      {
        symbol: "ب.د",
        code: "BHD",
        name: "Bahraini Dinar",
        format: "#,##0.000",
      },
      { symbol: "ر.ع", code: "OMR", name: "Omani Rial", format: "#,##0.000" },
      { symbol: "﷼", code: "QAR", name: "Qatari Riyal", format: "#,##0.00" },
    ],
  },
];
