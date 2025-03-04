import { currencies } from "@/app/data/currencies"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CurrencySelectProps {
  value: string
  disabled?: boolean
  onChange: (value: string) => void
}

export function CurrencySelect({
  value,
  onChange,
  disabled,
}: CurrencySelectProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className='w-[280px]'>
        <SelectValue placeholder='Select a currency' />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(currencies[0]).map(([region, currencyList]) => (
          <SelectGroup key={region}>
            <SelectLabel>{region}</SelectLabel>
            {currencyList.map((currency) => (
              <SelectItem key={currency.code} value={currency.code}>
                {currency.symbol} ({currency.code}) - {currency.name}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  )
}
