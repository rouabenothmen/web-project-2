import { useState, useEffect } from 'react';
import courseService from '../services/courseServices'; // Note: 'courseService' pas 'courseServices'
import { useAuth } from './useAuth';

export const useAdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    let isMounted = true;

    const fetchCourses = async () => {
      if (!currentUser) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      try {
        if (isMounted) {
          setLoading(true);
          setError(null);
        }
        
        const unsubscribe = courseService.listenToAdminCourses(
          currentUser.uid, 
          (coursesData) => {
            if (isMounted) {
              setCourses(coursesData);
              setLoading(false);
            }
          }
        );

        return () => {
          if (isMounted) {
            unsubscribe();
          }
        };
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
          setCourses([]);
        }
      }
    };

    fetchCourses();

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  return { courses, loading, error };
};