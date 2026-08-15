import React, { useState } from 'react';
import {
  FolderArchive,
  Plus,
  Search,
  FileText,
  Image as ImageIcon,
  FileCode,
  Download,
  Trash2,
  ExternalLink,
  X,
  Eye,
  Calendar,
  Layers,
  HardDrive,
  User,
  FolderKanban,
  FileCheck,
  Folder,
  FolderOpen,
  GripVertical,
  ArrowRight,
  MoveRight,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { ProjectFile } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input, Select } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';

interface FilesViewProps {
  onNavigateTab: (tab: any, entityId?: string) => void;
}

export const FilesView: React.FC<FilesViewProps> = ({ onNavigateTab }) => {
  const { files, projects, addFile, updateFile, deleteFile } = useDatabase();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Folder organization mode
  const [folderViewType, setFolderViewType] = useState<'categories' | 'projects'>('categories');
  const [activeFolderFilter, setActiveFolderFilter] = useState<string | null>(null);
  const [draggingFileId, setDraggingFileId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [movedNotification, setMovedNotification] = useState<string | null>(null);

  // New file modal state
  const [fileName, setFileName] = useState('');
  const [category, setCategory] = useState<ProjectFile['category']>('design');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [fileUrl, setFileUrl] = useState('');
  const [size, setSize] = useState('2.4 MB');

  const selectedProj = projects.find((p) => p.id === projectId);

  // Categories definition
  const categoryFolders: { id: ProjectFile['category']; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'briefing', label: 'Briefings & Requisitos', icon: <FileText className="w-4 h-4" />, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/60' },
    { id: 'logo', label: 'Logotipos & Vetores', icon: <ImageIcon className="w-4 h-4" />, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60' },
    { id: 'design', label: 'Design / Figma / UI', icon: <Layers className="w-4 h-4" />, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/60' },
    { id: 'documento', label: 'Documentos & Propostas', icon: <FileText className="w-4 h-4" />, color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/60' },
    { id: 'contrato', label: 'Contratos Assinados', icon: <FileCheck className="w-4 h-4" />, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/60' },
    { id: 'codigo', label: 'Código & Backups', icon: <FileCode className="w-4 h-4" />, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/60' },
  ];

  // Project Folders definition
  const projectFolders = [
    { id: 'general', name: 'Arquivos Gerais / Sem Projeto', clientName: 'Geral', count: files.filter((f) => !f.projectId).length },
    ...projects.map((p) => ({
      id: p.id,
      name: p.name,
      clientName: p.clientName,
      count: files.filter((f) => f.projectId === p.id).length,
    })),
  ];

  const filteredFiles = files.filter((f) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      f.name.toLowerCase().includes(term) ||
      (f.projectName && f.projectName.toLowerCase().includes(term)) ||
      (f.clientName && f.clientName.toLowerCase().includes(term));

    if (activeFolderFilter) {
      if (folderViewType === 'categories') {
        return matchesSearch && f.category === activeFolderFilter;
      } else {
        if (activeFolderFilter === 'general') {
          return matchesSearch && !f.projectId;
        }
        return matchesSearch && f.projectId === activeFolderFilter;
      }
    }

    return matchesSearch;
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) return;

    addFile({
      name: fileName,
      category,
      projectId: selectedProj?.id,
      projectName: selectedProj?.name,
      clientId: selectedProj?.clientId,
      clientName: selectedProj?.clientName,
      url: fileUrl || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
      size,
      mimeType: fileName.endsWith('.pdf') ? 'application/pdf' : fileName.match(/\.(png|jpe?g|webp|svg)$/i) ? 'image/png' : 'application/octet-stream',
    });

    setIsUploadOpen(false);
    setFileName('');
    setFileUrl('');
  };

  const isImageFile = (file: ProjectFile) => {
    return (
      file.category === 'logo' ||
      file.category === 'design' ||
      file.url.match(/\.(jpeg|jpg|gif|png|webp|svg)/i) !== null ||
      file.mimeType?.startsWith('image/')
    );
  };

  const isPdfFile = (file: ProjectFile) => {
    return (
      file.name.toLowerCase().endsWith('.pdf') ||
      file.category === 'contrato' ||
      file.category === 'documento' ||
      file.mimeType === 'application/pdf'
    );
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, fileId: string) => {
    e.dataTransfer.setData('text/plain', fileId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingFileId(fileId);
  };

  const handleDragEnd = () => {
    setDraggingFileId(null);
    setDragOverFolderId(null);
  };

  const handleFolderDrop = (e: React.DragEvent, folderId: string, folderType: 'category' | 'project') => {
    e.preventDefault();
    const fileId = e.dataTransfer.getData('text/plain') || draggingFileId;
    if (!fileId) return;

    const file = files.find((f) => f.id === fileId);
    if (!file) return;

    if (folderType === 'category') {
      const cat = folderId as ProjectFile['category'];
      updateFile(fileId, { category: cat });
      const catObj = categoryFolders.find((c) => c.id === cat);
      setMovedNotification(`"${file.name}" movido para a pasta "${catObj?.label || cat}"!`);
    } else {
      if (folderId === 'general') {
        updateFile(fileId, {
          projectId: undefined,
          projectName: undefined,
          clientId: undefined,
          clientName: undefined,
        });
        setMovedNotification(`"${file.name}" movido para "Arquivos Gerais"!`);
      } else {
        const targetProj = projects.find((p) => p.id === folderId);
        if (targetProj) {
          updateFile(fileId, {
            projectId: targetProj.id,
            projectName: targetProj.name,
            clientId: targetProj.clientId,
            clientName: targetProj.clientName,
          });
          setMovedNotification(`"${file.name}" movido para o projeto "${targetProj.name}"!`);
        }
      }
    }

    setDragOverFolderId(null);
    setDraggingFileId(null);
    setTimeout(() => setMovedNotification(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderArchive className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Central de Arquivos, Pastas & Ativos
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Arraste e solte arquivos entre pastas ou projetos para reorganizar seus entregáveis rapidamente.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsUploadOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Enviar / Anexar Arquivo
        </Button>
      </div>

      {/* Moved Notification Toast */}
      {movedNotification && (
        <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-md flex items-center justify-between gap-3 text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{movedNotification}</span>
          </div>
          <button onClick={() => setMovedNotification(null)} className="text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Drag-and-Drop Folders Explorer Bar */}
      <Card padding="md" className="space-y-3 bg-slate-50/70 dark:bg-slate-850/70 border-indigo-100 dark:border-indigo-900/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Pastas & Diretórios (Arraste arquivos para mover)
            </h3>
          </div>

          {/* Folder Mode Switch */}
          <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
            <button
              onClick={() => {
                setFolderViewType('categories');
                setActiveFolderFilter(null);
              }}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                folderViewType === 'categories'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Pastas por Categoria
            </button>
            <button
              onClick={() => {
                setFolderViewType('projects');
                setActiveFolderFilter(null);
              }}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                folderViewType === 'projects'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Pastas por Projeto
            </button>
          </div>
        </div>

        {/* Folders Drop Targets Grid */}
        {folderViewType === 'categories' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {categoryFolders.map((cat) => {
              const fileCount = files.filter((f) => f.category === cat.id).length;
              const isActive = activeFolderFilter === cat.id;
              const isDragOver = dragOverFolderId === cat.id;

              return (
                <div
                  key={cat.id}
                  onClick={() => setActiveFolderFilter(isActive ? null : cat.id)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverFolderId(cat.id);
                  }}
                  onDragLeave={() => setDragOverFolderId(null)}
                  onDrop={(e) => handleFolderDrop(e, cat.id, 'category')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer select-none flex flex-col justify-between min-h-[85px] group ${
                    isDragOver
                      ? 'border-indigo-600 bg-indigo-100 dark:bg-indigo-950 ring-2 ring-indigo-500 scale-105 shadow-md'
                      : isActive
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 ring-1 ring-indigo-500'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <div className={`p-1.5 rounded-lg ${cat.color} shrink-0`}>
                      {isActive || isDragOver ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
                    </div>
                    <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {fileCount}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 transition-colors">
                      {cat.label}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {isDragOver ? 'Solte para mover aqui!' : isActive ? 'Filtro ativo' : 'Arraste ou clique'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto pr-1">
            {projectFolders.map((pf) => {
              const isActive = activeFolderFilter === pf.id;
              const isDragOver = dragOverFolderId === pf.id;

              return (
                <div
                  key={pf.id}
                  onClick={() => setActiveFolderFilter(isActive ? null : pf.id)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverFolderId(pf.id);
                  }}
                  onDragLeave={() => setDragOverFolderId(null)}
                  onDrop={(e) => handleFolderDrop(e, pf.id, 'project')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer select-none flex flex-col justify-between min-h-[75px] group ${
                    isDragOver
                      ? 'border-indigo-600 bg-indigo-100 dark:bg-indigo-950 ring-2 ring-indigo-500 scale-105 shadow-md'
                      : isActive
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 ring-1 ring-indigo-500'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 shrink-0">
                      {isActive || isDragOver ? <FolderOpen className="w-4 h-4" /> : <FolderKanban className="w-4 h-4" />}
                    </div>
                    <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {pf.count} arq.
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 transition-colors">
                      {pf.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 truncate">
                      {isDragOver ? 'Solte para vincular ao projeto!' : pf.clientName}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Filter & Breadcrumb Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <div className="flex-1">
            <Input
              placeholder="Pesquisar arquivos por nome, projeto ou cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          {activeFolderFilter && (
            <button
              onClick={() => setActiveFolderFilter(null)}
              className="px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/60 text-xs font-semibold flex items-center gap-1.5 shrink-0 hover:bg-indigo-100 transition-colors"
            >
              <span>Pasta: {activeFolderFilter}</span>
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">
          Exibindo {filteredFiles.length} de {files.length} arquivos
        </span>
      </div>

      {/* Main Content Layout with Side-panel Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Grid of files (Takes full width if no selection, or 8 cols if selection active) */}
        <div className={`${selectedFile ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
          {filteredFiles.length === 0 ? (
            <Card padding="lg" className="border-dashed">
              <EmptyState
                variant="files"
                title={files.length === 0 ? 'Nenhum arquivo ou ativo anexado' : 'Nenhum arquivo nesta pasta'}
                description={
                  files.length === 0
                    ? 'Faça upload de briefings, referências visuais, logos em vetor e contratos assinados para manter tudo organizado por projeto.'
                    : 'Esta pasta está vazia. Arraste outros arquivos para esta pasta ou clique no botão de envio.'
                }
                actionText="Anexar Primeiro Arquivo"
                onAction={() => setIsUploadOpen(true)}
              />
            </Card>
          ) : (
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${selectedFile ? 'xl:grid-cols-2' : 'md:grid-cols-3 xl:grid-cols-4'} gap-4`}>
              {filteredFiles.map((file) => {
                const isSelected = selectedFile?.id === file.id;
                const isDragging = draggingFileId === file.id;

                return (
                  <Card
                    key={file.id}
                    padding="md"
                    hover
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, file.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setSelectedFile(file)}
                    className={`space-y-3 cursor-grab active:cursor-grabbing group transition-all relative ${
                      isDragging ? 'opacity-40 scale-95 border-dashed border-indigo-400' : ''
                    } ${
                      isSelected
                        ? 'ring-2 ring-indigo-600 dark:ring-indigo-400 border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20'
                        : ''
                    }`}
                  >
                    {/* Drag Grip Handle Affordance */}
                    <div className="absolute top-2 left-2 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 cursor-grab" title="Arraste para mover para outra pasta">
                      <GripVertical className="w-3.5 h-3.5" />
                    </div>

                    <div className="flex items-start justify-between gap-2 pl-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-2xs">
                        {isImageFile(file) ? (
                          <ImageIcon className="w-5 h-5" />
                        ) : file.category === 'codigo' ? (
                          <FileCode className="w-5 h-5" />
                        ) : isPdfFile(file) ? (
                          <FileCheck className="w-5 h-5 text-rose-500" />
                        ) : (
                          <FileText className="w-5 h-5" />
                        )}
                      </div>

                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {file.category}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" title={file.name}>
                        {file.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        Projeto: <strong className="text-slate-700 dark:text-slate-300">{file.projectName || 'Geral'}</strong>
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {file.size} • {new Date(file.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(file);
                        }}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" /> Detalhes & Prévia
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (selectedFile?.id === file.id) setSelectedFile(null);
                          deleteFile(file.id);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Excluir arquivo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* SIDE-PANEL PREVIEW */}
        {selectedFile && (
          <div className="lg:col-span-4 sticky top-6">
            <Card padding="md" className="space-y-4 shadow-lg border-indigo-200 dark:border-indigo-900/60 animate-in fade-in slide-in-from-right-4 duration-200">
              {/* Panel Top Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    <Eye className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    Pré-visualização do Ativo
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Visual Preview Box */}
              <div className="w-full rounded-xl overflow-hidden bg-slate-950/5 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center min-h-[190px] relative group">
                {isImageFile(selectedFile) ? (
                  <img
                    src={selectedFile.url}
                    alt={selectedFile.name}
                    className="max-h-56 w-full object-contain rounded-lg p-2"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : isPdfFile(selectedFile) ? (
                  <div className="p-6 text-center space-y-2">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center shadow-xs">
                      <FileCheck className="w-7 h-7" />
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Documento PDF</p>
                    <p className="text-[11px] text-slate-400">Pronto para visualização e impressão</p>
                  </div>
                ) : (
                  <div className="p-6 text-center space-y-2">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 flex items-center justify-center shadow-xs">
                      <FileText className="w-7 h-7" />
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Arquivo / Ativo</p>
                    <p className="text-[11px] text-slate-400">{selectedFile.mimeType || 'Arquivo binário'}</p>
                  </div>
                )}
              </div>

              {/* File Metadata Details */}
              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block">Nome do Arquivo:</span>
                  <p className="font-bold text-slate-900 dark:text-white break-words">
                    {selectedFile.name}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-slate-400 text-[11px] flex items-center gap-1">
                      <HardDrive className="w-3 h-3" /> Tamanho:
                    </span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedFile.size}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] flex items-center gap-1">
                      <Layers className="w-3 h-3" /> Categoria:
                    </span>
                    <p className="font-semibold text-indigo-600 dark:text-indigo-400 capitalize">{selectedFile.category}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-slate-400 text-[11px] flex items-center gap-1">
                      <FolderKanban className="w-3 h-3" /> Projeto:
                    </span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {selectedFile.projectName || 'Geral'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Criado em:
                    </span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {new Date(selectedFile.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                {selectedFile.clientName && (
                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 text-[11px] flex items-center gap-1">
                      <User className="w-3 h-3" /> Cliente:
                    </span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedFile.clientName}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <a
                  href={selectedFile.url}
                  target="_blank"
                  rel="noreferrer"
                  download={selectedFile.name}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4" /> Download / Abrir Original
                </a>

                <div className="flex items-center gap-2">
                  {selectedFile.projectId && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-[11px]"
                      onClick={() => onNavigateTab('projetos', selectedFile.projectId)}
                      leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                    >
                      Ir ao Projeto
                    </Button>
                  )}

                  <Button
                    variant="danger"
                    size="sm"
                    className="text-[11px] px-3"
                    onClick={() => {
                      deleteFile(selectedFile.id);
                      setSelectedFile(null);
                    }}
                    title="Excluir arquivo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Upload File Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Anexar Novo Arquivo / Ativo"
        description="Vincule briefings, referências visuais, marcas e documentos aos projetos."
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <Input
            label="Nome do Arquivo *"
            placeholder="Ex: Manual_Identidade_Visual_Vetor.pdf"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Categoria *"
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
            >
              <option value="briefing">Briefing & Requisitos</option>
              <option value="logo">Logotipo / Vetor SVG</option>
              <option value="design">Design / Figma / UI</option>
              <option value="documento">Documento Geral</option>
              <option value="contrato">Contrato Assinado</option>
              <option value="codigo">Código / Backup</option>
            </Select>

            <Select
              label="Vincular ao Projeto"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            >
              <option value="">Geral (Sem projeto)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.clientName})
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="URL Externa / Download (Opcional)"
              placeholder="https://exemplo.com/arquivo.pdf ou link Figma"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
            />

            <Input
              label="Tamanho Estimado"
              placeholder="Ex: 4.5 MB"
              value={size}
              onChange={(e) => setSize(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsUploadOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Anexar Arquivo
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
