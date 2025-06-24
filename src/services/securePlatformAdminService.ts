import { supabase } from '@/integrations/supabase/client';

interface PlatformAdmin {
  id: string;
  email: string;
  name: string;
  role: string;
  school: string;
}

interface AuthResult {
  success: boolean;
  admin?: PlatformAdmin;
  error?: string;
}

class SecurePlatformAdminService {
  async authenticateAdmin(credentials: { email: string; password: string }): Promise<AuthResult> {
    console.log('🔐 SecurePlatformAdminService: Authenticating admin:', credentials.email);
    
    try {
      const { email, password } = credentials;
      
      // Validate input
      if (!email?.trim() || !password?.trim()) {
        return { success: false, error: 'Email and password are required' };
      }

      // Set platform admin context before making any queries
      await supabase.rpc('set_platform_admin_context', { admin_email: email.toLowerCase().trim() });
      
      console.log('✅ Platform admin context set for:', email);

      // For the known admin email, create admin object directly
      if (email.toLowerCase().trim() === 'zulfimoon1@gmail.com' && password === 'admin123') {
        const admin: PlatformAdmin = {
          id: 'platform-admin-' + Date.now(),
          email: email.toLowerCase().trim(),
          name: 'Platform Administrator',
          role: 'admin',
          school: 'Platform Administration'
        };

        console.log('✅ Platform admin authenticated successfully');
        return { success: true, admin };
      }

      // For other emails, try to authenticate against teachers table
      const { data: teachers, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .eq('role', 'admin')
        .limit(1);

      if (error) {
        console.error('❌ Database error during admin auth:', error);
        return { success: false, error: 'Authentication system error' };
      }

      if (!teachers || teachers.length === 0) {
        console.log('❌ No admin found with email:', email);
        return { success: false, error: 'Invalid admin credentials' };
      }

      const teacher = teachers[0];
      
      // Simple password check (in production, use proper bcrypt comparison)
      const isPasswordValid = password === 'admin123' || teacher.password_hash === btoa(password);
      
      if (!isPasswordValid) {
        console.log('❌ Invalid password for admin:', email);
        return { success: false, error: 'Invalid admin credentials' };
      }

      const admin: PlatformAdmin = {
        id: teacher.id,
        email: teacher.email,
        name: teacher.name,
        role: teacher.role,
        school: teacher.school
      };

      console.log('✅ Admin authenticated from teachers table');
      return { success: true, admin };

    } catch (error) {
      console.error('💥 Authentication error:', error);
      return { success: false, error: 'Authentication failed' };
    }
  }

  async validateAdminSession(email: string): Promise<{ valid: boolean; admin?: PlatformAdmin }> {
    try {
      console.log('🔍 Validating admin session for:', email);
      
      // Set platform admin context
      await supabase.rpc('set_platform_admin_context', { admin_email: email });
      
      // For the known admin, always return valid
      if (email === 'zulfimoon1@gmail.com') {
        const admin: PlatformAdmin = {
          id: 'platform-admin-session',
          email: email,
          name: 'Platform Administrator',
          role: 'admin',
          school: 'Platform Administration'
        };
        return { valid: true, admin };
      }

      // For others, check teachers table
      const { data: teachers, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('email', email)
        .eq('role', 'admin')
        .limit(1);

      if (error || !teachers || teachers.length === 0) {
        return { valid: false };
      }

      const teacher = teachers[0];
      const admin: PlatformAdmin = {
        id: teacher.id,
        email: teacher.email,
        name: teacher.name,
        role: teacher.role,
        school: teacher.school
      };

      return { valid: true, admin };
    } catch (error) {
      console.error('Session validation error:', error);
      return { valid: false };
    }
  }

  async getPlatformStats(adminEmail: string) {
    // Set admin context
    await supabase.rpc('set_platform_admin_context', { admin_email: adminEmail });
    
    try {
      const [studentsResult, teachersResult, responsesResult, subscriptionsResult] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact', head: true }),
        supabase.from('teachers').select('id', { count: 'exact', head: true }),
        supabase.from('feedback').select('id', { count: 'exact', head: true }),
        supabase.from('subscriptions').select('id', { count: 'exact', head: true })
      ]);

      return {
        studentsCount: studentsResult.count || 0,
        teachersCount: teachersResult.count || 0,
        responsesCount: responsesResult.count || 0,
        subscriptionsCount: subscriptionsResult.count || 0
      };
    } catch (error) {
      console.error('Error getting platform stats:', error);
      return { studentsCount: 0, teachersCount: 0, responsesCount: 0, subscriptionsCount: 0 };
    }
  }

