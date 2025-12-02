import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import authService from '../services/authService';

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
       
        // Vérifier si admin
        const adminStatus = authService.isAdminEmail(user.email);
        setIsAdmin(adminStatus);
       
        // Récupérer les détails de l'utilisateur depuis Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserDetails(userDoc.data());
          }
        } catch (error) {
          console.error("Erreur chargement détails:", error);
        }
      } else {
        setCurrentUser(null);
        setUserDetails(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return {
    currentUser,
    userDetails,
    isAdmin,
    loading
  };
};