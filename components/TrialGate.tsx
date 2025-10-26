// components/TrialGate.tsx
// Add this to the root layout of ArkMail and Agents apps

'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Shield, AlertCircle } from 'lucide-react';

interface TrialStatus {
  isValid: boolean;
  reason?: string;
  redirectUrl?: string;
}

export function TrialGate({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkTrial() {
      if (!isLoaded || !user) {
        setIsChecking(false);
        return;
      }

      try {
        const res = await fetch('/api/trial-status');
        const status = await res.json();
        setTrialStatus(status);

        // Redirect if trial invalid
        if (!status.isValid && status.redirectUrl) {
          setTimeout(() => {
            window.location.href = status.redirectUrl;
          }, 3000); // 3 second delay to show message
        }
      } catch (error) {
        console.error('Trial check failed:', error);
        // Allow through on error
        setTrialStatus({ isValid: true });
      } finally {
        setIsChecking(false);
      }
    }

    checkTrial();
  }, [user, isLoaded]);

  // Show loading state
  if (!isLoaded || isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Show trial invalid message
  if (trialStatus && !trialStatus.isValid) {
    const getMessage = () => {
      switch (trialStatus.reason) {
        case 'no_payment':
          return {
            title: 'Payment Required',
            message: 'Please add a payment method to start your free trial.',
          };
        case 'trial_expired':
          return {
            title: 'Trial Expired',
            message: 'Your free trial has ended. Upgrade to continue using ARK Platform.',
          };
        case 'no_user':
          return {
            title: 'Sign In Required',
            message: 'Please sign in to access this app.',
          };
        default:
          return {
            title: 'Access Restricted',
            message: 'You need an active subscription to access this app.',
          };
      }
    };

    const { title, message } = getMessage();

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 border border-gray-700 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
          <p className="text-gray-400 mb-6">{message}</p>
          <p className="text-sm text-gray-500 mb-4">
            Redirecting to pricing page...
          </p>
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 h-full animate-[progress_3s_linear]"></div>
          </div>
        </div>
      </div>
    );
  }

  // Trial valid, show app
  return <>{children}</>;
}

// Add this to your global CSS for the progress animation
/*
@keyframes progress {
  from { width: 0%; }
  to { width: 100%; }
}
*/
