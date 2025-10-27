import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '@/App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Lock, Briefcase } from 'lucide-react';

const AdminLogin = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/admin/login`, { password });
      
      if (response.data.success) {
        toast.success('Login successful!');
        onLogin();
        navigate('/admin/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)' }}>
            <Briefcase className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#D4AF37', fontFamily: 'Playfair Display, serif' }}>
            Business Card Manager
          </h1>
          <p className="text-gray-400">Admin Access</p>
        </div>

        <Card className="glass" style={{ background: 'rgba(26, 26, 26, 0.8)', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
          <CardHeader>
            <CardTitle className="text-2xl" style={{ color: '#D4AF37' }}>Admin Login</CardTitle>
            <CardDescription style={{ color: '#a0a0a0' }}>Enter password to access admin panel</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    data-testid="admin-password-input"
                    type="password"
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    style={{ 
                      background: 'rgba(10, 10, 10, 0.5)', 
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      color: '#e0e0e0'
                    }}
                    required
                  />
                </div>
              </div>
              <Button
                data-testid="admin-login-button"
                type="submit"
                className="w-full"
                style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)', color: '#000', fontWeight: '600' }}
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
              <p className="text-sm text-center" style={{ color: '#808080' }}>
                Default password: <span style={{ color: '#D4AF37' }}>admin123</span>
              </p>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button
            data-testid="back-to-gallery-button"
            variant="ghost"
            onClick={() => navigate('/')}
            style={{ color: '#D4AF37' }}
          >
            ← Back to Gallery
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;