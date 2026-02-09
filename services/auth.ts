import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
} from 'firebase/auth'
import { auth } from './firebase'

const googleProvider = new GoogleAuthProvider()

export async function signInWithGoogle() {
  if (!auth) throw new Error('Firebase Auth is not configured')
  return signInWithPopup(auth, googleProvider)
}

export async function signInWithEmail(email: string, password: string) {
  if (!auth) throw new Error('Firebase Auth is not configured')
  return signInWithEmailAndPassword(auth, email, password)
}

export async function signUpWithEmail(email: string, password: string) {
  if (!auth) throw new Error('Firebase Auth is not configured')
  return createUserWithEmailAndPassword(auth, email, password)
}

export async function signInAsDemo() {
  if (!auth) throw new Error('Firebase Auth is not configured')
  return signInWithEmailAndPassword(auth, 'demo@visionpath.app', 'demo1234')
}

export async function signOutUser() {
  if (!auth) return
  return signOut(auth)
}
