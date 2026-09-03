import { prisma } from '../db';

export interface ProductFilterOptions {
  query?: string;
  category?: string;
  brand?: string;
  color?: string;
  gender?: string;
  size?: string;
  apparelCategory?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStockOnly?: boolean;
  isFeatured?: boolean;
  isPromoted?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}

export async function getProducts(options: ProductFilterOptions = {}) {
  const {
    query,
    category,
    brand,
    color,
    gender,
    size,
    apparelCategory,
    minPrice,
    maxPrice,
    minRating,
    inStockOnly,
    isFeatured,
    isPromoted,
    sort = 'popularity',
    page = 1,
    limit = 12,
  } = options;

  const where: any = {};

  if (query && query.trim() !== '') {
    const q = query.trim();
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { brand: { contains: q, mode: 'insensitive' } },
      { tags: { contains: q, mode: 'insensitive' } },
      { specifications: { contains: q, mode: 'insensitive' } },
      { category: { name: { contains: q, mode: 'insensitive' } } },
    ];
  }

  if (category) {
    where.category = {
      OR: [{ slug: category.toLowerCase() }, { name: category }],
    };
  }

  if (brand) {
    where.brand = { equals: brand, mode: 'insensitive' };
  }

  if (color && color !== 'All') {
    where.OR = [
      ...(where.OR || []),
      { tags: { contains: color.toLowerCase(), mode: 'insensitive' } },
      { specifications: { contains: `"Color":"${color}"`, mode: 'insensitive' } },
    ];
  }

  if (gender && gender !== 'All') {
    where.OR = [
      ...(where.OR || []),
      { tags: { contains: gender.toLowerCase(), mode: 'insensitive' } },
      { specifications: { contains: `"Department":"${gender}"`, mode: 'insensitive' } },
    ];
  }

  if (apparelCategory && apparelCategory !== 'All') {
    where.OR = [
      ...(where.OR || []),
      { tags: { contains: apparelCategory.toLowerCase(), mode: 'insensitive' } },
      { specifications: { contains: `"Category":"${apparelCategory}"`, mode: 'insensitive' } },
    ];
  }

  if (size) {
    where.specifications = { contains: size, mode: 'insensitive' };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = Number(minPrice);
    if (maxPrice !== undefined) where.price.lte = Number(maxPrice);
  }

  if (minRating !== undefined) {
    where.rating = { gte: Number(minRating) };
  }

  if (inStockOnly) {
    where.stock = { gt: 0 };
  }

  if (isFeatured !== undefined) {
    where.isFeatured = isFeatured;
  }

  if (isPromoted !== undefined) {
    where.isPromoted = isPromoted;
  }

  let orderBy: any = { reviewCount: 'desc' }; // default: popularity
  if (sort === 'price_asc') orderBy = { price: 'asc' };
  else if (sort === 'price_desc') orderBy = { price: 'desc' };
  else if (sort === 'rating') orderBy = { rating: 'desc' };
  else if (sort === 'newest') orderBy = { createdAt: 'desc' };
  else if (sort === 'discount') orderBy = { discountPercent: 'desc' };

  const take = Number(limit) || 12;
  const skip = (Math.max(1, Number(page)) - 1) * take;

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy,
      skip,
      take,
    }),
  ]);

  const parsedProducts = products.map((p) => ({
    ...p,
    images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
    specifications: typeof p.specifications === 'string' ? JSON.parse(p.specifications) : p.specifications,
    tags: typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags,
  }));

  return {
    success: true,
    total,
    page: Number(page),
    limit: take,
    totalPages: Math.ceil(total / take),
    products: parsedProducts,
  };
}

export async function getProductByIdOrSlug(identifier: string) {
  const product = await prisma.product.findFirst({
    where: {
      OR: [{ id: identifier }, { slug: identifier }],
    },
    include: {
      category: true,
      reviews: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!product) {
    return { success: false, error: 'PRODUCT_NOT_FOUND', message: 'Product not found.' };
  }

  return {
    success: true,
    product: {
      ...product,
      images: typeof product.images === 'string' ? JSON.parse(product.images) : product.images,
      specifications: typeof product.specifications === 'string' ? JSON.parse(product.specifications) : product.specifications,
      tags: typeof product.tags === 'string' ? JSON.parse(product.tags) : product.tags,
    },
  };
}

export async function getRecommendations(productId?: string, categorySlug?: string, limit = 4) {
  let categoryId: string | undefined;

  if (productId) {
    const current = await prisma.product.findUnique({
      where: { id: productId },
      select: { categoryId: true },
    });
    if (current) categoryId = current.categoryId;
  }

  if (!categoryId && categorySlug) {
    const cat = await prisma.category.findUnique({
      where: { slug: categorySlug },
      select: { id: true },
    });
    if (cat) categoryId = cat.id;
  }

  const where: any = { stock: { gt: 0 } };
  if (productId) where.id = { not: productId };
  if (categoryId) where.categoryId = categoryId;

  let products = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: { rating: 'desc' },
    take: Number(limit) || 4,
  });

  if (products.length < limit) {
    const fallbackProducts = await prisma.product.findMany({
      where: {
        id: { notIn: [productId || '', ...products.map((p) => p.id)] },
        stock: { gt: 0 },
      },
      include: { category: true },
      orderBy: { isFeatured: 'desc' },
      take: limit - products.length,
    });
    products = [...products, ...fallbackProducts];
  }

  const parsed = products.map((p) => ({
    ...p,
    images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
    specifications: typeof p.specifications === 'string' ? JSON.parse(p.specifications) : p.specifications,
    tags: typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags,
  }));

  return {
    success: true,
    recommendations: parsed,
  };
}

export async function compareProducts(productIds: string[]) {
  const products = await prisma.product.findMany({
    where: {
      OR: [{ id: { in: productIds } }, { slug: { in: productIds } }],
    },
    include: { category: true },
  });

  const parsed = products.map((p) => ({
    ...p,
    images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
    specifications: typeof p.specifications === 'string' ? JSON.parse(p.specifications) : p.specifications,
    tags: typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags,
  }));

  return {
    success: true,
    products: parsed,
  };
}

export async function getCategories() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  return { success: true, categories };
}

export async function getPromotions() {
  const [featured, discounted, coupons] = await Promise.all([
    prisma.product.findMany({
      where: { isFeatured: true, stock: { gt: 0 } },
      include: { category: true },
      take: 6,
    }),
    prisma.product.findMany({
      where: { discountPercent: { gt: 0 }, stock: { gt: 0 } },
      include: { category: true },
      orderBy: { discountPercent: 'desc' },
      take: 6,
    }),
    prisma.coupon.findMany({
      where: { isActive: true },
    }),
  ]);

  const parse = (list: any[]) =>
    list.map((p) => ({
      ...p,
      images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
      specifications: typeof p.specifications === 'string' ? JSON.parse(p.specifications) : p.specifications,
      tags: typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags,
    }));

  return {
    success: true,
    featuredProducts: parse(featured),
    discountedProducts: parse(discounted),
    activeCoupons: coupons,
  };
}
