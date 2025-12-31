'use client';

import { useState } from 'react';

interface FileUploadProps {
    onUpload: (urls: string[]) => void;
    multiple?: boolean;
    accept?: string;
    label?: string;
}

export default function FileUpload({ onUpload, multiple = false, accept = "image/*", label = "Subir archivo" }: FileUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const uploadFile = async (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/api/upload'); // Use API route

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100;
                    setProgress(Math.round(percentComplete)); // Global progress might be tricky with multiple files, just showing last active or average?
                }
            };

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    const response = JSON.parse(xhr.responseText);
                    if (response.success && response.url) {
                        resolve(response.url);
                    } else {
                        reject(new Error(response.error || 'Upload failed'));
                    }
                } else {
                    reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText.substring(0, 50)}`));
                }
            };

            xhr.onerror = () => reject(new Error('Network error'));

            const formData = new FormData();
            formData.append('file', file);
            xhr.send(formData);
        });
    };

    async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        setProgress(0);

        try {
            // Sequential upload to track progress properly per file or maybe all at once?
            // For simplicity with the progress bar, let's do one by one or Promise.all.
            // With Promise.all, onprogress will fire for all. XHR doesn't support aggregate progress natively.
            // Let's settle for "Processing..." if multiple, or just average.
            // Actually, let's just do sequential to be safe and accurate with the bar.

            const urls: string[] = [];
            const totalFiles = files.length;

            for (let i = 0; i < totalFiles; i++) {
                // Reset progress for each file visually? or Accumulate? 
                // Let's just output 0-100 for the current file.
                setProgress(0);
                const url = await uploadFile(files[i]);
                urls.push(url);
            }

            onUpload(urls);
        } catch (error: any) {
            alert('Error subiendo archivos: ' + error.message);
        } finally {
            setUploading(false);
            setProgress(0);
            e.target.value = '';
        }
    }

    return (
        <div className="inline-flex flex-col items-start gap-2">
            <label className="cursor-pointer inline-block">
                <span className={`inline-flex items-center px-4 py-2 rounded text-sm font-medium transition ${uploading
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}>
                    {uploading && (
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    )}
                    {uploading ? (progress === 100 ? 'Procesando en servidor...' : `Subiendo... ${progress}%`) : label}
                </span>
                <input
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleChange}
                    disabled={uploading}
                    className="hidden"
                />
            </label>
            {uploading && (
                <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                    <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
            )}
        </div>
    );
}
