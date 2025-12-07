import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  getDocs, // Add this line
  query,
  where,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Course, CourseResource } from '../models/courseModels';

class CourseService {
  constructor() {
    this.collectionName = 'courses';
    this.coursesRef = collection(db, this.collectionName);
  }

  /**
   * Créer un nouveau cours
   */
  async createCourse(courseData) {
    try {
      const courseRef = doc(this.coursesRef, courseData.id);
      
      const course = new Course({
        ...courseData,
        createdAt: serverTimestamp()
      });

      await setDoc(courseRef, course.toMap());
      
      return {
        success: true,
        message: 'Cours créé avec succès',
        courseId: courseData.id
      };
    } catch (error) {
      console.error('Erreur createCourse:', error);
      return {
        success: false,
        message: 'Impossible de créer le cours'
      };
    }
  }

  /**
   * Mettre à jour un cours
   */
  async updateCourse(courseId, updates) {
    try {
      const courseRef = doc(this.coursesRef, courseId);
      await updateDoc(courseRef, updates);
      
      return {
        success: true,
        message: 'Cours mis à jour avec succès'
      };
    } catch (error) {
      console.error('Erreur updateCourse:', error);
      return {
        success: false,
        message: 'Impossible de mettre à jour le cours'
      };
    }
  }

  /**
   * Supprimer un cours
   */
  async deleteCourse(courseId) {
    try {
      const courseRef = doc(this.coursesRef, courseId);
      await deleteDoc(courseRef);
      
      return {
        success: true,
        message: 'Cours supprimé avec succès'
      };
    } catch (error) {
      console.error('Erreur deleteCourse:', error);
      return {
        success: false,
        message: 'Impossible de supprimer le cours'
      };
    }
  }

  /**
   * Récupérer un cours par son ID
   */
  async getCourseById(courseId) {
    try {
      const courseRef = doc(this.coursesRef, courseId);
      const courseDoc = await getDoc(courseRef);
      
      if (!courseDoc.exists()) {
        return null;
      }
      
      return Course.fromFirestore(courseDoc);
    } catch (error) {
      console.error('Erreur getCourseById:', error);
      return null;
    }
  }

  /**
   * Écouter tous les cours publiés (pour les étudiants)
   * Retourne une fonction unsubscribe
   */
  listenToPublishedCourses(callback) {
    const q = query(this.coursesRef, where('status', '==', 'published'));
    
    return onSnapshot(q, (snapshot) => {
      const courses = snapshot.docs.map(doc => Course.fromFirestore(doc));
      callback(courses);
    }, (error) => {
      console.error('Erreur listenToPublishedCourses:', error);
      callback([]);
    });
  }

  /**
   * Écouter tous les cours créés par l'admin
   * Retourne une fonction unsubscribe
   */
  listenToAdminCourses(adminId, callback) {
    const q = query(this.coursesRef, where('createdBy', '==', adminId));
    
    return onSnapshot(q, (snapshot) => {
      const courses = snapshot.docs.map(doc => Course.fromFirestore(doc));
      callback(courses);
    }, (error) => {
      console.error('Erreur listenToAdminCourses:', error);
      callback([]);
    });
  }

  /**
   * Récupérer tous les cours publiés (version async)
   */
  async getPublishedCourses() {
    try {
      const q = query(this.coursesRef, where('status', '==', 'published'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => Course.fromFirestore(doc));
    } catch (error) {
      console.error('Erreur getPublishedCourses:', error);
      return [];
    }
  }

  /**
   * Récupérer tous les cours de l'admin (version async)
   */
  async getAdminCourses(adminId) {
    try {
      const q = query(this.coursesRef, where('createdBy', '==', adminId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => Course.fromFirestore(doc));
    } catch (error) {
      console.error('Erreur getAdminCourses:', error);
      return [];
    }
  }

  /**
   * Ajouter une ressource à un cours
   */
  async addResource(courseId, resourceData) {
    try {
      const courseRef = doc(this.coursesRef, courseId);
      
      const resource = new CourseResource({
        ...resourceData,
        createdAt: new Date()
      });

      await updateDoc(courseRef, {
        resources: arrayUnion(resource.toMap())
      });
      
      return {
        success: true,
        message: 'Ressource ajoutée avec succès'
      };
    } catch (error) {
      console.error('Erreur addResource:', error);
      return {
        success: false,
        message: 'Impossible d\'ajouter la ressource'
      };
    }
  }

  /**
   * Supprimer une ressource d'un cours
   */
  async removeResource(courseId, resource) {
    try {
      const courseRef = doc(this.coursesRef, courseId);
      
      await updateDoc(courseRef, {
        resources: arrayRemove(resource.toMap())
      });
      
      return {
        success: true,
        message: 'Ressource supprimée avec succès'
      };
    } catch (error) {
      console.error('Erreur removeResource:', error);
      return {
        success: false,
        message: 'Impossible de supprimer la ressource'
      };
    }
  }

  /**
   * Mettre à jour le statut d'un cours (draft → pending → published)
   */
  async updateStatus(courseId, newStatus) {
    try {
      const courseRef = doc(this.coursesRef, courseId);
      
      await updateDoc(courseRef, {
        status: newStatus
      });
      
      return {
        success: true,
        message: `Statut mis à jour: ${newStatus}`
      };
    } catch (error) {
      console.error('Erreur updateStatus:', error);
      return {
        success: false,
        message: 'Impossible de mettre à jour le statut'
      };
    }
  }

  /**
   * Filtrer les cours par catégorie
   */
  listenToCoursesByCategory(category, callback) {
    const q = query(
      this.coursesRef, 
      where('status', '==', 'published'),
      where('category', '==', category)
    );
    
    return onSnapshot(q, (snapshot) => {
      const courses = snapshot.docs.map(doc => Course.fromFirestore(doc));
      callback(courses);
    }, (error) => {
      console.error('Erreur listenToCoursesByCategory:', error);
      callback([]);
    });
  }

  /**
   * Rechercher des cours par titre
   */
  async searchCourses(searchTerm) {
    try {
      const snapshot = await getDocs(this.coursesRef);
      const allCourses = snapshot.docs.map(doc => Course.fromFirestore(doc));
      
      // Filtrage côté client (Firestore ne supporte pas les recherches full-text)
      return allCourses.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('Erreur searchCourses:', error);
      return [];
    }
  }
}

// Exporter une instance unique (Singleton)
export default new CourseService();