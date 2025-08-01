import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ChevronLeft, ChevronRight, Download } from "lucide-react";
import * as XLSX from 'xlsx';

export default function ControlFrameworkHistory() {
  const navigate = useNavigate();
  const [selectedFramework, setSelectedFramework] = useState<number>(0);
  const [controlFrameworks, setControlFrameworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [userCompanyId, setUserCompanyId] = useState<string | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    getCurrentUserCompany();
  }, []);

  useEffect(() => {
    if (userCompanyId) {
      loadControlFrameworks();
    }
  }, [userCompanyId]);

  const getCurrentUserCompany = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        const { data: userData } = await supabase
          .from('users')
          .select('id_company')
          .eq('email', user.email)
          .single();
        
        if (userData?.id_company) {
          setUserCompanyId(userData.id_company);
        }
      }
    } catch (error) {
      console.error('Error getting user company:', error);
    }
  };

  const loadControlFrameworks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('control_framework')
        .select(`
          *,
          domains!control_framework_id_domain_fkey(name),
          activities!control_framework_id_activities_fkey(name),
          markets!control_framework_id_markets_fkey(name),
          laws_and_regulations!control_framework_id_laws_and_regulations_fkey(name, description, source)
        `)
        .eq('company_id', userCompanyId)
        .eq('isverify', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setControlFrameworks(data || []);
    } catch (error) {
      console.error('Error loading control frameworks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (controlFrameworks.length === 0) return;
    
    try {
      setUpdating(true);
      const currentFramework = controlFrameworks[selectedFramework];
      
      const { error } = await supabase
        .from('control_framework')
        .update({
          context: (document.querySelector('input[name="context"]') as HTMLInputElement)?.value,
          description: (document.querySelector('textarea[name="description"]') as HTMLTextAreaElement)?.value,
        })
        .eq('id', currentFramework.id);
      
      if (error) throw error;
      
      // Reload data
      await loadControlFrameworks();
    } catch (error) {
      console.error('Error saving changes:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (controlFrameworks.length === 0) return;
    
    if (!confirm('Are you sure you want to delete this control framework?')) return;
    
    try {
      setUpdating(true);
      const currentFramework = controlFrameworks[selectedFramework];
      
      const { error } = await supabase
        .from('control_framework')
        .delete()
        .eq('id', currentFramework.id);
      
      if (error) throw error;
      
      // Reload data and adjust selection
      await loadControlFrameworks();
      if (selectedFramework >= controlFrameworks.length - 1) {
        setSelectedFramework(Math.max(0, controlFrameworks.length - 2));
      }
    } catch (error) {
      console.error('Error deleting control framework:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleExportExcel = () => {
    const exportData = controlFrameworks.map((framework, index) => ({
      'No.': index + 1,
      'Law/Regulation': framework.laws_and_regulations?.name || 'N/A',
      'Domain': framework.domains?.name || 'N/A',
      'Activity': framework.activities?.name || 'N/A',
      'Market': framework.markets?.name || 'N/A',
      'Country Applied': framework.countryapplied || 'N/A',
      'Risk Management': framework.riskmanagement || 'N/A',
      'Referral Source': framework.referralsource || 'N/A',
      'Context': framework.context || 'N/A',
      'Description': framework.description || 'N/A',
      'Created At': framework.created_at ? new Date(framework.created_at).toLocaleDateString() : 'N/A'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Control Frameworks');
    
    const fileName = `Control_Frameworks_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="flex gap-6 h-[calc(100vh-200px)]">
          <div className="w-1/3">
            <Card className="h-full">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="flex-1">
            <Card className="h-full">
              <CardContent className="p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-8 w-full mb-4" />
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (controlFrameworks.length === 0) {
    return (
      <div className="flex-1 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-card-foreground">Control Framework History</h1>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No control frameworks found for this company.</p>
            <Button 
              className="mt-4"
              onClick={() => navigate('/')}
            >
              Go Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate pagination
  const totalPages = Math.ceil(controlFrameworks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFrameworks = controlFrameworks.slice(startIndex, endIndex);
  
  const currentFramework = controlFrameworks[selectedFramework];

  return (
    <div className="flex-1 p-6">
      {/* Main Content with White Background */}
      <div className="bg-white rounded-lg shadow-sm p-6 min-h-[calc(100vh-120px)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              onClick={handleExportExcel}
              disabled={controlFrameworks.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <Button 
              onClick={handleSaveChanges}
              disabled={updating}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {updating ? "Saving..." : "Save Changes"}
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDelete}
              disabled={updating}
            >
              Delete
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex gap-6 h-[calc(100vh-380px)]">
        {/* Left Panel - Laws List */}
        <div className="w-1/3">
          <Card className="bg-card h-full flex flex-col">
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-card-foreground font-bold">Laws and Regulations</CardTitle>
                <div className="text-sm text-muted-foreground">
                  {controlFrameworks.length} total
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col">
              <div className="space-y-2 p-4 flex-1 overflow-y-auto">
                {currentFrameworks.map((framework, index) => {
                  const actualIndex = startIndex + index;
                  return (
                    <div
                      key={framework.id}
                      className={`p-3 rounded-md cursor-pointer transition-colors ${
                        selectedFramework === actualIndex
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80 text-card-foreground"
                      }`}
                      onClick={() => setSelectedFramework(actualIndex)}
                    >
                      <div className="font-medium">
                        {framework.laws_and_regulations?.name || 'Unnamed Framework'}
                      </div>
                      <div className="text-sm opacity-70">
                        {framework.domains?.name || 'No Domain'} • {framework.countryapplied || 'No Country'}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Detail */}
        <div className="flex-1">
          <Card className="bg-card h-full">
            <CardContent className="p-6 h-full flex flex-col">
              {/* Info Section */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-card-foreground mb-4">Info</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-1">Domain</label>
                    <div className="text-card-foreground">{currentFramework.domains?.name || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-1">Activity</label>
                    <div className="text-card-foreground">{currentFramework.activities?.name || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-1">Market</label>
                    <div className="text-card-foreground">{currentFramework.markets?.name || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-1">Country Applied</label>
                    <div className="text-card-foreground">{currentFramework.countryapplied || 'N/A'}</div>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-card-foreground mb-1">Law/Regulation</label>
                    <div className="text-card-foreground">{currentFramework.laws_and_regulations?.name || 'N/A'}</div>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-card-foreground mb-1">Risk Management</label>
                    <div className="text-card-foreground">{currentFramework.riskmanagement || 'N/A'}</div>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-card-foreground mb-1">Referral Source</label>
                    <div className="text-card-foreground">{currentFramework.referralsource || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Control Framework Section */}
              <div className="flex-1">
                <h3 className="text-lg font-bold text-card-foreground mb-4">Control Framework</h3>
                <div className="space-y-4 flex-1">
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-1">Context</label>
                    <Input 
                      name="context"
                      defaultValue={currentFramework.context || ''}
                      className="w-full"
                    />
                  </div>
                  <div className="flex-1 min-h-0">
                    <label className="block text-sm font-medium text-card-foreground mb-1">Description</label>
                    <Textarea 
                      name="description"
                      defaultValue={currentFramework.description || ''}
                      className="w-full h-24 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-4 pt-4 border-t">
                <Button 
                  variant="outline"
                  disabled={selectedFramework === 0}
                  onClick={() => setSelectedFramework(Math.max(0, selectedFramework - 1))}
                >
                  Previous
                </Button>
                <Button 
                  variant="outline"
                  disabled={selectedFramework === controlFrameworks.length - 1}
                  onClick={() => setSelectedFramework(Math.min(controlFrameworks.length - 1, selectedFramework + 1))}
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </div>
  );
}