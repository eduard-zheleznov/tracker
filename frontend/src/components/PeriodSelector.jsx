import React, { useState } from 'react';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const periods = [
  { id: 'week', label: 'Неделя' },
  { id: 'month', label: 'Месяц' },
  { id: 'quarter', label: 'Квартал' },
  { id: 'half_year', label: 'Полгода' },
  { id: 'year', label: 'Год' },
  { id: 'all', label: 'За всё время' },
];

const PeriodSelector = ({ 
  selectedPeriod, 
  onPeriodChange, 
  customDateRange, 
  onCustomDateChange,
  showAllTime = false
}) => {
  const [showCustomPeriod, setShowCustomPeriod] = useState(false);
  const [startDate, setStartDate] = useState(customDateRange?.start || null);
  const [endDate, setEndDate] = useState(customDateRange?.end || null);

  const handleApplyCustomPeriod = () => {
    if (startDate && endDate) {
      onCustomDateChange({ start: startDate, end: endDate });
      onPeriodChange('custom');
      setShowCustomPeriod(false);
    }
  };

  const displayPeriods = showAllTime ? periods : periods.filter(p => p.id !== 'all');

  return (
    <div className="space-y-3" data-testid="period-selector">
      {/* Custom period panel */}
      {showCustomPeriod && (
        <div 
          className="glass rounded-2xl p-4 animate-scale-in"
          data-testid="custom-period-panel"
        >
          <h3 className="text-white text-center mb-4 font-medium">Выберите период</h3>
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 min-w-[100px]"
                  data-testid="start-date-picker"
                >
                  {startDate ? format(startDate, 'dd.MM.yy', { locale: ru }) : 'Начало'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-[#2D1B4E] border-white/10">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  locale={ru}
                  className="bg-transparent text-white"
                />
              </PopoverContent>
            </Popover>

            <span className="text-white/50">—</span>

            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 min-w-[100px]"
                  data-testid="end-date-picker"
                >
                  {endDate ? format(endDate, 'dd.MM.yy', { locale: ru }) : 'Конец'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-[#2D1B4E] border-white/10">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  locale={ru}
                  className="bg-transparent text-white"
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button
            onClick={handleApplyCustomPeriod}
            disabled={!startDate || !endDate}
            className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
            data-testid="apply-custom-period-btn"
          >
            Применить
          </Button>
        </div>
      )}

      {/* Period buttons - neat grid */}
      <div className="flex flex-wrap gap-2 justify-center">
        {displayPeriods.map((period) => (
          <button
            key={period.id}
            onClick={() => {
              onPeriodChange(period.id);
              setShowCustomPeriod(false);
            }}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${selectedPeriod === period.id 
                ? 'bg-[#8B5CF6] text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]' 
                : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white'
              }
            `}
            data-testid={`period-btn-${period.id}`}
          >
            {period.label}
          </button>
        ))}
      </div>

      {/* Custom period button */}
      <button
        onClick={() => setShowCustomPeriod(!showCustomPeriod)}
        className={`
          w-full py-3 rounded-lg text-sm font-medium transition-all
          ${selectedPeriod === 'custom' 
            ? 'bg-[#8B5CF6] text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]' 
            : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white'
          }
        `}
        data-testid="custom-period-btn"
      >
        Другой период
      </button>
    </div>
  );
};

export default PeriodSelector;
