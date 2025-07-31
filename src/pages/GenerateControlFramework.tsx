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
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function GenerateControlFramework() {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<any[]>([]);
  const [filterValue, setFilterValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    websiteUrl: "",
    dunsNumber: ""
  });

  // Load companies on component mount
  useEffect(() => {
    loadCompanies();
  }, []);

  // Filter companies when filter value changes
  useEffect(() => {
    if (filterValue.trim() === "") {
      setFilteredCompanies(companies);
    } else {
      setFilteredCompanies(
        companies.filter(company => 
          company.name.toLowerCase().includes(filterValue.toLowerCase())
        )
      );
    }
  }, [filterValue, companies]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDetailClick = (companyId: string) => {
    navigate(`/company-details/${companyId}`);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Call API to external service
      const response = await fetch(`https://n8n.sparkminds.net/webhook/6812a814-9d51-43e1-aff8-46bd1b01d4de?websiteUrl=${encodeURIComponent(formData.websiteUrl)}&companyName=${encodeURIComponent(formData.companyName)}`);
      const apiData = await response.json();
      
      console.log('API Response:', apiData);
      
      // Save to companies table with API response data
      const companyData = {
        name: formData.companyName,
        website_url: formData.websiteUrl,
        duns_number: formData.dunsNumber || null,
        // Store additional data from API response if available
        country: apiData.country || null,
        // Add other fields from API response as needed
        ...apiData
      };

      const { data: company, error } = await supabase
        .from('companies')
        .insert(companyData)
        .select()
        .single();

      if (error) throw error;

      console.log('Company saved:', company);
      
      // If API returns domains, activities, markets data, save them to respective tables
      if (company && apiData) {
        // Save domains if provided
        if (apiData.domains && Array.isArray(apiData.domains)) {
          const domainsToInsert = apiData.domains.map((domain: any) => ({
            company_id: company.id,
            name: typeof domain === 'string' ? domain : domain.name
          }));
          
          await supabase.from('domains').insert(domainsToInsert);
        }

        // Save activities if provided
        if (apiData.activities && Array.isArray(apiData.activities)) {
          const activitiesToInsert = apiData.activities.map((activity: any) => ({
            company_id: company.id,
            name: typeof activity === 'string' ? activity : activity.name
          }));
          
          await supabase.from('activities').insert(activitiesToInsert);
        }

        // Save markets if provided
        if (apiData.markets && Array.isArray(apiData.markets)) {
          const marketsToInsert = apiData.markets.map((market: any) => ({
            company_id: company.id,
            name: typeof market === 'string' ? market : market.name
          }));
          
          await supabase.from('markets').insert(marketsToInsert);
        }
      }

      // Reload companies list to show the new company
      await loadCompanies();
      
      setIsDialogOpen(false);
      setFormData({
        companyName: "",
        websiteUrl: "",
        dunsNumber: ""
      });
    } catch (error) {
      console.error('Error saving company:', error);
      // You might want to show a toast notification here
    } finally {
      setLoading(false);
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
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Add Company"}
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
                  <Button 
                    onClick={handleSave}
                    disabled={loading || !formData.companyName || !formData.websiteUrl}
                  >
                    {loading ? "Saving..." : "Save"}
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-card-foreground">
                    Loading companies...
                  </TableCell>
                </TableRow>
              ) : filteredCompanies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-card-foreground">
                    {filterValue ? "No companies found matching filter" : "No companies added yet"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCompanies.map((company, index) => (
                  <TableRow key={company.id}>
                    <TableCell className="text-card-foreground">{index + 1}</TableCell>
                    <TableCell className="text-card-foreground">{company.name}</TableCell>
                    <TableCell className="text-card-foreground">{company.website_url || 'N/A'}</TableCell>
                    <TableCell className="text-card-foreground">{company.duns_number || 'N/A'}</TableCell>
                    <TableCell className="text-card-foreground">
                      {new Date(company.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                          onClick={() => handleDetailClick(company.id)}
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
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}