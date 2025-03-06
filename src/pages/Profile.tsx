
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/stores/auth-store";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, Crown, PencilIcon, Shield, User, XIcon } from "lucide-react";
import { UserRole } from "@/lib/types";

const Profile = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
  });

  // Use useEffect to handle authentication check and redirect
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, navigate]);

  // Skip rendering if not authenticated
  if (!isAuthenticated || !currentUser) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // In a real application, this would send the updated profile to an API
    toast({
      title: "Profile Updated",
      description: "Your profile information has been successfully updated.",
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: currentUser?.name || "",
      email: currentUser?.email || "",
    });
    setIsEditing(false);
  };

  const getRoleBadgeStyle = (role: UserRole) => {
    if (role === 'admin') {
      return "bg-primary text-primary-foreground hover:bg-primary/90";
    }
    return "bg-secondary text-secondary-foreground hover:bg-secondary/80";
  };

  const getRoleIcon = (role: UserRole) => {
    if (role === 'admin') {
      return <Crown className="h-3 w-3 mr-1" />;
    }
    return <User className="h-3 w-3 mr-1" />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Your Profile</h1>
            <p className="text-muted-foreground mt-1">
              Manage your personal information and settings
            </p>
          </div>
          
          <div className="grid gap-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Your profile details and contact information
                  </CardDescription>
                </div>
                {!isEditing ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleCancel}
                      className="flex items-center gap-1"
                    >
                      <XIcon className="h-4 w-4" />
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleSave}
                      className="flex items-center gap-1"
                    >
                      <CheckIcon className="h-4 w-4" />
                      Save
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center py-6">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-primary">
                      <User className="h-12 w-12 text-primary" />
                    </div>
                    {isEditing && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="ghost" className="text-white p-1 h-auto">
                          Change
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    {isEditing ? (
                      <Input 
                        id="name" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                      />
                    ) : (
                      <div className="text-lg py-2">{currentUser?.name || "Not set"}</div>
                    )}
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    {isEditing ? (
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                      />
                    ) : (
                      <div className="flex items-center gap-2 py-2">
                        <div className="text-lg">{currentUser?.email}</div>
                        {currentUser?.verified && (
                          <Badge variant="secondary">Verified</Badge>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="grid gap-2">
                    <Label>Account Type</Label>
                    <div className="py-2">
                      <Badge className={`capitalize flex items-center ${getRoleBadgeStyle(currentUser.role)}`}>
                        {getRoleIcon(currentUser.role)}
                        {currentUser?.role}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>
                  Manage your password and account security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Password</Label>
                  <div className="flex justify-between items-center">
                    <div className="text-muted-foreground">●●●●●●●●●●</div>
                    <Button variant="outline" size="sm">
                      Change Password
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid gap-2">
                  <Label>Two-Factor Authentication</Label>
                  <div className="flex justify-between items-center">
                    <div className="text-muted-foreground">Not enabled</div>
                    <Button variant="outline" size="sm">
                      Enable
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/50 text-muted-foreground text-sm">
                For security reasons, password changes require email verification.
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
