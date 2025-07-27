import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function CompanyLawsFeedback() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <h1 className="text-foreground font-bold">Company Laws Feedback</h1>
      
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground font-bold">Submit Legal Feedback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="legal-feedback" className="text-card-foreground font-medium">Legal Compliance Feedback</Label>
            <Textarea
              id="legal-feedback"
              placeholder="Please provide feedback about legal compliance and regulatory matters..."
              className="bg-card border-border"
              rows={6}
            />
          </div>
          
          <div className="flex space-x-4">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Submit Feedback
            </Button>
            <Button variant="outline" className="border-border text-card-foreground">
              Save as Draft
            </Button>
            <Button variant="destructive" className="bg-destructive text-destructive-foreground">
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground font-bold">Legal Compliance History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border border-border rounded-md p-4 bg-card">
              <div className="flex justify-between items-start mb-2">
                <span className="text-card-foreground font-medium">Legal Review #001</span>
                <span className="text-card-foreground text-sm">2024-01-17</span>
              </div>
              <p className="text-card-foreground mb-2">Review of SOX compliance requirements and internal controls...</p>
              <div className="flex space-x-2">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  View Details
                </Button>
                <Button size="sm" variant="destructive" className="bg-destructive text-destructive-foreground">
                  Archive
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}