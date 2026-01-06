import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const AuthPage = () => {
  const navigate = useNavigate();
  const { login, register, getPasswordHint, resetPassword } = useAuth();
  
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [passwordHint, setPasswordHint] = useState('');
  
  // Login form
  const [loginData, setLoginData] = useState({ login: '', password: '' });
  
  // Register form
  const [registerData, setRegisterData] = useState({
    login: '',
    password: '',
    confirmPassword: '',
    passwordHint: '',
  });
  
  // Forgot password form
  const [forgotData, setForgotData] = useState({
    login: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = await login(loginData.login, loginData.password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (registerData.password !== registerData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    
    if (registerData.password.length < 4) {
      setError('Пароль должен быть не менее 4 символов');
      return;
    }
    
    setLoading(true);
    
    const result = await register(
      registerData.login,
      registerData.password,
      registerData.passwordHint
    );
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleGetHint = async () => {
    setError('');
    setPasswordHint('');
    
    if (!forgotData.login) {
      setError('Введите логин');
      return;
    }
    
    const result = await getPasswordHint(forgotData.login);
    
    if (result.success) {
      setPasswordHint(result.hint);
    } else {
      setError(result.error);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    
    if (forgotData.newPassword !== forgotData.confirmNewPassword) {
      setError('Пароли не совпадают');
      return;
    }
    
    if (forgotData.newPassword.length < 4) {
      setError('Пароль должен быть не менее 4 символов');
      return;
    }
    
    setLoading(true);
    
    const result = await resetPassword(forgotData.login, forgotData.newPassword);
    
    if (result.success) {
      setShowForgotPassword(false);
      setActiveTab('login');
      setLoginData({ login: forgotData.login, password: '' });
      setForgotData({ login: '', newPassword: '', confirmNewPassword: '' });
      setPasswordHint('');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  if (showForgotPassword) {
    return (
      <div className="auth-container" data-testid="forgot-password-page">
        <div className="auth-card">
          {/* Colored dots */}
          <div className="auth-dots">
            <div className="auth-dot bg-green-500" />
            <div className="auth-dot bg-yellow-400" />
            <div className="auth-dot bg-red-500" />
            <div className="auth-dot bg-blue-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Восстановление пароля
          </h1>
          <p className="text-gray-500 text-center text-sm mb-6">
            Введите логин, чтобы получить подсказку
          </p>
          
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <Label htmlFor="forgot-login">Логин</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="forgot-login"
                  type="text"
                  value={forgotData.login}
                  onChange={(e) => setForgotData({ ...forgotData, login: e.target.value })}
                  placeholder="Введите логин"
                  className="flex-1"
                  data-testid="forgot-login-input"
                />
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleGetHint}
                  data-testid="get-hint-btn"
                >
                  Подсказка
                </Button>
              </div>
            </div>
            
            {passwordHint && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg animate-fade-in">
                <p className="text-sm text-blue-800">
                  <strong>Подсказка:</strong> {passwordHint}
                </p>
              </div>
            )}
            
            <div>
              <Label htmlFor="new-password">Новый пароль</Label>
              <Input
                id="new-password"
                type="password"
                value={forgotData.newPassword}
                onChange={(e) => setForgotData({ ...forgotData, newPassword: e.target.value })}
                placeholder="Введите новый пароль"
                className="mt-1"
                data-testid="new-password-input"
              />
            </div>
            
            <div>
              <Label htmlFor="confirm-new-password">Подтверждение</Label>
              <Input
                id="confirm-new-password"
                type="password"
                value={forgotData.confirmNewPassword}
                onChange={(e) => setForgotData({ ...forgotData, confirmNewPassword: e.target.value })}
                placeholder="Повторите пароль"
                className="mt-1"
                data-testid="confirm-new-password-input"
              />
            </div>
            
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            
            <Button
              type="submit"
              className="w-full bg-gray-900 hover:bg-gray-800 text-white"
              disabled={loading}
              data-testid="reset-password-btn"
            >
              {loading ? 'Сохранение...' : 'Сохранить новый пароль'}
            </Button>
            
            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(false);
                setError('');
                setPasswordHint('');
              }}
              className="w-full text-sm text-gray-500 hover:text-gray-700"
              data-testid="back-to-login-btn"
            >
              Вернуться к входу
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container" data-testid="auth-page">
      <div className="auth-card">
        {/* Colored dots */}
        <div className="auth-dots">
          <div className="auth-dot bg-green-500" />
          <div className="auth-dot bg-yellow-400" />
          <div className="auth-dot bg-red-500" />
          <div className="auth-dot bg-blue-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Трекер счастья
        </h1>
        <p className="text-gray-500 text-center text-sm mb-6">
          Отслеживайте и повышайте своё счастье
        </p>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login" data-testid="login-tab">Вход</TabsTrigger>
            <TabsTrigger value="register" data-testid="register-tab">Регистрация</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="login-input">Логин</Label>
                <Input
                  id="login-input"
                  type="text"
                  value={loginData.login}
                  onChange={(e) => setLoginData({ ...loginData, login: e.target.value })}
                  placeholder="Введите логин"
                  className="mt-1"
                  data-testid="login-input"
                />
              </div>
              
              <div>
                <Label htmlFor="password-input">Пароль</Label>
                <Input
                  id="password-input"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  placeholder="Введите пароль"
                  className="mt-1"
                  data-testid="password-input"
                />
              </div>
              
              {error && activeTab === 'login' && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}
              
              <Button
                type="submit"
                className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                disabled={loading}
                data-testid="login-btn"
              >
                {loading ? 'Вход...' : 'Войти'}
              </Button>
              
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="w-full text-sm text-gray-500 hover:text-gray-700"
                data-testid="forgot-password-link"
              >
                Забыли пароль?
              </button>
            </form>
          </TabsContent>
          
          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label htmlFor="register-login">Логин</Label>
                <Input
                  id="register-login"
                  type="text"
                  value={registerData.login}
                  onChange={(e) => setRegisterData({ ...registerData, login: e.target.value })}
                  placeholder="Придумайте логин"
                  className="mt-1"
                  data-testid="register-login-input"
                />
              </div>
              
              <div>
                <Label htmlFor="register-password">Пароль</Label>
                <Input
                  id="register-password"
                  type="password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  placeholder="Придумайте пароль"
                  className="mt-1"
                  data-testid="register-password-input"
                />
              </div>
              
              <div>
                <Label htmlFor="register-confirm">Подтверждение</Label>
                <Input
                  id="register-confirm"
                  type="password"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                  placeholder="Повторите пароль"
                  className="mt-1"
                  data-testid="register-confirm-input"
                />
              </div>
              
              <div>
                <Label htmlFor="register-hint">Подсказка для пароля</Label>
                <Input
                  id="register-hint"
                  type="text"
                  value={registerData.passwordHint}
                  onChange={(e) => setRegisterData({ ...registerData, passwordHint: e.target.value })}
                  placeholder="На случай если забудете"
                  className="mt-1"
                  data-testid="register-hint-input"
                />
              </div>
              
              {error && activeTab === 'register' && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}
              
              <Button
                type="submit"
                className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                disabled={loading}
                data-testid="register-btn"
              >
                {loading ? 'Создание...' : 'Создать аккаунт'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AuthPage;
