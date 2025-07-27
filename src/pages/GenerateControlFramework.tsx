import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom";

export default function GenerateControlFramework() {
  const navigate = useNavigate();

  const handleDetailClick = (companyId: string) => {
    navigate(`/company-details/${companyId}`);
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      
      <Card className="bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Label htmlFor="filter-company" className="text-card-foreground font-medium">Filter:</Label>
              <Input
                id="filter-company"
                placeholder="Company Name"
                className="bg-card border-border w-64"
              />
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Add Company
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company-name" className="text-card-foreground font-medium">Company Name</Label>
              <Input
                id="company-name"
                placeholder="Enter company name"
                className="bg-card border-border"
              />
            </div>
            <div>
              <Label htmlFor="website-url" className="text-card-foreground font-medium">Website URL</Label>
              <Input
                id="website-url"
                placeholder="Enter website URL"
                className="bg-card border-border"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="country" className="text-card-foreground font-medium">Country</Label>
              <Input
                id="country"
                placeholder="Enter country"
                className="bg-card border-border"
              />
            </div>
            <div>
              <Label htmlFor="duns-number" className="text-card-foreground font-medium">DUNS Number</Label>
              <Input
                id="duns-number"
                placeholder="Enter DUNS number"
                className="bg-card border-border"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-card-foreground font-bold">No</TableHead>
                <TableHead className="text-card-foreground font-bold">Company Name</TableHead>
                <TableHead className="text-card-foreground font-bold">Website URL</TableHead>
                <TableHead className="text-card-foreground font-bold">Country</TableHead>
                <TableHead className="text-card-foreground font-bold">DUNS Number</TableHead>
                <TableHead className="text-card-foreground font-bold">Created Date</TableHead>
                <TableHead className="text-card-foreground font-bold">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="text-card-foreground">1</TableCell>
                <TableCell className="text-card-foreground">Company ABC</TableCell>
                <TableCell className="text-card-foreground">www.abc.com</TableCell>
                <TableCell className="text-card-foreground">USA</TableCell>
                <TableCell className="text-card-foreground">123456789</TableCell>
                <TableCell className="text-card-foreground">2024-01-15</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => handleDetailClick("1")}
                    >
                      Detail
                    </Button>
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
                <TableCell className="text-card-foreground">2</TableCell>
                <TableCell className="text-card-foreground">Company XYZ</TableCell>
                <TableCell className="text-card-foreground">www.xyz.com</TableCell>
                <TableCell className="text-card-foreground">UK</TableCell>
                <TableCell className="text-card-foreground">987654321</TableCell>
                <TableCell className="text-card-foreground">2024-01-10</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => handleDetailClick("2")}
                    >
                      Detail
                    </Button>
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