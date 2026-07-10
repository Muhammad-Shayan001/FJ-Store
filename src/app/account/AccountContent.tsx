"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createBrowserClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Badge,
  Input
} from "@/components/ui";
import { 
  Package, MapPin, User, LogOut, Loader2, AlertCircle, Heart, Star, Bell, Trash2, Eye 
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useNotifications } from "@/lib/hooks/useNotifications";

type ProductReference = {
  name?: string;
  slug?: string;
  categories?: { slug?: string };
  subcategories?: { slug?: string };
  product_images?: { url: string }[];
};

type OrderItem = {
  id: string;
  quantity: number;
  price_at_time: number | string;
  products?: ProductReference;
  product_variants?: { name?: string; value?: string };
};

type Order = {
  id: string;
  created_at: string;
  total: number | string;
  subtotal: number | string;
  shipping_cost: number | string;
  tax: number | string;
  discount: number | string;
  status: string;
  order_items: OrderItem[];
  addresses?: Address;
};

type Address = {
  id: string;
  title?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  is_default?: boolean;
};

type WishlistItem = {
  id: string;
  products?: {
    name?: string;
    sale_price?: number;
    regular_price?: number;
    product_images?: { url: string }[];
  };
};

type ReviewItem = {
  id: string;
  is_approved?: boolean;
  rating: number;
  comment?: string;
  created_at: string;
  products?: { name?: string };
};

