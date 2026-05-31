/**
 * Attachments store — manages pending file attachments for messages
 */

import { create } from 'zustand';

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export interface PendingFile {
  id: string; // unique ID for the pill
  file: File;
  name: string;
  size: number;
  type: string;
  previewUrl?: string; // for images
  uploadedId?: string; // server-returned ID after upload
}

interface AttachmentState {
  files: PendingFile[];
  error: string | null;
  addFile: (file: File) => string | null; // returns id if added, null if rejected
  removeFile: (id: string) => void;
  clearFiles: () => void;
  setError: (error: string | null) => void;
  setUploadedId: (fileId: string, serverId: string) => void;
  getUploadedIds: () => string[];
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useAttachmentsStore = create<AttachmentState>((set, get) => ({
  files: [],
  error: null,

  addFile: (file: File): string | null => {
    const { files, setError } = get();

    // Check size limit
    if (file.size > MAX_FILE_SIZE) {
      setError(`${file.name} exceeds 10 MB limit`);
      return null;
    }

    // Check file count limit
    if (files.length >= MAX_FILES) {
      setError(`Maximum ${MAX_FILES} files allowed`);
      return null;
    }

    // Clear any previous error
    setError(null);

    const isImage = file.type.startsWith('image/');
    const previewUrl = isImage ? URL.createObjectURL(file) : undefined;
    const fileId = generateId();

    const pendingFile: PendingFile = {
      id: fileId,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      previewUrl,
    };

    set((state) => ({
      files: [...state.files, pendingFile],
      error: null,
    }));

    return fileId;
  },

  removeFile: (id: string) => {
    set((state) => {
      const file = state.files.find((f) => f.id === id);
      if (file?.previewUrl) {
        URL.revokeObjectURL(file.previewUrl);
      }
      return {
        files: state.files.filter((f) => f.id !== id),
      };
    });
  },

  clearFiles: () => {
    set((state) => {
      for (const file of state.files) {
        if (file.previewUrl) {
          URL.revokeObjectURL(file.previewUrl);
        }
      }
      return { files: [], error: null };
    });
  },

  setError: (error: string | null) => set(() => ({ error })),

  setUploadedId: (fileId: string, serverId: string) => {
    set((state) => ({
      files: state.files.map((f) =>
        f.id === fileId ? { ...f, uploadedId: serverId } : f
      ),
    }));
  },

  getUploadedIds: (): string[] => {
    const { files } = get();
    return files
      .filter((f) => f.uploadedId !== undefined)
      .map((f) => f.uploadedId!)
      .filter((id): id is string => id != null);
  },
}));
