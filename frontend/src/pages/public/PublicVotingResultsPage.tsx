import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { votingService } from '@/services/votingService';
import type { 
  LeaderboardResponse, 
  LeaderboardEntry 
} from '@/types/voting';
import '@/styles/public-voting.css';

type Language = 'en' | 'bn' | 'hi';

const TRANSLATIONS = {
  en: {
    heroBadge: "People's Choice Live Leaderboard",
    heroTitle: "Live Standings & Final Results",
    heroSubtitle: "Real-time verified vote tallies for the 2026 Sharad Samman People's Choice Awards.",
    liveTally: "Live Verified Votes",
    finalResults: "Final Verified Results Published",
    voteNowBtn: "Cast Your Vote",
    backToVoting: "Back to Pujas",
    top3Title: "Top 3 Leading Pujas",
    allCategories: "All Categories",
    rankCol: "Rank",
    pujaCol: "Puja & Committee",
    categoryCol: "Category",
    votesCol: "Verified Votes",
    votes: "votes",
  },
  bn: {
    heroBadge: "পিপলস চয়েস লাইভ লিডারবোর্ড",
    heroTitle: "লাইভ ফলাফল ও শীর্ষ পুজো তালিকা",
    heroSubtitle: "শারদ সম্মান ২০২৬ পিপলস চয়েসের রিয়েল-টাইম যাচাইকৃত ভোট গণনা।",
    liveTally: "লাইভ যাচাইকৃত ভোট",
    finalResults: "চূড়ান্ত ফলাফল প্রকাশিত",
    voteNowBtn: "আপনার ভোট দিন",
    backToVoting: "পুজোর তালিকায় ফিরুন",
    top3Title: "শীর্ষ ৩টি অগ্রগামী পুজো",
    allCategories: "সকল বিভাগ",
    rankCol: "স্থান",
    pujaCol: "পুজো ও কমিটি",
    categoryCol: "বিভাগ",
    votesCol: "যাচাইকৃত ভোট",
    votes: "ভোট",
  },
  hi: {
    heroBadge: "पीपुल्स च्वाइस लाइव लीडरबोर्ड",
    heroTitle: "लाइव रैंकिंग और अंतिम परिणाम",
    heroSubtitle: "शरद सम्मान 2026 पीपुल्स च्वाइस के लिए रीयल-टाइम सत्यापित वोट गणना।",
    liveTally: "लाइव सत्यापित वोट",
    finalResults: "अंतिम परिणाम प्रकाशित",
    voteNowBtn: "अपना वोट दें",
    backToVoting: "पूजा सूची पर वापस जाएं",
    top3Title: "शीर्ष 3 अग्रणी पूजाएं",
    allCategories: "सभी श्रेणियां",
    rankCol: "स्थान",
    pujaCol: "पूजा और समिति",
    categoryCol: "श्रेणी",
    votesCol: "सत्यापित वोट",
    votes: "वोट",
  },
};

