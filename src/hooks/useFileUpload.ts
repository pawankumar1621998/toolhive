"use client";

import { useCallback, useRef } from "react";
import { useToolStore } from "@/lib/store/toolStore";

interface UseFileUploadOptions {
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  onError?: (message: string) => void;
}

interface UseFileUploadReturn {
  handleFiles: (files: FileList | File[]) => void;
  handleDrop: (e: React.DragEvent<HTMLElement>) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  openFilePicker: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  isDragActive: boolean;
  setIsDragActive: (active: boolean) => void;
}

/**
 * Encapsulates file validation + drag-and-drop event handling.
 * Validated files are handed off to Zustand's addFiles action.
 */
export function useFileUpload({
  maxFiles = 10,
  maxSizeMB = 50,
  acceptedTypes = [],
  onError,
}: UseFileUploadOptions = {}): UseFileUploadReturn {
  const addFiles = useToolStore((s) => s.addFiles);
  const files = useToolStore((s) => s.files);
  const inputRef = useRef<HTMLInputElement>(null);
  const isDragActiveRef = useRef(false);

  const validate = useCallback(
    (fileList: File[]): File[] => {
      const remaining = maxFiles - files.length;
      if (remaining <= 0) {
        onError?.(`Maximum ${maxFiles} files allowed.`);
        return [];
      }
      const sliced = fileList.slice(0, remaining);
      return sliced.filter((file) => {
        if (file.size > maxSizeMB * 1024 * 1024) {
          onError?.(`${file.name} exceeds ${maxSizeMB}MB limit.`);
          return false;
        }
        if (acceptedTypes.length > 0) {
          const ext = "." + file.name.split(".").pop()?.toLowerCase();
          const mimeMatch = acceptedTypes.some((t) =>
            t.startsWith(".") ? t === ext : file.type.startsWith(t)
          );
          if (!mimeMatch) {
            onError?.(`${file.name} is not a supported file type.`);
            return false;
          }
        }
        return true;
      });
    },
    [files.length, maxFiles, maxSizeMB, acceptedTypes, onError]
  );

  const handleFiles = useCallback(
    (fileList: FileList | File[]) => {
      const arr = Array.from(fileList);
      const valid = validate(arr);
      if (valid.length > 0) addFiles(valid);
    },
    [validate, addFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      isDragActiveRef.current = false;
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) handleFiles(e.target.files);
      // Reset input so same file can be re-uploaded
      e.target.value = "";
    },
    [handleFiles]
  );

  const openFilePicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return {
    handleFiles,
    handleDrop,
    handleInputChange,
    openFilePicker,
    inputRef,
    isDragActive: isDragActiveRef.current,
    setIsDragActive: (v) => { isDragActiveRef.current = v; },
  };
}
