import React, { useState } from 'react';
import { publicPodcastService } from '@/services/podcastService';

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubscribeModal({ isOpen, onClose }: SubscribeModalProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const rssUrl = `${window.location.origin}/api/v1/podcasts/rss`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await publicPodcastService.subscribe({ email, name, source: 'portal_popup' });
      setIsSuccess(true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setErrorMessage(error?.response?.data?.message || 'Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyRssUrl = () => {
    navigator.clipboard.writeText(rssUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--color-surface, #ffffff)',
          color: 'var(--color-text, #1e293b)',
          borderRadius: '16px',
          maxWidth: '520px',
          width: '100%',
          padding: '28px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
          border: '1px solid var(--color-border, #e2e8f0)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: 'none',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer',
            color: 'var(--color-text-muted, #94a3b8)',
          }}
        >
          ✕
        </button>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>🎙️</div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 700, color: 'var(--color-brand, #9b1c1c)' }}>
            Subscribe to Bishwo Jure Bangalir Aabeg
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-muted, #64748b)', lineHeight: '1.5' }}>
            Never miss an episode! Get instant notifications for new episodes, seasonal specials, and cultural deep dives.
          </p>
        </div>

        {isSuccess ? (
          <div
            style={{
              padding: '20px',
              borderRadius: '10px',
              backgroundColor: '#ecfdf5',
              border: '1px solid #10b981',
              textAlign: 'center',
              marginBottom: '20px',
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '6px' }}>🎉</div>
            <div style={{ fontWeight: 600, color: '#065f46', fontSize: '15px' }}>Thank you for subscribing!</div>
            <div style={{ fontSize: '12px', color: '#047857', marginTop: '4px' }}>
              We've added {email} to the Durga Puja podcast updates list.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
            {errorMessage && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #ef4444',
                  color: '#b91c1c',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  marginBottom: '12px',
                }}
              >
                {errorMessage}
              </div>
            )}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Your Name (Optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Debolina Sen"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border, #cbd5e1)',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. debolina@example.com"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border, #cbd5e1)',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn--primary"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '14px',
                background: 'var(--color-brand, #9b1c1c)',
                color: '#fff',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? 'Subscribing...' : 'Get Episode Alerts'}
            </button>
          </form>
        )}

        {/* RSS & Syndication Feeds */}
        <div style={{ borderTop: '1px solid var(--color-border, #e2e8f0)', paddingTop: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', color: 'var(--color-text-muted)' }}>
            Or Follow Via RSS / Apple Podcasts / Spotify
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--color-bg, #f8fafc)',
              padding: '6px 10px',
              borderRadius: '8px',
              border: '1px solid var(--color-border, #e2e8f0)',
              marginBottom: '12px',
            }}
          >
            <input
              type="text"
              readOnly
              value={rssUrl}
              style={{
                background: 'transparent',
                border: 'none',
                flex: 1,
                fontSize: '12px',
                color: 'var(--color-text-muted)',
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={copyRssUrl}
              style={{
                background: copied ? '#10b981' : 'var(--color-brand, #9b1c1c)',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
            >
              {copied ? 'Copied! ✓' : 'Copy RSS'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <a
              href="https://podcasts.apple.com"
              target="_blank"
              rel="noreferrer"
              style={{
                flex: '1 1 120px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: '8px',
                background: '#1e1e24',
                color: '#ffffff',
                textDecoration: 'none',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              <span>🍎</span> Apple Podcasts
            </a>
            <a
              href="https://open.spotify.com"
              target="_blank"
              rel="noreferrer"
              style={{
                flex: '1 1 120px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: '8px',
                background: '#1db954',
                color: '#ffffff',
                textDecoration: 'none',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              <span>🟢</span> Spotify
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
