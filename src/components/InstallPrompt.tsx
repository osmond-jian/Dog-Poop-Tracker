import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    
    if (isInStandaloneMode || isIOSStandalone) {
      setIsInstalled(true);
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after a short delay to let user interact with the app first
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('App was installed');
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // For debugging - force show prompt in development
    if (import.meta.env.DEV) {
      setTimeout(() => {
        if (!isInStandaloneMode && !isIOSStandalone) {
          console.log('Development mode: showing install prompt');
          setShowPrompt(true);
        }
      }, 2000);
    }

    // Clean up
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log('No deferred prompt available');
      return;
    }

    try {
      // Show the install prompt
      await deferredPrompt.prompt();
      
      // Wait for the user's choice
      const { outcome } = await deferredPrompt.userChoice;
      console.log('User choice:', outcome);
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('Error during install prompt:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('installPromptDismissed', 'true');
  };

  // Check if user already dismissed the prompt this session
  const isDismissedThisSession = sessionStorage.getItem('installPromptDismissed') === 'true';

  // iOS install instructions
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const showIOSInstructions = isIOS && isSafari && !isInstalled && !isDismissedThisSession;

  if (isInstalled) {
    return null;
  }

  return (
    <>
      {/* Standard PWA install prompt */}
      {showPrompt && deferredPrompt && !isDismissedThisSession && (
        <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto animate-slide-up">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Smartphone size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  📱 Install Dog Poop Tracker
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Add to your home screen for quick access during dog walks and offline use.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleInstallClick}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium py-3 px-3 rounded-lg transition-colors touch-manipulation"
                    style={{ minHeight: '44px' }}
                  >
                    🐕 Install App
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="text-gray-500 hover:text-gray-700 p-2 transition-colors touch-manipulation"
                    style={{ minHeight: '44px', minWidth: '44px' }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* iOS install instructions */}
      {showIOSInstructions && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
          <div className="flex items-start gap-3">
            <div className="p-1 bg-blue-600 rounded">
              <Download size={16} className="text-white" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900 mb-1">
                🍎 Install on iPhone/iPad
              </h3>
              <p className="text-sm text-blue-800 mb-2">
                To install this app on your iOS device:
              </p>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Tap the Share button (📤) at the bottom of Safari</li>
                <li>Scroll down and tap "Add to Home Screen"</li>
                <li>Tap "Add" to install the app</li>
              </ol>
              <p className="text-xs text-blue-700 mt-2">
                Perfect for quick access during dog walks!
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallPrompt;