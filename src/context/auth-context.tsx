"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseFirestore } from "@/lib/firebase";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  logout: async () => {},
});

async function createOrUpdateUserDoc(user: User) {
  const db = getFirebaseFirestore();
  if (!db) return;

  const userRef = doc(db, "users", user.uid);
  await setDoc(
    userRef,
    {
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const auth = getFirebaseAuth();

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (!auth) return;

    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          await createOrUpdateUserDoc(result.user);
          router.push("/");
        }
      })
      .catch((error) => {
        console.error("Error getting redirect result", error);
      });
  }, [auth, router]);

  const signInWithGoogle = async () => {
    if (!auth) {
      console.error("Firebase Auth not initialized");
      return;
    }

    const provider = new GoogleAuthProvider();
    provider.addScope("https://www.googleapis.com/auth/calendar.events");
    await signInWithRedirect(auth, provider);
  };

  const logout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

