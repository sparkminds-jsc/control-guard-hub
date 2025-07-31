import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function LawRegulationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lawRegulation, setLawRegulation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Get return URL from query params
  const urlParams = new URLSearchParams(window.location.search);
  const returnTo = urlParams.get('returnTo');

  useEffect(() => {
    loadLawRegulationDetail();
  }, [id]);

  const loadLawRegulationDetail = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('laws_and_regulations')
        .select(`
          *,
          domains (name),
          activities (name),
          markets (name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setLawRegulation(data);
    } catch (error) {
      console.error('Error loading law regulation detail:', error);
      toast({
        title: "Error",
        description: "Failed to load law regulation details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => {
                if (returnTo) {
                  navigate(`${returnTo}?fromDetail=law-regulation`);
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

  if (!lawRegulation) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => {
                if (returnTo) {
                  navigate(`${returnTo}?fromDetail=law-regulation`);
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
          <div className="text-center">Law regulation not found.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => {
              if (returnTo) {
                navigate(`${returnTo}?fromDetail=law-regulation`);
              } else {
                navigate(-1);
              }
            }}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-card-foreground">Law & Regulation Details</h1>
        </div>

        {/* Law Regulation Detail Card */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground text-xl">{lawRegulation.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-card-foreground font-medium">Law/Regulation Name</Label>
                <div className="p-3 bg-muted rounded-md">
                  <span className="text-muted-foreground">{lawRegulation.name}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-card-foreground font-medium">Country</Label>
                <div className="p-3 bg-muted rounded-md">
                  <span className="text-muted-foreground">{lawRegulation.country}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-card-foreground font-medium">Description</Label>
              <div className="p-3 bg-muted rounded-md">
                <span className="text-muted-foreground">{lawRegulation.description}</span>
              </div>
            </div>

            {/* Source */}
            <div className="space-y-2">
              <Label className="text-card-foreground font-medium">Source</Label>
              <div className="p-3 bg-muted rounded-md">
                <span className="text-muted-foreground">{lawRegulation.source}</span>
              </div>
            </div>

            <Separator />

            {/* Associated Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-card-foreground font-medium">Domain</Label>
                <div className="p-3 bg-muted rounded-md">
                  <span className="text-muted-foreground">
                    {lawRegulation.domains?.name || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-card-foreground font-medium">Activity</Label>
                <div className="p-3 bg-muted rounded-md">
                  <span className="text-muted-foreground">
                    {lawRegulation.activities?.name || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-card-foreground font-medium">Market</Label>
                <div className="p-3 bg-muted rounded-md">
                  <span className="text-muted-foreground">
                    {lawRegulation.markets?.name || 'N/A'}
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
                    {lawRegulation.created_at ? new Date(lawRegulation.created_at).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-card-foreground font-medium">Updated At</Label>
                <div className="p-3 bg-muted rounded-md">
                  <span className="text-muted-foreground">
                    {lawRegulation.updated_at ? new Date(lawRegulation.updated_at).toLocaleString() : 'N/A'}
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
                    navigate(`${returnTo}?fromDetail=law-regulation`);
                  } else {
                    navigate(-1);
                  }
                }}
              >
                Back to History
              </Button>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Edit Law & Regulation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}