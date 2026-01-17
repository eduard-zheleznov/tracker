import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Star, GraduationCap, BarChart3, Target } from 'lucide-react';

const navItems = [
  { id: 'home', path: '/', icon: Home, label: 'Главная' },
  { id: 'assessment', path: '/assessment', icon: Star, label: 'Оценка' },
  { id: 'education', path: '/education', icon: GraduationCap, label: 'Обучение' },
  { id: 'analysis', path: '/analysis', icon: BarChart3, label: 'Анализ' },
  { id: 'strategy', path: '/strategy', icon: Target, label: 'Стратегия' },
];

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="bottom-nav" data-testid="bottom-navigation">
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          const isCenter = index === 2; // Education is center

          if (isCenter) {
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center justify-center -mt-5 relative"
                data-testid={`nav-${item.id}`}
              >
                <div className={`
                  w-14 h-14 rounded-full flex items-center justify-center
                  transition-all duration-200 shadow-lg
                  ${isActive 
                    ? 'bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] shadow-[0_0_20px_rgba(139,92,246,0.5)]' 
                    : 'bg-gradient-to-br from-[#3E2C5A] to-[#2D1B4E] hover:from-[#4E3C6A] hover:to-[#3D2B5E]'
                  }
                `}>
                  <Icon size={24} className="text-white" />
                </div>
                <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-white' : 'text-white/60'}`}>
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center py-2 px-2 transition-colors duration-200"
              data-testid={`nav-${item.id}`}
            >
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center mb-1 transition-all
                ${isActive 
                  ? 'bg-[#8B5CF6]/20' 
                  : 'bg-transparent hover:bg-white/5'
                }
              `}>
                <Icon 
                  size={22} 
                  className={`transition-colors ${isActive ? 'text-[#8B5CF6]' : 'text-white/50'}`}
                />
              </div>
              <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-white' : 'text-white/50'}`}>
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
