import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AppContextProvider } from './context/AppContext.jsx';
import { BrowserRouter } from 'react-router-dom';
import { ClerkProvider, SignedIn } from '@clerk/clerk-react';
import SyncUser from './components/SyncUser.jsx';

// Import Clerk Keys
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
// Optional, if you're using frontendApi
// const clerkFrontendApi = import.meta.env.VITE_CLERK_FRONTEND_API;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key');
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <AppContextProvider>
        <App />
        <SignedIn>
          <SyncUser />
        </SignedIn>
      </AppContextProvider>
    </ClerkProvider>
  </BrowserRouter>
);
