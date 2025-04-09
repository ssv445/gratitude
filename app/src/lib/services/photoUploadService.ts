import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,
} from 'firebase/storage';
import { storage } from '../firebase';

export const photoUploadService = {
    async uploadPhoto(userId: string, file: File): Promise<string> {
        // Create a unique file name using timestamp and original name
        const timestamp = Date.now();
        const fileName = `${timestamp}-${file.name}`;
        const filePath = `users/${userId}/photos/${fileName}`;

        try {
            // Create a reference to the file location
            const storageRef = ref(storage, filePath);

            // Upload the file
            await uploadBytes(storageRef, file);

            // Get the download URL
            const downloadURL = await getDownloadURL(storageRef);
            return downloadURL;
        } catch (error) {
            console.error('Error uploading photo:', error);
            throw new Error('Failed to upload photo');
        }
    },

    async deletePhoto(photoUrl: string): Promise<void> {
        try {
            // Get the storage reference from the URL
            const photoRef = ref(storage, photoUrl);

            // Delete the file
            await deleteObject(photoRef);
        } catch (error) {
            console.error('Error deleting photo:', error);
            throw new Error('Failed to delete photo');
        }
    },

    getPhotoPath(url: string): string {
        try {
            // Extract the path from the Firebase Storage URL
            const decodedUrl = decodeURIComponent(url);
            const pathMatch = decodedUrl.match(/o\/(.+?)\?/);
            return pathMatch ? pathMatch[1] : url;
        } catch {
            return url;
        }
    },
}; 