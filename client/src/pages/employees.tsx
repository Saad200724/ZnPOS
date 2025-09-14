import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus, Settings, Trash2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/sidebar";

// Form schema for adding employees
const addEmployeeSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required")
});

type Employee = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  permissions: {
    pos: boolean;
    inventory: boolean;
    customers: boolean;
    reports: boolean;
    employees: boolean;
    settings: boolean;
  };
};

export default function EmployeesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Fetch employees
  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['/api/employees'],
    queryFn: async () => {
      const response = await fetch('/api/employees', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch employees');
      return response.json();
    }
  });

  // Add employee mutation
  const addEmployeeMutation = useMutation({
    mutationFn: async (data: z.infer<typeof addEmployeeSchema>) => {
      return apiRequest('POST', '/api/employees', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      setIsAddDialogOpen(false);
      toast({ title: "Employee added successfully!" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error adding employee", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Update permissions mutation
  const updatePermissionsMutation = useMutation({
    mutationFn: async ({ id, permissions }: { id: number, permissions: Employee['permissions'] }) => {
      return apiRequest('PUT', `/api/employees/${id}/permissions`, { permissions });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      toast({ title: "Permissions updated successfully!" });
    }
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('PUT', `/api/employees/${id}/status`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      toast({ title: "Employee status updated!" });
    }
  });

  // Delete employee mutation
  const deleteEmployeeMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/employees/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      toast({ title: "Employee deleted successfully!" });
    }
  });

  const form = useForm<z.infer<typeof addEmployeeSchema>>({
    resolver: zodResolver(addEmployeeSchema),
    defaultValues: {
      username: "",
      password: "",
      firstName: "",
      lastName: "",
      email: ""
    }
  });

  const onSubmit = (data: z.infer<typeof addEmployeeSchema>) => {
    addEmployeeMutation.mutate(data);
  };

  const handlePermissionChange = (employee: Employee, permission: keyof Employee['permissions'], value: boolean) => {
    const newPermissions = { ...employee.permissions, [permission]: value };
    updatePermissionsMutation.mutate({ id: employee.id, permissions: newPermissions });
  };

  // Only allow admin access
  if (user?.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Access denied. Admin privileges required.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading employees...</div>
      </div>
    );
  }

  const canAddEmployee = employees.length < 10;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8"></div>
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Employee Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your team members and their access permissions ({employees.length}/10 employees)
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              disabled={!canAddEmployee}
              data-testid="button-add-employee"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>
                Create a new employee account with custom access permissions.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-username" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} data-testid="input-password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-firstname" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-lastname" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} data-testid="input-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={addEmployeeMutation.isPending}
                    data-testid="button-submit-employee"
                  >
                    {addEmployeeMutation.isPending ? "Adding..." : "Add Employee"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {!canAddEmployee && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <p className="text-orange-800">
              You've reached the maximum of 10 employees. Delete an existing employee to add a new one.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {employees.map((employee) => (
          <Card key={employee.id} data-testid={`card-employee-${employee.id}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {employee.firstName} {employee.lastName}
                    <Badge variant={employee.isActive ? "default" : "secondary"}>
                      {employee.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    @{employee.username} • {employee.email}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleStatusMutation.mutate(employee.id)}
                    data-testid={`button-toggle-status-${employee.id}`}
                  >
                    {employee.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {employee.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" data-testid={`button-delete-${employee.id}`}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Employee</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {employee.firstName} {employee.lastName}? 
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteEmployeeMutation.mutate(employee.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-3">Access Permissions</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(employee.permissions).map(([permission, enabled]) => (
                      <div key={permission} className="flex items-center justify-between">
                        <Label htmlFor={`${employee.id}-${permission}`} className="capitalize">
                          {permission === 'pos' ? 'Point of Sale' : permission}
                        </Label>
                        <Switch
                          id={`${employee.id}-${permission}`}
                          checked={enabled}
                          onCheckedChange={(value) => 
                            handlePermissionChange(employee, permission as keyof Employee['permissions'], value)
                          }
                          data-testid={`switch-${permission}-${employee.id}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {employees.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No employees yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start building your team by adding your first employee.
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-first-employee">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add First Employee
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}