import React, { useState } from 'react';
import { ArrowLeft, Star, Send, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { feedbackAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import BottomNavigation from '../components/BottomNavigation';

const FeedbackPage = () => {
  const navigate = useNavigate();
  const [rating, setRating] = useState(5);
  const [suggestion, setSuggestion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await feedbackAPI.submit(rating, suggestion);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="dark-purple main-app-bg" data-testid="feedback-success">
        <header className="flex items-center px-4 py-4 safe-area-pt">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
        </header>

        <main className="page-content px-4 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-center animate-scale-in">
            <CheckCircle size={80} className="mx-auto mb-6 text-green-400" />
            <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Информация отправлена
            </h2>
            <p className="text-white/60 mb-6">Спасибо за обратную связь!</p>
            <Button
              onClick={() => navigate(-1)}
              className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-8"
            >
              Ok
            </Button>
          </div>
        </main>

        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="dark-purple main-app-bg" data-testid="feedback-page">
      <header className="flex items-center px-4 py-4 safe-area-pt">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
          <span>Обратная связь</span>
        </button>
      </header>

      <main className="page-content px-4 pb-24">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Вам нравится наше приложение?
          </h2>
          <p className="text-white/60">Поддержите его!</p>
        </div>

        {/* Star Rating */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110"
            >
              <Star
                size={40}
                className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-white/20'}
              />
            </button>
          ))}
        </div>

        <p className="text-center text-white/60 mb-6">
          Поставьте нам 5 звёзд
        </p>

        {/* Suggestion */}
        <div className="glass rounded-xl p-4 mb-6">
          <h3 className="text-white font-semibold mb-3">Предложите улучшения</h3>
          <textarea
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            placeholder="Напишите ваши идеи и предложения..."
            className="w-full h-32 bg-black/20 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/30 resize-none focus:outline-none focus:border-[#8B5CF6]/50"
          />
        </div>

        <p className="text-white/40 text-sm text-center mb-6">
          * Если ваше предложение будет реализовано, вы получите 6 месяцев лучшего тарифа бесплатно!
        </p>

        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white py-6"
        >
          {submitting ? 'Отправка...' : (
            <>
              <Send size={20} className="mr-2" />
              Отправить
            </>
          )}
        </Button>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default FeedbackPage;
