import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface Domain {
  name: string;
}

interface Activity {
  name: string;
}

interface Market {
  name: string;
}

interface LawRegulation {
  name: string;
}

interface FilterDomain {
  id: string;
  name: string;
}

interface FilterActivity {
  id: string;
  name: string;
}

interface FilterMarket {
  id: string;
  name: string;
}

interface FilterLawRegulation {
  id: string;
  name: string;
}

interface ControlFramework {
  id: string;
  context: string | null;
  description: string | null;
  countryapplied: string | null;
  referralsource: string | null;
  riskmanagement: string | null;
  created_at: string;
  updated_at: string;
  domains: Domain | null;
  activities: Activity | null;
  markets: Market | null;
  laws_and_regulations: LawRegulation | null;
}

const ITEMS_PER_PAGE = 10;

export default function ControlFrameworkHistory() {
  const { toast } = useToast();
  const [controlFrameworks, setControlFrameworks] = useState<ControlFramework[]>([]);
  const [filteredFrameworks, setFilteredFrameworks] = useState<ControlFramework[]>([]);
  const [domains, setDomains] = useState<FilterDomain[]>([]);
  const [activities, setActivities] = useState<FilterActivity[]>([]);
  const [markets, setMarkets] = useState<FilterMarket[]>([]);
  const [laws, setLaws] = useState<FilterLawRegulation[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [selectedActivity, setSelectedActivity] = useState<string>("all");
  const [selectedMarket, setSelectedMarket] = useState<string>("all");
  const [selectedLaw, setSelectedLaw] = useState<string>("all");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [controlFrameworks, searchTerm, selectedDomain, selectedActivity, selectedMarket, selectedLaw]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load control frameworks with related data
      const { data: frameworksData, error: frameworksError } = await supabase
        .from('control_framework')
        .select(`
          *,
          domains!control_framework_id_domain_fkey(name),
          activities!control_framework_id_activities_fkey(name),
          markets!control_framework_id_markets_fkey(name),
          laws_and_regulations!control_framework_id_laws_and_regulations_fkey(name)
        `)
        .order('created_at', { ascending: false });

      if (frameworksError) throw frameworksError;
      setControlFrameworks(frameworksData || []);

      // Load filter options
      const [domainsRes, activitiesRes, marketsRes, lawsRes] = await Promise.all([
        supabase.from('domains').select('id, name').order('name'),
        supabase.from('activities').select('id, name').order('name'),
        supabase.from('markets').select('id, name').order('name'),
        supabase.from('laws_and_regulations').select('id, name').order('name')
      ]);

      if (domainsRes.error) throw domainsRes.error;
      if (activitiesRes.error) throw activitiesRes.error;
      if (marketsRes.error) throw marketsRes.error;
      if (lawsRes.error) throw lawsRes.error;

      setDomains(domainsRes.data || []);
      setActivities(activitiesRes.data || []);
      setMarkets(marketsRes.data || []);
      setLaws(lawsRes.data || []);

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load control frameworks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = controlFrameworks;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(framework =>
        framework.context?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        framework.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        framework.domains?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        framework.activities?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        framework.markets?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        framework.laws_and_regulations?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Domain filter
    if (selectedDomain !== "all") {
      filtered = filtered.filter(framework => framework.domains?.name === selectedDomain);
    }

    // Activity filter
    if (selectedActivity !== "all") {
      filtered = filtered.filter(framework => framework.activities?.name === selectedActivity);
    }

    // Market filter
    if (selectedMarket !== "all") {
      filtered = filtered.filter(framework => framework.markets?.name === selectedMarket);
    }

    // Law filter
    if (selectedLaw !== "all") {
      filtered = filtered.filter(framework => framework.laws_and_regulations?.name === selectedLaw);
    }

    setFilteredFrameworks(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this control framework?")) return;

    try {
      const { error } = await supabase
        .from('control_framework')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Control framework deleted successfully"
      });

      loadData();
    } catch (error) {
      console.error('Error deleting control framework:', error);
      toast({
        title: "Error",
        description: "Failed to delete control framework",
        variant: "destructive"
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedDomain("all");
    setSelectedActivity("all");
    setSelectedMarket("all");
    setSelectedLaw("all");
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredFrameworks.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentFrameworks = filteredFrameworks.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, page)));
  };

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading control frameworks...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-card-foreground">Control Framework History</h1>
          <p className="text-muted-foreground">
            Showing {filteredFrameworks.length} of {controlFrameworks.length} control frameworks
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Search */}
            <div className="xl:col-span-2">
              <Input
                placeholder="Search frameworks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Domain Filter */}
            <Select value={selectedDomain} onValueChange={setSelectedDomain}>
              <SelectTrigger>
                <SelectValue placeholder="Domain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Domains</SelectItem>
                {domains.map((domain) => (
                  <SelectItem key={domain.id} value={domain.name}>
                    {domain.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Activity Filter */}
            <Select value={selectedActivity} onValueChange={setSelectedActivity}>
              <SelectTrigger>
                <SelectValue placeholder="Activity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                {activities.map((activity) => (
                  <SelectItem key={activity.id} value={activity.name}>
                    {activity.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Market Filter */}
            <Select value={selectedMarket} onValueChange={setSelectedMarket}>
              <SelectTrigger>
                <SelectValue placeholder="Market" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Markets</SelectItem>
                {markets.map((market) => (
                  <SelectItem key={market.id} value={market.name}>
                    {market.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Laws Filter */}
            <Select value={selectedLaw} onValueChange={setSelectedLaw}>
              <SelectTrigger>
                <SelectValue placeholder="Laws" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Laws</SelectItem>
                {laws.map((law) => (
                  <SelectItem key={law.id} value={law.name}>
                    {law.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">No</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Market</TableHead>
                <TableHead>Laws & Regulation</TableHead>
                <TableHead>Context</TableHead>
                <TableHead>Country Applied</TableHead>
                <TableHead>Referral Source</TableHead>
                <TableHead className="w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentFrameworks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    No control frameworks found
                  </TableCell>
                </TableRow>
              ) : (
                currentFrameworks.map((framework, index) => (
                  <TableRow key={framework.id}>
                    <TableCell>{startIndex + index + 1}</TableCell>
                    <TableCell>
                      {framework.domains?.name ? (
                        <Badge variant="secondary">{framework.domains.name}</Badge>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>
                      {framework.activities?.name ? (
                        <Badge variant="outline">{framework.activities.name}</Badge>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>
                      {framework.markets?.name ? (
                        <Badge variant="outline">{framework.markets.name}</Badge>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>
                      {framework.laws_and_regulations?.name ? (
                        <div className="max-w-[200px] truncate" title={framework.laws_and_regulations.name}>
                          {framework.laws_and_regulations.name}
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[300px] truncate" title={framework.context || ""}>
                        {framework.context || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>{framework.countryapplied || "N/A"}</TableCell>
                    <TableCell>
                      <div className="max-w-[150px] truncate" title={framework.referralsource || ""}>
                        {framework.referralsource || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/control-framework/${framework.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/control-framework/${framework.id}?edit=true`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(framework.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredFrameworks.length)} of {filteredFrameworks.length} results
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(pageNum)}
                    className="w-8 h-8"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}