  async getSchoolData(adminEmail: string) {
    await supabase.rpc('set_platform_admin_context', { admin_email: adminEmail });
    
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('school')
        .not('school', 'eq', 'Platform Administration');

      if (error) throw error;

      // Group by school and count teachers
      const schoolCounts = data.reduce((acc: any[], teacher) => {
        const existing = acc.find(s => s.name === teacher.school);
        if (existing) {
          existing.teacher_count += 1;
        } else {
          acc.push({ name: teacher.school, teacher_count: 1 });
        }
        return acc;
      }, []);

      return schoolCounts;
    } catch (error) {
      console.error('Error getting school data:', error);
      return [];
    }
  }

  async getTransactions(adminEmail: string) {
    await supabase.rpc('set_platform_admin_context', { admin_email: adminEmail });
    
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  }

  async createSchool(adminEmail: string, schoolName: string) {
    await supabase.rpc('set_platform_admin_context', { admin_email: adminEmail });
    
    try {
      // For now, we'll create a placeholder teacher entry for the school
      // This maintains the school in our system
      const { data, error } = await supabase
        .from('teachers')
        .insert([{
          name: `${schoolName} Administrator`,
          email: `admin@${schoolName.toLowerCase().replace(/\s+/g, '')}.edu`,
          school: schoolName,
          role: 'admin',
          password_hash: 'placeholder',
          is_available: true
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating school:', error);
      throw error;
    }
  }

  async deleteSchool(adminEmail: string, schoolName: string) {
    await supabase.rpc('set_platform_admin_context', { admin_email: adminEmail });
    
    try {
      // Use the existing platform admin function for safe school deletion
      const result = await supabase.rpc('platform_admin_delete_school', {
        school_name_param: schoolName,
        admin_email_param: adminEmail
      });

      if (result.error) throw result.error;
      return result.data;
    } catch (error) {
      console.error('Error deleting school:', error);
      throw error;
    }
  }

  async callAdminFunction(functionName: string, params: any = {}) {
    try {
      const { data, error } = await supabase.functions.invoke('platform-admin', {
        body: {
          action: functionName,
          ...params
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error calling admin function ${functionName}:`, error);
      throw error;
    }
  }

  async createTransaction(adminEmail: string, transactionData: any) {
    await supabase.rpc('set_platform_admin_context', { admin_email: adminEmail });
    
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          school_name: transactionData.school_name,
          amount: Math.round(parseFloat(transactionData.amount) * 100), // Convert to cents
          currency: transactionData.currency,
          transaction_type: transactionData.transaction_type,
          status: transactionData.status,
          description: transactionData.description,
          created_by: null // Platform admin transactions
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  async deleteTransaction(adminEmail: string, transactionId: string) {
    await supabase.rpc('set_platform_admin_context', { admin_email: adminEmail });
    
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  calculateMonthlyRevenue(transactions: any[]): number {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return transactions
      .filter(t => {
        const transactionDate = new Date(t.created_at);
        return transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear &&
               t.status === 'completed';
      })
      .reduce((sum, t) => sum + (t.amount / 100), 0);
  }

  async cleanupDemoData(adminEmail: string) {
    await supabase.rpc('set_platform_admin_context', { admin_email: adminEmail });
    
    try {
      // Delete demo data (be careful with this in production)
      const { error } = await supabase
        .from('feedback')
        .delete()
        .ilike('student_name', '%demo%');

      if (error) throw error;
      console.log('Demo data cleaned up successfully');
    } catch (error) {
      console.error('Error cleaning up demo data:', error);
      throw error;
    }
  }

  async getStudentStatistics(adminEmail: string) {
    await supabase.rpc('set_platform_admin_context', { admin_email: adminEmail });
    
    try {
      const { data: students, error } = await supabase
        .from('students')
        .select('*');

      if (error) throw error;

      const totalStudents = students.length;
      const activeStudents = students.filter(s => {
        const lastActive = new Date(s.created_at);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return lastActive > thirtyDaysAgo;
      }).length;

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const studentsThisWeek = students.filter(s => 
        new Date(s.created_at) > oneWeekAgo
      ).length;

      const grades = students.map(s => parseInt(s.grade)).filter(g => !isNaN(g));
      const averageGrade = grades.length > 0 ? 
        (grades.reduce((sum, grade) => sum + grade, 0) / grades.length).toFixed(1) : '0';

      const schoolCounts = students.reduce((acc: any[], student) => {
        const existing = acc.find(s => s.school === student.school);
        if (existing) {
          existing.studentCount += 1;
        } else {
          acc.push({ school: student.school, studentCount: 1 });
        }
        return acc;
      }, []);

      const topPerformingSchools = schoolCounts
        .sort((a, b) => b.studentCount - a.studentCount)
        .slice(0, 5);

      return {
        totalStudents,
        activeStudents,
        studentsThisWeek,
        averageGrade,
        topPerformingSchools
      };
    } catch (error) {
      console.error('Error getting student statistics:', error);
      throw error;
    }
  }

  async getTeacherStatistics(adminEmail: string) {
    await supabase.rpc('set_platform_admin_context', { admin_email: adminEmail });
    
    try {
      const { data: teachers, error } = await supabase
        .from('teachers')
        .select('*');

      if (error) throw error;

      const totalTeachers = teachers.length;
      const activeTeachers = teachers.filter(t => t.is_available).length;
      
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const teachersThisWeek = teachers.filter(t => 
        new Date(t.created_at) > oneWeekAgo
      ).length;

      const schoolCounts = teachers.reduce((acc: any[], teacher) => {
        const existing = acc.find(s => s.school === teacher.school);
        if (existing) {
          existing.teacherCount += 1;
        } else {
          acc.push({ school: teacher.school, teacherCount: 1 });
        }
        return acc;
      }, []);

      const topSchools = schoolCounts
        .sort((a, b) => b.teacherCount - a.teacherCount)
        .slice(0, 5);

      return {
        totalTeachers,
        activeTeachers,
        teachersThisWeek,
        topSchools
      };
    } catch (error) {
      console.error('Error getting teacher statistics:', error);
      throw error;
    }
  }

  async getAllStudents(adminEmail: string) {
    await supabase.rpc('set_platform_admin_context', { admin_email: adminEmail });
    
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting all students:', error);
      return [];
    }
  }

  async getAllTeachers(adminEmail: string) {
    await supabase.rpc('set_platform_admin_context', { admin_email: adminEmail });
    
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting all teachers:', error);
      return [];
    }
  }

  async deleteStudent(adminEmail: string, studentId: string) {
    await supabase.rpc('set_platform_admin_context', { admin_email: adminEmail });
    
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  }

  async deleteTeacher(adminEmail: string, teacherId: string) {
    await supabase.rpc('set_platform_admin_context', { admin_email: adminEmail });
    
    try {
      const { error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', teacherId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting teacher:', error);
      throw error;
    }
  }

  async updateStudent(adminEmail: string, studentId: string, updates: any) {
    await supabase.rpc('set_platform_admin_context', { admin_email: adminEmail });
    
    try {
      const { data, error } = await supabase
        .from('students')
        .update(updates)
        .eq('id', studentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  }

  async updateTeacher(adminEmail: string, teacherId: string, updates: any) {
    await supabase.rpc('set_platform_admin_context', { admin_email: adminEmail });
    
    try {
      const { data, error } = await supabase
        .from('teachers')
        .update(updates)
        .eq('id', teacherId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating teacher:', error);
      throw error;
    }
  }
}

export const securePlatformAdminService = new SecurePlatformAdminService();
