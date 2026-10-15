import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ActiveTicketBanner } from './components/customer/ActiveTicketBanner';
import { AppRoutes } from './routes/AppRoutes';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'queueless-google-client-id-placeholder';

export const App = () => {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <SocketProvider>
              <div className="flex flex-col min-h-screen bg-[#F5F2EB] text-[#1C2520] dark:bg-[#131B17] dark:text-[#E8EFEA] transition-colors duration-200">
                <Navbar />
                <ActiveTicketBanner />
                <div className="flex-1">
                  <AppRoutes />
                </div>
                <Footer />
              </div>
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
};

export default App;
