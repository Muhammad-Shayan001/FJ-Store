"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Menu,
  X,
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  MessageSquare,
  Ticket,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  PlusCircle,
  FolderTree,
  Tags,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { motion, AnimatePresence } from "framer-motion";

export function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [productsExpanded, setProductsExpanded] = useState(false);
  const [ordersExpanded, setOrdersExpanded] = useState(false);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { signOut } = useAuthStore();

  const currentStatus = searchParams.get("status");

  // Keep submenus expanded if we are on their routes
  useEffect(() => {
    if (
      pathname.startsWith("/admin/products") ||
      pathname.startsWith("/admin/categories") ||
      pathname.startsWith("/admin/subcategories") ||
      pathname.startsWith("/admin/inventory")
    ) {
      setProductsExpanded(true);
    }
    if (pathname.startsWith("/admin/orders")) {
      setOrdersExpanded(true);
    }
  }, [pathname]);

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  const isActive = (href: string, exact = false) => {
    if (exact) return pathname === href;
    const url = new URL(href, "http://localhost");
    const cleanHref = url.pathname;
    
    // For status specific filters
    const statusParam = url.searchParams.get("status");
    if (statusParam) {
      return pathname === cleanHref && currentStatus === statusParam;
    }
    
    // For default all orders/all products
    if (cleanHref === "/admin/orders" && currentStatus) {
      return false; // don't highlight all orders if status filter is active
    }

    return pathname === cleanHref;
  };

  // Toggle Collapse on Desktop
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-surface/90 backdrop-blur-md border-b border-border/50 flex items-center justify-between px-4 z-50">
        <Link href="/admin">
          <BrandLogo width={120} height={32} />
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="text-foreground dark:text-white hover:bg-black/10 dark:bg-white/10"
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-16 md:top-0 bottom-0 left-0 z-40 flex flex-col
          bg-gradient-to-b from-surface/95 to-surface/85 backdrop-blur-xl
          border-r border-border/50 transition-all duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:sticky md:h-screen
          ${isCollapsed ? "w-20" : "w-72"}
        `}
      >
        {/* Desktop Logo & Collapse Trigger */}
        <div className="hidden md:flex items-center justify-between p-6 border-b border-border/50">
          {!isCollapsed && (
            <Link href="/admin">
              <BrandLogo width={140} height={36} />
            </Link>
          )}
          <button
            onClick={toggleCollapse}
            className="p-1.5 rounded-lg border border-border bg-black/5 dark:bg-white/5 text-muted hover:text-foreground dark:text-white hover:bg-black/10 dark:bg-white/10 transition-colors mx-auto"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-thin">
          {/* Main Group */}
          <div className="space-y-1.5">
            {!isCollapsed && (
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest px-3 mb-2 block">
                Overview
              </span>
            )}
            
            {/* Dashboard Link */}
            <Link
              href="/admin"
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                ${isActive("/admin", true)
                  ? "bg-accent-gold/10 border border-accent-gold/20 text-accent-gold font-semibold"
                  : "text-muted hover:text-foreground dark:text-white hover:bg-black/5 dark:bg-white/5 border border-transparent"
                }
              `}
              onClick={() => setIsMobileOpen(false)}
            >
              <BarChart3 size={20} className="shrink-0" />
              {!isCollapsed && <span>Dashboard</span>}
            </Link>
          </div>

          {/* Products Group with Dropdown */}
          <div className="space-y-1.5">
            {!isCollapsed && (
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest px-3 mb-2 block">
                Catalog
              </span>
            )}
            
            <div>
              <button
                onClick={() => setProductsExpanded(!productsExpanded)}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-muted hover:text-foreground dark:text-white hover:bg-black/5 dark:bg-white/5 transition-all duration-200
                  ${(pathname.startsWith("/admin/products") || pathname.startsWith("/admin/categories") || pathname.startsWith("/admin/subcategories") || pathname.startsWith("/admin/inventory")) && "text-foreground dark:text-white bg-black/5 dark:bg-white/5"}
                `}
              >
                <div className="flex items-center gap-3">
                  <Package size={20} className="shrink-0" />
                  {!isCollapsed && <span>Products</span>}
                </div>
                {!isCollapsed && (productsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
              </button>

              {productsExpanded && !isCollapsed && (
                <div className="mt-1 ml-4 pl-4 border-l border-border/50 space-y-1">
                  <Link
                    href="/admin/products"
                    className={`flex items-center gap-2 py-2 px-3 rounded-lg text-sm transition-colors ${isActive("/admin/products") ? "text-accent-gold font-medium" : "text-muted hover:text-foreground dark:text-white"}`}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <ClipboardList size={16} />
                    All Products
                  </Link>
                  <Link
                    href="/admin/products?action=add"
                    className={`flex items-center gap-2 py-2 px-3 rounded-lg text-sm transition-colors ${searchParams.get("action") === "add" ? "text-accent-gold font-medium" : "text-muted hover:text-foreground dark:text-white"}`}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <PlusCircle size={16} />
                    Add Product
                  </Link>
                  <Link
                    href="/admin/categories"
                    className={`flex items-center gap-2 py-2 px-3 rounded-lg text-sm transition-colors ${isActive("/admin/categories") ? "text-accent-gold font-medium" : "text-muted hover:text-foreground dark:text-white"}`}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <FolderTree size={16} />
                    Categories
                  </Link>
                  <Link
                    href="/admin/subcategories"
                    className={`flex items-center gap-2 py-2 px-3 rounded-lg text-sm transition-colors ${isActive("/admin/subcategories") ? "text-accent-gold font-medium" : "text-muted hover:text-foreground dark:text-white"}`}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <Tags size={16} />
                    Subcategories
                  </Link>
                  <Link
                    href="/admin/inventory"
                    className={`flex items-center gap-2 py-2 px-3 rounded-lg text-sm transition-colors ${isActive("/admin/inventory") ? "text-accent-gold font-medium" : "text-muted hover:text-foreground dark:text-white"}`}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <Layers size={16} />
                    Inventory
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sales Group with Dropdown */}
          <div className="space-y-1.5">
            {!isCollapsed && (
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest px-3 mb-2 block">
                Sales & Ops
              </span>
            )}

            <div>
              <button
                onClick={() => setOrdersExpanded(!ordersExpanded)}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-muted hover:text-foreground dark:text-white hover:bg-black/5 dark:bg-white/5 transition-all duration-200
                  ${pathname.startsWith("/admin/orders") && "text-foreground dark:text-white bg-black/5 dark:bg-white/5"}
                `}
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart size={20} className="shrink-0" />
                  {!isCollapsed && <span>Orders</span>}
                </div>
                {!isCollapsed && (ordersExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
              </button>

              {ordersExpanded && !isCollapsed && (
                <div className="mt-1 ml-4 pl-4 border-l border-border/50 space-y-1">
                  <Link
                    href="/admin/orders"
                    className={`flex items-center gap-2 py-2 px-3 rounded-lg text-sm transition-colors ${isActive("/admin/orders") ? "text-accent-gold font-medium" : "text-muted hover:text-foreground dark:text-white"}`}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <ClipboardList size={16} />
                    All Orders
                  </Link>
                  <Link
                    href="/admin/orders?status=Pending"
                    className={`flex items-center gap-2 py-2 px-3 rounded-lg text-sm transition-colors ${isActive("/admin/orders?status=Pending") ? "text-accent-gold font-medium" : "text-muted hover:text-foreground dark:text-white"}`}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <ChevronDown size={16} />
                    Pending Orders
                  </Link>
                  <Link
                    href="/admin/orders?status=Delivered"
                    className={`flex items-center gap-2 py-2 px-3 rounded-lg text-sm transition-colors ${isActive("/admin/orders?status=Delivered") ? "text-accent-gold font-medium" : "text-muted hover:text-foreground dark:text-white"}`}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <PlusCircle size={16} />
                    Completed Orders
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Customers & Engagement Group */}
          <div className="space-y-1.5">
            {!isCollapsed && (
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest px-3 mb-2 block">
                Management
              </span>
            )}
            
            {/* Customers */}
            <Link
              href="/admin/users"
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                ${isActive("/admin/users")
                  ? "bg-accent-gold/10 border border-accent-gold/20 text-accent-gold font-semibold"
                  : "text-muted hover:text-foreground dark:text-white hover:bg-black/5 dark:bg-white/5 border border-transparent"
                }
              `}
              onClick={() => setIsMobileOpen(false)}
            >
              <Users size={20} className="shrink-0" />
              {!isCollapsed && <span>Customers</span>}
            </Link>

            {/* Reviews */}
            <Link
              href="/admin/reviews"
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                ${isActive("/admin/reviews")
                  ? "bg-accent-gold/10 border border-accent-gold/20 text-accent-gold font-semibold"
                  : "text-muted hover:text-foreground dark:text-white hover:bg-black/5 dark:bg-white/5 border border-transparent"
                }
              `}
              onClick={() => setIsMobileOpen(false)}
            >
              <MessageSquare size={20} className="shrink-0" />
              {!isCollapsed && <span>Reviews</span>}
            </Link>

            {/* Coupons */}
            <Link
              href="/admin/coupons"
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                ${isActive("/admin/coupons")
                  ? "bg-accent-gold/10 border border-accent-gold/20 text-accent-gold font-semibold"
                  : "text-muted hover:text-foreground dark:text-white hover:bg-black/5 dark:bg-white/5 border border-transparent"
                }
              `}
              onClick={() => setIsMobileOpen(false)}
            >
              <Ticket size={20} className="shrink-0" />
              {!isCollapsed && <span>Coupons</span>}
            </Link>

            {/* Notifications */}
            <Link
              href="/admin/notifications"
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                ${isActive("/admin/notifications")
                  ? "bg-accent-gold/10 border border-accent-gold/20 text-accent-gold font-semibold"
                  : "text-muted hover:text-foreground dark:text-white hover:bg-black/5 dark:bg-white/5 border border-transparent"
                }
              `}
              onClick={() => setIsMobileOpen(false)}
            >
              <Bell size={20} className="shrink-0" />
              {!isCollapsed && <span>Notifications</span>}
            </Link>
          </div>

          {/* System Settings Group */}
          <div className="space-y-1.5">
            {!isCollapsed && (
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest px-3 mb-2 block">
                System
              </span>
            )}
            
            {/* Analytics */}
            <Link
              href="/admin/analytics"
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                ${isActive("/admin/analytics")
                  ? "bg-accent-gold/10 border border-accent-gold/20 text-accent-gold font-semibold"
                  : "text-muted hover:text-foreground dark:text-white hover:bg-black/5 dark:bg-white/5 border border-transparent"
                }
              `}
              onClick={() => setIsMobileOpen(false)}
            >
              <BarChart3 size={20} className="shrink-0" />
              {!isCollapsed && <span>Analytics</span>}
            </Link>

            {/* Settings */}
            <Link
              href="/admin/settings"
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                ${isActive("/admin/settings")
                  ? "bg-accent-gold/10 border border-accent-gold/20 text-accent-gold font-semibold"
                  : "text-muted hover:text-foreground dark:text-white hover:bg-black/5 dark:bg-white/5 border border-transparent"
                }
              `}
              onClick={() => setIsMobileOpen(false)}
            >
              <Settings size={20} className="shrink-0" />
              {!isCollapsed && <span>Settings</span>}
            </Link>
          </div>
        </nav>

        {/* Footer with Logout */}
        <div className="p-4 border-t border-border/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={20} className="shrink-0" />
            {!isCollapsed && <span className="font-semibold text-sm">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
