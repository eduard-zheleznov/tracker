import React from 'react';
import { Menu, Lightbulb, Construction } from 'lucide-react';
import BottomNavigation from '../components/BottomNavigation';

const PlaceholderPage = ({ title }) => {
  return (
    <div className="dark-purple main-app-bg" data-testid={`${title.toLowerCase()}-page`}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 safe-area-pt">
        <button className="p-2 text-white/70 hover:text-white transition-colors">
          <Menu size={24} />
        </button>
        <button className="p-2 text-white/70 hover:text-white transition-colors">
          <Lightbulb size={24} />
        </button>
      </header>

      {/* Main Content */}
      <main className="page-content px-4 flex flex-col items-center justify-center min-h-[60vh]">
        <Construction size={64} className="text-white/30 mb-4" />
        <h1 
          className="text-3xl font-bold text-center mb-4 text-gradient-happiness"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          {title}
        </h1>
        <p className="text-white/50 text-center">
          Этот раздел находится в разработке
        </p>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export const EducationPage = () => <PlaceholderPage title="Обучение" />;
export const AnalysisPage = () => <PlaceholderPage title="Анализ" />;
export const StrategyPage = () => <PlaceholderPage title="Стратегия" />;
