
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Building2, ExternalLink, Globe, Hash, Calendar, User, MapPin, Briefcase, TrendingUp, Scale } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";

export default function CompanyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [company, setCompany] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [domains, setDomains] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [markets, setMarkets] = useState<any[]>([]);
  const [lawsAndRegulations, setLawsAndRegulations] = useState<any[]>([]);
  const [controlFramework, setControlFramework] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingDetails, setIsGettingDetails] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCompanyData();
    }
  }, [id]);

  const fetchCompanyData = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching company data for ID:", id);
      
      // Fetch company data
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .select("*")
        .eq("id", id)
        .single();

      if (companyError) {
        console.error("Error fetching company:", companyError);
        toast.error("Failed to fetch company data");
        return;
      }

      console.log("Company data fetched:", companyData);
      setCompany(companyData);

      // Fetch user data
      const { data: userData } = await supabase
        .from("users")
        .select("full_name, email")
        .eq("email", "an@sparkminds.net")
        .single();

      setUser(userData);

      // Fetch related data
      await Promise.all([
        fetchDomains(),
        fetchActivities(), 
        fetchMarkets(),
        fetchLawsAndRegulations(),
        fetchControlFramework()
      ]);
      
    } catch (error) {
      console.error("Error in fetchCompanyData:", error);
      toast.error("Failed to fetch company data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDomains = async () => {
    const { data } = await supabase
      .from("domains")
      .select("*")
      .eq("company_id", id);
    setDomains(data || []);
  };

  const fetchActivities = async () => {
    const { data } = await supabase
      .from("activities")
      .select("*")
      .eq("company_id", id);
    setActivities(data || []);
  };

  const fetchMarkets = async () => {
    const { data } = await supabase
      .from("markets")
      .select("*")
      .eq("company_id", id);
    setMarkets(data || []);
  };

  const fetchLawsAndRegulations = async () => {
    const { data } = await supabase
      .from("laws_and_regulations")
      .select(`
        *,
        domains!laws_and_regulations_domain_id_fkey(name),
        activities!laws_and_regulations_activity_id_fkey(name),
        markets!laws_and_regulations_market_id_fkey(name)
      `)
      .eq("company_id", id);
    setLawsAndRegulations(data || []);
  };

  const fetchControlFramework = async () => {
    const { data } = await supabase
      .from("control_framework")
      .select(`
        *,
        domains!control_framework_id_domain_fkey(name),
        activities!control_framework_id_activities_fkey(name),
        markets!control_framework_id_markets_fkey(name),
        laws_and_regulations!control_framework_id_laws_and_regulations_fkey(name)
      `)
      .eq("company_id", id);
    setControlFramework(data || []);
  };

  const handleGetCompanyDetails = async () => {
    if (!company || isGettingDetails) return;

    try {
      setIsGettingDetails(true);
      console.log("Starting company detail fetch process...");

      const websiteUrl = encodeURIComponent(company.website_url);
      const companyName = encodeURIComponent(company.name);
      const apiUrl = `https://n8n.sparkminds.net/webhook/6812a814-9d51-43e1-aff8-46bd1b01d4de?websiteUrl=${websiteUrl}&companyName=${companyName}`;
      
      console.log("Calling external API:", apiUrl);
      
      const response = await fetch(apiUrl);
      console.log("API response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      console.log("API response text:", responseText);
      
      let apiData = {};
      if (responseText && responseText.trim() !== '') {
        try {
          apiData = JSON.parse(responseText);
        } catch (parseError) {
          console.error("Error parsing API response:", parseError);
          apiData = {};
        }
      } else {
        console.log("API returned empty response, using empty object");
      }

      // Update company with country if available
      if (apiData && 'country' in apiData) {
        const { error: updateError } = await supabase
          .from("companies")
          .update({ 
            country: (apiData as any).country,
            company_details_fetched: true 
          })
          .eq("id", id);

        if (updateError) {
          console.error("Error updating company:", updateError);
        } else {
          setCompany(prev => ({ 
            ...prev, 
            country: (apiData as any).country,
            company_details_fetched: true 
          }));
        }
      }

      // Process and save domains
      if (apiData && 'domains' in apiData && Array.isArray((apiData as any).domains)) {
        for (const domain of (apiData as any).domains) {
          const { error } = await supabase
            .from("domains")
            .insert({
              company_id: id,
              name: domain,
              created_at: new Date().toISOString()
            });
          if (error) console.error("Error inserting domain:", error);
        }
        await fetchDomains();
      }

      // Process and save activities  
      if (apiData && 'activities' in apiData && Array.isArray((apiData as any).activities)) {
        for (const activity of (apiData as any).activities) {
          const { error } = await supabase
            .from("activities")
            .insert({
              company_id: id,
              name: activity,
              created_at: new Date().toISOString()
            });
          if (error) console.error("Error inserting activity:", error);
        }
        await fetchActivities();
      }

      // Process and save markets
      if (apiData && 'markets' in apiData && Array.isArray((apiData as any).markets)) {
        for (const market of (apiData as any).markets) {
          const { error } = await supabase
            .from("markets")
            .insert({
              company_id: id,
              name: market,
              created_at: new Date().toISOString()
            });
          if (error) console.error("Error inserting market:", error);
        }
        await fetchMarkets();
      }

      toast.success("Company details updated successfully!");
      console.log("Company detail fetch process completed successfully");

    } catch (error) {
      console.error("Error fetching company details:", error);
      toast.error("Failed to fetch company details");
    } finally {
      setIsGettingDetails(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("Back to Companies")}
          </Button>
        </div>
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("Back to Companies")}
          </Button>
        </div>
        <div className="text-center py-8">Company not found</div>
      </div>
    );
  }

  const canFetchDetails = !company.company_details_fetched && !isGettingDetails;

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("Back to Companies")}
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Building2 className="h-8 w-8" />
              {company.name}
            </h1>
            {user && (
              <p className="text-muted-foreground mt-1">
                <User className="h-4 w-4 inline mr-1" />
                Created by: {user.full_name} ({user.email})
              </p>
            )}
          </div>
        </div>
        
        <Button 
          onClick={handleGetCompanyDetails}
          disabled={!canFetchDetails}
          className="min-w-[160px]"
        >
          {isGettingDetails ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent mr-2"></div>
              Getting Details...
            </>
          ) : company.company_details_fetched ? (
            "Details Fetched"
          ) : (
            "Get Company Details"
          )}
        </Button>
      </div>

      {/* Company Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {t("Company Information")}
          </CardTitle>
          <CardDescription>Basic information about the company</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Website:</span>
              <a 
                href={company.website_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
              >
                {company.website_url}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            
            {company.duns_number && (
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">DUNS:</span>
                <span className="text-sm">{company.duns_number}</span>
              </div>
            )}
            
            {company.country && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Country:</span>
                <Badge variant="secondary">{company.country}</Badge>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Created:</span>
              <span className="text-sm">
                {new Date(company.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Domains */}
      {domains.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Business Domains
            </CardTitle>
            <CardDescription>Areas of business operation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {domains.map((domain, index) => (
                <Badge key={index} variant="outline">
                  {domain.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activities */}
      {activities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Business Activities
            </CardTitle>
            <CardDescription>Key business activities and operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {activities.map((activity, index) => (
                <Badge key={index} variant="outline">
                  {activity.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Markets */}
      {markets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Target Markets
            </CardTitle>
            <CardDescription>Markets and regions of operation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {markets.map((market, index) => (
                <Badge key={index} variant="outline">
                  {market.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Laws and Regulations */}
      {lawsAndRegulations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Laws and Regulations
            </CardTitle>
            <CardDescription>Applicable laws and regulations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lawsAndRegulations.map((law, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="font-semibold">{law.name}</h4>
                  {law.description && (
                    <p className="text-sm text-muted-foreground mt-1">{law.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {law.domains && <Badge variant="secondary">{law.domains.name}</Badge>}
                    {law.activities && <Badge variant="secondary">{law.activities.name}</Badge>}
                    {law.markets && <Badge variant="secondary">{law.markets.name}</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Control Framework */}
      {controlFramework.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Control Framework
            </CardTitle>
            <CardDescription>Control framework and compliance measures</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {controlFramework.map((control, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="font-semibold">{control.name}</h4>
                  {control.description && (
                    <p className="text-sm text-muted-foreground mt-1">{control.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {control.domains && <Badge variant="secondary">{control.domains.name}</Badge>}
                    {control.activities && <Badge variant="secondary">{control.activities.name}</Badge>}
                    {control.markets && <Badge variant="secondary">{control.markets.name}</Badge>}
                    {control.laws_and_regulations && <Badge variant="secondary">{control.laws_and_regulations.name}</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {domains.length === 0 && activities.length === 0 && markets.length === 0 && lawsAndRegulations.length === 0 && controlFramework.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              No additional details available. Click "Get Company Details" to fetch more information.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
