-- FJ Store SQL Setup Script 
-- Paste this directly into the Supabase SQL Editor

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
CREATE TYPE order_status AS ENUM ('Pending', 'Accepted', 'Processing', 'Shipped', 'Delivered', 'Received', 'Cancelled', 'Returned');
CREATE TYPE discount_type AS ENUM ('percentage', 'fixed');
CREATE TYPE user_role AS ENUM ('customer', 'admin');

-- 3. TABLES

-- Users (Extended profile table linked to auto auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role user_role DEFAULT 'customer',
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Categories
CREATE TABLE public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subcategories
CREATE TABLE public.subcategories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products
CREATE TABLE public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    subcategory_id UUID REFERENCES public.subcategories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    short_description TEXT,
    full_description TEXT,
    brand TEXT,
    sku TEXT UNIQUE,
    barcode TEXT,
    tags TEXT[],
    regular_price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    tax_rate DECIMAL(5,2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    is_published BOOLEAN DEFAULT false,
    -- Conditional Fields
    expiry_date DATE,
    manufacturing_date DATE,
    calories INTEGER,
    ingredients TEXT,
    is_halal BOOLEAN,
    allergy_info TEXT,
    skin_type TEXT[],
    is_chemical_free BOOLEAN,
    is_dermatologist_tested BOOLEAN,
    handmade BOOLEAN,
    bridal BOOLEAN,
    stone_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Variants
CREATE TABLE public.product_variants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g., 'Size', 'Color', 'Flavor'
    value TEXT NOT NULL, -- e.g., 'Medium', '#FF0000', 'Chocolate'
    additional_price DECIMAL(10,2) DEFAULT 0,
    sku TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Images
CREATE TABLE public.product_images (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    is_thumbnail BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Addresses
CREATE TABLE public.addresses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT,
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    city TEXT NOT NULL,
    state TEXT,
    country TEXT NOT NULL,
    postal_code TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders
CREATE TABLE public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    address_id UUID REFERENCES public.addresses(id),
    status order_status DEFAULT 'Pending',
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) NOT NULL,
    shipping_cost DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    tracking_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items
CREATE TABLE public.order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    price_at_time DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews
CREATE TABLE public.reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory Logs
CREATE TABLE public.inventory_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
    quantity_changed INTEGER NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) Configuration

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Public read access policies (Products, Categories, Subcategories, Images, Reviews)
CREATE POLICY "Public profiles are visible to everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Allow public read access to categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access to subcategories" ON subcategories FOR SELECT USING (true);
CREATE POLICY "Allow public read access to products" ON products FOR SELECT USING (is_published = true);
CREATE POLICY "Allow public read access to product_variants" ON product_variants FOR SELECT USING (true);
CREATE POLICY "Allow public read access to product_images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Allow public read access to reviews" ON reviews FOR SELECT USING (is_approved = true);

-- Authenticated Users Policies (Addresses, Orders, Reviews)
CREATE POLICY "Users can insert own addresses" ON addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own addresses" ON addresses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can select own addresses" ON addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own addresses" ON addresses FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can select own orders" ON orders FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert order items for own orders" ON order_items FOR INSERT WITH CHECK (
    EXISTS(SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Users can select order items for own orders" ON order_items FOR SELECT USING (
    EXISTS(SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

CREATE POLICY "Users can insert reviews for purchased products" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);

-- Profile Update Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();- -   F J   S t o r e   U p d a t e :   A P P E N D   O N L Y   -   D o   n o t   o v e r w r i t e   p r e v i o u s   b l o c k s .  
 - -   E x e c u t e   t h i s   b l o c k   i n   t h e   S u p a b a s e   S Q L   e d i t o r   t o   a d d   t h e   m i s s i n g   t a b l e s .  
  
 - -   C o u p o n s  
 C R E A T E   T A B L E   I F   N O T   E X I S T S   p u b l i c . c o u p o n s   (  
         i d   U U I D   D E F A U L T   u u i d _ g e n e r a t e _ v 4 ( )   P R I M A R Y   K E Y ,  
         c o d e   T E X T   N O T   N U L L   U N I Q U E ,  
         d i s c o u n t _ t y p e   d i s c o u n t _ t y p e   N O T   N U L L ,  
         d i s c o u n t _ v a l u e   D E C I M A L ( 1 0 , 2 )   N O T   N U L L ,  
         m i n _ o r d e r _ a m o u n t   D E C I M A L ( 1 0 , 2 )   D E F A U L T   0 ,  
         u s e s   I N T E G E R   D E F A U L T   0 ,  
         m a x _ u s e s   I N T E G E R ,  
         v a l i d _ f r o m   T I M E S T A M P   W I T H   T I M E   Z O N E   D E F A U L T   N O W ( ) ,  
         v a l i d _ u n t i l   T I M E S T A M P   W I T H   T I M E   Z O N E ,  
         i s _ a c t i v e   B O O L E A N   D E F A U L T   t r u e ,  
         c r e a t e d _ a t   T I M E S T A M P   W I T H   T I M E   Z O N E   D E F A U L T   N O W ( )  
 ) ;  
  
 - -   N o t i f i c a t i o n s  
 C R E A T E   T A B L E   I F   N O T   E X I S T S   p u b l i c . n o t i f i c a t i o n s   (  
         i d   U U I D   D E F A U L T   u u i d _ g e n e r a t e _ v 4 ( )   P R I M A R Y   K E Y ,  
         u s e r _ i d   U U I D   R E F E R E N C E S   p u b l i c . p r o f i l e s ( i d )   O N   D E L E T E   C A S C A D E ,  
         t i t l e   T E X T   N O T   N U L L ,  
         m e s s a g e   T E X T   N O T   N U L L ,  
         i s _ r e a d   B O O L E A N   D E F A U L T   f a l s e ,  
         c r e a t e d _ a t   T I M E S T A M P   W I T H   T I M E   Z O N E   D E F A U L T   N O W ( )  
 ) ;  
  
 - -   P a y m e n t s  
 C R E A T E   T A B L E   I F   N O T   E X I S T S   p u b l i c . p a y m e n t s   (  
         i d   U U I D   D E F A U L T   u u i d _ g e n e r a t e _ v 4 ( )   P R I M A R Y   K E Y ,  
         o r d e r _ i d   U U I D   R E F E R E N C E S   p u b l i c . o r d e r s ( i d )   O N   D E L E T E   C A S C A D E ,  
         t r a n s a c t i o n _ i d   T E X T   U N I Q U E ,  
         p r o v i d e r   T E X T   N O T   N U L L ,   - -   e . g . ,   ' s t r i p e '  
         s t a t u s   T E X T   N O T   N U L L ,   - -   e . g . ,   ' s u c c e e d e d ' ,   ' p e n d i n g ' ,   ' f a i l e d '  
         a m o u n t   D E C I M A L ( 1 0 , 2 )   N O T   N U L L ,  
         c u r r e n c y   T E X T   D E F A U L T   ' U S D ' ,  
         c r e a t e d _ a t   T I M E S T A M P   W I T H   T I M E   Z O N E   D E F A U L T   N O W ( )  
 ) ;  
  
 - -   E n a b l e   R L S   a n d   P o l i c i e s   f o r   n e w   t a b l e s  
 A L T E R   T A B L E   p u b l i c . c o u p o n s   E N A B L E   R O W   L E V E L   S E C U R I T Y ;  
 A L T E R   T A B L E   p u b l i c . n o t i f i c a t i o n s   E N A B L E   R O W   L E V E L   S E C U R I T Y ;  
 A L T E R   T A B L E   p u b l i c . p a y m e n t s   E N A B L E   R O W   L E V E L   S E C U R I T Y ;  
  
 C R E A T E   P O L I C Y   " A l l o w   p u b l i c   r e a d   a c c e s s   t o   a c t i v e   c o u p o n s "   O N   c o u p o n s   F O R   S E L E C T   U S I N G   ( i s _ a c t i v e   =   t r u e ) ;  
 C R E A T E   P O L I C Y   " U s e r s   c a n   v i e w   o w n   n o t i f i c a t i o n s "   O N   n o t i f i c a t i o n s   F O R   S E L E C T   U S I N G   ( a u t h . u i d ( )   =   u s e r _ i d ) ;  
 C R E A T E   P O L I C Y   " U s e r s   c a n   u p d a t e   o w n   n o t i f i c a t i o n s "   O N   n o t i f i c a t i o n s   F O R   U P D A T E   U S I N G   ( a u t h . u i d ( )   =   u s e r _ i d ) ;  
 C R E A T E   P O L I C Y   " U s e r s   c a n   v i e w   o w n   p a y m e n t s "   O N   p a y m e n t s   F O R   S E L E C T   U S I N G   (  
         E X I S T S ( S E L E C T   1   F R O M   o r d e r s   W H E R E   o r d e r s . i d   =   p a y m e n t s . o r d e r _ i d   A N D   o r d e r s . u s e r _ i d   =   a u t h . u i d ( ) )  
 ) ;  
 - -   P h a s e   5   D B   A d d i t i o n s :   P r o d u c t   I n v e n t o r y   &   M e d i a   F i e l d s  
  
 A L T E R   T A B L E   p u b l i c . p r o d u c t s    
 A D D   C O L U M N   I F   N O T   E X I S T S   s t o c k _ q u a n t i t y   I N T E G E R   D E F A U L T   0 ,  
 A D D   C O L U M N   I F   N O T   E X I S T S   s t o c k _ s t a t u s   T E X T   D E F A U L T   ' i n _ s t o c k ' ,  
 A D D   C O L U M N   I F   N O T   E X I S T S   w a r e h o u s e   T E X T ,  
 A D D   C O L U M N   I F   N O T   E X I S T S   v i d e o _ u r l   T E X T ,  
 A D D   C O L U M N   I F   N O T   E X I S T S   i m a g e _ 3 6 0 _ u r l s   T E X T [ ] ,  
 A D D   C O L U M N   I F   N O T   E X I S T S   s h a d e   T E X T ;  
 