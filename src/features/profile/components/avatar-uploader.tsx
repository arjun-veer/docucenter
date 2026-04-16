import { Button } from "@/components/ui/button";

export function AvatarUploader() {
  return (
    <div className="flex items-center space-x-4">
      <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
        Image
      </div>
      <div>
        <Button variant="outline" size="sm">Upload new avatar</Button>
        <p className="text-sm text-muted-foreground mt-2">JPG, GIF or PNG. 2MB max.</p>
      </div>
    </div>
  );
}