import React, { useState, useEffect } from 'react';
import { Menu, Lightbulb, ArrowLeft, Play, Check, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { educationAPI } from '../lib/api';
import BottomNavigation from '../components/BottomNavigation';
import { Progress } from '../components/ui/progress';

const EducationPage = () => {
  const { logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await educationAPI.getCategories();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVideos = async (categoryId) => {
    setLoading(true);
    try {
      const data = await educationAPI.getCategoryVideos(categoryId);
      setVideos(data.videos || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    fetchVideos(category.id);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setVideos([]);
    setSelectedVideo(null);
  };

  const handleBackToVideos = () => {
    setSelectedVideo(null);
  };

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
  };

  const handleMarkComplete = async () => {
    if (!selectedVideo) return;
    try {
      await educationAPI.markVideoComplete(selectedVideo.id);
      // Update local state
      setVideos(prev => prev.map(v => 
        v.id === selectedVideo.id ? { ...v, completed: true } : v
      ));
      setSelectedVideo(prev => ({ ...prev, completed: true }));
      // Update category progress
      if (selectedCategory) {
        setSelectedCategory(prev => ({
          ...prev,
          watched_videos: prev.watched_videos + 1
        }));
      }
    } catch (error) {
      console.error('Error marking video complete:', error);
    }
  };

  // Video Player View
  if (selectedVideo) {
    return (
      <div className="dark-purple main-app-bg" data-testid="video-player-page">
        <header className="flex items-center justify-between px-4 py-4 safe-area-pt">
          <button 
            onClick={handleBackToVideos}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft size={24} />
            <span>Назад</span>
          </button>
          <button className="p-2 text-white/70 hover:text-white transition-colors">
            <Lightbulb size={24} />
          </button>
        </header>

        <main className="page-content px-4">
          <h2 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {selectedVideo.title}
          </h2>

          {/* Video Player */}
          <div className="aspect-video bg-black/40 rounded-xl overflow-hidden mb-6">
            <video 
              controls 
              className="w-full h-full"
              src={`${BACKEND_URL}${selectedVideo.file_url}`}
            >
              Ваш браузер не поддерживает видео
            </video>
          </div>

          {/* Description */}
          <p className="text-white/70 mb-6">{selectedVideo.description}</p>

          {/* Mark Complete Button */}
          {!selectedVideo.completed ? (
            <button
              onClick={handleMarkComplete}
              className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Check size={20} />
              Отметить как изученное
            </button>
          ) : (
            <div className="w-full bg-green-500/20 text-green-400 py-3 rounded-xl font-semibold text-center flex items-center justify-center gap-2">
              <Check size={20} />
              Изучено
            </div>
          )}
        </main>

        <BottomNavigation />
      </div>
    );
  }

  // Videos List View
  if (selectedCategory) {
    const progress = selectedCategory.total_videos > 0 
      ? (selectedCategory.watched_videos / selectedCategory.total_videos) * 100 
      : 0;

    return (
      <div className="dark-purple main-app-bg" data-testid="videos-list-page">
        <header className="flex items-center justify-between px-4 py-4 safe-area-pt">
          <button 
            onClick={handleBackToCategories}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft size={24} />
            <span>{selectedCategory.name}</span>
          </button>
          <button className="p-2 text-white/70 hover:text-white transition-colors">
            <Lightbulb size={24} />
          </button>
        </header>

        <main className="page-content px-4">
          {/* Progress */}
          <div className="glass rounded-xl p-4 mb-6">
            <p className="text-white/60 text-sm mb-2">
              Прогресс курса: Изучено {selectedCategory.watched_videos}/{selectedCategory.total_videos}
            </p>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Videos List */}
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-12 h-12 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : videos.length > 0 ? (
            <div className="space-y-3">
              {videos.map((video, idx) => (
                <button
                  key={video.id}
                  onClick={() => handleVideoClick(video)}
                  className="w-full glass rounded-xl p-4 text-left hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      video.completed ? 'bg-green-500' : 'bg-[#8B5CF6]'
                    }`}>
                      {video.completed ? <Check size={20} className="text-white" /> : <Play size={20} className="text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">Видео {idx + 1}</p>
                      <p className="text-white/50 text-sm line-clamp-1">{video.description || video.title}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-center text-white/50">Видео ещё не добавлены</p>
          )}
        </main>

        <BottomNavigation />
      </div>
    );
  }

  // Categories List View
  return (
    <div className="dark-purple main-app-bg" data-testid="education-page">
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
          className="text-3xl md:text-4xl font-bold text-center mb-2 text-gradient-happiness"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          ОБУЧЕНИЕ
        </h1>
        <p className="text-center text-white/50 text-sm mb-6">
          Информация приоритезирована
        </p>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-12 h-12 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : categories.length > 0 ? (
          <div className="space-y-4">
            {categories.map((category) => {
              const progress = category.total_videos > 0 
                ? (category.watched_videos / category.total_videos) * 100 
                : 0;

              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category)}
                  className="w-full glass rounded-xl p-4 text-left hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-semibold">{category.name}</h3>
                    <span className="text-white/50 text-sm">
                      {category.watched_videos}/{category.total_videos}
                    </span>
                  </div>
                  {category.description && (
                    <p className="text-white/50 text-sm mb-3 line-clamp-2">{category.description}</p>
                  )}
                  <Progress value={progress} className="h-2" />
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-white/50 py-12">
            <Lock size={48} className="mx-auto mb-4 opacity-50" />
            <p>Курсы ещё не добавлены</p>
            <p className="text-sm mt-2">Скоро здесь появится обучающий контент</p>
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

export default EducationPage;
