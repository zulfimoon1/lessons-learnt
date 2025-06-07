
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ShieldIcon, LockIcon, FileCheckIcon, EyeIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PrivacyPolicyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ open, onOpenChange }) => {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldIcon className="w-5 h-5 text-blue-600" />
            Privacy Policy & Compliance Framework
          </DialogTitle>
          <DialogDescription>
            Detailed information about our data protection and compliance measures
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* GDPR Section */}
            <div className="border rounded-lg p-4 bg-blue-50">
              <div className="flex items-center gap-2 mb-3">
                <ShieldIcon className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">GDPR Compliance</h3>
                <Badge className="bg-blue-100 text-blue-700">EU Regulation</Badge>
              </div>
              <div className="space-y-2 text-sm text-blue-800">
                <p><strong>Data Minimization:</strong> We collect only essential data required for educational services</p>
                <p><strong>Consent Management:</strong> Clear opt-in/opt-out mechanisms for all data processing</p>
                <p><strong>Right to Access:</strong> Users can request all personal data we hold</p>
                <p><strong>Right to Deletion:</strong> Complete data removal within 30 days of request</p>
                <p><strong>Data Portability:</strong> Export personal data in machine-readable format</p>
                <p><strong>Breach Notification:</strong> 72-hour notification to authorities, immediate user notification</p>
              </div>
            </div>

            {/* SOC 2 Section */}
            <div className="border rounded-lg p-4 bg-green-50">
              <div className="flex items-center gap-2 mb-3">
                <LockIcon className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-900">SOC 2 Type II Compliance</h3>
                <Badge className="bg-green-100 text-green-700">Security Standard</Badge>
              </div>
              <div className="space-y-2 text-sm text-green-800">
                <p><strong>Security:</strong> Multi-factor authentication, encryption at rest and in transit</p>
                <p><strong>Availability:</strong> 99.9% uptime SLA with redundant infrastructure</p>
                <p><strong>Processing Integrity:</strong> Data validation and error handling procedures</p>
                <p><strong>Confidentiality:</strong> Role-based access controls and data classification</p>
                <p><strong>Privacy:</strong> Regular privacy impact assessments and controls</p>
                <p><strong>Monitoring:</strong> 24/7 security monitoring and incident response</p>
              </div>
            </div>

            {/* HIPAA Section */}
            <div className="border rounded-lg p-4 bg-purple-50">
              <div className="flex items-center gap-2 mb-3">
                <FileCheckIcon className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-purple-900">HIPAA Compliance</h3>
                <Badge className="bg-purple-100 text-purple-700">Health Data Protection</Badge>
              </div>
              <div className="space-y-2 text-sm text-purple-800">
                <p><strong>Administrative Safeguards:</strong> Security officer designation and workforce training</p>
                <p><strong>Physical Safeguards:</strong> Facility access controls and workstation security</p>
                <p><strong>Technical Safeguards:</strong> Access controls, audit controls, and encryption</p>
                <p><strong>Business Associate Agreements:</strong> Compliant contracts with all vendors</p>
                <p><strong>Risk Assessment:</strong> Annual security risk assessments and remediation</p>
                <p><strong>Mental Health Data:</strong> Special protections for psychological assessment data</p>
              </div>
            </div>

            {/* Technical Implementation */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-3">
                <EyeIcon className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Technical Implementation</h3>
                <Badge className="bg-gray-100 text-gray-700">Infrastructure</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <p><strong>Encryption:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>AES-256 encryption at rest</li>
                    <li>TLS 1.3 for data in transit</li>
                    <li>End-to-end encryption for sensitive data</li>
                  </ul>
                </div>
                <div>
                  <p><strong>Access Controls:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Multi-factor authentication</li>
                    <li>Role-based permissions</li>
                    <li>Session management</li>
                  </ul>
                </div>
                <div>
                  <p><strong>Audit Logging:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>All data access logged</li>
                    <li>Tamper-evident audit trails</li>
                    <li>Regular log analysis</li>
                  </ul>
                </div>
                <div>
                  <p><strong>Data Protection:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Automated backup systems</li>
                    <li>Data integrity checks</li>
                    <li>Secure data disposal</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Student Data Protection */}
            <div className="border rounded-lg p-4 bg-orange-50">
              <h3 className="font-semibold text-orange-900 mb-3">Student Data Protection</h3>
              <div className="space-y-2 text-sm text-orange-800">
                <p><strong>Anonymization:</strong> Student feedback and responses are anonymized by default</p>
                <p><strong>Parental Rights:</strong> Parents can request access to their child's data</p>
                <p><strong>Educational Purpose:</strong> Data used only for legitimate educational objectives</p>
                <p><strong>Third-Party Sharing:</strong> No student data shared with non-educational third parties</p>
                <p><strong>Retention Limits:</strong> Student data deleted when no longer educationally relevant</p>
              </div>
            </div>
          </div>
        </ScrollArea>
        
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyPolicyModal;
