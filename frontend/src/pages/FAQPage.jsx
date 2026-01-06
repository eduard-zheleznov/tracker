import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, Send, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { faqAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import BottomNavigation from '../components/BottomNavigation';

const FAQPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchFAQ();
  }, []);

  const fetchFAQ = async () => {
    try {
      const data = await faqAPI.getAll();
      setQuestions(data.questions || []);
    } catch (error) {
      console.error('Error fetching FAQ:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    setSubmitting(true);
    try {
      await faqAPI.submitQuestion(newQuestion);
      setNewQuestion('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error submitting question:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Group questions by topic
  const groupedQuestions = questions.reduce((acc, q) => {
    const topic = q.topic || 'Общие';
    if (!acc[topic]) acc[topic] = [];
    acc[topic].push(q);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="dark-purple main-app-bg flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="dark-purple main-app-bg" data-testid="faq-page">
      <header className="flex items-center px-4 py-4 safe-area-pt">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
          <span>Вопросы и ответы</span>
        </button>
      </header>

      <main className="page-content px-4 pb-24">
        {/* Questions List */}
        {Object.keys(groupedQuestions).length > 0 ? (
          <div className="space-y-6 mb-8">
            {Object.entries(groupedQuestions).map(([topic, topicQuestions]) => (
              <div key={topic}>
                <h3 className="text-white/60 text-sm mb-3 font-medium">{topic}</h3>
                <div className="space-y-2">
                  {topicQuestions.map((q) => (
                    <div key={q.id} className="glass rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                        className="w-full p-4 flex items-center justify-between text-left"
                      >
                        <span className="text-white pr-4">{q.question}</span>
                        {expandedId === q.id ? (
                          <ChevronUp size={20} className="text-white/50 flex-shrink-0" />
                        ) : (
                          <ChevronDown size={20} className="text-white/50 flex-shrink-0" />
                        )}
                      </button>
                      {expandedId === q.id && q.answer && (
                        <div className="px-4 pb-4 border-t border-white/10">
                          <p className="text-white/70 pt-4">{q.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-white/50">
            <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
            <p>Вопросов пока нет</p>
          </div>
        )}

        {/* Ask Question Form */}
        <div className="glass rounded-xl p-4">
          <h3 className="text-white font-semibold mb-3">Задать вопрос</h3>
          <form onSubmit={handleSubmit}>
            <Input
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Введите ваш вопрос..."
              className="bg-black/20 border-white/10 text-white mb-3"
            />
            <Button
              type="submit"
              disabled={submitting || !newQuestion.trim()}
              className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
            >
              {submitting ? 'Отправка...' : (
                <>
                  <Send size={16} className="mr-2" />
                  Отправить
                </>
              )}
            </Button>
          </form>

          {showSuccess && (
            <p className="text-green-400 text-sm mt-3 text-center animate-fade-in">
              Вопрос отправлен! Мы ответим в ближайшее время.
            </p>
          )}
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default FAQPage;
