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
    businessId: ""
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login({
      username: loginForm.username,
      businessId: parseInt(loginForm.businessId)
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
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mt-4">
              <h4 className="font-medium text-emerald-800 mb-2">Demo Credentials</h4>
              <p className="text-sm text-emerald-700">Username: <strong>admin</strong></p>
              <p className="text-sm text-emerald-700">Business ID: <strong>1</strong></p>
            </div>
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
                <Label htmlFor="businessId">Business ID</Label>
                <Input
                  id="businessId"
                  data-testid="input-business-id"
                  type="number"
                  value={loginForm.businessId}
                  onChange={(e) => setLoginForm({...loginForm, businessId: e.target.value})}
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