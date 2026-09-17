import api, { unwrap, unwrapList } from './api';
import type {
  Article,
  ArticleFormValues,
  ArticleListQuery,
  ArticleWorkflowAction,
  Category,
  Subcategory,
} from '@/types/content';
import type { PaginatedData } from '@/types';

function toParams(query: object): Record<string, string | number> {
  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== undefined && value !== '' && value !== null),
  ) as Record<string, string | number>;
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

  create: (values: ArticleFormValues): Promise<Article> =>
    unwrap(api.post('/articles', values)),

  update: (id: number, values: Partial<ArticleFormValues>): Promise<Article> =>
    unwrap(api.put(`/articles/${id}`, values)),

  remove: (id: number): Promise<{ id: number; deleted: boolean }> =>
    unwrap(api.delete(`/articles/${id}`)),

  workflow: (
    id: number,
    action: ArticleWorkflowAction,
    opts?: { comment?: string; scheduledAt?: string },
  ): Promise<Article> =>
    unwrap(api.post(`/articles/${id}/workflow`, { action, ...opts })),
};

export const categoryService = {
  list: async (query: { page?: number; perPage?: number; search?: string } = {}) => {
    const { items, pagination } = await unwrapList<Category>(
      api.get('/categories', { params: toParams(query) }),
    );
    return { items, pagination };
  },

  get: (id: number): Promise<Category> => unwrap(api.get(`/categories/${id}`)),

  create: (values: { name: string; description?: string }): Promise<Category> =>
    unwrap(api.post('/categories', values)),

  update: (id: number, values: { name?: string; description?: string; status?: string }): Promise<Category> =>
    unwrap(api.put(`/categories/${id}`, values)),

  remove: (id: number): Promise<{ id: number; deleted: boolean }> =>
    unwrap(api.delete(`/categories/${id}`)),
};

export const subcategoryService = {
  list: async (categoryId?: number) => {
    const params = categoryId ? { categoryId } : {};
    const items = await unwrap<Subcategory[]>(api.get('/subcategories', { params }));
    return items;
  },

  create: (values: { categoryId: number; name: string; description?: string }): Promise<Subcategory> =>
    unwrap(api.post('/subcategories', values)),

  update: (id: number, values: { name?: string; description?: string; status?: string }): Promise<Subcategory> =>
    unwrap(api.put(`/subcategories/${id}`, values)),

  remove: (id: number): Promise<{ id: number; deleted: boolean }> =>
    unwrap(api.delete(`/subcategories/${id}`)),
};
