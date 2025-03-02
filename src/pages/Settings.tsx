
import { useState } from "react";
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
import { AlertTriangle, CheckCircle, Key } from "lucide-react";
import { useSettings } from "@/lib/store";

const Settings = () => {
  const { perplexityApiKey, setPerplexityApiKey } = useSettings();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [apiKey, setApiKey] = useState(perplexityApiKey || "");
  
  const handleSavePreferences = () => {
    toast.success("Preferences saved successfully");
  };
  
  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      setPerplexityApiKey(apiKey.trim());
    } else {
      toast.error("Please enter a valid API key");
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
                    onCheckedChange={setDarkMode}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSavePreferences}>Save Preferences</Button>
              </CardFooter>
            </Card>
            
            {/* API Integrations */}
            <Card>
              <CardHeader>
                <CardTitle>API Integrations</CardTitle>
                <CardDescription>
                  Configure third-party API keys for enhanced functionality
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="perplexity-api">Perplexity AI API Key</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Used to automatically fetch exam information from the web
                  </p>
                  
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="perplexity-api"
                        type="password"
                        placeholder="Enter your Perplexity API key"
                        className="pl-10"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleSaveApiKey}>Save Key</Button>
                  </div>
                  
                  {perplexityApiKey ? (
                    <div className="mt-2 flex items-center text-sm text-green-600">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      API key configured
                    </div>
                  ) : (
                    <div className="mt-2 flex items-center text-sm text-amber-600">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      API key not configured. Some features may be limited.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Settings;
