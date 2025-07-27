import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function ControlFrameworkHistory() {
  const [selectedLaw, setSelectedLaw] = useState<number>(0);

  const lawsData = [
    {
      id: 1,
      title: "GDPR Compliance",
      domain: "Data Protection",
      activity: "Data Processing",
      market: "European Union",
      detail: "General Data Protection Regulation compliance requirements",
      countryApplied: "EU",
      referralSource: "European Commission",
      context: "This regulation applies to all organizations processing personal data of EU residents",
      description: "GDPR establishes comprehensive data protection rules for organizations handling personal data within the EU jurisdiction."
    },
    {
      id: 2,
      title: "SOX Compliance",
      domain: "Financial Reporting",
      activity: "Financial Operations",
      market: "United States",
      detail: "Sarbanes-Oxley Act compliance for financial reporting",
      countryApplied: "USA",
      referralSource: "SEC",
      context: "Applies to all publicly traded companies in the United States",
      description: "SOX requires companies to maintain accurate financial records and implement internal controls over financial reporting."
    },
    {
      id: 3,
      title: "ISO 27001",
      domain: "Information Security",
      activity: "Security Management",
      market: "Global",
      detail: "Information Security Management System standards",
      countryApplied: "International",
      referralSource: "ISO Organization",
      context: "International standard for information security management systems",
      description: "ISO 27001 provides a framework for establishing, implementing, maintaining and continually improving an information security management system."
    }
  ];

  return (
    <div className="flex-1 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-card-foreground">Control Framework History</h1>
        <div className="flex space-x-2">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            Save Changes
          </Button>
          <Button variant="destructive">
            Delete
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-6 h-[calc(100vh-200px)]">
        {/* Left Panel - Laws List */}
        <div className="w-1/3">
          <Card className="bg-card h-full">
            <CardHeader>
              <CardTitle className="text-card-foreground font-bold">Laws and Regulations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-2 p-4">
                {lawsData.map((law, index) => (
                  <div
                    key={law.id}
                    className={`p-3 rounded-md cursor-pointer transition-colors ${
                      selectedLaw === index
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80 text-card-foreground"
                    }`}
                    onClick={() => setSelectedLaw(index)}
                  >
                    <div className="font-medium">{law.title}</div>
                    <div className="text-sm opacity-70">{law.domain}</div>
                  </div>
                ))}
              </div>
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
                    <div className="text-card-foreground">{lawsData[selectedLaw].domain}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-1">Activity</label>
                    <div className="text-card-foreground">{lawsData[selectedLaw].activity}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-1">Market</label>
                    <div className="text-card-foreground">{lawsData[selectedLaw].market}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-1">Country Applied</label>
                    <div className="text-card-foreground">{lawsData[selectedLaw].countryApplied}</div>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-card-foreground mb-1">Detail</label>
                    <div className="text-card-foreground">{lawsData[selectedLaw].detail}</div>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-card-foreground mb-1">Referral Source</label>
                    <div className="text-card-foreground">{lawsData[selectedLaw].referralSource}</div>
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
                      defaultValue={lawsData[selectedLaw].context}
                      className="w-full"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-card-foreground mb-1">Description</label>
                    <Textarea 
                      defaultValue={lawsData[selectedLaw].description}
                      className="w-full h-32 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-6">
                <Button 
                  variant="outline"
                  disabled={selectedLaw === 0}
                  onClick={() => setSelectedLaw(Math.max(0, selectedLaw - 1))}
                >
                  Previous
                </Button>
                <Button 
                  variant="outline"
                  disabled={selectedLaw === lawsData.length - 1}
                  onClick={() => setSelectedLaw(Math.min(lawsData.length - 1, selectedLaw + 1))}
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}