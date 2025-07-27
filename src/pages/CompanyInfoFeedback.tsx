import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function CompanyInfoFeedback() {
  return (
    <div className="flex-1 space-y-6 p-6">
      
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground font-bold">Submit Feedback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="feedback" className="text-card-foreground font-medium">Your Feedback</Label>
            <Textarea
              id="feedback"
              placeholder="Please provide your feedback about company information..."
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
          <CardTitle className="text-card-foreground font-bold">Previous Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border border-border rounded-md p-4 bg-card">
              <div className="flex justify-between items-start mb-2">
                <span className="text-card-foreground font-medium">Feedback #001</span>
                <span className="text-card-foreground text-sm">2024-01-18</span>
              </div>
              <p className="text-card-foreground mb-2">Company information needs to be updated with latest regulatory requirements...</p>
              <div className="flex space-x-2">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Edit
                </Button>
                <Button size="sm" variant="destructive" className="bg-destructive text-destructive-foreground">
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}