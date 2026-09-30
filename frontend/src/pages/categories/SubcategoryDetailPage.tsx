import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/Modal';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageLoader } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/Badge';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { subcategoryService } from '@/services/contentService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import type { Subcategory } from '@/types/content';
import { formatCategoryDate } from '@/pages/categories/CategoriesPage';

export function SubcategoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const subcategoryId = Number(id);
  const navigate = useNavigate();
  const toast = useToast();
  const { can } = useAuth();

  const [subcategory, setSubcategory] = useState<Subcategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(subcategoryId)) return;

    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await subcategoryService.get(subcategoryId);
        if (active) setSubcategory(result);
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : 'Subcategory not found.');
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [subcategoryId]);

  const handleDelete = async () => {
    if (!subcategory) return;
    setDeleting(true);
    try {
      await subcategoryService.remove(subcategory.id);
      toast.success('Subcategory deleted successfully.');
      navigate(ROUTES.SUBCATEGORIES);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error)?.message ||
        'Failed to delete subcategory.';
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <PageLoader label="Loading subcategory" />;
  }

  if (!subcategory || error) {
    return (
      <Alert tone="danger">
        {error ?? 'Subcategory not found.'}{' '}
        <Link to={ROUTES.SUBCATEGORIES}>Back to subcategories</Link>
      </Alert>
    );
  }

  const canManage = can(PERMISSIONS.MANAGE_CATEGORIES);

  return (
    <div className="page">
      <PageHeader
        title={subcategory.name}
        description={subcategory.slug}
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Subcategories', to: ROUTES.SUBCATEGORIES },
          { label: subcategory.name },
        ]}
        actions={
          <>
            {canManage && (
              <>
                <Link to={ROUTES.SUBCATEGORY_EDIT(subcategory.id)} className="btn btn--primary btn--md">
                  Edit
                </Link>
                <Button variant="danger" size="md" onClick={() => setShowDeleteConfirm(true)}>
                  Delete
                </Button>
              </>
            )}
            <Link to={ROUTES.SUBCATEGORIES} className="btn btn--secondary btn--md">
              Back
            </Link>
          </>
        }
      />

      <Card title="Details">
        <dl className="detail-list">
          <div>
            <dt>Category</dt>
            <dd>
              {subcategory.category ? (
                <Link to={ROUTES.CATEGORY_DETAIL(subcategory.category.id)}>{subcategory.category.name}</Link>
              ) : (
                '—'
              )}
            </dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>
              <StatusBadge status={subcategory.status} />
            </dd>
          </div>
          <div>
            <dt>Created</dt>
            <dd>{formatCategoryDate(subcategory.createdAt)}</dd>
          </div>
          {subcategory.description && (
            <div style={{ gridColumn: '1 / -1' }}>
              <dt>Description</dt>
              <dd>{subcategory.description}</dd>
            </div>
          )}
        </dl>
      </Card>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Subcategory"
        message={`Are you sure you want to delete subcategory "${subcategory.name}"?`}
        confirmLabel="Delete"
        destructive
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
