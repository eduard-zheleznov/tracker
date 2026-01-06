import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { profileAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import BottomNavigation from '../components/BottomNavigation';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    field_of_activity: '',
    about_me: '',
    income_level: '',
    hobbies: '',
    country: '',
    phone: '',
    email: '',
    telegram: '',
    social_vk: '',
    social_instagram: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await profileAPI.get();
      setProfile({
        name: data.name || '',
        age: data.age || '',
        field_of_activity: data.field_of_activity || '',
        about_me: data.about_me || '',
        income_level: data.income_level || '',
        hobbies: data.hobbies || '',
        country: data.country || '',
        phone: data.phone || '',
        email: data.email || '',
        telegram: data.telegram || '',
        social_vk: data.social_vk || '',
        social_instagram: data.social_instagram || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await profileAPI.update({
        ...profile,
        age: parseInt(profile.age) || 0,
      });
      alert('Профиль сохранён');
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const incomeOptions = [
    'До 30 000 руб/мес',
    '30 000 - 50 000 руб/мес',
    '50 000 - 90 000 руб/мес',
    '90 000 - 150 000 руб/мес',
    '150 000 - 300 000 руб/мес',
    'Более 300 000 руб/мес',
  ];

  const countryOptions = [
    'Россия',
    'Украина',
    'Беларусь',
    'Казахстан',
    'Узбекистан',
    'Другая',
  ];

  if (loading) {
    return (
      <div className="dark-purple main-app-bg flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="dark-purple main-app-bg" data-testid="profile-page">
      <header className="flex items-center px-4 py-4 safe-area-pt">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
          <span>Ваш профиль</span>
        </button>
      </header>

      <main className="page-content px-4 pb-24">
        <div className="space-y-6">
          {/* About section */}
          <section className="space-y-4">
            <h3 className="text-white/80 font-semibold">О себе</h3>
            
            <div>
              <Label className="text-white/60">Возраст</Label>
              <Input
                type="number"
                value={profile.age}
                onChange={(e) => handleChange('age', e.target.value)}
                placeholder="Введите возраст"
                className="mt-1 bg-black/20 border-white/10 text-white"
              />
            </div>

            <div>
              <Label className="text-white/60">Имя и Фамилия</Label>
              <Input
                value={profile.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Введите имя"
                className="mt-1 bg-black/20 border-white/10 text-white"
              />
            </div>

            <div>
              <Label className="text-white/60">Сфера деятельности</Label>
              <Input
                value={profile.field_of_activity}
                onChange={(e) => handleChange('field_of_activity', e.target.value)}
                placeholder="Например: Психолог"
                className="mt-1 bg-black/20 border-white/10 text-white"
              />
            </div>
          </section>

          {/* More about section */}
          <section className="space-y-4">
            <h3 className="text-white/80 font-semibold">Больше о себе</h3>
            
            <div>
              <Label className="text-white/60">Уровень дохода</Label>
              <Select value={profile.income_level} onValueChange={(v) => handleChange('income_level', v)}>
                <SelectTrigger className="mt-1 bg-black/20 border-white/10 text-white">
                  <SelectValue placeholder="Выберите" />
                </SelectTrigger>
                <SelectContent className="bg-[#1F1135] border-white/10">
                  {incomeOptions.map(opt => (
                    <SelectItem key={opt} value={opt} className="text-white">
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white/60">Хобби и увлечения</Label>
              <Input
                value={profile.hobbies}
                onChange={(e) => handleChange('hobbies', e.target.value)}
                placeholder="Введите текст"
                className="mt-1 bg-black/20 border-white/10 text-white"
              />
            </div>

            <div>
              <Label className="text-white/60">Страна проживания</Label>
              <Select value={profile.country} onValueChange={(v) => handleChange('country', v)}>
                <SelectTrigger className="mt-1 bg-black/20 border-white/10 text-white">
                  <SelectValue placeholder="Выберите" />
                </SelectTrigger>
                <SelectContent className="bg-[#1F1135] border-white/10">
                  {countryOptions.map(opt => (
                    <SelectItem key={opt} value={opt} className="text-white">
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          {/* Contacts section */}
          <section className="space-y-4">
            <h3 className="text-white/80 font-semibold">Контакты</h3>
            
            <div>
              <Label className="text-white/60">Телефон</Label>
              <Input
                value={profile.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+7"
                className="mt-1 bg-black/20 border-white/10 text-white"
              />
            </div>

            <div>
              <Label className="text-white/60">Email</Label>
              <Input
                type="email"
                value={profile.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="email@example.com"
                className="mt-1 bg-black/20 border-white/10 text-white"
              />
            </div>

            <div>
              <Label className="text-white/60">Telegram</Label>
              <Input
                value={profile.telegram}
                onChange={(e) => handleChange('telegram', e.target.value)}
                placeholder="@username"
                className="mt-1 bg-black/20 border-white/10 text-white"
              />
            </div>
          </section>

          {/* Social section */}
          <section className="space-y-4">
            <h3 className="text-white/80 font-semibold">Соцсети</h3>
            
            <div>
              <Label className="text-white/60">ВКонтакте</Label>
              <Input
                value={profile.social_vk}
                onChange={(e) => handleChange('social_vk', e.target.value)}
                placeholder="vk.com/..."
                className="mt-1 bg-black/20 border-white/10 text-white"
              />
            </div>

            <div>
              <Label className="text-white/60">Instagram</Label>
              <Input
                value={profile.social_instagram}
                onChange={(e) => handleChange('social_instagram', e.target.value)}
                placeholder="@username"
                className="mt-1 bg-black/20 border-white/10 text-white"
              />
            </div>
          </section>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white py-6"
          >
            {saving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default ProfilePage;
