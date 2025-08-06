import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { 
  Settings as SettingsIcon, 
  Building, 
  CreditCard, 
  Bell, 
  Shield, 
  Palette,
  Receipt,
  Users,
  Save
} from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const { business, user } = useAuth();
  
  const [businessSettings, setBusinessSettings] = useState({
    name: business?.name || "",
    email: business?.email || "",
    phone: business?.phone || "",
    address: business?.address || "",
    taxRate: business?.taxRate || "8.25",
    currency: business?.currency || "USD",
    timezone: "America/New_York",
    receiptFooter: "Thank you for your business!"
  });

  const [paymentSettings, setPaymentSettings] = useState({
    enableCash: true,
    enableCard: true,
    enableMobile: false,
    processingFee: "2.9",
    autoCalculateTax: true,
    requireCustomerInfo: false
  });

  const [notificationSettings, setNotificationSettings] = useState({
    lowStockAlerts: true,
    dailySalesReport: true,
    newCustomerSignup: false,
    systemUpdates: true,
    marketingEmails: false,
    smsNotifications: false
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: "60",
    passwordComplexity: true,
    loginAttempts: "5",
    dataBackup: true,
    auditLogging: true
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: "emerald",
    darkMode: false,
    compactView: false,
    showProductImages: true,
    currencySymbol: "$",
    dateFormat: "MM/DD/YYYY"
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (settingsData: any) => {
      // Mock API call - in real implementation this would call the backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      return settingsData;
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Your settings have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveSettings = (category: string) => {
    let settingsData;
    switch (category) {
      case 'business':
        settingsData = { type: 'business', data: businessSettings };
        break;
      case 'payment':
        settingsData = { type: 'payment', data: paymentSettings };
        break;
      case 'notifications':
        settingsData = { type: 'notifications', data: notificationSettings };
        break;
      case 'security':
        settingsData = { type: 'security', data: securitySettings };
        break;
      case 'appearance':
        settingsData = { type: 'appearance', data: appearanceSettings };
        break;
      default:
        return;
    }
    updateSettingsMutation.mutate(settingsData);
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
              <p className="text-gray-600">Manage your business configuration and preferences</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="business" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="business" className="flex items-center space-x-2">
                <Building className="w-4 h-4" />
                <span>Business</span>
              </TabsTrigger>
              <TabsTrigger value="payment" className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4" />
                <span>Payment</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center space-x-2">
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Security</span>
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center space-x-2">
                <Palette className="w-4 h-4" />
                <span>Appearance</span>
              </TabsTrigger>
            </TabsList>

            {/* Business Settings */}
            <TabsContent value="business">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="w-5 h-5" />
                    <span>Business Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="businessName">Business Name</Label>
                      <Input
                        id="businessName"
                        value={businessSettings.name}
                        onChange={(e) => setBusinessSettings({...businessSettings, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="businessEmail">Business Email</Label>
                      <Input
                        id="businessEmail"
                        type="email"
                        value={businessSettings.email}
                        onChange={(e) => setBusinessSettings({...businessSettings, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="businessPhone">Phone Number</Label>
                      <Input
                        id="businessPhone"
                        value={businessSettings.phone}
                        onChange={(e) => setBusinessSettings({...businessSettings, phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="taxRate">Tax Rate (%)</Label>
                      <Input
                        id="taxRate"
                        type="number"
                        step="0.01"
                        value={businessSettings.taxRate}
                        onChange={(e) => setBusinessSettings({...businessSettings, taxRate: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="businessAddress">Business Address</Label>
                    <Textarea
                      id="businessAddress"
                      value={businessSettings.address}
                      onChange={(e) => setBusinessSettings({...businessSettings, address: e.target.value})}
                      placeholder="Enter your complete business address"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <Select value={businessSettings.currency} onValueChange={(value) => setBusinessSettings({...businessSettings, currency: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select value={businessSettings.timezone} onValueChange={(value) => setBusinessSettings({...businessSettings, timezone: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/New_York">Eastern Time</SelectItem>
                          <SelectItem value="America/Chicago">Central Time</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="receiptFooter">Receipt Footer Message</Label>
                    <Textarea
                      id="receiptFooter"
                      value={businessSettings.receiptFooter}
                      onChange={(e) => setBusinessSettings({...businessSettings, receiptFooter: e.target.value})}
                      placeholder="Message to appear at the bottom of receipts"
                    />
                  </div>

                  <Button 
                    onClick={() => handleSaveSettings('business')} 
                    className="btn-primary"
                    disabled={updateSettingsMutation.isPending}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {updateSettingsMutation.isPending ? 'Saving...' : 'Save Business Settings'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payment Settings */}
            <TabsContent value="payment">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5" />
                    <span>Payment Configuration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Accepted Payment Methods</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Receipt className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="font-medium">Cash Payments</p>
                            <p className="text-sm text-gray-500">Accept cash transactions</p>
                          </div>
                        </div>
                        <Switch
                          checked={paymentSettings.enableCash}
                          onCheckedChange={(checked) => setPaymentSettings({...paymentSettings, enableCash: checked})}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <CreditCard className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="font-medium">Card Payments</p>
                            <p className="text-sm text-gray-500">Credit and debit cards</p>
                          </div>
                        </div>
                        <Switch
                          checked={paymentSettings.enableCard}
                          onCheckedChange={(checked) => setPaymentSettings({...paymentSettings, enableCard: checked})}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <CreditCard className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="font-medium">Mobile Payments</p>
                            <p className="text-sm text-gray-500">Apple Pay, Google Pay, etc.</p>
                          </div>
                        </div>
                        <Switch
                          checked={paymentSettings.enableMobile}
                          onCheckedChange={(checked) => setPaymentSettings({...paymentSettings, enableMobile: checked})}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">Transaction Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="processingFee">Card Processing Fee (%)</Label>
                        <Input
                          id="processingFee"
                          type="number"
                          step="0.1"
                          value={paymentSettings.processingFee}
                          onChange={(e) => setPaymentSettings({...paymentSettings, processingFee: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4 mt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Auto-calculate Tax</p>
                          <p className="text-sm text-gray-500">Automatically add tax to transactions</p>
                        </div>
                        <Switch
                          checked={paymentSettings.autoCalculateTax}
                          onCheckedChange={(checked) => setPaymentSettings({...paymentSettings, autoCalculateTax: checked})}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Require Customer Information</p>
                          <p className="text-sm text-gray-500">Mandate customer details for all transactions</p>
                        </div>
                        <Switch
                          checked={paymentSettings.requireCustomerInfo}
                          onCheckedChange={(checked) => setPaymentSettings({...paymentSettings, requireCustomerInfo: checked})}
                        />
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={() => handleSaveSettings('payment')} 
                    className="btn-primary"
                    disabled={updateSettingsMutation.isPending}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {updateSettingsMutation.isPending ? 'Saving...' : 'Save Payment Settings'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="w-5 h-5" />
                    <span>Notification Preferences</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Alert Settings</h3>
                    <div className="space-y-4">
                      {Object.entries({
                        lowStockAlerts: { label: "Low Stock Alerts", desc: "Get notified when products are running low" },
                        dailySalesReport: { label: "Daily Sales Report", desc: "Receive end-of-day sales summary" },
                        newCustomerSignup: { label: "New Customer Signup", desc: "Alert when new customers register" },
                        systemUpdates: { label: "System Updates", desc: "Important system and security updates" },
                        marketingEmails: { label: "Marketing Emails", desc: "Product updates and promotional content" },
                        smsNotifications: { label: "SMS Notifications", desc: "Receive alerts via text message" }
                      }).map(([key, { label, desc }]) => (
                        <div key={key} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{label}</p>
                            <p className="text-sm text-gray-500">{desc}</p>
                          </div>
                          <Switch
                            checked={notificationSettings[key as keyof typeof notificationSettings]}
                            onCheckedChange={(checked) => setNotificationSettings({
                              ...notificationSettings, 
                              [key]: checked
                            })}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button 
                    onClick={() => handleSaveSettings('notifications')} 
                    className="btn-primary"
                    disabled={updateSettingsMutation.isPending}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {updateSettingsMutation.isPending ? 'Saving...' : 'Save Notification Settings'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>Security & Privacy</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Authentication</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Two-Factor Authentication</p>
                          <p className="text-sm text-gray-500">Add extra security layer to your account</p>
                        </div>
                        <Switch
                          checked={securitySettings.twoFactorAuth}
                          onCheckedChange={(checked) => setSecuritySettings({...securitySettings, twoFactorAuth: checked})}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                          <Select 
                            value={securitySettings.sessionTimeout} 
                            onValueChange={(value) => setSecuritySettings({...securitySettings, sessionTimeout: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="15">15 minutes</SelectItem>
                              <SelectItem value="30">30 minutes</SelectItem>
                              <SelectItem value="60">1 hour</SelectItem>
                              <SelectItem value="120">2 hours</SelectItem>
                              <SelectItem value="480">8 hours</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="loginAttempts">Max Login Attempts</Label>
                          <Select 
                            value={securitySettings.loginAttempts} 
                            onValueChange={(value) => setSecuritySettings({...securitySettings, loginAttempts: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="3">3 attempts</SelectItem>
                              <SelectItem value="5">5 attempts</SelectItem>
                              <SelectItem value="10">10 attempts</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">Data Protection</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Password Complexity Requirements</p>
                          <p className="text-sm text-gray-500">Enforce strong password policies</p>
                        </div>
                        <Switch
                          checked={securitySettings.passwordComplexity}
                          onCheckedChange={(checked) => setSecuritySettings({...securitySettings, passwordComplexity: checked})}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Automatic Data Backup</p>
                          <p className="text-sm text-gray-500">Daily backup of business data</p>
                        </div>
                        <Switch
                          checked={securitySettings.dataBackup}
                          onCheckedChange={(checked) => setSecuritySettings({...securitySettings, dataBackup: checked})}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Audit Logging</p>
                          <p className="text-sm text-gray-500">Track all system activities</p>
                        </div>
                        <Switch
                          checked={securitySettings.auditLogging}
                          onCheckedChange={(checked) => setSecuritySettings({...securitySettings, auditLogging: checked})}
                        />
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={() => handleSaveSettings('security')} 
                    className="btn-primary"
                    disabled={updateSettingsMutation.isPending}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {updateSettingsMutation.isPending ? 'Saving...' : 'Save Security Settings'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appearance Settings */}
            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Palette className="w-5 h-5" />
                    <span>Appearance & Display</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Theme Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="theme">Color Theme</Label>
                        <Select 
                          value={appearanceSettings.theme} 
                          onValueChange={(value) => setAppearanceSettings({...appearanceSettings, theme: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="emerald">Emerald (Default)</SelectItem>
                            <SelectItem value="blue">Blue</SelectItem>
                            <SelectItem value="purple">Purple</SelectItem>
                            <SelectItem value="red">Red</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="currencySymbol">Currency Symbol</Label>
                        <Input
                          id="currencySymbol"
                          value={appearanceSettings.currencySymbol}
                          onChange={(e) => setAppearanceSettings({...appearanceSettings, currencySymbol: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4 mt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Dark Mode</p>
                          <p className="text-sm text-gray-500">Use dark theme for reduced eye strain</p>
                        </div>
                        <Switch
                          checked={appearanceSettings.darkMode}
                          onCheckedChange={(checked) => setAppearanceSettings({...appearanceSettings, darkMode: checked})}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Compact View</p>
                          <p className="text-sm text-gray-500">Show more content in less space</p>
                        </div>
                        <Switch
                          checked={appearanceSettings.compactView}
                          onCheckedChange={(checked) => setAppearanceSettings({...appearanceSettings, compactView: checked})}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Show Product Images</p>
                          <p className="text-sm text-gray-500">Display product thumbnails in lists</p>
                        </div>
                        <Switch
                          checked={appearanceSettings.showProductImages}
                          onCheckedChange={(checked) => setAppearanceSettings({...appearanceSettings, showProductImages: checked})}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">Format Settings</h3>
                    <div>
                      <Label htmlFor="dateFormat">Date Format</Label>
                      <Select 
                        value={appearanceSettings.dateFormat} 
                        onValueChange={(value) => setAppearanceSettings({...appearanceSettings, dateFormat: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    onClick={() => handleSaveSettings('appearance')} 
                    className="btn-primary"
                    disabled={updateSettingsMutation.isPending}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {updateSettingsMutation.isPending ? 'Saving...' : 'Save Appearance Settings'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
