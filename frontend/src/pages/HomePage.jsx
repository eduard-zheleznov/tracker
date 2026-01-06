import React, { useState, useEffect } from 'react';
import { Menu, Lightbulb } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { happinessAPI } from '../lib/api';
import HappinessSpeedometer from '../components/HappinessSpeedometer';
import PeriodSelector from '../components/PeriodSelector';
import BottomNavigation from '../components/BottomNavigation';

const HomePage = () => {
  const { user, logout } = useAuth();
  const [happinessData, setHappinessData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('quarter');
  const [customDateRange, setCustomDateRange] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  const fetchHappinessScore = async () => {
    try {
      setLoading(true);
      let data;
      
      if (selectedPeriod === 'custom' && customDateRange) {
        data = await happinessAPI.getScore(
          'custom',
          customDateRange.start.toISOString(),
          customDateRange.end.toISOString()
        );
      } else {
        data = await happinessAPI.getScore(selectedPeriod);
      }
      
      setHappinessData(data);
    } catch (error) {
      console.error('Error fetching happiness score:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHappinessScore();
  }, [selectedPeriod, customDateRange]);

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    if (period !== 'custom') {
      setCustomDateRange(null);
    }
  };

  return (
    <div className="dark-purple main-app-bg" data-testid="home-page">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 safe-area-pt">
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 text-white/70 hover:text-white transition-colors"
          data-testid="menu-btn"
        >
          <Menu size={24} />
        </button>
        
        <button 
          className="p-2 text-white/70 hover:text-white transition-colors"
          data-testid="tips-btn"
        >
          <Lightbulb size={24} />
        </button>
      </header>

      {/* Menu Dropdown */}
      {showMenu && (
        <div className="absolute top-16 left-4 z-50 glass rounded-xl p-4 animate-scale-in" data-testid="menu-dropdown">
          <p className="text-white/70 text-sm mb-2">Привет, {user?.login}</p>
          <button 
            onClick={() => {
              logout();
              setShowMenu(false);
            }}
            className="text-white hover:text-red-400 transition-colors text-sm"
            data-testid="logout-btn"
          >
            Выйти
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="page-content px-4">
        {/* Title */}
        <h1 
          className="text-4xl md:text-5xl font-bold text-center mb-8 text-gradient-happiness"
          style={{ fontFamily: 'Outfit, sans-serif' }}
          data-testid="home-title"
        >
          ВАШЕ СЧАСТЬЕ
        </h1>

        {/* Speedometer */}
        <div className="mb-8">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-12 h-12 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <HappinessSpeedometer 
              score={happinessData?.score} 
              hasData={happinessData?.has_data}
            />
          )}
        </div>

        {/* No data message */}
        {!loading && !happinessData?.has_data && (
          <p className="text-center text-white/50 mb-6 text-sm animate-fade-in">
            Нет данных за выбранный период. Перейдите в раздел "Оценка", чтобы добавить свои состояния.
          </p>
        )}

        {/* Period Selector */}
        <div className="max-w-md mx-auto">
          <PeriodSelector
            selectedPeriod={selectedPeriod}
            onPeriodChange={handlePeriodChange}
            customDateRange={customDateRange}
            onCustomDateChange={setCustomDateRange}
          />
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default HomePage;
