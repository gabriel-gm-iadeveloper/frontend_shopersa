import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppRoutes } from './routes/AppRoutes';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './services/queryClient';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/common/ErrorBoundary';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <ThemeProvider>
            <ErrorBoundary>
              <AppRoutes />
              <Toaster
                position="top-center"
                gutter={10}
                containerStyle={{ top: 12 }}
                toastOptions={{
                  duration: 3200,
                  className: 'toast-premium',
                  // Fondo beige suave y texto notorio
                  style: {
                    background: '#f3e9d2', // beige suave
                    color: '#1f2330',     // texto notorio
                    border: '1px solid #d7c4a8'
                  },
                  success: {
                    icon: '✅',
                    style: { background: '#f3e9d2', color: '#1f2330', border: '1px solid #d7c4a8' }
                  },
                  error: {
                    icon: '⚠️',
                    style: { background: '#f3e9d2', color: '#1f2330', border: '1px solid #d7c4a8' }
                  }
                }}
              />
            </ErrorBoundary>
          </ThemeProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;