import React, { useState, useEffect } from 'react';
import { Menu, Lightbulb, Check, FileText, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { strategyAPI, assessmentAPI } from '../lib/api';
import BottomNavigation from '../components/BottomNavigation';
import PeriodSelector from '../components/PeriodSelector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Checkbox } from '../components/ui/checkbox';

const StrategyPage = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('decisions');
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('quarter');
  const [customDateRange, setCustomDateRange] = useState(null);
  const [filterType, setFilterType] = useState(null);
  
  const [decisionsData, setDecisionsData] = useState(null);
  const [reflectionsData, setReflectionsData] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const startDate = customDateRange?.start?.toISOString() || null;
      const endDate = customDateRange?.end?.toISOString() || null;
      const period = selectedPeriod === 'custom' ? 'custom' : selectedPeriod;

      if (activeTab === 'decisions') {
        const data = await strategyAPI.getDecisions(period, startDate, endDate, filterType);
        setDecisionsData(data);
      } else {
        const data = await strategyAPI.getReflections(period, startDate, endDate);
        setReflectionsData(data);
      }
    } catch (error) {
      console.error('Error fetching strategy:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, selectedPeriod, customDateRange, filterType]);

  const handleDecisionToggle = async (id, currentStatus) => {
    try {
      await assessmentAPI.updateDecision(id, !currentStatus);
      fetchData();
    } catch (error) {
      console.error('Error updating decision:', error);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getFilterLabel = (type) => {
    const labels = {
      simple_task: '#простые',
      complex_task: '#объемные',
      habit: '#привычки'
    };
    return labels[type] || type;
  };

  return (
    <div className="dark-purple main-app-bg" data-testid="strategy-page">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 safe-area-pt">
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 text-white/70 hover:text-white transition-colors"
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
          СТРАТЕГИЯ
        </h1>

        {/* Period Selector */}
        <div className="mb-6">
          <PeriodSelector
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
            customDateRange={customDateRange}
            onCustomDateChange={setCustomDateRange}
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/5">
            <TabsTrigger 
              value="decisions" 
              className="data-[state=active]:bg-[#8B5CF6] data-[state=active]:text-white text-white/60"
              data-testid="tab-decisions"
            >
              <Check size={16} className="mr-2" />
              Решения
            </TabsTrigger>
            <TabsTrigger 
              value="reflections"
              className="data-[state=active]:bg-[#8B5CF6] data-[state=active]:text-white text-white/60"
              data-testid="tab-reflections"
            >
              <FileText size={16} className="mr-2" />
              Рефлексия
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Filters for Decisions */}
        {activeTab === 'decisions' && (
          <div className="flex gap-2 flex-wrap mb-4">
            <button
              onClick={() => setFilterType(null)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                filterType === null 
                  ? 'bg-[#8B5CF6] text-white' 
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              Все
            </button>
            {['simple_task', 'complex_task', 'habit'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filterType === type 
                    ? 'bg-[#8B5CF6] text-white' 
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                {getFilterLabel(type)}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-12 h-12 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === 'decisions' && (
              <div className="space-y-4 animate-fade-in">
                {/* Completion Rate */}
                {decisionsData && decisionsData.total > 0 && (
                  <div className="glass rounded-xl p-4 text-center mb-6">
                    <p className="text-white/60 text-sm">Выполнено решений</p>
                    <p className="text-3xl font-bold text-[#8B5CF6]">{decisionsData.completion_rate}%</p>
                    <p className="text-white/40 text-xs">{decisionsData.completed} из {decisionsData.total}</p>
                  </div>
                )}

                {/* Decisions List */}
                {decisionsData?.decisions?.length > 0 ? (
                  <div className="space-y-3">
                    {decisionsData.decisions.map((decision) => (
                      <div 
                        key={decision.id} 
                        className="glass rounded-xl p-4"
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={decision.completed}
                            onCheckedChange={() => handleDecisionToggle(decision.id, decision.completed)}
                            className="mt-1 h-5 w-5 border-white/30 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                          />
                          <div className="flex-1">
                            <p className={`text-white ${decision.completed ? 'line-through opacity-50' : ''}`}>
                              {decision.text}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-[#8B5CF6] text-xs">
                                {getFilterLabel(decision.type)}
                              </span>
                              <span className="text-white/40 text-xs">
                                {formatDate(decision.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-white/50">Нет решений за выбранный период</p>
                )}
              </div>
            )}

            {activeTab === 'reflections' && (
              <div className="space-y-4 animate-fade-in">
                {reflectionsData?.reflections?.length > 0 ? (
                  reflectionsData.reflections.map((reflection) => (
                    <div key={reflection.id} className="glass rounded-xl p-4">
                      <p className="text-white/80">{reflection.text}</p>
                      <p className="text-white/40 text-xs mt-2">
                        {formatDate(reflection.created_at)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-white/50">Нет рефлексий за выбранный период</p>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

export default StrategyPage;
