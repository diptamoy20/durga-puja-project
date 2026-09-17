import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageLoader } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/Badge';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { categoryService } from '@/services/contentService';
import { useAuth } from '@/hooks/useAuth';
import type { Category } from '@/types/content';
import { formatCategoryDate } from '@/pages/categories/CategoriesPage';

export function CategoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const categoryId = Number(id);
  const { can } = useAuth();

  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(categoryId)) return;

    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await categoryService.get(categoryId);
        if (active) setCategory(result);
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : 'Category not found.');
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [categoryId]);

  if (loading) {
    return <PageLoader label="Loading category" />;
  }

  if (!category || error) {
    return (
      <Alert tone="danger">
        {error ?? 'Category not found.'}{' '}
        <Link to={ROUTES.CATEGORIES}>Back to categories</Link>
      </Alert>
    );
  }

  const subcategories = category.subcategories ?? [];
  const canManage = can(PERMISSIONS.MANAGE_CATEGORIES);

  return (
    <div className="page">
      <PageHeader
        title={category.name}
        description={category.slug}
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Categories', to: ROUTES.CATEGORIES },
          { label: category.name },
        ]}
        actions={
          <>
            {canManage && (
              <Link to={ROUTES.CATEGORY_EDIT(category.id)} className="btn btn--primary btn--md">
                Edit
              </Link>
            )}
            <Link to={ROUTES.CATEGORIES} className="btn btn--secondary btn--md">
              Back
            </Link>
          </>
        }
      />

      <div className="form-grid form-grid--2">
        <Card title="Details">
          <dl className="detail-list">
            <div>
              <dt>Status</dt>
              <dd>
                <StatusBadge status={category.status} />
              </dd>
            </div>
            <div>
              <dt>Subcategories</dt>
              <dd>{category._count?.subcategories ?? subcategories.length}</dd>
            </div>
            <div>
              <dt>Created</dt>
              <dd>{formatCategoryDate(category.createdAt)}</dd>
            </div>
          </dl>
          {category.description && (
            <>
              <hr />
              <p style={{ margin: 0 }}>{category.description}</p>
            </>
          )}
        </Card>

        <Card
          title="Subcategories"
          actions={
            canManage ? (
              <Link
                to={`${ROUTES.SUBCATEGORY_NEW}?categoryId=${category.id}`}
                className="btn btn--primary btn--sm"
              >
                Add Subcategory
              </Link>
            ) : undefined
          }
        >
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }} />
                </tr>
              </thead>
              <tbody>
                {subcategories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="detail-empty">
                      No subcategories yet.
                    </td>
                  </tr>
                ) : (
                  subcategories.map((sub) => (
                    <tr key={sub.id}>
                      <td>{sub.name}</td>
                      <td>
                        <code>{sub.slug}</code>
                      </td>
                      <td>
                        <StatusBadge status={sub.status} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link to={ROUTES.SUBCATEGORY_DETAIL(sub.id)} className="btn btn--secondary btn--sm">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
