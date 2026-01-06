import React, { useState } from 'react';
import { Menu, Lightbulb, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { assessmentAPI } from '../lib/api';
import { harmoniousGroups, disharmoniousGroups, decisionTypes } from '../lib/statesData';
import StateGroup from '../components/StateGroup';
import BottomNavigation from '../components/BottomNavigation';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

const AssessmentPage = () => {
  const { logout } = useAuth();
  const [selectedHarmonious, setSelectedHarmonious] = useState([]);
  const [selectedDisharmonious, setSelectedDisharmonious] = useState([]);
  const [reflection, setReflection] = useState('');
  const [decisionType, setDecisionType] = useState('');
  const [decisionText, setDecisionText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleHarmoniousToggle = (state) => {
    setSelectedHarmonious(prev => 
      prev.includes(state) 
        ? prev.filter(s => s !== state)
        : [...prev, state]
    );
  };

  const handleHarmoniousGroupToggle = (states) => {
    const allSelected = states.every(s => selectedHarmonious.includes(s));
    if (allSelected) {
      setSelectedHarmonious(prev => prev.filter(s => !states.includes(s)));
    } else {
      setSelectedHarmonious(prev => [...new Set([...prev, ...states])]);
    }
  };

  const handleDisharmoniousToggle = (state) => {
    setSelectedDisharmonious(prev => 
      prev.includes(state) 
        ? prev.filter(s => s !== state)
        : [...prev, state]
    );
  };

  const handleDisharmoniousGroupToggle = (states) => {
    const allSelected = states.every(s => selectedDisharmonious.includes(s));
    if (allSelected) {
      setSelectedDisharmonious(prev => prev.filter(s => !states.includes(s)));
    } else {
      setSelectedDisharmonious(prev => [...new Set([...prev, ...states])]);
    }
  };

  const handleSubmit = async () => {
    if (selectedHarmonious.length === 0 && selectedDisharmonious.length === 0) {
      return;
    }

    setLoading(true);
    try {
      await assessmentAPI.create({
        harmoniousStates: selectedHarmonious,
        disharmoniousStates: selectedDisharmonious,
        reflection,
        decisionType,
        decisionText,
      });
      
      setShowSuccess(true);
    } catch (error) {
      console.error('Error submitting assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    // Reset form
    setSelectedHarmonious([]);
    setSelectedDisharmonious([]);
    setReflection('');
    setDecisionType('');
    setDecisionText('');
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="dark-purple main-app-bg" data-testid="assessment-page">
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
        <div className="absolute top-16 left-4 z-50 glass rounded-xl p-4 animate-scale-in">
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
      <main className="page-content px-4 pb-24">
        {/* Harmonious States Section */}
        <section className="mb-8">
          <h1 
            className="text-3xl md:text-4xl font-bold text-center mb-6 text-gradient-happiness"
            style={{ fontFamily: 'Outfit, sans-serif' }}
            data-testid="harmonious-title"
          >
            ГАРМОНИЧНЫЕ<br />СОСТОЯНИЯ
          </h1>
          
          <div className="space-y-4">
            {harmoniousGroups.map(group => (
              <StateGroup
                key={`harmonious-${group.id}`}
                group={group}
                selectedStates={selectedHarmonious}
                onStateToggle={handleHarmoniousToggle}
                onGroupToggle={handleHarmoniousGroupToggle}
                type="harmonious"
              />
            ))}
          </div>
        </section>

        {/* Disharmonious States Section */}
        <section className="mb-8">
          <h2 
            className="text-3xl md:text-4xl font-bold text-center mb-6 text-gradient-happiness"
            style={{ fontFamily: 'Outfit, sans-serif' }}
            data-testid="disharmonious-title"
          >
            ДИСГАРМОНИЧНЫЕ<br />СОСТОЯНИЯ
          </h2>
          
          <div className="space-y-4">
            {disharmoniousGroups.map(group => (
              <StateGroup
                key={`disharmonious-${group.id}`}
                group={group}
                selectedStates={selectedDisharmonious}
                onStateToggle={handleDisharmoniousToggle}
                onGroupToggle={handleDisharmoniousGroupToggle}
                type="disharmonious"
              />
            ))}
          </div>
        </section>

        {/* Reflection Section */}
        <section className="mb-6">
          <h3 className="text-xl font-semibold text-white mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Выводы (саморефлексия)
          </h3>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Например вы можете поразмышлять о том, что хорошего эти проявленности для вас хотят и за что их поблагодарить"
            className="dark-textarea"
            rows={4}
            data-testid="reflection-input"
          />
        </section>

        {/* Decision Section */}
        <section className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Решения (что сделаю)
          </h3>
          
          <Select value={decisionType} onValueChange={setDecisionType}>
            <SelectTrigger 
              className="w-full bg-black/20 border-white/10 text-white mb-3"
              data-testid="decision-type-select"
            >
              <SelectValue placeholder="Выберите тип задачи" />
            </SelectTrigger>
            <SelectContent className="bg-[#1F1135] border-white/10">
              {decisionTypes.map(type => (
                <SelectItem 
                  key={type.value} 
                  value={type.value}
                  className="text-white hover:bg-white/10 focus:bg-white/10"
                >
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <textarea
            value={decisionText}
            onChange={(e) => setDecisionText(e.target.value)}
            placeholder="Введите текст"
            className="dark-textarea"
            rows={3}
            data-testid="decision-text-input"
          />
        </section>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={loading || (selectedHarmonious.length === 0 && selectedDisharmonious.length === 0)}
          className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white py-6 text-lg font-semibold neon-glow"
          data-testid="submit-assessment-btn"
        >
          {loading ? 'Отправка...' : 'Отправить'}
        </Button>

        {/* Hint link */}
        <p className="text-center text-white/50 text-sm mt-4">
          Узнайте о том где и как лучше{' '}
          <button className="text-[#8B5CF6] hover:underline">
            управлять задачами и привычками
          </button>
        </p>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Success Modal */}
      {showSuccess && (
        <div className="success-modal" data-testid="success-modal">
          <div className="success-modal-content animate-scale-in">
            <div className="flex justify-center mb-4">
              <CheckCircle size={64} className="text-white/70" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Информация<br />отправлена
            </h2>
            <Button
              onClick={handleSuccessClose}
              className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-12"
              data-testid="success-ok-btn"
            >
              Ok
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentPage;
