
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";
import { Toaster } from "@/components/ui/toaster";

export default function GenerateControlFramework() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [currentUserCompanyId, setCurrentUserCompanyId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<any[]>([]);
  const [filterValue, setFilterValue] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    websiteUrl: "",
    dunsNumber: ""
  });

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      setUser(session.user);
      loadCompanies();
      loadCurrentUserCompany(session.user.id);
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/login');
      } else {
        setUser(session.user);
        if (session.user) {
          loadCurrentUserCompany(session.user.id);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Filter companies when filter value changes and auto-select if only one company
  useEffect(() => {
    let filtered = companies;
    
    if (filterValue.trim() !== "") {
      filtered = filtered.filter(company => 
        company.name.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    
    if (countryFilter.trim() !== "" && countryFilter !== "all") {
      filtered = filtered.filter(company => 
        company.country?.toLowerCase().includes(countryFilter.toLowerCase())
      );
    }
    
    setFilteredCompanies(filtered);

    // Auto-select company if only one exists and user has no current company
    if (companies.length === 1 && !currentUserCompanyId && user?.email) {
      handleUseCompany(companies[0].id, companies[0].name);
    }

    // Extract unique countries from companies
    const uniqueCountries = [...new Set(companies
      .map(company => company.country)
      .filter(country => country && country.trim() !== "")
    )].sort();
    setAvailableCountries(uniqueCountries);
  }, [companies, filterValue, countryFilter]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('status', 'active')  // Only load active companies
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentUserCompany = async (userId: string) => {
    try {
      // First get user's email from the auth session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) return;

      const { data, error } = await supabase
        .from('users')
        .select('id_company')
        .eq('email', session.user.email)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setCurrentUserCompanyId(data?.id_company || null);
    } catch (error) {
      console.error('Error loading user company:', error);
    }
  };

  const handleUseCompany = async (companyId: string, companyName: string) => {
    try {
      setLoading(true);
      
      // First, clear the current company from all other users to ensure only one user per company
      await supabase
        .from('users')
        .update({ id_company: null })
        .eq('id_company', companyId);
      
      // Then update current user's company
      const { error } = await supabase
        .from('users')
        .update({ id_company: companyId })
        .eq('email', user?.email);

      if (error) throw error;

      setCurrentUserCompanyId(companyId);
      
      toast({
        title: "Company Selected",
        description: `You are now using "${companyName}" as your current company.`,
        className: "fixed top-4 right-4 w-auto"
      });
    } catch (error) {
      console.error('Error updating user company:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update company. Please try again.",
        variant: "destructive",
        className: "fixed top-4 right-4 w-auto"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDetailClick = (companyId: string) => {
    navigate(`/company-details/${companyId}`);
  };

  const handleDelete = async (companyId: string, companyName: string) => {
    try {
      setLoading(true);
      
      // Check if the company being deleted is the current user's company
      const isCurrentCompany = currentUserCompanyId === companyId;
      
      // Update company status to inactive instead of deleting
      const { error: companyError } = await supabase
        .from('companies')
        .update({ status: 'inactive' })
        .eq('id', companyId);

      if (companyError) throw companyError;

      // If this was the current company, clear it from user
      if (isCurrentCompany && user?.email) {
        await supabase
          .from('users')
          .update({ id_company: null })
          .eq('email', user.email);
        
        setCurrentUserCompanyId(null);
      }

      // Reload companies list
      await loadCompanies();
      
      // After reloading, check if only one company remains
      const { data: remainingCompanies, error: checkError } = await supabase
        .from('companies')
        .select('*')
        .eq('status', 'active');

      if (!checkError && remainingCompanies && remainingCompanies.length === 1 && user?.email) {
        // Auto-select the remaining company
        const remainingCompany = remainingCompanies[0];
        await supabase
          .from('users')
          .update({ id_company: remainingCompany.id })
          .eq('email', user.email);
        
        setCurrentUserCompanyId(remainingCompany.id);
        
        toast({
          title: "Company Deleted Successfully",
          description: `Company "${companyName}" has been deleted. "${remainingCompany.name}" is now your current company.`,
          className: "fixed top-4 right-4 w-auto"
        });
      } else {
        // Show normal success toast
        toast({
          title: "Company Deleted Successfully", 
          description: `Company "${companyName}" has been deleted successfully.`,
          className: "fixed top-4 right-4 w-auto"
        });
      }
    } catch (error) {
      console.error('Error deleting company:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete company. Please try again.",
        variant: "destructive",
        className: "fixed top-4 right-4 w-auto"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Call API to external service
      const response = await fetch(`https://n8n.sparkminds.net/webhook/6812a814-9d51-43e1-aff8-46bd1b01d4de?websiteUrl=${encodeURIComponent(formData.websiteUrl)}&companyName=${encodeURIComponent(formData.companyName)}`);
      
      let apiData = null;
      const responseText = await response.text();
      
      if (responseText && responseText.trim()) {
        try {
          apiData = JSON.parse(responseText);
        } catch (parseError) {
          console.warn('Failed to parse API response as JSON:', parseError);
          apiData = null;
        }
      }
      
      console.log('API Response:', apiData);
      
      // Save to companies table with API response data
      const companyData = {
        name: formData.companyName,
        website_url: formData.websiteUrl,
        duns_number: formData.dunsNumber || null,
        country: apiData?.country || null
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
        // Save domains if provided (check both 'domains' and 'bussinessDomain' fields)
        if ((apiData.domains && Array.isArray(apiData.domains)) || 
            (apiData.bussinessDomain && Array.isArray(apiData.bussinessDomain))) {
          const domainsData = apiData.domains || apiData.bussinessDomain;
          const domainsToInsert = domainsData.map((domain: any) => ({
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
      
      // Check if this is the only company and auto-set as current
      const { data: allCompanies, error: checkError } = await supabase
        .from('companies')
        .select('*')
        .eq('status', 'active');

      if (!checkError && allCompanies && allCompanies.length === 1 && user?.email) {
        // Auto-set as current company if it's the only one
        await supabase
          .from('users')
          .update({ id_company: company.id })
          .eq('email', user.email);
        
        setCurrentUserCompanyId(company.id);
      }
      
      // Show success toast
      toast({
        title: "Company Added Successfully",
        description: `Company "${formData.companyName}" has been added successfully.`,
        className: "fixed top-4 right-4 w-auto"
      });
      
      setIsDialogOpen(false);
      setFormData({
        companyName: "",
        websiteUrl: "",
        dunsNumber: ""
      });
    } catch (error) {
      console.error('Error saving company:', error);
      toast({
        title: "Add Company Failed",
        description: "Failed to add company. Please try again.",
        variant: "destructive",
        className: "fixed top-4 right-4 w-auto"
      });
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
              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger className="w-48 bg-card border-border">
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {availableCountries.map((country) => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                    <Label htmlFor="company-name" className="text-white font-medium">Company Name</Label>
                    <Input
                      id="company-name"
                      placeholder="Enter company name"
                      value={formData.companyName}
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      className="bg-card border-border"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="website-url" className="text-white font-medium">Website URL</Label>
                    <Input
                      id="website-url"
                      placeholder="Enter website URL"
                      value={formData.websiteUrl}
                      onChange={(e) => setFormData({...formData, websiteUrl: e.target.value})}
                      className="bg-card border-border"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="duns-number" className="text-white font-medium">DUNS Number (Optional)</Label>
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
                <TableHead className="text-card-foreground font-bold">Country</TableHead>
                <TableHead className="text-card-foreground font-bold">Created Date</TableHead>
                <TableHead className="text-card-foreground font-bold">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-card-foreground">
                    Loading companies...
                  </TableCell>
                </TableRow>
              ) : filteredCompanies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-card-foreground">
                    {filterValue || (countryFilter !== "all") ? "No companies found matching filter" : "No companies added yet"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCompanies.map((company, index) => (
                  <TableRow key={company.id}>
                    <TableCell className="text-card-foreground">{index + 1}</TableCell>
                    <TableCell className="text-card-foreground">{company.name}</TableCell>
                    <TableCell className="text-card-foreground">{company.website_url || 'N/A'}</TableCell>
                    <TableCell className="text-card-foreground">{company.duns_number || 'N/A'}</TableCell>
                    <TableCell className="text-card-foreground">{company.country || 'N/A'}</TableCell>
                    <TableCell className="text-card-foreground">
                      {new Date(company.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant={currentUserCompanyId === company.id ? "secondary" : "default"}
                          disabled={currentUserCompanyId === company.id || loading}
                          onClick={() => handleUseCompany(company.id, company.name)}
                        >
                          {currentUserCompanyId === company.id ? "Current" : "Use"}
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                          onClick={() => handleDetailClick(company.id)}
                        >
                          Detail
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive" className="bg-destructive text-destructive-foreground">
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the company "{company.name}" and all its related data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(company.id, company.name)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Toaster />
    </div>
  );
}
