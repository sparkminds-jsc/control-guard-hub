import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Download, Save, Trash2 } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

export default function ControlFrameworkDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [controlFramework, setControlFramework] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedFramework, setEditedFramework] = useState<any>(null);

  // Get return URL from query params
  const urlParams = new URLSearchParams(window.location.search);
  const returnTo = urlParams.get('returnTo');

  useEffect(() => {
    loadControlFrameworkDetail();
  }, [id]);

  const loadControlFrameworkDetail = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('control_framework')
        .select(`
          *,
          domains (name),
          activities (name),
          markets (name),
          laws_and_regulations (name, description, source)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setControlFramework(data);
      setEditedFramework(data);
    } catch (error) {
      console.error('Error loading control framework detail:', error);
      toast({
        title: "Error",
        description: "Failed to load control framework details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      const { error } = await supabase
        .from('control_framework')
        .update({
          context: editedFramework.context,
          description: editedFramework.description,
          riskmanagement: editedFramework.riskmanagement,
          referralsource: editedFramework.referralsource,
          countryapplied: editedFramework.countryapplied,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setControlFramework(editedFramework);
      setIsEditing(false);
      
      toast({
        title: "Success",
        description: "Control framework updated successfully.",
      });
    } catch (error) {
      console.error('Error updating control framework:', error);
      toast({
        title: "Error",
        description: "Failed to update control framework.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this control framework?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('control_framework')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Control framework deleted successfully.",
      });

      // Navigate back
      if (returnTo) {
        navigate(`${returnTo}?fromDetail=control-framework`);
      } else {
        navigate(-1);
      }
    } catch (error) {
      console.error('Error deleting control framework:', error);
      toast({
        title: "Error",
        description: "Failed to delete control framework.",
        variant: "destructive",
      });
    }
  };

  const handleExportExcel = () => {
    if (!controlFramework) return;

    const exportData = {
      'Domain': controlFramework.domains?.name || 'N/A',
      'Activity': controlFramework.activities?.name || 'N/A',
      'Market': controlFramework.markets?.name || 'N/A',
      'Country Applied': controlFramework.countryapplied || 'N/A',
      'Law/Regulation Name': controlFramework.laws_and_regulations?.name || 'N/A',
      'Law Description': controlFramework.laws_and_regulations?.description || 'N/A',
      'Law Source': controlFramework.laws_and_regulations?.source || 'N/A',
      'Context': controlFramework.context || 'N/A',
      'Description': controlFramework.description || 'N/A',
      'Risk Management': controlFramework.riskmanagement || 'N/A',
      'Referral Source': controlFramework.referralsource || 'N/A',
      'Created At': controlFramework.created_at ? new Date(controlFramework.created_at).toLocaleString() : 'N/A',
      'Updated At': controlFramework.updated_at ? new Date(controlFramework.updated_at).toLocaleString() : 'N/A'
    };

    const ws = XLSX.utils.json_to_sheet([exportData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Control Framework');
    XLSX.writeFile(wb, `control-framework-${id}.xlsx`);

    toast({
      title: "Success",
      description: "Control framework exported to Excel successfully.",
    });
  };

  const handleFieldChange = (field: string, value: string) => {
    setEditedFramework((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              onClick={() => {
                if (returnTo) {
                  navigate(`${returnTo}?fromDetail=control-framework`);
                } else {
                  navigate(-1);
                }
              }}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!controlFramework) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              onClick={() => {
                if (returnTo) {
                  navigate(`${returnTo}?fromDetail=control-framework`);
                } else {
                  navigate(-1);
                }
              }}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
          <div className="text-center">Control framework not found.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => {
                if (returnTo) {
                  navigate(`${returnTo}?fromDetail=control-framework`);
                } else {
                  navigate(-1);
                }
              }}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Control Framework Details</h1>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={handleExportExcel}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Excel
            </Button>
            <Button 
              onClick={handleSaveChanges}
              disabled={!isEditing}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDelete}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <Card className="bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-card-foreground">Control Framework Information</CardTitle>
              <Button
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
                size="sm"
              >
                {isEditing ? 'Cancel Edit' : 'Edit'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-card-foreground font-medium">Domain</Label>
                <div className="p-3 bg-muted rounded-md">
                  <span className="text-muted-foreground">
                    {controlFramework.domains?.name || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-card-foreground font-medium">Activity</Label>
                <div className="p-3 bg-muted rounded-md">
                  <span className="text-muted-foreground">
                    {controlFramework.activities?.name || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-card-foreground font-medium">Market</Label>
                <div className="p-3 bg-muted rounded-md">
                  <span className="text-muted-foreground">
                    {controlFramework.markets?.name || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-card-foreground font-medium">Country Applied</Label>
                {isEditing ? (
                  <Input
                    value={editedFramework?.countryapplied || ''}
                    onChange={(e) => handleFieldChange('countryapplied', e.target.value)}
                    className="w-full"
                  />
                ) : (
                  <div className="p-3 bg-muted rounded-md">
                    <span className="text-muted-foreground">
                      {controlFramework.countryapplied || 'N/A'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Law & Regulation Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-card-foreground">Laws & Regulations</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label className="text-card-foreground font-medium">Law/Regulation Name</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <span className="text-muted-foreground">
                      {controlFramework.laws_and_regulations?.name || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-card-foreground font-medium">Law Description</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <span className="text-muted-foreground">
                      {controlFramework.laws_and_regulations?.description || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-card-foreground font-medium">Market Applied</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <span className="text-muted-foreground">
                      {controlFramework.markets?.name || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-card-foreground font-medium">Law Source</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <span className="text-muted-foreground">
                      {controlFramework.laws_and_regulations?.source || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Control Framework Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-card-foreground">Control Framework Details</h3>
              
              <div className="space-y-2">
                <Label className="text-card-foreground font-medium">Context</Label>
                {isEditing ? (
                  <Textarea
                    value={editedFramework?.context || ''}
                    onChange={(e) => handleFieldChange('context', e.target.value)}
                    className="w-full min-h-[100px]"
                  />
                ) : (
                  <div className="p-3 bg-muted rounded-md">
                    <span className="text-muted-foreground">
                      {controlFramework.context || 'N/A'}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-card-foreground font-medium">Description</Label>
                {isEditing ? (
                  <Textarea
                    value={editedFramework?.description || ''}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    className="w-full min-h-[100px]"
                  />
                ) : (
                  <div className="p-3 bg-muted rounded-md">
                    <span className="text-muted-foreground">
                      {controlFramework.description || 'N/A'}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-card-foreground font-medium">Risk Management</Label>
                {isEditing ? (
                  <Textarea
                    value={editedFramework?.riskmanagement || ''}
                    onChange={(e) => handleFieldChange('riskmanagement', e.target.value)}
                    className="w-full min-h-[100px]"
                  />
                ) : (
                  <div className="p-3 bg-muted rounded-md">
                    <span className="text-muted-foreground">
                      {controlFramework.riskmanagement || 'N/A'}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-card-foreground font-medium">Referral Source</Label>
                {isEditing ? (
                  <Input
                    value={editedFramework?.referralsource || ''}
                    onChange={(e) => handleFieldChange('referralsource', e.target.value)}
                    className="w-full"
                  />
                ) : (
                  <div className="p-3 bg-muted rounded-md">
                    <span className="text-muted-foreground">
                      {controlFramework.referralsource || 'N/A'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Timestamps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-card-foreground font-medium">Created At</Label>
                <div className="p-3 bg-muted rounded-md">
                  <span className="text-muted-foreground">
                    {controlFramework.created_at ? new Date(controlFramework.created_at).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-card-foreground font-medium">Updated At</Label>
                <div className="p-3 bg-muted rounded-md">
                  <span className="text-muted-foreground">
                    {controlFramework.updated_at ? new Date(controlFramework.updated_at).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}