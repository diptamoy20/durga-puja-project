import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { MediaPickerModal } from '@/components/articles/MediaPickerModal';
import { RichTextEditor } from '@/components/articles/RichTextEditor';
import { GalleryModuleHeader } from '@/components/gallery/GalleryModuleHeader';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Spinner';
import { ROUTES } from '@/constants/routes';
import { articleService, categoryService, subcategoryService } from '@/services/contentService';
import { userService } from '@/services/userService';
import { useToast } from '@/hooks/useToast';
import type { ArticleFormValues, Category, Subcategory } from '@/types/content';
import type { User } from '@/types';
import { articleFileUrl } from '@/utils/articleHelpers';
import { slugify } from '@/utils/slugify';

import '@/styles/articles-admin.css';

export function ArticleFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const slugEdited = useRef(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [authors, setAuthors] = useState<User[]>([]);
  const [articleCategoryId, setArticleCategoryId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ArticleFormValues>({
    title: '',
    slug: '',
    subcategoryId: 0,
    excerpt: '',
    content: '',
    featuredImage: '',
    tags: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    isFeatured: false,
    allowComments: true,
  });
  const [featuredPreview, setFeaturedPreview] = useState<string | null>(null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    categoryService.listActive().then((items) => {
      setCategories(items);
      const articleCat = items.find((c) => c.slug === 'article') ?? items[0];
      if (articleCat) setArticleCategoryId(articleCat.id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    userService
      .list({ perPage: 100, sortDir: 'asc' })
      .then((res) => setAuthors(res.items))
      .catch(() => setAuthors([]));
  }, []);

  useEffect(() => {
    if (!articleCategoryId) return;
    subcategoryService
      .list({ categoryId: articleCategoryId, perPage: 100, sortDir: 'asc', status: 'ACTIVE' })
      .then(({ items }) => {
        setSubcategories(items);
        if (!isEdit && items.length > 0) {
          setFormData((prev) => (prev.subcategoryId ? prev : { ...prev, subcategoryId: items[0].id }));
        }
      })
      .catch(() => setSubcategories([]));
  }, [articleCategoryId, isEdit]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    articleService
      .get(Number(id))
      .then((art) => {
        setFormData({
          title: art.title,
          slug: art.slug,
          subcategoryId: art.subcategoryId,
          authorId: art.authorId ?? undefined,
          excerpt: art.excerpt ?? '',
          content: art.content,
          featuredImage: art.featuredImage ?? '',
          tags: art.seoKeywords ?? '',
          seoTitle: art.seoTitle ?? '',
          seoDescription: art.seoDescription ?? '',
          seoKeywords: art.seoKeywords ?? '',
          isFeatured: art.isFeatured,
          allowComments: art.allowComments,
        });
        slugEdited.current = true;
        if (art.featuredImage) setFeaturedPreview(articleFileUrl(art.featuredImage));
        if (art.subcategory?.category?.id) setArticleCategoryId(art.subcategory.category.id);
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
    } else if (name === 'title') {
      setFormData((prev) => ({
        ...prev,
        title: value,
        slug: slugEdited.current ? prev.slug : slugify(value),
      }));
    } else if (name === 'slug') {
      slugEdited.current = true;
      setFormData((prev) => ({ ...prev, slug: value }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === 'subcategoryId' || name === 'authorId' ? Number(value) || undefined : value,
      }));
    }
  };

  const handleFeaturedFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData((prev) => ({ ...prev, featuredImageFile: file, featuredImage: undefined }));
    setFeaturedPreview(URL.createObjectURL(file));
  };

  const handleMediaPick = (url: string) => {
    setFormData((prev) => ({ ...prev, featuredImage: url, featuredImageFile: undefined }));
    setFeaturedPreview(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim() || !formData.subcategoryId) {
      toast.warning('Please fill in title, category, and content.');
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
        toast.success('Article saved as draft.');
        navigate(ROUTES.ARTICLE_DETAIL(created.id));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save article.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  const pageTitle = isEdit ? 'Edit Article' : 'New Article';

  return (
    <div className="page">
      <GalleryModuleHeader
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Articles', to: ROUTES.ARTICLES },
          { label: pageTitle },
        ]}
        title={pageTitle}
        subtitle={
          isEdit
            ? 'Update content, metadata, and SEO details.'
            : 'Compose a new editorial article for the festival news feed.'
        }
      />

      {error && <Alert tone="danger">{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <div className="article-form-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Card title="Article Details">
              <div className="field">
                <label className="field__label" htmlFor="artTitle">
                  Title <span className="field__required">*</span>
                </label>
                <input
                  id="artTitle"
                  name="title"
                  type="text"
                  required
                  className="field__control"
                  placeholder="Enter article title"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="artSlug">
                  Slug <span className="field__required">*</span>
                </label>
                <input
                  id="artSlug"
                  name="slug"
                  type="text"
                  required
                  className="field__control"
                  placeholder="article-slug"
                  value={formData.slug ?? ''}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="artCategory">
                  Category <span className="field__required">*</span>
                </label>
                <select
                  id="artCategory"
                  className="field__control"
                  value={articleCategoryId ?? ''}
                  onChange={(e) => setArticleCategoryId(Number(e.target.value))}
                >
                  <option value="" disabled>Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {authors.length > 0 && (
                <div className="field">
                  <label className="field__label" htmlFor="artAuthor">Author</label>
                  <select
                    id="artAuthor"
                    name="authorId"
                    className="field__control"
                    value={formData.authorId ?? ''}
                    onChange={handleChange}
                  >
                    <option value="">Current user (default)</option>
                    {authors.map((author) => (
                      <option key={author.id} value={author.id}>{author.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="field">
                <label className="field__label" htmlFor="artSub">
                  Subcategory <span className="field__required">*</span>
                </label>
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
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="field__label" htmlFor="artExcerpt">Short Description / Excerpt</label>
                <textarea
                  id="artExcerpt"
                  name="excerpt"
                  rows={2}
                  className="field__control"
                  placeholder="Brief summary of the article…"
                  value={formData.excerpt ?? ''}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="artContent">
                  Article Content <span className="field__required">*</span>
                </label>
                <RichTextEditor
                  id="artContent"
                  value={formData.content}
                  onChange={(html) => setFormData((prev) => ({ ...prev, content: html }))}
                />
              </div>
            </Card>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Card title="Featured Image & Tags">
              <div className="field">
                <label className="field__label" htmlFor="artImageFile">Featured Image</label>
                <input
                  id="artImageFile"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  className="field__control"
                  onChange={handleFeaturedFile}
                />
                {isEdit && !formData.featuredImageFile && (
                  <small className="field__hint">Current image is retained unless replaced.</small>
                )}
              </div>

              <Button type="button" variant="secondary" size="sm" onClick={() => setMediaPickerOpen(true)}>
                <i className="fas fa-images" aria-hidden="true" /> Pick from Media Library
              </Button>

              {featuredPreview && (
                <img src={featuredPreview} alt="Featured preview" className="article-featured-preview" />
              )}

              <div className="field" style={{ marginTop: 'var(--space-3)' }}>
                <label className="field__label" htmlFor="artTags">Tags</label>
                <input
                  id="artTags"
                  name="tags"
                  type="text"
                  className="field__control"
                  placeholder="culture, festival, art"
                  value={formData.tags ?? ''}
                  onChange={handleChange}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                  />
                  <span>Featured Article</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
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
                <label className="field__label" htmlFor="artSeoTitle">SEO Title</label>
                <input
                  id="artSeoTitle"
                  name="seoTitle"
                  type="text"
                  className="field__control"
                  placeholder="Custom meta title"
                  value={formData.seoTitle ?? ''}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="artSeoDesc">SEO Description</label>
                <input
                  id="artSeoDesc"
                  name="seoDescription"
                  type="text"
                  className="field__control"
                  placeholder="Custom meta description"
                  value={formData.seoDescription ?? ''}
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
                  placeholder="durga puja, kolkata"
                  value={formData.seoKeywords ?? ''}
                  onChange={handleChange}
                />
              </div>
            </Card>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
          <Link to={ROUTES.ARTICLES} className="btn btn--secondary btn--md">Cancel</Link>
          <Button type="submit" variant="primary" size="md" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Save Draft'}
          </Button>
        </div>
      </form>

      <MediaPickerModal
        open={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={handleMediaPick}
      />
    </div>
  );
}
