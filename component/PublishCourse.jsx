import React, { useState } from 'react';

// Mock Storage Service
const mockStorageService = {
  uploadFile: async (file, courseId, fileName) => {
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate success
    return {
      success: true,
      url: `https://storage.example.com/${courseId}/${fileName}`,
      storagePath: `/courses/${courseId}/${fileName}`,
      size: file.size,
    };
  }
};

// Mock Course Controller
const mockCourseController = {
  addResource: async (courseId, resource) => {
    console.log('Adding resource to course:', courseId, resource);
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  }
};

const AjouterRessourceDialog = ({ courseId, onClose, onResourceAdded }) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [selectedResourceType, setSelectedResourceType] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop().toLowerCase();
    const allowedExtensions = ['pdf', 'mp4', 'mov', 'avi'];

    if (!allowedExtensions.includes(extension)) {
      alert('Type de fichier non autorisé. Utilisez: PDF, MP4, MOV, AVI');
      return;
    }

    // Check file size (2MB max)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      alert('Le fichier est trop volumineux. Taille maximale: 2MB');
      return;
    }

    setSelectedFile(file);
    setFileName(file.name);

    // Auto-detect type
    if (extension === 'pdf') {
      setSelectedResourceType('pdf');
    } else {
      setSelectedResourceType('video');
    }

    // Clear URL if file is selected
    setUrl('');
  };

  // Handle adding resource
  const handleAddResource = async () => {
    if (!selectedResourceType || !title.trim()) {
      alert('Type et titre sont requis');
      return;
    }

    if (!selectedFile && !url.trim()) {
      alert('Sélectionnez un fichier ou entrez une URL');
      return;
    }

    setIsUploading(true);

    try {
      let finalUrl = '';
      let storagePath = null;
      let fileSize = null;

      // Handle file upload vs URL
      if (selectedFile) {
        // Upload to storage
        const uploadResult = await mockStorageService.uploadFile(
          selectedFile,
          courseId,
          fileName
        );

        if (!uploadResult.success) {
          alert(`Erreur upload: ${uploadResult.error}`);
          setIsUploading(false);
          return;
        }

        finalUrl = uploadResult.url;
        storagePath = uploadResult.storagePath;
        fileSize = uploadResult.size;

      } else if (url.trim()) {
        // Use external URL
        finalUrl = url.trim();

        // Validate URL
        if (!finalUrl.startsWith('http')) {
          alert('Veuillez entrer une URL valide (https://...)');
          setIsUploading(false);
          return;
        }
      }

      // Create resource object
      const newResource = {
        id: Date.now().toString(),
        type: selectedResourceType,
        title: title.trim(),
        url: finalUrl,
        storagePath: storagePath,
        size: fileSize,
        mime: getMimeType(selectedResourceType),
        uploadedBy: 'admin_id',
        createdAt: new Date(),
      };

      // Add to course
      await mockCourseController.addResource(courseId, newResource);
      
      // Call success callback
      onResourceAdded(newResource);
      
      // Show success message
      alert('Ressource ajoutée avec succès!');
      
      // Close dialog
      onClose();

    } catch (error) {
      alert(`Erreur: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const getMimeType = (type) => {
    switch (type) {
      case 'pdf': return 'application/pdf';
      case 'video': return 'video/mp4';
      default: return 'application/octet-stream';
    }
  };

  const getInstructions = () => {
    switch (selectedResourceType) {
      case 'pdf':
        return 'Pour les PDFs: Utilisez Google Drive (partage public) ou upload direct (<2MB)';
      case 'video':
        return 'Pour les vidéos: Utilisez YouTube/Vimeo (lien public) ou upload direct (<2MB)';
      default:
        return 'Sélectionnez un type de ressource';
    }
  };

  const handleTypeChange = (newType) => {
    setSelectedResourceType(newType);
    if (newType) {
      setSelectedFile(null);
      setFileName(null);
      setUrl('');
    }
  };

  const handleUrlChange = (value) => {
    setUrl(value);
    if (value) {
      setSelectedFile(null);
      setFileName(null);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFileName(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold">Ajouter une ressource</h2>
          <button 
            onClick={onClose} 
            disabled={isUploading}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Resource Type Dropdown */}
        <div className="mb-4">
          <select
            value={selectedResourceType || ''}
            onChange={(e) => handleTypeChange(e.target.value || null)}
            disabled={isUploading}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">Type de ressource*</option>
            <option value="pdf">📄 PDF Document</option>
            <option value="video">🎥 Vidéo</option>
          </select>
        </div>

        {/* Title Input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Titre de la ressource*"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isUploading}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>

        {/* File Upload Section */}
        {selectedResourceType && (
          <>
            <div className="mb-2">
              <p className="font-bold text-gray-700 text-sm">Option 1: Importer un fichier</p>
            </div>

            {fileName ? (
              <div className="mb-4 p-3 bg-green-50 border border-green-500 rounded-lg flex items-center gap-3">
                <div className="text-green-600 text-2xl">
                  {selectedResourceType === 'pdf' ? '📄' : '🎥'}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">{fileName}</p>
                  <p className="text-xs text-gray-600">Prêt à être uploadé</p>
                </div>
                <button
                  onClick={clearFile}
                  disabled={isUploading}
                  className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="mb-4">
                <label className="block">
                  <input
                    type="file"
                    accept={selectedResourceType === 'pdf' ? '.pdf' : '.mp4,.mov,.avi'}
                    onChange={handleFileSelect}
                    disabled={isUploading}
                    className="hidden"
                  />
                  <div className="w-full p-4 bg-blue-50 text-blue-600 border border-blue-200 rounded cursor-pointer hover:bg-blue-100 transition flex items-center justify-center gap-2 disabled:opacity-50">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="font-medium">Choisir un fichier</span>
                  </div>
                </label>
              </div>
            )}

            <p className="text-xs text-gray-600 mb-4">Taille maximale: 2MB (PDF ou Vidéo)</p>

            {/* OR Separator */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="text-gray-500 text-sm">OU</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* External URL Section */}
            <div className="mb-2">
              <p className="font-bold text-gray-700 text-sm">Option 2: Lien externe</p>
            </div>

            <div className="mb-2">
              <input
                type="url"
                placeholder="https://drive.google.com/... ou https://youtube.com/..."
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                disabled={isUploading}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <p className="text-xs text-gray-600 mb-4">
              Pour les fichiers &gt;2MB, utilisez Google Drive, YouTube, Vimeo, etc.
            </p>

            {/* Instructions Box */}
            <div className="p-3 bg-blue-50 rounded mb-5">
              <p className="text-xs text-blue-900">{getInstructions()}</p>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Annuler
          </button>
          <button
            onClick={handleAddResource}
            disabled={isUploading}
            className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Upload...</span>
              </>
            ) : (
              'Ajouter la ressource'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Demo Component
const Demo = () => {
  const [showDialog, setShowDialog] = useState(true);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Dialog Demo</h1>
        <button
          onClick={() => setShowDialog(true)}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
        >
          Ouvrir le Dialog
        </button>

        {showDialog && (
          <AjouterRessourceDialog
            courseId="course_123"
            onClose={() => setShowDialog(false)}
            onResourceAdded={(resource) => {
              console.log('Resource added:', resource);
              setShowDialog(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Demo;