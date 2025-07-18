import React, { useState, useRef, useCallback } from 'react';
import { 
  MAX_FILE_SIZE, 
  SUPPORTED_FILE_TYPES, 
  SUPPORTED_MIME_TYPES, 
  ERROR_TYPES 
} from '../utils/constants.js';
import { 
  handleFileUploadError, 
  getUserFriendlyError, 
  getRecoverySuggestions,
  clearErrors 
} from '../utils/error-handler.js';

/**
 * File Upload Component with drag-and-drop functionality
 * Validates file types and sizes, integrates with error handler
 */
const FileUpload = ({ 
  onFileSelect, 
  onError, 
  disabled = false, 
  accept = [SUPPORTED_FILE_TYPES.CSV, SUPPORTED_FILE_TYPES.EXCEL].join(','),
  maxSize = MAX_FILE_SIZE,
  className = ''
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [lastError, setLastError] = useState(null);
  const [lastSuccess, setLastSuccess] = useState(null);
  
  const inputRef = useRef(null);
  const dropRef = useRef(null);

  /**
   * Validate uploaded file
   * @param {File} file - File to validate
   * @returns {Object|null} Error object if validation fails, null if valid
   */
  const validateFile = useCallback((file) => {
    // Check file type
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    const isValidType = Object.values(SUPPORTED_FILE_TYPES).includes(fileExtension) ||
                       SUPPORTED_MIME_TYPES.includes(file.type);

    if (!isValidType) {
      return handleFileUploadError(file, {
        type: ERROR_TYPES.FILE_TYPE,
        message: `Unsupported file type: ${fileExtension}. Please use CSV or Excel files.`
      });
    }

    // Check file size
    if (file.size > maxSize) {
      return handleFileUploadError(file, {
        type: ERROR_TYPES.FILE_SIZE,
        message: `File size (${formatFileSize(file.size)}) exceeds limit of ${formatFileSize(maxSize)}.`
      });
    }

    // Check if file is empty
    if (file.size === 0) {
      return handleFileUploadError(file, {
        type: ERROR_TYPES.EMPTY_FILE,
        message: 'File is empty or corrupted.'
      });
    }

    return null; // File is valid
  }, [maxSize]);

  /**
   * Handle file processing
   * @param {File} file - File to process
   */
  const processFile = useCallback(async (file) => {
    try {
      setUploading(true);
      setUploadProgress(0);
      setLastError(null);
      setLastSuccess(null);
      
      // Clear any previous errors
      clearErrors();

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 20;
        });
      }, 100);

      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        clearInterval(progressInterval);
        setUploadProgress(0);
        setLastError(validationError);
        if (onError) {
          onError(validationError);
        }
        return;
      }

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Complete upload
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Success!
      setLastSuccess({
        filename: file.name,
        size: file.size,
        type: file.type
      });

      // Call success callback
      if (onFileSelect) {
        onFileSelect(file);
      }

      // Reset after showing success
      setTimeout(() => {
        setUploadProgress(0);
        setLastSuccess(null);
      }, 2000);

    } catch (error) {
      setUploadProgress(0);
      const uploadError = handleFileUploadError(file, {
        type: ERROR_TYPES.PARSE_ERROR,
        message: `Failed to process file: ${error.message}`
      });
      setLastError(uploadError);
      if (onError) {
        onError(uploadError);
      }
    } finally {
      setUploading(false);
    }
  }, [validateFile, onFileSelect, onError]);

  /**
   * Handle file selection from input or drag-drop
   * @param {FileList} files - Selected files
   */
  const handleFiles = useCallback((files) => {
    if (!files || files.length === 0) return;

    // Only process the first file for now
    const file = files[0];
    processFile(file);
  }, [processFile]);

  /**
   * Handle drag events
   */
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setDragActive(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only set dragActive to false if we're leaving the drop area
    if (!dropRef.current?.contains(e.relatedTarget)) {
      setDragActive(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (!disabled) {
      const files = e.dataTransfer.files;
      handleFiles(files);
    }
  }, [disabled, handleFiles]);

  /**
   * Handle click to open file dialog
   */
  const handleClick = useCallback(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  }, [disabled]);

  /**
   * Handle file input change
   */
  const handleInputChange = useCallback((e) => {
    handleFiles(e.target.files);
    // Reset input so same file can be selected again
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [handleFiles]);

  /**
   * Format file size for display
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size
   */
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * Get upload area styling based on state
   */
  const getUploadAreaClasses = () => {
    const baseClasses = `
      relative w-full min-h-40 sm:min-h-48 border-2 border-dashed rounded-lg 
      transition-all duration-200 ease-in-out cursor-pointer
      flex flex-col items-center justify-center p-4 sm:p-8 text-center touch-manipulation
    `;

    if (disabled) {
      return baseClasses + ` 
        border-gray-300 bg-gray-50 cursor-not-allowed opacity-50
      `;
    }

    if (lastError) {
      return baseClasses + ` 
        border-red-300 bg-red-50 hover:border-red-400 hover:bg-red-100
      `;
    }

    if (lastSuccess) {
      return baseClasses + ` 
        border-green-300 bg-green-50 hover:border-green-400 hover:bg-green-100
      `;
    }

    if (dragActive) {
      return baseClasses + ` 
        border-blue-400 bg-blue-50 scale-105 shadow-lg
      `;
    }

    if (uploading) {
      return baseClasses + ` 
        border-blue-300 bg-blue-50
      `;
    }

    return baseClasses + ` 
      border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100
      focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100
    `;
  };

  /**
   * Render upload content based on state
   */
  const renderUploadContent = () => {
    if (uploading) {
      return (
        <div className="w-full max-w-xs">
          <div className="flex items-center justify-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <p className="text-sm text-gray-600 mb-2">Uploading file...</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">{Math.round(uploadProgress)}%</p>
        </div>
      );
    }

    if (lastSuccess) {
      return (
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-green-900 mb-1">File uploaded successfully!</h3>
          <p className="text-xs text-green-700">{lastSuccess.filename}</p>
          <p className="text-xs text-green-600">{formatFileSize(lastSuccess.size)}</p>
        </div>
      );
    }

    if (lastError) {
      const friendlyError = getUserFriendlyError(lastError);
      const suggestions = getRecoverySuggestions(lastError);

      return (
        <div className="text-center max-w-md">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <span className="text-2xl">{friendlyError.icon}</span>
          </div>
          <h3 className="text-sm font-medium text-red-900 mb-1">{friendlyError.title}</h3>
          <p className="text-xs text-red-700 mb-3">{friendlyError.message}</p>
          
          {suggestions.length > 0 && (
            <div className="text-left">
              <p className="text-xs font-medium text-red-800 mb-2">How to fix:</p>
              <ul className="text-xs text-red-700 space-y-1">
                {suggestions.slice(0, 3).map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-red-400 mr-1">•</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLastError(null);
              clearErrors();
            }}
            className="mt-3 text-xs text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      );
    }

    // Default upload prompt
    return (
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
          <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm sm:text-base font-medium text-gray-900">
            {dragActive ? 'Drop your file here' : 'Upload your data file'}
          </p>
          <p className="text-xs sm:text-sm text-gray-600">
            <span className="hidden sm:inline">Drag and drop or </span>
            <span className="text-blue-600 underline">
              {window.innerWidth < 640 ? 'Tap to browse files' : 'click to browse'}
            </span>
          </p>
          <p className="text-xs text-gray-500">
            Supports CSV and Excel files up to {formatFileSize(maxSize)}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className={`file-upload-component ${className}`}>
      <div
        ref={dropRef}
        className={getUploadAreaClasses()}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label="File upload area"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleInputChange}
          disabled={disabled}
          aria-hidden="true"
        />

        {/* Upload content */}
        {renderUploadContent()}
      </div>

      {/* File format info */}
      <div className="mt-3 text-center">
        <p className="text-xs text-gray-500">
          Supported formats: <span className="font-medium">CSV (.csv)</span> and{' '}
          <span className="font-medium">Excel (.xlsx)</span>
        </p>
      </div>
    </div>
  );
};

export default FileUpload; 