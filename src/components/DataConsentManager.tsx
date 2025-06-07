
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye, BarChart3, MessageCircle, Download, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ConsentSettings {
  essential: boolean;
  analytics: boolean;
  performance: boolean;
  communication: boolean;
}

const DataConsentManager: React.FC = () => {
  const { toast } = useToast();
  const [consents, setConsents] = useState<ConsentSettings>({
    essential: true, // Always required
    analytics: false,
    performance: false,
    communication: false
  });

  useEffect(() => {
    // Load saved consent preferences
    const savedConsents = localStorage.getItem('data-consents');
    if (savedConsents) {
      try {
        const parsed = JSON.parse(savedConsents);
        setConsents({ ...consents, ...parsed });
      } catch (error) {
        console.error('Error loading consent preferences:', error);
      }
    }
  }, []);

  const handleConsentChange = (type: keyof ConsentSettings, value: boolean) => {
    if (type === 'essential') return; // Essential cannot be disabled
    
    const newConsents = { ...consents, [type]: value };
    setConsents(newConsents);
    localStorage.setItem('data-consents', JSON.stringify(newConsents));
    
    toast({
      title: "Preferences Updated",
      description: `${type} consent has been ${value ? 'enabled' : 'disabled'}`,
    });
  };

  const handleDataExport = () => {
    // Simulate data export
    const userData = {
      consents,
      timestamp: new Date().toISOString(),
      message: "This is a sample of your stored preferences"
    };
    
    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-data.json';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data Exported",
      description: "Your data has been downloaded to your device",
    });
  };

  const handleDataDeletion = () => {
    // Simulate data deletion
    localStorage.removeItem('data-consents');
    localStorage.removeItem('cookie-consent');
    setConsents({
      essential: true,
      analytics: false,
      performance: false,
      communication: false
    });
    
    toast({
      title: "Data Deleted",
      description: "All non-essential data has been removed",
      variant: "destructive"
    });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          Data Consent Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Consent Controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-sm">Essential Data</p>
                <p className="text-xs text-gray-600">Required for platform functionality</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-blue-100 text-blue-700">Required</Badge>
              <Checkbox checked={true} disabled />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-sm">Analytics Data</p>
                <p className="text-xs text-gray-600">Help us improve the platform</p>
              </div>
            </div>
            <Checkbox 
              checked={consents.analytics}
              onCheckedChange={(checked) => handleConsentChange('analytics', !!checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Eye className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-medium text-sm">Performance Data</p>
                <p className="text-xs text-gray-600">Optimize loading and responsiveness</p>
              </div>
            </div>
            <Checkbox 
              checked={consents.performance}
              onCheckedChange={(checked) => handleConsentChange('performance', !!checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <MessageCircle className="w-5 h-5 text-orange-600" />
              <div>
                <p className="font-medium text-sm">Communication</p>
                <p className="text-xs text-gray-600">Educational updates and notifications</p>
              </div>
            </div>
            <Checkbox 
              checked={consents.communication}
              onCheckedChange={(checked) => handleConsentChange('communication', !!checked)}
            />
          </div>
        </div>

        {/* Data Rights */}
        <div className="border-t pt-6">
          <h3 className="font-semibold mb-4">Your Data Rights</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" onClick={handleDataExport}>
              <Download className="w-4 h-4 mr-2" />
              Export My Data
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDataDeletion}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete My Data
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            You have the right to access, modify, or delete your personal data at any time.
            Educational records are retained according to institutional policies.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataConsentManager;
