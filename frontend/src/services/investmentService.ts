import api, { unwrap, unwrapList } from './api';
import type {
  InvestmentOpportunity,
  InvestmentOpportunityFormValues,
  InvestmentWorkflowAction,
  IndustryAssociation,
  IndustryAssociationFormValues,
  InvestmentEnquiry,
  InvestmentEnquiryFormValues,
  InvestmentListQuery,
  InvestmentAdminStats,
} from '@/types/investments';
import type { PaginatedData } from '@/types';

function toParams(query: object): Record<string, string | number> {
  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== undefined && value !== '' && value !== null),
  ) as Record<string, string | number>;
}

// Public Investor Showcase API
export const publicInvestmentService = {
  opportunities: {
    list: async (query: InvestmentListQuery = {}): Promise<PaginatedData<InvestmentOpportunity>> => {
      const { items, pagination } = await unwrapList<InvestmentOpportunity>(
        api.get('/investments', { params: toParams(query) }),
      );
      return {
        items,
        pagination: pagination ?? {
          page: 1,
          perPage: items.length,
          total: items.length,
          lastPage: 1,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      };
    },

    featured: async (): Promise<InvestmentOpportunity[]> => {
      return unwrap<InvestmentOpportunity[]>(api.get('/investments/featured'));
    },

    get: (slug: string): Promise<InvestmentOpportunity> => {
      return unwrap(api.get(`/investments/${slug}`));
    },
  },

  associations: {
    list: (category?: string): Promise<IndustryAssociation[]> => {
      return unwrap(api.get('/investments/associations', { params: category ? { category } : {} }));
    },
  },

  enquiries: {
    submit: (data: InvestmentEnquiryFormValues): Promise<InvestmentEnquiry> => {
      return unwrap(api.post('/investments/enquiries', data));
    },
  },
};

// Admin Investor Showcase API
export const adminInvestmentService = {
  stats: (): Promise<InvestmentAdminStats> => {
    return unwrap(api.get('/admin/investments/stats'));
  },

  opportunities: {
    list: async (query: InvestmentListQuery = {}): Promise<PaginatedData<InvestmentOpportunity>> => {
      const { items, pagination } = await unwrapList<InvestmentOpportunity>(
        api.get('/admin/investments', { params: toParams(query) }),
      );
      return {
        items,
        pagination: pagination ?? {
          page: 1,
          perPage: items.length,
          total: items.length,
          lastPage: 1,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      };
    },

    get: (id: number): Promise<InvestmentOpportunity> => {
      return unwrap(api.get(`/admin/investments/${id}`));
    },

    create: (data: InvestmentOpportunityFormValues): Promise<InvestmentOpportunity> => {
      return unwrap(api.post('/admin/investments', data));
    },

    update: (id: number, data: Partial<InvestmentOpportunityFormValues>): Promise<InvestmentOpportunity> => {
      return unwrap(api.put(`/admin/investments/${id}`, data));
    },

    workflow: (
      id: number,
      action: InvestmentWorkflowAction,
      comment?: string,
    ): Promise<InvestmentOpportunity> => {
      return unwrap(api.post(`/admin/investments/${id}/workflow`, { action, comment }));
    },

    remove: (id: number): Promise<{ id: number; deleted: boolean }> => {
      return unwrap(api.delete(`/admin/investments/${id}`));
    },
  },

  associations: {
    list: (query: { category?: string; search?: string } = {}): Promise<IndustryAssociation[]> => {
      return unwrap(api.get('/admin/investments/associations', { params: toParams(query) }));
    },

    create: (data: IndustryAssociationFormValues): Promise<IndustryAssociation> => {
      return unwrap(api.post('/admin/investments/associations', data));
    },

    update: (id: number, data: Partial<IndustryAssociationFormValues>): Promise<IndustryAssociation> => {
      return unwrap(api.put(`/admin/investments/associations/${id}`, data));
    },

    remove: (id: number): Promise<{ id: number; deleted: boolean }> => {
      return unwrap(api.delete(`/admin/investments/associations/${id}`));
    },
  },

  enquiries: {
    list: async (query: { status?: string; opportunityId?: number; associationId?: number; search?: string; page?: number; perPage?: number } = {}): Promise<PaginatedData<InvestmentEnquiry>> => {
      const { items, pagination } = await unwrapList<InvestmentEnquiry>(
        api.get('/admin/investments/enquiries', { params: toParams(query) }),
      );
      return {
        items,
        pagination: pagination ?? {
          page: 1,
          perPage: items.length,
          total: items.length,
          lastPage: 1,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      };
    },

    get: (id: number): Promise<InvestmentEnquiry> => {
      return unwrap(api.get(`/admin/investments/enquiries/${id}`));
    },

    updateStatus: (
      id: number | string,
      payload: { status?: string; adminRemarks?: string; adminNotes?: string; assignedToId?: number | null; assignedAssociationId?: string | number; comment?: string },
    ): Promise<InvestmentEnquiry> => {
      return unwrap(api.patch(`/admin/investments/enquiries/${id}/status`, payload));
    },
  },

  // Direct convenience aliases
  getAssociations: (query: { category?: string; search?: string } = {}): Promise<IndustryAssociation[]> => {
    return unwrap(api.get('/admin/investments/associations', { params: toParams(query) }));
  },
  createAssociation: (data: Partial<IndustryAssociationFormValues> | any): Promise<IndustryAssociation> => {
    return unwrap(api.post('/admin/investments/associations', data));
  },
  updateAssociation: (id: number | string, data: Partial<IndustryAssociationFormValues> | any): Promise<IndustryAssociation> => {
    return unwrap(api.put(`/admin/investments/associations/${id}`, data));
  },
  deleteAssociation: (id: number | string): Promise<{ id: number | string; deleted: boolean }> => {
    return unwrap(api.delete(`/admin/investments/associations/${id}`));
  },

  getEnquiries: async (query: { status?: string; opportunityId?: number; associationId?: number; assignedAssociationId?: string; search?: string; page?: number; limit?: number; perPage?: number } = {}): Promise<{ items: InvestmentEnquiry[]; total: number }> => {
    const { items, pagination } = await unwrapList<InvestmentEnquiry>(
      api.get('/admin/investments/enquiries', { params: toParams(query) }),
    );
    return {
      items,
      total: pagination?.total ?? items.length,
    };
  },
  getEnquiryById: (id: number | string): Promise<InvestmentEnquiry> => {
    return unwrap(api.get(`/admin/investments/enquiries/${id}`));
  },
  updateEnquiryStatus: (
    id: number | string,
    payload: { status?: string; adminRemarks?: string; adminNotes?: string; assignedToId?: number | null; assignedAssociationId?: string | number; comment?: string },
  ): Promise<InvestmentEnquiry> => {
    return unwrap(api.patch(`/admin/investments/enquiries/${id}/status`, payload));
  },
};

