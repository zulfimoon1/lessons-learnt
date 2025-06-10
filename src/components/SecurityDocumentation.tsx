
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldIcon, BookIcon, AlertTriangleIcon, CheckCircleIcon } from 'lucide-react';

const SecurityDocumentation: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <BookIcon className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Security Documentation</h1>
          <p className="text-gray-600">Comprehensive security procedures and guidelines</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="database">Database Security</TabsTrigger>
          <TabsTrigger value="incident">Incident Response</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldIcon className="w-5 h-5" />
                Security Framework Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <CheckCircleIcon className="h-4 w-4" />
                <AlertDescription>
                  Our multi-layered security approach ensures comprehensive protection for student data and platform integrity.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Security Layers</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Layer 1</Badge>
                      <span>Network Security & TLS Encryption</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Layer 2</Badge>
                      <span>Authentication & Session Management</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Layer 3</Badge>
                      <span>Authorization & Access Control (RLS)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Layer 4</Badge>
                      <span>Input Validation & Sanitization</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Layer 5</Badge>
                      <span>Monitoring & Incident Response</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Security Standards</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-600" />
                      <span>OWASP Top 10 Compliance</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-600" />
                      <span>GDPR Data Protection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-600" />
                      <span>SOC 2 Type II Controls</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-600" />
                      <span>ISO 27001 Framework</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-600" />
                      <span>FERPA Educational Privacy</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="authentication" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Authentication & Session Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Password Security</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Minimum 8 characters with complexity requirements</li>
                    <li>Bcrypt hashing with salt rounds ≥ 12</li>
                    <li>Password history prevention (last 5 passwords)</li>
                    <li>Account lockout after 3 failed attempts (15-minute lockout)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold">Session Management</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Enhanced session fingerprinting with device characteristics</li>
                    <li>Session timeout: 24 hours maximum, 30 minutes idle</li>
                    <li>CSRF tokens with 64-character random generation</li>
                    <li>Secure session storage with integrity validation</li>
                    <li>Session invalidation on logout and suspicious activity</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold">Multi-Factor Authentication (Recommended)</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>TOTP-based 2FA for administrator accounts</li>
                    <li>SMS backup codes for account recovery</li>
                    <li>Hardware security key support (FIDO2)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Security & Access Control</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Row Level Security (RLS)</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>School-based data isolation for all user types</li>
                    <li>Role-based access control (RBAC) for teachers/admins/doctors</li>
                    <li>Student data access limited to own records</li>
                    <li>Anonymous feedback protection with secure handling</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold">Data Encryption</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>TLS 1.3 for data in transit</li>
                    <li>AES-256 encryption for data at rest</li>
                    <li>Database connection encryption (SSL/TLS)</li>
                    <li>Encrypted backup storage</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold">Database Hardening</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Principle of least privilege for database users</li>
                    <li>Regular security updates and patch management</li>
                    <li>Database activity monitoring and logging</li>
                    <li>SQL injection prevention through parameterized queries</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incident" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Incident Response Procedures</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangleIcon className="h-4 w-4" />
                <AlertDescription>
                  In case of a security incident, follow these procedures immediately.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Immediate Response (0-15 minutes)</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Identify and contain the security incident</li>
                    <li>Assess the scope and impact of the breach</li>
                    <li>Activate the incident response team</li>
                    <li>Document all actions taken</li>
                    <li>Preserve evidence for forensic analysis</li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold">Short-term Response (15 minutes - 2 hours)</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Implement containment measures</li>
                    <li>Notify stakeholders and authorities if required</li>
                    <li>Begin detailed investigation</li>
                    <li>Coordinate with external security experts if needed</li>
                    <li>Prepare initial incident report</li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold">Recovery & Lessons Learned</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Implement remediation measures</li>
                    <li>Restore systems and data from clean backups</li>
                    <li>Monitor for additional threats</li>
                    <li>Conduct post-incident review</li>
                    <li>Update security policies and procedures</li>
                    <li>Provide security awareness training</li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold">Contact Information</h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm"><strong>Security Team:</strong> security@platform.edu</p>
                    <p className="text-sm"><strong>Emergency Hotline:</strong> +1-555-SECURITY</p>
                    <p className="text-sm"><strong>Legal Counsel:</strong> legal@platform.edu</p>
                    <p className="text-sm"><strong>External IR Team:</strong> incident@cybersec.com</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance & Regulatory Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">FERPA (Family Educational Rights and Privacy Act)</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Student educational records protection</li>
                    <li>Parental consent for disclosure of student information</li>
                    <li>Right to inspect and review educational records</li>
                    <li>Secure handling of personally identifiable information (PII)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold">GDPR (General Data Protection Regulation)</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Lawful basis for processing personal data</li>
                    <li>Data subject rights (access, rectification, erasure)</li>
                    <li>Data protection by design and by default</li>
                    <li>Data breach notification within 72 hours</li>
                    <li>Privacy impact assessments for high-risk processing</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold">SOC 2 Type II Controls</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Security: Protection against unauthorized access</li>
                    <li>Availability: System availability for operation and use</li>
                    <li>Processing Integrity: Complete and accurate processing</li>
                    <li>Confidentiality: Information designated as confidential</li>
                    <li>Privacy: Personal information collection and processing</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold">Regular Compliance Activities</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Quarterly security assessments and audits</li>
                    <li>Annual penetration testing by third parties</li>
                    <li>Monthly compliance reporting to stakeholders</li>
                    <li>Continuous monitoring and improvement</li>
                    <li>Staff training on privacy and security requirements</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityDocumentation;
