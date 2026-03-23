"use client";

import React, { useState, useCallback } from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import DragDropArea from "@/components/DragDropArea";
import OutputFormatSelector from "@/components/OutputFormatSelector";
import FileCard from "@/components/FileCard";
import ConvertAllButton from "@/components/ConvertAllButton";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModeToggle } from "@/components/mode-toggle";

declare global {
  interface Window {
    electron: {
      convertFile: (filePath: string, format: string, outputDir?: string) => Promise<{ success: boolean; path?: string; error?: string }>;
      showInFolder: (filePath: string) => Promise<void>;
      getFilePath: (file: File) => string;
      selectDirectory: () => Promise<string | null>;
    };
  }
}


interface FileToConvert {
  id: string;
  file: File;
  name: string;
  type: string;
  size: number;
  progress: number;
  status: 'pending' | 'uploading' | 'converting' | 'completed' | 'failed';
  outputFormat: string;
  outputUrl?: string;
  mediaType: 'image' | 'video' | 'audio' | 'document';
}

const imageConversionOptions = [
  { value: "jpg", label: "JPG" },
  { value: "png", label: "PNG" },
  { value: "webp", label: "WEBP" },
  { value: "gif", label: "GIF" },
  { value: "bmp", label: "BMP" },
  { value: "tiff", label: "TIFF" },
  { value: "ico", label: "ICO" },
  { value: "pdf", label: "PDF" },
];

const videoConversionOptions = [
  { value: "mp4", label: "MP4" },
  { value: "mov", label: "MOV" },
  { value: "avi", label: "AVI" },
  { value: "mkv", label: "MKV" },
  { value: "webm", label: "WEBM" },
  { value: "flv", label: "FLV" },
  { value: "wmv", label: "WMV" },
];

const audioConversionOptions = [
  { value: "mp3", label: "MP3" },
  { value: "wav", label: "WAV" },
  { value: "aac", label: "AAC" },
  { value: "ogg", label: "OGG" },
  { value: "flac", label: "FLAC" },
  { value: "m4a", label: "M4A" },
  { value: "wma", label: "WMA" },
];

const documentConversionOptions = [
  { value: "pdf", label: "PDF" },
  { value: "docx", label: "DOCX" },
  { value: "txt", label: "TXT" },
  { value: "html", label: "HTML" },
  { value: "odt", label: "ODT" },
];

