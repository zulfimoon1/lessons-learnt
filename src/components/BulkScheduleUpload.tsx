
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UploadResult {
  success: boolean;
  message: string;
  schedules?: any[];
}

const BulkScheduleUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.name.endsWith('.csv') && !selectedFile.name.endsWith('.xlsx')) {
        toast({
          title: "Invalid file type",
          description: "Please upload a CSV or Excel file",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
      setUploadResult(null);
    }
  };

  const parseCSV = (content: string) => {
    const lines = content.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    
    const schedules = lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim());
      const schedule: any = {};
      
      headers.forEach((header, i) => {
        schedule[header] = values[i] || '';
      });
      
      return {
        id: index + 1,
        ...schedule,
        status: 'pending'
      };
    });
    
    return schedules;
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    
    try {
      const content = await file.text();
      const schedules = parseCSV(content);
      
      // Validate required fields
      const requiredFields = ['class_name', 'subject', 'day_of_week', 'start_time', 'end_time'];
      const hasRequiredFields = schedules.every(schedule => 
        requiredFields.every(field => schedule[field])
      );
      
      if (!hasRequiredFields) {
        throw new Error('Missing required fields. Ensure all schedules have: class_name, subject, day_of_week, start_time, end_time');
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setUploadResult({
        success: true,
        message: `Successfully uploaded ${schedules.length} schedules`,
        schedules
      });
      
      toast({
        title: "Upload successful",
        description: `${schedules.length} schedules have been uploaded`,
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadResult({
        success: false,
        message: errorMessage
      });
      
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Bulk Schedule Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="schedule-file">Upload Schedule File</Label>
          <Input
            id="schedule-file"
            type="file"
            accept=".csv,.xlsx"
            onChange={handleFileChange}
            className="cursor-pointer"
          />
          <p className="text-sm text-muted-foreground">
            Upload a CSV or Excel file with columns: class_name, subject, day_of_week, start_time, end_time
          </p>
        </div>

        {file && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <FileText className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium">{file.name}</span>
            <span className="text-xs text-gray-500">({Math.round(file.size / 1024)} KB)</span>
          </div>
        )}

        <Button 
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="w-full"
        >
          {isUploading ? "Uploading..." : "Upload Schedules"}
        </Button>

        {uploadResult && (
          <Alert className={uploadResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            {uploadResult.success ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <AlertDescription className={uploadResult.success ? "text-green-800" : "text-red-800"}>
              {uploadResult.message}
            </AlertDescription>
          </Alert>
        )}

        {uploadResult?.success && uploadResult.schedules && (
          <div className="space-y-2">
            <h4 className="font-medium">Preview of uploaded schedules:</h4>
            <div className="max-h-40 overflow-y-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-2 text-left">Class</th>
                    <th className="p-2 text-left">Subject</th>
                    <th className="p-2 text-left">Day</th>
                    <th className="p-2 text-left">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadResult.schedules.slice(0, 5).map((schedule, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-2">{schedule.class_name}</td>
                      <td className="p-2">{schedule.subject}</td>
                      <td className="p-2">{schedule.day_of_week}</td>
                      <td className="p-2">{schedule.start_time} - {schedule.end_time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {uploadResult.schedules.length > 5 && (
                <p className="p-2 text-xs text-gray-500">
                  ... and {uploadResult.schedules.length - 5} more schedules
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BulkScheduleUpload;
