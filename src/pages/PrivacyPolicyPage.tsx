
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, FileText, Clock, Database, UserCheck, Globe } from 'lucide-react';
import PrivacyDashboard from '@/components/privacy/PrivacyDashboard';
import CookieConsent from '@/components/CookieConsent';

const PrivacyPolicyPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <CookieConsent />
      
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('navigation.backToHome')}
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('privacy.title')}</h1>
              <p className="text-gray-600 mt-1">GDPR Compliant Privacy Policy & Settings</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-4">
            <Badge variant="outline" className="text-green-700 border-green-300">
              <UserCheck className="w-3 h-3 mr-1" />
              GDPR Compliant
            </Badge>
            <Badge variant="outline" className="text-blue-700 border-blue-300">
              <Globe className="w-3 h-3 mr-1" />
              EU Data Protection
            </Badge>
            <Badge variant="outline" className="text-purple-700 border-purple-300">
              <Clock className="w-3 h-3 mr-1" />
              Last Updated: {new Date().toLocaleDateString()}
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Privacy Dashboard for Authenticated Users */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Privacy Settings & Data Rights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PrivacyDashboard />
              </CardContent>
            </Card>

            {/* Data Collection */}
            <Card>
              <CardHeader>
                <CardTitle>Data Collection & Processing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">What Data We Collect</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    <li>Account information (name, email, school)</li>
                    <li>Educational feedback and responses</li>
                    <li>Weekly summary submissions</li>
                    <li>Usage analytics and performance data</li>
                    <li>Communication with mental health support</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Legal Basis for Processing</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    <li><strong>Consent:</strong> Analytics, marketing communications</li>
                    <li><strong>Legitimate Interest:</strong> Platform functionality, security</li>
                    <li><strong>Legal Obligation:</strong> Data retention, compliance</li>
                    <li><strong>Vital Interests:</strong> Mental health support, safety</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Data Retention */}
            <Card>
              <CardHeader>
                <CardTitle>{t('privacy.dataRetention')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-sm">Student Data</h4>
                    <p className="text-2xl font-bold text-blue-600">5 Years</p>
                    <p className="text-xs text-gray-600">Educational records, feedback</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-sm">Mental Health Data</h4>
                    <p className="text-2xl font-bold text-purple-600">7 Years</p>
                    <p className="text-xs text-gray-600">Counseling, support sessions</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-sm">Teacher Data</h4>
                    <p className="text-2xl font-bold text-green-600">7 Years</p>
                    <p className="text-xs text-gray-600">Professional records, analytics</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-sm">Analytics Data</h4>
                    <p className="text-2xl font-bold text-orange-600">3 Years</p>
                    <p className="text-xs text-gray-600">Usage patterns, performance</p>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Automatic Deletion:</strong> All data is automatically scheduled for deletion 
                    based on retention periods. You can request earlier deletion through your data rights.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Third Parties */}
            <Card>
              <CardHeader>
                <CardTitle>Third Party Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <div className="font-medium">Supabase</div>
                      <div className="text-sm text-gray-600">Database, authentication</div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">EU Hosted</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <div className="font-medium">Analytics</div>
                      <div className="text-sm text-gray-600">Usage insights (with consent)</div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">GDPR Compliant</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  {t('privacy.requestData')}
                </Button>
                
                <Button className="w-full justify-start" variant="outline">
                  <Shield className="w-4 h-4 mr-2" />
                  Update Privacy Settings
                </Button>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Data Protection Contact</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p><strong>Data Protection Officer</strong></p>
                <p>privacy@lessonslearnt.eu</p>
                <p>Response time: 72 hours</p>
                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-600">
                    For GDPR requests, complaints, or privacy concerns
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Compliance Badges */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge className="w-full justify-center py-2 bg-blue-100 text-blue-800">
                    GDPR Article 6 Compliant
                  </Badge>
                  <Badge className="w-full justify-center py-2 bg-green-100 text-green-800">
                    ISO 27001 Aligned
                  </Badge>
                  <Badge className="w-full justify-center py-2 bg-purple-100 text-purple-800">
                    Educational Data Standards
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
