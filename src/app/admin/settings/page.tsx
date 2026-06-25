"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Badge,
} from "@/components/ui";
import { Loader2, Save, Store, Mail, Phone, Globe, Shield, RefreshCw } from "lucide-react";

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [storeName, setStoreName] = useState("FJ Store Pakistan");
  const [email, setEmail] = useState("support@fjstore.pk");
  const [phone, setPhone] = useState("+92 300 1234567");
  const [currency, setCurrency] = useState("PKR");
  const [shippingCost, setShippingCost] = useState("15");
  const [taxRate, setTaxRate] = useState("0");
  const [maintenance, setMaintenance] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert("Settings saved successfully!");
    }, 1000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-surface/80 to-surface/40 border border-accent-gold/10 px-6 md:px-10 py-8 rounded-2xl">
        <h1 className="text-3xl font-heading font-bold text-foreground dark:text-white mb-2">Store Settings</h1>
        <p className="text-muted">Configure store parameters, profile settings, and general preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {/* Left Side: General Profile */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <Store className="text-accent-gold" size={20} />
              <CardTitle>General Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">
                    Store Name
                  </label>
                  <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">
                    Store Currency
                  </label>
                  <select
                    className="w-full bg-surface/50 border border-border rounded-md h-10 px-3 text-foreground dark:text-white focus:outline-none focus:border-accent-gold text-sm"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    <option value="PKR">PKR (₨)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">
                    Contact Email
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <Input
                      type="email"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">
                    Support Hotline
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <Input
                      type="text"
                      className="pl-10"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <Globe className="text-accent-gold" size={20} />
              <CardTitle>Shipping & Tax Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">
                    Flat Shipping Fee ({currency})
                  </label>
                  <Input
                    type="number"
                    value={shippingCost}
                    onChange={(e) => setShippingCost(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">
                    Standard Tax Rate (%)
                  </label>
                  <Input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Operations & Maintenance */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <Shield className="text-accent-gold" size={20} />
              <CardTitle>System Operations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="flex justify-between items-center py-2">
                <div>
                  <p className="font-semibold text-foreground dark:text-white mb-0.5">Maintenance Mode</p>
                  <p className="text-muted">Temporarily disable storefront</p>
                </div>
                <button
                  onClick={() => setMaintenance(!maintenance)}
                  className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                    maintenance ? "bg-accent-gold" : "bg-black/10 dark:bg-white/10"
                  }`}
                >
                  <div
                    className={`bg-black w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                      maintenance ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="border-t border-border/50 pt-4">
                <Button
                  variant="luxury"
                  className="w-full gap-2"
                  disabled={saving}
                  onClick={handleSave}
                >
                  {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  Save Configuration
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted">
              <div className="flex justify-between">
                <span>API Version</span>
                <span className="text-foreground dark:text-white font-medium">v1.2.6</span>
              </div>
              <div className="flex justify-between">
                <span>Database Client</span>
                <span className="text-foreground dark:text-white font-medium">Supabase Auth / Postgres</span>
              </div>
              <div className="flex justify-between">
                <span>Environment</span>
                <span className="text-foreground dark:text-white font-medium uppercase text-[10px]">
                  Production SSR
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
