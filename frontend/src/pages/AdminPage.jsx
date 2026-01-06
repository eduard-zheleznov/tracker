import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../lib/api';
import { 
  ArrowLeft, Users, FileText, HelpCircle, MessageCircle,
  Video, FolderOpen, Plus, Trash2, Edit2, Eye, EyeOff, Save, X
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Switch } from '../components/ui/switch';

const AdminPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  
  // Stats
  const [stats, setStats] = useState(null);
  
  // FAQ
  const [faqs, setFaqs] = useState([]);
  const [editingFaq, setEditingFaq] = useState(null);
  
  // Content
  const [contents, setContents] = useState([]);
  const [editingContent, setEditingContent] = useState(null);
  
  // Categories
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  
  // Videos
  const [videos, setVideos] = useState([]);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  
  // Feedback
  const [feedback, setFeedback] = useState([]);

  useEffect(() => {
    if (!user?.is_admin) {
      navigate('/');
      return;
    }
    fetchData();
  }, [user, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'dashboard') {
        const data = await adminAPI.getStats();
        setStats(data);
      } else if (activeTab === 'faq') {
        const data = await adminAPI.getFAQ();
        setFaqs(data.questions || []);
      } else if (activeTab === 'content') {
        const data = await adminAPI.getAllContent();
        setContents(data.content || []);
      } else if (activeTab === 'categories') {
        const data = await adminAPI.getCategories();
        setCategories(data.categories || []);
      } else if (activeTab === 'videos') {
        const data = await adminAPI.getVideos();
        setVideos(data.videos || []);
      } else if (activeTab === 'feedback') {
        const data = await adminAPI.getFeedback();
        setFeedback(data.feedback || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // FAQ handlers
  const handleSaveFaq = async () => {
    try {
      if (editingFaq.id) {
        await adminAPI.updateFAQ(editingFaq.id, editingFaq);
      } else {
        await adminAPI.createFAQ(editingFaq);
      }
      setEditingFaq(null);
      fetchData();
    } catch (error) {
      console.error('Error saving FAQ:', error);
    }
  };

  const handleDeleteFaq = async (id) => {
    if (!window.confirm('Удалить вопрос?')) return;
    try {
      await adminAPI.deleteFAQ(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
    }
  };

  // Content handlers
  const handleSaveContent = async () => {
    try {
      await adminAPI.updateContent(editingContent.key, editingContent);
      setEditingContent(null);
      fetchData();
    } catch (error) {
      console.error('Error saving content:', error);
    }
  };

  // Category handlers
  const handleSaveCategory = async () => {
    try {
      if (editingCategory.id) {
        await adminAPI.updateCategory(editingCategory.id, editingCategory);
      } else {
        await adminAPI.createCategory(editingCategory);
      }
      setEditingCategory(null);
      fetchData();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Удалить категорию и все её видео?')) return;
    try {
      await adminAPI.deleteCategory(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  // Video handlers
  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const title = prompt('Название видео:');
    if (!title) return;

    const description = prompt('Описание:') || '';
    const categoryId = prompt('ID категории:');
    if (!categoryId) {
      alert('Укажите ID категории');
      return;
    }

    setUploadingVideo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category_id', categoryId);
      formData.append('tags', '');
      formData.append('impact_scores', '{}');
      formData.append('order', '0');

      await adminAPI.uploadVideo(formData);
      fetchData();
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Ошибка загрузки видео');
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleToggleVideoBlock = async (id, currentBlocked) => {
    try {
      await adminAPI.toggleVideoBlock(id, !currentBlocked);
      fetchData();
    } catch (error) {
      console.error('Error toggling video:', error);
    }
  };

  const handleDeleteVideo = async (id) => {
    if (!window.confirm('Удалить видео?')) return;
    try {
      await adminAPI.deleteVideo(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  };

  return (
    <div className="dark-purple main-app-bg min-h-screen" data-testid="admin-page">
      <header className="flex items-center px-4 py-4 safe-area-pt border-b border-white/10">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
          <span>Админ-панель</span>
        </button>
      </header>

      <main className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 bg-white/5 mb-6">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-[#8B5CF6] text-white/60 text-xs">
              Обзор
            </TabsTrigger>
            <TabsTrigger value="faq" className="data-[state=active]:bg-[#8B5CF6] text-white/60 text-xs">
              FAQ
            </TabsTrigger>
            <TabsTrigger value="content" className="data-[state=active]:bg-[#8B5CF6] text-white/60 text-xs">
              Тексты
            </TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-[#8B5CF6] text-white/60 text-xs">
              Категории
            </TabsTrigger>
            <TabsTrigger value="videos" className="data-[state=active]:bg-[#8B5CF6] text-white/60 text-xs">
              Видео
            </TabsTrigger>
            <TabsTrigger value="feedback" className="data-[state=active]:bg-[#8B5CF6] text-white/60 text-xs">
              Отзывы
            </TabsTrigger>
          </TabsList>

          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-12 h-12 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Dashboard */}
              <TabsContent value="dashboard">
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass rounded-xl p-4 text-center">
                    <Users size={32} className="mx-auto mb-2 text-[#8B5CF6]" />
                    <p className="text-2xl font-bold text-white">{stats?.users || 0}</p>
                    <p className="text-white/60 text-sm">Пользователей</p>
                  </div>
                  <div className="glass rounded-xl p-4 text-center">
                    <FileText size={32} className="mx-auto mb-2 text-green-400" />
                    <p className="text-2xl font-bold text-white">{stats?.assessments || 0}</p>
                    <p className="text-white/60 text-sm">Оценок</p>
                  </div>
                  <div className="glass rounded-xl p-4 text-center">
                    <HelpCircle size={32} className="mx-auto mb-2 text-yellow-400" />
                    <p className="text-2xl font-bold text-white">{stats?.pending_questions || 0}</p>
                    <p className="text-white/60 text-sm">Вопросов (ждут)</p>
                  </div>
                  <div className="glass rounded-xl p-4 text-center">
                    <MessageCircle size={32} className="mx-auto mb-2 text-blue-400" />
                    <p className="text-2xl font-bold text-white">{stats?.feedback || 0}</p>
                    <p className="text-white/60 text-sm">Отзывов</p>
                  </div>
                </div>
              </TabsContent>

              {/* FAQ Management */}
              <TabsContent value="faq">
                <Button
                  onClick={() => setEditingFaq({ question: '', answer: '', topic: 'Общие', is_published: false })}
                  className="mb-4 bg-[#8B5CF6]"
                >
                  <Plus size={16} className="mr-2" />
                  Добавить FAQ
                </Button>

                {editingFaq && (
                  <div className="glass rounded-xl p-4 mb-4">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-white/60">Тема</Label>
                        <Input
                          value={editingFaq.topic}
                          onChange={(e) => setEditingFaq({ ...editingFaq, topic: e.target.value })}
                          className="bg-black/20 border-white/10 text-white mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-white/60">Вопрос</Label>
                        <Input
                          value={editingFaq.question}
                          onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                          className="bg-black/20 border-white/10 text-white mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-white/60">Ответ</Label>
                        <textarea
                          value={editingFaq.answer}
                          onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                          className="w-full h-24 bg-black/20 border border-white/10 rounded-lg p-2 text-white mt-1"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={editingFaq.is_published}
                          onCheckedChange={(v) => setEditingFaq({ ...editingFaq, is_published: v })}
                        />
                        <span className="text-white/60 text-sm">Опубликован</span>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSaveFaq} className="bg-green-600">
                          <Save size={16} className="mr-2" />
                          Сохранить
                        </Button>
                        <Button onClick={() => setEditingFaq(null)} variant="outline" className="border-white/20 text-white">
                          <X size={16} className="mr-2" />
                          Отмена
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {faqs.map((faq) => (
                    <div key={faq.id} className="glass rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-white font-medium">{faq.question}</p>
                          <p className="text-white/50 text-sm mt-1">{faq.answer || 'Без ответа'}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-[#8B5CF6]">{faq.topic}</span>
                            {faq.is_published ? (
                              <span className="text-xs text-green-400">Опубликован</span>
                            ) : (
                              <span className="text-xs text-yellow-400">Черновик</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setEditingFaq(faq)} className="text-white/50 hover:text-white">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDeleteFaq(faq.id)} className="text-red-400 hover:text-red-300">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Content Management */}
              <TabsContent value="content">
                <div className="space-y-4">
                  {['psychologist', 'tariff', 'author'].map((key) => {
                    const content = contents.find(c => c.key === key);
                    return (
                      <div key={key} className="glass rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-white font-semibold">
                            {key === 'psychologist' ? 'Ваш психолог' : key === 'tariff' ? 'Тарифы' : 'Слово от автора'}
                          </h3>
                          <button
                            onClick={() => setEditingContent(content || { key, title: '', content: '' })}
                            className="text-[#8B5CF6] hover:text-[#7C3AED]"
                          >
                            <Edit2 size={16} />
                          </button>
                        </div>
                        <p className="text-white/50 text-sm line-clamp-2">
                          {content?.content?.slice(0, 100) || 'Не настроено'}...
                        </p>
                      </div>
                    );
                  })}
                </div>

                {editingContent && (
                  <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1F1135] rounded-xl p-4 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                      <h3 className="text-white font-semibold mb-4">Редактирование контента</h3>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-white/60">Заголовок</Label>
                          <Input
                            value={editingContent.title}
                            onChange={(e) => setEditingContent({ ...editingContent, title: e.target.value })}
                            className="bg-black/20 border-white/10 text-white mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-white/60">Контент (Markdown)</Label>
                          <textarea
                            value={editingContent.content}
                            onChange={(e) => setEditingContent({ ...editingContent, content: e.target.value })}
                            className="w-full h-64 bg-black/20 border border-white/10 rounded-lg p-2 text-white mt-1 font-mono text-sm"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleSaveContent} className="bg-green-600">
                            <Save size={16} className="mr-2" />
                            Сохранить
                          </Button>
                          <Button onClick={() => setEditingContent(null)} variant="outline" className="border-white/20 text-white">
                            Отмена
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Categories */}
              <TabsContent value="categories">
                <Button
                  onClick={() => setEditingCategory({ name: '', description: '', order: 0, is_blocked: false })}
                  className="mb-4 bg-[#8B5CF6]"
                >
                  <Plus size={16} className="mr-2" />
                  Добавить категорию
                </Button>

                {editingCategory && (
                  <div className="glass rounded-xl p-4 mb-4">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-white/60">Название</Label>
                        <Input
                          value={editingCategory.name}
                          onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                          className="bg-black/20 border-white/10 text-white mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-white/60">Описание</Label>
                        <Input
                          value={editingCategory.description}
                          onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                          className="bg-black/20 border-white/10 text-white mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-white/60">Порядок</Label>
                        <Input
                          type="number"
                          value={editingCategory.order}
                          onChange={(e) => setEditingCategory({ ...editingCategory, order: parseInt(e.target.value) })}
                          className="bg-black/20 border-white/10 text-white mt-1"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSaveCategory} className="bg-green-600">
                          <Save size={16} className="mr-2" />
                          Сохранить
                        </Button>
                        <Button onClick={() => setEditingCategory(null)} variant="outline" className="border-white/20 text-white">
                          Отмена
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {categories.map((cat) => (
                    <div key={cat.id} className="glass rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">{cat.name}</p>
                          <p className="text-white/50 text-sm">{cat.description}</p>
                          <p className="text-white/30 text-xs mt-1">ID: {cat.id}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setEditingCategory(cat)} className="text-white/50 hover:text-white">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-400 hover:text-red-300">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Videos */}
              <TabsContent value="videos">
                <div className="mb-4">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                    id="video-upload"
                    disabled={uploadingVideo}
                  />
                  <label
                    htmlFor="video-upload"
                    className={`inline-flex items-center px-4 py-2 rounded-lg cursor-pointer ${
                      uploadingVideo ? 'bg-gray-500' : 'bg-[#8B5CF6] hover:bg-[#7C3AED]'
                    } text-white`}
                  >
                    <Video size={16} className="mr-2" />
                    {uploadingVideo ? 'Загрузка...' : 'Загрузить видео'}
                  </label>
                </div>

                <div className="space-y-2">
                  {videos.map((video) => (
                    <div key={video.id} className="glass rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">{video.title}</p>
                          <p className="text-white/50 text-sm">{video.description}</p>
                          <p className="text-white/30 text-xs mt-1">Категория: {video.category_id}</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleToggleVideoBlock(video.id, video.is_blocked)}
                            className={video.is_blocked ? 'text-yellow-400' : 'text-green-400'}
                          >
                            {video.is_blocked ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                          <button onClick={() => handleDeleteVideo(video.id)} className="text-red-400 hover:text-red-300">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Feedback */}
              <TabsContent value="feedback">
                <div className="space-y-2">
                  {feedback.map((fb) => (
                    <div key={fb.id} className="glass rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className={star <= fb.rating ? 'text-yellow-400' : 'text-white/20'}>
                            ★
                          </span>
                        ))}
                        <span className="text-white/40 text-xs ml-2">
                          {new Date(fb.created_at).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                      {fb.suggestion && (
                        <p className="text-white/70">{fb.suggestion}</p>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPage;
