import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { X, Check, Mail, User, Shield, Clock, BookOpen, Sparkles, GraduationCap, Key, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function Modals() {
  const {
    isLoginOpen,
    setLoginOpen,
    isRegisterOpen,
    setRegisterOpen,
    selectedCourseId,
    setSelectedCourseId,
    courses,
    registerUser,
    loginUser,
    loginWithGoogle,
    enrollInCourse,
    currentUser,
    dbStatus,
    isLoading
  } = useApp();

  const navigate = useNavigate();

  // Local state for forms
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'student' | 'admin'>('student');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRole, setLoginRole] = useState<'student' | 'admin'>('student');
  const [errorMsg, setErrorMsg] = useState('');

  // Google OAuth Simulation & GIS state
  const [isGoogleOpen, setIsGoogleOpen] = useState(false);
  const [googleMode, setGoogleMode] = useState<'signup' | 'signin'>('signin');
  const [googleRole, setGoogleRole] = useState<'student' | 'admin'>('student');
  const [simulatedEmail, setSimulatedEmail] = useState('');

  // Custom Client ID and Origin helper state
  const [customClientId, setCustomClientId] = useState<string>(() => {
    return localStorage.getItem('boolean_custom_google_client_id') || '';
  });
  const [tempClientIdInput, setTempClientIdInput] = useState('');
  const [showClientIdConfig, setShowClientIdConfig] = useState(false);
  const [copiedOrigin, setCopiedOrigin] = useState(false);

  const activeClientId = dbStatus?.googleClientId || (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || customClientId || '1027156068869-hcibk8icgev7l6alma9ogotiudodje1p.apps.googleusercontent.com';

  const copyCurrentOrigin = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin);
      setCopiedOrigin(true);
      setTimeout(() => setCopiedOrigin(false), 2500);
    }
  };

  const saveCustomClientId = (idToSave: string) => {
    const trimmed = idToSave.trim();
    if (trimmed) {
      localStorage.setItem('boolean_custom_google_client_id', trimmed);
      setCustomClientId(trimmed);
      setErrorMsg('');
      setShowClientIdConfig(false);
    }
  };

  // Dynamically load Google GSI Client script
  useEffect(() => {
    if (!document.getElementById('google-gsi-client-script')) {
      const script = document.createElement('script');
      script.id = 'google-gsi-client-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  // Popup OAuth handler to trigger Google Account selector directly on device
  const triggerGoogleOAuthPopup = () => {
    setErrorMsg('');
    const googleObj = (window as any).google;
    const clientId = activeClientId;

    if (!clientId) {
      setErrorMsg(`Google Client ID is missing. Please set GOOGLE_CLIENT_ID in environment variables or enter your Client ID below.`);
      setShowClientIdConfig(true);
      return;
    }

    if (googleObj?.accounts?.oauth2) {
      try {
        const client = googleObj.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'email profile openid',
          prompt: 'select_account',
          callback: async (tokenResponse: any) => {
            if (tokenResponse?.error) {
              console.error('Google OAuth token error:', tokenResponse.error);
              if (tokenResponse.error === 'origin_mismatch' || tokenResponse.error_description?.includes('origin')) {
                setErrorMsg(`Origin Mismatch Error (400): '${window.location.origin}' is not authorized in Google Cloud Console for Client ID '${clientId}'. Ensure '${window.location.origin}' is added under 'Authorized JavaScript origins'.`);
                setShowClientIdConfig(true);
              } else {
                setErrorMsg(`Google OAuth Error: ${tokenResponse.error_description || tokenResponse.error}`);
              }
              return;
            }

            if (tokenResponse && tokenResponse.access_token) {
              try {
                const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                if (userInfoRes.ok) {
                  const userInfo = await userInfoRes.json();
                  const userEmail = userInfo.email || userInfo.sub;
                  const res = await loginWithGoogle(userEmail, googleRole);
                  if (res.success) {
                    setIsGoogleOpen(false);
                    setLoginOpen(false);
                    setRegisterOpen(false);
                    navigate('/dashboard');
                  } else {
                    setErrorMsg(res.error || 'Google sign-in failed.');
                  }
                } else {
                  setErrorMsg('Failed to retrieve profile from Google.');
                }
              } catch (err) {
                console.error('Error fetching Google userinfo:', err);
                setErrorMsg('Google profile request error.');
              }
            }
          },
          error_callback: (err: any) => {
            console.error('Google OAuth client error:', err);
            setErrorMsg(`Google OAuth Error (${err.type || 'origin_mismatch'}): Make sure '${window.location.origin}' is added under Authorized JavaScript origins in Google Cloud Console.`);
            setShowClientIdConfig(true);
          }
        });
        client.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err: any) {
        console.warn('OAuth2 popup client failed, attempting GIS prompt:', err);
      }
    }

    if (googleObj?.accounts?.id) {
      try {
        googleObj.accounts.id.prompt();
        return;
      } catch (err) {
        console.warn('GIS prompt failed:', err);
      }
    }

    // Direct Google Account Chooser popup fallback
    const redirectUri = window.location.origin;
    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent('email profile openid')}&prompt=select_account`;
    
    const width = 500;
    const height = 620;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    const popup = window.open(oauthUrl, 'GoogleAccountPicker', `width=${width},height=${height},left=${left},top=${top}`);
    if (popup) {
      const checkTimer = setInterval(async () => {
        try {
          if (!popup || popup.closed) {
            clearInterval(checkTimer);
            return;
          }
          if (popup.location.href.includes('access_token=')) {
            const hash = popup.location.hash || popup.location.search;
            const params = new URLSearchParams(hash.replace('#', '?'));
            const accessToken = params.get('access_token');
            popup.close();
            clearInterval(checkTimer);
            if (accessToken) {
              const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${accessToken}` }
              });
              if (userInfoRes.ok) {
                const userInfo = await userInfoRes.json();
                const userEmail = userInfo.email || userInfo.sub;
                const res = await loginWithGoogle(userEmail, googleRole);
                if (res.success) {
                  setIsGoogleOpen(false);
                  setLoginOpen(false);
                  setRegisterOpen(false);
                  navigate('/dashboard');
                }
              }
            }
          }
        } catch (e) {
          // Expected cross-origin error before redirect finishes
        }
      }, 500);
    }
  };

  // Poll for Google Script & Modal Container DOM element when modal opens
  useEffect(() => {
    if (!isGoogleOpen) return;

    let attempts = 0;
    const maxAttempts = 60; // 6 seconds
    let isRendered = false;

    const handleCredential = async (response: any) => {
      if (response?.credential) {
        const res = await loginWithGoogle(response.credential, googleRole);
        if (res.success) {
          setIsGoogleOpen(false);
          setLoginOpen(false);
          setRegisterOpen(false);
          navigate('/dashboard');
        } else {
          setErrorMsg(res.error || 'Google authentication failed. Please try again.');
        }
      }
    };

    const interval = setInterval(() => {
      attempts++;
      const container = document.getElementById('google-signin-button-container');
      const googleObj = (window as any).google;

      if (googleObj?.accounts?.id && container && !isRendered) {
        isRendered = true;
        clearInterval(interval);

        if (activeClientId) {
          try {
            googleObj.accounts.id.initialize({
              client_id: activeClientId,
              callback: handleCredential,
              auto_select: false
            });

            container.innerHTML = '';
            googleObj.accounts.id.renderButton(
              container,
              { theme: 'outline', size: 'large', width: 320 }
            );

            // Attempt One Tap prompt
            try {
              googleObj.accounts.id.prompt();
            } catch (e) {
              // Ignore prompt suppressed warnings
            }
          } catch (err) {
            console.error('Failed to render Google button:', err);
          }
        }
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [isGoogleOpen, dbStatus, googleRole, activeClientId]);

  // Course syllabus details
  const activeCourse = courses.find((c) => c.id === selectedCourseId);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMsg('All fields, including password, are required.');
      return;
    }
    if (!regEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    const res = await registerUser(regName.trim(), regEmail.trim(), regRole, regPassword);
    if (res.success) {
      setRegisterOpen(false);
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegRole('student');
      navigate('/dashboard');
    } else {
      setErrorMsg(res.error || 'Registration failed.');
      setLoginEmail(regEmail.trim());
      setLoginPassword(regPassword);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMsg('Email address and password are required.');
      return;
    }
    if (!loginEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    const res = await loginUser(loginEmail.trim(), loginRole, loginPassword);
    if (res.success) {
      setLoginOpen(false);
      setLoginEmail('');
      setLoginPassword('');
      setLoginRole('student');
      navigate('/dashboard');
    } else {
      setErrorMsg(res.error || 'Login failed. Please verify credentials.');
    }
  };



  const isEnrolledInActive = activeCourse ? (currentUser?.enrolledCourses.includes(activeCourse.id) || false) : false;

  return (
    <>
      <AnimatePresence>
        {/* === REGISTER MODAL (Student & Admin) === */}
        {isRegisterOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRegisterOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
              id="register-modal-backdrop"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="relative bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-gray-100 z-10 p-8 text-left"
              id="register-modal-content"
            >
              {/* Close Button */}
              <button
                onClick={() => setRegisterOpen(false)}
                className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 p-2 rounded-xl transition-all duration-150"
                id="btn-close-register-modal"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900 font-display">
                    Create Academy Account
                  </h3>
                  <p className="text-sm text-gray-500 font-sans mt-1">
                    Join BooleanAcademy and configure your live coding workspace.
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl font-medium space-y-2">
                    <p>{errorMsg}</p>
                    {(errorMsg.toLowerCase().includes('already registered') || errorMsg.toLowerCase().includes('already exists') || errorMsg.toLowerCase().includes('google sign-in')) && (
                      <button
                        type="button"
                        onClick={() => {
                          setLoginEmail(regEmail);
                          setLoginPassword(regPassword);
                          setLoginRole(regRole);
                          setErrorMsg('');
                          setRegisterOpen(false);
                          setLoginOpen(true);
                        }}
                        className="text-primary-base font-bold underline hover:text-blue-700 transition-colors cursor-pointer block mt-1 text-left"
                        id="btn-switch-to-login-from-error"
                      >
                        Sign in with this email instead →
                      </button>
                    )}
                  </div>
                )}

                {/* Google Sign In option */}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setGoogleRole(regRole);
                    setGoogleMode('signup');
                    setIsGoogleOpen(true);
                    setTimeout(() => triggerGoogleOAuthPopup(), 100);
                  }}
                  className="w-full flex items-center justify-center space-x-2.5 py-3 px-4 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-sm font-semibold text-gray-700 shadow-sm transition-all duration-150 cursor-pointer"
                  id="btn-register-google"
                >
                  <svg className="h-4.5 w-4.5 flex-shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Sign up with Google</span>
                </button>

                <div className="relative flex items-center py-1">
                  <div className="flex-grow border-t border-gray-100"></div>
                  <span className="flex-shrink mx-4 text-xs text-gray-400 font-bold uppercase tracking-wider">or email signup</span>
                  <div className="flex-grow border-t border-gray-100"></div>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  {/* Role Selector */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      I want to register as an
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => { setRegRole('student'); setErrorMsg(''); }}
                        className={`flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl border font-bold text-sm transition-all duration-200 cursor-pointer ${
                          regRole === 'student'
                            ? 'border-primary-base bg-blue-50/80 text-primary-base shadow-sm ring-1 ring-blue-200'
                            : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                        id="role-selector-student"
                      >
                        <GraduationCap className="h-4 w-4" />
                        <span>Student</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setRegRole('admin'); setErrorMsg(''); }}
                        className={`flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl border font-bold text-sm transition-all duration-200 cursor-pointer ${
                          regRole === 'admin'
                            ? 'border-accent-orange bg-orange-50/50 text-accent-orange shadow-sm ring-1 ring-accent-orange/20'
                            : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                        id="role-selector-admin"
                      >
                        <Key className="h-4 w-4" />
                        <span>Admin</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={regName}
                        onChange={(e) => { setRegName(e.target.value); setErrorMsg(''); }}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-primary-base focus:ring-2 focus:ring-blue-100 transition-all"
                        id="input-register-name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                      <input
                        type="email"
                        placeholder="johndoe@example.com"
                        value={regEmail}
                        onChange={(e) => { setRegEmail(e.target.value); setErrorMsg(''); }}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-primary-base focus:ring-2 focus:ring-blue-100 transition-all"
                        id="input-register-email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Password (min 6 characters)
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={regPassword}
                        onChange={(e) => { setRegPassword(e.target.value); setErrorMsg(''); }}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-primary-base focus:ring-2 focus:ring-blue-100 transition-all"
                        id="input-register-password"
                      />
                    </div>
                  </div>

                  <div className="text-xs text-gray-400 leading-relaxed font-sans">
                    By registering, you agree to BooleanAcademy's <strong>Terms of Service</strong> and <strong>Privacy Policy</strong>.
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-accent-orange hover:bg-accent-orange-hover text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-accent-orange/20 hover:shadow-accent-orange-hover/30 transition-all duration-200 cursor-pointer"
                    id="btn-submit-register"
                  >
                    Register {regRole === 'admin' ? 'Admin' : 'Student'} Profile
                  </button>
                </form>

                <div className="text-center text-sm text-gray-500 pt-2 border-t border-gray-100">
                  Already have an account?{' '}
                  <button
                    onClick={() => { setRegisterOpen(false); setLoginOpen(true); }}
                    className="text-primary-base font-bold hover:underline cursor-pointer"
                    id="btn-switch-to-login"
                  >
                    Academy Login
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* === LOGIN MODAL (Student & Admin) === */}
        {isLoginOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLoginOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
              id="login-modal-backdrop"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="relative bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-gray-100 z-10 p-8 text-left"
              id="login-modal-content"
            >
              {/* Close Button */}
              <button
                onClick={() => setLoginOpen(false)}
                className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 p-2 rounded-xl transition-all duration-150"
                id="btn-close-login-modal"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900 font-display">
                    Welcome Back
                  </h3>
                  <p className="text-sm text-gray-500 font-sans mt-1">
                    Enter your academic credentials to access your sandbox.
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl font-medium">
                    {errorMsg}
                  </div>
                )}

                {/* Google Sign In option */}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setGoogleRole(loginRole);
                    setGoogleMode('signin');
                    setIsGoogleOpen(true);
                    setTimeout(() => triggerGoogleOAuthPopup(), 100);
                  }}
                  className="w-full flex items-center justify-center space-x-2.5 py-3 px-4 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-sm font-semibold text-gray-700 shadow-sm transition-all duration-150 cursor-pointer"
                  id="btn-login-google"
                >
                  <svg className="h-4.5 w-4.5 flex-shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                </button>

                <div className="relative flex items-center py-1">
                  <div className="flex-grow border-t border-gray-100"></div>
                  <span className="flex-shrink mx-4 text-xs text-gray-400 font-bold uppercase tracking-wider">or email login</span>
                  <div className="flex-grow border-t border-gray-100"></div>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Role Selector */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      I am logging in as
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => { setLoginRole('student'); setErrorMsg(''); }}
                        className={`flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl border font-bold text-sm transition-all duration-200 cursor-pointer ${
                          loginRole === 'student'
                            ? 'border-primary-base bg-blue-50/80 text-primary-base shadow-sm ring-1 ring-blue-200'
                            : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                        id="login-role-student"
                      >
                        <GraduationCap className="h-4 w-4" />
                        <span>Student</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setLoginRole('admin'); setErrorMsg(''); }}
                        className={`flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl border font-bold text-sm transition-all duration-200 cursor-pointer ${
                          loginRole === 'admin'
                            ? 'border-accent-orange bg-orange-50/50 text-accent-orange shadow-sm ring-1 ring-accent-orange/20'
                            : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                        id="login-role-admin"
                      >
                        <Key className="h-4 w-4" />
                        <span>Admin</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                      <input
                        type="email"
                        placeholder="yourname@domain.com"
                        value={loginEmail}
                        onChange={(e) => { setLoginEmail(e.target.value); setErrorMsg(''); }}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-primary-base focus:ring-2 focus:ring-blue-100 transition-all"
                        id="input-login-email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => { setLoginPassword(e.target.value); setErrorMsg(''); }}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-primary-base focus:ring-2 focus:ring-blue-100 transition-all"
                        id="input-login-password"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary-base hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-900/20 transition-all duration-200 cursor-pointer"
                    id="btn-submit-login"
                  >
                    {loginRole === 'admin' ? 'Login Admin' : 'Login Student'}
                  </button>
                </form>

                <div className="text-center text-sm text-gray-500 pt-2 border-t border-gray-100">
                  Don't have a profile yet?{' '}
                  <button
                    onClick={() => { setLoginOpen(false); setRegisterOpen(true); }}
                    className="text-primary-base font-bold hover:underline cursor-pointer"
                    id="btn-switch-to-register"
                  >
                    Register Profile
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* === SYLLABUS DETAILS MODAL === */}
        {selectedCourseId && activeCourse && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCourseId(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
              id="syllabus-modal-backdrop"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="relative bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-gray-100 z-10 flex flex-col max-h-[90vh]"
              id="syllabus-modal-content"
            >
              {/* Header block with gradient background */}
              <div className={`p-8 ${activeCourse.image} text-white relative`}>
                <button
                  onClick={() => setSelectedCourseId(null)}
                  className="absolute top-5 right-5 text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-all"
                  id="btn-close-syllabus-modal"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-white/20 rounded-full">
                    {activeCourse.category} Track
                  </span>
                  <h3 className="text-2xl font-extrabold tracking-tight font-display pr-6">
                    {activeCourse.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-xs font-semibold text-white/90 pt-2">
                    <span className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{activeCourse.duration} Program</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Shield className="h-4 w-4" />
                      <span>{activeCourse.difficulty} Level</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Scrollable Syllabus syllabus */}
              <div className="p-8 overflow-y-auto flex-1 space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 font-display">Program Overview</h4>
                  <p className="text-sm text-gray-600 leading-relaxed font-sans">
                    {activeCourse.description}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-1.5 text-primary-base">
                    <BookOpen className="h-4.5 w-4.5" />
                    <h4 className="text-xs font-bold uppercase tracking-wider font-display">Core Curriculum Modules</h4>
                  </div>
                  
                  <div className="space-y-2.5">
                    {activeCourse.syllabus.map((module, idx) => (
                      <div key={`modal-syllabus-${activeCourse.id}-${idx}`} className="flex items-start space-x-3 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                        <span className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-50 text-primary-base border border-blue-100 flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </span>
                        <span className="text-sm font-semibold text-gray-800 leading-tight">{module}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Sandbox Hint */}
                <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50 flex items-start space-x-3 text-xs text-amber-800">
                  <Sparkles className="h-5 w-5 text-accent-orange mt-0.5 flex-shrink-0" />
                  <div className="leading-relaxed">
                    <strong>Project-Based Grading:</strong> To unlock certification in this track, you must successfully deploy three distinct code sandbox submissions to production.
                  </div>
                </div>
              </div>

              {/* Modal footer */}
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-4">
                <button
                  onClick={() => setSelectedCourseId(null)}
                  className="px-5 py-2.5 text-gray-500 hover:text-gray-700 font-semibold text-xs rounded-xl"
                  id="btn-syllabus-back"
                >
                  Back to Courses
                </button>

                <button
                  onClick={() => {
                    enrollInCourse(activeCourse.id);
                    setSelectedCourseId(null);
                  }}
                  className={`py-2.5 px-6 font-bold text-xs rounded-xl transition-all duration-200 flex items-center space-x-1.5 ${
                    isEnrolledInActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100'
                      : 'bg-primary-base text-white hover:bg-primary-dark shadow-md shadow-blue-500/10'
                  }`}
                  id="btn-syllabus-modal-action"
                >
                  {isEnrolledInActive ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Enrolled In This Program</span>
                    </>
                  ) : (
                    <span>Enroll In Program Now</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* === GOOGLE SIGN IN POPUP SIMULATOR === */}
        {isGoogleOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGoogleOpen(false)}
              className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm"
              id="google-modal-backdrop"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-gray-100 z-50 p-6 text-center"
              id="google-modal-content"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsGoogleOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-50 transition-all cursor-pointer"
                id="btn-close-google-modal"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="space-y-5">
                {/* Google Logo */}
                <div className="flex justify-center pt-2">
                  <svg className="h-7 w-7" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-800 font-sans">
                    {googleMode === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    to continue to BooleanAcademy
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl font-medium text-left space-y-2">
                    <p>{errorMsg}</p>
                    {(errorMsg.toLowerCase().includes('already registered') || errorMsg.toLowerCase().includes('already exists') || errorMsg.toLowerCase().includes('google sign-in')) && (
                      <button
                        type="button"
                        onClick={() => {
                          setLoginEmail(regEmail);
                          setLoginPassword(regPassword);
                          setLoginRole(googleRole);
                          setErrorMsg('');
                          setIsGoogleOpen(false);
                          setRegisterOpen(false);
                          setLoginOpen(true);
                        }}
                        className="text-primary-base font-bold underline hover:text-blue-700 transition-colors cursor-pointer block mt-1 text-left"
                        id="btn-switch-to-login-from-google-error"
                      >
                        Sign in with this email instead →
                      </button>
                    )}
                  </div>
                )}

                {/* Role picker in Google dialog */}
                <div className="bg-gray-50/70 p-3 rounded-xl text-left border border-gray-100">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Authorized Account Role
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setGoogleRole('student')}
                      className={`py-1.5 px-3 rounded-lg border font-bold text-xs flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                        googleRole === 'student'
                          ? 'bg-primary-base/5 border-primary-base text-primary-base ring-1 ring-primary-base/10'
                          : 'bg-white border-gray-200 text-gray-500'
                      }`}
                    >
                      <GraduationCap className="h-3.5 w-3.5" />
                      <span>Student</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGoogleRole('admin')}
                      className={`py-1.5 px-3 rounded-lg border font-bold text-xs flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                        googleRole === 'admin'
                          ? 'bg-accent-orange/5 border-accent-orange text-accent-orange ring-1 ring-accent-orange/10'
                          : 'bg-white border-gray-200 text-gray-500'
                      }`}
                    >
                      <Key className="h-3.5 w-3.5" />
                      <span>Admin</span>
                    </button>
                  </div>
                </div>

                {/* Live Google Auth Integration */}
                <div className="space-y-3.5">
                  <div className="flex justify-center py-1" id="google-signin-button-container"></div>

                  <button
                    type="button"
                    onClick={triggerGoogleOAuthPopup}
                    className="w-full flex items-center justify-center space-x-2.5 py-3 px-4 bg-white border border-gray-300 hover:bg-gray-50 active:bg-gray-100 rounded-xl text-xs font-bold text-gray-800 shadow-sm transition-all cursor-pointer"
                    id="btn-trigger-google-popup"
                  >
                    <svg className="h-4.5 w-4.5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span>Choose Google Account on Device</span>
                  </button>

                  {/* Quick Select Signed-In Account */}
                  <div className="border border-gray-100 rounded-2xl p-3 bg-gray-50/70 text-left space-y-2">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">
                      Instant Account Sign In
                    </span>
                    
                    <button
                      type="button"
                      onClick={async () => {
                        const res = await loginWithGoogle('blessingadeya@gmail.com', googleRole);
                        if (res.success) {
                          setIsGoogleOpen(false);
                          setLoginOpen(false);
                          setRegisterOpen(false);
                          navigate('/dashboard');
                        } else {
                          setErrorMsg(res.error || 'Sign in failed.');
                        }
                      }}
                      className="w-full flex items-center justify-between p-2 bg-white border border-gray-200 hover:border-primary-base hover:bg-blue-50/30 rounded-xl text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center space-x-2.5 overflow-hidden">
                        <div className="h-7 w-7 rounded-full bg-primary-base/10 text-primary-base font-bold text-xs flex items-center justify-center shrink-0">
                          B
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-gray-800 truncate">Blessing Adeya</p>
                          <p className="text-[10px] text-gray-500 truncate">blessingadeya@gmail.com</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-primary-base opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        Continue →
                      </span>
                    </button>

                    <div className="pt-1">
                      <input
                        type="email"
                        placeholder="Or enter any Google account email..."
                        value={simulatedEmail}
                        onChange={(e) => {
                          setSimulatedEmail(e.target.value);
                          setErrorMsg('');
                        }}
                        className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-base bg-white"
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter' && simulatedEmail && simulatedEmail.includes('@')) {
                            const res = await loginWithGoogle(simulatedEmail, googleRole);
                            if (res.success) {
                              setIsGoogleOpen(false);
                              setLoginOpen(false);
                              setRegisterOpen(false);
                              navigate('/dashboard');
                            } else {
                              setErrorMsg(res.error || 'Sign in failed.');
                            }
                          }
                        }}
                      />
                      {simulatedEmail && (
                        <button
                          type="button"
                          onClick={async () => {
                            if (simulatedEmail && simulatedEmail.includes('@')) {
                              const res = await loginWithGoogle(simulatedEmail, googleRole);
                              if (res.success) {
                                setIsGoogleOpen(false);
                                setLoginOpen(false);
                                setRegisterOpen(false);
                                navigate('/dashboard');
                              } else {
                                setErrorMsg(res.error || 'Sign in failed.');
                              }
                            }
                          }}
                          className="w-full mt-1.5 bg-primary-base text-white hover:bg-primary-dark font-sans font-bold text-xs py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
                        >
                          Continue with {simulatedEmail}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Google OAuth & Origin Diagnostic Details */}
                  <div className="p-3 bg-amber-50/60 border border-amber-200/70 rounded-2xl text-left space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center space-x-1">
                        <span>Google OAuth Origin Setup</span>
                      </span>
                      <button
                        type="button"
                        onClick={copyCurrentOrigin}
                        className="text-[10px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                      >
                        {copiedOrigin ? '✓ Copied!' : 'Copy Origin'}
                      </button>
                    </div>

                    <p className="text-[11px] text-amber-900 leading-snug font-mono break-all bg-amber-100/50 p-1.5 rounded-lg">
                      {window.location.origin}
                    </p>

                    {!dbStatus?.googleClientConfigured && (
                      <div className="p-2.5 bg-red-50 border border-red-200 text-red-800 text-[11px] rounded-xl font-medium text-left space-y-1">
                        <p className="font-bold">⚠️ Vercel Environment Notice:</p>
                        <p>
                          <code className="font-mono bg-red-100 px-1 py-0.5 rounded text-[10px]">GOOGLE_CLIENT_ID</code> is missing in Vercel Environment Variables.
                        </p>
                        <p className="text-[10px] text-red-700">
                          The app is using the default fallback Client ID, which triggers <strong className="font-mono">origin_mismatch</strong> on Vercel. Add <code className="font-mono text-[10px]">GOOGLE_CLIENT_ID</code> in Vercel settings and redeploy.
                        </p>
                      </div>
                    )}

                    <p className="text-[10px] text-amber-800/80 leading-normal">
                      To prevent <strong className="text-amber-900">Error 400: origin_mismatch</strong> on Vercel, copy this origin URL and add it under <strong>Authorized JavaScript origins</strong> for your Client ID in Google Cloud Console.
                    </p>

                    <div className="pt-1 border-t border-amber-200/50 flex items-center justify-between text-[10px]">
                      <span className="text-amber-900 font-medium truncate max-w-[200px]" title={activeClientId}>
                        Client ID: {activeClientId ? `${activeClientId.substring(0, 18)}...` : 'None'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setShowClientIdConfig(!showClientIdConfig);
                          setTempClientIdInput(activeClientId);
                        }}
                        className="text-amber-900 font-bold underline cursor-pointer hover:text-amber-950"
                      >
                        {showClientIdConfig ? 'Hide Config' : 'Change Client ID'}
                      </button>
                    </div>

                    {showClientIdConfig && (
                      <div className="pt-2 space-y-2">
                        <label className="block text-[10px] font-bold text-amber-900">
                          Custom Google Client ID:
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 123456789-abc.apps.googleusercontent.com"
                          value={tempClientIdInput}
                          onChange={(e) => setTempClientIdInput(e.target.value)}
                          className="w-full text-xs font-mono p-2 border border-amber-300 rounded-xl bg-white focus:outline-none focus:border-amber-600"
                        />
                        <button
                          type="button"
                          onClick={() => saveCustomClientId(tempClientIdInput)}
                          className="w-full bg-amber-800 text-white hover:bg-amber-900 font-bold text-xs py-1.5 rounded-xl transition-colors cursor-pointer"
                        >
                          Save Client ID & Re-Initialize
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-[10px] text-gray-400 leading-normal pt-2 font-sans">
                  To continue, Google will share your name, email address, language preference, and profile picture with BooleanAcademy.
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
