
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Clock, Mail } from 'lucide-react';

interface DataExportCardsProps {
  onExport: (type: string) => void;
  exportingData: string | null;
  exportStatus: 'idle' | 'processing' | 'completed' | 'error';
}

const DataExportCards: React.FC<DataExportCardsProps> = ({ 
  onExport, 
  exportingData, 
  exportStatus 
}) => {
  const isDisabled = (type: string) => 
    exportingData === type || exportStatus === 'processing';

  const renderExportButton = (type: string, title: string, variant: "default" | "outline" = "outline", className = "") => (
    <Button
      onClick={() => onExport(type)}
      disabled={isDisabled(type)}
      className={`w-full ${className}`}
      variant={variant}
    >
      {exportingData === type ? (
        <>
          <Clock className="w-4 h-4 mr-2 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          {title}
        </>
      )}
    </Button>
  );

  return (
    <div className="grid grid-cols-1 gap-4">
      {/* Personal Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Personal Data Export
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600">
            Includes: Profile information, privacy settings, consent history, data processing details
          </p>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              ~30 seconds
            </Badge>
            <Badge variant="outline" className="text-xs">
              JSON Format
            </Badge>
            <Badge variant="outline" className="text-xs">
              GDPR Art. 15
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Mail className="w-3 h-3 mr-1" />
              Email Confirmation
            </Badge>
          </div>
          {renderExportButton('personal', 'Export Personal Data')}
        </CardContent>
      </Card>

      {/* Educational Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Educational Data Export
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600">
            Includes: All feedback submissions, ratings, educational interactions, and learning data
          </p>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              ~45 seconds
            </Badge>
            <Badge variant="outline" className="text-xs">
              JSON Format
            </Badge>
            <Badge variant="outline" className="text-xs">
              GDPR Art. 15
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Mail className="w-3 h-3 mr-1" />
              Email Confirmation
            </Badge>
          </div>
          {renderExportButton('feedback', 'Export Educational Data')}
        </CardContent>
      </Card>

      {/* Complete Export */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-600" />
            Complete Data Export
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600">
            Includes: All your data in a single comprehensive export with full GDPR compliance metadata
          </p>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              ~60 seconds
            </Badge>
            <Badge variant="outline" className="text-xs">
              JSON Format
            </Badge>
            <Badge className="text-xs bg-blue-100 text-blue-800">
              Recommended
            </Badge>
            <Badge variant="outline" className="text-xs">
              GDPR Art. 15 & 20
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Mail className="w-3 h-3 mr-1" />
              Email Confirmation
            </Badge>
          </div>
          {renderExportButton('complete', 'Export All Data', "default", "bg-blue-600 hover:bg-blue-700")}
        </CardContent>
      </Card>
    </div>
  );
};

export default DataExportCards;
