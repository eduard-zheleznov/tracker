import React, { useState, useEffect } from 'react';
import { ArrowLeft, Book, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { harmoniousGroups, disharmoniousGroups } from '../lib/statesData';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import BottomNavigation from '../components/BottomNavigation';

// State descriptions dictionary
const stateDescriptions = {
  "Выспанность": "Состояние полного отдыха, когда организм восстановил силы после сна",
  "Интерес; Любопытство": "Стремление познать что-то новое, узнать больше о предмете или явлении",
  "Бодрость; Энергичность": "Состояние физической и психической активности, готовность к действию",
  "Воодушевление; Энтузиазм; Окрыленность": "Чувство подъёма, воодушевления, лёгкости и энтузиазма",
  "Состояние потока": "Полное погружение в деятельность, когда время летит незаметно",
  "Надежда": "Ожидание благоприятного исхода событий, вера в лучшее",
  "Оптимизм": "Склонность видеть положительные стороны жизни и верить в успех",
  "Вера; Доверие": "Уверенность в чём-либо или ком-либо без необходимости доказательств",
  "Предвкушение": "Приятное ожидание чего-то хорошего в будущем",
  "Любовь": "Глубокое чувство привязанности, нежности и заботы о ком-то",
  "Близость": "Ощущение эмоциональной связи и понимания с другим человеком",
  "Благодарность; Признательность": "Чувство признательности за добро, помощь или что-то ценное",
  "Спокойствие; Умиротворение; Душевное равновесие": "Состояние внутренней гармонии и покоя",
  "Радость; Счастье": "Яркое позитивное переживание, ощущение полноты жизни",
  // Disharmonious
  "Недовольство; Раздражение": "Негативная реакция на что-то неприятное или несоответствующее ожиданиям",
  "Грусть; Печаль": "Состояние подавленности, связанное с утратой или разочарованием",
  "Страх": "Эмоциональная реакция на воспринимаемую угрозу или опасность",
  "Гнев; Злость; Ярость": "Сильное негативное чувство в ответ на несправедливость или препятствие",
  "Одиночество": "Ощущение отсутствия близких связей и понимания со стороны других",
  "Усталость; Сонливость; Вялость": "Состояние пониженной энергии и работоспособности",
  "Тревога; Беспокойство": "Неопределённое ощущение угрозы, волнение о будущем",
};

const DictionaryPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('harmonious');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedState, setExpandedState] = useState(null);

  const getDescription = (state) => {
    // Try to find exact match or partial match
    for (const [key, desc] of Object.entries(stateDescriptions)) {
      if (state.includes(key.split(';')[0]) || key.includes(state.split(';')[0])) {
        return desc;
      }
    }
    return "Описание будет добавлено позже";
  };

  const filterStates = (groups) => {
    if (!searchQuery.trim()) return groups;
    
    return groups.map(group => ({
      ...group,
      states: group.states.filter(state => 
        state.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(group => group.states.length > 0);
  };

  const renderGroups = (groups, type) => {
    const filtered = filterStates(groups);
    
    if (filtered.length === 0) {
      return (
        <p className="text-center text-white/50 py-8">Ничего не найдено</p>
      );
    }

    return (
      <div className="space-y-4">
        {filtered.map((group) => (
          <div key={group.id} className="glass rounded-xl p-4">
            <h3 className="text-white/60 text-sm mb-3">{group.name}</h3>
            <div className="space-y-2">
              {group.states.map((state, idx) => (
                <div key={idx}>
                  <button
                    onClick={() => setExpandedState(expandedState === `${group.id}-${idx}` ? null : `${group.id}-${idx}`)}
                    className="w-full text-left p-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <span className={`${type === 'harmonious' ? 'text-green-400' : 'text-red-400'}`}>
                      {state}
                    </span>
                  </button>
                  {expandedState === `${group.id}-${idx}` && (
                    <p className="text-white/60 text-sm px-2 pb-2 animate-fade-in">
                      {getDescription(state)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="dark-purple main-app-bg" data-testid="dictionary-page">
      <header className="flex items-center px-4 py-4 safe-area-pt">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
          <span>Словарь состояний</span>
        </button>
      </header>

      <main className="page-content px-4 pb-24">
        <h1 
          className="text-2xl md:text-3xl font-bold text-center mb-6 text-gradient-happiness"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          СЛОВАРЬ СОСТОЯНИЙ
        </h1>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск состояния..."
            className="pl-10 bg-black/20 border-white/10 text-white"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 bg-white/5 mb-6">
            <TabsTrigger 
              value="harmonious"
              className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 text-white/60"
            >
              Гармоничные
            </TabsTrigger>
            <TabsTrigger 
              value="disharmonious"
              className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400 text-white/60"
            >
              Дисгармоничные
            </TabsTrigger>
          </TabsList>

          <TabsContent value="harmonious">
            {renderGroups(harmoniousGroups, 'harmonious')}
          </TabsContent>

          <TabsContent value="disharmonious">
            {renderGroups(disharmoniousGroups, 'disharmonious')}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default DictionaryPage;
