import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function ControlFrameworkDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [controlFramework, setControlFramework] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
          laws_and_regulations (name, description, country, source)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setControlFramework(data);
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
          <h1 className="text-2xl font-bold text-foreground">Control Framework Details</h1>
        </div>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Control Framework Information</CardTitle>
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
                <div className="p-3 bg-muted rounded-md">
                  <span className="text-muted-foreground">
                    {controlFramework.countryapplied || 'N/A'}
                  </span>
                </div>
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
                  <Label className="text-card-foreground font-medium">Law Country</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <span className="text-muted-foreground">
                      {controlFramework.laws_and_regulations?.country || 'N/A'}
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
                <div className="p-3 bg-muted rounded-md">
                  <span className="text-muted-foreground">
                    {controlFramework.context || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-card-foreground font-medium">Description</Label>
                <div className="p-3 bg-muted rounded-md">
                  <span className="text-muted-foreground">
                    {controlFramework.description || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-card-foreground font-medium">Risk Management</Label>
                <div className="p-3 bg-muted rounded-md">
                  <span className="text-muted-foreground">
                    {controlFramework.riskmanagement || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-card-foreground font-medium">Referral Source</Label>
                <div className="p-3 bg-muted rounded-md">
                  <span className="text-muted-foreground">
                    {controlFramework.referralsource || 'N/A'}
                  </span>
                </div>
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

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  if (returnTo) {
                    navigate(`${returnTo}?fromDetail=control-framework`);
                  } else {
                    navigate(-1);
                  }
                }}
              >
                Back to History
              </Button>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Edit Control Framework
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}