import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function CollegeSelector() {
  return (
    <div className="space-y-2 max-w-2xl">
      <Label>College / University</Label>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select your college" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="c1">University of Technology</SelectItem>
          <SelectItem value="c2">Institute of Engineering</SelectItem>
          <SelectItem value="c3">State College</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}