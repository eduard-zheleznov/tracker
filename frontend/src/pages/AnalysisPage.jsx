import React, { useState, useEffect } from 'react';
import { Menu, Lightbulb, TrendingUp, Repeat, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { analysisAPI } from '../lib/api';
import BottomNavigation from '../components/BottomNavigation';
import PeriodSelector from '../components/PeriodSelector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const AnalysisPage = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('repetition');
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('quarter');
  const [customDateRange, setCustomDateRange] = useState(null);
  
  const [repetitionData, setRepetitionData] = useState(null);
  const [habitData, setHabitData] = useState(null);
  const [happinessData, setHappinessData] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const startDate = customDateRange?.start?.toISOString() || null;
      const endDate = customDateRange?.end?.toISOString() || null;
      const period = selectedPeriod === 'custom' ? 'custom' : selectedPeriod;

      if (activeTab === 'repetition') {
        const data = await analysisAPI.getStateRepetition(period, startDate, endDate);
        setRepetitionData(data);
      } else if (activeTab === 'habit') {
        const data = await analysisAPI.getHabitTrend(period, startDate, endDate);
        setHabitData(data);
      } else if (activeTab === 'happiness') {
        const data = await analysisAPI.getHappinessTrend(period, startDate, endDate);
        setHappinessData(data);
      }
    } catch (error) {
      console.error('Error fetching analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, selectedPeriod, customDateRange]);

  const renderRepetition = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Disharmonious States */}
      <div>
        <h3 className="text-lg font-semibold text-red-400 mb-3">Дисгармоничные</h3>
        {repetitionData?.disharmonious?.length > 0 ? (
          <div className="space-y-2">
            {repetitionData.disharmonious.slice(0, 10).map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 glass rounded-lg">
                <span className="text-white/80 text-sm">{item.state}</span>
                <span className="text-red-400 font-semibold">{item.count}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white/50 text-sm">Нет данных за выбранный период</p>
        )}
      </div>

      {/* Harmonious States */}
      <div>
        <h3 className="text-lg font-semibold text-green-400 mb-3">Гармоничные</h3>
        {repetitionData?.harmonious?.length > 0 ? (
          <div className="space-y-2">
            {repetitionData.harmonious.slice(0, 10).map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 glass rounded-lg">
                <span className="text-white/80 text-sm">{item.state}</span>
                <span className="text-green-400 font-semibold">{item.count}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white/50 text-sm">Нет данных за выбранный период</p>
        )}
      </div>
    </div>
  );

  const renderHabitTrend = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-[#8B5CF6]">{habitData?.current_combo || 0}</p>
          <p className="text-white/60 text-sm mt-1">Текущее комбо</p>
          <p className="text-white/40 text-xs">ДНЕЙ</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-green-400">{habitData?.best_combo || 0}</p>
          <p className="text-white/60 text-sm mt-1">Дней в ряд (лучшее)</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{habitData?.total_assessments || 0}</p>
          <p className="text-white/60 text-sm mt-1">Анализов состояний</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{habitData?.avg_per_week || 0}</p>
          <p className="text-white/60 text-sm mt-1">В среднем за неделю</p>
        </div>
      </div>

      <div className="glass rounded-xl p-4 text-center">
        <p className="text-2xl font-bold text-white">{habitData?.avg_per_month || 0}</p>
        <p className="text-white/60 text-sm mt-1">В среднем за месяц</p>
      </div>

      {/* Daily Activity Chart (simplified) */}
      {habitData?.daily_data?.length > 0 && (
        <div className="glass rounded-xl p-4">
          <h4 className="text-white/80 text-sm mb-3">Активность за последние 30 дней</h4>
          <div className="flex gap-1 flex-wrap">
            {habitData.daily_data.map((day, idx) => (
              <div
                key={idx}
                className={`w-6 h-6 rounded-sm ${
                  day.count > 0 ? 'bg-[#8B5CF6]' : 'bg-white/10'
                }`}
                title={`${day.date}: ${day.count} записей`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderHappinessTrend = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h3 className="text-lg text-white/80 mb-2">СРЕДНИЙ БАЛЛ ВАШЕГО СЧАСТЬЯ</h3>
        <p className="text-white/50 text-sm">
          Чем больше гармоничных состояний и меньше дисгармоничных, тем выше балл
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{happinessData?.total_harmonious || 0}</p>
          <p className="text-white/60 text-sm mt-1">Гармоничных состояний</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-400">{happinessData?.total_disharmonious || 0}</p>
          <p className="text-white/60 text-sm mt-1">Дисгармоничных состояний</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-[#8B5CF6]">{happinessData?.best_week_score || 0}</p>
          <p className="text-white/60 text-sm mt-1">Лучший балл за неделю</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-[#8B5CF6]">{happinessData?.best_month_score || 0}</p>
          <p className="text-white/60 text-sm mt-1">Лучший балл за месяц</p>
        </div>
      </div>

      {/* Weekly Scores */}
      {happinessData?.weekly_data?.length > 0 && (
        <div className="glass rounded-xl p-4">
          <h4 className="text-white/80 text-sm mb-3">Баллы по неделям</h4>
          <div className="space-y-2">
            {happinessData.weekly_data.slice(-8).map((week, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-white/50 text-xs w-20">{week.week}</span>
                <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                    style={{ width: `${week.score * 10}%` }}
                  />
                </div>
                <span className="text-white font-semibold w-10 text-right">{week.score}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="dark-purple main-app-bg" data-testid="analysis-page">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 safe-area-pt">
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 text-white/70 hover:text-white transition-colors"
          data-testid="menu-btn"
        >
          <Menu size={24} />
        </button>
        <button className="p-2 text-white/70 hover:text-white transition-colors">
          <Lightbulb size={24} />
        </button>
      </header>

      {showMenu && (
        <div className="absolute top-16 left-4 z-50 glass rounded-xl p-4 animate-scale-in">
          <button 
            onClick={() => { logout(); setShowMenu(false); }}
            className="text-white hover:text-red-400 transition-colors text-sm"
          >
            Выйти
          </button>
        </div>
      )}

      <main className="page-content px-4">
        <h1 
          className="text-3xl md:text-4xl font-bold text-center mb-6 text-gradient-happiness"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          АНАЛИЗ
        </h1>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/5">
            <TabsTrigger 
              value="repetition" 
              className="data-[state=active]:bg-[#8B5CF6] data-[state=active]:text-white text-white/60"
              data-testid="tab-repetition"
            >
              <Repeat size={16} className="mr-1" />
              <span className="hidden sm:inline">Повтор</span>
            </TabsTrigger>
            <TabsTrigger 
              value="habit"
              className="data-[state=active]:bg-[#8B5CF6] data-[state=active]:text-white text-white/60"
              data-testid="tab-habit"
            >
              <TrendingUp size={16} className="mr-1" />
              <span className="hidden sm:inline">Привычка</span>
            </TabsTrigger>
            <TabsTrigger 
              value="happiness"
              className="data-[state=active]:bg-[#8B5CF6] data-[state=active]:text-white text-white/60"
              data-testid="tab-happiness"
            >
              <Heart size={16} className="mr-1" />
              <span className="hidden sm:inline">Счастье</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Period Selector */}
        <div className="mb-6">
          <PeriodSelector
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
            customDateRange={customDateRange}
            onCustomDateChange={setCustomDateRange}
          />
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-12 h-12 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === 'repetition' && renderRepetition()}
            {activeTab === 'habit' && renderHabitTrend()}
            {activeTab === 'happiness' && renderHappinessTrend()}
          </>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

export default AnalysisPage;
