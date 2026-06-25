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
  Badge,
} from "@/components/ui";
import { Loader2, Check, Trash2, Star } from "lucide-react";
import { format } from "date-fns";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const supabase = createBrowserClient();

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reviews")
      .select(`
        id,
        rating,
        comment,
        is_approved,
        created_at,
        products ( name ),
        user:profiles ( full_name )
      `)
      .order("created_at", { ascending: false });

    if (data) setReviews(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleApprove = async (id: string) => {
    setActingId(id);
    const { error } = await supabase.from("reviews").update({ is_approved: true }).eq("id", id);
    if (!error) {
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_approved: true } : r))
      );
    } else {
      alert("Failed to approve review.");
    }
    setActingId(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this review?")) {
      setActingId(id);
      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (!error) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
      } else {
        alert("Failed to delete review.");
      }
      setActingId(null);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex text-accent-gold gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            fill={star <= rating ? "currentColor" : "none"}
            className={star <= rating ? "text-accent-gold" : "text-foreground dark:text-white/20"}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-surface/80 to-surface/40 border border-accent-gold/10 px-6 md:px-10 py-8 rounded-2xl">
        <h1 className="text-3xl font-heading font-bold text-foreground dark:text-white mb-2">Review Moderation</h1>
        <p className="text-muted">Approve or remove customer reviews for products in catalog.</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="animate-spin text-accent-gold" size={32} />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted py-8">
                    No reviews found.
                  </TableCell>
                </TableRow>
              )}
              {reviews.map((rev) => (
                <TableRow key={rev.id} className="hover:bg-black/5 dark:bg-white/5">
                  <TableCell className="font-medium text-foreground dark:text-white">
                    {rev.user?.full_name || "Guest Customer"}
                  </TableCell>
                  <TableCell className="text-muted font-medium">
                    {rev.products?.name || "Unknown Product"}
                  </TableCell>
                  <TableCell>{renderStars(rev.rating)}</TableCell>
                  <TableCell className="text-foreground dark:text-white max-w-xs truncate text-xs">
                    {rev.comment || <span className="text-muted italic">No comment provided</span>}
                  </TableCell>
                  <TableCell className="text-muted text-xs">
                    {format(new Date(rev.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    {rev.is_approved ? (
                      <Badge variant="success">Approved</Badge>
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    {!rev.is_approved && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-success hover:bg-success/15 hover:text-success"
                        disabled={actingId === rev.id}
                        onClick={() => handleApprove(rev.id)}
                      >
                        <Check size={16} />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-error hover:bg-error/15 hover:text-error"
                      disabled={actingId === rev.id}
                      onClick={() => handleDelete(rev.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
