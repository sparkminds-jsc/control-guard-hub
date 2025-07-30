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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function GenerateControlFramework() {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    websiteUrl: "",
    dunsNumber: ""
  });

  const handleDetailClick = (companyId: string) => {
    navigate(`/company-details/${companyId}`);
  };

  const handleSave = async () => {
    try {
      // Call API to external service
      const response = await fetch(`https://n8n.sparkminds.net/webhook-test/6812a814-9d51-43e1-aff8-46bd1b01d4de?websiteUrl=${encodeURIComponent(formData.websiteUrl)}&companyName=${encodeURIComponent(formData.companyName)}`);
      const apiData = await response.json();
      
      // Save to companies table with API response data
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: company, error } = await supabase
        .from('companies')
        .insert({
          name: formData.companyName,
          website_url: formData.websiteUrl,
          duns_number: formData.dunsNumber || null,
          // Store additional data from API response
          ...apiData
        })
        .select()
        .single();

      if (error) throw error;

      console.log('Company saved:', company);
      setIsDialogOpen(false);
      setFormData({
        companyName: "",
        websiteUrl: "",
        dunsNumber: ""
      });
    } catch (error) {
      console.error('Error saving company:', error);
    }
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setFormData({
      companyName: "",
      websiteUrl: "",
      dunsNumber: ""
    });
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
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Add Company
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add Company</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="company-name" className="text-card-foreground font-medium">Company Name</Label>
                    <Input
                      id="company-name"
                      placeholder="Enter company name"
                      value={formData.companyName}
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      className="bg-card border-border"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="website-url" className="text-card-foreground font-medium">Website URL</Label>
                    <Input
                      id="website-url"
                      placeholder="Enter website URL"
                      value={formData.websiteUrl}
                      onChange={(e) => setFormData({...formData, websiteUrl: e.target.value})}
                      className="bg-card border-border"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="duns-number" className="text-card-foreground font-medium">DUNS Number (Optional)</Label>
                    <Input
                      id="duns-number"
                      placeholder="Enter DUNS number"
                      value={formData.dunsNumber}
                      onChange={(e) => setFormData({...formData, dunsNumber: e.target.value})}
                      className="bg-card border-border"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      <Card className="bg-card">
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-card-foreground font-bold">No</TableHead>
                <TableHead className="text-card-foreground font-bold">Company Name</TableHead>
                <TableHead className="text-card-foreground font-bold">Website URL</TableHead>
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