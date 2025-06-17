
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { usePlatformAdmin } from '@/contexts/PlatformAdminContext';

const AuthTestComponent = () => {
  const { loginStudent, loginTeacher, student, teacher, logout: authLogout } = useAuth();
  const { login: adminLogin, admin, logout: adminLogout } = usePlatformAdmin();
  
  const [studentCreds, setStudentCreds] = useState({
    fullName: '',
    school: '',
    grade: '',
    password: ''
  });

  const [teacherCreds, setTeacherCreds] = useState({
    email: '',
    password: ''
  });

  const [adminCreds, setAdminCreds] = useState({
    email: 'zulfimoon1@gmail.com',
    password: 'admin123'
  });

  const [results, setResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testStudentLogin = async () => {
    try {
      addResult('Testing student login...');
      const result = await loginStudent(
        studentCreds.fullName,
        studentCreds.school,
        studentCreds.grade,
        studentCreds.password
      );
      
      if (result.student) {
        addResult(`✅ Student login successful: ${result.student.fullName}`);
      } else {
        addResult(`❌ Student login failed: ${result.error}`);
      }
    } catch (error) {
      addResult(`💥 Student login error: ${error}`);
    }
  };

  const testTeacherLogin = async () => {
    try {
      addResult('Testing teacher login...');
      const result = await loginTeacher(teacherCreds.email, teacherCreds.password);
      
      if (result.teacher) {
        addResult(`✅ Teacher login successful: ${result.teacher.email}`);
      } else {
        addResult(`❌ Teacher login failed: ${result.error}`);
      }
    } catch (error) {
      addResult(`💥 Teacher login error: ${error}`);
    }
  };

  const testAdminLogin = async () => {
    try {
      addResult('Testing admin login...');
      const result = await adminLogin(adminCreds.email, adminCreds.password);
      
      if (result.success) {
        addResult(`✅ Admin login successful: ${adminCreds.email}`);
      } else {
        addResult(`❌ Admin login failed: ${result.error}`);
      }
    } catch (error) {
      addResult(`💥 Admin login error: ${error}`);
    }
  };

  const handleLogout = () => {
    authLogout();
    adminLogout();
    addResult('🔓 Logged out from all sessions');
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Test Panel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Current Status */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Current Status:</h3>
            <div className="space-y-1 text-sm">
              <div>Student: {student ? `${student.fullName} (${student.school})` : 'Not logged in'}</div>
              <div>Teacher: {teacher ? `${teacher.name} (${teacher.email})` : 'Not logged in'}</div>
              <div>Admin: {admin ? `${admin.name} (${admin.email})` : 'Not logged in'}</div>
            </div>
          </div>

          {/* Student Login Test */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Student Login Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Full Name"
                value={studentCreds.fullName}
                onChange={(e) => setStudentCreds(prev => ({ ...prev, fullName: e.target.value }))}
              />
              <Input
                placeholder="School"
                value={studentCreds.school}
                onChange={(e) => setStudentCreds(prev => ({ ...prev, school: e.target.value }))}
              />
              <Input
                placeholder="Grade"
                value={studentCreds.grade}
                onChange={(e) => setStudentCreds(prev => ({ ...prev, grade: e.target.value }))}
              />
              <Input
                type="password"
                placeholder="Password"
                value={studentCreds.password}
                onChange={(e) => setStudentCreds(prev => ({ ...prev, password: e.target.value }))}
              />
              <Button onClick={testStudentLogin} className="w-full">
                Test Student Login
              </Button>
            </CardContent>
          </Card>

          {/* Teacher Login Test */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Teacher Login Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                type="email"
                placeholder="Email"
                value={teacherCreds.email}
                onChange={(e) => setTeacherCreds(prev => ({ ...prev, email: e.target.value }))}
              />
              <Input
                type="password"
                placeholder="Password"
                value={teacherCreds.password}
                onChange={(e) => setTeacherCreds(prev => ({ ...prev, password: e.target.value }))}
              />
              <Button onClick={testTeacherLogin} className="w-full">
                Test Teacher Login
              </Button>
            </CardContent>
          </Card>

          {/* Admin Login Test */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Platform Admin Login Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                type="email"
                placeholder="Admin Email"
                value={adminCreds.email}
                onChange={(e) => setAdminCreds(prev => ({ ...prev, email: e.target.value }))}
              />
              <Input
                type="password"
                placeholder="Admin Password"
                value={adminCreds.password}
                onChange={(e) => setAdminCreds(prev => ({ ...prev, password: e.target.value }))}
              />
              <Button onClick={testAdminLogin} className="w-full">
                Test Admin Login
              </Button>
            </CardContent>
          </Card>

          {/* Logout */}
          <Button onClick={handleLogout} variant="outline" className="w-full">
            Logout All Sessions
          </Button>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
                {results.length === 0 ? (
                  <div className="text-gray-500">Test results will appear here...</div>
                ) : (
                  results.map((result, index) => (
                    <div key={index}>{result}</div>
                  ))
                )}
              </div>
              <Button 
                onClick={() => setResults([])} 
                variant="outline" 
                size="sm" 
                className="mt-2"
              >
                Clear Results
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthTestComponent;
