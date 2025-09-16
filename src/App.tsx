
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Web3Provider } from '@/components/providers/Web3Provider';
import { Toaster } from '@/components/ui/sonner';
import { AuthFlow } from '@/components/AuthFlow';

// Import pages
import Index from '@/pages/Index';
import Grants from '@/pages/Grants';
import CreateGrant from '@/pages/CreateGrant';
import GrantDetail from '@/pages/GrantDetail';
import ApplyGrant from '@/pages/ApplyGrant';
import Analytics from '@/pages/Analytics';
import Status from '@/pages/Status';
import NotFound from '@/pages/NotFound';
import { AuthTest } from '@/components/AuthTest';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Web3Provider>
        <AuthFlow>
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/grants" element={<Grants />} />
              <Route path="/create-grant" element={<CreateGrant />} />
              <Route path="/grants/:grantId" element={<GrantDetail />} />
              <Route path="/apply/:grantId" element={<ApplyGrant />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/status" element={<Status />} />
              <Route path="/auth-test" element={<AuthTest />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </Router>
        </AuthFlow>
      </Web3Provider>
    </QueryClientProvider>
  );
}

export default App;
