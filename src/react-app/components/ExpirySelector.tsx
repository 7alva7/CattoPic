import { useState, useEffect } from 'react'
import { ClockIcon } from './ui/icons'

interface ExpirySelectorProps {
  onChange: (minutes: number) => void
}

export default function ExpirySelector({ onChange }: ExpirySelectorProps) {
  const [selectedOption, setSelectedOption] = useState<string>('never')
  const [customValue, setCustomValue] = useState<number>(1)
  const [timeUnit, setTimeUnit] = useState<'hours' | 'days'>('hours')

  useEffect(() => {
    onChange(0)
  }, [onChange])

  const handleOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const option = e.target.value
    setSelectedOption(option)

    let minutes = 0
    switch (option) {
      case 'never':
        minutes = 0
        break
      case '1h':
        minutes = 60
        break
      case '24h':
        minutes = 24 * 60
        break
      case '7d':
        minutes = 7 * 24 * 60
        break
      case '30d':
        minutes = 30 * 24 * 60
        break
      case 'custom':
        minutes = timeUnit === 'hours' ? customValue * 60 : customValue * 60 * 24
        break
    }
    onChange(minutes)
  }

  const handleCustomValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (!isNaN(value) && value > 0) {
      setCustomValue(value)
      if (selectedOption === 'custom') {
        const minutes = timeUnit === 'hours' ? value * 60 : value * 60 * 24
        onChange(minutes)
      }
    }
  }

  const handleTimeUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const unit = e.target.value as 'hours' | 'days'
    setTimeUnit(unit)
    if (selectedOption === 'custom') {
      const minutes = unit === 'hours' ? customValue * 60 : customValue * 60 * 24
      onChange(minutes)
    }
  }

  return (
    <div className="mb-6 space-y-3">
      <div className="flex items-center">
        <ClockIcon className="mr-2 h-5 w-5 text-indigo-500" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">过期时间</span>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <select
          value={selectedOption}
          onChange={handleOptionChange}
          className="input-primary flex-1"
        >
          <option value="never">永不过期</option>
          <option value="1h">1小时</option>
          <option value="24h">1天</option>
          <option value="7d">7天</option>
          <option value="30d">30天</option>
          <option value="custom">自定义</option>
        </select>

        {selectedOption === 'custom' && (
          <>
            <input
              type="number"
              min="1"
              value={customValue}
              onChange={handleCustomValueChange}
              className="input-primary w-full text-center sm:w-24"
              aria-label="自定义时间值"
            />
            <select
              value={timeUnit}
              onChange={handleTimeUnitChange}
              className="input-primary w-full sm:w-24"
            >
              <option value="hours">小时</option>
              <option value="days">天</option>
            </select>
          </>
        )}
      </div>
    </div>
  )
}
