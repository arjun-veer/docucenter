
import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle, Key, Lock, Moon } from "lucide-react";
import { useSettings, useAuth } from "@/lib/store";

const Settings = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const { 
    perplexityApiKey, 
    setPerplexityApiKey,
    serpApiKey,
    setSerpApiKey,
    darkMode,
    setDarkMode
  } = useSettings();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [perplexityKey, setPerplexityKey] = useState(perplexityApiKey || "");
  const [serpKey, setSerpKey] = useState(serpApiKey || "");
  
  const isAdmin = currentUser?.role === 'admin';

  // Apply dark mode when it changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  
  const handleSavePreferences = () => {
    toast.success("Preferences saved successfully");
  };
  
  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
    toast.success(`${!darkMode ? "Dark" : "Light"} mode enabled`);
  };
  
  const handleSavePerplexityApiKey = () => {
    if (!isAdmin) {
      toast.error("Only administrators can set API keys");
      return;
    }
    
    if (perplexityKey.trim()) {
      setPerplexityApiKey(perplexityKey.trim());
      toast.success("Perplexity API key saved successfully");
    } else {
      toast.error("Please enter a valid Perplexity API key");
    }
  };
  
  const handleSaveSerpApiKey = () => {
    if (!isAdmin) {
      toast.error("Only administrators can set API keys");
      return;
    }
    
    if (serpKey.trim()) {
      setSerpApiKey(serpKey.trim());
      toast.success("SerpAPI key saved successfully");
    } else {
      toast.error("Please enter a valid SerpAPI key");
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground mb-8">
            Manage your application preferences and integrations
          </p>
          
          <div className="grid gap-8">
            {/* Display Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Display Settings</CardTitle>
                <CardDescription>
                  Customize your application appearance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dark-mode">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Switch between light and dark theme
                    </p>
                  </div>
                  <Switch
                    id="dark-mode"
                    checked={darkMode}
                    onCheckedChange={handleToggleDarkMode}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSavePreferences}>Save Preferences</Button>
              </CardFooter>
            </Card>
            
            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure how you want to receive updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notifications">Browser Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications about exam updates in your browser
                    </p>
                  </div>
                  <Switch
                    id="notifications"
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-updates">Email Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive important updates via email
                    </p>
                  </div>
                  <Switch
                    id="email-updates"
                    checked={emailUpdates}
                    onCheckedChange={setEmailUpdates}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSavePreferences}>Save Preferences</Button>
              </CardFooter>
            </Card>
            
            {/* API Integrations - Only visible to admins */}
            {isAdmin ? (
              <Card>
                <CardHeader>
                  <CardTitle>API Integrations</CardTitle>
                  <CardDescription>
                    Configure third-party API keys for enhanced functionality
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* SerpAPI Key */}
                  <div>
                    <Label htmlFor="serp-api">SerpAPI Key</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Used to search and fetch exam information from the web
                    </p>
                    
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="serp-api"
                          type="password"
                          placeholder="Enter your SerpAPI key"
                          className="pl-10"
                          value={serpKey}
                          onChange={(e) => setSerpKey(e.target.value)}
                        />
                      </div>
                      <Button onClick={handleSaveSerpApiKey}>Save Key</Button>
                    </div>
                    
                    {serpApiKey ? (
                      <div className="mt-2 flex items-center text-sm text-green-600 dark:text-green-400">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        SerpAPI key configured
                      </div>
                    ) : (
                      <div className="mt-2 flex items-center text-sm text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        SerpAPI key not configured. Exam search functionality will be limited.
                      </div>
                    )}
                  </div>
                  
                  {/* Perplexity AI Key (Saved for future use) */}
                  <div>
                    <Label htmlFor="perplexity-api">Perplexity AI API Key</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Used to automatically fetch exam information from the web (for future use)
                    </p>
                    
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="perplexity-api"
                          type="password"
                          placeholder="Enter your Perplexity API key"
                          className="pl-10"
                          value={perplexityKey}
                          onChange={(e) => setPerplexityKey(e.target.value)}
                        />
                      </div>
                      <Button onClick={handleSavePerplexityApiKey}>Save Key</Button>
                    </div>
                    
                    {perplexityApiKey ? (
                      <div className="mt-2 flex items-center text-sm text-green-600 dark:text-green-400">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Perplexity API key configured (for future use)
                      </div>
                    ) : (
                      <div className="mt-2 flex items-center text-sm text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Perplexity API key not configured (for future use)
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>API Integrations</CardTitle>
                  <CardDescription>
                    Administrator-only section
                  </CardDescription>
                </CardHeader>
                <CardContent className="py-8">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="rounded-full bg-muted p-3 mb-3">
                      <Lock className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">Admin Only</h3>
                    <p className="text-muted-foreground max-w-sm">
                      API key configuration is restricted to administrators only. Please contact an administrator if you need access.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Settings;