export function PublicVotingResultsPage() {
  const [lang, setLang] = useState<Language>('en');
  const t = TRANSLATIONS[lang];

  const [leaderboardData, setLeaderboardData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await votingService.public.getLeaderboard();
      setLeaderboardData(res);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const list: LeaderboardEntry[] = leaderboardData?.leaderboard || [];
  const categories = Array.from(new Set(list.map((item) => item.category)));

  const filteredList = list.filter((item) =>
    selectedCategory === 'ALL' ? true : item.category === selectedCategory,
  );

  const top1 = list[0];
  const top2 = list[1];
  const top3 = list[2];
  const maxVotes = list[0]?.validVotes || 1;

  return (
    <div className="voting-page">
      {/* Hero Header */}
      <section className="voting-hero">
        <div className="voting-hero__topbar">
          <div className="flex items-center gap-3">
            <span
              className={`voting-hero__badge ${
                leaderboardData?.resultsPublished
                  ? 'voting-hero__badge--live'
                  : 'voting-hero__badge'
              }`}
            >
              <i className="fa-solid fa-trophy" />
              {leaderboardData?.resultsPublished ? t.finalResults : t.liveTally}
            </span>
            <span className="voting-hero__badge">
              <i className="fa-solid fa-award" />
              {leaderboardData?.contestName || 'Sharad Samman 2026'}
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
            <span className="voting-hero__stat-val">
              {leaderboardData?.totalValidVotes.toLocaleString() || 0}
            </span>
            <span className="voting-hero__stat-lbl">Total Valid Votes</span>
          </div>
          <div className="voting-hero__stat-item">
            <span className="voting-hero__stat-val">{list.length}</span>
            <span className="voting-hero__stat-lbl">Ranked Pujas</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={loadLeaderboard}
              className="btn btn--outline btn--sm text-white border-white hover:bg-white/10 flex items-center gap-2"
            >
              <i className={`fa-solid fa-arrows-rotate ${loading ? 'fa-spin' : ''}`} />
              Refresh
            </button>
            <Link
              to={ROUTES.PUBLIC_SHARAD_SAMMAN_VOTE}
              className="btn btn--primary btn--sm flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold border-none"
            >
              <i className="fa-solid fa-check-to-slot" />
              {t.voteNowBtn}
            </Link>
          </div>
        </div>
      </section>

      {/* Top 3 Podium (if at least 1 entry exists) */}
      {!loading && list.length > 0 && (
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-center text-lg font-bold text-slate-800 mb-2 flex items-center justify-center gap-2">
            <i className="fa-solid fa-trophy text-amber-500" />
            {t.top3Title}
          </h2>

          <div className="leaderboard-podium">
            {/* Rank 2 - Silver */}
            {top2 && (
              <div className="podium-slot podium-slot--2">
                <div className="podium-card">
                  <i className="fa-solid fa-medal text-slate-400 text-2xl mb-1 block mx-auto" />
                  <div className="font-bold text-sm text-slate-800 truncate">{top2.title}</div>
                  <div className="text-xs text-slate-500 truncate">{top2.committeeName}</div>
                  <div className="podium-votes mt-1">{top2.validVotes} {t.votes}</div>
                </div>
                <div className="podium-pedestal podium-pedestal--2">
                  <span>#2</span>
                </div>
              </div>
            )}

            {/* Rank 1 - Gold */}
            {top1 && (
              <div className="podium-slot podium-slot--1">
                <div className="podium-card border-amber-300 shadow-md">
                  <i className="fa-solid fa-trophy text-amber-500 text-3xl mb-1 block mx-auto" />
                  <div className="font-bold text-sm text-amber-950 truncate">{top1.title}</div>
                  <div className="text-xs text-slate-500 truncate">{top1.committeeName}</div>
                  <div className="podium-votes text-amber-700 text-sm mt-1">{top1.validVotes} {t.votes}</div>
                </div>
                <div className="podium-pedestal podium-pedestal--1">
                  <span>#1</span>
                </div>
              </div>
            )}

            {/* Rank 3 - Bronze */}
            {top3 && (
              <div className="podium-slot podium-slot--3">
                <div className="podium-card">
                  <i className="fa-solid fa-medal text-amber-700 text-2xl mb-1 block mx-auto" />
                  <div className="font-bold text-sm text-slate-800 truncate">{top3.title}</div>
                  <div className="text-xs text-slate-500 truncate">{top3.committeeName}</div>
                  <div className="podium-votes mt-1">{top3.validVotes} {t.votes}</div>
                </div>
                <div className="podium-pedestal podium-pedestal--3">
                  <span>#3</span>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Category Filter */}
      <div className="voting-toolbar">
        <span className="font-bold text-sm text-slate-700">Category Filter:</span>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            className={`btn btn--sm ${selectedCategory === 'ALL' ? 'btn--primary' : 'btn--outline'}`}
            onClick={() => setSelectedCategory('ALL')}
          >
            {t.allCategories} ({list.length})
          </button>
          {categories.map((cat) => {
            const count = list.filter((n) => n.category === cat).length;
            return (
              <button
                key={cat}
                className={`btn btn--sm ${selectedCategory === cat ? 'btn--primary' : 'btn--outline'}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat.replace(/_/g, ' ')} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Full Leaderboard Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="text-center py-16 text-slate-500 flex flex-col items-center gap-3">
            <i className="fa-solid fa-spinner fa-spin text-2xl text-red-700" />
            <span>Loading standings…</span>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            No votes recorded yet for this category.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                <tr>
                  <th className="py-3 px-4 w-16 text-center">{t.rankCol}</th>
                  <th className="py-3 px-4">{t.pujaCol}</th>
                  <th className="py-3 px-4">{t.categoryCol}</th>
                  <th className="py-3 px-4 text-right">{t.votesCol}</th>
                  <th className="py-3 px-4 w-48">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((item, idx) => {
                  const pct = maxVotes > 0 ? Math.round((item.validVotes / maxVotes) * 100) : 0;
                  const isTop3 = idx < 3;

                  return (
                    <tr key={item.nominationId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs ${
                            idx === 0
                              ? 'bg-amber-400 text-amber-950 shadow-sm'
                              : idx === 1
                              ? 'bg-slate-300 text-slate-800'
                              : idx === 2
                              ? 'bg-orange-300 text-orange-950'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {idx + 1}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900">{item.title}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{item.committeeName}</span>
                          {item.city && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <i className="fa-solid fa-location-dot text-[11px]" /> {item.city}
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-block bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-md font-medium">
                          {item.category.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-bold text-base text-slate-900">
                          {item.validVotes.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isTop3 ? 'bg-amber-500' : 'bg-red-700'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-slate-400 mt-0.5 block">{pct}% of leader</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
