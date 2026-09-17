import { useState } from 'react';
import type { PodcastEpisode, PodcastReactionType } from '@/types/podcast';
import { publicPodcastService } from '@/services/podcastService';

interface ReactionButtonsProps {
  episode: PodcastEpisode;
  onReacted?: (reactionType: PodcastReactionType, updatedCounts: Record<string, number>) => void;
  size?: 'sm' | 'md' | 'lg';
}

interface ReactionConfig {
  type: PodcastReactionType;
  emoji: string;
  label: string;
  color: string;
}

const REACTIONS: ReactionConfig[] = [
  { type: 'love', emoji: '❤️', label: 'Love', color: '#ef4444' },
  { type: 'clap', emoji: '👏', label: 'Clap', color: '#f59e0b' },
  { type: 'celebrate', emoji: '🎉', label: 'Celebrate', color: '#8b5cf6' },
  { type: 'like', emoji: '👍', label: 'Like', color: '#3b82f6' },
];

export function ReactionButtons({ episode, onReacted, size = 'md' }: ReactionButtonsProps) {
  const storageKey = `dpgc_podcast_reacted_${episode.id}`;
  const [userReacted, setUserReacted] = useState<string | null>(() => {
    return localStorage.getItem(storageKey);
  });

  const [counts, setCounts] = useState<Record<PodcastReactionType, number>>({
    love: episode.loveCount ?? 0,
    clap: episode.clapCount ?? 0,
    celebrate: episode.celebrateCount ?? 0,
    like: episode.likeCount ?? 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReact = async (type: PodcastReactionType) => {
    if (userReacted === type || isSubmitting) return;

    // Optimistic increment
    setCounts((prev) => ({
      ...prev,
      [type]: (prev[type] || 0) + 1,
    }));
    setUserReacted(type);
    localStorage.setItem(storageKey, type);

    setIsSubmitting(true);
    try {
      const res = await publicPodcastService.react(episode.id, type);
      if (res?.reactions) {
        setCounts({
          love: res.reactions.love ?? counts.love,
          clap: res.reactions.clap ?? counts.clap,
          celebrate: res.reactions.celebrate ?? counts.celebrate,
          like: res.reactions.like ?? counts.like,
        });
        if (onReacted) {
          onReacted(type, res.reactions);
        }
      }
    } catch (err) {
      console.error('Failed to submit reaction:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSmall = size === 'sm';

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSmall ? '6px' : '10px',
        background: 'var(--color-surface, #ffffff)',
        border: '1px solid var(--color-border, #e2e8f0)',
        borderRadius: '30px',
        padding: isSmall ? '4px 8px' : '6px 12px',
        boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.08))',
        flexWrap: 'wrap',
      }}
    >
      <span
        style={{
          fontSize: isSmall ? '11px' : '12px',
          fontWeight: 600,
          color: 'var(--color-text-muted, #64748b)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          paddingRight: '4px',
        }}
      >
        Reactions:
      </span>

      {REACTIONS.map(({ type, emoji, label, color }) => {
        const isSelected = userReacted === type;
        const count = counts[type] || 0;

        return (
          <button
            key={type}
            type="button"
            onClick={() => handleReact(type)}
            disabled={isSubmitting}
            title={`${label} (${count})`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              background: isSelected ? `${color}15` : 'transparent',
              border: isSelected ? `1.5px solid ${color}` : '1px solid transparent',
              borderRadius: '20px',
              padding: isSmall ? '2px 8px' : '4px 10px',
              cursor: isSelected ? 'default' : 'pointer',
              fontSize: isSmall ? '12px' : '13px',
              fontWeight: isSelected ? 700 : 500,
              color: isSelected ? color : 'var(--color-text, #1e293b)',
              transition: 'all 0.15s ease',
              transform: isSelected ? 'scale(1.04)' : 'scale(1)',
            }}
          >
            <span style={{ fontSize: isSmall ? '14px' : '16px' }}>{emoji}</span>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{count}</span>
          </button>
        );
      })}
    </div>
  );
}
