import React, { useState, useRef } from 'react';
import { parseCSV } from '../utils/parsers/csv-parser';
import { parseExcel } from '../utils/parsers/excel-parser';
import { validateDataForCharting } from '../utils/validators/data-validator';
import { handleError } from '../utils/error-handler';

const FileUpload = ({ onFileUpload, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = async (e) => {
    setIsFileDialogOpen(false);
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
    // Clear the input value to allow selecting the same file again
    e.target.value = '';
  };

  const processFile = async (file) => {
    try {
      // Validate file type
      const fileName = file.name.toLowerCase();
      if (!fileName.endsWith('.csv') && !fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
        throw new Error('Please upload a CSV or Excel file (.csv, .xlsx, .xls)');
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      setUploadProgress(10);

      // Parse file based on type
      let parsedData;
      if (fileName.endsWith('.csv')) {
        parsedData = await parseCSV(file);
      } else {
        parsedData = await parseExcel(file);
      }

      setUploadProgress(50);

      if (!parsedData.success) {
        throw new Error(parsedData.errors?.[0]?.message || 'Failed to parse file');
      }

      // Validate data for charting
      const validation = validateDataForCharting(parsedData.data, parsedData.meta);
      setUploadProgress(80);

      if (!validation.isValid) {
        throw new Error(validation.errors?.[0]?.message || 'Data is not suitable for charting');
      }

      setUploadProgress(100);

      // Success - pass data to parent
      onFileUpload(parsedData.data);

    } catch (error) {
      const userFriendlyError = handleError(error);
      console.error('File processing error:', userFriendlyError);
      throw userFriendlyError;
    } finally {
      setUploadProgress(0);
    }
  };

  const openFileDialog = () => {
    // Prevent opening if already loading, processing, or if dialog is already open
    if (isLoading || uploadProgress > 0 || isFileDialogOpen) {
      return;
    }
    setIsFileDialogOpen(true);
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileSelect}
        onBlur={() => setIsFileDialogOpen(false)}
        className="hidden"
        disabled={isLoading}
      />

      {/* Upload area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          dragActive
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-muted/50'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!isLoading ? openFileDialog : undefined}
      >
        {/* Upload progress overlay */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="absolute inset-0 bg-background/80 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Processing file... {uploadProgress}%</p>
            </div>
          </div>
        )}

        {/* Upload icon */}
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>

        {/* Upload text */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-foreground">
            {isLoading ? 'Processing...' : 'Upload your data file'}
          </h3>
          <p className="text-muted-foreground">
            {isLoading 
              ? 'Please wait while we process your file'
              : 'Drag and drop your CSV or Excel file here, or click to browse'
            }
          </p>
        </div>

        {/* File type info */}
        {!isLoading && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md border border-border">
              CSV files
            </span>
            <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md border border-border">
              Excel files
            </span>
            <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md border border-border">
              Max 5MB
            </span>
          </div>
        )}

        {/* Upload button */}
        {!isLoading && (
          <button
            type="button"
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
            onClick={(e) => {
              e.stopPropagation();
              openFileDialog();
            }}
          >
            Choose File
          </button>
        )}
      </div>

      {/* Help text */}
      <div className="mt-4 text-center">
        <p className="text-xs text-muted-foreground">
          Supported formats: CSV (.csv), Excel (.xlsx, .xls) • Maximum file size: 5MB
        </p>
      </div>
    </div>
  );
};

export default FileUpload; 