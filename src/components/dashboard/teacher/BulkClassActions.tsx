
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Calendar, Copy } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ClassSchedule {
  id: string;
  lesson_topic: string;
  subject: string;
  class_date: string;
  class_time: string;
}

interface BulkClassActionsProps {
  classes: ClassSchedule[];
  onBulkDelete: (classIds: string[]) => void;
  onBulkReschedule: (classIds: string[]) => void;
  onBulkDuplicate: (classIds: string[]) => void;
}

const BulkClassActions: React.FC<BulkClassActionsProps> = ({
  classes,
  onBulkDelete,
  onBulkReschedule,
  onBulkDuplicate
}) => {
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const { t } = useLanguage();

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedClasses(classes.map(c => c.id));
    } else {
      setSelectedClasses([]);
    }
  };

  const handleSelectClass = (classId: string, checked: boolean) => {
    if (checked) {
      setSelectedClasses(prev => [...prev, classId]);
    } else {
      setSelectedClasses(prev => prev.filter(id => id !== classId));
    }
  };

  const selectedCount = selectedClasses.length;
  const allSelected = selectedCount === classes.length && classes.length > 0;
  const someSelected = selectedCount > 0 && selectedCount < classes.length;

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t('teacher.bulkActions') || 'Bulk Actions'}</span>
          <Badge variant="outline">
            {selectedCount} {t('teacher.selected') || 'selected'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Select All */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="select-all"
            checked={allSelected}
            ref={(el) => {
              if (el) el.indeterminate = someSelected;
            }}
            onCheckedChange={handleSelectAll}
          />
          <label htmlFor="select-all" className="text-sm font-medium">
            {t('teacher.selectAll') || 'Select All Classes'}
          </label>
        </div>

        {/* Class List */}
        <div className="max-h-48 overflow-y-auto space-y-2">
          {classes.map((classItem) => (
            <div key={classItem.id} className="flex items-center space-x-2 p-2 border rounded">
              <Checkbox
                id={classItem.id}
                checked={selectedClasses.includes(classItem.id)}
                onCheckedChange={(checked) => handleSelectClass(classItem.id, checked as boolean)}
              />
              <div className="flex-1">
                <p className="text-sm font-medium">{classItem.lesson_topic}</p>
                <p className="text-xs text-gray-500">
                  {classItem.subject} - {new Date(classItem.class_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bulk Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBulkDuplicate(selectedClasses)}
            disabled={selectedCount === 0}
            className="flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            {t('teacher.duplicate') || 'Duplicate'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onBulkReschedule(selectedClasses)}
            disabled={selectedCount === 0}
            className="flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            {t('teacher.reschedule') || 'Reschedule'}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                disabled={selectedCount === 0}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {t('teacher.delete') || 'Delete'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {t('teacher.confirmDelete') || 'Confirm Deletion'}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t('teacher.deleteWarning') || `Are you sure you want to delete ${selectedCount} selected classes? This action cannot be undone.`}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  {t('common.cancel') || 'Cancel'}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    onBulkDelete(selectedClasses);
                    setSelectedClasses([]);
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {t('teacher.delete') || 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkClassActions;
