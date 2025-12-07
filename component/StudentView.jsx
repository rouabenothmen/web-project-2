import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import { usePublishedCourses } from '../hooks/UserCourses';

const StudentView = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { courses, loading } = usePublishedCourses();
  
  const [filterTD, setFilterTD] = useState(false);
  const [filterTP, setFilterTP] = useState(false);
  const [filterCOUR, setFilterCOUR] = useState(true);
  const [currentPage, setCurrentPage] = useState('Accueil');
  const [searchQuery, setSearchQuery] = useState('');
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [loadingPurchases, setLoadingPurchases] = useState(true);

  // Récupérer les cours achetés depuis Firestore
  useEffect(() => {
    const fetchPurchases = async () => {
      if (!currentUser) {
        setLoadingPurchases(false);
        return;
      }

      try {
        const purchasesRef = collection(db, 'purchases');
        const q = query(purchasesRef, where('userId', '==', currentUser.uid));
        const snapshot = await getDocs(q);
        const purchased = snapshot.docs.map(doc => doc.data().courseId);
        setPurchasedCourses(purchased);
      } catch (error) {
        console.error('Erreur récupération achats:', error);
      } finally {
        setLoadingPurchases(false);
      }
    };

    fetchPurchases();
  }, [currentUser]);

  // Get user info
  const getUserName = () => {
    if (!currentUser) return 'Étudiant';
    if (currentUser.displayName) return currentUser.displayName;
    if (currentUser.email) return currentUser.email.split('@')[0];
    return 'Étudiant';
  };

  const getUserInitials = () => {
    const name = getUserName();
    if (name === 'Étudiant') return 'SH';

    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    } else if (name.length >= 2) {
      return name.substring(0, 2).toUpperCase();
    }
    return 'SH';
  };

  const handleLogout = async () => {
    try {
      await currentUser?.auth?.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  // Filter courses
  const getFilteredCourses = () => {
    let filtered = courses;

    // Apply type filters
    if (filterTD || filterTP || filterCOUR) {
      filtered = filtered.filter(course => {
        if (filterTD && course.type === 'TD') return true;
        if (filterTP && course.type === 'TP') return true;
        if (filterCOUR && course.type === 'COUR') return true;
        return false;
      });
    }

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const userOwnsCourse = (courseId) => {
    return purchasedCourses.includes(courseId);
  };

  const handleCourseClick = async (course) => {
    const hasPurchased = userOwnsCourse(course.id);
    
    if (hasPurchased) {
      // Rediriger vers la page du cours
      navigate(`/course/${course.id}`);
    } else {
      // Vérifier si le cours est gratuit
      if (course.price === 0) {
        // Cours gratuit - accès direct
        navigate(`/course/${course.id}`);
      } else {
        // Afficher un message pour les cours payants
        const confirmPurchase = window.confirm(
          `Acheter le cours "${course.title}" pour ${course.price} DT ?`
        );
        
        if (confirmPurchase) {
          alert('Fonctionnalité de paiement à implémenter');
          // Ici vous pouvez ajouter votre logique de paiement
        }
      }
    }
  };

  if (loading || loadingPurchases) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-200">
      {/* SIDEBAR LEFT */}
      <div className="w-44 bg-white flex flex-col">
        {/* User Info */}
        <div className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center">
              <span className="font-bold">{getUserInitials()}</span>
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm">{getUserName()}</div>
              <button
                onClick={handleLogout}
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
            onClick={() => setCurrentPage('Accueil')}
            className={`w-full flex items-center gap-2 px-4 py-3 text-sm ${
              currentPage === 'Accueil' ? 'bg-red-50' : 'hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Accueil</span>
          </button>
          <button
            onClick={() => setCurrentPage('Statistiques')}
            className={`w-full flex items-center gap-2 px-4 py-3 text-sm ${
              currentPage === 'Statistiques' ? 'bg-red-50' : 'hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Statistiques</span>
          </button>
          <div className="h-5" />
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">
        {currentPage === 'Accueil' ? (
          <AccueilPage
            courses={getFilteredCourses()}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            userOwnsCourse={userOwnsCourse}
            onCourseClick={handleCourseClick}
          />
        ) : (
          <StatistiquesPage 
            courses={courses} 
            purchasedCourses={purchasedCourses}
            userName={getUserName()} 
          />
        )}
      </div>

      {/* SIDEBAR RIGHT - Recommendations */}
      <div className="w-52 bg-white p-4">
        <div className="font-bold text-sm mb-4">recommendation</div>
        {purchasedCourses.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs text-gray-600">
              Vous avez acheté {purchasedCourses.length} cours
            </p>
            <p className="text-xs text-blue-600 cursor-pointer hover:underline">
              Voir mes cours →
            </p>
          </div>
        ) : (
          <p className="text-xs text-gray-500">Aucune recommandation pour le moment</p>
        )}
      </div>
    </div>
  );
};

// Accueil Page Component
const AccueilPage = ({ courses, searchQuery, setSearchQuery, userOwnsCourse, onCourseClick }) => {
  return (
    <>
      {/* Search Bar */}
      <div className="bg-white p-4">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher un cours"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <svg className="w-20 h-20 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M12 14l9-5-9-5-9 5 9 5z" />
            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
          </svg>
          <h3 className="text-lg font-medium text-gray-600 mb-2">Aucun cours disponible</h3>
          <p className="text-sm text-gray-500">Les cours publiés apparaîtront ici</p>
        </div>
      ) : (
        <>
          {/* Banner */}
          <div className="w-full py-3 bg-red-500 flex items-center justify-center gap-2">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-white text-lg font-bold">TOUS LES COURS</span>
          </div>

          {/* Course Grid */}
          <div className="flex-1 overflow-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {courses.map(course => (
                <StudentCourseCard
                  key={course.id}
                  course={course}
                  hasPurchased={userOwnsCourse(course.id)}
                  onTap={() => onCourseClick(course)}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
};

// Statistiques Page Component
const StatistiquesPage = ({ courses, purchasedCourses, userName }) => {
  const totalCourses = courses.length;
  const tdCount = courses.filter(c => c.type === 'TD').length;
  const tpCount = courses.filter(c => c.type === 'TP').length;
  const courCount = courses.filter(c => c.type === 'COUR').length;
  const myCoursesCount = purchasedCourses.length;

  // Calculer les cours achetés par type
  const purchasedCoursesData = courses.filter(c => purchasedCourses.includes(c.id));
  const myTdCount = purchasedCoursesData.filter(c => c.type === 'TD').length;
  const myTpCount = purchasedCoursesData.filter(c => c.type === 'TP').length;
  const myCourCount = purchasedCoursesData.filter(c => c.type === 'COUR').length;

  const getTypeColor = (type) => {
    switch (type) {
      case 'TD': return 'bg-purple-500';
      case 'TP': return 'bg-orange-500';
      case 'COUR': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Statistiques de {userName}</h1>

      {/* Mes cours achetés */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Mes cours</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-5">
            <svg className="w-10 h-10 text-green-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-gray-600">Mes cours achetés</p>
            <p className="text-4xl font-bold text-green-500">{myCoursesCount}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-5">
            <svg className="w-10 h-10 text-purple-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm text-gray-600">Mes TD</p>
            <p className="text-4xl font-bold text-purple-500">{myTdCount}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-5">
            <svg className="w-10 h-10 text-orange-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-gray-600">Mes TP</p>
            <p className="text-4xl font-bold text-orange-500">{myTpCount}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-5">
            <svg className="w-10 h-10 text-red-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-sm text-gray-600">Mes COURS</p>
            <p className="text-4xl font-bold text-red-500">{myCourCount}</p>
          </div>
        </div>
      </div>

      {/* Tous les cours disponibles */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Catalogue complet</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-5">
            <svg className="w-10 h-10 text-blue-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-sm text-gray-600">Total des cours</p>
            <p className="text-4xl font-bold text-blue-500">{totalCourses}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-5">
            <svg className="w-10 h-10 text-purple-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm text-gray-600">Cours TD</p>
            <p className="text-4xl font-bold text-purple-500">{tdCount}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-5">
            <svg className="w-10 h-10 text-orange-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-gray-600">Cours TP</p>
            <p className="text-4xl font-bold text-orange-500">{tpCount}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-5">
            <svg className="w-10 h-10 text-red-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-sm text-gray-600">Cours COUR</p>
            <p className="text-4xl font-bold text-red-500">{courCount}</p>
          </div>
        </div>
      </div>

      {/* Liste de mes cours achetés */}
      {purchasedCoursesData.length > 0 && (
        <>
          <h2 className="text-xl font-bold mb-4">Mes cours achetés</h2>
          <div className="space-y-3 mb-8">
            {purchasedCoursesData.map(course => (
              <div key={course.id} className="bg-white rounded-lg shadow-md p-4 flex items-center gap-4">
                <div className={`${getTypeColor(course.type)} text-white text-xs font-bold px-3 py-1 rounded`}>
                  {course.type}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold">{course.title}</h3>
                  <div className="text-sm text-gray-600 mt-1">
                    <span>Prix: {course.price} DT</span>
                    <span className="mx-2">•</span>
                    <span>Ressources: {course.resources?.length || 0}</span>
                  </div>
                </div>
                <div className="text-green-600 font-bold">✓ ACHETÉ</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Student Course Card Component
const StudentCourseCard = ({ course, hasPurchased, onTap }) => {
  const getTypeColor = (type) => {
    switch (type) {
      case 'TD': return 'bg-purple-500';
      case 'TP': return 'bg-orange-500';
      case 'COUR': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition" onClick={onTap}>
      {/* Header with Type and Price */}
      <div className="p-2 flex justify-between items-center">
        <span className={`${getTypeColor(course.type)} text-white text-xs font-bold px-2 py-1 rounded`}>
          {course.type}
        </span>
        <span className="text-green-600 text-xs font-bold">
          {course.price === 0 ? 'GRATUIT' : `${course.price} DT`}
        </span>
      </div>

      {/* Thumbnail */}
      <div className="mx-4 h-32 bg-gray-300 border border-gray-400 flex items-center justify-center">
        {course.thumbnailUrl ? (
          <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
      </div>

      {/* Title */}
      <div className="m-2 p-1 border border-gray-400 h-12 flex items-center">
        <p className="text-xs line-clamp-2">{course.title}</p>
      </div>

      {/* Resources Info */}
      <div className="px-2 text-xs text-gray-600 mb-1">
        {course.resources?.length || 0} ressource(s)
      </div>

      {/* Action Button */}
      <div className="px-2 pb-2">
        <button
          className={`w-full py-2 text-xs font-bold text-white rounded ${
            hasPurchased ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
          }`}
        >
          {hasPurchased ? 'ACCÉDER' : (course.price === 0 ? 'GRATUIT' : 'ACHETER')}
        </button>
      </div>
    </div>
  );
};

export default StudentView;