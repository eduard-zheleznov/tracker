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
  { id: 'half_year', label: 'Пол года' },
  { id: 'year', label: 'Год' },
];

const PeriodSelector = ({ 
  selectedPeriod, 
  onPeriodChange, 
  customDateRange, 
  onCustomDateChange 
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

  return (
    <div className="space-y-4" data-testid="period-selector">
      {/* Custom period panel */}
      {showCustomPeriod && (
        <div 
          className="glass rounded-2xl p-4 animate-scale-in"
          data-testid="custom-period-panel"
        >
          <h3 className="text-white text-center mb-4">Период</h3>
          
          <div className="flex items-center justify-center gap-4 mb-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  data-testid="start-date-picker"
                >
                  {startDate ? format(startDate, 'dd.MM.yy', { locale: ru }) : 'Начало'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-[#1F1135] border-white/10">
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
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  data-testid="end-date-picker"
                >
                  {endDate ? format(endDate, 'dd.MM.yy', { locale: ru }) : 'Конец'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-[#1F1135] border-white/10">
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

      {/* Quick period buttons - arranged like in the design (5 buttons in 2 rows) */}
      <div className="grid grid-cols-5 gap-2">
        {periods.map((period) => (
          <button
            key={period.id}
            onClick={() => {
              onPeriodChange(period.id);
              setShowCustomPeriod(false);
            }}
            className={`period-btn text-center py-2 px-1 text-xs sm:text-sm ${selectedPeriod === period.id ? 'active' : ''}`}
            data-testid={`period-btn-${period.id}`}
          >
            {period.label}
          </button>
        ))}
      </div>

      {/* Custom period button */}
      <button
        onClick={() => setShowCustomPeriod(!showCustomPeriod)}
        className={`w-full period-btn py-3 ${selectedPeriod === 'custom' ? 'active' : ''}`}
        data-testid="custom-period-btn"
      >
        Другой период
      </button>
    </div>
  );
};

export default PeriodSelector;
