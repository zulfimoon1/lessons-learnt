import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLanguage } from "@/contexts/LanguageContext";
import DataConsentManager from '@/components/DataConsentManager';

const StudentDashboard = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-900">{t('welcome.title')}</h1>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="privacy" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="privacy">{t('compliance.privacyPolicy')}</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>
          
          <TabsContent value="privacy" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Privacy & Data Control</h2>
              <p className="text-gray-600">Manage your data preferences and privacy settings</p>
            </div>
            <DataConsentManager />
          </TabsContent>
          
          <TabsContent value="settings">
            <p>Settings content</p>
          </TabsContent>
          
          <TabsContent value="profile">
            <p>Profile content</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentDashboard;
