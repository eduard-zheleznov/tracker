import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  X, Book, HelpCircle, User, Bell, Heart, 
  CreditCard, MessageSquare, Settings, LogOut, MessageCircle
} from 'lucide-react';

const menuItems = [
  { id: 'dictionary', path: '/dictionary', icon: Book, label: 'Словарь' },
  { id: 'faq', path: '/faq', icon: HelpCircle, label: 'Вопросы' },
  { id: 'profile', path: '/profile', icon: User, label: 'Ваш профиль' },
  { id: 'reminders', path: '/reminders', icon: Bell, label: 'Напоминания' },
  { id: 'psychologist', path: '/psychologist', icon: Heart, label: 'Ваш психолог' },
  { id: 'tariff', path: '/tariff', icon: CreditCard, label: 'Тарифный план' },
  { id: 'author', path: '/author', icon: MessageSquare, label: 'Слово от автора' },
  { id: 'feedback', path: '/feedback', icon: MessageCircle, label: 'Обратная связь' },
];

const SideMenu = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  if (!isOpen) return null;

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
      />
      
      {/* Menu */}
      <div className="fixed top-0 left-0 h-full w-72 bg-[#130820] z-50 animate-slide-in-left shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div>
            <p className="text-white font-semibold">{user?.login}</p>
            <p className="text-white/40 text-xs">
              {user?.is_admin ? 'Администратор' : 'Пользователь'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className="w-full flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                data-testid={`menu-${item.id}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Admin Link */}
          {user?.is_admin && (
            <button
              onClick={() => handleNavigation('/admin')}
              className="w-full flex items-center gap-3 px-4 py-3 text-[#8B5CF6] hover:bg-white/5 transition-colors"
              data-testid="menu-admin"
            >
              <Settings size={20} />
              <span>Админ-панель</span>
            </button>
          )}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
            data-testid="menu-logout"
          >
            <LogOut size={20} />
            <span>Выйти</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default SideMenu;
