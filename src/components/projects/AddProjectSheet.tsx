'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Folder, GitBranch, Link2, Terminal } from 'lucide-react';
import { useProjectStore } from '@/store/projects';
import { showToast } from '@/components/common/Toast';
import styles from './AddProjectSheet.module.css';

interface AddProjectSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddProjectSheet({ isOpen, onClose }: AddProjectSheetProps) {
  const { addProject, updateProject, loading, error, setError } = useProjectStore();

  const [type, setType] = useState<'local' | 'git'>('local');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [path, setPath] = useState('');
  const [branch, setBranch] = useState('main');
  const [validationError, setValidationError] = useState<string | null>(null);

  const sheetRef = useRef<HTMLDivElement>(null);

  // Sync / Reset state when opened/closed
  useEffect(() => {
    if (isOpen) {
      setType('local');
      setName('');
      setDescription('');
      setPath('');
      setBranch('main');
      setValidationError(null);
      setError(null);
    }
  }, [isOpen, setError]);

  // Handle Escape key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Focus trap inside the drawer
  useEffect(() => {
    if (!isOpen) return;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const sheet = sheetRef.current;
      if (!sheet) return;

      const focusable = sheet.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleTab);
    return () => {
      window.removeEventListener('keydown', handleTab);
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedPath = path.trim();

    // Front-end Validation
    if (!trimmedPath) {
      setValidationError('Path or repository URL is required.');
      return;
    }

    if (type === 'local') {
      if (!trimmedPath.startsWith('/') && !trimmedPath.match(/^[a-zA-Z]:\\/)) {
        setValidationError('Invalid local path format. Must be an absolute path.');
        return;
      }
    } else {
      try {
        new URL(trimmedPath);
      } catch {
        if (!trimmedPath.includes('@') || !trimmedPath.includes(':')) {
          setValidationError('Invalid Git URL format.');
          return;
        }
      }
    }

    // Call store action
    const project = await addProject({
      type,
      path: trimmedPath,
      branch: type === 'git' ? branch.trim() : undefined,
    });

    if (project) {
      // If the user supplied a custom description or a custom name,
      // and updateProject action is defined, we can perform a PATCH update
      if (description.trim() && typeof updateProject === 'function') {
        await updateProject(project.id, {
          description: description.trim(),
        });
      }
      
      showToast(`Project "${project.name}" added successfully`, 'success');
      onClose();
    } else {
      showToast(error || 'Failed to add project', 'error');
    }
  };

  return (
    <>
      <div
        className={`${styles.overlay} ${isOpen ? styles.open : ''}`}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />
      <div
        ref={sheetRef}
        className={`${styles.drawer} ${isOpen ? styles.open : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-project-title"
      >
        <div className={styles.header}>
          <div className={styles.titleContainer}>
            <h2 id="add-project-title" className={styles.title}>
              Add New Project
            </h2>
            <span className={styles.subtitle}>
              Connect a project folder or repository
            </span>
          </div>
          <button
            className={styles.closeButton}
            onClick={onClose}
            disabled={loading}
            aria-label="Close add project drawer"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Tab selection */}
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tabButton} ${type === 'local' ? styles.active : ''}`}
            onClick={() => {
              setType('local');
              setValidationError(null);
            }}
            disabled={loading}
          >
            <Folder size={14} />
            <span>Local Directory</span>
          </button>
          <button
            type="button"
            className={`${styles.tabButton} ${type === 'git' ? styles.active : ''}`}
            onClick={() => {
              setType('git');
              setValidationError(null);
            }}
            disabled={loading}
          >
            <GitBranch size={14} />
            <span>Git Repository</span>
          </button>
        </div>

        <form onSubmit={handleSave} className={styles.form}>
          <div className={styles.content}>
            {/* Local path or Git URL depending on selection */}
            {type === 'local' ? (
              <div className={styles.field}>
                <label htmlFor="directory-path" className={styles.label}>
                  <Folder size={16} strokeWidth={1.5} />
                  <span>Directory Path</span>
                </label>
                <input
                  id="directory-path"
                  type="text"
                  className={styles.input}
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                  placeholder="e.g. /home/user/my-project"
                  required
                  disabled={loading}
                />
                <span className={styles.hint}>
                  Enter the absolute path to your local project folder.
                </span>
              </div>
            ) : (
              <>
                <div className={styles.field}>
                  <label htmlFor="repo-url" className={styles.label}>
                    <Link2 size={16} strokeWidth={1.5} />
                    <span>Repository URL</span>
                  </label>
                  <input
                    id="repo-url"
                    type="text"
                    className={styles.input}
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                    placeholder="e.g. https://github.com/username/repo.git"
                    required
                    disabled={loading}
                  />
                  <span className={styles.hint}>
                    HTTPS or SSH git clone URL.
                  </span>
                </div>

                <div className={styles.field}>
                  <label htmlFor="branch-name" className={styles.label}>
                    <GitBranch size={16} strokeWidth={1.5} />
                    <span>Branch</span>
                  </label>
                  <input
                    id="branch-name"
                    type="text"
                    className={styles.input}
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="main"
                    disabled={loading}
                  />
                </div>
              </>
            )}

            {/* Description (Custom Option) */}
            <div className={styles.field}>
              <label htmlFor="project-description" className={styles.label}>
                Description
              </label>
              <textarea
                id="project-description"
                className={styles.textarea}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description of this project..."
                disabled={loading}
              />
            </div>

            {/* Error alerts */}
            {(validationError || error) && (
              <div className={styles.errorAlert}>
                {validationError || error}
              </div>
            )}
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={loading}
            >
              {loading && (
                <Terminal size={14} className={styles.spinner} />
              )}
              <span>{loading ? 'Adding...' : 'Add Project'}</span>
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
