'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { photoUploadService } from '@/lib/services/photoUploadService';

interface PhotoUploadProps {
    currentPhotoUrl?: string;
    onPhotoUploaded: (url: string) => void;
    onPhotoRemoved?: () => void;
}

export function PhotoUpload({ currentPhotoUrl, onPhotoUploaded, onPhotoRemoved }: PhotoUploadProps) {
    const { user } = useAuth();
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(currentPhotoUrl || null);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (!user) return;

        const file = acceptedFiles[0];
        if (!file) return;

        try {
            setIsUploading(true);
            setError(null);

            // Create a preview
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);

            // Upload the file
            const downloadUrl = await photoUploadService.uploadPhoto(user.uid, file);
            onPhotoUploaded(downloadUrl);

            // Clean up the preview URL
            URL.revokeObjectURL(objectUrl);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to upload photo');
            setPreview(currentPhotoUrl || null);
        } finally {
            setIsUploading(false);
        }
    }, [user, currentPhotoUrl, onPhotoUploaded]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif']
        },
        maxFiles: 1,
        multiple: false
    });

    const handleRemove = async () => {
        if (!currentPhotoUrl || !onPhotoRemoved) return;

        try {
            setError(null);
            await photoUploadService.deletePhoto(currentPhotoUrl);
            setPreview(null);
            onPhotoRemoved();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to remove photo');
        }
    };

    return (
        <div className="space-y-4">
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
                    ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                    ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <input {...getInputProps()} />

                {preview ? (
                    <div className="relative w-32 h-32 mx-auto">
                        <Image
                            src={preview}
                            alt="Preview"
                            fill
                            className="object-cover rounded-lg"
                        />
                    </div>
                ) : (
                    <div className="space-y-2 py-4">
                        <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                            aria-hidden="true"
                        >
                            <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        <div className="text-sm text-gray-600">
                            {isDragActive ? (
                                <p>Drop the file here</p>
                            ) : (
                                <p>Drag and drop a photo, or click to select</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {preview && onPhotoRemoved && (
                <button
                    type="button"
                    onClick={handleRemove}
                    className="text-sm text-red-600 hover:text-red-800"
                >
                    Remove photo
                </button>
            )}

            {isUploading && (
                <div className="text-sm text-gray-500">
                    Uploading...
                </div>
            )}

            {error && (
                <div className="text-sm text-red-600">
                    {error}
                </div>
            )}
        </div>
    );
} 