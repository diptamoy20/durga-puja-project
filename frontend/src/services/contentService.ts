import api, { unwrap, unwrapList } from './api';
import type {
  Article,
  ArticleFormValues,
  ArticleListQuery,
  ArticleWorkflowAction,
  Category,
  CategoryFormValues,
  CategoryListQuery,
  ContentMedia,
  ContentMediaListQuery,
  Subcategory,
  SubcategoryFormValues,
  SubcategoryListQuery,
} from '@/types/content';
import type { PaginatedData } from '@/types';

function toParams(query: object): Record<string, string | number> {
  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== undefined && value !== '' && value !== null),
  ) as Record<string, string | number>;
}

function buildArticlePayload(values: ArticleFormValues): FormData | Record<string, unknown> {
  const seoKeywords = values.tags?.trim() || values.seoKeywords?.trim() || undefined;
  const base: Record<string, unknown> = {
    title: values.title,
    slug: values.slug,
    subcategoryId: values.subcategoryId,
    authorId: values.authorId || undefined,
    excerpt: values.excerpt || undefined,
    content: values.content,
    featuredImage: values.featuredImage || undefined,
    seoTitle: values.seoTitle || undefined,
    seoDescription: values.seoDescription || undefined,
    seoKeywords,
    isFeatured: values.isFeatured ?? false,
    allowComments: values.allowComments ?? false,
  };

  if (values.featuredImageFile) {
    const form = new FormData();
    Object.entries(base).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        form.append(key, String(val));
      }
    });
    form.append('featured_image', values.featuredImageFile);
    return form;
  }

  return base;
}

export const articleService = {
  list: async (query: ArticleListQuery = {}): Promise<PaginatedData<Article>> => {
    const { items, pagination } = await unwrapList<Article>(
      api.get('/articles', { params: toParams(query) }),
    );
    return {
      items,
      pagination: pagination ?? {
        page: 1, perPage: items.length, total: items.length,
        lastPage: 1, hasPreviousPage: false, hasNextPage: false,
      },
    };
  },

  get: (id: number): Promise<Article> => unwrap(api.get(`/articles/${id}`)),

  stats: () => unwrap<Record<string, number>>(api.get('/articles/stats')),

  create: (values: ArticleFormValues): Promise<Article> => {
    const payload = buildArticlePayload(values);
    if (payload instanceof FormData) {
      return unwrap(
        api.post('/articles', payload, { headers: { 'Content-Type': 'multipart/form-data' } }),
      );
    }
    return unwrap(api.post('/articles', payload));
  },

  update: (id: number, values: Partial<ArticleFormValues>): Promise<Article> => {
    const payload = buildArticlePayload(values as ArticleFormValues);
    if (payload instanceof FormData) {
      return unwrap(
        api.put(`/articles/${id}`, payload, { headers: { 'Content-Type': 'multipart/form-data' } }),
      );
    }
    return unwrap(api.put(`/articles/${id}`, payload));
  },

  remove: (id: number): Promise<{ id: number; deleted: boolean }> =>
    unwrap(api.delete(`/articles/${id}`)),

  workflow: (
    id: number,
    action: ArticleWorkflowAction,
    opts?: { comment?: string; scheduledAt?: string },
  ): Promise<Article> =>
    unwrap(api.post(`/articles/${id}/workflow`, { action, ...opts })),
};

export const contentMediaService = {
  list: async (query: ContentMediaListQuery = {}): Promise<PaginatedData<ContentMedia>> => {
    const { items, pagination } = await unwrapList<ContentMedia>(
      api.get('/content-media', { params: toParams(query) }),
    );
    return {
      items,
      pagination: pagination ?? {
        page: 1, perPage: items.length, total: items.length,
        lastPage: 1, hasPreviousPage: false, hasNextPage: false,
      },
    };
  },

  upload: (data: FormData): Promise<ContentMedia> =>
    unwrap(
      api.post('/content-media', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    ),

  remove: (id: number): Promise<{ id: number; deleted: boolean }> =>
    unwrap(api.delete(`/content-media/${id}`)),
};

export const publicNewsService = {
  list: async (query: ArticleListQuery = {}): Promise<PaginatedData<Article>> => {
    const { items, pagination } = await unwrapList<Article>(
      api.get('/news', { params: toParams(query) }),
    );
    return {
      items,
      pagination: pagination ?? {
        page: 1, perPage: items.length, total: items.length,
        lastPage: 1, hasPreviousPage: false, hasNextPage: false,
      },
    };
  },

  getBySlug: (slug: string): Promise<Article> => unwrap(api.get(`/news/${slug}`)),
};

export const categoryService = {
  list: async (query: CategoryListQuery = {}) => {
    const { items, pagination } = await unwrapList<Category>(
      api.get('/categories', { params: toParams(query) }),
    );
    return { items, pagination };
  },

  listActive: async () => {
    const { items } = await categoryService.list({ status: 'ACTIVE', perPage: 100, sortDir: 'asc' });
    return items;
  },

  get: (id: number): Promise<Category> => unwrap(api.get(`/categories/${id}`)),

  create: (values: CategoryFormValues): Promise<Category> =>
    unwrap(api.post('/categories', values)),

  update: (id: number, values: Partial<CategoryFormValues>): Promise<Category> =>
    unwrap(api.put(`/categories/${id}`, values)),

  remove: (id: number): Promise<{ id: number; deleted: boolean }> =>
    unwrap(api.delete(`/categories/${id}`)),
};

export const subcategoryService = {
  list: async (query: SubcategoryListQuery = {}) => {
    const { items, pagination } = await unwrapList<Subcategory>(
      api.get('/subcategories', { params: toParams(query) }),
    );
    return { items, pagination };
  },

  get: (id: number): Promise<Subcategory> => unwrap(api.get(`/subcategories/${id}`)),

  create: (values: SubcategoryFormValues): Promise<Subcategory> =>
    unwrap(api.post('/subcategories', values)),

  update: (id: number, values: Partial<SubcategoryFormValues>): Promise<Subcategory> =>
    unwrap(api.put(`/subcategories/${id}`, values)),

  remove: (id: number): Promise<{ id: number; deleted: boolean }> =>
    unwrap(api.delete(`/subcategories/${id}`)),

  /**
   * Fetch active subcategories under the "Nomination" master category
   * for Sharad Samman Award Category selection.
   */
  listNominationCategories: async (): Promise<string[]> => {
    try {
      const catRes = await categoryService.list({ search: 'Nomination', perPage: 10 });
      const nominationCat = catRes.items.find(
        (c) => c.slug === 'nomination' || c.name.toLowerCase() === 'nomination',
      );
      if (!nominationCat) return [];

      const subRes = await subcategoryService.list({
        categoryId: nominationCat.id,
        status: 'ACTIVE',
        perPage: 100,
        sortDir: 'asc',
      });

      return subRes.items.map((s) => s.name);
    } catch {
      return [];
    }
  },
};
