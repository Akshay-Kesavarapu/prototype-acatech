
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDpw2BAZCtxKmEm9TY2vperpiUWed_Fwi8",
  authDomain: "hiretrainers-acatechnologies.firebaseapp.com",
  projectId: "hiretrainers-acatechnologies",
  storageBucket: "hiretrainers-acatechnologies.firebasestorage.app",
  messagingSenderId: "1080639118322",
  appId: "1:1080639118322:web:82da5205df577b5093e96b"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
