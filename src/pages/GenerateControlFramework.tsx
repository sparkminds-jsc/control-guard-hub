import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function GenerateControlFramework() {
  return (
    <div className="flex-1 space-y-6 p-6">
      
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground font-bold">Create New Framework</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="framework-name" className="text-card-foreground font-medium">Framework Name</Label>
              <Input
                id="framework-name"
                placeholder="Enter framework name"
                className="bg-card border-border"
              />
            </div>
            <div>
              <Label htmlFor="company-name" className="text-card-foreground font-medium">Company Name</Label>
              <Input
                id="company-name"
                placeholder="Enter company name"
                className="bg-card border-border"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="description" className="text-card-foreground font-medium">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter framework description"
              className="bg-card border-border"
              rows={4}
            />
          </div>
          
          <div className="flex space-x-4">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Generate Framework
            </Button>
            <Button variant="outline" className="border-border text-card-foreground">
              Save as Draft
            </Button>
            <Button variant="destructive" className="bg-destructive text-destructive-foreground">
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground font-bold">Recent Frameworks</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-card-foreground font-bold">Name</TableHead>
                <TableHead className="text-card-foreground font-bold">Company</TableHead>
                <TableHead className="text-card-foreground font-bold">Created Date</TableHead>
                <TableHead className="text-card-foreground font-bold">Status</TableHead>
                <TableHead className="text-card-foreground font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="text-card-foreground">Framework A</TableCell>
                <TableCell className="text-card-foreground">Company ABC</TableCell>
                <TableCell className="text-card-foreground">2024-01-15</TableCell>
                <TableCell className="text-card-foreground">Active</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" className="bg-destructive text-destructive-foreground">
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-card-foreground">Framework B</TableCell>
                <TableCell className="text-card-foreground">Company XYZ</TableCell>
                <TableCell className="text-card-foreground">2024-01-10</TableCell>
                <TableCell className="text-card-foreground">Draft</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" className="bg-destructive text-destructive-foreground">
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}