import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAdminCourses } from '../hooks/UserCourses';
import courseService from '../services/courseServices';
import AjouterRessourceDialog from './PublishCourse';

const CreateCourse = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { courses, loading } = useAdminCourses();
  
  const [filterTD, setFilterTD] = useState(false);
  const [filterTP, setFilterTP] = useState(false);
  const [filterCOUR, setFilterCOUR] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAddResourceDialog, setShowAddResourceDialog] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter courses based on checkboxes
  const filteredCourses = courses.filter(course => {
    // Filtre par type
    let matchesType = true;
    if (filterTD || filterTP || filterCOUR) {
      matchesType = false;
      if (filterTD && course.type === 'TD') matchesType = true;
      if (filterTP && course.type === 'TP') matchesType = true;
      if (filterCOUR && course.type === 'COUR') matchesType = true;
    }

    // Filtre par recherche
    let matchesSearch = true;
    if (searchQuery.trim()) {
      matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    }

    return matchesType && matchesSearch;
  });

  const handleSignOut = async () => {
    try {
      await currentUser?.auth?.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce cours et toutes ses ressources ?')) {
      const result = await courseService.deleteCourse(courseId);
      if (result.success) {
        alert(result.message || 'Cours supprimé avec succès');
      } else {
        alert(result.message || 'Erreur lors de la suppression');
      }
    }
  };

  const handlePublishCourse = async (courseId) => {
    const result = await courseService.updateStatus(courseId, 'published');
    if (result.success) {
      alert(result.message || 'Cours publié avec succès! Il est maintenant visible par les étudiants.');
    } else {
      alert(result.message || 'Erreur lors de la publication');
    }
  };

  const handleAddResource = async (courseId, resource) => {
    const result = await courseService.addResource(courseId, resource);
    if (result.success) {
      alert(result.message || 'Ressource ajoutée avec succès!');
      setShowAddResourceDialog(null);
    } else {
      alert(result.message || 'Erreur lors de l\'ajout de la ressource');
    }
  };

  const handleCreateCourse = async (newCourseData) => {
    // Générer un ID unique pour le cours
    const courseId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const courseData = {
      ...newCourseData,
      id: courseId
    };

    const result = await courseService.createCourse(courseData);
    if (result.success) {
      setShowCreateDialog(false);
      alert(result.message || 'Cours créé avec succès!');
    } else {
      alert(result.message || 'Erreur lors de la création du cours');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-200">
      {/* SIDEBAR */}
      <div className="w-44 bg-white flex flex-col">
        {/* Header */}
        <div className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center">
              <span className="font-bold">SH</span>
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm">Admin</div>
              <button 
                onClick={handleSignOut}
                className="text-xs text-red-500 underline hover:text-red-700"
              >
                déconnexion
              </button>
            </div>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Filters */}
        <div className="px-4 py-2">
          <div className="font-bold text-sm mb-2">filtres</div>
          <label className="flex items-center gap-2 mb-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={filterTD}
              onChange={(e) => setFilterTD(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-xs">TD</span>
          </label>
          <label className="flex items-center gap-2 mb-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={filterTP}
              onChange={(e) => setFilterTP(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-xs">TP</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={filterCOUR}
              onChange={(e) => setFilterCOUR(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-xs">COUR</span>
          </label>
        </div>

        <hr className="border-gray-200" />

        {/* Navigation */}
        <div className="mt-auto">
          <button 
            onClick={() => navigate('/admin/dashboard')}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm bg-red-50 hover:bg-red-100"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Accueil</span>
          </button>
          <button 
            onClick={() => navigate(-1)}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-gray-100"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Retour</span>
          </button>
          <div className="h-5" />
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">
        {/* Search Bar */}
        <div className="bg-white p-4">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Course Grid */}
        <div className="flex-1 overflow-auto p-4">
          {filteredCourses.length === 0 && !loading ? (
            <div className="h-full flex flex-col items-center justify-center">
              <svg className="w-20 h-20 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
              </svg>
              <h3 className="text-lg font-medium text-gray-600 mb-2">Aucun cours créé</h3>
              <p className="text-sm text-gray-500">Cliquez sur + pour créer votre premier cours</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCourses.map(course => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onDelete={() => handleDeleteCourse(course.id)}
                  onAddResource={() => setShowAddResourceDialog(course.id)}
                  onPublish={() => handlePublishCourse(course.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowCreateDialog(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Create Course Dialog */}
      {showCreateDialog && (
        <CreateCourseDialog
          onClose={() => setShowCreateDialog(false)}
          onCourseCreated={handleCreateCourse}
          currentUser={currentUser}
        />
      )}

      {/* Add Resource Dialog */}
      {showAddResourceDialog && (
        <AjouterRessourceDialog
          courseId={showAddResourceDialog}
          onClose={() => setShowAddResourceDialog(null)}
          onResourceAdded={(resource) => handleAddResource(showAddResourceDialog, resource)}
        />
      )}
    </div>
  );
};

// Course Card Component
const CourseCard = ({ course, onDelete, onAddResource, onPublish }) => {
  const getTypeColor = (type) => {
    switch (type) {
      case 'TD': return 'bg-purple-500';
      case 'TP': return 'bg-orange-500';
      case 'COUR': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status) => {
    return status === 'published' ? 'bg-green-500' : 'bg-orange-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-md relative">
      {/* Action Buttons */}
      <div className="absolute top-2 right-2 flex gap-1 z-10">
        <button
          onClick={onAddResource}
          className="p-1 text-blue-500 hover:bg-blue-50 rounded"
          title="Ajouter ressource"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" strokeWidth={2} />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m-4-4h8" />
          </svg>
        </button>
        <button
          onClick={onDelete}
          className="p-1 text-red-500 hover:bg-red-50 rounded"
          title="Supprimer cours"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Type and Status Badges */}
      <div className="p-2 flex justify-between items-start">
        <span className={`${getTypeColor(course.type)} text-white text-xs font-bold px-2 py-1 rounded`}>
          {course.type}
        </span>
        <span className={`${getStatusColor(course.status)} text-white text-xs font-bold px-2 py-0.5 rounded`}>
          {course.status === 'published' ? 'PUBLIÉ' : 'BROUILLON'}
        </span>
      </div>

      {/* Thumbnail */}
      <div className="mx-4 h-32 bg-gray-300 border border-gray-400 flex items-center justify-center">
        {course.thumbnailUrl ? (
          <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M12 14l9-5-9-5-9 5 9 5z" />
            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
          </svg>
        )}
      </div>

      {/* Title */}
      <div className="m-2 p-1 border border-gray-400 h-12 flex items-center">
        <p className="text-xs line-clamp-2">{course.title}</p>
      </div>

      {/* Info */}
      <div className="px-2 text-xs text-gray-600 mb-1">
        {course.resources?.length || 0} ressource(s) • {course.price || 0} DT
      </div>

      {/* Action Button */}
      <div className="px-2 pb-2">
        {course.status === 'draft' ? (
          <button
            onClick={onPublish}
            className="w-full bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-2 rounded"
          >
            PUBLIER
          </button>
        ) : (
          <div className="w-full bg-green-50 text-green-800 text-xs font-bold py-2 rounded text-center">
            EN LIGNE ✓
          </div>
        )}
      </div>
    </div>
  );
};

// Create Course Dialog
const CreateCourseDialog = ({ onClose, onCourseCreated, currentUser }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0.0');
  const [type, setType] = useState('COUR');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      alert('Le titre est requis');
      return;
    }

    setIsCreating(true);

    const newCourse = {
      title: title.trim(),
      description: description.trim(),
      type,
      createdBy: currentUser?.uid || 'admin',
      status: 'draft',
      price: parseFloat(price) || 0.0,
      category: 'general',
      thumbnailUrl: null,
      resources: []
    };

    await onCourseCreated(newCourse);
    setIsCreating(false);
    
    // Réinitialiser les champs
    setTitle('');
    setDescription('');
    setPrice('0.0');
    setType('COUR');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold">Créer un nouveau cours</h2>
          <button onClick={onClose} disabled={isCreating} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Type Dropdown */}
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          disabled={isCreating}
          className="w-full p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="TD">TD</option>
          <option value="TP">TP</option>
          <option value="COUR">COUR</option>
        </select>

        {/* Title */}
        <input
          type="text"
          placeholder="Titre du cours*"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isCreating}
          className="w-full p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Description */}
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isCreating}
          rows={3}
          className="w-full p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Price */}
        <input
          type="number"
          placeholder="Prix (DT)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          disabled={isCreating}
          min="0"
          step="0.01"
          className="w-full p-3 border border-gray-300 rounded mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isCreating}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded disabled:bg-gray-400"
          >
            Annuler
          </button>
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded disabled:bg-gray-400 flex items-center gap-2"
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Création...</span>
              </>
            ) : (
              'Créer le cours'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCourse;