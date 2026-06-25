"use client";

import { useState } from "react";
import { Button, Card, CardContent } from "@/components/ui";
import { Sparkles, Download, Loader2 } from "lucide-react";

export default function AnalyticsReports() {
  const [reportType, setReportType] = useState("revenue_summary");
  const [dateRange, setDateRange] = useState("30");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);

  const generateReport = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/analytics-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportType,
          dateRange,
        }),
      });
      const data = await res.json();
      setReport(data);
    } catch (err) {
      alert("Failed to generate report");
    }
    setLoading(false);
  };

  const downloadPDF = () => {
    alert("PDF download would be implemented with a library like jsPDF");
  };

  const downloadCSV = () => {
    alert("CSV export would include report data in spreadsheet format");
  };

  if (!report) {
    return (
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="text-accent-gold font-heading mb-4">📊 AI Analytics Reports</h3>

          <div className="space-y-2">
            <label className="text-sm text-foreground dark:text-white">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-surface/50 border border-border text-foreground dark:text-white focus:outline-none focus:border-accent-gold"
            >
              <option value="revenue_summary">Revenue Summary</option>
              <option value="product_performance">Product Performance</option>
              <option value="user_growth">User Growth</option>
              <option value="inventory">Inventory Status</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-foreground dark:text-white">Date Range (Days)</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-surface/50 border border-border text-foreground dark:text-white focus:outline-none focus:border-accent-gold"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="365">Last Year</option>
            </select>
          </div>

          <Button
            variant="luxury"
            onClick={generateReport}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Sparkles size={16} className="mr-2" /> Generate Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-accent-gold font-heading text-lg">{report.title}</h3>
              <p className="text-muted text-sm mt-1">{report.summary}</p>
            </div>
            <button onClick={() => setReport(null)} className="text-muted hover:text-foreground dark:text-white">
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {report.key_insights?.map((insight: string, i: number) => (
              <div key={i} className="bg-surface/50 p-4 rounded-lg border border-accent-gold/20">
                <p className="text-foreground dark:text-white text-sm">✓ {insight}</p>
              </div>
            ))}
          </div>

          <div className="bg-surface/50 p-4 rounded-lg mb-6">
            <h4 className="text-accent-blue font-heading mb-3">Detailed Analysis</h4>
            <div
              className="text-foreground dark:text-white text-sm prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: report.detailed_report }}
            />
          </div>

          {report.recommendations && report.recommendations.length > 0 && (
            <div className="bg-accent-gold/5 border border-accent-gold/20 rounded-lg p-4 mb-6">
              <h4 className="text-accent-gold font-heading mb-3">💡 Recommendations</h4>
              <ul className="space-y-2">
                {report.recommendations.map((rec: string, i: number) => (
                  <li key={i} className="text-foreground dark:text-white text-sm flex gap-2">
                    <span className="text-accent-gold">→</span> {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadPDF} className="flex-1">
              <Download size={16} className="mr-2" /> Download PDF
            </Button>
            <Button variant="outline" onClick={downloadCSV} className="flex-1">
              <Download size={16} className="mr-2" /> Export CSV
            </Button>
            <Button variant="luxury" onClick={() => setReport(null)}>
              Generate New
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
