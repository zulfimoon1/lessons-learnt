
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Database, 
  Lock, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  HardDrive
} from 'lucide-react';
import { useDataProtection } from '@/hooks/useDataProtection';

const SOC2DataProtectionPanel: React.FC = () => {
  const {
    encryptionAtRest,
    encryptionInTransit,
    dataClassifications,
    dlpAlerts,
    encryptionCompliance,
    backupStatus,
    isLoading
  } = useDataProtection();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Data Protection Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading data protection status...</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'encrypted': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'unencrypted': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'restricted': return 'destructive';
      case 'confidential': return 'secondary';
      case 'internal': return 'outline';
      case 'public': return 'default';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Encryption Compliance Alert */}
      {encryptionCompliance?.compliancePercentage < 100 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Encryption compliance is {encryptionCompliance.compliancePercentage.toFixed(1)}%. 
            {encryptionCompliance.violations.length} tables require attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Encryption Status Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="w-4 h-4" />
              Data at Rest
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {encryptionAtRest.filter(e => e.status === 'encrypted').length}/
              {encryptionAtRest.length}
            </div>
            <p className="text-xs text-muted-foreground">Services encrypted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Data in Transit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {encryptionInTransit.filter(e => e.status === 'encrypted').length}/
              {encryptionInTransit.length}
            </div>
            <p className="text-xs text-muted-foreground">Connections secured</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              DLP Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {dlpAlerts.length}
            </div>
            <p className="text-xs text-muted-foreground">Recent alerts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <HardDrive className="w-4 h-4" />
              Backup Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {backupStatus?.integrityValid ? '✅' : '❌'}
            </div>
            <p className="text-xs text-muted-foreground">
              {backupStatus?.lastBackup ? 
                `Last: ${new Date(backupStatus.lastBackup).toLocaleDateString()}` : 
                'No backups found'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Encryption Status Details */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Encryption at Rest</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {encryptionAtRest.map((status, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(status.status)}
                    <div>
                      <p className="font-medium">{status.service}</p>
                      <p className="text-sm text-muted-foreground">
                        {status.algorithm} • {status.keyManagement}
                      </p>
                    </div>
                  </div>
                  <Badge variant={status.status === 'encrypted' ? 'default' : 'destructive'}>
                    {status.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Encryption in Transit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {encryptionInTransit.map((status, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(status.status)}
                    <div>
                      <p className="font-medium">{status.service}</p>
                      <p className="text-sm text-muted-foreground">
                        {status.algorithm} • {status.keyManagement}
                      </p>
                    </div>
                  </div>
                  <Badge variant={status.status === 'encrypted' ? 'default' : 'destructive'}>
                    {status.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Classifications */}
      <Card>
        <CardHeader>
          <CardTitle>Data Classification Matrix</CardTitle>
          <p className="text-sm text-muted-foreground">
            Classification levels and encryption requirements for sensitive data
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dataClassifications.map((classification, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{classification.table}</p>
                    <Badge variant={getClassificationColor(classification.classification)}>
                      {classification.classification}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Sensitive fields: {classification.sensitiveFields.join(', ')}
                  </p>
                </div>
                <div className="text-right">
                  {classification.encryptionRequired ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-400" />
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {classification.encryptionRequired ? 'Encrypted' : 'No encryption'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent DLP Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent DLP Alerts</CardTitle>
          <p className="text-sm text-muted-foreground">
            Data loss prevention alerts and suspicious activities
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {dlpAlerts.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No DLP alerts recorded</p>
            ) : (
              dlpAlerts.slice(0, 10).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-2 border rounded text-sm">
                  <div>
                    <span className="font-medium">{alert.type.replace('_', ' ')}</span>
                    <span className="text-muted-foreground ml-2">{alert.description}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      alert.severity === 'critical' ? 'destructive' :
                      alert.severity === 'high' ? 'destructive' :
                      alert.severity === 'medium' ? 'secondary' : 'outline'
                    }>
                      {alert.severity}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SOC2DataProtectionPanel;