const Index = () => {
  const [imageFiles, setImageFiles] = useState<FileToConvert[]>([]);
  const [videoFiles, setVideoFiles] = useState<FileToConvert[]>([]);
  const [audioFiles, setAudioFiles] = useState<FileToConvert[]>([]);
  const [documentFiles, setDocumentFiles] = useState<FileToConvert[]>([]);

  const [selectedImageFormat, setSelectedImageFormat] = useState<string>("png");
  const [selectedVideoFormat, setSelectedVideoFormat] = useState<string>("mp4");
  const [selectedAudioFormat, setSelectedAudioFormat] = useState<string>("mp3");
  const [selectedDocumentFormat, setSelectedDocumentFormat] = useState<string>("pdf");
  const [destinationFolder, setDestinationFolder] = useState<string | null>(null);

  const handleSelectDestination = useCallback(async () => {
    if (window.electron && window.electron.selectDirectory) {
      const path = await window.electron.selectDirectory();
      if (path) {
        setDestinationFolder(path);
        toast.success(`Destination folder set to: ${path}`);
      }
    } else {
      toast.error("Directory selection is not supported in this environment.");
    }
  }, []);

  const handleFilesAdded = useCallback((newFiles: File[], mediaType: 'image' | 'video' | 'audio' | 'document') => {
    const filesToAdd: FileToConvert[] = newFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      type: file.type,
      size: file.size,
      progress: 0,
      status: 'pending',
      outputFormat:
        mediaType === 'image' ? selectedImageFormat :
          mediaType === 'video' ? selectedVideoFormat :
            mediaType === 'audio' ? selectedAudioFormat :
              selectedDocumentFormat,
      mediaType,
    }));

    if (mediaType === 'image') {
      setImageFiles((prevFiles) => [...prevFiles, ...filesToAdd]);
    } else if (mediaType === 'video') {
      setVideoFiles((prevFiles) => [...prevFiles, ...filesToAdd]);
    } else if (mediaType === 'audio') {
      setAudioFiles((prevFiles) => [...prevFiles, ...filesToAdd]);
    } else {
      setDocumentFiles((prevFiles) => [...prevFiles, ...filesToAdd]);
    }
    toast.success(`${newFiles.length} ${mediaType} file(s) added!`);
  }, [selectedImageFormat, selectedVideoFormat, selectedAudioFormat, selectedDocumentFormat]);

  const handleRemoveFile = useCallback((fileId: string, mediaType: 'image' | 'video' | 'audio' | 'document') => {
    if (mediaType === 'image') {
      setImageFiles((prevFiles) => prevFiles.filter((f) => f.id !== fileId));
    } else if (mediaType === 'video') {
      setVideoFiles((prevFiles) => prevFiles.filter((f) => f.id !== fileId));
    } else if (mediaType === 'audio') {
      setAudioFiles((prevFiles) => prevFiles.filter((f) => f.id !== fileId));
    } else {
      setDocumentFiles((prevFiles) => prevFiles.filter((f) => f.id !== fileId));
    }
    toast.info("File removed.");
  }, []);

  const handleFormatChange = useCallback((format: string, mediaType: 'image' | 'video' | 'audio' | 'document') => {
    if (mediaType === 'image') {
      setSelectedImageFormat(format);
      setImageFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.status === 'pending' ? { ...f, outputFormat: format } : f
        )
      );
    } else if (mediaType === 'video') {
      setSelectedVideoFormat(format);
      setVideoFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.status === 'pending' ? { ...f, outputFormat: format } : f
        )
      );
    } else if (mediaType === 'audio') {
      setSelectedAudioFormat(format);
      setAudioFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.status === 'pending' ? { ...f, outputFormat: format } : f
        )
      );
    } else {
      setSelectedDocumentFormat(format);
      setDocumentFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.status === 'pending' ? { ...f, outputFormat: format } : f
        )
      );
    }
  }, []);

  const convertFile = useCallback(async (fileToConvert: FileToConvert): Promise<FileToConvert> => {
    const updateFileState = (updater: React.SetStateAction<FileToConvert[]>) => {
      if (fileToConvert.mediaType === 'image') setImageFiles(updater);
      else if (fileToConvert.mediaType === 'video') setVideoFiles(updater);
      else if (fileToConvert.mediaType === 'audio') setAudioFiles(updater);
      else setDocumentFiles(updater);
    };

    try {

      updateFileState(prev => prev.map(f => f.id === fileToConvert.id ? { ...f, status: 'converting', progress: 10 } : f));


      if (!window.electron) {
        throw new Error("Electron API not available. Preload script failed to load.");
      }
      const filePath = window.electron.getFilePath(fileToConvert.file);
      if (!filePath) throw new Error("File path not found. Are you running in Electron?");

      const result = await window.electron.convertFile(filePath, fileToConvert.outputFormat, destinationFolder || undefined);

      if (!result.success) throw new Error(result.error || "Conversion failed");


      return { ...fileToConvert, status: 'completed', progress: 100, outputUrl: result.path };

    } catch (error: any) {
      console.error('Conversion failed:', error);
      toast.error(`Failed to convert ${fileToConvert.name}: ${error.message}`);
    }
  }, [destinationFolder]);

  const handleConvertAll = useCallback(async (mediaType: 'image' | 'video' | 'audio' | 'document') => {
    const toastId = toast.loading(`Starting ${mediaType} conversion...`);
    let filesToProcess: FileToConvert[] = [];
    let setFilesState: React.Dispatch<React.SetStateAction<FileToConvert[]>>;

    if (mediaType === 'image') {
      filesToProcess = imageFiles;
      setFilesState = setImageFiles;
    } else if (mediaType === 'video') {
      filesToProcess = videoFiles;
      setFilesState = setVideoFiles;
    } else if (mediaType === 'audio') {
      filesToProcess = audioFiles;
      setFilesState = setAudioFiles;
    } else {
      filesToProcess = documentFiles;
      setFilesState = setDocumentFiles;
    }

    const pendingFiles = filesToProcess.filter(f => f.status === 'pending' || f.status === 'failed');

    const conversionPromises = pendingFiles.map(file => convertFile(file));

    const results = await Promise.all(conversionPromises);

    setFilesState(prevFiles =>
      prevFiles.map(oldFile => {
        const newFile = results.find(res => res.id === oldFile.id);
        return newFile || oldFile;
      })
    );

    toast.dismiss(toastId);
    const failedCount = results.filter(r => r.status === 'failed').length;
    if (failedCount > 0) {
      toast.error(`${failedCount} ${mediaType} conversion(s) failed.`);
    } else {
      toast.success(`${mediaType} conversions finished!`);
    }
  }, [imageFiles, videoFiles, audioFiles, documentFiles, convertFile]);

  const handleShowInFolder = useCallback(async (fileId: string, mediaType: 'image' | 'video' | 'audio' | 'document') => {
    let filesArray: FileToConvert[] = [];
    if (mediaType === 'image') filesArray = imageFiles;
    else if (mediaType === 'video') filesArray = videoFiles;
    else if (mediaType === 'audio') filesArray = audioFiles;
    else filesArray = documentFiles;

    const file = filesArray.find(f => f.id === fileId);
    if (file && file.outputUrl) {
      await window.electron.showInFolder(file.outputUrl);
    } else {
      toast.error("Could not open folder. Path not found.");
    }
  }, [imageFiles, videoFiles, audioFiles, documentFiles]);

  const renderFileSection = (
    files: FileToConvert[],
    selectedFormat: string,
    onFormatChange: (format: string) => void,
    onFilesAdded: (newFiles: File[]) => void,
    onConvertAll: () => void,
    onRemoveFile: (fileId: string) => void,
    onShowInFolder: (fileId: string) => void,
    formatOptions: { value: string; label: string }[],
    dragDropLabel: string,
    outputFormatLabel: string,
    acceptedFileTypes: string,
    mediaType: 'image' | 'video' | 'audio' | 'document'
  ) => {
    const hasPendingFiles = files.some(f => f.status === 'pending' || f.status === 'failed');
    return (
      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="flex flex-col gap-4">
            <DragDropArea onFilesAdded={onFilesAdded} acceptedFileTypes={acceptedFileTypes} label={dragDropLabel} />
            <OutputFormatSelector
              onFormatChange={onFormatChange}
              selectedFormat={selectedFormat}
              label={outputFormatLabel}
              options={formatOptions}
            />
          </div>
          <div className="space-y-4">
            {files.length > 0 ? (
              files.map((file) => (
                <FileCard
                  key={file.id}
                  fileId={file.id}
                  fileName={file.name}
                  progress={file.progress}
                  status={file.status}
                  outputFormat={file.outputFormat}
                  outputUrl={file.outputUrl}
                  onRemove={() => onRemoveFile(file.id)}
                  onShowInFolder={() => onShowInFolder(file.id)}
                />
              ))
            ) : (
              <div className="flex items-center justify-center min-h-[200px] text-muted-foreground p-8 border-2 border-dashed border-border rounded-lg transition-all duration-300 hover:border-primary">
                Your {mediaType} files will appear here.
              </div>
            )}
          </div>
        </div>
        {files.length > 0 && (
          <ConvertAllButton onClick={onConvertAll} disabled={!hasPendingFiles} />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-4 sm:p-8 md:p-12 relative">
      <div className="absolute top-4 right-4 flex gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={handleSelectDestination}
                className="rounded-lg"
              >
                <FolderOpen className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Select Destination Folder</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{destinationFolder ? `Destination: ${destinationFolder}` : "Select Destination Folder"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <ModeToggle />
      </div>
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-8">
        <header className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-2">
            Universal Converter 🚀
          </h1>
          <p className="text-lg text-muted-foreground">
            Drag, drop, select format, and convert. It's that simple.
          </p>
        </header>

        <main className="flex flex-col gap-8">
          <Tabs defaultValue="image" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="image">Image</TabsTrigger>
              <TabsTrigger value="video">Video</TabsTrigger>
              <TabsTrigger value="audio">Audio</TabsTrigger>
              <TabsTrigger value="document">Document</TabsTrigger>
            </TabsList>
            <TabsContent value="image" className="mt-8">
              {renderFileSection(
                imageFiles,
                selectedImageFormat,
                (format) => handleFormatChange(format, 'image'),
                (newFiles) => handleFilesAdded(newFiles, 'image'),
                () => handleConvertAll('image'),
                (fileId) => handleRemoveFile(fileId, 'image'),
                (fileId) => handleShowInFolder(fileId, 'image'),
                imageConversionOptions,
                "Drag & Drop Images here",
                "Image Format",
                "image/*",
                'image'
              )}
            </TabsContent>
            <TabsContent value="video" className="mt-8">
              {renderFileSection(
                videoFiles,
                selectedVideoFormat,
                (format) => handleFormatChange(format, 'video'),
                (newFiles) => handleFilesAdded(newFiles, 'video'),
                () => handleConvertAll('video'),
                (fileId) => handleRemoveFile(fileId, 'video'),
                (fileId) => handleShowInFolder(fileId, 'video'),
                videoConversionOptions,
                "Drag & Drop Videos here",
                "Video Format",
                "video/*",
                'video'
              )}
            </TabsContent>
            <TabsContent value="audio" className="mt-8">
              {renderFileSection(
                audioFiles,
                selectedAudioFormat,
                (format) => handleFormatChange(format, 'audio'),
                (newFiles) => handleFilesAdded(newFiles, 'audio'),
                () => handleConvertAll('audio'),
                (fileId) => handleRemoveFile(fileId, 'audio'),
                (fileId) => handleShowInFolder(fileId, 'audio'),
                audioConversionOptions,
                "Drag & Drop Audios here",
                "Audio Format",
                "audio/*",
                'audio'
              )}
            </TabsContent>
            <TabsContent value="document" className="mt-8">
              {renderFileSection(
                documentFiles,
                selectedDocumentFormat,
                (format) => handleFormatChange(format, 'document'),
                (newFiles) => handleFilesAdded(newFiles, 'document'),
                () => handleConvertAll('document'),
                (fileId) => handleRemoveFile(fileId, 'document'),
                (fileId) => handleShowInFolder(fileId, 'document'),
                documentConversionOptions,
                "Drag & Drop Documents here",
                "Document Format",
                "application/pdf,text/plain,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                'document'
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>

    </div>
  );
};

export default Index;