import { useState } from "react";
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
import { Trash2 } from "lucide-react";
import { useParams } from "react-router-dom";

export default function CompanyDetails() {
  const { id } = useParams();
  const [showDetails, setShowDetails] = useState(false);
  const [showLawsRegulations, setShowLawsRegulations] = useState(false);
  const [domains, setDomains] = useState(["Technology", "Healthcare", "Finance"]);
  const [activities, setActivities] = useState(["Software Development", "Data Processing", "Customer Support"]);
  const [markets, setMarkets] = useState(["North America", "Europe", "Asia Pacific"]);

  const removeDomain = (index: number) => {
    setDomains(domains.filter((_, i) => i !== index));
  };

  const removeActivity = (index: number) => {
    setActivities(activities.filter((_, i) => i !== index));
  };

  const removeMarket = (index: number) => {
    setMarkets(markets.filter((_, i) => i !== index));
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
              <div className="text-card-foreground mt-1">Company ABC</div>
            </div>
            <div>
              <Label className="text-card-foreground font-medium">Website URL</Label>
              <div className="text-card-foreground mt-1">www.abc.com</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-card-foreground font-medium">Country</Label>
              <div className="text-card-foreground mt-1">USA</div>
            </div>
            <div>
              <Label className="text-card-foreground font-medium">DUNS Number</Label>
              <div className="text-card-foreground mt-1">123456789</div>
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
              <Label className="text-card-foreground font-medium text-base">Domains</Label>
              <div className="space-y-2 mt-2">
                {domains.map((domain, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={domain}
                      onChange={(e) => {
                        const newDomains = [...domains];
                        newDomains[index] = e.target.value;
                        setDomains(newDomains);
                      }}
                      className="bg-card border-border"
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="bg-destructive text-destructive-foreground h-8 w-8"
                      onClick={() => removeDomain(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-card-foreground font-medium text-base">Activities</Label>
              <div className="space-y-2 mt-2">
                {activities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={activity}
                      onChange={(e) => {
                        const newActivities = [...activities];
                        newActivities[index] = e.target.value;
                        setActivities(newActivities);
                      }}
                      className="bg-card border-border"
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="bg-destructive text-destructive-foreground h-8 w-8"
                      onClick={() => removeActivity(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-card-foreground font-medium text-base">Markets</Label>
              <div className="space-y-2 mt-2">
                {markets.map((market, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={market}
                      onChange={(e) => {
                        const newMarkets = [...markets];
                        newMarkets[index] = e.target.value;
                        setMarkets(newMarkets);
                      }}
                      className="bg-card border-border"
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="bg-destructive text-destructive-foreground h-8 w-8"
                      onClick={() => removeMarket(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => setShowLawsRegulations(true)}
            >
              Get Laws and Regulation
            </Button>
          </CardContent>
        </Card>
      )}

      {showLawsRegulations && (
        <Card className="bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-card-foreground font-bold">Laws and Regulation</CardTitle>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Add Laws and Regulation
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="domain-select" className="text-card-foreground font-medium">Domain</Label>
                <Select>
                  <SelectTrigger className="bg-card border-border">
                    <SelectValue placeholder="Select domain" />
                  </SelectTrigger>
                  <SelectContent>
                    {domains.map((domain, index) => (
                      <SelectItem key={index} value={domain}>{domain}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="activity-select" className="text-card-foreground font-medium">Activity</Label>
                <Select>
                  <SelectTrigger className="bg-card border-border">
                    <SelectValue placeholder="Select activity" />
                  </SelectTrigger>
                  <SelectContent>
                    {activities.map((activity, index) => (
                      <SelectItem key={index} value={activity}>{activity}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="market-select" className="text-card-foreground font-medium">Market</Label>
                <Select>
                  <SelectTrigger className="bg-card border-border">
                    <SelectValue placeholder="Select market" />
                  </SelectTrigger>
                  <SelectContent>
                    {markets.map((market, index) => (
                      <SelectItem key={index} value={market}>{market}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="laws-regulation" className="text-card-foreground font-medium">Laws and Regulation</Label>
              <Textarea
                id="laws-regulation"
                placeholder="Enter laws and regulation"
                className="bg-card border-border"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="detail" className="text-card-foreground font-medium">Detail</Label>
              <Textarea
                id="detail"
                placeholder="Enter detail"
                className="bg-card border-border"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="country-applied" className="text-card-foreground font-medium">Country Applied</Label>
                <Input
                  id="country-applied"
                  placeholder="Enter country applied"
                  className="bg-card border-border"
                />
              </div>
              <div>
                <Label htmlFor="referral-source" className="text-card-foreground font-medium">Referral Source</Label>
                <Textarea
                  id="referral-source"
                  placeholder="Enter referral source"
                  className="bg-card border-border"
                  rows={2}
                />
              </div>
            </div>
          </CardContent>
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
    </div>
  );
}