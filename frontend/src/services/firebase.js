import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAkkmKGKwAS-PbEsahhqwLEYcb8_m4pcrk",
  authDomain: "gradientrush-b3f38.firebaseapp.com",
  projectId: "gradientrush-b3f38",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
