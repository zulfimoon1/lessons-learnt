
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpenIcon, Users, GraduationCap, Shield, Target, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { teacher, student } = useAuth();
  const { user, teacher: supabaseTeacher, student: supabaseStudent } = useSupabaseAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (teacher) {
      if (teacher.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/teacher-dashboard');
      }
    } else if (student) {
      navigate('/student-dashboard');
    } else if (supabaseTeacher) {
      if (supabaseTeacher.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/teacher-dashboard');
      }
    } else if (supabaseStudent) {
      navigate('/student-dashboard');
    }
  }, [teacher, student, supabaseTeacher, supabaseStudent, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpenIcon className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Lessons Learnt</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/demo">
              <Button variant="outline">Demo</Button>
            </Link>
            <Link to="/teacher-login">
              <Button className="bg-emerald-600 hover:bg-emerald-700">Teacher Login</Button>
            </Link>
            <Link to="/student-login">
              <Button className="bg-blue-600 hover:bg-blue-700">Student Login</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Transform Education with
            <span className="text-blue-600 block">Real-Time Student Feedback</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Empower teachers with instant insights into student understanding, engagement, and emotional well-being. 
            Create more responsive and effective learning environments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/teacher-login">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8 py-4">
                <GraduationCap className="w-5 h-5 mr-2" />
                Start as Teacher
              </Button>
            </Link>
            <Link to="/student-login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                <Users className="w-5 h-5 mr-2" />
                Join as Student
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Lessons Learnt?</h3>
          <p className="text-lg text-gray-600">Comprehensive tools for modern education</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Target className="w-12 h-12 text-blue-600 mb-4" />
              <CardTitle className="text-xl">Real-Time Feedback</CardTitle>
              <CardDescription>
                Get instant insights into student understanding and engagement during lessons
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Students provide immediate feedback on lesson pace, difficulty, and comprehension, 
                allowing teachers to adjust in real-time.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-emerald-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Heart className="w-12 h-12 text-emerald-600 mb-4" />
              <CardTitle className="text-xl">Emotional Well-being</CardTitle>
              <CardDescription>
                Monitor student emotional states and mental health indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Advanced sentiment analysis helps identify students who may need additional 
                support or intervention from school counselors.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-purple-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Shield className="w-12 h-12 text-purple-600 mb-4" />
              <CardTitle className="text-xl">Secure & Private</CardTitle>
              <CardDescription>
                Student privacy and data security are our top priorities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Anonymous feedback options, encrypted data transmission, and GDPR-compliant 
                data handling ensure student privacy is protected.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Classroom?</h3>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of educators already using Lessons Learnt to enhance their teaching
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/teacher-login">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4">
                Get Started Free
              </Button>
            </Link>
            <Link to="/demo">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4">
                Watch Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <BookOpenIcon className="w-6 h-6" />
            <span className="text-lg font-semibold">Lessons Learnt</span>
          </div>
          <p className="text-gray-400">
            Empowering education through real-time feedback and student well-being insights
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
