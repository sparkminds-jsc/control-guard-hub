import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
} from "@/components/ui/alert-dialog";
import { Trash2, Plus } from "lucide-react";
import { useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function CompanyDetails() {
  const { id } = useParams();
  const { toast } = useToast();
  const [showDetails, setShowDetails] = useState(false);
  const [showLawsRegulations, setShowLawsRegulations] = useState(false);
  const [company, setCompany] = useState<any>(null);
  const [domains, setDomains] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [markets, setMarkets] = useState<any[]>([]);
  const [showAddDialog, setShowAddDialog] = useState({ type: "", open: false });
  const [showLawsDialog, setShowLawsDialog] = useState(false);
  const [newItemValue, setNewItemValue] = useState("");
  const [isEditingDuns, setIsEditingDuns] = useState(false);
  const [tempDunsNumber, setTempDunsNumber] = useState("");
  const [deleteDialog, setDeleteDialog] = useState({ 
    isOpen: false, 
    type: "", 
    id: "", 
    name: "" 
  });
  const [lawsForm, setLawsForm] = useState({
    domain: "",
    activity: "",
    market: "",
    lawsRegulation: "",
    detail: "",
    countryApplied: "",
    referralSource: ""
  });
  const [loading, setLoading] = useState(false);

  // Load company data and related domains, activities, markets
  useEffect(() => {
    if (id) {
      loadCompanyData();
    }
  }, [id]);

  const loadCompanyData = async () => {
    try {
      // Load company basic info
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single();

      if (companyError) throw companyError;
      setCompany(companyData);

      // Load domains
      const { data: domainsData, error: domainsError } = await supabase
        .from('domains')
        .select('*')
        .eq('company_id', id);
      
      if (domainsError) throw domainsError;
      setDomains(domainsData || []);

      // Load activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .eq('company_id', id);
      
      if (activitiesError) throw activitiesError;
      setActivities(activitiesData || []);

      // Load markets
      const { data: marketsData, error: marketsError } = await supabase
        .from('markets')
        .select('*')
        .eq('company_id', id);
      
      if (marketsError) throw marketsError;
      setMarkets(marketsData || []);

    } catch (error) {
      console.error('Error loading company data:', error);
    }
  };

  const handleDeleteClick = (type: string, id: string, name: string) => {
    setDeleteDialog({
      isOpen: true,
      type,
      id,
      name
    });
  };

  const confirmDelete = async () => {
    try {
      let error;
      
      if (deleteDialog.type === 'domain') {
        ({ error } = await supabase
          .from('domains')
          .delete()
          .eq('id', deleteDialog.id));
        
        if (!error) {
          setDomains(domains.filter(d => d.id !== deleteDialog.id));
        }
      } else if (deleteDialog.type === 'activity') {
        ({ error } = await supabase
          .from('activities')
          .delete()
          .eq('id', deleteDialog.id));
        
        if (!error) {
          setActivities(activities.filter(a => a.id !== deleteDialog.id));
        }
      } else if (deleteDialog.type === 'market') {
        ({ error } = await supabase
          .from('markets')
          .delete()
          .eq('id', deleteDialog.id));
        
        if (!error) {
          setMarkets(markets.filter(m => m.id !== deleteDialog.id));
        }
      }
      
      if (error) throw error;
      
      toast({
        title: "Deleted Successfully",
        description: `"${deleteDialog.name}" has been removed from the list.`,
        className: "fixed top-4 right-4 w-auto"
      });
      
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Delete Failed",
        description: "An error occurred while deleting. Please try again.",
        variant: "destructive",
        className: "fixed top-4 right-4 w-auto"
      });
    }
    
    setDeleteDialog({ isOpen: false, type: "", id: "", name: "" });
  };

  const handleAddItem = (type: string) => {
    setShowAddDialog({ type, open: true });
    setNewItemValue("");
  };

  const saveNewItem = async () => {
    if (newItemValue.trim() && id) {
      try {
        if (showAddDialog.type === "domain") {
          const { data, error } = await supabase
            .from('domains')
            .insert({
              company_id: id,
              name: newItemValue.trim()
            })
            .select()
            .single();
          
          if (error) throw error;
          setDomains([...domains, data]);
          
          toast({
            title: "Domain Added Successfully",
            description: `"${newItemValue.trim()}" has been added to domains.`,
            className: "fixed top-4 right-4 w-auto"
          });
          
        } else if (showAddDialog.type === "activity") {
          const { data, error } = await supabase
            .from('activities')
            .insert({
              company_id: id,
              name: newItemValue.trim()
            })
            .select()
            .single();
          
          if (error) throw error;
          setActivities([...activities, data]);
          
          toast({
            title: "Activity Added Successfully",
            description: `"${newItemValue.trim()}" has been added to activities.`,
            className: "fixed top-4 right-4 w-auto"
          });
          
        } else if (showAddDialog.type === "market") {
          const { data, error } = await supabase
            .from('markets')
            .insert({
              company_id: id,
              name: newItemValue.trim()
            })
            .select()
            .single();
          
          if (error) throw error;
          setMarkets([...markets, data]);
          
          toast({
            title: "Market Added Successfully",
            description: `"${newItemValue.trim()}" has been added to markets.`,
            className: "fixed top-4 right-4 w-auto"
          });
        }
      } catch (error) {
        console.error('Error saving new item:', error);
        toast({
          title: "Add Failed",
          description: "An error occurred while adding the item. Please try again.",
          variant: "destructive",
          className: "fixed top-4 right-4 w-auto"
        });
      }
    }
    setShowAddDialog({ type: "", open: false });
    setNewItemValue("");
  };

  const handleEditDuns = () => {
    setIsEditingDuns(true);
    setTempDunsNumber(company?.duns_number || "");
  };

  const saveDunsNumber = async () => {
    try {
      const { error } = await supabase
        .from('companies')
        .update({ duns_number: tempDunsNumber.trim() || null })
        .eq('id', id);
      
      if (error) throw error;
      
      setCompany({ ...company, duns_number: tempDunsNumber.trim() || null });
      setIsEditingDuns(false);
    } catch (error) {
      console.error('Error updating DUNS number:', error);
    }
  };

  const cancelEditDuns = () => {
    setIsEditingDuns(false);
    setTempDunsNumber("");
  };

  const handleGenerateLaws = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('https://n8n.sparkminds.net/webhook/ed834647-9c18-4e33-9f33-5bb398fb35db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          websiteUrl: company?.website_url || "",
          companyName: company?.name || "",
          bussinessDomain: domains.map(d => d.name),
          activities: activities.map(a => a.name),
          markets: markets.map(m => m.name)
        })
      });
      
      if (response.ok) {
        toast({
          title: "Generated Successfully",
          description: "Laws and regulations have been generated successfully.",
          className: "fixed top-4 right-4 w-auto"
        });
        setShowLawsRegulations(true);
      } else {
        throw new Error('Failed to generate laws and regulations');
      }
    } catch (error) {
      console.error('Error generating laws:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate laws and regulations. Please try again.",
        variant: "destructive",
        className: "fixed top-4 right-4 w-auto"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveLawsRegulation = () => {
    // Here you would normally save the laws regulation data
    console.log("Saving laws regulation:", lawsForm);
    setShowLawsDialog(false);
    setLawsForm({
      domain: "",
      activity: "",
      market: "",
      lawsRegulation: "",
      detail: "",
      countryApplied: "",
      referralSource: ""
    });
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground font-bold">Company Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-card-foreground font-medium">Company Name</Label>
              <div className="text-card-foreground mt-1">{company?.name || 'Loading...'}</div>
            </div>
            <div>
              <Label className="text-card-foreground font-medium">Website URL</Label>
              <div className="text-card-foreground mt-1">{company?.website_url || 'N/A'}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label className="text-card-foreground font-medium">DUNS Number</Label>
              {isEditingDuns ? (
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    value={tempDunsNumber}
                    onChange={(e) => setTempDunsNumber(e.target.value)}
                    placeholder="Enter DUNS number"
                    className="bg-card border-border"
                  />
                  <Button
                    size="sm"
                    onClick={saveDunsNumber}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={cancelEditDuns}
                    className="bg-card border-border text-card-foreground hover:bg-accent"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2 mt-1">
                  <div className="text-card-foreground">{company?.duns_number || 'N/A'}</div>
                  <Button
                    size="sm"
                    onClick={handleEditDuns}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Edit
                  </Button>
                </div>
              )}
            </div>
          </div>

          <Button 
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setShowDetails(true)}
          >
            Get Company Details
          </Button>
        </CardContent>
      </Card>

      {showDetails && (
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground font-bold">Detail Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-card-foreground font-medium text-base">Domains</Label>
                <Button
                  size="icon"
                  onClick={() => handleAddItem("domain")}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 w-8"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {domains.map((domain) => (
                  <div key={domain.id} className="flex items-center space-x-2">
                    <Input
                      value={domain.name}
                      onChange={async (e) => {
                        try {
                          const { error } = await supabase
                            .from('domains')
                            .update({ name: e.target.value })
                            .eq('id', domain.id);
                          
                          if (error) throw error;
                          
                          setDomains(domains.map(d => 
                            d.id === domain.id ? { ...d, name: e.target.value } : d
                          ));
                        } catch (error) {
                          console.error('Error updating domain:', error);
                        }
                      }}
                      className="bg-card border-border"
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="bg-destructive text-destructive-foreground h-8 w-8"
                      onClick={() => handleDeleteClick('domain', domain.id, domain.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-card-foreground font-medium text-base">Activities</Label>
                <Button
                  size="icon"
                  onClick={() => handleAddItem("activity")}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 w-8"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-2">
                    <Input
                      value={activity.name}
                      onChange={async (e) => {
                        try {
                          const { error } = await supabase
                            .from('activities')
                            .update({ name: e.target.value })
                            .eq('id', activity.id);
                          
                          if (error) throw error;
                          
                          setActivities(activities.map(a => 
                            a.id === activity.id ? { ...a, name: e.target.value } : a
                          ));
                        } catch (error) {
                          console.error('Error updating activity:', error);
                        }
                      }}
                      className="bg-card border-border"
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="bg-destructive text-destructive-foreground h-8 w-8"
                      onClick={() => handleDeleteClick('activity', activity.id, activity.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-card-foreground font-medium text-base">Markets</Label>
                <Button
                  size="icon"
                  onClick={() => handleAddItem("market")}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 w-8"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {markets.map((market) => (
                  <div key={market.id} className="flex items-center space-x-2">
                    <Input
                      value={market.name}
                      onChange={async (e) => {
                        try {
                          const { error } = await supabase
                            .from('markets')
                            .update({ name: e.target.value })
                            .eq('id', market.id);
                          
                          if (error) throw error;
                          
                          setMarkets(markets.map(m => 
                            m.id === market.id ? { ...m, name: e.target.value } : m
                          ));
                        } catch (error) {
                          console.error('Error updating market:', error);
                        }
                      }}
                      className="bg-card border-border"
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="bg-destructive text-destructive-foreground h-8 w-8"
                      onClick={() => handleDeleteClick('market', market.id, market.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleGenerateLaws}
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Laws and Regulation"}
            </Button>
          </CardContent>
        </Card>
      )}

      {showLawsRegulations && (
        <Card className="bg-card">
          <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-card-foreground font-bold">Laws and Regulation</CardTitle>
            <div className="flex space-x-2">
              <Button 
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => setShowLawsDialog(true)}
              >
                Add Laws and Regulation
              </Button>
              <Button 
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Generate Control Framework
              </Button>
            </div>
          </div>
          </CardHeader>
        </Card>
      )}

      {showLawsRegulations && (
        <Card className="bg-card">
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-card-foreground font-bold">No</TableHead>
                  <TableHead className="text-card-foreground font-bold">Domain</TableHead>
                  <TableHead className="text-card-foreground font-bold">Activity</TableHead>
                  <TableHead className="text-card-foreground font-bold">Market</TableHead>
                  <TableHead className="text-card-foreground font-bold">Laws and Regulation</TableHead>
                  <TableHead className="text-card-foreground font-bold">Detail</TableHead>
                  <TableHead className="text-card-foreground font-bold">Country Applied</TableHead>
                  <TableHead className="text-card-foreground font-bold">Referral Source</TableHead>
                  <TableHead className="text-card-foreground font-bold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="text-card-foreground">1</TableCell>
                  <TableCell className="text-card-foreground">Technology</TableCell>
                  <TableCell className="text-card-foreground">Software Development</TableCell>
                  <TableCell className="text-card-foreground">North America</TableCell>
                  <TableCell className="text-card-foreground">GDPR Compliance</TableCell>
                  <TableCell className="text-card-foreground">Data protection requirements</TableCell>
                  <TableCell className="text-card-foreground">USA</TableCell>
                  <TableCell className="text-card-foreground">Legal Department</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
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
      )}

      {/* Add Item Dialog */}
      <Dialog open={showAddDialog.open} onOpenChange={(open) => setShowAddDialog({ ...showAddDialog, open })}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">
              Add {showAddDialog.type === "domain" ? "Domain" : showAddDialog.type === "activity" ? "Activity" : "Market"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-card-foreground font-medium">
                {showAddDialog.type === "domain" ? "Domain" : showAddDialog.type === "activity" ? "Activity" : "Market"}
              </Label>
              <Input
                value={newItemValue}
                onChange={(e) => setNewItemValue(e.target.value)}
                placeholder={`Enter ${showAddDialog.type}`}
                className="bg-card border-border"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowAddDialog({ type: "", open: false })}
              className="bg-card border-border text-card-foreground hover:bg-accent"
            >
              Cancel
            </Button>
            <Button 
              onClick={saveNewItem}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Laws and Regulation Dialog */}
      <Dialog open={showLawsDialog} onOpenChange={setShowLawsDialog}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Add Laws and Regulation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-card-foreground font-medium">Domain</Label>
                <Select value={lawsForm.domain} onValueChange={(value) => setLawsForm({ ...lawsForm, domain: value })}>
                  <SelectTrigger className="bg-card border-border">
                    <SelectValue placeholder="Select domain" />
                  </SelectTrigger>
                  <SelectContent>
                    {domains.map((domain) => (
                      <SelectItem key={domain.id} value={domain.name}>{domain.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-card-foreground font-medium">Activity</Label>
                <Select value={lawsForm.activity} onValueChange={(value) => setLawsForm({ ...lawsForm, activity: value })}>
                  <SelectTrigger className="bg-card border-border">
                    <SelectValue placeholder="Select activity" />
                  </SelectTrigger>
                  <SelectContent>
                    {activities.map((activity) => (
                      <SelectItem key={activity.id} value={activity.name}>{activity.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-card-foreground font-medium">Market</Label>
                <Select value={lawsForm.market} onValueChange={(value) => setLawsForm({ ...lawsForm, market: value })}>
                  <SelectTrigger className="bg-card border-border">
                    <SelectValue placeholder="Select market" />
                  </SelectTrigger>
                  <SelectContent>
                    {markets.map((market) => (
                      <SelectItem key={market.id} value={market.name}>{market.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-card-foreground font-medium">Laws and Regulation</Label>
              <Textarea
                value={lawsForm.lawsRegulation}
                onChange={(e) => setLawsForm({ ...lawsForm, lawsRegulation: e.target.value })}
                placeholder="Enter laws and regulation"
                className="bg-card border-border"
                rows={3}
              />
            </div>

            <div>
              <Label className="text-card-foreground font-medium">Detail</Label>
              <Textarea
                value={lawsForm.detail}
                onChange={(e) => setLawsForm({ ...lawsForm, detail: e.target.value })}
                placeholder="Enter detail"
                className="bg-card border-border"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-card-foreground font-medium">Country Applied</Label>
                <Input
                  value={lawsForm.countryApplied}
                  onChange={(e) => setLawsForm({ ...lawsForm, countryApplied: e.target.value })}
                  placeholder="Enter country applied"
                  className="bg-card border-border"
                />
              </div>
              <div>
                <Label className="text-card-foreground font-medium">Referral Source</Label>
                <Textarea
                  value={lawsForm.referralSource}
                  onChange={(e) => setLawsForm({ ...lawsForm, referralSource: e.target.value })}
                  placeholder="Enter referral source"
                  className="bg-card border-border"
                  rows={2}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowLawsDialog(false)}
              className="bg-card border-border text-card-foreground hover:bg-accent"
            >
              Cancel
            </Button>
            <Button 
              onClick={saveLawsRegulation}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.isOpen} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, isOpen: open })}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-card-foreground">
              Xác nhận xóa
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Bạn có chắc chắn muốn xóa "{deleteDialog.name}" không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-card border-border text-card-foreground hover:bg-accent">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </div>
  );
}