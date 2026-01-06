import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bell, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { remindersAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Input } from '../components/ui/input';
import BottomNavigation from '../components/BottomNavigation';

const RemindersPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reminders, setReminders] = useState({
    assessment_enabled: false,
    assessment_time: '22:00',
    analysis_enabled: false,
    analysis_time: '10:00',
    strategy_enabled: false,
    strategy_time: '10:00',
    education_enabled: false,
    education_time: '10:00',
  });

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const data = await remindersAPI.get();
      setReminders({
        assessment_enabled: data.assessment_enabled || false,
        assessment_time: data.assessment_time || '22:00',
        analysis_enabled: data.analysis_enabled || false,
        analysis_time: data.analysis_time || '10:00',
        strategy_enabled: data.strategy_enabled || false,
        strategy_time: data.strategy_time || '10:00',
        education_enabled: data.education_enabled || false,
        education_time: data.education_time || '10:00',
      });
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await remindersAPI.update(reminders);
      alert('Напоминания сохранены');
    } catch (error) {
      console.error('Error saving reminders:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (field) => {
    setReminders(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleTimeChange = (field, value) => {
    setReminders(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="dark-purple main-app-bg flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const reminderItems = [
    {
      key: 'assessment',
      label: 'Выставить оценку состояния',
      enabledField: 'assessment_enabled',
      timeField: 'assessment_time',
    },
    {
      key: 'analysis',
      label: 'Провести анализ состояний',
      enabledField: 'analysis_enabled',
      timeField: 'analysis_time',
    },
    {
      key: 'strategy',
      label: 'Уделить время стратегии',
      enabledField: 'strategy_enabled',
      timeField: 'strategy_time',
    },
    {
      key: 'education',
      label: 'Уделить время обучению',
      enabledField: 'education_enabled',
      timeField: 'education_time',
    },
  ];

  return (
    <div className="dark-purple main-app-bg" data-testid="reminders-page">
      <header className="flex items-center px-4 py-4 safe-area-pt">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
          <span>Напоминания</span>
        </button>
      </header>

      <main className="page-content px-4 pb-24">
        <div className="space-y-4">
          {reminderItems.map((item) => (
            <div key={item.key} className="glass rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Bell size={20} className="text-[#8B5CF6]" />
                  <span className="text-white">{item.label}</span>
                </div>
                <Switch
                  checked={reminders[item.enabledField]}
                  onCheckedChange={() => handleToggle(item.enabledField)}
                />
              </div>
              
              {reminders[item.enabledField] && (
                <div className="flex items-center gap-3 pl-8 animate-fade-in">
                  <Clock size={16} className="text-white/50" />
                  <Input
                    type="time"
                    value={reminders[item.timeField]}
                    onChange={(e) => handleTimeChange(item.timeField, e.target.value)}
                    className="w-32 bg-black/20 border-white/10 text-white"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full mt-6 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white py-6"
        >
          {saving ? 'Сохранение...' : 'Готово'}
        </Button>

        <p className="text-white/40 text-xs text-center mt-4">
          * Для работы напоминаний необходимо разрешить уведомления в настройках устройства
        </p>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default RemindersPage;
