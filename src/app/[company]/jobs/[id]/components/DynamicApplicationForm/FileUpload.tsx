"use client";

import { useState, useRef } from "react";
import { Upload, X, FileText, CheckCircle2 } from "lucide-react";
import { cn } from "~/lib/utils";

interface FileUploadProps {
  id: string;
  onChange: (file: File | null) => void;
  accept?: string;
  required?: boolean;
  value?: { filename: string };
}

export function FileUpload({ id, onChange, accept, required, value }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isValidFileType = (file: File): boolean => {
    if (!accept) return true;
    
    const acceptedTypes = accept.split(',').map(type => type.trim());
    
    // Check file extension
    const fileName = file.name.toLowerCase();
    const fileExtension = '.' + fileName.split('.').pop();
    
    for (const acceptedType of acceptedTypes) {
      // Handle MIME types
      if (acceptedType.includes('/')) {
        if (file.type === acceptedType) return true;
        // Handle wildcard MIME types like image/*
        if (acceptedType.endsWith('/*')) {
          const category = acceptedType.split('/')[0];
          if (file.type.startsWith(category + '/')) return true;
        }
      }
      // Handle file extensions
      else if (acceptedType.startsWith('.')) {
        if (fileExtension === acceptedType.toLowerCase()) return true;
      }
    }
    
    return false;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files?.[0]) {
      const file = e.dataTransfer.files[0];
      if (isValidFileType(file)) {
        setSelectedFile(file);
        onChange(file);
      } else {
        alert(`Please upload a valid file type: ${accept ?? 'any file'}`);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      onChange(file);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = () => {
    if (!selectedFile) return <Upload className="h-8 w-8 text-muted-foreground" />;
    if (selectedFile.type.includes('pdf')) return <FileText className="h-8 w-8 text-blue-500" />;
    return <FileText className="h-8 w-8 text-gray-500" />;
  };

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        id={id}
        onChange={handleFileChange}
        accept={accept}
        required={required}
        className="sr-only"
      />
      
      {!selectedFile && !value ? (
        <label
          htmlFor={id}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            "relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
            dragActive 
              ? "border-primary bg-primary/5" 
              : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50"
          )}
        >
          <div className="flex flex-col items-center justify-center text-center">
            <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="mb-1 text-sm font-medium">
              <span className="text-primary">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">
              {accept === '.pdf,.doc,.docx' ? 'PDF, DOC, DOCX' : 'Any file type'}
            </p>
          </div>
        </label>
      ) : (
        <div className="relative flex items-center justify-between rounded-lg border bg-muted/30 p-4">
          <div className="flex items-center space-x-3">
            {getFileIcon()}
            <div className="flex flex-col">
              <p className="text-sm font-medium">
                {selectedFile?.name ?? value?.filename}
              </p>
              {selectedFile && (
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <button
              type="button"
              onClick={handleRemove}
              className="rounded-full p-1 hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}