import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageLoader } from '@/components/ui/Spinner';
import { ROUTES } from '@/constants/routes';
import { categoryService, subcategoryService } from '@/services/contentService';
import { useToast } from '@/hooks/useToast';
import { slugify } from '@/utils/slugify';
import type { Category, RecordStatusType, SubcategoryFormValues } from '@/types/content';

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

export function SubcategoryFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const { id } = useParams<{ id: string }>();
  const subcategoryId = id ? Number(id) : undefined;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subcategoryName, setSubcategoryName] = useState('');

  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<RecordStatusType>('ACTIVE');

  useEffect(() => {
    let active = true;

    const loadCategories = async () => {
      try {
        const items = await categoryService.listActive();
        if (!active) return;
        setCategories(items);

        if (mode === 'create') {
          const prefill = searchParams.get('categoryId');
          const prefillId = prefill ? Number(prefill) : '';
          if (prefillId && items.some((item) => item.id === prefillId)) {
            setCategoryId(prefillId);
          } else if (items[0]) {
            setCategoryId(items[0].id);
          }
        }
      } catch {
        if (active) toast.warning('Active categories could not be loaded.');
      }
    };

    void loadCategories();

    return () => {
      active = false;
    };
  }, [mode, searchParams, toast]);

  useEffect(() => {
    if (mode !== 'edit' || !subcategoryId) return;

    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const subcategory = await subcategoryService.get(subcategoryId);
        if (!active) return;
        setSubcategoryName(subcategory.name);
        setCategoryId(subcategory.categoryId);
        setName(subcategory.name);
        setSlug(subcategory.slug);
        setSlugTouched(true);
        setDescription(subcategory.description ?? '');
        setStatus(subcategory.status);
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
  }, [mode, subcategoryId]);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  };

  const buildPayload = (): SubcategoryFormValues => ({
    categoryId: Number(categoryId),
    name: name.trim(),
    slug: slug.trim() || slugify(name),
    description: description.trim() || undefined,
    status,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !categoryId) return;

    setSaving(true);
    try {
      if (mode === 'create') {
        await subcategoryService.create(buildPayload());
        toast.success('Subcategory created successfully.');
      } else if (subcategoryId) {
        await subcategoryService.update(subcategoryId, buildPayload());
        toast.success('Subcategory updated successfully.');
      }
      navigate(ROUTES.SUBCATEGORIES);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save subcategory.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageLoader label="Loading subcategory" />;
  }

  if (mode === 'edit' && error) {
    return (
      <Alert tone="danger">
        {error} <Link to={ROUTES.SUBCATEGORIES}>Back to subcategories</Link>
      </Alert>
    );
  }

  return (
    <div className="page">
      <PageHeader
        title={mode === 'create' ? 'Create Subcategory' : 'Edit Subcategory'}
        description={mode === 'create' ? 'Add a subcategory under an active category.' : subcategoryName}
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Subcategories', to: ROUTES.SUBCATEGORIES },
          { label: mode === 'create' ? 'Create' : 'Edit' },
        ]}
        actions={
          <Link to={ROUTES.SUBCATEGORIES} className="btn btn--secondary btn--md">
            Back
          </Link>
        }
      />

      <Card>
        <form onSubmit={handleSubmit}>
          <div className="form-grid form-grid--2">
            <Select
              label="Category"
              required
              options={categories.map((category) => ({ value: category.id, label: category.name }))}
              placeholder="Select category"
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
            />

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
            <Button type="submit" variant="primary" size="md" disabled={saving || !categoryId}>
              {saving ? 'Saving…' : mode === 'create' ? 'Save Subcategory' : 'Update Subcategory'}
            </Button>
            <Link to={ROUTES.SUBCATEGORIES} className="btn btn--secondary btn--md">
              Cancel
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
