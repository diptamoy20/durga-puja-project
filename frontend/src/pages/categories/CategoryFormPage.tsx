import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageLoader } from '@/components/ui/Spinner';
import { ROUTES } from '@/constants/routes';
import { categoryService } from '@/services/contentService';
import { useToast } from '@/hooks/useToast';
import { slugify } from '@/utils/slugify';
import type { CategoryFormValues, RecordStatusType } from '@/types/content';

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

export function CategoryFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const { id } = useParams<{ id: string }>();
  const categoryId = id ? Number(id) : undefined;
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState('');

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<RecordStatusType>('ACTIVE');

  useEffect(() => {
    if (mode !== 'edit' || !categoryId) return;

    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const category = await categoryService.get(categoryId);
        if (!active) return;
        setCategoryName(category.name);
        setName(category.name);
        setSlug(category.slug);
        setSlugTouched(true);
        setDescription(category.description ?? '');
        setStatus(category.status);
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
  }, [mode, categoryId]);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  };

  const buildPayload = (): CategoryFormValues => ({
    name: name.trim(),
    slug: slug.trim() || slugify(name),
    description: description.trim() || undefined,
    status,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      if (mode === 'create') {
        await categoryService.create(buildPayload());
        toast.success('Category created successfully.');
      } else if (categoryId) {
        await categoryService.update(categoryId, buildPayload());
        toast.success('Category updated successfully.');
      }
      navigate(ROUTES.CATEGORIES);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save category.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageLoader label="Loading category" />;
  }

  if (mode === 'edit' && error) {
    return (
      <Alert tone="danger">
        {error} <Link to={ROUTES.CATEGORIES}>Back to categories</Link>
      </Alert>
    );
  }

  return (
    <div className="page">
      <PageHeader
        title={mode === 'create' ? 'Create Category' : 'Edit Category'}
        description={mode === 'create' ? 'Add a new master category.' : categoryName}
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Categories', to: ROUTES.CATEGORIES },
          { label: mode === 'create' ? 'Create' : 'Edit' },
        ]}
        actions={
          <Link to={ROUTES.CATEGORIES} className="btn btn--secondary btn--md">
            Back
          </Link>
        }
      />

      <Card>
        <form onSubmit={handleSubmit}>
          <div className="form-grid form-grid--2">
            <Input
              label="Name"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
            />

            <Input
              label="Slug"
              required
              hint="Auto-generated from name when left empty"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
            />

            <Select
              label="Status"
              required
              options={STATUS_OPTIONS}
              value={status}
              onChange={(e) => setStatus(e.target.value as RecordStatusType)}
            />
          </div>

          <Textarea
            label="Description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="form-actions">
            <Button type="submit" variant="primary" size="md" disabled={saving}>
              {saving ? 'Saving…' : mode === 'create' ? 'Save Category' : 'Update Category'}
            </Button>
            <Link to={ROUTES.CATEGORIES} className="btn btn--secondary btn--md">
              Cancel
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
