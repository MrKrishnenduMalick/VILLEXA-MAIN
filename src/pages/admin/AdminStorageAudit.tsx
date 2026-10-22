import React, { useEffect, useState, useMemo } from 'react';
import { 
  RefreshCw, 
  Trash2, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Search, 
  HardDrive, 
  AlertCircle
} from 'lucide-react';
import { 
  storageAuditService, 
  StorageAuditReport, 
  AUDIT_BUCKETS,
  BatchDeletionResult
} from '../../services/storageAuditService';

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

export const AdminStorageAudit: React.FC = () => {
  const [report, setReport] = useState<StorageAuditReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filter States
  const [bucketFilter, setBucketFilter] = useState<string>('all');
  const [classificationFilter, setClassificationFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Confirmation & Deletion State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmCheckbox, setConfirmCheckbox] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletionResult, setDeletionResult] = useState<BatchDeletionResult | null>(null);

  const loadAudit = async () => {
    setIsLoading(true);
    try {
      const data = await storageAuditService.runAudit();
      setReport(data);
      setSelectedIds(new Set());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAudit();
  }, []);

  // Filtered Items
  const filteredItems = useMemo(() => {
    if (!report) return [];
    return report.items.filter(item => {
      const matchesBucket = bucketFilter === 'all' || item.bucket === bucketFilter;
      const matchesClass = classificationFilter === 'all' || item.classification === classificationFilter;
      const matchesSearch = !searchQuery.trim() || 
        item.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.reason.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesBucket && matchesClass && matchesSearch;
    });
  }, [report, bucketFilter, classificationFilter, searchQuery]);

  // Candidates in current filtered view
  const candidateItems = useMemo(() => {
    return filteredItems.filter(item => item.classification === 'UNREFERENCED_CANDIDATE');
  }, [filteredItems]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllCandidates = () => {
    const next = new Set<string>();
    candidateItems.forEach(item => next.add(item.id));
    setSelectedIds(next);
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  // Selected Candidate Objects for Deletion
  const selectedCandidates = useMemo(() => {
    if (!report) return [];
    return report.items.filter(item => selectedIds.has(item.id) && item.classification === 'UNREFERENCED_CANDIDATE');
  }, [report, selectedIds]);

  const totalSelectedBytes = useMemo(() => {
    return selectedCandidates.reduce((acc, it) => acc + it.size, 0);
  }, [selectedCandidates]);

  const handleStartCleanup = () => {
    setConfirmCheckbox(false);
    setConfirmText('');
    setDeletionResult(null);
    setIsConfirmModalOpen(true);
  };

  const handleExecuteDeletion = async () => {
    if (selectedCandidates.length === 0) return;
    setIsDeleting(true);
    try {
      const result = await storageAuditService.deleteSelectedCandidates(
        selectedCandidates.map(c => ({ bucket: c.bucket, path: c.path, size: c.size }))
      );
      setDeletionResult(result);
      await loadAudit();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Deletion failed');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="admin-storage-audit" style={{ paddingBottom: 'var(--space-16)' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-8)'
      }}>
        <div>
          <span className="kicker">STORAGE INFRASTRUCTURE</span>
          <h1 style={{ fontSize: '2rem', marginTop: '4px' }}>Storage Audit & Cleanup</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Authoritative cross-reference audit across 5 storage buckets and database records. Strictly read-only until explicit confirmation.
          </p>
        </div>
        <button
          onClick={loadAudit}
          disabled={isLoading}
          className="btn btn-secondary"
          style={{ padding: '0.6rem 1.25rem', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
        >
          <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
          <span>{isLoading ? 'Scanning Buckets...' : 'Re-Run Storage Audit'}</span>
        </button>
      </div>

      {/* Metrics Row */}
      {report && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-8)'
        }}>
          {/* Card 1: Total Storage */}
          <div style={{
            padding: 'var(--space-5)',
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Storage</span>
              <HardDrive size={16} />
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 600, marginTop: 'var(--space-2)' }}>
              {formatBytes(report.totalBytes)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              {report.totalObjects} objects across {Object.keys(report.bucketStats).length} buckets
            </div>
          </div>

          {/* Card 2: Keep (Referenced) */}
          <div style={{
            padding: 'var(--space-5)',
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)',
            borderLeft: '4px solid #16a34a'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#16a34a' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Referenced — Keep</span>
              <ShieldCheck size={16} />
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 600, marginTop: 'var(--space-2)', color: '#15803d' }}>
              {report.items.filter(i => i.classification === 'REFERENCED_KEEP').length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              {formatBytes(report.items.filter(i => i.classification === 'REFERENCED_KEEP').reduce((a, b) => a + b.size, 0))} protected
            </div>
          </div>

          {/* Card 3: Review Candidates */}
          <div style={{
            padding: 'var(--space-5)',
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)',
            borderLeft: '4px solid #ca8a04'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#ca8a04' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Review Candidates</span>
              <Trash2 size={16} />
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 600, marginTop: 'var(--space-2)', color: '#a16207' }}>
              {report.items.filter(i => i.classification === 'UNREFERENCED_CANDIDATE').length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              {formatBytes(report.reclaimableBytes)} (unreferenced, review required)
            </div>
          </div>

          {/* Card 4: Needs Review */}
          <div style={{
            padding: 'var(--space-5)',
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)',
            borderLeft: '4px solid #2563eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#2563eb' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Needs Review</span>
              <AlertCircle size={16} />
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 600, marginTop: 'var(--space-2)', color: '#1d4ed8' }}>
              {report.items.filter(i => i.classification === 'NEEDS_REVIEW').length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Protected system paths
            </div>
          </div>
        </div>
      )}

      {/* Reference Check Health Bar */}
      {report && (
        <div style={{
          padding: 'var(--space-4) var(--space-6)',
          backgroundColor: 'rgba(0,0,0,0.02)',
          border: '1px solid var(--color-border-subtle)',
          marginBottom: 'var(--space-6)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-3)',
          fontSize: '0.8rem'
        }}>
          <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            Database Cross-Reference Check Health:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {Object.entries(report.referenceChecks).map(([key, stat]) => (
              <span
                key={key}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 8px',
                  backgroundColor: stat.success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: stat.success ? '#15803d' : '#b31d28',
                  borderRadius: '2px',
                  textTransform: 'capitalize'
                }}
              >
                {stat.success ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                {key} ({stat.count})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Missing / Staged Assets Notice */}
      {report && report.missingProtectedAssets.length > 0 && (
        <div style={{
          padding: 'var(--space-4) var(--space-6)',
          backgroundColor: 'rgba(234, 179, 8, 0.08)',
          borderLeft: '4px solid #ca8a04',
          marginBottom: 'var(--space-6)',
          fontSize: '0.8rem'
        }}>
          <div style={{ fontWeight: 600, color: '#a16207', marginBottom: '4px' }}>
            Configuration Notice (Missing Staged Source Assets):
          </div>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
            The following assets are referenced in site configuration or database rows but were not present in Storage. They are tracked conservatively and protected:
          </p>
          <ul style={{ margin: '6px 0 0 0', paddingLeft: '1.2rem', color: 'var(--color-text-secondary)' }}>
            {report.missingProtectedAssets.map((m, idx) => (
              <li key={idx}>
                <strong>[{m.bucket}]</strong> {m.path} — <em>{m.referencedBy}</em> ({m.notes})
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Toolbar for Selection */}
      {selectedCandidates.length > 0 && (
        <div style={{
          padding: 'var(--space-4) var(--space-6)',
          backgroundColor: '#1f1917',
          color: '#fff',
          border: '1px solid var(--color-accent)',
          marginBottom: 'var(--space-6)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-4)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
              {selectedCandidates.length} candidate(s) selected ({formatBytes(totalSelectedBytes)})
            </span>
            <button
              onClick={deselectAll}
              style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}
            >
              Clear Selection
            </button>
          </div>
          <button
            onClick={handleStartCleanup}
            className="btn btn-primary"
            style={{ backgroundColor: '#b31d28', borderColor: '#b31d28', padding: '0.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
          >
            <Trash2 size={14} />
            <span>Clean Up Selected Files</span>
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{
        padding: 'var(--space-4)',
        backgroundColor: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border-subtle)',
        marginBottom: 'var(--space-6)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--space-4)',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', alignItems: 'center' }}>
          {/* Bucket Filter */}
          <select
            value={bucketFilter}
            onChange={(e) => setBucketFilter(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              backgroundColor: 'var(--color-bg-main)',
              border: '1px solid var(--color-border-subtle)',
              fontSize: '0.85rem'
            }}
          >
            <option value="all">All Buckets</option>
            {AUDIT_BUCKETS.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          {/* Classification Filter */}
          <select
            value={classificationFilter}
            onChange={(e) => setClassificationFilter(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              backgroundColor: 'var(--color-bg-main)',
              border: '1px solid var(--color-border-subtle)',
              fontSize: '0.85rem'
            }}
          >
            <option value="all">All Classifications</option>
            <option value="REFERENCED_KEEP">Referenced — KEEP</option>
            <option value="UNREFERENCED_CANDIDATE">Unreferenced — Review Candidate</option>
            <option value="NEEDS_REVIEW">Needs Review — DO NOT DELETE</option>
          </select>

          {candidateItems.length > 0 && (
            <button
              onClick={selectAllCandidates}
              className="btn btn-secondary"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.75rem' }}
            >
              Select All ({candidateItems.length}) Review Candidates
            </button>
          )}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search path, filename, or reason..."
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem 0.5rem 32px',
              backgroundColor: 'var(--color-bg-main)',
              border: '1px solid var(--color-border-subtle)',
              fontSize: '0.85rem'
            }}
          />
        </div>
      </div>

      {/* Safety Advisory Banner */}
      <div style={{
        padding: 'var(--space-3) var(--space-4)',
        backgroundColor: 'rgba(234, 179, 8, 0.06)',
        border: '1px solid rgba(234, 179, 8, 0.25)',
        borderLeft: '4px solid #ca8a04',
        marginBottom: 'var(--space-4)',
        fontSize: '0.8rem',
        color: 'var(--color-text-secondary)',
        lineHeight: 1.5
      }}>
        <strong style={{ color: '#a16207' }}>Review Advisory:</strong> Items labeled <em style={{ color: '#a16207', fontWeight: 600 }}>"Review Candidate"</em> have no active database references detected during this scan. This indicates an unreferenced status for administrative review, <u>not a guarantee</u> that the file is safe to permanently delete. Inspect duplicate copies, archival assets, and recent uploads before selecting any file.
      </div>

      {/* Main Inventory Table */}
      <div style={{
        backgroundColor: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border-subtle)',
        overflowX: 'auto'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border-subtle)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
              <th style={{ padding: 'var(--space-3) var(--space-4)', width: '36px' }}></th>
              <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Bucket</th>
              <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Object Path</th>
              <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Size</th>
              <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Classification</th>
              <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Reason / Reference</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  {isLoading ? 'Scanning storage inventory...' : 'No storage objects found matching filters.'}
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const isSelected = selectedIds.has(item.id);
                const isCandidate = item.classification === 'UNREFERENCED_CANDIDATE';

                return (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: '1px solid var(--color-border-subtle)',
                      backgroundColor: isSelected ? 'rgba(234, 179, 8, 0.05)' : 'transparent'
                    }}
                  >
                    <td style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'center' }}>
                      {isCandidate && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(item.id)}
                          style={{ cursor: 'pointer' }}
                        />
                      )}
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 600, color: 'var(--color-accent)' }}>
                      {item.bucket}
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', wordBreak: 'break-all' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{item.path}</span>
                      {item.duplicateMatches && item.duplicateMatches.length > 0 && (
                        <div style={{ marginTop: '4px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '1px 6px',
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            backgroundColor: 'rgba(234, 179, 8, 0.15)',
                            color: '#a16207',
                            borderRadius: '2px'
                          }}>
                            ⚠️ Near-Duplicate Match ({item.duplicateMatches.length})
                          </span>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', whiteSpace: 'nowrap' }}>
                      {formatBytes(item.size)}
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', whiteSpace: 'nowrap' }}>
                      <span style={{
                        padding: '2px 8px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        backgroundColor:
                          item.classification === 'REFERENCED_KEEP' ? 'rgba(34, 197, 94, 0.12)' :
                          item.classification === 'UNREFERENCED_CANDIDATE' ? 'rgba(234, 179, 8, 0.12)' :
                          'rgba(59, 130, 246, 0.12)',
                        color:
                          item.classification === 'REFERENCED_KEEP' ? '#15803d' :
                          item.classification === 'UNREFERENCED_CANDIDATE' ? '#a16207' :
                          '#1d4ed8'
                      }}>
                        {item.classification === 'REFERENCED_KEEP' ? 'Keep' :
                         item.classification === 'UNREFERENCED_CANDIDATE' ? 'Review Candidate' :
                         'Needs Review'}
                      </span>
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-secondary)' }}>
                      {item.reason}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation & Deletion Dialog */}
      {isConfirmModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          backgroundColor: 'rgba(19, 18, 17, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-6)'
        }}>
          <div style={{
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)',
            padding: 'var(--space-8)',
            maxWidth: '680px',
            width: '100%',
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.35)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#b31d28'
                }}>
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Confirm Permanent Storage Cleanup</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Irreversible Supabase Storage Deletion
                  </span>
                </div>
              </div>
              {!isDeleting && (
                <button
                  onClick={() => setIsConfirmModalOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {deletionResult ? (
              <div>
                <div style={{
                  padding: 'var(--space-4)',
                  backgroundColor: deletionResult.failedCount === 0 ? 'rgba(34, 197, 94, 0.08)' : 'rgba(234, 179, 8, 0.08)',
                  border: `1px solid ${deletionResult.failedCount === 0 ? '#16a34a' : '#ca8a04'}`,
                  color: deletionResult.failedCount === 0 ? '#15803d' : '#a16207',
                  marginBottom: 'var(--space-6)',
                  fontSize: '0.875rem'
                }}>
                  <strong>Cleanup Completed:</strong> {deletionResult.successCount} of {deletionResult.totalRequested} objects deleted. Reclaimed {formatBytes(deletionResult.reclaimedBytes)}.
                </div>

                <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--color-border-subtle)', fontSize: '0.75rem', marginBottom: 'var(--space-6)' }}>
                  {deletionResult.results.map((res, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: 'var(--space-2) var(--space-3)',
                        borderBottom: '1px solid var(--color-border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 'var(--space-2)'
                      }}
                    >
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span style={{ fontWeight: 600 }}>[{res.bucket}]</span> {res.path}
                        {res.error && <div style={{ color: '#b31d28', fontSize: '0.7rem' }}>{res.error}</div>}
                      </div>
                      <span style={{
                        padding: '2px 6px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        backgroundColor: res.success ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                        color: res.success ? '#15803d' : '#b31d28'
                      }}>
                        {res.success ? 'Deleted' : 'Failed'}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => {
                      setIsConfirmModalOpen(false);
                      setDeletionResult(null);
                    }}
                    className="btn btn-primary"
                    style={{ padding: '0.5rem 1.25rem' }}
                  >
                    Close & Finish
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{
                  padding: 'var(--space-3) var(--space-4)',
                  backgroundColor: 'rgba(239, 68, 68, 0.05)',
                  borderLeft: '3px solid #b31d28',
                  marginBottom: 'var(--space-5)',
                  fontSize: '0.8rem'
                }}>
                  You are about to permanently delete <strong>{selectedCandidates.length} storage object(s)</strong> totaling <strong>{formatBytes(totalSelectedBytes)}</strong>.
                  This action strictly removes the selected files from Supabase Storage buckets. Database records will not be modified.
                </div>

                {/* Selected Files Preview List */}
                <div style={{ marginBottom: 'var(--space-5)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', color: 'var(--color-text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: 'var(--space-2)' }}>
                    Files to be deleted ({selectedCandidates.length})
                  </span>
                  <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--color-border-subtle)', fontSize: '0.75rem' }}>
                    {selectedCandidates.map((c, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: 'var(--space-2) var(--space-3)',
                          borderBottom: '1px solid var(--color-border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 'var(--space-2)'
                        }}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <strong style={{ color: 'var(--color-accent)' }}>[{c.bucket}]</strong> {c.path}
                        </span>
                        <span style={{ whiteSpace: 'nowrap', color: 'var(--color-text-secondary)' }}>
                          {formatBytes(c.size)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Explicit Checkbox Confirmation */}
                <label style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--space-3)',
                  marginBottom: 'var(--space-4)',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}>
                  <input
                    type="checkbox"
                    checked={confirmCheckbox}
                    onChange={(e) => setConfirmCheckbox(e.target.checked)}
                    disabled={isDeleting}
                    style={{ marginTop: '3px' }}
                  />
                  <span>
                    I confirm that these {selectedCandidates.length} objects are unreferenced and should be permanently purged from Supabase Storage.
                  </span>
                </label>

                {/* Explicit Text Confirmation */}
                <div style={{ marginBottom: 'var(--space-6)' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
                    Type <strong style={{ color: 'var(--color-text-primary)' }}>DELETE</strong> to authorize permanent storage cleanup:
                  </label>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="DELETE"
                    disabled={isDeleting}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid var(--color-border-subtle)',
                      backgroundColor: 'var(--color-bg-main)',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                  <button
                    onClick={() => setIsConfirmModalOpen(false)}
                    disabled={isDeleting}
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExecuteDeletion}
                    disabled={isDeleting || !confirmCheckbox || confirmText.trim().toUpperCase() !== 'DELETE'}
                    className="btn btn-primary"
                    style={{
                      backgroundColor: '#b31d28',
                      borderColor: '#b31d28',
                      padding: '0.5rem 1.25rem',
                      opacity: (isDeleting || !confirmCheckbox || confirmText.trim().toUpperCase() !== 'DELETE') ? 0.5 : 1,
                      cursor: (isDeleting || !confirmCheckbox || confirmText.trim().toUpperCase() !== 'DELETE') ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)'
                    }}
                  >
                    {isDeleting && <RefreshCw size={14} className="spin" />}
                    <span>{isDeleting ? 'Deleting Batch...' : 'Confirm Permanent Deletion'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
