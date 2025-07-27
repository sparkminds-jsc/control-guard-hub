import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ControlFrameworkHistory() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <h1 className="text-foreground font-bold">Control Framework History</h1>
      
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground font-bold">Framework History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-card-foreground font-bold">Framework Name</TableHead>
                <TableHead className="text-card-foreground font-bold">Version</TableHead>
                <TableHead className="text-card-foreground font-bold">Modified Date</TableHead>
                <TableHead className="text-card-foreground font-bold">Modified By</TableHead>
                <TableHead className="text-card-foreground font-bold">Status</TableHead>
                <TableHead className="text-card-foreground font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="text-card-foreground">Framework A</TableCell>
                <TableCell className="text-card-foreground">v2.1</TableCell>
                <TableCell className="text-card-foreground">2024-01-20</TableCell>
                <TableCell className="text-card-foreground">John Doe</TableCell>
                <TableCell className="text-card-foreground">Active</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="border-border text-card-foreground">
                      Restore
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-card-foreground">Framework A</TableCell>
                <TableCell className="text-card-foreground">v2.0</TableCell>
                <TableCell className="text-card-foreground">2024-01-15</TableCell>
                <TableCell className="text-card-foreground">Jane Smith</TableCell>
                <TableCell className="text-card-foreground">Archived</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="border-border text-card-foreground">
                      Restore
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