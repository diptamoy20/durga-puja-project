import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { votingService } from '@/services/votingService';
import type { 
  PublicVotingResponse, 
  VotingNomination, 
  CaptchaResponse 
} from '@/types/voting';
import '@/styles/public-voting.css';

type Language = 'en' | 'bn' | 'hi';

const TRANSLATIONS = {
  en: {
    heroBadge: "People's Choice Awards 2026",
    heroTitle: "Vote for the Best Global & National Durga Puja",
    heroSubtitle: "Support your favorite pandals, artisans, and diaspora celebrations across the world in the prestigious Sharad Samman People's Choice Awards.",
    searchPlaceholder: "Search by committee, pandal name, or city...",
    allCategories: "All Categories",
    totalNominations: "Eligible Pujas",
    votingStatusOpen: "Live Voting Open",
    votingStatusClosed: "Voting Closed",
    viewLeaderboard: "View Live Standings",
    voteNow: "Vote for this Puja",
    alreadyVoted: "1 Vote Per Person Allowed",
    modalTitle: "Cast Your Vote",
    modalSubtitle: "Verify your email to ensure a fair and transparent one-person-one-vote tally.",
    voterNameLabel: "Your Full Name (Optional)",
    voterEmailLabel: "Your Email Address",
    voterPhoneLabel: "Mobile / Phone Number",
    voterAddressLabel: "Residential / Street Address (Optional)",
    voterCityLabel: "Your City / Country (Optional)",
    captchaLabel: "Security Verification (Anti-Bot)",
    requestOtpBtn: "Send Verification Code",
    otpTitle: "Enter 6-Digit Verification Code",
    otpSubtitle: "We sent a 6-digit code to",
    otpLabel: "Verification Code (OTP)",
    staticOtpHint: "Testing mode active: You can use static OTP 123456 or the code sent to your phone/email.",
    autoFillOtp: "Use Static OTP (123456)",
    viewDetailsBtn: "View Details",
    aboutPuja: "About this Puja & Theme",
    venueDetails: "Venue & Location",
    pujaGallery: "Puja Pictures & Craftsmanship Gallery",
    photosCount: "Pictures Available",
    submitVoteBtn: "Confirm & Submit Vote",
    voteSuccessTitle: "Vote Recorded Successfully!",
    voteSuccessSub: "Thank you for contributing to the 2026 Sharad Samman People's Choice tally.",
    viewResultsBtn: "See Live Leaderboard",
    closeBtn: "Close",
  },
  bn: {
    heroBadge: "পিপলস চয়েস অ্যাওয়ার্ডস ২০২৬",
    heroTitle: "সেরা শারদ সম্মান দুর্গাপূজার জন্য ভোট দিন",
    heroSubtitle: "বিশ্বজুড়ে আপনার প্রিয় পুজো কমিটি, মণ্ডপ ও শিল্পীদের জন্য ভোট দিয়ে শারদ সম্মান পিপলস চয়েস বিজেতা নির্বাচন করুন।",
    searchPlaceholder: "কমিটি, মণ্ডপ বা শহরের নাম দিয়ে খুঁজুন...",
    allCategories: "সকল বিভাগ",
    totalNominations: "যোগ্য প্রতিযোগী",
    votingStatusOpen: "ভোট গ্রহণ চলছে",
    votingStatusClosed: "ভোট গ্রহণ সমাপ্ত",
    viewLeaderboard: "লাইভ ফলাফল দেখুন",
    voteNow: "ভোট দিন",
    alreadyVoted: "এক ব্যক্তি একটি মাত্র ভোট দিতে পারবেন",
    modalTitle: "আপনার মূল্যবান ভোট দিন",
    modalSubtitle: "স্বচ্ছতার জন্য আপনার ইমেইল ও মোবাইল নম্বর যাচাই করুন।",
    voterNameLabel: "আপনার নাম (ঐচ্ছিক)",
    voterEmailLabel: "আপনার ইমেল ঠিকানা",
    voterPhoneLabel: "মোবাইল / ফোন নম্বর",
    voterAddressLabel: "ঠিকানা (ঐচ্ছিক)",
    voterCityLabel: "আপনার শহর / দেশ (ঐচ্ছিক)",
    captchaLabel: "নিরাপত্তা পরীক্ষা (ক্যাপচা)",
    requestOtpBtn: "ওটিপি পাঠান",
    otpTitle: "৬-সংখ্যার ওটিপি কোড দিন",
    otpSubtitle: "আমরা ওটিপি কোড পাঠিয়েছি:",
    otpLabel: "ভেরিফিকেশন ওটিপি",
    staticOtpHint: "টেস্টিং মোড চালু: আপনি স্ট্যাটিক ওটিপি ১২৩৪৫৬ ব্যবহার করতে পারেন।",
    autoFillOtp: "স্ট্যাটিক ওটিপি (123456) ব্যবহার করুন",
    viewDetailsBtn: "বিবরণ দেখুন",
    aboutPuja: "পুজো ও থিম সম্পর্কিত তথ্য",
    venueDetails: "মণ্ডপ ও অবস্থান",
    pujaGallery: "পুজো ও মণ্ডপের ছবি গ্যালারি",
    photosCount: "উপলব্ধ ছবি",
    submitVoteBtn: "ভোট নিশ্চিত করুন",
    voteSuccessTitle: "আপনার ভোট সফলভাবে গৃহীত হয়েছে!",
    voteSuccessSub: "শারদ সম্মান পিপলস চয়েস ২০২৬-এ অংশগ্রহণ করার জন্য ধন্যবাদ।",
    viewResultsBtn: "ফলাফল দেখুন",
    closeBtn: "বন্ধ করুন",
  },
  hi: {
    heroBadge: "पीपुल्स च्वाइस अवार्ड्स 2026",
    heroTitle: "सर्वश्रेष्ठ दुर्गा पूजा के लिए अपना वोट दें",
    heroSubtitle: "दुनिया भर की अपनी पसंदीदा पूजा समितियों, पंडालों और कलाकारों को शरद सम्मान पीपुल्स च्वाइस के लिए वोट दें।",
    searchPlaceholder: "समिति, पंडाल या शहर के नाम से खोजें...",
    allCategories: "सभी श्रेणियां",
    totalNominations: "नामांकित पूजाएं",
    votingStatusOpen: "वोटिंग चालू है",
    votingStatusClosed: "वोटिंग बंद है",
    viewLeaderboard: "लाइव रैंकिंग देखें",
    voteNow: "वोट दें",
    alreadyVoted: "प्रति व्यक्ति केवल एक वोट मान्य है",
    modalTitle: "अपना वोट दर्ज करें",
    modalSubtitle: "पारदर्शिता सुनिश्चित करने के लिए अपना ईमेल और मोबाइल नंबर सत्यापित करें।",
    voterNameLabel: "आपका नाम (वैकल्पिक)",
    voterEmailLabel: "आपका ईमेल पता",
    voterPhoneLabel: "मोबाइल / फ़ोन नंबर",
    voterAddressLabel: "पता (वैकल्पिक)",
    voterCityLabel: "आपका शहर / देश (वैकल्पिक)",
    captchaLabel: "सुरक्षा जांच (कैप्चा)",
    requestOtpBtn: "ओटीपी कोड भेजें",
    otpTitle: "6-अंकों का ओटीपी दर्ज करें",
    otpSubtitle: "हमने ओटीपी भेजा है:",
    otpLabel: "सत्यापन कोड (ओटीपी)",
    staticOtpHint: "टेस्टिंग मोड सक्रिय: आप 123456 या फ़ोन/ईमेल पर भेजा गया ओटीपी उपयोग कर सकते हैं।",
    autoFillOtp: "स्टैटिक ओटीपी (123456) भरें",
    viewDetailsBtn: "विवरण देखें",
    aboutPuja: "पूजा और थीम विवरण",
    venueDetails: "मंडप और स्थान",
    pujaGallery: "पूजा और पंडाल फोटो गैलरी",
    photosCount: "उपलब्ध तस्वीरें",
    submitVoteBtn: "वोट सबमिट करें",
    voteSuccessTitle: "आपका वोट सफलतापूर्वक दर्ज हो गया!",
    voteSuccessSub: "शरद सम्मान पीपुल्स च्वाइस 2026 में भाग लेने के लिए धन्यवाद।",
    viewResultsBtn: "लाइव रैंकिंग देखें",
    closeBtn: "बंद करें",
  },
};

