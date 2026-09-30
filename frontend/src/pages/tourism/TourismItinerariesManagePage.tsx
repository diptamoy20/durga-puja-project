import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { adminTourismService } from '@/services/tourismService';
import { ROUTES } from '@/constants/routes';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Modal } from '@/components/ui/Modal';
import type { TourismItinerary, ItineraryDayPlan } from '@/types/tourism';

export interface DayPlanFormItem {
  day: number;
  title: string;
  morning: string;
  afternoon: string;
  evening: string;
  night: string;
  pandals: string;
  foodHighlights: string;
  transportTip: string;
}

const DEFAULT_TARGET_AUDIENCES = [
  'Diaspora Visitors & First-Time Tourists',
  'Heritage Architecture & Bonedi Bari Enthusiasts',
  'Senior Citizens & Families with Children',
  'VIP & Luxury Express Explorers',
  'Night-Owl Carnival & Food Trail Revelers',
  'Art & Contemporary Theme Connoisseurs',
  'Budget Backpackers & Solo Explorers',
];

const SUGGESTED_HIGHLIGHTS = [
  'VIP Pandal Express Entry',
  'Air-Conditioned Coach / Metro Transit',
  'Traditional Royal Bhog Feast',
  'Certified Heritage Guide',
  'Chartered Ganga River Cruise',
  'Behind-the-Scenes Artisan Walk',
];

