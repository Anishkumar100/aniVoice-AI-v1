import multer from 'multer';

const storage = multer.memoryStorage();

const upload = multer({ 
    storage: storage, // Holds file in RAM
    limits: { fileSize: 5 * 1024 * 1024 } // Optional: Keep 5MB limit just to be safe
});

export default upload;