import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Domain {
  id: string;
  name: string;
}

interface Activity {
  id: string;
  name: string;
}

interface Market {
  id: string;
  name: string;
}

interface LawRegulation {
  id: string;
  name: string;
}

interface ControlFramework {
  id?: string;
  context: string;
  description: string;
  countryapplied: string;
  referralsource: string;
  riskmanagement: string;
  id_domain: string;
  id_activities: string;
  id_markets: string;
  id_laws_and_regulations: string;
}

interface ControlFrameworkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  framework?: ControlFramework | null;
  onSuccess: () => void;
}

export default function ControlFrameworkModal({ 
  open, 
  onOpenChange, 
  framework, 
  onSuccess 
}: ControlFrameworkModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [laws, setLaws] = useState<LawRegulation[]>([]);
  
  const [formData, setFormData] = useState<ControlFramework>({
    context: "",
    description: "",
    countryapplied: "",
    referralsource: "",
    riskmanagement: "",
    id_domain: "",
    id_activities: "",
    id_markets: "",
    id_laws_and_regulations: ""
  });

  useEffect(() => {
    if (open) {
      loadOptions();
      if (framework) {
        setFormData({
          id: framework.id,
          context: framework.context || "",
          description: framework.description || "",
          countryapplied: framework.countryapplied || "",
          referralsource: framework.referralsource || "",
          riskmanagement: framework.riskmanagement || "",
          id_domain: framework.id_domain || "",
          id_activities: framework.id_activities || "",
          id_markets: framework.id_markets || "",
          id_laws_and_regulations: framework.id_laws_and_regulations || ""
        });
      } else {
        setFormData({
          context: "",
          description: "",
          countryapplied: "",
          referralsource: "",
          riskmanagement: "",
          id_domain: "",
          id_activities: "",
          id_markets: "",
          id_laws_and_regulations: ""
        });
      }
    }
  }, [open, framework]);

  const loadOptions = async () => {
    try {
      const [domainsRes, activitiesRes, marketsRes, lawsRes] = await Promise.all([
        supabase.from('domains').select('id, name').order('name'),
        supabase.from('activities').select('id, name').order('name'),
        supabase.from('markets').select('id, name').order('name'),
        supabase.from('laws_and_regulations').select('id, name').order('name')
      ]);

      setDomains(domainsRes.data || []);
      setActivities(activitiesRes.data || []);
      setMarkets(marketsRes.data || []);
      setLaws(lawsRes.data || []);
    } catch (error) {
      console.error('Error loading options:', error);
      toast({
        title: "Error",
        description: "Failed to load form options",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSubmit = {
        context: formData.context,
        description: formData.description,
        countryapplied: formData.countryapplied,
        referralsource: formData.referralsource,
        riskmanagement: formData.riskmanagement,
        id_domain: formData.id_domain || null,
        id_activities: formData.id_activities || null,
        id_markets: formData.id_markets || null,
        id_laws_and_regulations: formData.id_laws_and_regulations || null,
        updated_at: new Date().toISOString()
      };

      let result;
      if (framework?.id) {
        // Update existing framework
        result = await supabase
          .from('control_framework')
          .update(dataToSubmit)
          .eq('id', framework.id);
      } else {
        // Create new framework
        result = await supabase
          .from('control_framework')
          .insert(dataToSubmit);
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: framework?.id 
          ? "Control framework updated successfully" 
          : "Control framework created successfully"
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving control framework:', error);
      toast({
        title: "Error",
        description: "Failed to save control framework",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {framework?.id ? "Edit Control Framework" : "Add New Control Framework"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="domain">Domain</Label>
              <Select value={formData.id_domain} onValueChange={(value) => setFormData({...formData, id_domain: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select domain" />
                </SelectTrigger>
                <SelectContent>
                  {domains.map((domain) => (
                    <SelectItem key={domain.id} value={domain.id}>
                      {domain.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="activity">Activity</Label>
              <Select value={formData.id_activities} onValueChange={(value) => setFormData({...formData, id_activities: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select activity" />
                </SelectTrigger>
                <SelectContent>
                  {activities.map((activity) => (
                    <SelectItem key={activity.id} value={activity.id}>
                      {activity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="market">Market</Label>
              <Select value={formData.id_markets} onValueChange={(value) => setFormData({...formData, id_markets: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select market" />
                </SelectTrigger>
                <SelectContent>
                  {markets.map((market) => (
                    <SelectItem key={market.id} value={market.id}>
                      {market.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="law">Laws & Regulations</Label>
              <Select value={formData.id_laws_and_regulations} onValueChange={(value) => setFormData({...formData, id_laws_and_regulations: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select law" />
                </SelectTrigger>
                <SelectContent>
                  {laws.map((law) => (
                    <SelectItem key={law.id} value={law.id}>
                      {law.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="countryapplied">Country Applied</Label>
              <Input
                id="countryapplied"
                value={formData.countryapplied}
                onChange={(e) => setFormData({...formData, countryapplied: e.target.value})}
                placeholder="Enter country"
              />
            </div>

            <div>
              <Label htmlFor="referralsource">Referral Source</Label>
              <Input
                id="referralsource"
                value={formData.referralsource}
                onChange={(e) => setFormData({...formData, referralsource: e.target.value})}
                placeholder="Enter referral source"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="context">Context</Label>
            <Textarea
              id="context"
              value={formData.context}
              onChange={(e) => setFormData({...formData, context: e.target.value})}
              placeholder="Enter context"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Enter description"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="riskmanagement">Risk Management</Label>
            <Textarea
              id="riskmanagement"
              value={formData.riskmanagement}
              onChange={(e) => setFormData({...formData, riskmanagement: e.target.value})}
              placeholder="Enter risk management details"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : framework?.id ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}