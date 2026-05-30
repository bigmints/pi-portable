/**
 * File icon utility — returns the appropriate lucide-react icon
 * component for a file type based on its extension.
 */

import {
  File,
  FileCode,
  FileJson,
  FileText,
  Image,
  FileTerminal,
} from 'lucide-react';

export function getFileIcon(filename: string): React.ReactNode {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const iconMap: Record<string, React.ReactNode> = {
    ts: <FileCode size={16} />,
    tsx: <FileCode size={16} />,
    js: <FileCode size={16} />,
    jsx: <FileCode size={16} />,
    py: <FileCode size={16} />,
    rs: <FileCode size={16} />,
    go: <FileCode size={16} />,
    rb: <FileCode size={16} />,
    java: <FileCode size={16} />,
    json: <FileJson size={16} />,
    yaml: <FileText size={16} />,
    yml: <FileText size={16} />,
    toml: <FileText size={16} />,
    md: <FileText size={16} />,
    html: <FileText size={16} />,
    css: <FileText size={16} />,
    scss: <FileText size={16} />,
    png: <Image size={16} />,
    jpg: <Image size={16} />,
    jpeg: <Image size={16} />,
    gif: <Image size={16} />,
    webp: <Image size={16} />,
    bmp: <Image size={16} />,
    ico: <Image size={16} />,
    svg: <Image size={16} />,
    sh: <FileTerminal size={16} />,
    bash: <FileTerminal size={16} />,
    zsh: <FileTerminal size={16} />,
  };
  return iconMap[ext] || <File size={16} />;
}