export function TourismItinerariesManagePage() {
  const [itineraries, setItineraries] = useState<TourismItinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [durationFilter, setDurationFilter] = useState('all');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<TourismItinerary | null>(null);
  const [saving, setSaving] = useState(false);
  const [isCustomAudience, setIsCustomAudience] = useState(false);
  const [customAudienceInput, setCustomAudienceInput] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    durationDays: 3,
    targetAudience: DEFAULT_TARGET_AUDIENCES[0],
    overview: '',
    includedHighlights: 'VIP Pandal Passes, Guided Walking Tour, Royal Bhog Lunch',
    coverImageUrl: '',
    isCurated: true,
    isActive: true,
  });

  const [dayPlans, setDayPlans] = useState<DayPlanFormItem[]>([]);
  const [activeDayTab, setActiveDayTab] = useState<number>(0);

  useEffect(() => {
    loadItineraries();
  }, []);

  const loadItineraries = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminTourismService.itineraries.list();
      setItineraries(res.items || []);
    } catch (err) {
      console.error('Failed to load itineraries:', err);
      setError('Unable to load curated itineraries.');
    } finally {
      setLoading(false);
    }
  };

  const createInitialDayPlans = (count: number): DayPlanFormItem[] => {
    const templates: DayPlanFormItem[] = [
      {
        day: 1,
        title: 'North Kolkata Heritage & Bonedi Bari Awakening',
        morning: 'Morning walking tour through Kumartuli artisan idol-making quarters.',
        afternoon: 'Authentic Bengali Bhog lunch and heritage courtyard viewing at Shovabazar Rajbari.',
        evening: 'Illuminated pandal hopping across Bagbazar Sarbojanin, Ahiritola, and Hatibagan.',
        night: 'Late-night street food exploration along College Street.',
        pandals: 'Kumartuli Park, Shovabazar Rajbari, Bagbazar Sarbojanin',
        foodHighlights: 'Traditional Bhog, Mitra Cafe Kabiraji, Sandesh',
        transportTip: 'North Kolkata Heritage Walk & Green Line Metro',
      },
      {
        day: 2,
        title: 'South Kolkata Contemporary Art & Thematic Marvels',
        morning: 'Ganga river ferry crossing to Belur Math / Dakshineswar sanctums.',
        afternoon: 'Traditional lunch at Ballygunge and visit to cultural exhibitions.',
        evening: 'Grand theme pandal trail: Ekdalia Evergreen, Singhi Park, Suruchi Sangha, Maddox Square.',
        night: 'Maddox Square open-air adda & concert experience.',
        pandals: 'Ekdalia Evergreen, Singhi Park, Suruchi Sangha, Maddox Square',
        foodHighlights: 'Kolkata Biryani at Arsalan, Mishti Doi',
        transportTip: 'AC Parikrama Coach & Blue Line Metro',
      },
      {
        day: 3,
        title: 'Carnival Night, Dashami Immersion & Farewell Feasts',
        morning: 'Sindoor Khela ceremonies at ancient aristocratic households.',
        afternoon: 'Shubho Bijoya sweet-sharing exchanges and festive gatherings.',
        evening: 'Chartered River Cruise from Babu Ghat witnessing twilight idol immersions.',
        night: 'Grand farewell gala dinner with traditional Bengal delicacies.',
        pandals: 'Babu Ghat, Bagbazar Ghat, Tridhara Sammilani',
        foodHighlights: 'Labanga Latika, Joynagarer Moa, Darjeeling Tea',
        transportTip: 'Chartered River Vessel from Millennium Park Jetty',
      },
    ];

    const result: DayPlanFormItem[] = [];
    for (let i = 1; i <= count; i++) {
      if (templates[i - 1]) {
        result.push({ ...templates[i - 1], day: i });
      } else {
        result.push({
          day: i,
          title: `Day ${i}: Festive Exploration & Cultural Trail`,
          morning: '',
          afternoon: '',
          evening: '',
          night: '',
          pandals: '',
          foodHighlights: '',
          transportTip: '',
        });
      }
    }
    return result;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('Selected image exceeds 15MB limit. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const resultStr = readerEvent.target?.result;
      if (typeof resultStr !== 'string') return;

      const img = new Image();
      img.onload = () => {
        const maxWidth = 1280;
        const maxHeight = 800;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setFormData((prev) => ({ ...prev, coverImageUrl: compressedDataUrl }));
        } else {
          setFormData((prev) => ({ ...prev, coverImageUrl: resultStr }));
        }
      };
      img.onerror = () => {
        setFormData((prev) => ({ ...prev, coverImageUrl: resultStr }));
      };
      img.src = resultStr;
    };
    reader.readAsDataURL(file);
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setIsCustomAudience(false);
    setCustomAudienceInput('');
    setActiveDayTab(0);

    setFormData({
      title: '',
      slug: '',
      durationDays: 3,
      targetAudience: DEFAULT_TARGET_AUDIENCES[0],
      overview: '',
      includedHighlights: 'VIP Pandal Passes, Guided Walking Tour, Royal Bhog Lunch',
      coverImageUrl: 'https://images.unsplash.com/photo-1571216332002-282dce467b32?w=1200',
      isCurated: true,
      isActive: true,
    });

    const initialDays = createInitialDayPlans(3);
    setDayPlans(initialDays);
    setShowModal(true);
  };

  const handleOpenEdit = (item: TourismItinerary) => {
    setEditingItem(item);
    const isCustom = !DEFAULT_TARGET_AUDIENCES.includes(item.targetAudience);
    setIsCustomAudience(isCustom);
    setCustomAudienceInput(isCustom ? item.targetAudience : '');
    setActiveDayTab(0);

    setFormData({
      title: item.title,
      slug: item.slug,
      durationDays: item.durationDays,
      targetAudience: item.targetAudience,
      overview: item.overview,
      includedHighlights: (item.includedHighlights || []).join(', '),
      coverImageUrl: item.coverImageUrl || '',
      isCurated: item.isCurated,
      isActive: item.isActive,
    });

    // Parse existing day plans into form items
    const parsedDays: DayPlanFormItem[] = (item.dayPlans || []).map((dp, idx) => ({
      day: dp.day || idx + 1,
      title: dp.title || `Day ${idx + 1}`,
      morning: dp.morning || '',
      afternoon: dp.afternoon || '',
      evening: dp.evening || '',
      night: dp.night || '',
      pandals: Array.isArray(dp.pandals) ? dp.pandals.join(', ') : (dp.pandals || ''),
      foodHighlights: dp.foodHighlights || '',
      transportTip: dp.transportTip || '',
    }));

    const finalDays = parsedDays.length > 0 ? parsedDays : createInitialDayPlans(item.durationDays || 3);
    setDayPlans(finalDays);
    setShowModal(true);
  };

  const serializeDayPlans = (items: DayPlanFormItem[]): ItineraryDayPlan[] => {
    return items.map((dp, idx) => ({
      day: Number(dp.day) || idx + 1,
      title: dp.title.trim() || `Day ${idx + 1}`,
      morning: dp.morning.trim() || '',
      afternoon: dp.afternoon.trim() || '',
      evening: dp.evening.trim() || '',
      night: dp.night.trim() || '',
      pandals: dp.pandals ? dp.pandals.split(',').map((p) => p.trim()).filter(Boolean) : [],
      foodHighlights: dp.foodHighlights.trim() || '',
      transportTip: dp.transportTip.trim() || '',
    }));
  };

  const handleDayPlanChange = (index: number, field: keyof DayPlanFormItem, value: string | number) => {
    setDayPlans((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddDay = () => {
    setDayPlans((prev) => {
      const nextDayNum = prev.length + 1;
      const updated = [
        ...prev,
        {
          day: nextDayNum,
          title: `Day ${nextDayNum}: Festive Experience`,
          morning: '',
          afternoon: '',
          evening: '',
          night: '',
          pandals: '',
          foodHighlights: '',
          transportTip: '',
        },
      ];
      setFormData((f) => ({ ...f, durationDays: updated.length }));
      setActiveDayTab(updated.length - 1);
      return updated;
    });
  };

  const handleRemoveDay = (index: number) => {
    if (dayPlans.length <= 1) {
      alert('An itinerary must contain at least 1 day plan.');
      return;
    }
    setDayPlans((prev) => {
      const filtered = prev.filter((_, idx) => idx !== index).map((d, idx) => ({ ...d, day: idx + 1 }));
      setFormData((f) => ({ ...f, durationDays: filtered.length }));
      return filtered;
    });
    setActiveDayTab((curr) => Math.max(0, Math.min(curr, dayPlans.length - 2)));
  };

  const handleDurationChange = (newDuration: number) => {
    if (isNaN(newDuration) || newDuration < 1) {
      setFormData((p) => ({ ...p, durationDays: 1 }));
      setDayPlans((prev) => {
        return prev.length > 0 ? [prev[0]] : createInitialDayPlans(1);
      });
      return;
    }

    const validDuration = Math.max(1, Math.min(15, newDuration));
    setFormData((p) => ({ ...p, durationDays: validDuration }));

    setDayPlans((prev) => {
      if (prev.length === validDuration) {
        return prev;
      } else if (prev.length > validDuration) {
        return prev.slice(0, validDuration).map((d, idx) => ({ ...d, day: idx + 1 }));
      } else {
        const templates = createInitialDayPlans(validDuration);
        const extra: DayPlanFormItem[] = [];
        for (let i = prev.length + 1; i <= validDuration; i++) {
          const tpl = templates[i - 1];
          extra.push(
            tpl
              ? { ...tpl, day: i }
              : {
                  day: i,
                  title: `Day ${i}: Festive Experience & Pandals`,
                  morning: '',
                  afternoon: '',
                  evening: '',
                  night: '',
                  pandals: '',
                  foodHighlights: '',
                  transportTip: '',
                },
          );
        }
        return [...prev, ...extra];
      }
    });
  };

  const handleAddHighlightChip = (highlight: string) => {
    const current = formData.includedHighlights ? formData.includedHighlights.split(',').map((h) => h.trim()).filter(Boolean) : [];
    if (!current.includes(highlight)) {
      current.push(highlight);
      setFormData((p) => ({ ...p, includedHighlights: current.join(', ') }));
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Are you sure you want to delete itinerary "${title}"?`)) return;
    try {
      await adminTourismService.itineraries.remove(id);
      setItineraries((prev) => prev.filter((it) => it.id !== id));
    } catch (err) {
      console.error('Failed to delete itinerary:', err);
      alert('Failed to delete itinerary.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const finalDayPlans = serializeDayPlans(dayPlans);

      const finalAudience = isCustomAudience ? customAudienceInput.trim() : formData.targetAudience.trim();
      if (!finalAudience) {
        alert('Please specify a target audience.');
        setSaving(false);
        return;
      }

      const payload = {
        title: formData.title.trim(),
        slug: formData.slug.trim() || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        durationDays: Number(formData.durationDays) || dayPlans.length,
        targetAudience: finalAudience,
        overview: formData.overview.trim(),
        includedHighlights: formData.includedHighlights.split(',').map((h) => h.trim()).filter(Boolean),
        dayPlans: finalDayPlans,
        coverImageUrl: formData.coverImageUrl.trim() || null,
        isCurated: formData.isCurated,
        isActive: formData.isActive,
      };

      if (editingItem) {
        await adminTourismService.itineraries.update(editingItem.id, payload);
      } else {
        await adminTourismService.itineraries.create(payload);
      }

      setShowModal(false);
      loadItineraries();
    } catch (err: unknown) {
      console.error('Failed to save itinerary:', err);
      const errMsg = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || (err as Error)?.message || 'Failed to save itinerary.';
      alert(`Error saving itinerary: ${errMsg}`);
    } finally {
      setSaving(false);
    }
  };

  const filteredItineraries = useMemo(() => {
    return itineraries.filter((item) => {
      const matchDuration =
        durationFilter === 'all' ||
        (durationFilter === 'short' && item.durationDays <= 3) ||
        (durationFilter === 'long' && item.durationDays > 3);

      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.targetAudience.toLowerCase().includes(q) ||
        item.overview.toLowerCase().includes(q);

      return matchDuration && matchQuery;
    });
  }, [itineraries, durationFilter, searchQuery]);

  return (
    <div className="page">
      <PageHeader
        title="Curated Tour Itineraries"
        description="Build multi-day puja itineraries with structured morning, afternoon, evening, and pandal schedules."
        breadcrumbs={[{ label: 'Dashboard', to: ROUTES.DASHBOARD }, { label: 'Tourism Concierge' }]}
        actions={
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Button variant="primary" size="md" onClick={handleOpenCreate}>
              + Create Itinerary
            </Button>
            <Link to={ROUTES.PUBLIC_TOURISM_ITINERARIES} target="_blank" className="btn btn--outline btn--md">
              Public View ↗
            </Link>
          </div>
        }
      />

      {error && <Alert tone="danger">{error}</Alert>}

      {/* Filter Card */}
      <Card className="mb-4">
        <form
          className="form-grid form-grid--3"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <div className="field">
            <label className="field__label" htmlFor="itin-search">
              Search Itineraries
            </label>
            <input
              id="itin-search"
              type="search"
              className="field__control"
              placeholder="Search title, target audience..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="itin-duration-filter">
              Duration Filter
            </label>
            <select
              id="itin-duration-filter"
              className="field__control"
              value={durationFilter}
              onChange={(e) => setDurationFilter(e.target.value)}
            >
              <option value="all">All Durations ({itineraries.length})</option>
              <option value="short">1 - 3 Days (Express)</option>
              <option value="long">4 - 7+ Days (Immersive)</option>
            </select>
          </div>

          <div className="field" style={{ alignSelf: 'end' }}>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => {
                  setDurationFilter('all');
                  setSearchQuery('');
                }}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* Table Card */}
      <Card>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Cover</th>
                <th>Itinerary Title</th>
                <th>Duration</th>
                <th>Target Audience</th>
                <th>Day Plans</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                    Loading curated itineraries…
                  </td>
                </tr>
              ) : filteredItineraries.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                    {itineraries.length === 0 ? 'No curated itineraries found.' : 'No itineraries match your search.'}
                  </td>
                </tr>
              ) : (
                filteredItineraries.map((it) => (
                  <tr key={it.id}>
                    <td>
                      {it.coverImageUrl ? (
                        <img
                          src={it.coverImageUrl}
                          alt={it.title}
                          style={{
                            width: '56px',
                            height: '40px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            border: '1px solid var(--colour-border)',
                            display: 'block',
                          }}
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '56px',
                            height: '40px',
                            borderRadius: '4px',
                            background: 'var(--colour-canvas)',
                            border: '1px solid var(--colour-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                          }}
                        >
                          🗓️
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--colour-brand)' }}>{it.title}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--colour-ink-soft)', marginTop: '2px' }}>
                        /{it.slug}
                      </div>
                    </td>
                    <td>
                      <Badge variant="warning">⏳ {it.durationDays} Days</Badge>
                    </td>
                    <td style={{ color: 'var(--colour-ink-soft)', fontSize: '12.5px' }}>
                      {it.targetAudience}
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>
                        {it.dayPlans?.length || 0} scheduled days
                      </span>
                    </td>
                    <td>
                      <Badge variant={it.isActive ? 'success' : 'neutral'}>
                        {it.isActive ? 'Active' : 'Draft'}
                      </Badge>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 'var(--space-1)' }}>
                        <Button variant="secondary" size="sm" onClick={() => handleOpenEdit(it)}>
                          Edit
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(it.id, it.title)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal with Visual Day-by-Day Builder */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingItem ? 'Edit Curated Itinerary' : 'Create Curated Itinerary'}
        size="2xl"
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Section 1: Core Details & Banner (2-column responsive grid) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '18px',
              background: 'var(--colour-canvas)',
              padding: '18px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--colour-border)',
            }}
          >
            {/* Left Column: Metadata & Overview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="field">
                <label className="field__label" htmlFor="itin-title">
                  Itinerary Title *
                </label>
                <input
                  id="itin-title"
                  type="text"
                  className="field__control"
                  required
                  placeholder="e.g. 3-Day Grand Royal Kolkata Durga Puja Odyssey"
                  value={formData.title}
                  onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="itin-duration">
                  Duration (Days) *
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <input
                    id="itin-duration"
                    type="number"
                    min={1}
                    max={15}
                    required
                    className="field__control"
                    style={{ width: '70px', textAlign: 'center', fontWeight: 700 }}
                    value={formData.durationDays || ''}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) {
                        handleDurationChange(val);
                      } else {
                        setFormData((p) => ({ ...p, durationDays: 0 }));
                      }
                    }}
                    onBlur={() => {
                      if (!formData.durationDays || formData.durationDays < 1) {
                        handleDurationChange(1);
                      }
                    }}
                  />
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {[1, 2, 3, 4, 5, 7].map((num) => (
                      <Button
                        key={num}
                        type="button"
                        variant={formData.durationDays === num ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => handleDurationChange(num)}
                      >
                        {num}D
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="field">
                <label className="field__label" htmlFor="itin-audience-select">
                  Target Traveler Profile *
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <select
                    id="itin-audience-select"
                    className="field__control"
                    required={!isCustomAudience}
                    value={isCustomAudience ? '__custom__' : formData.targetAudience}
                    onChange={(e) => {
                      if (e.target.value === '__custom__') {
                        setIsCustomAudience(true);
                        setCustomAudienceInput('');
                        setFormData((p) => ({ ...p, targetAudience: '' }));
                      } else {
                        setIsCustomAudience(false);
                        setFormData((p) => ({ ...p, targetAudience: e.target.value }));
                      }
                    }}
                  >
                    <optgroup label="Traveler Profiles">
                      {DEFAULT_TARGET_AUDIENCES.map((aud) => (
                        <option key={aud} value={aud}>
                          {aud}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Custom">
                      <option value="__custom__">➕ Enter Custom Traveler Profile...</option>
                    </optgroup>
                  </select>

                  {isCustomAudience && (
                    <input
                      type="text"
                      className="field__control"
                      required
                      placeholder="Type custom traveler profile..."
                      value={customAudienceInput}
                      onChange={(e) => setCustomAudienceInput(e.target.value)}
                      autoFocus
                    />
                  )}
                </div>
              </div>

              <div className="field">
                <label className="field__label" htmlFor="itin-overview">
                  Tour Overview & Highlights *
                </label>
                <textarea
                  id="itin-overview"
                  className="field__control"
                  rows={3}
                  required
                  placeholder="Summarize the essence of this tour, special permissions, and cultural takeaways..."
                  value={formData.overview}
                  onChange={(e) => setFormData((p) => ({ ...p, overview: e.target.value }))}
                />
              </div>
            </div>

            {/* Right Column: Inclusions & Banner Photo */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="field">
                <label className="field__label" htmlFor="itin-highlights">
                  Key Inclusions (comma-separated)
                </label>
                <input
                  id="itin-highlights"
                  type="text"
                  className="field__control"
                  placeholder="e.g. VIP Pandal Passes, Guided Walking Tour, Royal Bhog Lunch"
                  value={formData.includedHighlights}
                  onChange={(e) => setFormData((p) => ({ ...p, includedHighlights: e.target.value }))}
                />
                <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--colour-ink-soft)', alignSelf: 'center', marginRight: '4px' }}>
                    + Quick Add:
                  </span>
                  {SUGGESTED_HIGHLIGHTS.map((chip) => (
                    <Button
                      key={chip}
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => handleAddHighlightChip(chip)}
                      style={{ fontSize: '11px', padding: '2px 7px' }}
                    >
                      + {chip}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="field" style={{ background: 'var(--colour-surface)', border: '1px solid var(--colour-border)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
                <label className="field__label" style={{ marginBottom: '8px' }}>
                  📸 Itinerary Cover Photo & Visual Banner
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <label className="btn btn--outline btn--sm" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      📁 Upload Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                      />
                    </label>
                    <span style={{ fontSize: '11.5px', color: 'var(--colour-ink-soft)' }}>or image URL:</span>
                  </div>

                  <input
                    type="text"
                    className="field__control"
                    placeholder="https://images.unsplash.com/... or paste image URL"
                    value={formData.coverImageUrl}
                    onChange={(e) => setFormData((p) => ({ ...p, coverImageUrl: e.target.value }))}
                  />

                  {formData.coverImageUrl && (
                    <div style={{ position: 'relative', marginTop: '4px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--colour-border)', maxHeight: '110px', background: '#000' }}>
                      <img
                        src={formData.coverImageUrl}
                        alt="Itinerary Preview"
                        style={{ width: '100%', height: '110px', objectFit: 'cover', display: 'block' }}
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, coverImageUrl: '' }))}
                        style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', borderRadius: '4px', padding: '3px 6px', fontSize: '11px', cursor: 'pointer' }}
                      >
                        ✕ Remove Photo
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Visual Day-by-Day Schedule Builder with Tabs */}
          <div
            style={{
              background: 'var(--colour-surface)',
              border: '1px solid var(--colour-border)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--colour-ink)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🗓️</span> Day-by-Day Schedule Builder ({dayPlans.length} {dayPlans.length === 1 ? 'Day' : 'Days'})
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--colour-ink-soft)' }}>
                  Switch tabs below to edit each day plan.
                </p>
              </div>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddDay}
              >
                ➕ Add Day {dayPlans.length + 1}
              </Button>
            </div>

            {/* Horizontal Day Tabs */}
            <div
              style={{
                display: 'flex',
                gap: '6px',
                overflowX: 'auto',
                paddingBottom: '8px',
                marginBottom: '14px',
                borderBottom: '1px solid var(--colour-border)',
              }}
            >
              {dayPlans.map((dp, idx) => {
                const safeTab = Math.min(activeDayTab, Math.max(0, dayPlans.length - 1));
                const isActive = idx === safeTab;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveDayTab(idx)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '12.5px',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? '#fff' : 'var(--colour-ink)',
                      background: isActive ? 'var(--colour-brand)' : 'var(--colour-canvas)',
                      border: `1px solid ${isActive ? 'var(--colour-brand)' : 'var(--colour-border)'}`,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>Day {dp.day}</span>
                    {dp.title && (
                      <span style={{ fontSize: '11px', opacity: isActive ? 0.9 : 0.6, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        • {dp.title}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active Day Plan Content */}
            {(() => {
              const safeTab = Math.min(activeDayTab, Math.max(0, dayPlans.length - 1));
              const currentDayPlan = dayPlans[safeTab];
              if (!currentDayPlan) return null;

              return (
                <div
                  style={{
                    background: 'var(--colour-canvas)',
                    border: '1px solid var(--colour-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                  }}
                >
                  {/* Header row for selected Day */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                      <Badge variant="warning">Day {currentDayPlan.day}</Badge>
                      <input
                        type="text"
                        required
                        className="field__control"
                        placeholder={`Day ${currentDayPlan.day} Theme / Title (e.g. North Kolkata Heritage & Bonedi Bari Awakening)`}
                        value={currentDayPlan.title}
                        onChange={(e) => handleDayPlanChange(safeTab, 'title', e.target.value)}
                        style={{ fontWeight: 600 }}
                      />
                    </div>

                    {dayPlans.length > 1 && (
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemoveDay(safeTab)}
                      >
                        Remove Day {currentDayPlan.day}
                      </Button>
                    )}
                  </div>

                  {/* Schedule Grid: Morning & Afternoon */}
                  <div className="form-grid form-grid--2 mb-3">
                    <div className="field">
                      <label className="field__label" style={{ fontSize: '12px' }}>
                        🌅 Morning Schedule
                      </label>
                      <textarea
                        rows={2}
                        className="field__control"
                        placeholder="e.g. 8:00 AM Kumari Puja viewing, breakfast & artisan visits"
                        value={currentDayPlan.morning}
                        onChange={(e) => handleDayPlanChange(safeTab, 'morning', e.target.value)}
                      />
                    </div>

                    <div className="field">
                      <label className="field__label" style={{ fontSize: '12px' }}>
                        ☀️ Afternoon Schedule
                      </label>
                      <textarea
                        rows={2}
                        className="field__control"
                        placeholder="e.g. 1:00 PM Traditional Bhog lunch & rest"
                        value={currentDayPlan.afternoon}
                        onChange={(e) => handleDayPlanChange(safeTab, 'afternoon', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Schedule Grid: Evening & Night */}
                  <div className="form-grid form-grid--2 mb-3">
                    <div className="field">
                      <label className="field__label" style={{ fontSize: '12px' }}>
                        🌆 Evening Schedule
                      </label>
                      <textarea
                        rows={2}
                        className="field__control"
                        placeholder="e.g. 5:30 PM Grand illumination pandal hopping"
                        value={currentDayPlan.evening}
                        onChange={(e) => handleDayPlanChange(safeTab, 'evening', e.target.value)}
                      />
                    </div>

                    <div className="field">
                      <label className="field__label" style={{ fontSize: '12px' }}>
                        🌙 Night Activities (Optional)
                      </label>
                      <textarea
                        rows={2}
                        className="field__control"
                        placeholder="e.g. Midnight adda & street food walk"
                        value={currentDayPlan.night}
                        onChange={(e) => handleDayPlanChange(safeTab, 'night', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Highlights row: 3 columns */}
                  <div className="form-grid form-grid--3">
                    <div className="field">
                      <label className="field__label" style={{ fontSize: '11.5px' }}>
                        🎪 Highlight Pandals
                      </label>
                      <input
                        type="text"
                        className="field__control"
                        placeholder="e.g. Bagbazar, Shovabazar"
                        value={currentDayPlan.pandals}
                        onChange={(e) => handleDayPlanChange(safeTab, 'pandals', e.target.value)}
                      />
                    </div>

                    <div className="field">
                      <label className="field__label" style={{ fontSize: '11.5px' }}>
                        🍲 Food Highlights
                      </label>
                      <input
                        type="text"
                        className="field__control"
                        placeholder="e.g. Rajbari Bhog, Sandesh"
                        value={currentDayPlan.foodHighlights}
                        onChange={(e) => handleDayPlanChange(safeTab, 'foodHighlights', e.target.value)}
                      />
                    </div>

                    <div className="field">
                      <label className="field__label" style={{ fontSize: '11.5px' }}>
                        🚇 Transport Tip
                      </label>
                      <input
                        type="text"
                        className="field__control"
                        placeholder="e.g. Green Line Metro"
                        value={currentDayPlan.transportTip}
                        onChange={(e) => handleDayPlanChange(safeTab, 'transportTip', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Section 3: Publication & Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingTop: '6px' }}>
            <div className="checkbox-grid" style={{ margin: 0 }}>
              <label className="field__label checkbox-label" style={{ cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.isCurated}
                  onChange={(e) => setFormData((p) => ({ ...p, isCurated: e.target.checked }))}
                />
                <span>⭐ Featured Curated Itinerary</span>
              </label>
              <label className="field__label checkbox-label" style={{ cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))}
                />
                <span>Published & Active</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <Button type="button" variant="secondary" size="md" onClick={() => setShowModal(false)} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md" disabled={saving}>
                {saving ? 'Saving...' : editingItem ? 'Update Itinerary' : 'Create Itinerary'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
