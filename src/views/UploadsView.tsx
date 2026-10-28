import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { UploadedFile } from '../types';
import {
  UploadCloud,
  FileText,
  FileCode,
  Image as ImageIcon,
  FileArchive,
  Download,
  Trash2,
  Copy,
  Check,
  Search,
  Filter,
  ExternalLink,
  HardDrive,
  FolderOpen,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const UploadsView: React.FC = () => {
  const {
    uploadedFiles,
    uploadFile,
    deleteUploadedFile,
    currentUser,
    projects
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state for new upload
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [category, setCategory] = useState<UploadedFile['category']>('Project Document');
  const [description, setDescription] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories: Array<UploadedFile['category']> = [
    'Project Document',
    'Assignment / Notes',
    'Competition Entry',
    'Code / Technical',
    'Other'
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileToUpload(e.target.files[0]);
      setUploadError(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFileToUpload(e.dataTransfer.files[0]);
      setUploadError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleSubmitUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileToUpload) {
      setUploadError('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    const res = await uploadFile(
      fileToUpload,
      category,
      description.trim() || undefined,
      selectedProjectId || undefined
    );

    setIsUploading(false);

    if (res.success && res.file) {
      setUploadSuccess(`"${res.file.originalName}" uploaded successfully to root /uploads!`);
      setFileToUpload(null);
      setDescription('');
      setSelectedProjectId('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setUploadSuccess(null), 4000);
    } else {
      setUploadError(res.error || 'Failed to upload file');
    }
  };

  const handleCopyLink = (file: UploadedFile) => {
    const fullUrl = window.location.origin + file.url;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(file.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDelete = async (file: UploadedFile) => {
    if (!currentUser) return;
    const isOwner = file.uploadedBy.id === currentUser.id;
    const isStaff = currentUser.role === 'admin' || currentUser.role === 'developer' || currentUser.role === 'teacher';

    if (!isOwner && !isStaff) {
      alert('Only the original uploader or faculty mentors can remove this file.');
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${file.originalName}"?`)) {
      await deleteUploadedFile(file.id);
    }
  };

  // Helper to format file size
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Helper to get file icon
  const getFileIcon = (mimeType: string, filename: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="w-6 h-6 text-emerald-500" />;
    if (mimeType.includes('zip') || mimeType.includes('tar') || mimeType.includes('compressed'))
      return <FileArchive className="w-6 h-6 text-amber-500" />;
    if (filename.endsWith('.ts') || filename.endsWith('.tsx') || filename.endsWith('.js') || filename.endsWith('.py') || filename.endsWith('.json'))
      return <FileCode className="w-6 h-6 text-blue-500" />;
    return <FileText className="w-6 h-6 text-indigo-500" />;
  };

  // Filtered files
  const filteredFiles = uploadedFiles.filter(file => {
    const matchesSearch =
      file.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (file.description && file.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      file.uploadedBy.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || file.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const totalBytes = uploadedFiles.reduce((acc, f) => acc + (f.size || 0), 0);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-blue-800/40">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold tracking-wide">
            <HardDrive className="w-3.5 h-3.5 text-blue-300" />
            <span>Root Repository • /uploads</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            PeerForge Files & Uploads Hub
          </h1>
          <p className="text-blue-100/90 text-sm leading-relaxed">
            Centralized document and asset repository for OPG World School. Upload team project blueprints, research papers, Olympiad solutions, presentation decks, and datasets directly into the project directory.
          </p>

          {/* Quick Metrics */}
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-medium text-blue-200">
            <span className="px-3 py-1 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
              📁 {uploadedFiles.length} Uploaded Files
            </span>
            <span className="px-3 py-1 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
              💾 {formatSize(totalBytes)} Storage Used
            </span>
            <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Server Synced
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Upload Box on Left/Top, File Browser on Right/Bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form Box */}
        <div className="lg:col-span-1 bg-[var(--bg-surface)] p-5 sm:p-6 rounded-2xl border border-[var(--border-color)] shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--border-color)]">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">Upload New File</h2>
              <p className="text-[11px] text-[var(--text-muted)]">Target path: /uploads</p>
            </div>
          </div>

          {uploadSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{uploadSuccess}</span>
            </div>
          )}

          {uploadError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{uploadError}</span>
            </div>
          )}

          <form onSubmit={handleSubmitUpload} className="space-y-4">
            {/* Dropzone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
                  : fileToUpload
                  ? 'border-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20'
                  : 'border-[var(--border-color)] hover:border-blue-400 hover:bg-[var(--bg-subtle)]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />

              <div className="flex flex-col items-center gap-2">
                <div className={`p-3 rounded-full ${fileToUpload ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300'}`}>
                  {fileToUpload ? <Check className="w-5 h-5" /> : <UploadCloud className="w-5 h-5" />}
                </div>

                {fileToUpload ? (
                  <div>
                    <p className="text-xs font-bold text-[var(--text-primary)] truncate max-w-[220px]">
                      {fileToUpload.name}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      {formatSize(fileToUpload.size)}
                    </p>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 underline mt-1 inline-block">
                      Click to choose a different file
                    </span>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-semibold text-[var(--text-primary)]">
                      Drag & drop your file here
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      or click to browse from device (up to 30MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Category selection */}
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as UploadedFile['category'])}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] text-[var(--text-primary)] focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Project linkage */}
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                Associate with Project (Optional)
              </label>
              <select
                value={selectedProjectId}
                onChange={e => setSelectedProjectId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] text-[var(--text-primary)] focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="">None (General school file)</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                Description / Notes
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="What is this file for? e.g. CAD model for autonomous rover, Class 11 physics notes..."
                rows={2}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={!fileToUpload || isUploading}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white transition-all shadow-xs flex items-center justify-center gap-2 ${
                !fileToUpload || isUploading
                  ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed opacity-60'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'
              }`}
            >
              {isUploading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving to /uploads...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload to /uploads</span>
                </>
              )}
            </button>
          </form>

          {/* Guidelines Note */}
          <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/40 text-[11px] text-[var(--text-secondary)] space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-blue-700 dark:text-blue-300">
              <Info className="w-3.5 h-3.5" />
              <span>Storage Notice</span>
            </div>
            <p>
              Uploaded files are stored directly in the workspace root directory <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded text-[10px] font-mono">/uploads</code> and can be linked in Project briefs and Q&A solutions.
            </p>
          </div>
        </div>

        {/* Files Browser on Right */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="bg-[var(--bg-surface)] p-4 rounded-2xl border border-[var(--border-color)] shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search files by name, uploader, or notes..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {['All', ...categories].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white shadow-2xs font-semibold'
                        : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* File Cards List */}
          {filteredFiles.length === 0 ? (
            <div className="bg-[var(--bg-surface)] p-12 rounded-2xl border border-[var(--border-color)] text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-500 mx-auto flex items-center justify-center">
                <FolderOpen className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">No files found</h3>
              <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                {searchQuery || selectedCategory !== 'All'
                  ? 'No uploaded files match your search query or filter. Try clearing filters.'
                  : 'No files uploaded yet. Be the first to share research notes, blueprints, or project slides!'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFiles.map(file => {
                const isCopied = copiedId === file.id;
                const associatedProject = projects.find(p => p.id === file.projectId);

                return (
                  <div
                    key={file.id}
                    className="bg-[var(--bg-surface)] p-4 rounded-2xl border border-[var(--border-color)] hover:border-blue-300 dark:hover:border-blue-700/60 transition-all shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                  >
                    {/* Left: Icon & Info */}
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      <div className="p-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-color)] shrink-0 group-hover:scale-105 transition-transform">
                        {getFileIcon(file.mimeType, file.filename)}
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-bold text-[var(--text-primary)] truncate max-w-md">
                            {file.originalName}
                          </h4>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/40">
                            {file.category}
                          </span>
                          {associatedProject && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/50">
                              📌 {associatedProject.title}
                            </span>
                          )}
                        </div>

                        {file.description && (
                          <p className="text-xs text-[var(--text-secondary)] line-clamp-1">
                            {file.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-[var(--text-muted)] pt-0.5">
                          <span className="font-mono">{formatSize(file.size)}</span>
                          <span>•</span>
                          <span>{file.uploadedAt}</span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <img
                              src={file.uploadedBy.avatar}
                              alt={file.uploadedBy.name}
                              className="w-3.5 h-3.5 rounded-full"
                            />
                            <span>{file.uploadedBy.name}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {/* Copy Link Button */}
                      <button
                        onClick={() => handleCopyLink(file)}
                        title="Copy direct file URL"
                        className="px-2.5 py-1.5 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--border-color)] text-[var(--text-secondary)] text-xs font-medium flex items-center gap-1.5 transition-colors border border-[var(--border-color)]"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600 font-semibold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>

                      {/* Download / Open File Button */}
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        download={file.originalName}
                        title="Download or preview file"
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>

                      {/* Delete Button */}
                      {currentUser && (file.uploadedBy.id === currentUser.id ||
                        currentUser.role === 'admin' ||
                        currentUser.role === 'developer' ||
                        currentUser.role === 'teacher') && (
                        <button
                          onClick={() => handleDelete(file)}
                          title="Delete file"
                          className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
