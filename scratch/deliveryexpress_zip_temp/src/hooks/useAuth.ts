import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Usuario } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeUserDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (unsubscribeUserDoc) {
        unsubscribeUserDoc();
        unsubscribeUserDoc = null;
      }

      if (firebaseUser) {
        const userRef = doc(db, 'usuarios', firebaseUser.uid);
        
        // Initial check and creation if needed
        try {
          const userDoc = await getDoc(userRef);
          if (!userDoc.exists()) {
            const isAdminEmail = firebaseUser.email === "johnnyelbravoleyenda@gmail.com";
            const newUser: Usuario = {
              uid: firebaseUser.uid,
              nombre: firebaseUser.displayName || 'Usuario',
              rol: isAdminEmail ? 'admin' : 'cliente',
              telefono: firebaseUser.phoneNumber || ''
            };
            await setDoc(userRef, newUser);
          }
        } catch (error) {
          console.error("Error checking/creating user:", error);
        }

        // Real-time listener for user data
        unsubscribeUserDoc = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            setUserData({ uid: firebaseUser.uid, ...doc.data() } as Usuario);
          }
          setLoading(false);
        }, (error) => {
          console.error("User doc listener error:", error);
          setLoading(false);
        });
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUserDoc) unsubscribeUserDoc();
    };
  }, []);

  return { user, userData, loading };
}
