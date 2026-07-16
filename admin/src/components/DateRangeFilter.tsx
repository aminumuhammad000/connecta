import { useState } from 'react'

interface DateRangeFilterProps {
  onFilterChange: (startDate: Date | null, endDate: Date | null) => void
}

export default function DateRangeFilter({ onFilterChange }: DateRangeFilterProps) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const handleApply = () => {
    const start = startDate ? new Date(startDate) : null
    const end = endDate ? new Date(endDate) : null
    onFilterChange(start, end)
  }

  const handleClear = () => {
    setStartDate('')
    setEndDate('')
    onFilterChange(null, null)
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg bg-background-light dark:bg-background-dark text-text-light-primary dark:text-dark-primary border border-border-light dark:border-border-dark"
        />
      </div>
      <span className="text-text-light-secondary dark:text-dark-secondary">to</span>
      <div className="relative">
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg bg-background-light dark:bg-background-dark text-text-light-primary dark:text-dark-primary border border-border-light dark:border-border-dark"
        />
      </div>
      <button
        onClick={handleApply}
        className="px-3 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary/90"
      >
        Apply
      </button>
      <button
        onClick={handleClear}
        className="px-3 py-2 text-sm rounded-lg bg-background-light dark:bg-background-dark text-text-light-primary dark:text-dark-primary border border-border-light dark:border-border-dark hover:bg-border-light dark:hover:bg-border-dark"
      >
        Clear
      </button>
    </div>
  )
}
