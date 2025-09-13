import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import znforgeLogo from "@assets/ZnForge_Logo_1757783430022.png";

export default function Login() {
  const { login, isLoggingIn } = useAuth();
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: ""
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login({
      username: loginForm.username,
      password: loginForm.password
    });
  };

  return (
    <div className="min-h-screen emerald-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-2">
              <img src={znforgeLogo} alt="ZnPOS Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-white">ZnPOS</h1>
          </div>
          <p className="text-emerald-100">Modern Point of Sale System</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Welcome</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  data-testid="input-username"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  data-testid="input-password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  required
                />
              </div>
              <Button 
                type="submit" 
                data-testid="button-signin"
                className="w-full btn-primary" 
                disabled={isLoggingIn}
              >
                {isLoggingIn ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}