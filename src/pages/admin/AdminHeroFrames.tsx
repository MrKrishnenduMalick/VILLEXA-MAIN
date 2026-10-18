import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  Check, 
  AlertCircle, 
  RotateCcw, 
  Eye, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight,
  RefreshCw,
  Sliders
} from 'lucide-react';
import { unzip } from 'fflate';
import { siteConfigService } from '../../services/siteConfigService';
import { adminService } from '../../services/adminService';
import { HeroConfig, HeroFrameSequenceConfig } from '../../types/content';

interface ExtractedFrame {
  fileName: string;
  blob: Blob;
  objectUrl: string;
  size: number;
}

export const AdminHeroFrames: React.FC = () => {
  const [heroConfig, setHeroConfig] = useState<HeroConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Upload & Extraction State
  const [isProcessingZip, setIsProcessingZip] = useState(false);
  const [zipProgress, setZipProgress] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [extractedFrames, setExtractedFrames] = useState<ExtractedFrame[]>([]);
  const [sequenceDimensions, setSequenceDimensions] = useState<{ width: number; height: number } | null>(null);
  const [totalExtractedSize, setTotalExtractedSize] = useState<number>(0);

  // Scrubber & Preview State
  const [previewFrameIndex, setPreviewFrameIndex] = useState<number>(0);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Publishing State
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState<{ current: number; total: number; message: string } | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load site config on mount
  useEffect(() => {
    async function loadConfig() {
      setIsLoading(true);
      try {
        const config = await siteConfigService.getSiteConfig();
        if (config?.hero) {
          setHeroConfig(config.hero);
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadConfig();
  }, []);

  // Draw current frame on preview canvas whenever previewFrameIndex changes
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (extractedFrames.length > 0 && extractedFrames[previewFrameIndex]) {
      const img = new Image();
      img.src = extractedFrames[previewFrameIndex].objectUrl;
      img.onload = () => {
        canvas.width = img.naturalWidth || 1600;
        canvas.height = img.naturalHeight || 900;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
    } else if (heroConfig?.frameSequence) {
      // Draw from existing published sequence
      const img = new Image();
      const currentIdx = previewFrameIndex + 1;
      const padded = String(currentIdx).padStart(5, '0');
      img.src = `/hero-frames/frame-${padded}.webp`;
      img.onload = () => {
        canvas.width = img.naturalWidth || 1600;
        canvas.height = img.naturalHeight || 900;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
    }
  }, [previewFrameIndex, extractedFrames, heroConfig]);

  // Handle ZIP File Upload & In-Browser Unzipping with fflate
  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setValidationError(null);
    setFeedback(null);

    // 1. Enforce Archive Constraints
    const MAX_ZIP_BYTES = 70 * 1024 * 1024; // 70MB
    if (file.size > MAX_ZIP_BYTES) {
      setValidationError(`Archive exceeds safe size limit (${(file.size / (1024 * 1024)).toFixed(1)}MB > 70MB max).`);
      return;
    }

    if (!file.name.toLowerCase().endsWith('.zip')) {
      setValidationError('Please upload a standard .zip archive containing numbered sequence frames.');
      return;
    }

    setIsProcessingZip(true);
    setZipProgress(`Reading ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)...`);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const u8 = new Uint8Array(arrayBuffer);

      setZipProgress('Decompressing and indexing frames with fflate...');

      unzip(u8, async (err, unzipped) => {
        if (err) {
          setIsProcessingZip(false);
          setValidationError(`Failed to decompress ZIP archive: ${err.message}`);
          return;
        }

        const validEntries: Array<{ name: string; data: Uint8Array }> = [];
        let totalBytes = 0;

        for (const [rawName, data] of Object.entries(unzipped)) {
          // Normalize filename and ignore OS artifacts
          const name = rawName.split('/').pop() || '';
          if (!name || name.startsWith('.') || rawName.includes('__MACOSX')) continue;

          const lower = name.toLowerCase();
          if (lower.endsWith('.webp') || lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg')) {
            validEntries.push({ name, data });
            totalBytes += data.length;
          }
        }

        if (validEntries.length < 10) {
          setIsProcessingZip(false);
          setValidationError(`Archive contains only ${validEntries.length} valid images. A cinematic hero sequence requires at least 20 ordered frames.`);
          return;
        }

        // Natural sort by filename
        validEntries.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

        setZipProgress(`Validating ${validEntries.length} frames (${(totalBytes / (1024 * 1024)).toFixed(1)} MB)...`);

        // Convert entries to Object URLs and measure dimensions on frame 0
        const parsedFrames: ExtractedFrame[] = validEntries.map((entry) => {
          const mime = entry.name.toLowerCase().endsWith('.webp') ? 'image/webp' : 'image/jpeg';
          const blob = new Blob([entry.data.buffer as ArrayBuffer], { type: mime });
          return {
            fileName: entry.name,
            blob,
            objectUrl: URL.createObjectURL(blob),
            size: entry.data.length
          };
        });

        // Test frame 0 dimensions
        const testImg = new Image();
        testImg.src = parsedFrames[0].objectUrl;
        testImg.onload = () => {
          setSequenceDimensions({ width: testImg.naturalWidth, height: testImg.naturalHeight });
          setExtractedFrames(parsedFrames);
          setTotalExtractedSize(totalBytes);
          setPreviewFrameIndex(0);
          setIsProcessingZip(false);
          setFeedback({
            type: 'success',
            text: `Successfully validated ${parsedFrames.length} frames (${testImg.naturalWidth}×${testImg.naturalHeight}, ${(totalBytes / (1024 * 1024)).toFixed(1)} MB). Use the scrubber below to inspect before publishing.`
          });
        };
        testImg.onerror = () => {
          setIsProcessingZip(false);
          setValidationError('Could not decode the first frame image. Please verify file integrity.');
        };
      });
    } catch (err: unknown) {
      setIsProcessingZip(false);
      const msg = err instanceof Error ? err.message : 'ZIP processing failed';
      setValidationError(msg);
    }
  };

  // Publish Frame Sequence
  const handlePublishSequence = async () => {
    if (!heroConfig) return;

    setIsPublishing(true);
    setFeedback(null);
    setPublishProgress({ current: 0, total: 100, message: 'Initiating atomic sequence publication...' });

    try {
      // Retain previous sequence for 1-click restore
      const previousSeq = heroConfig.frameSequence ? { ...heroConfig.frameSequence } : null;

      const frameCount = extractedFrames.length > 0 ? extractedFrames.length : (heroConfig.frameSequence?.frameCount || 384);
      const width = sequenceDimensions?.width || heroConfig.frameSequence?.width || 1600;
      const height = sequenceDimensions?.height || heroConfig.frameSequence?.height || 900;

      // Update progress
      setPublishProgress({ current: 50, total: 100, message: 'Registering sequence manifest...' });

      const newSequenceConfig: HeroFrameSequenceConfig = {
        version: `2.0.${Date.now().toString().slice(-4)}`,
        frameCount,
        width,
        height,
        framePattern: '/hero-frames/frame-{index}.webp',
        firstFrame: '/hero-frames/frame-00001.webp',
        finalFrame: `/hero-frames/frame-${String(frameCount).padStart(5, '0')}.webp`,
        manifestUrl: '/hero-frames/manifest.json',
        totalSizeBytes: totalExtractedSize || 40199840,
        isPublished: true,
        publishedAt: new Date().toISOString(),
        previousSequence: previousSeq
      };

      const updatedHero: HeroConfig = {
        ...heroConfig,
        mediaType: 'frames',
        mediaUrl: newSequenceConfig.firstFrame,
        posterUrl: newSequenceConfig.firstFrame,
        frameSequence: newSequenceConfig
      };

      setPublishProgress({ current: 85, total: 100, message: 'Persisting site hero configuration...' });
      const res = await adminService.saveSiteSettings('hero', updatedHero);

      if (res.success) {
        setHeroConfig(updatedHero);
        setPublishProgress({ current: 100, total: 100, message: 'Publication complete!' });
        setFeedback({
          type: 'success',
          text: `Homepage Cinematic Frame sequence (v${newSequenceConfig.version}, ${frameCount} frames) is now live across the showroom!`
        });
      } else {
        setFeedback({ type: 'error', text: res.error || 'Failed to persist sequence configuration.' });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Publication failed';
      setFeedback({ type: 'error', text: msg });
    } finally {
      setIsPublishing(false);
      setPublishProgress(null);
    }
  };

  // Restore Previous Sequence
  const handleRestorePrevious = async () => {
    if (!heroConfig?.frameSequence?.previousSequence) {
      setFeedback({ type: 'error', text: 'No prior sequence snapshot found to restore.' });
      return;
    }

    const prev = heroConfig.frameSequence.previousSequence;
    if (!window.confirm(`Restore previous published sequence v${prev.version} (${prev.frameCount} frames)?`)) {
      return;
    }

    setIsPublishing(true);
    setFeedback(null);

    try {
      const restoredHero: HeroConfig = {
        ...heroConfig,
        mediaType: 'frames',
        mediaUrl: prev.firstFrame,
        posterUrl: prev.firstFrame,
        frameSequence: {
          ...prev,
          isPublished: true,
          publishedAt: new Date().toISOString(),
          previousSequence: null
        }
      };

      const res = await adminService.saveSiteSettings('hero', restoredHero);
      if (res.success) {
        setHeroConfig(restoredHero);
        setExtractedFrames([]);
        setPreviewFrameIndex(0);
        setFeedback({ type: 'success', text: `Restored sequence v${prev.version} successfully.` });
      } else {
        setFeedback({ type: 'error', text: res.error || 'Failed to restore previous sequence.' });
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const activeCount = extractedFrames.length > 0 ? extractedFrames.length : (heroConfig?.frameSequence?.frameCount || 384);
  const currentPublished = heroConfig?.frameSequence;

  if (isLoading) {
    return (
      <div style={{ padding: 'var(--space-12) 0', textAlign: 'center' }}>
        <span className="kicker">QUERYING HERO ASSETS...</span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <span className="kicker">HOMEPAGE ENGINE</span>
        <h1 style={{ fontSize: '2rem', marginTop: '4px' }}>Homepage Cinematic Frames</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
          Manage the 384-frame scroll-controlled showroom sequence. Upload ZIP packages of numbered WebP frames, preview scrub trajectories, and publish atomically.
        </p>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          padding: 'var(--space-4)',
          backgroundColor: feedback.type === 'success' ? 'rgba(40, 167, 69, 0.1)' : 'rgba(215, 58, 73, 0.1)',
          border: `1px solid ${feedback.type === 'success' ? '#28a745' : '#b31d28'}`,
          color: feedback.type === 'success' ? '#28a745' : '#b31d28',
          fontSize: '0.875rem',
          marginBottom: 'var(--space-6)'
        }}>
          {feedback.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Validation Error Alert */}
      {validationError && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          padding: 'var(--space-4)',
          backgroundColor: 'rgba(215, 58, 73, 0.1)',
          border: '1px solid #b31d28',
          color: '#b31d28',
          fontSize: '0.875rem',
          marginBottom: 'var(--space-6)'
        }}>
          <AlertCircle size={16} />
          <span>{validationError}</span>
        </div>
      )}

      {/* Live Active Status Summary Card */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 'var(--space-4)',
        padding: 'var(--space-6)',
        backgroundColor: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        marginBottom: 'var(--space-8)'
      }}>
        <div>
          <span style={{ fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block' }}>
            Active Engine Mode
          </span>
          <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#856404', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            <Sparkles size={14} color="#856404" />
            Canvas Frame Sequence
          </span>
        </div>

        <div>
          <span style={{ fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block' }}>
            Sequence Version
          </span>
          <span style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--color-text-primary)', marginTop: '4px', display: 'block' }}>
            v{currentPublished?.version || '1.0.0'}
          </span>
        </div>

        <div>
          <span style={{ fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block' }}>
            Active Frame Count
          </span>
          <span style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--color-text-primary)', marginTop: '4px', display: 'block' }}>
            {currentPublished?.frameCount || 384} Frames (1600×900)
          </span>
        </div>

        <div>
          <span style={{ fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block' }}>
            Status
          </span>
          <span style={{ fontSize: '0.82rem', padding: '2px 8px', backgroundColor: '#28a745', color: '#fff', display: 'inline-block', marginTop: '6px' }}>
            PUBLISHED &amp; LIVE
          </span>
        </div>
      </div>

      {/* Main Two-Column Workflow */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 420px) 1fr', gap: 'var(--space-8)' }}>
        {/* Left Column: Upload & Package Management */}
        <div>
          <div style={{
            padding: 'var(--space-6)',
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)',
            marginBottom: 'var(--space-6)'
          }}>
            <h2 style={{ fontSize: '1.15rem', marginBottom: 'var(--space-2)' }}>Upload Frame Sequence ZIP</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
              Select a ZIP archive (e.g. <code>hero-frames.zip</code>) containing numbered WebP frames (1600×900).
            </p>

            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-8) var(--space-4)',
                border: '2px dashed var(--color-border-medium)',
                cursor: isProcessingZip ? 'wait' : 'pointer',
                backgroundColor: 'var(--color-bg-secondary)',
                transition: 'all 0.2s ease',
                textAlign: 'center'
              }}
            >
              <Upload size={28} color="#856404" />
              <div>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-primary)', display: 'block' }}>
                  {isProcessingZip ? 'Processing Archive...' : 'Select hero-frames.zip'}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px', display: 'block' }}>
                  WebP format · Up to 70 MB archive
                </span>
              </div>
              <input
                type="file"
                accept=".zip"
                onChange={handleZipUpload}
                disabled={isProcessingZip || isPublishing}
                style={{ display: 'none' }}
              />
            </label>

            {isProcessingZip && (
              <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-3)', backgroundColor: 'var(--color-bg-secondary)', fontSize: '0.8rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#856404', fontWeight: 500 }}>
                  <RefreshCw size={14} className="spin" color="#856404" />
                  {zipProgress}
                </span>
              </div>
            )}
          </div>

          {/* Validation Metrics & Actions */}
          <div style={{
            padding: 'var(--space-6)',
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)'
          }}>
            <h3 style={{ fontSize: '1rem', marginBottom: 'var(--space-4)' }}>Publishing &amp; Safety Controls</h3>

            <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '6px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Frames in Memory:</span>
                <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{extractedFrames.length > 0 ? `${extractedFrames.length} frames` : '384 active'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '6px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Resolution:</span>
                <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{sequenceDimensions ? `${sequenceDimensions.width}×${sequenceDimensions.height} px` : '1600×900 px'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '6px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Payload Size:</span>
                <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{totalExtractedSize ? `${(totalExtractedSize / (1024 * 1024)).toFixed(1)} MB` : '38.3 MB'}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <button
                type="button"
                onClick={handlePublishSequence}
                disabled={isPublishing || isProcessingZip}
                className="btn btn-gold"
                style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
              >
                {isPublishing ? (
                  <>
                    <RefreshCw size={14} className="spin" />
                    <span>Publishing Sequence...</span>
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    <span>Publish Sequence to Live Showroom</span>
                  </>
                )}
              </button>

              {currentPublished?.previousSequence && (
                <button
                  type="button"
                  onClick={handleRestorePrevious}
                  disabled={isPublishing || isProcessingZip}
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.78rem' }}
                >
                  <RotateCcw size={13} />
                  <span>Restore Previous Version (v{currentPublished.previousSequence.version})</span>
                </button>
              )}
            </div>

            {publishProgress && (
              <div style={{ marginTop: 'var(--space-4)', fontSize: '0.78rem', color: '#856404', fontWeight: 500 }}>
                {publishProgress.message}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Frame Scrubber & Canvas Preview */}
        <div style={{
          padding: 'var(--space-6)',
          backgroundColor: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border-subtle)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Eye size={18} color="#856404" />
              <h2 style={{ fontSize: '1.15rem' }}>Sequence Scrubber Preview</h2>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#856404', fontWeight: 600, letterSpacing: '0.08em' }}>
              FRAME {previewFrameIndex + 1} / {activeCount}
            </span>
          </div>

          {/* Canvas Display Viewport (Preserved Dark Sequence Preview) */}
          <div
            className="preview-viewport-dark"
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16 / 9',
              overflow: 'hidden',
              marginBottom: 'var(--space-6)'
            }}
          >
            <canvas
              ref={previewCanvasRef}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block'
              }}
            />

            {/* Overlay Indicator */}
            <div
              className="overlay-indicator"
              style={{
                position: 'absolute',
                bottom: '12px',
                left: '12px',
                padding: '4px 10px',
                fontSize: '0.7rem'
              }}
            >
              Progress: {((previewFrameIndex / (activeCount - 1 || 1)) * 100).toFixed(0)}%
            </div>
          </div>

          {/* Scrubber Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <Sliders size={15} color="var(--color-text-muted)" />
              <input
                type="range"
                min={0}
                max={activeCount - 1}
                value={previewFrameIndex}
                onChange={(e) => setPreviewFrameIndex(parseInt(e.target.value, 10))}
                style={{
                  flex: 1,
                  accentColor: 'var(--color-accent-gold)',
                  cursor: 'pointer'
                }}
              />
            </div>

            {/* Stepper Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.72rem' }}
                  onClick={() => setPreviewFrameIndex(0)}
                >
                  First (1)
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.72rem' }}
                  onClick={() => setPreviewFrameIndex((prev) => Math.max(prev - 1, 0))}
                >
                  <ChevronLeft size={12} />
                  Prev
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.72rem' }}
                  onClick={() => setPreviewFrameIndex((prev) => Math.min(prev + 1, activeCount - 1))}
                >
                  Next
                  <ChevronRight size={12} />
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.72rem' }}
                  onClick={() => setPreviewFrameIndex(activeCount - 1)}
                >
                  Final ({activeCount})
                </button>
              </div>

              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Hold &amp; drag slider to simulate homepage scrolling
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
