
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, Users, Calendar } from 'lucide-react';

const HIPAATrainingTracking: React.FC = () => {
  const trainingData = [
    {
      employee: 'Dr. Sarah Johnson',
      role: 'School Psychologist',
      lastTraining: '2024-05-15',
      nextDue: '2024-11-15',
      status: 'Current'
    },
    {
      employee: 'Mike Chen',
      role: 'Teacher',
      lastTraining: '2024-03-20',
      nextDue: '2024-09-20',
      status: 'Due Soon'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5" />
          HIPAA Training & Workforce Management
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Track HIPAA training compliance for all workforce members
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {trainingData.map((training, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-medium">{training.employee}</h4>
                  <p className="text-sm text-gray-600">{training.role}</p>
                </div>
                <span className={`text-sm px-2 py-1 rounded ${
                  training.status === 'Current' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {training.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Last Training: {training.lastTraining}</span>
                <span>Next Due: {training.nextDue}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex gap-2">
          <Button variant="outline">
            <Users className="w-4 h-4 mr-2" />
            Add Workforce Member
          </Button>
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Training
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HIPAATrainingTracking;
