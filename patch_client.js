const fs = require('fs');

const path = 'app/(main)/product/[slug]/ProductDetailsClient.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
`type Variant = {
  id: string;
  price: number;
  stock: number;
  color: string | null;
  size: string | null;
  storage: string | null;
};`,
`type Variant = {
  id: string;
  price: number;
  stock: number;
  attributes: Record<string, string> | null;
  sku: string;
};`
);

content = content.replace(
`type ProductOption = {
  name: string;
  values: string[];
};

type ProductProp = {
  id: string;
  name: string;
  brand: string;
  description: string;
  isFeatured: boolean;
  category: { slug: string; name: string };
  images: ImageWithMedia[];
  variants: Variant[];
};`,
`type ProductOption = {
  name: string;
  values: string[];
};

type ProductProp = {
  id: string;
  name: string;
  brand: string;
  description: string;
  isFeatured: boolean;
  category: { slug: string; name: string };
  images: ImageWithMedia[];
  options: ProductOption[] | null;
  variants: Variant[];
};`
);

fs.writeFileSync(path, content);
console.log("Patched types in client.");
