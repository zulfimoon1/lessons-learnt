
export interface StudentStatistics {
  totalStudents: number;
  activeStudents: number;
  studentsThisWeek: number;
  averageGrade: string;
  topPerformingSchools: Array<{
    school: string;
    studentCount: number;
  }>;
}

export interface TeacherStatistics {
  totalTeachers: number;
  activeTeachers: number;
  teachersThisWeek: number;
  averageExperience: number;
  topPerformingSchools: Array<{
    school: string;
    teacherCount: number;
  }>;
}

export interface PlatformStatistics {
  students: StudentStatistics;
  teachers: TeacherStatistics;
  totalFeedback: number;
  totalSchools: number;
}
