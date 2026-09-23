import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { votingService } from '@/services/votingService';
import type { FlaggedVotesResponse } from '@/types/voting';
import '@/styles/sharad-samman-admin.css';

export function VotingAuditPage() {
  const [data, setData] = useState<FlaggedVotesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('FLAGGED');
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [reviewNote] = useState('');

  // Voting window toggle state
  const [isVotingOpen, setIsVotingOpen] = useState(true);
  const [resultsPublished, setResultsPublished] = useState(false);
  const [togglingWindow, setTogglingWindow] = useState(false);
  const [publishingResults, setPublishingResults] = useState(false);

  useEffect(() => {
    loadVotes();
    loadContestStatus();
  }, [page, statusFilter]);

  const loadVotes = async () => {
    try {
      setLoading(true);
      const res = await votingService.admin.getFlaggedVotes({
        page,
        limit: 20,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      });
      setData(res);
    } catch (err) {
      console.error('Failed to load flagged votes:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadContestStatus = async () => {
    try {
      const res = await votingService.public.getContest();
      if (res.contest) {
        setIsVotingOpen(res.contest.isVotingOpen);
        setResultsPublished(res.contest.resultsPublished);
      }
    } catch (err) {
      console.error('Failed to load contest status:', err);
    }
  };

  const handleToggleVoting = async () => {
    try {
      setTogglingWindow(true);
      const newStatus = !isVotingOpen;
      await votingService.admin.toggleVotingWindow({
        contestId: 1, // Active contest
        isVotingOpen: newStatus,
      });
      setIsVotingOpen(newStatus);
    } catch (err) {
      console.error('Failed to toggle voting window:', err);
    } finally {
      setTogglingWindow(false);
    }
  };

  const handlePublishResults = async () => {
    try {
      setPublishingResults(true);
      const newStatus = !resultsPublished;
      await votingService.admin.publishResults({
        contestId: 1,
        publish: newStatus,
      });
      setResultsPublished(newStatus);
    } catch (err) {
      console.error('Failed to publish results:', err);
    } finally {
      setPublishingResults(false);
    }
  };

  const handleReviewAction = async (voteId: number, action: 'APPROVE' | 'REJECT') => {
    try {
      setActionLoading(voteId);
      await votingService.admin.reviewFlaggedVote(voteId, {
        action,
        reviewNotes: reviewNote.trim() || undefined,
      });
      loadVotes();
    } catch (err) {
      console.error('Failed to review vote:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const stats = data?.stats || {
    totalVotes: 0,
    validVotes: 0,
    flaggedVotes: 0,
    rejectedVotes: 0,
  };

  return (
    <div className="page samman-page">
      {/* Header */}
      <header className="page__header flex justify-between items-start flex-wrap gap-4">
        <div className="page__titles">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <ol>
              <li><Link to={ROUTES.DASHBOARD}>Admin Portal</Link></li>
              <li><Link to={ROUTES.SHARAD_SAMMAN_DASHBOARD}>Sharad Samman</Link></li>
              <li><span>Voting Audit & Anti-Fraud</span></li>
            </ol>
          </nav>
          <h1 className="page__title flex items-center gap-2">
            <i className="fa-solid fa-shield-halved text-red-600" />
            People's Choice Voting Audit & Control
          </h1>
          <p className="page__subtitle text-slate-500 text-sm">
            Monitor public votes, inspect anomaly signals, review flagged ballots, and control the live voting window.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={ROUTES.PUBLIC_SHARAD_SAMMAN_VOTE}
            target="_blank"
            className="btn btn--outline btn--sm flex items-center gap-1.5"
          >
            <i className="fa-solid fa-arrow-up-right-from-square text-xs" /> Public Voting Page
          </Link>
          <Link
            to={ROUTES.PUBLIC_SHARAD_SAMMAN_RESULTS}
            target="_blank"
            className="btn btn--outline btn--sm flex items-center gap-1.5"
          >
            <i className="fa-solid fa-chart-line text-xs" /> Live Leaderboard
          </Link>
        </div>
      </header>

      {/* Control Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between flex-wrap gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-700">Contest Window Controls:</span>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              isVotingOpen
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-rose-100 text-rose-800'
            }`}
          >
            <i className={`fa-solid fa-tower-broadcast text-xs ${isVotingOpen ? 'text-emerald-600' : ''}`} />
            {isVotingOpen ? 'Voting Window OPEN' : 'Voting Window CLOSED'}
          </span>

          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              resultsPublished
                ? 'bg-amber-100 text-amber-900'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            <i className="fa-solid fa-trophy text-xs" />
            {resultsPublished ? 'Results PUBLISHED' : 'Results Live Draft'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleVoting}
            disabled={togglingWindow}
            className={`btn btn--sm flex items-center gap-1.5 ${
              isVotingOpen ? 'btn--danger' : 'btn--primary'
            }`}
          >
            <i className={`fa-solid ${isVotingOpen ? 'fa-lock' : 'fa-lock-open'}`} />
            {isVotingOpen ? 'Close Public Voting' : 'Open Public Voting'}
          </button>

          <button
            onClick={handlePublishResults}
            disabled={publishingResults}
            className={`btn btn--sm flex items-center gap-1.5 ${
              resultsPublished ? 'btn--outline' : 'btn--secondary'
            }`}
          >
            <i className="fa-solid fa-trophy" />
            {resultsPublished ? 'Unpublish Results' : 'Finalize & Publish Results'}
          </button>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="samman-stat-grid">
        <div className="samman-stat-card">
          <div className="samman-stat-card__icon bg-blue-50 text-blue-600">
            <i className="fa-solid fa-check-to-slot" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{stats.totalVotes}</div>
            <div className="text-xs text-slate-500 uppercase font-semibold">Total Ballots</div>
          </div>
        </div>

        <div className="samman-stat-card">
          <div className="samman-stat-card__icon bg-emerald-50 text-emerald-600">
            <i className="fa-solid fa-circle-check" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600">{stats.validVotes}</div>
            <div className="text-xs text-slate-500 uppercase font-semibold">Valid (In Tally)</div>
          </div>
        </div>

        <div
          className={`samman-stat-card ${statusFilter === 'FLAGGED' ? 'is-active' : ''}`}
          onClick={() => setStatusFilter('FLAGGED')}
        >
          <div className="samman-stat-card__icon bg-amber-50 text-amber-600">
            <i className="fa-solid fa-triangle-exclamation" />
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-600">{stats.flaggedVotes}</div>
            <div className="text-xs text-slate-500 uppercase font-semibold">Flagged for Review</div>
          </div>
        </div>

        <div
          className={`samman-stat-card ${statusFilter === 'REJECTED' ? 'is-active' : ''}`}
          onClick={() => setStatusFilter('REJECTED')}
        >
          <div className="samman-stat-card__icon bg-rose-50 text-rose-600">
            <i className="fa-solid fa-circle-xmark" />
          </div>
          <div>
            <div className="text-2xl font-bold text-rose-600">{stats.rejectedVotes}</div>
            <div className="text-xs text-slate-500 uppercase font-semibold">Rejected Fraud</div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-3 border border-slate-200 rounded-xl">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-filter text-slate-400" />
          <span className="text-xs font-bold text-slate-600">Status:</span>
          {['ALL', 'FLAGGED', 'VALID', 'REJECTED'].map((st) => (
            <button
              key={st}
              className={`btn btn--sm ${statusFilter === st ? 'btn--primary' : 'btn--outline'}`}
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
            >
              {st}
            </button>
          ))}
        </div>

        <button
          onClick={loadVotes}
          className="btn btn--outline btn--sm flex items-center gap-1 text-slate-600"
        >
          <i className={`fa-solid fa-arrows-rotate text-xs ${loading ? 'fa-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Votes Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="text-center py-16 text-slate-500 flex flex-col items-center gap-2">
            <i className="fa-solid fa-spinner fa-spin text-2xl text-red-600" />
            <span>Loading votes queue…</span>
          </div>
        ) : !data?.votes || data.votes.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            No votes found matching current filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                <tr>
                  <th className="py-3 px-4">Voter Identity</th>
                  <th className="py-3 px-4">Puja Candidate</th>
                  <th className="py-3 px-4">Risk Score</th>
                  <th className="py-3 px-4">Anomaly Signal</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.votes.map((vote) => {
                  const riskColor =
                    vote.riskScore >= 60
                      ? 'bg-rose-100 text-rose-800'
                      : vote.riskScore >= 30
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800';

                  const statusColor =
                    vote.status === 'VALID'
                      ? 'bg-emerald-100 text-emerald-800'
                      : vote.status === 'FLAGGED'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800';

                  return (
                    <tr key={vote.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{vote.voterEmail}</div>
                        <div className="text-xs text-slate-500">
                          {vote.voterName || 'Anonymous'} {vote.voterCity ? `• ${vote.voterCity}` : ''}
                        </div>
                        {vote.ipAddress && (
                          <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                            IP: {vote.ipAddress}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{vote.nomination?.title}</div>
                        <div className="text-xs text-slate-500">
                          {vote.nomination?.committee?.committeeName} ({vote.nomination?.committee?.city})
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${riskColor}`}>
                          {vote.riskScore} / 100
                        </span>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="text-xs text-slate-700">
                          {vote.flagReason || 'Standard verification'}
                        </div>
                        {vote.reviewNotes && (
                          <div className="text-[11px] text-blue-600 mt-1 italic">
                            Note: {vote.reviewNotes}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${statusColor}`}>
                          {vote.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        {vote.status === 'FLAGGED' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleReviewAction(vote.id, 'APPROVE')}
                              disabled={actionLoading === vote.id}
                              className="btn btn--sm btn--primary bg-emerald-600 hover:bg-emerald-700 border-none text-white text-xs py-1 px-2.5 flex items-center gap-1"
                              title="Approve Vote into Tally"
                            >
                              <i className="fa-solid fa-circle-check" /> Approve
                            </button>
                            <button
                              onClick={() => handleReviewAction(vote.id, 'REJECT')}
                              disabled={actionLoading === vote.id}
                              className="btn btn--sm btn--danger text-xs py-1 px-2.5 flex items-center gap-1"
                              title="Reject Fraudulent Ballot"
                            >
                              <i className="fa-solid fa-circle-xmark" /> Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">
                            Reviewed ({new Date(vote.createdAt).toLocaleDateString()})
                          </span>
                        )}
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
