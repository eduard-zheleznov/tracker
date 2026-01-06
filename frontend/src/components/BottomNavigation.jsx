import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Star, GraduationCap, Search, CheckCircle } from 'lucide-react';

const navItems = [
  { id: 'home', path: '/', icon: Home, label: 'Главная' },
  { id: 'assessment', path: '/assessment', icon: Star, label: 'Оценка' },
  { id: 'education', path: '/education', icon: GraduationCap, label: 'Обучение', isCenter: true },
  { id: 'analysis', path: '/analysis', icon: Search, label: 'Анализ' },
  { id: 'strategy', path: '/strategy', icon: CheckCircle, label: 'Стратегия' },
];

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="bottom-nav" data-testid="bottom-navigation">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center justify-center -mt-6"
                data-testid={`nav-${item.id}`}
              >
                <div className={`
                  w-14 h-14 rounded-full flex items-center justify-center
                  border-2 transition-all duration-200
                  ${isActive 
                    ? 'bg-[#8B5CF6] border-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.5)]' 
                    : 'bg-[#1F1135] border-[#3E2C5A] hover:border-[#8B5CF6]/50'
                  }
                `}>
                  <Icon size={24} className="text-white" />
                </div>
                <span className={`text-xs mt-1 ${isActive ? 'text-white' : 'text-white/50'}`}>
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center py-2 px-3 transition-colors duration-200"
              data-testid={`nav-${item.id}`}
            >
              <Icon 
                size={22} 
                className={`transition-colors ${isActive ? 'text-white' : 'text-white/50'}`}
              />
              <span className={`text-xs mt-1 transition-colors ${isActive ? 'text-white' : 'text-white/50'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
