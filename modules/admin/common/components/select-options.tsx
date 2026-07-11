'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type SelectOption<T extends string | number> = {
  value: T;
  label: string;
};

interface SelectOptionsProps<T extends string | number> {
  value?: T | null;
  onValueChange: (value: T) => void;
  disabled?: boolean;
  options: SelectOption<T>[];
  id?: string;
  placeholder?: string;
  className?: string;
}

const SelectOptions = <T extends string | number>({
  value,
  onValueChange,
  disabled,
  options,
  id,
  placeholder = 'Select an option',
  className = 'w-full',
}: SelectOptionsProps<T>) => {
  // Safe string conversion for Select internal state
  // const internalValue =
  //   value != undefined && value !== null ? String(value) : '';

  const internalValue =
  value != null ? String(value) : '';

  const handleValueChange = (val: string) => {
    // If original options used numbers, convert back to number
    const originalOption = options.find((opt) => String(opt.value) === val);
    if (originalOption) {
      onValueChange(originalOption.value);
    }
  };

  return (
    <Select
      value={internalValue}
      onValueChange={handleValueChange}
      disabled={disabled}
    >
      <SelectTrigger className={className} id={id}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={String(option.value)} value={String(option.value)}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SelectOptions;