export default function AccountContent() {
  const { user, signOut } = useAuthStore();
  const [profile, setProfile] = useState<{ full_name?: string; phone?: string } | null>(null);
  
  // Data States
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "addresses" | "wishlist" | "reviews" | "notifications">("profile");
  
  // Form States for Profile & Address
  const [editProfileName, setEditProfileName] = useState("");
  const [editProfilePhone, setEditProfilePhone] = useState("");
  
  const router = useRouter();
  const supabase = createBrowserClient();
  const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  useEffect(() => {
    const fetchAccountData = async () => {
      if (!user) return;

      setLoading(true);

      // Fetch Profile
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (profileData) {
        setProfile(profileData);
        setEditProfileName(profileData.full_name || "");
        setEditProfilePhone(profileData.phone || "");
      }

      // Fetch Orders
      const { data: ordersData } = await supabase
        .from("orders")
        .select("*, order_items(*, products(name, slug, categories (slug), subcategories (slug)), product_variants (name, value))")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (ordersData) setOrders(ordersData);

      // Fetch Addresses
      const { data: addressesData } = await supabase.from("addresses").select("*").eq("user_id", user.id);
      if (addressesData) setAddresses(addressesData);

      // Fetch Wishlist
      const { data: wishlistData } = await supabase
        .from("wishlists")
        .select("*, products(name, sale_price, regular_price, product_images(url))")
        .eq("user_id", user.id);
      if (wishlistData) setWishlist(wishlistData);

      // Fetch Reviews
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select("*, products(name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (reviewsData) setReviews(reviewsData);

      setLoading(false);
    };

    fetchAccountData();
  }, [user, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    await signOut();
    router.push("/login");
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: editProfileName, phone: editProfilePhone })
      .eq("id", user.id);
      
    if (!error) {
      setProfile({ ...profile, full_name: editProfileName, phone: editProfilePhone });
      alert("Profile updated successfully!");
    } else {
      alert("Error updating profile.");
    }
  };

  const handleRemoveFromWishlist = async (id: string) => {
    await supabase.from("wishlists").delete().eq("id", id);
    setWishlist(wishlist.filter(w => w.id !== id));
  };

  const handleDeleteAddress = async (id: string) => {
    await supabase.from("addresses").delete().eq("id", id);
    setAddresses(addresses.filter(a => a.id !== id));
  };

  if (!user) {
    return <div className="text-muted">Redirecting...</div>;
  }

  const isEmailVerified = user.email_confirmed_at != null;

  return (
    <div className="grid md:grid-cols-4 gap-8">
      {/* Sidebar Navigation */}
      <div className="md:col-span-1 space-y-4">
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-3 mb-6 p-2">
              <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center text-accent-gold">
                <User size={24} />
              </div>
              <div className="overflow-hidden">
                <h3 className="font-medium text-foreground dark:text-white truncate">{profile?.full_name || "User"}</h3>
                <p className="text-xs text-muted truncate">{user.email}</p>
              </div>
            </div>

            <Button
              variant="ghost"
              className={`w-full justify-start gap-3 border transition-all ${
                activeTab === "profile"
                  ? "border-accent-gold/70 bg-accent-gold/10 text-foreground shadow-sm dark:border-accent-gold/80 dark:bg-accent-gold/15"
                  : "border-transparent text-muted hover:border-border hover:bg-surface/70 hover:text-foreground"
              }`}
              onClick={() => setActiveTab("profile")}
            >
              <User size={18} /> Profile details
            </Button>
            <Button
              variant="ghost"
              className={`w-full justify-start gap-3 border transition-all ${
                activeTab === "orders"
                  ? "border-accent-gold/70 bg-accent-gold/10 text-foreground shadow-sm dark:border-accent-gold/80 dark:bg-accent-gold/15"
                  : "border-transparent text-muted hover:border-border hover:bg-surface/70 hover:text-foreground"
              }`}
              onClick={() => setActiveTab("orders")}
            >
              <Package size={18} /> Order History
            </Button>
            <Button
              variant="ghost"
              className={`w-full justify-start gap-3 border transition-all ${
                activeTab === "addresses"
                  ? "border-accent-gold/70 bg-accent-gold/10 text-foreground shadow-sm dark:border-accent-gold/80 dark:bg-accent-gold/15"
                  : "border-transparent text-muted hover:border-border hover:bg-surface/70 hover:text-foreground"
              }`}
              onClick={() => setActiveTab("addresses")}
            >
              <MapPin size={18} /> Saved Addresses
            </Button>
            <Button
              variant="ghost"
              className={`w-full justify-start gap-3 border transition-all ${
                activeTab === "wishlist"
                  ? "border-accent-gold/70 bg-accent-gold/10 text-foreground shadow-sm dark:border-accent-gold/80 dark:bg-accent-gold/15"
                  : "border-transparent text-muted hover:border-border hover:bg-surface/70 hover:text-foreground"
              }`}
              onClick={() => setActiveTab("wishlist")}
            >
              <Heart size={18} /> Wishlist
            </Button>
            <Button
              variant="ghost"
              className={`w-full justify-start gap-3 border transition-all ${
                activeTab === "reviews"
                  ? "border-accent-gold/70 bg-accent-gold/10 text-foreground shadow-sm dark:border-accent-gold/80 dark:bg-accent-gold/15"
                  : "border-transparent text-muted hover:border-border hover:bg-surface/70 hover:text-foreground"
              }`}
              onClick={() => setActiveTab("reviews")}
            >
              <Star size={18} /> My Reviews
            </Button>
            <Button
              variant="ghost"
              className={`relative w-full justify-start gap-3 border transition-all ${
                activeTab === "notifications"
                  ? "border-accent-gold/70 bg-accent-gold/10 text-foreground shadow-sm dark:border-accent-gold/80 dark:bg-accent-gold/15"
                  : "border-transparent text-muted hover:border-border hover:bg-surface/70 hover:text-foreground"
              }`}
              onClick={() => setActiveTab("notifications")}
            >
              <Bell size={18} /> Notifications
              {notifications.filter((n) => !n.is_read).length > 0 && (
                <span className="absolute right-3 bg-error text-foreground dark:text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {notifications.filter((n) => !n.is_read).length}
                </span>
              )}
            </Button>

            <div className="pt-4 mt-4 border-t border-border">
              <Button variant="ghost" className="w-full justify-start gap-3 text-error hover:text-error/80 hover:bg-error/10" onClick={handleLogout}>
                <LogOut size={18} /> Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="md:col-span-3 space-y-6">
        {!isEmailVerified && (
          <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="text-warning mt-0.5" size={20} />
            <div>
              <h4 className="text-warning font-semibold">Verify your email address</h4>
              <p className="text-warning/80 text-sm mt-1">
                You must verify your email address before you can securely proceed to checkout.
              </p>
              <Button variant="outline" size="sm" className="mt-3 border-warning/50 text-warning hover:bg-warning/20" onClick={async () => {
                try {
                  console.log("[ACCOUNT] Resending verification email...");
                  const response = await fetch("/api/auth/resend-verification", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: user.email }),
                  });
                  const result = await response.json();
                  if (result.success) {
                    alert("✓ Verification email sent! Check your inbox.");
                  } else {
                    alert("Failed to resend: " + (result.error || "Unknown error"));
                  }
                } catch (error) {
                  alert("Error: " + (error instanceof Error ? error.message : "Unknown"));
                }
              }}>
                Resend Verification Email
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-accent-gold" size={32} /></div>
        ) : (
          <>
            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your account details and settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-muted">Full Name</label>
                      <Input value={editProfileName} onChange={(e) => setEditProfileName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted">Phone Number</label>
                      <Input value={editProfilePhone} onChange={(e) => setEditProfilePhone(e.target.value)} placeholder="Not set" />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <label className="text-sm text-muted">Email Address</label>
                      <div className="flex gap-2">
                        <Input defaultValue={user.email} disabled className="flex-1" />
                        <Badge variant={isEmailVerified ? "success" : "destructive"}>
                          {isEmailVerified ? "Verified" : "Unverified"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border/50 flex justify-end">
                    <Button variant="secondary" onClick={handleUpdateProfile}>Save Changes</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ORDERS TAB */}
            {activeTab === "orders" && (
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                  <CardDescription>View and track your previous purchases.</CardDescription>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-border/50 rounded-lg">
                      <Package size={32} className="mx-auto text-muted mb-3" />
                      <p className="text-muted">You haven&apos;t placed any orders yet.</p>
                      <Button variant="link" onClick={() => router.push("/shop")} className="mt-2 text-accent-gold">Start Shopping</Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="p-4 border border-border rounded-xl bg-surface hover:border-white/20 transition-colors flex flex-col sm:flex-row gap-4 justify-between items-center">
                          <div>
                            <p className="text-sm text-muted mb-1">
                              Order #{order.id.substring(0, 8).toUpperCase()} • {format(new Date(order.created_at), "MMM d, yyyy")}
                            </p>
                            <p className="font-medium text-foreground dark:text-white mb-2">
                              {order.order_items.length} items • ${Number(order.total).toFixed(2)}
                            </p>
                            <Badge variant="outline">{order.status}</Badge>
                            {order.status === "Received" && order.order_items?.length > 0 && (
                              <div className="mt-3 space-y-2">
                                {order.order_items.map((item: OrderItem) => {
                                  const product = item.products;
                                  const productUrl = product?.slug && product?.categories?.slug && product?.subcategories?.slug
                                    ? `/shop/${product.categories.slug}/${product.subcategories.slug}/${product.slug}`
                                    : null;

                                  return productUrl ? (
                                    <Link key={item.id} href={productUrl} className="inline-flex items-center gap-2 rounded-full border border-accent-gold bg-accent-gold/10 px-3 py-1 text-xs font-semibold text-accent-gold hover:bg-accent-gold/20">
                                      Leave Review for {product.name}
                                    </Link>
                                  ) : null;
                                })}
                              </div>
                            )}
                          </div>
                          <Link href={`/account/orders/${order.id}`}>
                            <Button variant="secondary" size="sm" className="gap-2">
                              <Eye size={16} /> View Details
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* ADDRESSES TAB */}
            {activeTab === "addresses" && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Saved Addresses</CardTitle>
                      <CardDescription>Manage your shipping and billing addresses.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {addresses.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-border/50 rounded-lg text-muted">
                      <p>No addresses saved.</p>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {addresses.map((address) => (
                        <div key={address.id} className="p-4 border border-border rounded-xl bg-surface relative">
                          {address.is_default && (
                            <Badge className="absolute top-4 right-4" variant="luxury">Default</Badge>
                          )}
                          <h4 className="font-semibold text-foreground dark:text-white mb-2">{address.title || "Address"}</h4>
                          <div className="text-sm text-muted space-y-1 mb-4">
                            <p>{address.address_line_1}</p>
                            {address.address_line_2 && <p>{address.address_line_2}</p>}
                            <p>{address.city}, {address.state} {address.postal_code}</p>
                            <p>{address.country}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleDeleteAddress(address.id)} className="text-error hover:bg-error/10 hover:text-error border-error/20">
                              <Trash2 size={14} className="mr-1" /> Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* WISHLIST TAB */}
            {activeTab === "wishlist" && (
              <Card>
                <CardHeader>
                  <CardTitle>My Wishlist</CardTitle>
                  <CardDescription>Items you have saved for later.</CardDescription>
                </CardHeader>
                <CardContent>
                  {wishlist.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-border/50 rounded-lg text-muted">
                      <Heart size={32} className="mx-auto mb-3 opacity-50" />
                      <p>Your wishlist is empty.</p>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {wishlist.map((item) => (
                        <div key={item.id} className="flex gap-4 p-4 border border-border rounded-xl bg-surface">
                          <div className="w-20 h-20 bg-black/5 dark:bg-white/5 rounded-lg overflow-hidden shrink-0 relative">
                            {item.products?.product_images?.[0] ? (
                              <Image
                                src={item.products.product_images[0].url}
                                alt={item.products.name || "Wishlist item"}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted"><Package size={24} /></div>
                            )}
                          </div>
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <p className="font-medium text-foreground dark:text-white line-clamp-1">{item.products?.name}</p>
                              <p className="text-accent-gold font-bold mt-1">
                                ${item.products?.sale_price || item.products?.regular_price}
                              </p>
                            </div>
                            <div className="flex gap-2 justify-end mt-2">
                              <Button variant="ghost" size="sm" className="text-error" onClick={() => handleRemoveFromWishlist(item.id)}>
                                <Trash2 size={16} />
                              </Button>
                              <Button variant="secondary" size="sm">Add to Cart</Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* REVIEWS TAB */}
            {activeTab === "reviews" && (
              <Card>
                <CardHeader>
                  <CardTitle>My Reviews</CardTitle>
                  <CardDescription>Manage reviews you have left for products.</CardDescription>
                </CardHeader>
                <CardContent>
                  {reviews.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-border/50 rounded-lg text-muted">
                      <Star size={32} className="mx-auto mb-3 opacity-50" />
                      <p>You haven&apos;t left any reviews yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="p-4 border border-border rounded-xl bg-surface">
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-medium text-foreground dark:text-white">{review.products?.name}</p>
                            <Badge variant={review.is_approved ? "success" : "outline"}>
                              {review.is_approved ? "Published" : "Pending Approval"}
                            </Badge>
                          </div>
                          <div className="flex gap-1 mb-2 text-accent-gold">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} className={i >= review.rating ? "text-muted" : ""} />
                            ))}
                          </div>
                          <p className="text-sm text-muted mb-3">{review.comment}</p>
                          <p className="text-xs text-muted/50">{format(new Date(review.created_at), "MMM d, yyyy")}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === "notifications" && (
              <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                  <div>
                    <CardTitle>Notification Center</CardTitle>
                    <CardDescription>Stay updated on your orders and offers.</CardDescription>
                  </div>
                  {notifications.filter(n => !n.is_read).length > 0 && (
                    <Button variant="outline" size="sm" onClick={() => markAllAsRead()}>Mark All Read</Button>
                  )}
                </CardHeader>
                <CardContent>
                  {notifications.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-border/50 rounded-lg text-muted">
                      <Bell size={32} className="mx-auto mb-3 opacity-50" />
                      <p>No notifications.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {notifications.map((notif) => (
                        <div key={notif.id} className={`p-4 border border-border/50 rounded-xl flex items-start justify-between gap-4 transition-colors ${!notif.is_read ? "bg-accent-gold/5 border-accent-gold/20" : "bg-surface"}`}>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {!notif.is_read && <div className="w-2 h-2 rounded-full bg-accent-gold" />}
                              <p className={`font-medium ${!notif.is_read ? "text-foreground dark:text-white" : "text-foreground dark:text-white/80"}`}>{notif.title}</p>
                            </div>
                            <p className="text-sm text-muted">{notif.message}</p>
                            <p className="text-xs text-muted/50 mt-2">{format(new Date(notif.created_at), "MMM d, yyyy 'at' h:mm a")}</p>
                          </div>
                          <div className="flex gap-2">
                            {!notif.is_read && (
                              <Button variant="ghost" size="sm" onClick={() => markAsRead(notif.id)} className="text-success hover:bg-success/10 hover:text-success">
                                Read
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => deleteNotification(notif.id)} className="text-error hover:bg-error/10 hover:text-error h-8 w-8 p-0">
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

          </>
        )}
      </div>
    </div>
  );
}
