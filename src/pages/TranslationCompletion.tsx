import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import TranslationCompletion from '@/components/translation/TranslationCompletion';

const TranslationCompletionPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Translation Completion Center
            </h1>
            <p className="text-gray-600">
              Complete the final translations to achieve 100% Lithuanian coverage
            </p>
          </div>
        </div>

        <TranslationCompletion />
      </div>
    </div>
  );
};

export default TranslationCompletionPage;