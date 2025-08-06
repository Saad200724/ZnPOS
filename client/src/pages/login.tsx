import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";

export default function Login() {
  const { login, register, isLoggingIn, isRegistering } = useAuth();
  const [loginForm, setLoginForm] = useState({
    username: "",
    businessId: ""
  });
  const [registerForm, setRegisterForm] = useState({
    business: {
      name: "",
      email: "",
      phone: "",
      address: ""
    },
    user: {
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      password: ""
    }
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login({
      username: loginForm.username,
      businessId: parseInt(loginForm.businessId)
    });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    register(registerForm);
  };

  return (
    <div className="min-h-screen emerald-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <span className="text-emerald-600 font-bold text-2xl">Z</span>
            </div>
            <h1 className="text-3xl font-bold text-white">ZnForge POS</h1>
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
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Get Started</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={loginForm.username}
                      onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessId">Business ID</Label>
                    <Input
                      id="businessId"
                      type="number"
                      value={loginForm.businessId}
                      onChange={(e) => setLoginForm({...loginForm, businessId: e.target.value})}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full btn-primary" 
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-3">
                    <h3 className="font-medium">Business Information</h3>
                    <div>
                      <Label htmlFor="businessName">Business Name</Label>
                      <Input
                        id="businessName"
                        value={registerForm.business.name}
                        onChange={(e) => setRegisterForm({
                          ...registerForm,
                          business: {...registerForm.business, name: e.target.value}
                        })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="businessEmail">Business Email</Label>
                      <Input
                        id="businessEmail"
                        type="email"
                        value={registerForm.business.email}
                        onChange={(e) => setRegisterForm({
                          ...registerForm,
                          business: {...registerForm.business, email: e.target.value}
                        })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-medium">Admin User</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={registerForm.user.firstName}
                          onChange={(e) => setRegisterForm({
                            ...registerForm,
                            user: {...registerForm.user, firstName: e.target.value}
                          })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={registerForm.user.lastName}
                          onChange={(e) => setRegisterForm({
                            ...registerForm,
                            user: {...registerForm.user, lastName: e.target.value}
                          })}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="userUsername">Username</Label>
                      <Input
                        id="userUsername"
                        value={registerForm.user.username}
                        onChange={(e) => setRegisterForm({
                          ...registerForm,
                          user: {...registerForm.user, username: e.target.value}
                        })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="userEmail">Email</Label>
                      <Input
                        id="userEmail"
                        type="email"
                        value={registerForm.user.email}
                        onChange={(e) => setRegisterForm({
                          ...registerForm,
                          user: {...registerForm.user, email: e.target.value}
                        })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={registerForm.user.password}
                        onChange={(e) => setRegisterForm({
                          ...registerForm,
                          user: {...registerForm.user, password: e.target.value}
                        })}
                        required
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full btn-primary" 
                    disabled={isRegistering}
                  >
                    {isRegistering ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
