"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Input,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui";
import { Loader2, Save, ArrowUpDown, History } from "lucide-react";
import { format } from "date-fns";

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [stockChanges, setStockChanges] = useState<Record<string, number>>({});
  const [reasonInputs, setReasonInputs] = useState<Record<string, string>>({});
  const supabase = createBrowserClient();

  const fetchData = async () => {
    setLoading(true);
    const [prodRes, logRes] = await Promise.all([
      supabase
        .from("products")
        .select("id, name, sku, stock_quantity, regular_price, categories(name)")
        .order("name"),
      supabase
        .from("inventory_logs")
        .select("*, products(name)")
        .order("created_at", { ascending: false })
        .limit(30),
    ]);

    if (prodRes.data) {
      setProducts(prodRes.data);
      // Initialize stock changes and reasons
      const initialChanges: Record<string, number> = {};
      const initialReasons: Record<string, string> = {};
      prodRes.data.forEach((p) => {
        initialChanges[p.id] = p.stock_quantity || 0;
        initialReasons[p.id] = "Restock / Adjust";
      });
      setStockChanges(initialChanges);
      setReasonInputs(initialReasons);
    }
    if (logRes.data) setLogs(logRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStockValueChange = (id: string, val: number) => {
    setStockChanges((prev) => ({
      ...prev,
      [id]: Math.max(0, val),
    }));
  };

  const handleReasonChange = (id: string, val: string) => {
    setReasonInputs((prev) => ({
      ...prev,
      [id]: val,
    }));
  };

  const saveStockChange = async (id: string, currentStock: number) => {
    const newStock = stockChanges[id];
    const diff = newStock - currentStock;
    if (diff === 0) return;

    setUpdatingId(id);

    try {
      // 1. Update product stock level
      const { error: prodErr } = await supabase
        .from("products")
        .update({
          stock_quantity: newStock,
          stock_status: newStock > 0 ? "in_stock" : "out_of_stock",
        })
        .eq("id", id);

      if (prodErr) throw prodErr;

      // 2. Insert into inventory log
      const { error: logErr } = await supabase.from("inventory_logs").insert({
        product_id: id,
        quantity_changed: diff,
        reason: reasonInputs[id] || "Manual inventory adjustment",
      });

      if (logErr) throw logErr;

      // Refresh list
      await fetchData();
    } catch (err) {
      console.error("Failed to update stock:", err);
      alert("Error updating inventory. Check permissions/logs.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-surface/80 to-surface/40 border border-accent-gold/10 px-6 md:px-10 py-8 rounded-2xl">
        <h1 className="text-3xl font-heading font-bold text-foreground dark:text-white mb-2">Inventory Management</h1>
        <p className="text-muted">Monitor stock levels, perform adjustments, and view audit history logs.</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="animate-spin text-accent-gold" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Inventory Table */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Catalog Stock Levels</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Stock Level</TableHead>
                      <TableHead>Reason for Change</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((prod) => {
                      const hasChanged = stockChanges[prod.id] !== prod.stock_quantity;
                      return (
                        <TableRow key={prod.id}>
                          <TableCell>
                            <div className="font-medium text-foreground dark:text-white">{prod.name}</div>
                            <div className="text-xs text-muted">SKU: {prod.sku || "N/A"}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => handleStockValueChange(prod.id, stockChanges[prod.id] - 1)}
                              >
                                -
                              </Button>
                              <Input
                                type="number"
                                className="w-20 text-center h-8 bg-surface/50 border-border"
                                value={stockChanges[prod.id]}
                                onChange={(e) => handleStockValueChange(prod.id, parseInt(e.target.value) || 0)}
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => handleStockValueChange(prod.id, stockChanges[prod.id] + 1)}
                              >
                                +
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="text"
                              className="h-8 bg-surface/30 border-border/50 placeholder-muted text-xs"
                              placeholder="Reason"
                              value={reasonInputs[prod.id] || ""}
                              onChange={(e) => handleReasonChange(prod.id, e.target.value)}
                              disabled={!hasChanged}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant={hasChanged ? "luxury" : "outline"}
                              size="sm"
                              className="gap-1.5"
                              disabled={!hasChanged || updatingId === prod.id}
                              onClick={() => saveStockChange(prod.id, prod.stock_quantity)}
                            >
                              {updatingId === prod.id ? (
                                <Loader2 className="animate-spin" size={14} />
                              ) : (
                                <Save size={14} />
                              )}
                              Save
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Audit Logs */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <History className="text-accent-gold" size={20} />
                <CardTitle>Inventory Audit Logs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {logs.length === 0 && (
                  <p className="text-muted text-sm text-center py-8">No audit logs found.</p>
                )}
                {logs.map((log) => {
                  const isPositive = log.quantity_changed > 0;
                  return (
                    <div
                      key={log.id}
                      className="p-4 rounded-xl border border-border/50 bg-black/5 dark:bg-white/5 space-y-2 text-xs"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-foreground dark:text-white truncate max-w-[180px]">
                          {log.products?.name || "Deleted Product"}
                        </span>
                        <Badge variant={isPositive ? "success" : "destructive"}>
                          {isPositive ? "+" : ""}
                          {log.quantity_changed} items
                        </Badge>
                      </div>
                      <p className="text-muted">{log.reason || "Manual Adjust"}</p>
                      <p className="text-[10px] text-muted text-right">
                        {format(new Date(log.created_at), "MMM d, h:mm a")}
                      </p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
