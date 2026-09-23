import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
    voterCityLabel: "Your City / Country (Optional)",
    captchaLabel: "Security Verification (Anti-Bot)",
    requestOtpBtn: "Send Verification Code",
    otpTitle: "Enter 6-Digit Verification Code",
    otpSubtitle: "We sent a 6-digit code to",
    otpLabel: "Verification Code (OTP)",
    staticOtpHint: "Testing mode active: You can use static OTP 123456 or the code sent to your email.",
    autoFillOtp: "Use Static OTP (123456)",
    submitVoteBtn: "Confirm & Submit Vote",
    voteSuccessTitle: "Vote Recorded Successfully!",
    voteSuccessSub: "Thank you for contributing to the 2026 Sharad Samman People's Choice tally.",
    viewResultsBtn: "See Live Leaderboard",
    closeBtn: "Done",
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
    modalSubtitle: "স্বচ্ছতার জন্য আপনার ইমেইল যাচাই করুন।",
    voterNameLabel: "আপনার নাম (ঐচ্ছিক)",
    voterEmailLabel: "আপনার ইমেল ঠিকানা",
    voterCityLabel: "আপনার শহর / দেশ (ঐচ্ছিক)",
    captchaLabel: "নিরাপত্তা পরীক্ষা (ক্যাপচা)",
    requestOtpBtn: "ওটিপি পাঠান",
    otpTitle: "৬-সংখ্যার ওটিপি কোড দিন",
    otpSubtitle: "আমরা ওটিপি কোড পাঠিয়েছি:",
    otpLabel: "ভেরিফিকেশন ওটিপি",
    staticOtpHint: "টেস্টিং মোড চালু: আপনি স্ট্যাটিক ওটিপি ১২৩৪৫৬ ব্যবহার করতে পারেন।",
    autoFillOtp: "স্ট্যাটিক ওটিপি (123456) ব্যবহার করুন",
    submitVoteBtn: "ভোট নিশ্চিত করুন",
    voteSuccessTitle: "আপনার ভোট সফলভাবে গৃহীত হয়েছে!",
    voteSuccessSub: "শারদ সম্মান পিপলস চয়েস ২০২৬-এ অংশগ্রহণ করার জন্য ধন্যবাদ।",
    viewResultsBtn: "ফলাফল দেখুন",
    closeBtn: "সম্পন্ন",
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
    modalSubtitle: "पारदर्शिता सुनिश्चित करने के लिए अपना ईमेल सत्यापित करें।",
    voterNameLabel: "आपका नाम (वैकल्पिक)",
    voterEmailLabel: "आपका ईमेल पता",
    voterCityLabel: "आपका शहर / देश (वैकल्पिक)",
    captchaLabel: "सुरक्षा जांच (कैप्चा)",
    requestOtpBtn: "ओटीपी कोड भेजें",
    otpTitle: "6-अंकों का ओटीपी दर्ज करें",
    otpSubtitle: "हमने ओटीपी भेजा है:",
    otpLabel: "सत्यापन कोड (ओटीपी)",
    staticOtpHint: "टेस्टिंग मोड सक्रिय: आप 123456 या ईमेल पर भेजा गया ओटीपी उपयोग कर सकते हैं।",
    autoFillOtp: "स्टैटिक ओटीपी (123456) भरें",
    submitVoteBtn: "वोट सबमिट करें",
    voteSuccessTitle: "आपका वोट सफलतापूर्वक दर्ज हो गया!",
    voteSuccessSub: "शरद सम्मान पीपुल्स च्वाइस 2026 में भाग लेने के लिए धन्यवाद।",
    viewResultsBtn: "लाइव रैंकिंग देखें",
    closeBtn: "समाप्त",
  },
};

export function PublicVotingPage() {
  const [lang, setLang] = useState<Language>('en');
  const t = TRANSLATIONS[lang];

  const [contestData, setContestData] = useState<PublicVotingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Voting Modal State
  const [selectedNomination, setSelectedNomination] = useState<VotingNomination | null>(null);
  const [modalStep, setModalStep] = useState<'IDENTITY' | 'OTP' | 'SUCCESS'>('IDENTITY');
  const [voterName, setVoterName] = useState('');
  const [voterEmail, setVoterEmail] = useState('voter@sharadsamman.org');
  const [voterCity, setVoterCity] = useState('');
  const [captcha, setCaptcha] = useState<CaptchaResponse | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [otpCode, setOtpCode] = useState('123456');
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [submittingVote, setSubmittingVote] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [voteReceipt, setVoteReceipt] = useState<{ voteId: number; status: string } | null>(null);

  useEffect(() => {
    loadContest();
  }, []);

  const loadContest = async () => {
    try {
      setLoading(true);
      const res = await votingService.public.getContest();
      setContestData(res);
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
                contestData?.isVotingOpen ? 'voting-hero__badge--live' : 'voting-hero__badge--closed'
              }`}
            >
              <i className="fa-solid fa-bolt" />
              {contestData?.isVotingOpen ? t.votingStatusOpen : t.votingStatusClosed}
            </span>
            <span className="voting-hero__badge">
              <i className="fa-solid fa-trophy" />
              {t.heroBadge}
            </span>
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
            <Link to={ROUTES.PUBLIC_SHARAD_SAMMAN_RESULTS} className="btn btn--outline btn--sm text-white border-white hover:bg-white/10 flex items-center gap-2">
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
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl p-8">
          <i className="fa-solid fa-trophy text-slate-400 text-4xl mb-3 block" />
          <h3 className="text-lg font-bold text-slate-800">No Nominations Found</h3>
          <p className="text-slate-500 text-sm mt-1">
            Try adjusting your search keywords or category filter.
          </p>
        </div>
      ) : (
        <div className="voting-grid">
          {filteredNominations.map((nom) => {
            const pandalImg =
              nom.committee?.pandalImage ||
              'https://images.unsplash.com/photo-1601614749441-df07a04944d1?auto=format&fit=crop&w=800&q=80';

            return (
              <div key={nom.id} className="voting-card">
                <div className="voting-card__img-wrap">
                  <img
                    src={pandalImg}
                    alt={nom.title}
                    className="voting-card__img"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1601614749441-df07a04944d1?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <span className="voting-card__category">{nom.category.replace(/_/g, ' ')}</span>
                  {nom.committee?.city && (
                    <span className="voting-card__city">
                      <i className="fa-solid fa-location-dot mr-1" />
                      {nom.committee.city}
                    </span>
                  )}
                </div>

                <div className="voting-card__body">
                  <h3 className="voting-card__title">{nom.title}</h3>
                  <div className="voting-card__committee">
                    <i className="fa-solid fa-award text-amber-600 flex-shrink-0" />
                    <span>{nom.committee?.committeeName || 'Puja Committee'}</span>
                  </div>
                  {nom.description && <p className="voting-card__desc">{nom.description}</p>}

                  <div className="voting-card__footer">
                    <button
                      className="voting-card__vote-btn"
                      disabled={!contestData?.isVotingOpen}
                      onClick={() => openVoteModal(nom)}
                    >
                      <i className="fa-solid fa-check-to-slot" />
                      {contestData?.isVotingOpen ? t.voteNow : t.votingStatusClosed}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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
                <img
                  src={
                    selectedNomination.committee?.pandalImage ||
                    'https://images.unsplash.com/photo-1601614749441-df07a04944d1?auto=format&fit=crop&w=300&q=80'
                  }
                  alt={selectedNomination.title}
                  className="voting-modal__nom-img"
                />
                <div className="overflow-hidden">
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
                      {t.otpSubtitle} <strong className="text-slate-700">{voterEmail}</strong>
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
