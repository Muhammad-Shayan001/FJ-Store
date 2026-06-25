"use client";

import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { Table, Card, CardHeader, CardTitle, CardContent, Button, Input, Badge } from "@/components/ui";
import { Plus, Power, PowerOff } from "lucide-react";
import { format } from "date-fns";

export default function CouponsClient({ initialCoupons }: { initialCoupons: any[] }) {
  const [coupons, setCoupons] = useState<any[]>(initialCoupons);
  const [loading, setLoading] = useState(false);
  const supabase = createBrowserClient();

  // Form states
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percentage" | "fixed" | "free_shipping">("percentage");
  const [value, setValue] = useState("");
  const [minOrder, setMinOrder] = useState("");

  const handleCreate = async () => {
    if (!code || !value) return;
    setLoading(true);

    const newCoupon = {
      code: code.toUpperCase(),
      discount_type: type,
      discount_value: parseFloat(value) || 0,
      min_order_amount: parseFloat(minOrder) || 0,
      is_active: true
    };

    const { data, error } = await supabase
      .from("coupons")
      .insert([newCoupon])
      .select()
      .single();

    if (!error && data) {
      setCoupons([data, ...coupons]);
      setCode("");
      setValue("");
      setMinOrder("");
    } else {
      alert("Failed to create coupon. Code might already exist.");
    }
    setLoading(false);
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("coupons")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (!error) {
      setCoupons(coupons.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c));
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Create Coupon</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-muted">Code</label>
              <Input 
                placeholder="e.g. SUMMER20" 
                value={code} 
                onChange={(e) => setCode(e.target.value)} 
                className="uppercase"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted">Discount Type</label>
              <select 
                className="w-full bg-surface border border-border rounded-lg p-2 text-foreground dark:text-white outline-none"
                value={type}
                onChange={(e) => setType(e.target.value as any)}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
                <option value="free_shipping">Free Shipping</option>
              </select>
            </div>
            {type !== "free_shipping" && (
              <div className="space-y-2">
                <label className="text-sm text-muted">Discount Value</label>
                <Input 
                  type="number" 
                  placeholder={type === "percentage" ? "e.g. 20" : "e.g. 15.00"} 
                  value={value} 
                  onChange={(e) => setValue(e.target.value)} 
                />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm text-muted">Minimum Order Amount ($)</label>
              <Input 
                type="number" 
                placeholder="e.g. 50" 
                value={minOrder} 
                onChange={(e) => setMinOrder(e.target.value)} 
              />
            </div>
            <Button className="w-full mt-4" onClick={handleCreate} disabled={loading}>
              <Plus size={18} className="mr-2" />
              {loading ? "Creating..." : "Create Coupon"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Existing Coupons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase text-muted">
                    <th className="p-3 font-medium">Code</th>
                    <th className="p-3 font-medium">Type</th>
                    <th className="p-3 font-medium">Value</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => (
                    <tr key={coupon.id} className="border-b border-border/50 hover:bg-black/5 dark:bg-white/5 transition-colors">
                      <td className="p-3 text-sm text-foreground dark:text-white font-mono font-medium">
                        {coupon.code}
                      </td>
                      <td className="p-3 text-sm text-muted capitalize">
                        {coupon.discount_type.replace("_", " ")}
                      </td>
                      <td className="p-3 text-sm text-foreground dark:text-white">
                        {coupon.discount_type === "percentage" ? `${coupon.discount_value}%` : 
                         coupon.discount_type === "fixed" ? `$${coupon.discount_value}` : 
                         "N/A"}
                      </td>
                      <td className="p-3 text-sm">
                        <Badge variant={coupon.is_active ? "success" : "outline"}>
                          {coupon.is_active ? "Active" : "Disabled"}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={coupon.is_active ? "text-warning hover:bg-warning/10" : "text-success hover:bg-success/10"}
                          onClick={() => toggleActive(coupon.id, coupon.is_active)}
                        >
                          {coupon.is_active ? <PowerOff size={16} /> : <Power size={16} />}
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {coupons.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-muted">
                        No coupons created yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
