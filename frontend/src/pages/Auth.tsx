import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const AuthPage = () => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [village, setVillage] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('admin');

  const navigate = useNavigate();
  const { login, signup } = useAuth();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const me = mode === 'signup'
        ? await signup({ username, password, role, village: village || undefined })
        : await login(username, password);
      toast({ title: 'Success', description: mode === 'signup' ? 'Account created' : 'Logged in' });
      navigate(me.role === 'admin' ? '/dashboard' : '/');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message ?? 'Action failed' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold">{mode === 'login' ? 'Login' : 'Create account'}</h1>
          <p className="text-muted-foreground">{mode === 'login' ? 'Welcome back' : 'Join the platform'}</p>
        </div>
        <form onSubmit={submit} className="space-y-4 bg-card rounded-xl p-6 border">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {mode === 'signup' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  className="w-full rounded-md border px-3 py-2 bg-transparent"
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'admin' | 'user')}
                >
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="village">Village (optional)</Label>
                <Input id="village" value={village} onChange={(e) => setVillage(e.target.value)} />
              </div>
            </>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Please wait...' : (mode === 'login' ? 'Login' : 'Sign up')}</Button>
        </form>
        <div className="text-center text-sm text-muted-foreground">
          {mode === 'login' ? (
            <>
              Not registered?{' '}
              <button className="text-primary" onClick={() => setMode('signup')}>Create an account</button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button className="text-primary" onClick={() => setMode('login')}>Login</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;


