import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Spinner';
import { ROUTES } from '@/constants/routes';
import { articleService, subcategoryService } from '@/services/contentService';
import { useToast } from '@/hooks/useToast';
import type { ArticleFormValues, Subcategory } from '@/types/content';

export function ArticleFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [formData, setFormData] = useState<ArticleFormValues>({
    title: '',
    subcategoryId: 0,
    excerpt: '',
    content: '',
    featuredImage: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    isFeatured: false,
    allowComments: true,
  });

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    subcategoryService
      .list()
      .then((items) => {
        setSubcategories(items);
        if (!isEdit && items.length > 0 && !formData.subcategoryId) {
          setFormData((prev) => ({ ...prev, subcategoryId: items[0].id }));
        }
      })
      .catch(() => {});
  }, [isEdit, formData.subcategoryId]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    articleService
      .get(Number(id))
      .then((art) => {
        setFormData({
          title: art.title,
          subcategoryId: art.subcategoryId,
          excerpt: art.excerpt ?? '',
          content: art.content,
          featuredImage: art.featuredImage ?? '',
          seoTitle: art.seoTitle ?? '',
          seoDescription: art.seoDescription ?? '',
          seoKeywords: art.seoKeywords ?? '',
          isFeatured: art.isFeatured,
          allowComments: art.allowComments,
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load article.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === 'subcategoryId' ? Number(value) : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim() || !formData.subcategoryId) {
      toast.warning('Please fill in title, subcategory, and content.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (isEdit && id) {
        await articleService.update(Number(id), formData);
        toast.success('Article updated successfully.');
        navigate(ROUTES.ARTICLE_DETAIL(id));
      } else {
        const created = await articleService.create(formData);
        toast.success('Article created successfully.');
        navigate(ROUTES.ARTICLE_DETAIL(created.id));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save article.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="page">
      <header className="page__header">
        <div style={{ marginBottom: 'var(--space-100)' }}>
          <Link to={ROUTES.ARTICLES} className="btn btn--secondary btn--sm">
            ← Back to Articles
          </Link>
        </div>
        <h1 className="page__title">{isEdit ? 'Edit Article' : 'New Article'}</h1>
        <p className="page__subtitle">
          {isEdit ? 'Update content, metadata, and SEO details.' : 'Compose a new festival news piece or article.'}
        </p>
      </header>

      {error && <Alert tone="danger">{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-400)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-400)' }}>
            <Card title="General Details">
              <div className="field">
                <label className="field__label" htmlFor="artTitle">Title *</label>
                <input
                  id="artTitle"
                  name="title"
                  type="text"
                  required
                  className="field__control"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="artSub">Subcategory *</label>
                <select
                  id="artSub"
                  name="subcategoryId"
                  required
                  className="field__control"
                  value={formData.subcategoryId}
                  onChange={handleChange}
                >
                  <option value="">Select subcategory</option>
                  {subcategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="field__label" htmlFor="artExcerpt">Excerpt / Summary</label>
                <textarea
                  id="artExcerpt"
                  name="excerpt"
                  rows={2}
                  className="field__control"
                  placeholder="Short introductory summary..."
                  value={formData.excerpt ?? ''}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="artContent">Article Content *</label>
                <textarea
                  id="artContent"
                  name="content"
                  rows={10}
                  required
                  className="field__control"
                  placeholder="Write the full article body..."
                  value={formData.content}
                  onChange={handleChange}
                />
              </div>
            </Card>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-400)' }}>
            <Card title="Media & Options">
              <div className="field">
                <label className="field__label" htmlFor="artImage">Featured Image URL</label>
                <input
                  id="artImage"
                  name="featuredImage"
                  type="url"
                  className="field__control"
                  placeholder="https://..."
                  value={formData.featuredImage ?? ''}
                  onChange={handleChange}
                />
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-400)', marginTop: 'var(--space-200)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-150)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                  />
                  <span>Featured Post</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-150)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="allowComments"
                    checked={formData.allowComments}
                    onChange={handleChange}
                  />
                  <span>Allow Comments</span>
                </label>
              </div>
            </Card>

            <Card title="SEO Optimization">
              <div className="field">
                <label className="field__label" htmlFor="artSeoTitle">SEO Meta Title</label>
                <input
                  id="artSeoTitle"
                  name="seoTitle"
                  type="text"
                  className="field__control"
                  value={formData.seoTitle ?? ''}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="artSeoKeywords">SEO Keywords</label>
                <input
                  id="artSeoKeywords"
                  name="seoKeywords"
                  type="text"
                  className="field__control"
                  placeholder="durga puja, kolkata, festival"
                  value={formData.seoKeywords ?? ''}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="artSeoDesc">SEO Meta Description</label>
                <textarea
                  id="artSeoDesc"
                  name="seoDescription"
                  rows={3}
                  className="field__control"
                  value={formData.seoDescription ?? ''}
                  onChange={handleChange}
                />
              </div>
            </Card>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-200)', marginTop: 'var(--space-400)' }}>
          <Link to={ROUTES.ARTICLES} className="btn btn--secondary btn--md">
            Cancel
          </Link>
          <Button type="submit" variant="primary" size="md" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Update Article' : 'Create Article'}
          </Button>
        </div>
      </form>
    </div>
  );
}
