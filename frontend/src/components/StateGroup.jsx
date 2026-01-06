import React from 'react';
import { Checkbox } from './ui/checkbox';

const StateGroup = ({ 
  group, 
  selectedStates, 
  onStateToggle, 
  onGroupToggle,
  type = 'harmonious' // 'harmonious' or 'disharmonious'
}) => {
  const allSelected = group.states.every(state => selectedStates.includes(state));
  const someSelected = group.states.some(state => selectedStates.includes(state));
  
  const checkboxClass = type === 'harmonious' 
    ? 'checkbox-harmonious' 
    : 'checkbox-disharmonious';

  return (
    <div className="state-group-card" data-testid={`state-group-${type}-${group.id}`}>
      {/* Group Header with Select All */}
      <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/10">
        <Checkbox
          id={`group-${type}-${group.id}`}
          checked={allSelected}
          data-state={allSelected ? 'checked' : someSelected ? 'indeterminate' : 'unchecked'}
          onCheckedChange={() => onGroupToggle(group.states)}
          className={`${checkboxClass} h-5 w-5 border-white/30 data-[state=checked]:border-transparent`}
          data-testid={`group-checkbox-${type}-${group.id}`}
        />
        <label 
          htmlFor={`group-${type}-${group.id}`}
          className="font-semibold text-white cursor-pointer"
        >
          {group.name}
        </label>
      </div>

      {/* Individual States */}
      <div className="space-y-1">
        {group.states.map((state, index) => (
          <div 
            key={index} 
            className="state-checkbox-label"
          >
            <Checkbox
              id={`state-${type}-${group.id}-${index}`}
              checked={selectedStates.includes(state)}
              onCheckedChange={() => onStateToggle(state)}
              className={`${checkboxClass} h-5 w-5 border-white/30 data-[state=checked]:border-transparent flex-shrink-0 mt-0.5`}
              data-testid={`state-checkbox-${type}-${group.id}-${index}`}
            />
            <label 
              htmlFor={`state-${type}-${group.id}-${index}`}
              className="text-white/80 text-sm leading-relaxed cursor-pointer"
            >
              {state}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StateGroup;
