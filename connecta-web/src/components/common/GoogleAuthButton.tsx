import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Loader2 } from 'lucide-react';

interface GoogleAuthButtonProps {
  mode?: 'signin' | 'signup';
  userType?: 'client' | 'freelancer';
  buttonText?: string;
  style?: React.CSSProperties;
}

declare global {
  interface Window {
    google?: any;
  }
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  mode = 'signin',
  userType = 'freelancer',
  buttonText,
  style,
}) => {
  const { googleLogin, googleSignup } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '89671982625-iuj8vlsdjhcntlpdal9nbn6qi4hn01hf.apps.googleusercontent.com';

  // Check and initialize Google Identity Services script
  useEffect(() => {
    let checkInterval: any;

    const checkGoogleLoaded = () => {
      if (window.google?.accounts?.id) {
        setGoogleReady(true);
        if (checkInterval) clearInterval(checkInterval);
        return true;
      }
      return false;
    };

    if (!checkGoogleLoaded()) {
      // Ensure script tag exists
      if (!document.getElementById('google-gsi-script')) {
        const script = document.createElement('script');
        script.id = 'google-gsi-script';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => setGoogleReady(true);
        document.head.appendChild(script);
      }

      checkInterval = setInterval(checkGoogleLoaded, 200);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, []);

  const handleCredentialResponse = async (response: any) => {
    if (!response || !response.credential) {
      toastError('Google Auth Error', 'No Google token returned');
      return;
    }

    setLoading(true);
    try {
      const authFn = mode === 'signup' ? googleSignup : googleLogin;
      const { user, isNewUser } = await authFn({ credential: response.credential, tokenId: response.credential }, userType);

      // Pre-fill session storage with user profile details & email verification from Google
      sessionStorage.setItem('signup_step1', JSON.stringify({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
        emailVerified: true,
        userType: user.userType || userType,
        fromGoogle: true,
      }));

      // Check if user profile setup is complete
      const isClientSetup = user.userType === 'client' && !!(user.companyName || user.title || user.bio);
      const isFreelancerSetup = user.userType === 'freelancer' && !!(user.skills?.length || (user.title && user.bio));
      const hasCompletedProfile = user.userType === 'client' ? isClientSetup : isFreelancerSetup;

      if (isNewUser || mode === 'signup' || !hasCompletedProfile) {
        toastSuccess('Google Account Connected!', `Hi ${user.firstName}, please fill in your account details below.`);
        // Direct new/incomplete Google users to Step 2 (Account Details) on SignupPage
        navigate(`/register?role=${user.userType || userType}`);
      } else {
        toastSuccess('Welcome Back!', `Signed in as ${user.firstName}`);
        if (user.userType === 'client') {
          navigate('/client/dashboard');
        } else {
          navigate('/freelancer/dashboard');
        }
      }
    } catch (err: any) {
      console.error('Google Backend Login Error:', err);
      toastError('Sign In Failed', err.response?.data?.message || err.message || 'Google account verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Render official Google button when SDK is ready
  useEffect(() => {
    if (!googleReady || !window.google?.accounts?.id || !containerRef.current) return;

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      containerRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(containerRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: mode === 'signup' ? 'signup_with' : 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: 380,
      });
    } catch (err) {
      console.error('Error rendering Google button:', err);
    }
  }, [googleReady, clientId, mode, userType]);

  const handleManualClick = () => {
    if (loading) return;

    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
        });
        window.google.accounts.id.prompt();
      } catch (err) {
        console.error('Google prompt trigger error:', err);
        toastError('Google Error', 'Could not open Google authentication popup');
      }
    } else {
      setLoading(true);
      // Wait for script to load and trigger
      const timer = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(timer);
          setLoading(false);
          setGoogleReady(true);
          try {
            window.google.accounts.id.initialize({
              client_id: clientId,
              callback: handleCredentialResponse,
            });
            window.google.accounts.id.prompt();
          } catch (e) {
            console.error(e);
          }
        }
      }, 300);

      setTimeout(() => {
        clearInterval(timer);
        setLoading(false);
      }, 5000);
    }
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', ...style }}>
      {/* Container for official Google rendered button */}
      <div 
        ref={containerRef} 
        style={{ width: '100%', minHeight: '44px', display: googleReady ? 'flex' : 'none', justifyContent: 'center' }} 
      />

      {/* Fallback button while Google SDK is initializing or loading */}
      {!googleReady && (
        <button
          type="button"
          disabled={loading}
          onClick={handleManualClick}
          className="btn-secondary"
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            fontWeight: 600,
          }}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Connecting to Google...
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              {buttonText || (mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google')}
            </>
          )}
        </button>
      )}
    </div>
  );
};
