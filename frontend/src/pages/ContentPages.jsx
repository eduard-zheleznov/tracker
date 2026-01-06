import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { contentAPI } from '../lib/api';
import BottomNavigation from '../components/BottomNavigation';
import ReactMarkdown from 'react-markdown';

const ContentPage = ({ contentKey, title }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState(null);

  useEffect(() => {
    fetchContent();
  }, [contentKey]);

  const fetchContent = async () => {
    try {
      const data = await contentAPI.get(contentKey);
      setContent(data);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dark-purple main-app-bg flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="dark-purple main-app-bg" data-testid={`${contentKey}-page`}>
      <header className="flex items-center px-4 py-4 safe-area-pt">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
          <span>{content?.title || title}</span>
        </button>
      </header>

      <main className="page-content px-4 pb-24">
        {content?.content ? (
          <div className="prose prose-invert prose-purple max-w-none">
            <div className="text-white/80 space-y-4 markdown-content">
              {/* Simple markdown rendering */}
              {content.content.split('\n').map((line, idx) => {
                if (line.startsWith('## ')) {
                  return <h2 key={idx} className="text-2xl font-bold text-white mt-6 mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>{line.slice(3)}</h2>;
                }
                if (line.startsWith('### ')) {
                  return <h3 key={idx} className="text-xl font-semibold text-white mt-4 mb-2">{line.slice(4)}</h3>;
                }
                if (line.startsWith('- ')) {
                  return <li key={idx} className="text-white/80 ml-4">{line.slice(2)}</li>;
                }
                if (line.startsWith('*') && line.endsWith('*')) {
                  return <p key={idx} className="text-white/50 italic">{line.slice(1, -1)}</p>;
                }
                if (line.startsWith('**') && line.endsWith('**')) {
                  return <p key={idx} className="text-white font-semibold">{line.slice(2, -2)}</p>;
                }
                if (line === '---') {
                  return <hr key={idx} className="border-white/10 my-6" />;
                }
                if (line.trim() === '') {
                  return <div key={idx} className="h-2" />;
                }
                // Handle inline bold
                const parts = line.split(/(\*\*[^*]+\*\*)/);
                return (
                  <p key={idx} className="text-white/80">
                    {parts.map((part, i) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={i} className="text-[#8B5CF6]">{part.slice(2, -2)}</strong>;
                      }
                      return part;
                    })}
                  </p>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-center text-white/50">Контент не найден</p>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

// Export specific pages
export const PsychologistPage = () => <ContentPage contentKey="psychologist" title="Ваш психолог" />;
export const TariffPage = () => <ContentPage contentKey="tariff" title="Тарифные планы" />;
export const AuthorPage = () => <ContentPage contentKey="author" title="Слово от автора" />;

export default ContentPage;