export function PublicVotingPage() {
  const [lang, setLang] = useState<Language>('en');
  const t = TRANSLATIONS[lang];

  const [contestData, setContestData] = useState<PublicVotingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Details Modal State & Active Photo Switcher
  const [detailsNomination, setDetailsNomination] = useState<VotingNomination | null>(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  const openDetailsModal = (nom: VotingNomination) => {
    setActivePhotoIdx(0);
    setDetailsNomination(nom);
  };

  const sanitizePhotoUrl = (raw?: string | null): string | null => {
    if (!raw || typeof raw !== 'string') return null;
    const clean = raw.trim().replace(/^["']|["']$/g, '');
    if (!clean) return null;
    if (/^[A-Za-z]:[\\/]/.test(clean) || clean.includes('\\Users\\') || clean.includes('\\Screenshots\\') || clean.includes('\\Pictures\\')) {
      return null;
    }
    if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('data:image/')) {
      return clean;
    }
    if (clean.startsWith('committee-documents/') || clean.startsWith('uploads/')) {
      return null;
    }
    return clean;
  };

  const getNominationPhotos = (nom?: VotingNomination | null): string[] => {
    if (!nom) return [];
    const list: (string | null)[] = [];
    if (Array.isArray(nom.photos)) {
      list.push(...nom.photos);
    }
    if (Array.isArray(nom.snapshotData?.photos)) {
      list.push(...nom.snapshotData.photos);
    }
    if (nom.snapshotData?.pandalImage) {
      list.push(nom.snapshotData.pandalImage);
    }
    if (nom.committee?.pandalImage) {
      list.push(nom.committee.pandalImage);
    }
    if (Array.isArray((nom as any).committeeMedia)) {
      for (const m of (nom as any).committeeMedia) {
        if (m && m.mediaUrl) list.push(m.mediaUrl);
        if (m && m.storedPath) list.push(m.storedPath);
      }
    }
    if (Array.isArray(nom.committee?.committeeMedia)) {
      for (const m of nom.committee.committeeMedia) {
        if (m && (m as any).mediaUrl) list.push((m as any).mediaUrl);
        if (m && m.storedPath) list.push(m.storedPath);
      }
    }
    const cleanList = Array.from(
      new Set(
        list
          .map(sanitizePhotoUrl)
          .filter((u): u is string => typeof u === 'string' && u.length > 0)
      )
    );
    return cleanList.length > 0
      ? cleanList
      : ['https://images.unsplash.com/photo-1601614749441-df07a04944d1?auto=format&fit=crop&w=1200&q=80'];
  };

  const detailsPhotos = detailsNomination ? getNominationPhotos(detailsNomination) : [];
  const activeModalPhoto = detailsPhotos[activePhotoIdx] || detailsPhotos[0] || 'https://images.unsplash.com/photo-1601614749441-df07a04944d1?auto=format&fit=crop&w=1200&q=80';

  const nextModalPhoto = () => {
    if (detailsPhotos.length <= 1) return;
    setActivePhotoIdx((prev) => (prev + 1) % detailsPhotos.length);
  };

  const prevModalPhoto = () => {
    if (detailsPhotos.length <= 1) return;
    setActivePhotoIdx((prev) => (prev - 1 + detailsPhotos.length) % detailsPhotos.length);
  };



  // Voting Modal State
  const [selectedNomination, setSelectedNomination] = useState<VotingNomination | null>(null);
  const [modalStep, setModalStep] = useState<'IDENTITY' | 'OTP' | 'SUCCESS'>('IDENTITY');
  const [voterName, setVoterName] = useState('');
  const [voterEmail, setVoterEmail] = useState('voter@sharadsamman.org');
  const [voterPhone, setVoterPhone] = useState('9876543210');
  const [voterAddress, setVoterAddress] = useState('');
  const [voterCity, setVoterCity] = useState('');
  const [captcha, setCaptcha] = useState<CaptchaResponse | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [otpCode, setOtpCode] = useState('123456');
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [submittingVote, setSubmittingVote] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [voteReceipt, setVoteReceipt] = useState<{ voteId: number; status: string } | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const urlContestId = searchParams.get('contestId') ? Number(searchParams.get('contestId')) : undefined;

  useEffect(() => {
    loadContest(urlContestId);
  }, [urlContestId]);

  const loadContest = async (targetContestId?: number) => {
    try {
      setLoading(true);
      const res = await votingService.public.getContest(targetContestId);
      setContestData(res);
      if (res.contest?.id && targetContestId && res.contest.id !== urlContestId) {
        setSearchParams({ contestId: String(res.contest.id) }, { replace: true });
      }
    } catch (err) {
      console.error('Failed to load public contest:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCaptcha = async () => {
    try {
      const cap = await votingService.public.getCaptcha();
      setCaptcha(cap);
      setCaptchaAnswer('');
    } catch (err) {
      console.error('Failed to load CAPTCHA:', err);
    }
  };

  const openVoteModal = (nom: VotingNomination) => {
    setSelectedNomination(nom);
    setModalStep('IDENTITY');
    setModalError(null);
    fetchCaptcha();
  };

  const closeVoteModal = () => {
    setSelectedNomination(null);
    setModalStep('IDENTITY');
    setModalError(null);
    setCaptcha(null);
    setCaptchaAnswer('');
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contestData?.contest || !selectedNomination || !captcha) return;

    if (!voterEmail.trim()) {
      setModalError('Please enter a valid email address.');
      return;
    }
    if (!voterPhone.trim()) {
      setModalError('Please enter your mobile phone number.');
      return;
    }
    if (!captchaAnswer.trim()) {
      setModalError('Please enter the security CAPTCHA answer.');
      return;
    }

    try {
      setRequestingOtp(true);
      setModalError(null);

      const res = await votingService.public.requestOtp({
        contestId: contestData.contest.id,
        email: voterEmail.trim(),
        phone: voterPhone.trim(),
        captchaToken: captcha.token,
        captchaAnswer: captchaAnswer.trim(),
      });

      if (res.devOtp) {
        setOtpCode(res.devOtp);
      }
      setModalStep('OTP');
    } catch (err: any) {
      setModalError(err?.response?.data?.message || err.message || 'Failed to request OTP. Please try again.');
      fetchCaptcha();
    } finally {
      setRequestingOtp(false);
    }
  };

  const handleCastVote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contestData?.contest || !selectedNomination) return;

    if (!otpCode.trim()) {
      setModalError('Please enter the 6-digit verification code.');
      return;
    }

    try {
      setSubmittingVote(true);
      setModalError(null);

      const res = await votingService.public.castVote({
        contestId: contestData.contest.id,
        nominationId: selectedNomination.id,
        voterEmail: voterEmail.trim(),
        voterName: voterName.trim() || undefined,
        voterPhone: voterPhone.trim() || undefined,
        voterAddress: voterAddress.trim() || undefined,
        voterCity: voterCity.trim() || undefined,
        otpCode: otpCode.trim(),
      });

      setVoteReceipt({
        voteId: res.voteId,
        status: res.status,
      });
      setModalStep('SUCCESS');
    } catch (err: any) {
      setModalError(err?.response?.data?.message || err.message || 'Failed to submit vote.');
    } finally {
      setSubmittingVote(false);
    }
  };

  // Filter nominations
  const nominations = contestData?.nominations || [];
  const categories = Array.from(new Set(nominations.map((n) => n.category)));
  const isVotingOpen = Boolean(contestData?.isVotingOpen || contestData?.contest?.isVotingOpen);

  const filteredNominations = nominations.filter((nom) => {
    const matchesCat = selectedCategory === 'ALL' || nom.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      nom.title?.toLowerCase().includes(q) ||
      nom.committee?.committeeName?.toLowerCase().includes(q) ||
      nom.committee?.city?.toLowerCase().includes(q) ||
      nom.committee?.venueName?.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  return (
    <div className="voting-page">
      {/* Hero Header */}
      <section className="voting-hero">
        <div className="voting-hero__topbar">
          <div className="flex items-center gap-3">
            <span
              className={`voting-hero__badge ${
                isVotingOpen ? 'voting-hero__badge--live' : 'voting-hero__badge--closed'
              }`}
            >
              <i className="fa-solid fa-bolt" />
              {isVotingOpen ? t.votingStatusOpen : t.votingStatusClosed}
            </span>
            <span className="voting-hero__badge">
              <i className="fa-solid fa-trophy" />
              {contestData?.contest?.name || t.heroBadge}
            </span>
            {contestData?.contest && (contestData.contest.votingStartDate || contestData.contest.startDate) && (
              <span className="voting-hero__badge" style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(4px)', fontSize: '0.8rem' }}>
                <i className="fa-solid fa-calendar-days" />
                <span>
                  {new Date(contestData.contest.votingStartDate || contestData.contest.startDate!).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                  {' – '}
                  {new Date(contestData.contest.votingEndDate || contestData.contest.endDate!).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </span>
            )}
          </div>

          <div className="voting-hero__lang-switch">
            <button
              className={`voting-hero__lang-btn ${lang === 'en' ? 'active' : ''}`}
              onClick={() => setLang('en')}
            >
              English
            </button>
            <button
              className={`voting-hero__lang-btn ${lang === 'bn' ? 'active' : ''}`}
              onClick={() => setLang('bn')}
            >
              বাংলা
            </button>
            <button
              className={`voting-hero__lang-btn ${lang === 'hi' ? 'active' : ''}`}
              onClick={() => setLang('hi')}
            >
              हिन्दी
            </button>
          </div>
        </div>

        <h1 className="voting-hero__title">{t.heroTitle}</h1>
        <p className="voting-hero__desc">{t.heroSubtitle}</p>

        <div className="voting-hero__meta">
          <div className="voting-hero__stat-item">
            <span className="voting-hero__stat-val">{nominations.length}</span>
            <span className="voting-hero__stat-lbl">{t.totalNominations}</span>
          </div>
          <div className="voting-hero__stat-item">
            <span className="voting-hero__stat-val">{categories.length}</span>
            <span className="voting-hero__stat-lbl">Categories</span>
          </div>
          <div className="voting-hero__stat-item">
            <span className="voting-hero__stat-val">100%</span>
            <span className="voting-hero__stat-lbl">Verified Tally</span>
          </div>
          <div className="ml-auto">
            <Link
              to={
                contestData?.contest?.id
                  ? `${ROUTES.PUBLIC_SHARAD_SAMMAN_RESULTS}?contestId=${contestData.contest.id}`
                  : ROUTES.PUBLIC_SHARAD_SAMMAN_RESULTS
              }
              className="btn btn--outline btn--sm text-white border-white hover:bg-white/10 flex items-center gap-2"
            >
              <i className="fa-solid fa-chart-line" />
              {t.viewLeaderboard}
            </Link>
          </div>
        </div>
      </section>

      {/* Toolbar / Search */}
      <div className="voting-toolbar">
        <div className="voting-search">
          <i className="fa-solid fa-magnifying-glass voting-search__icon" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {contestData?.availableContests && contestData.availableContests.length > 0 && (
          <div className="voting-filters">
            <select
              className="voting-select font-semibold"
              value={contestData.contest?.id || ''}
              onChange={(e) => {
                const id = Number(e.target.value);
                if (id) {
                  setSearchParams({ contestId: String(id) });
                  loadContest(id);
                }
              }}
            >
              {contestData.availableContests.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.year}) {c.isVotingOpen ? '• Live Voting' : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="voting-filters">
          <select
            className="voting-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="ALL">{t.allCategories}</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Nominations Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-500 flex flex-col items-center gap-3">
          <i className="fa-solid fa-spinner fa-spin text-2xl text-red-700" />
          <span>Loading eligible Puja nominations…</span>
        </div>
      ) : filteredNominations.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl p-8 max-w-xl mx-auto my-6 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 text-2xl">
            <i className="fa-solid fa-trophy" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            {nominations.length === 0
              ? `No Shortlisted Nominees Yet for ${contestData?.contest?.name || 'this Contest'}`
              : 'No Nominations Found'}
          </h3>
          <p className="text-slate-500 text-sm mt-1 leading-relaxed">
            {nominations.length === 0
              ? contestData?.isVotingOpen
                ? 'Voting is active. Shortlisted nominees from jury evaluation will automatically appear here for public voting.'
                : 'Voting will open once jury evaluation concludes and nominees are shortlisted for this contest session.'
              : 'Try adjusting your search keywords or category filter.'}
          </p>
          {contestData?.contest?.votingStartDate && (
            <div className="mt-4 text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg inline-flex items-center gap-2">
              <i className="fa-solid fa-calendar-days text-amber-600" />
              <span>
                Voting Window: {new Date(contestData.contest.votingStartDate).toLocaleDateString()} –{' '}
                {contestData.contest.votingEndDate
                  ? new Date(contestData.contest.votingEndDate).toLocaleDateString()
                  : 'TBD'}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="voting-grid">
          {filteredNominations.map((nom) => {
            const nomPhotos = getNominationPhotos(nom);
            const pandalImg = nomPhotos[0];

            return (
              <div key={nom.id} className="voting-card">
                <div
                  className="voting-card__img-wrap cursor-pointer group"
                  title="Click to view full Puja details & photo gallery"
                  onClick={() => openDetailsModal(nom)}
                >
                  <img
                    src={pandalImg}
                    alt={nom.title}
                    className="voting-card__img group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src =
                        'https://images.unsplash.com/photo-1601614749441-df07a04944d1?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <span className="voting-card__category">{nom.category.replace(/_/g, ' ')}</span>
                  {nomPhotos.length > 1 && (
                    <span className="voting-card__photos-badge">
                      <i className="fa-solid fa-camera" />
                      <span>{nomPhotos.length} Photos</span>
                    </span>
                  )}
                  {nom.committee?.city && (
                    <span className="voting-card__city">
                      <i className="fa-solid fa-location-dot mr-1" />
                      {nom.committee.city}
                    </span>
                  )}
                </div>

                <div className="voting-card__body">
                  <h3
                    className="voting-card__title cursor-pointer hover:text-red-700 transition-colors"
                    title="Click to view full Puja details & gallery"
                    onClick={() => openDetailsModal(nom)}
                  >
                    {nom.title}
                  </h3>
                  <div
                    className="voting-card__committee cursor-pointer hover:underline"
                    onClick={() => openDetailsModal(nom)}
                  >
                    <i className="fa-solid fa-award text-amber-600 flex-shrink-0" />
                    <span>{nom.committee?.committeeName || 'Puja Committee'}</span>
                  </div>
                  {nom.description && <p className="voting-card__desc line-clamp-2">{nom.description}</p>}

                  <div className="voting-card__footer gap-2 mt-auto">
                    <button
                      type="button"
                      className="voting-card__details-btn"
                      onClick={() => openDetailsModal(nom)}
                      title="View full Puja information & photo gallery"
                    >
                      <i className="fa-solid fa-circle-info text-amber-600" />
                      <span>{t.viewDetailsBtn}</span>
                    </button>
                    <button
                      className="voting-card__vote-btn flex-1"
                      disabled={!isVotingOpen}
                      onClick={() => openVoteModal(nom)}
                    >
                      <i className="fa-solid fa-check-to-slot" />
                      {isVotingOpen ? t.voteNow : t.votingStatusClosed}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Puja Details Modal */}
      {detailsNomination && (
        <div className="voting-modal-backdrop" onClick={() => setDetailsNomination(null)}>
          <div className="voting-modal voting-modal--lg" onClick={(e) => e.stopPropagation()}>
            <div className="voting-modal__header">
              <h3 className="voting-modal__header-title">
                <i className="fa-solid fa-place-of-worship text-amber-400" />
                {detailsNomination.committee?.committeeName || detailsNomination.title}
              </h3>
              <p className="voting-modal__header-sub">
                {detailsNomination.category.replace(/_/g, ' ')} • {detailsNomination.committee?.city || 'West Bengal'}
              </p>
              <button className="voting-modal__close-btn" onClick={() => setDetailsNomination(null)}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div className="voting-modal__body">
              {/* Cover Image banner / Gallery View */}
              <div className="voting-hero-gallery shadow-md flex-shrink-0">
                <img
                  src={activeModalPhoto}
                  alt={`${detailsNomination.title} photo ${activePhotoIdx + 1}`}
                  className="voting-hero-gallery__img"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src =
                      'https://images.unsplash.com/photo-1601614749441-df07a04944d1?auto=format&fit=crop&w=1200&q=80';
                  }}
                />

                {/* Left / Right Nav Arrows */}
                {detailsPhotos.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="voting-hero-gallery__nav voting-hero-gallery__nav--prev"
                      onClick={prevModalPhoto}
                      title="Previous photo"
                    >
                      <i className="fa-solid fa-chevron-left text-sm" />
                    </button>
                    <button
                      type="button"
                      className="voting-hero-gallery__nav voting-hero-gallery__nav--next"
                      onClick={nextModalPhoto}
                      title="Next photo"
                    >
                      <i className="fa-solid fa-chevron-right text-sm" />
                    </button>
                  </>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-black/20 pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between flex-wrap gap-2 text-white pointer-events-none">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-red-700/90 text-white rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                        {detailsNomination.category.replace(/_/g, ' ')}
                      </span>
                      {detailsPhotos.length > 1 && (
                        <span className="px-2.5 py-0.5 bg-black/60 text-amber-300 rounded-full text-xs font-semibold backdrop-blur-md border border-white/20">
                          <i className="fa-solid fa-camera mr-1" /> {activePhotoIdx + 1} / {detailsPhotos.length}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-extrabold mt-1.5 text-white drop-shadow-md">
                      {detailsNomination.title}
                    </h2>
                  </div>
                  {detailsNomination.committee?.registrationNo && (
                    <span className="text-xs bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/20 font-mono">
                      Reg: #{detailsNomination.committee.registrationNo}
                    </span>
                  )}
                </div>
              </div>

              {/* Multi-Photo Thumbnail Strip */}
              {detailsPhotos.length > 1 && (
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-3 flex-wrap text-xs text-slate-600 font-semibold px-1">
                    <span className="flex items-center gap-1.5 text-slate-700 whitespace-nowrap">
                      <i className="fa-solid fa-images text-amber-600" />
                      <span>{t.pujaGallery} ({detailsPhotos.length})</span>
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      Click any photo to enlarge
                    </span>
                  </div>
                  <div className="voting-gallery-strip">
                    {detailsPhotos.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`voting-gallery-thumb ${idx === activePhotoIdx ? 'voting-gallery-thumb--active' : ''}`}
                        onClick={() => setActivePhotoIdx(idx)}
                        title={`View photo ${idx + 1}`}
                      >
                        <img
                          src={url}
                          alt={`Thumbnail ${idx + 1}`}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src =
                              'https://images.unsplash.com/photo-1601614749441-df07a04944d1?auto=format&fit=crop&w=300&q=80';
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase">Established</div>
                  <div className="text-base font-bold text-slate-800 mt-0.5">
                    {detailsNomination.committee?.establishedYear || 'Heritage'}
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase">Tradition</div>
                  <div className="text-base font-bold text-amber-700 mt-0.5">
                    {detailsNomination.committee?.establishedYear
                      ? `${new Date().getFullYear() - detailsNomination.committee.establishedYear}+ Yrs`
                      : 'Historic'}
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase">Location</div>
                  <div className="text-base font-bold text-slate-800 mt-0.5 truncate">
                    {detailsNomination.committee?.city || 'India'}
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase">Category</div>
                  <div className="text-base font-bold text-red-700 mt-0.5 truncate">
                    {detailsNomination.committee?.pujaCategory || 'Barowari'}
                  </div>
                </div>
              </div>

              {/* Theme & Description */}
              {(detailsNomination.description || detailsNomination.committee?.committeeDescription) && (
                <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-2 mb-1.5">
                    <i className="fa-solid fa-palette text-amber-600" />
                    {t.aboutPuja}
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {detailsNomination.description || detailsNomination.committee?.committeeDescription}
                  </p>
                </div>
              )}

              {/* Venue & Location Details */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col gap-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <i className="fa-solid fa-location-dot text-red-700" />
                  {t.venueDetails}
                </h4>
                <div className="text-sm text-slate-800 font-semibold">
                  {detailsNomination.committee?.venueName || detailsNomination.committee?.committeeName}
                </div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  {[
                    detailsNomination.committee?.venueAddress,
                    detailsNomination.committee?.landmark && `Landmark: ${detailsNomination.committee.landmark}`,
                    detailsNomination.committee?.address,
                    detailsNomination.committee?.city,
                    detailsNomination.committee?.state,
                    detailsNomination.committee?.country,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-200 mt-auto">
                <button
                  type="button"
                  disabled={!isVotingOpen}
                  className="voting-card__vote-btn flex-1 py-3 text-sm flex items-center justify-center gap-2"
                  onClick={() => {
                    const target = detailsNomination;
                    setDetailsNomination(null);
                    openVoteModal(target);
                  }}
                >
                  <i className="fa-solid fa-check-to-slot" />
                  {isVotingOpen ? t.voteNow : t.votingStatusClosed}
                </button>
                <button
                  type="button"
                  className="btn btn--outline py-2.5 px-5 text-sm"
                  onClick={() => setDetailsNomination(null)}
                >
                  {t.closeBtn}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Voting Modal */}
      {selectedNomination && (
        <div className="voting-modal-backdrop" onClick={closeVoteModal}>
          <div className="voting-modal" onClick={(e) => e.stopPropagation()}>
            <div className="voting-modal__header">
              <h3 className="voting-modal__header-title">
                <i className="fa-solid fa-shield-halved text-amber-400" />
                {t.modalTitle}
              </h3>
              <p className="voting-modal__header-sub">{t.modalSubtitle}</p>
              <button className="voting-modal__close-btn" onClick={closeVoteModal}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div className="voting-modal__body">
              {/* Selected Nomination Preview */}
              <div className="voting-modal__nom-preview">
                <div className="w-14 h-14 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-xl flex-shrink-0 border border-amber-200/60 overflow-hidden shadow-inner">
                  {selectedNomination.committee?.pandalImage ? (
                    <img
                      src={selectedNomination.committee.pandalImage}
                      alt={selectedNomination.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <i className="fa-solid fa-place-of-worship text-amber-600" />
                  )}
                </div>
                <div className="overflow-hidden flex-1">
                  <div className="font-bold text-slate-800 text-sm truncate">{selectedNomination.title}</div>
                  <div className="text-xs text-slate-500 truncate">{selectedNomination.committee?.committeeName}</div>
                  <div className="text-[11px] text-red-700 font-semibold mt-0.5">
                    {selectedNomination.category.replace(/_/g, ' ')}
                  </div>
                </div>
              </div>

              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-start gap-2">
                  <i className="fa-solid fa-triangle-exclamation flex-shrink-0 mt-0.5" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* STEP 1: IDENTITY & CAPTCHA */}
              {modalStep === 'IDENTITY' && (
                <form onSubmit={handleRequestOtp} className="flex flex-col gap-3">
                  <div className="voting-form-group">
                    <label>{t.voterNameLabel}</label>
                    <div className="relative">
                      <input
                        type="text"
                        className="voting-input w-full"
                        placeholder="John Doe"
                        value={voterName}
                        onChange={(e) => setVoterName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="voting-form-group">
                    <label className="flex items-center justify-between">
                      <span>{t.voterEmailLabel} *</span>
                      <span className="text-[11px] text-amber-700 font-normal">Static test accepted</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        className="voting-input w-full"
                        placeholder="voter@sharadsamman.org"
                        value={voterEmail}
                        onChange={(e) => setVoterEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="voting-form-group">
                    <label className="flex items-center justify-between">
                      <span>{t.voterPhoneLabel} *</span>
                      <span className="text-[11px] text-amber-700 font-normal">Static OTP 123456</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        className="voting-input w-full"
                        placeholder="+91 98765 43210"
                        value={voterPhone}
                        onChange={(e) => setVoterPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="voting-form-group">
                    <label>{t.voterAddressLabel}</label>
                    <div className="relative">
                      <input
                        type="text"
                        className="voting-input w-full"
                        placeholder="Street Address, Block / Ward"
                        value={voterAddress}
                        onChange={(e) => setVoterAddress(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="voting-form-group">
                    <label>{t.voterCityLabel}</label>
                    <div className="relative">
                      <input
                        type="text"
                        className="voting-input w-full"
                        placeholder="Kolkata / London / New York"
                        value={voterCity}
                        onChange={(e) => setVoterCity(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Math CAPTCHA */}
                  <div className="voting-form-group mt-1">
                    <label className="flex items-center justify-between">
                      <span>{t.captchaLabel} *</span>
                      <button
                        type="button"
                        onClick={fetchCaptcha}
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <i className="fa-solid fa-arrows-rotate" /> Reload Challenge
                      </button>
                    </label>
                    <div className="voting-captcha-box">
                      <span className="voting-captcha-box__q">
                        {captcha ? captcha.question : 'Loading challenge…'}
                      </span>
                      <input
                        type="number"
                        required
                        placeholder="Answer"
                        className="voting-input w-24 text-center font-bold"
                        value={captchaAnswer}
                        onChange={(e) => setCaptchaAnswer(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={requestingOtp}
                    className="voting-card__vote-btn mt-2 w-full flex items-center justify-center gap-2"
                  >
                    {requestingOtp ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin" />
                        <span>Sending Verification Code…</span>
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-key" />
                        <span>{t.requestOtpBtn}</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* STEP 2: OTP VERIFICATION */}
              {modalStep === 'OTP' && (
                <form onSubmit={handleCastVote} className="flex flex-col gap-4">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{t.otpTitle}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {t.otpSubtitle} <strong className="text-slate-700">{voterEmail}</strong> & <strong className="text-slate-700">{voterPhone}</strong>
                    </p>
                  </div>

                  {/* Static OTP notice & quick fill */}
                  <div className="voting-static-badge">
                    <i className="fa-solid fa-wand-magic-sparkles flex-shrink-0 text-amber-600" />
                    <div className="flex-1 text-xs">
                      <span>{t.staticOtpHint}</span>
                      <button
                        type="button"
                        className="block mt-1 font-bold text-amber-900 underline hover:text-amber-950"
                        onClick={() => setOtpCode('123456')}
                      >
                        {t.autoFillOtp}
                      </button>
                    </div>
                  </div>

                  <div className="voting-form-group">
                    <label>{t.otpLabel} *</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      className="voting-input text-center text-2xl font-bold tracking-widest text-slate-800"
                      placeholder="123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      className="btn btn--outline flex-1 text-xs py-2"
                      onClick={() => setModalStep('IDENTITY')}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={submittingVote}
                      className="voting-card__vote-btn flex-2 flex items-center justify-center gap-2"
                    >
                      {submittingVote ? (
                        <>
                          <i className="fa-solid fa-spinner fa-spin" />
                          <span>Verifying & Submitting…</span>
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-check" />
                          <span>{t.submitVoteBtn}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: SUCCESS */}
              {modalStep === 'SUCCESS' && (
                <div className="voting-success-card">
                  <div className="voting-success-icon">
                    <i className="fa-solid fa-check" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">{t.voteSuccessTitle}</h3>
                  <p className="text-xs text-slate-500 max-w-sm">{t.voteSuccessSub}</p>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 w-full text-xs text-slate-600 flex flex-col gap-1 text-left mt-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Vote Reference:</span>
                      <span className="font-mono font-bold text-slate-800">#{voteReceipt?.voteId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status:</span>
                      <span className="text-emerald-700 font-semibold">{voteReceipt?.status || 'VALID'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Candidate:</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[180px]">{selectedNomination.title}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full mt-4">
                    <Link
                      to={ROUTES.PUBLIC_SHARAD_SAMMAN_RESULTS}
                      className="btn btn--primary flex-1 flex items-center justify-center gap-2 text-xs py-2.5"
                      onClick={closeVoteModal}
                    >
                      <i className="fa-solid fa-chart-line" />
                      {t.viewResultsBtn}
                    </Link>
                    <button
                      className="btn btn--outline flex-1 text-xs py-2.5"
                      onClick={closeVoteModal}
                    >
                      {t.closeBtn}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
