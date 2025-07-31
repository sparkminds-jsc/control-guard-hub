import { useState, useEffect, useCallback } from "react";
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
import { Trash2, Plus, Edit, Eye, Search, Filter, Loader2 } from "lucide-react";
import { useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [lawsAndRegulations, setLawsAndRegulations] = useState<any[]>([]);
  
  // Pagination and filtering state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDomain, setFilterDomain] = useState("");
  const [filterActivity, setFilterActivity] = useState("");
  const [filterMarket, setFilterMarket] = useState("");
  const [editingLaw, setEditingLaw] = useState<any>(null);
  const [editLawForm, setEditLawForm] = useState({
    name: "",
    description: "",
    country: "",
    source: "",
    domain_id: "",
    activity_id: "",
    market_id: ""
  });
  
  // Loading states for detail sections
  const [detailLoading, setDetailLoading] = useState({
    domains: false,
    activities: false,
    markets: false
  });
  
  // Edit states for detail sections
  const [editingItem, setEditingItem] = useState<{
    type: string;
    id: string;
    value: string;
  } | null>(null);

  // Setup realtime subscription for laws and regulations
  const setupRealtimeSubscription = useCallback(() => {
    const channel = supabase
      .channel('laws-and-regulations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'laws_and_regulations',
          filter: `company_id=eq.${id}`
        },
        () => {
          loadLawsAndRegulations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'domains',
          filter: `company_id=eq.${id}`
        },
        () => {
          loadCompanyData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities',
          filter: `company_id=eq.${id}`
        },
        () => {
          loadCompanyData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'markets',
          filter: `company_id=eq.${id}`
        },
        () => {
          loadCompanyData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  // Load company data and related domains, activities, markets
  useEffect(() => {
    if (id) {
      loadCompanyData();
      const cleanup = setupRealtimeSubscription();
      return cleanup;
    }
  }, [id, setupRealtimeSubscription]);

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

      // Load laws and regulations
      await loadLawsAndRegulations();

    } catch (error) {
      console.error('Error loading company data:', error);
    }
  };

  const loadLawsAndRegulations = async () => {
    try {
      const { data: lawsData, error: lawsError } = await supabase
        .from('laws_and_regulations')
        .select(`
          *,
          domains!laws_and_regulations_domain_id_fkey(name),
          activities!laws_and_regulations_activity_id_fkey(name),
          markets!laws_and_regulations_market_id_fkey(name)
        `)
        .eq('company_id', id);
      
      if (lawsError) throw lawsError;
      setLawsAndRegulations(lawsData || []);
    } catch (error) {
      console.error('Error loading laws and regulations:', error);
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
      setDetailLoading(prev => ({ 
        ...prev, 
        [deleteDialog.type + 's']: true 
      }));
      
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
      
      // Reload laws and regulations since domain/activity/market references might be affected
      await loadLawsAndRegulations();
      
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
    } finally {
      setDetailLoading(prev => ({ 
        ...prev, 
        [deleteDialog.type + 's']: false 
      }));
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
        setDetailLoading(prev => ({ 
          ...prev, 
          [showAddDialog.type + 's']: true 
        }));
        
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
      } finally {
        setDetailLoading(prev => ({ 
          ...prev, 
          [showAddDialog.type + 's']: false 
        }));
      }
    }
    setShowAddDialog({ type: "", open: false });
    setNewItemValue("");
  };

  // Handle editing detail items
  const handleEditItem = (type: string, id: string, currentValue: string) => {
    setEditingItem({ type, id, value: currentValue });
  };

  const saveEditItem = async () => {
    if (!editingItem || !editingItem.value.trim()) return;
    
    try {
      setDetailLoading(prev => ({ 
        ...prev, 
        [editingItem.type + 's']: true 
      }));

      let error;
      
      if (editingItem.type === 'domain') {
        ({ error } = await supabase
          .from('domains')
          .update({ name: editingItem.value.trim() })
          .eq('id', editingItem.id));
      } else if (editingItem.type === 'activity') {
        ({ error } = await supabase
          .from('activities')
          .update({ name: editingItem.value.trim() })
          .eq('id', editingItem.id));
      } else if (editingItem.type === 'market') {
        ({ error } = await supabase
          .from('markets')
          .update({ name: editingItem.value.trim() })
          .eq('id', editingItem.id));
      }
      
      if (error) throw error;
      
      // Update local state
      if (editingItem.type === 'domain') {
        setDomains(domains.map(d => 
          d.id === editingItem.id ? { ...d, name: editingItem.value.trim() } : d
        ));
      } else if (editingItem.type === 'activity') {
        setActivities(activities.map(a => 
          a.id === editingItem.id ? { ...a, name: editingItem.value.trim() } : a
        ));
      } else if (editingItem.type === 'market') {
        setMarkets(markets.map(m => 
          m.id === editingItem.id ? { ...m, name: editingItem.value.trim() } : m
        ));
      }
      
      toast({
        title: "Updated Successfully",
        description: `${editingItem.type} has been updated.`,
        className: "fixed top-4 right-4 w-auto"
      });
      
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: "Update Failed",
        description: "An error occurred while updating. Please try again.",
        variant: "destructive",
        className: "fixed top-4 right-4 w-auto"
      });
    } finally {
      setDetailLoading(prev => ({ 
        ...prev, 
        [editingItem.type + 's']: false 
      }));
    }
  };

  const cancelEditItem = () => {
    setEditingItem(null);
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
        const responseData = await response.json();
        
        // Clear existing laws and regulations for this company
        await supabase
          .from('laws_and_regulations')
          .delete()
          .eq('company_id', id);
        
        // Save new laws and regulations to database
        if (responseData.laws_and_regulations) {
          const lawsToInsert = [];
          
          for (const law of responseData.laws_and_regulations) {
            // Find matching domains, activities, and markets
            const matchingDomains = domains.filter(d => 
              law.businessDomain && law.businessDomain.includes(d.name)
            );
            const matchingActivities = activities.filter(a => 
              law.activities && law.activities.includes(a.name)
            );
            const matchingMarkets = markets.filter(m => 
              law.country === m.name || (law.country === 'Global' && m.name === 'Global')
            );
            
            // If no specific matches, use all markets for global laws
            const marketsToUse = matchingMarkets.length > 0 ? matchingMarkets : 
              (law.country === 'Global' ? markets : []);
            
            // Create entries for each combination
            for (const domain of (matchingDomains.length > 0 ? matchingDomains : [null])) {
              for (const activity of (matchingActivities.length > 0 ? matchingActivities : [null])) {
                for (const market of (marketsToUse.length > 0 ? marketsToUse : [null])) {
                  lawsToInsert.push({
                    company_id: id,
                    name: law.name,
                    description: law.description,
                    country: law.country,
                    source: law.source,
                    domain_id: domain?.id || null,
                    activity_id: activity?.id || null,
                    market_id: market?.id || null
                  });
                }
              }
            }
          }
          
          if (lawsToInsert.length > 0) {
            const { error: insertError } = await supabase
              .from('laws_and_regulations')
              .insert(lawsToInsert);
            
            if (insertError) throw insertError;
          }
        }
        
        // Reload laws and regulations data
        await loadLawsAndRegulations();
        
        toast({
          title: "Generated Successfully",
          description: "Laws and regulations have been generated and saved successfully.",
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

  // Filter and paginate laws and regulations
  const filteredLaws = lawsAndRegulations.filter(law => {
    const matchesSearch = searchTerm === "" || 
      law.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      law.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      law.source.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDomain = filterDomain === "" || filterDomain === "all-domains" || law.domains?.name === filterDomain;
    const matchesActivity = filterActivity === "" || filterActivity === "all-activities" || law.activities?.name === filterActivity;
    const matchesMarket = filterMarket === "" || filterMarket === "all-markets" || law.markets?.name === filterMarket;
    
    return matchesSearch && matchesDomain && matchesActivity && matchesMarket;
  });

  const totalPages = Math.ceil(filteredLaws.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLaws = filteredLaws.slice(startIndex, startIndex + itemsPerPage);

  const saveLawsRegulation = async () => {
    try {
      const domainId = domains.find(d => d.name === lawsForm.domain)?.id;
      const activityId = activities.find(a => a.name === lawsForm.activity)?.id;
      const marketId = markets.find(m => m.name === lawsForm.market)?.id;

      const { error } = await supabase
        .from('laws_and_regulations')
        .insert({
          company_id: id,
          name: lawsForm.lawsRegulation,
          description: lawsForm.detail,
          country: lawsForm.countryApplied,
          source: lawsForm.referralSource,
          domain_id: domainId || null,
          activity_id: activityId || null,
          market_id: marketId || null
        });

      if (error) throw error;

      await loadLawsAndRegulations();
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

      toast({
        title: "Added Successfully",
        description: "Laws and regulation has been added successfully.",
        className: "fixed top-4 right-4 w-auto"
      });
    } catch (error) {
      console.error('Error adding law:', error);
      toast({
        title: "Add Failed",
        description: "Failed to add laws and regulation. Please try again.",
        variant: "destructive",
        className: "fixed top-4 right-4 w-auto"
      });
    }
  };

  const handleEditLaw = (law: any) => {
    setEditingLaw(law);
    setEditLawForm({
      name: law.name,
      description: law.description,
      country: law.country,
      source: law.source,
      domain_id: law.domain_id || "",
      activity_id: law.activity_id || "",
      market_id: law.market_id || ""
    });
  };

  const saveEditLaw = async () => {
    try {
      const { error } = await supabase
        .from('laws_and_regulations')
        .update({
          name: editLawForm.name,
          description: editLawForm.description,
          country: editLawForm.country,
          source: editLawForm.source,
          domain_id: editLawForm.domain_id === "no-domain" ? null : editLawForm.domain_id || null,
          activity_id: editLawForm.activity_id === "no-activity" ? null : editLawForm.activity_id || null,
          market_id: editLawForm.market_id === "no-market" ? null : editLawForm.market_id || null
        })
        .eq('id', editingLaw.id);

      if (error) throw error;

      await loadLawsAndRegulations();
      setEditingLaw(null);

      toast({
        title: "Updated Successfully",
        description: "Laws and regulation has been updated successfully.",
        className: "fixed top-4 right-4 w-auto"
      });
    } catch (error) {
      console.error('Error updating law:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update laws and regulation. Please try again.",
        variant: "destructive",
        className: "fixed top-4 right-4 w-auto"
      });
    }
  };

  const handleDeleteLaw = async (lawId: string, lawName: string) => {
    try {
      const { error } = await supabase
        .from('laws_and_regulations')
        .delete()
        .eq('id', lawId);

      if (error) throw error;

      // Reload all related data
      await loadCompanyData();

      toast({
        title: "Deleted Successfully",
        description: `"${lawName}" has been deleted successfully.`,
        className: "fixed top-4 right-4 w-auto"
      });
    } catch (error) {
      console.error('Error deleting law:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete laws and regulation. Please try again.",
        variant: "destructive",
        className: "fixed top-4 right-4 w-auto"
      });
    }
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
                  disabled={detailLoading.domains}
                >
                  {detailLoading.domains ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                </Button>
              </div>
              <div className="space-y-2">
                {detailLoading.domains ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  domains.map((domain) => (
                    <div key={domain.id} className="flex items-center space-x-2">
                      {editingItem?.type === 'domain' && editingItem?.id === domain.id ? (
                        <>
                          <Input
                            value={editingItem.value}
                            onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                            className="bg-card border-border"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEditItem();
                              if (e.key === 'Escape') cancelEditItem();
                            }}
                            autoFocus
                          />
                          <Button
                            size="icon"
                            onClick={saveEditItem}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={cancelEditItem}
                            className="bg-card border-border text-card-foreground hover:bg-accent h-8 w-8"
                          >
                            ✕
                          </Button>
                        </>
                      ) : (
                        <>
                          <Input
                            value={domain.name}
                            readOnly
                            className="bg-card border-border cursor-pointer"
                            onClick={() => handleEditItem('domain', domain.id, domain.name)}
                          />
                          <Button
                            size="icon"
                            onClick={() => handleEditItem('domain', domain.id, domain.name)}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            className="bg-destructive text-destructive-foreground h-8 w-8"
                            onClick={() => handleDeleteClick('domain', domain.id, domain.name)}
                            disabled={domains.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-card-foreground font-medium text-base">Activities</Label>
                <Button
                  size="icon"
                  onClick={() => handleAddItem("activity")}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 w-8"
                  disabled={detailLoading.activities}
                >
                  {detailLoading.activities ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                </Button>
              </div>
              <div className="space-y-2">
                {detailLoading.activities ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  activities.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-2">
                      {editingItem?.type === 'activity' && editingItem?.id === activity.id ? (
                        <>
                          <Input
                            value={editingItem.value}
                            onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                            className="bg-card border-border"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEditItem();
                              if (e.key === 'Escape') cancelEditItem();
                            }}
                            autoFocus
                          />
                          <Button
                            size="icon"
                            onClick={saveEditItem}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={cancelEditItem}
                            className="bg-card border-border text-card-foreground hover:bg-accent h-8 w-8"
                          >
                            ✕
                          </Button>
                        </>
                      ) : (
                        <>
                          <Input
                            value={activity.name}
                            readOnly
                            className="bg-card border-border cursor-pointer"
                            onClick={() => handleEditItem('activity', activity.id, activity.name)}
                          />
                          <Button
                            size="icon"
                            onClick={() => handleEditItem('activity', activity.id, activity.name)}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            className="bg-destructive text-destructive-foreground h-8 w-8"
                            onClick={() => handleDeleteClick('activity', activity.id, activity.name)}
                            disabled={activities.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-card-foreground font-medium text-base">Markets</Label>
                <Button
                  size="icon"
                  onClick={() => handleAddItem("market")}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 w-8"
                  disabled={detailLoading.markets}
                >
                  {detailLoading.markets ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                </Button>
              </div>
              <div className="space-y-2">
                {detailLoading.markets ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  markets.map((market) => (
                    <div key={market.id} className="flex items-center space-x-2">
                      {editingItem?.type === 'market' && editingItem?.id === market.id ? (
                        <>
                          <Input
                            value={editingItem.value}
                            onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                            className="bg-card border-border"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEditItem();
                              if (e.key === 'Escape') cancelEditItem();
                            }}
                            autoFocus
                          />
                          <Button
                            size="icon"
                            onClick={saveEditItem}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={cancelEditItem}
                            className="bg-card border-border text-card-foreground hover:bg-accent h-8 w-8"
                          >
                            ✕
                          </Button>
                        </>
                      ) : (
                        <>
                          <Input
                            value={market.name}
                            readOnly
                            className="bg-card border-border cursor-pointer"
                            onClick={() => handleEditItem('market', market.id, market.name)}
                          />
                          <Button
                            size="icon"
                            onClick={() => handleEditItem('market', market.id, market.name)}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            className="bg-destructive text-destructive-foreground h-8 w-8"
                            onClick={() => handleDeleteClick('market', market.id, market.name)}
                            disabled={markets.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleGenerateLaws}
                disabled={loading || lawsAndRegulations.length > 0}
              >
                {loading ? "Generating..." : "Generate Laws and Regulation"}
              </Button>
              <Button 
                variant="outline"
                className="bg-card border-border text-card-foreground hover:bg-accent"
                onClick={() => setShowLawsRegulations(!showLawsRegulations)}
              >
                {showLawsRegulations ? 'Hide Laws and Regulations' : 'See Laws and Regulations'}
              </Button>
            </div>
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
          <CardContent className="space-y-4">
            {/* Search and Filter Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search laws, details, or source..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-card border-border pl-10"
                />
              </div>
              <Select value={filterDomain} onValueChange={setFilterDomain}>
                <SelectTrigger className="bg-card border-border">
                  <SelectValue placeholder="Filter by Domain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-domains">All Domains</SelectItem>
                  {domains.map((domain) => (
                    <SelectItem key={domain.id} value={domain.name}>{domain.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterActivity} onValueChange={setFilterActivity}>
                <SelectTrigger className="bg-card border-border">
                  <SelectValue placeholder="Filter by Activity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-activities">All Activities</SelectItem>
                  {activities.map((activity) => (
                    <SelectItem key={activity.id} value={activity.name}>{activity.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterMarket} onValueChange={setFilterMarket}>
                <SelectTrigger className="bg-card border-border">
                  <SelectValue placeholder="Filter by Market" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-markets">All Markets</SelectItem>
                  {markets.map((market) => (
                    <SelectItem key={market.id} value={market.name}>{market.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Statistics */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {filteredLaws.length > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + itemsPerPage, filteredLaws.length)} of {filteredLaws.length} results
              </div>
              <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                Total: {lawsAndRegulations.length} laws
              </Badge>
            </div>
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
                {paginatedLaws.length > 0 ? (
                  paginatedLaws.map((law, index) => (
                    <TableRow key={law.id}>
                      <TableCell className="text-card-foreground">{startIndex + index + 1}</TableCell>
                      <TableCell className="text-card-foreground">
                        {law.domains?.name || 'N/A'}
                      </TableCell>
                      <TableCell className="text-card-foreground">
                        {law.activities?.name || 'N/A'}
                      </TableCell>
                      <TableCell className="text-card-foreground">
                        {law.markets?.name || 'N/A'}
                      </TableCell>
                      <TableCell className="text-card-foreground">{law.name}</TableCell>
                      <TableCell className="text-card-foreground max-w-xs truncate" title={law.description}>
                        {law.description}
                      </TableCell>
                      <TableCell className="text-card-foreground">{law.country}</TableCell>
                      <TableCell className="text-card-foreground max-w-xs truncate" title={law.source}>
                        {law.source}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="bg-card border-border text-card-foreground hover:bg-accent"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                            onClick={() => handleEditLaw(law)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            className="bg-destructive text-destructive-foreground"
                            onClick={() => handleDeleteLaw(law.id, law.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground">
                      {searchTerm || filterDomain || filterActivity || filterMarket 
                        ? "No matching laws and regulations found." 
                        : "No laws and regulations found. Click \"Generate Laws and Regulation\" to get started."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="bg-card border-border text-card-foreground hover:bg-accent"
                  >
                    Previous
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={currentPage === page 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-card border-border text-card-foreground hover:bg-accent"
                      }
                    >
                      {page}
                    </Button>
                  ))}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="bg-card border-border text-card-foreground hover:bg-accent"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
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

      {/* Edit Laws and Regulation Dialog */}
      <Dialog open={editingLaw !== null} onOpenChange={(open) => !open && setEditingLaw(null)}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Edit Laws and Regulation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-card-foreground font-medium">Domain</Label>
                <Select 
                  value={editLawForm.domain_id} 
                  onValueChange={(value) => setEditLawForm({ ...editLawForm, domain_id: value })}
                >
                  <SelectTrigger className="bg-card border-border">
                    <SelectValue placeholder="Select domain" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-domain">No Domain</SelectItem>
                    {domains.map((domain) => (
                      <SelectItem key={domain.id} value={domain.id}>{domain.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-card-foreground font-medium">Activity</Label>
                <Select 
                  value={editLawForm.activity_id} 
                  onValueChange={(value) => setEditLawForm({ ...editLawForm, activity_id: value })}
                >
                  <SelectTrigger className="bg-card border-border">
                    <SelectValue placeholder="Select activity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-activity">No Activity</SelectItem>
                    {activities.map((activity) => (
                      <SelectItem key={activity.id} value={activity.id}>{activity.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-card-foreground font-medium">Market</Label>
                <Select 
                  value={editLawForm.market_id} 
                  onValueChange={(value) => setEditLawForm({ ...editLawForm, market_id: value })}
                >
                  <SelectTrigger className="bg-card border-border">
                    <SelectValue placeholder="Select market" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-market">No Market</SelectItem>
                    {markets.map((market) => (
                      <SelectItem key={market.id} value={market.id}>{market.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-card-foreground font-medium">Laws and Regulation</Label>
              <Textarea
                value={editLawForm.name}
                onChange={(e) => setEditLawForm({ ...editLawForm, name: e.target.value })}
                placeholder="Enter laws and regulation"
                className="bg-card border-border"
                rows={3}
              />
            </div>

            <div>
              <Label className="text-card-foreground font-medium">Detail</Label>
              <Textarea
                value={editLawForm.description}
                onChange={(e) => setEditLawForm({ ...editLawForm, description: e.target.value })}
                placeholder="Enter detail"
                className="bg-card border-border"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-card-foreground font-medium">Country Applied</Label>
                <Input
                  value={editLawForm.country}
                  onChange={(e) => setEditLawForm({ ...editLawForm, country: e.target.value })}
                  placeholder="Enter country applied"
                  className="bg-card border-border"
                />
              </div>
              <div>
                <Label className="text-card-foreground font-medium">Referral Source</Label>
                <Textarea
                  value={editLawForm.source}
                  onChange={(e) => setEditLawForm({ ...editLawForm, source: e.target.value })}
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
              onClick={() => setEditingLaw(null)}
              className="bg-card border-border text-card-foreground hover:bg-accent"
            >
              Cancel
            </Button>
            <Button 
              onClick={saveEditLaw}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Update
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