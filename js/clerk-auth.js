/**
 * Clerk Authentication for Daddy's Sports Hub
 * Konfigurasi sama dengan marketplace.daddys-sporthub.com
 */

(function() {
  'use strict';

  const CLERK_PUBLISHABLE_KEY = 'pk_live_Y2xlcmsubWFya2V0cGxhY2UuZGFkZHlzLXNwb3J0aHViLmNvbSQ';

  // Dark theme appearance — sama dengan marketplace
  const clerkAppearance = {
    variables: {
      colorPrimary: '#39FF14',
      colorForeground: '#f0f4f8',
      colorMutedForeground: '#94a3b8',
      colorDanger: '#ef4444',
      colorBackground: '#0a0e27',
      colorInput: '#0f1530',
      colorInputForeground: '#f0f4f8',
      colorNeutral: '#1e2a4a',
      fontFamily: "'Inter', sans-serif",
      borderRadius: '0.75rem',
    },
    elements: {
      rootBox: 'w-full flex justify-center',
      cardBox: 'rounded-2xl w-[440px] max-w-full overflow-hidden shadow-2xl',
      card: '!bg-[#0a0e27] !border !border-white/10',
      footer: '!bg-[#0a0e27] !border-t !border-white/10',
      headerTitle: '!text-white font-black text-2xl',
      headerSubtitle: '!text-slate-400',
      socialButtonsBlockButtonText: '!text-white font-semibold',
      formFieldLabel: '!text-slate-300 font-medium',
      footerActionLink: '!text-[#39FF14] font-semibold',
      footerActionText: '!text-slate-400',
      dividerText: '!text-slate-500',
      formFieldSuccessText: '!text-green-400',
      socialButtonsBlockButton: '!border !border-white/10 !bg-white/5 hover:!bg-white/10',
      formButtonPrimary: '!bg-[#39FF14] !text-black font-bold hover:!opacity-90',
      formFieldInput: '!bg-white/5 !border-white/10 !text-white',
      footerAction: '!border-t !border-white/5',
      logoBox: '!hidden',
      logoImage: '!hidden',
      userButtonPopoverCard: '!bg-[#0a0e27] !border !border-white/10',
      userButtonPopoverMain: '!bg-[#0a0e27]',
      userButtonPopoverFooter: '!bg-[#0a0e27] !border-t !border-white/10',
      userButtonPopoverActions: '!bg-transparent',
      userButtonPopoverActionButton: '!text-white hover:!bg-white/10 !bg-transparent',
      userButtonPopoverActionButtonText: '!text-white !font-semibold',
      userButtonPopoverActionButtonIcon: '!text-[#39FF14]',
      userPreviewMainIdentifier: '!text-white !font-bold',
      userPreviewSecondaryIdentifier: '!text-slate-400',
      userButtonPopoverActionButton__signOut: '!text-red-400 hover:!bg-red-500/10',
      userButtonPopoverActionButton__manageAccount: '!text-white',
    },
  };

  let clerkReady = false;

  async function waitForClerk() {
    return new Promise((resolve) => {
      if (window.Clerk) {
        resolve(window.Clerk);
        return;
      }
      const check = setInterval(() => {
        if (window.Clerk) {
          clearInterval(check);
          resolve(window.Clerk);
        }
      }, 100);
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(check);
        resolve(null);
      }, 10000);
    });
  }

  async function initClerk() {
    if (clerkReady) return window.Clerk;

    const clerk = await waitForClerk();
    if (!clerk) {
      console.warn('Clerk SDK failed to load');
      return null;
    }

    await clerk.load({ appearance: clerkAppearance });
    clerkReady = true;

    // Render auth UI setelah load
    renderAuthUI();

    // Listen auth state changes
    clerk.addListener(() => {
      renderAuthUI();
    });

    return clerk;
  }

  function renderAuthUI() {
    const containers = document.querySelectorAll('.clerk-auth-container');
    if (!containers.length) return;

    const clerk = window.Clerk;
    if (!clerk || !clerkReady) return;

    const user = clerk.user;

    containers.forEach(container => {
      container.innerHTML = '';

      if (user) {
        // User sudah login — mount UserButton
        const userBtnDiv = document.createElement('div');
        userBtnDiv.id = 'clerk-user-button-' + Math.random().toString(36).substr(2, 9);
        userBtnDiv.style.display = 'inline-block';
        container.appendChild(userBtnDiv);
        clerk.mountUserButton(userBtnDiv, { appearance: clerkAppearance });
      } else {
        // User belum login — tampilkan tombol Masuk
        const signInBtn = document.createElement('button');
        signInBtn.className = 'btn btn-primary btn-sm clerk-signin-btn';
        signInBtn.innerHTML = '<span>🔐</span> Masuk';
        signInBtn.onclick = () => {
          clerk.openSignIn({
            appearance: clerkAppearance,
            fallbackRedirectUrl: window.location.href,
          });
        };
        container.appendChild(signInBtn);
      }
    });
  }

  // ============================================
  // PUBLIC API
  // ============================================

  window.ClerkAuth = {
    async init() {
      return initClerk();
    },

    get user() {
      return window.Clerk?.user || null;
    },

    get isSignedIn() {
      return !!window.Clerk?.user;
    },

    async signOut() {
      if (window.Clerk && clerkReady) {
        await window.Clerk.signOut();
        window.location.reload();
      }
    },

    openSignIn(redirectUrl) {
      if (window.Clerk && clerkReady) {
        window.Clerk.openSignIn({
          appearance: clerkAppearance,
          fallbackRedirectUrl: redirectUrl || window.location.href,
        });
      }
    },

    mountSignIn(element) {
      if (window.Clerk && clerkReady && element) {
        window.Clerk.mountSignIn(element, { appearance: clerkAppearance });
      }
    },

    mountUserButton(element) {
      if (window.Clerk && clerkReady && element) {
        window.Clerk.mountUserButton(element, { appearance: clerkAppearance });
      }
    },
  };

  // Auto-init saat DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initClerk());
  } else {
    initClerk();
  }

})();
