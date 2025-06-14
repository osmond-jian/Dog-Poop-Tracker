import { useEffect } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import InstallPrompt from './components/InstallPrompt';

function App() {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }

    // Prevent zoom on double tap for better mobile UX
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Header />
      
      <main className="max-w-md mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Welcome Message */}
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              📸 Snap & Track Your Dog's Health
            </h2>
            <p className="text-gray-600">
              Monitor your furry friend's digestive health with easy photo uploads.
            </p>
          </div>

          {/* Image Uploader */}
          <ImageUploader />

          {/* Install Prompt */}
          <InstallPrompt />

          {/* Info Section */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              🐾 How it works for your pup
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                  1
                </div>
                <p>Take a photo of your dog's poop during walks or in the yard</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                  2
                </div>
                <p>Review the image to ensure it's clear for health analysis</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                  3
                </div>
                <p>Upload securely to track your dog's digestive health patterns</p>
              </div>
            </div>
          </div>

          {/* Health Tips */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
              💡 Dog Health Tips
            </h4>
            <div className="text-sm text-amber-800 space-y-1">
              <p>• Healthy dog poop should be chocolate brown and firm</p>
              <p>• Changes in color, consistency, or frequency may indicate health issues</p>
              <p>• Regular monitoring helps catch problems early</p>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <h4 className="font-medium text-green-900 mb-1 flex items-center gap-2">
              🔒 Your Dog's Privacy Matters
            </h4>
            <p className="text-sm text-green-800">
              All photos are processed securely and used only for your pet's health monitoring. 
              We care about your furry family member's privacy as much as you do.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;