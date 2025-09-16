
import { AppStatus } from '@/components/AppStatus'

export default function Status() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Application Status
          </h1>
          <p className="text-gray-600">
            Monitor system health and verify all components are working correctly
          </p>
        </div>
        
        <AppStatus />
        
        <div className="mt-8 text-center">
          <a 
            href="/" 
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}
