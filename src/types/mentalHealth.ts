
export interface MentalHealthAlert {
  id: string;
  student_name: string;
  school: string;
  grade: string;
  alert_type: string;
  content: string;
  severity_level: number;
  is_reviewed: boolean;
  created_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  student_id?: string;
  source_table?: string;
  source_id?: string;
}

export interface AlertStats {
  total: number;
  unreviewed: number;
  critical: number;
  bySchool: Record<string, number>;
  criticalAlerts: MentalHealthAlert[];
}
