"use client";

import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  type User
} from "firebase/auth";
import { auth } from "./firebase";

export const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*[^A-Za-z0-9]).{8,}$/;

export const isValidPassword = (value: string): boolean => PASSWORD_RULE.test(value);

export const subscribeAuth = (cb: (user: User | null) => void) => onAuthStateChanged(auth, cb);

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

export const loginWithEmail = async (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const registerWithEmail = async (name: string, email: string, password: string) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (name.trim()) {
    await updateProfile(cred.user, { displayName: name.trim() });
  }
  return cred;
};

export const logout = async () => signOut(auth);
