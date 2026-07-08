export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
};

export type Subcategory = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  is_active: boolean;
};

export type Product = {
  id: string;
  category_id: string | null;
  subcategory_id: string | null;
  name: string;
  slug: string;
  short_description: string | null;
  full_description: string | null;
  brand: string | null;
  sku: string | null;
  barcode: string | null;
  tags: string[];
  regular_price: number;
  sale_price: number | null;
  cost_price: number | null;
  tax_rate: number;
  currency: string;
  is_published: boolean;

  // Conditional
  expiry_date?: string;
  manufacturing_date?: string;
  calories?: number;
  ingredients?: string;
  is_halal?: boolean;
  allergy_info?: string;
  skin_type?: string[];
  is_chemical_free?: boolean;
  is_dermatologist_tested?: boolean;
  handmade?: boolean;
  bridal?: boolean;
  stone_type?: string;

  // Joined relations
  images?: ProductImage[];
  variants?: ProductVariant[];
  category?: Category;
  subcategory?: Subcategory;
};

export type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  is_thumbnail: boolean;
  display_order: number;
  provider?: string;
  public_id?: string;
  file_size?: number;
  mime_type?: string;
  created_at?: string;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  name: string; // e.g. "Size"
  value: string; // e.g. "M"
  additional_price: number;
  sku: string | null;
};
