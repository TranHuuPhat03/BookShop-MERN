import {  createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase/firebase.config";
import { createUserWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut } from "firebase/auth";
import axios from "axios";
import getBaseUrl from "../utils/baseURL";

const AuthContext =  createContext();

export const useAuth = () => {
    return useContext(AuthContext)
}

const googleProvider = new GoogleAuthProvider();

// authProvider
export const AuthProvide = ({children}) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // register a user
    const registerUser = async (email, password) => {
        try {
            // Check if user exists in MongoDB first
            try {
                // Check if username (email) already exists in MongoDB
                const checkResponse = await axios.post(`${getBaseUrl()}/api/auth/check-email`, {
                    username: email
                });
                
                if (checkResponse.data.exists) {
                    throw new Error("Email already in use");
                }
            } catch (dbError) {
                // If it's our custom error, rethrow it
                if (dbError.message === "Email already in use") {
                    throw dbError;
                }
                // If the check endpoint is not implemented, continue with registration
                console.log("Email check endpoint might not be implemented:", dbError);
            }
            
            // Register with Firebase
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                
                // Then save user to MongoDB
                await axios.post(`${getBaseUrl()}/api/auth/register`, {
                    username: email,
                    password: password
                });
                
                return userCredential;
            } catch (firebaseError) {
                // Handle Firebase specific errors
                if (firebaseError.code === 'auth/email-already-in-use') {
                    throw new Error("Email already in use");
                }
                throw firebaseError;
            }
        } catch (error) {
            console.error("Error registering user:", error);
            throw error;
        }
    }

    // login the user
    const loginUser = async (email, password) => {
        try {
            // First login with Firebase
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            // Then try to login to MongoDB
            const response = await axios.post(`${getBaseUrl()}/api/auth/login`, {
                username: email,
                password: password
            });
            
            // Save token and user info to localStorage
            if (response.data.token) {
                localStorage.setItem('user_token', response.data.token);
                localStorage.setItem('user_info', JSON.stringify(response.data.user));
                // Remove admin token if exists to prevent conflicts
                localStorage.removeItem('admin_token');
            }
            
            return userCredential;
        } catch (error) {
            console.error("Error logging in:", error);
            throw error;
        }
    }

    // sing up with google
    const signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            
            // Register in MongoDB if it's a new Google sign-in
            try {
                const response = await axios.post(`${getBaseUrl()}/api/auth/register`, {
                    username: user.email,
                    password: Date.now().toString() // Generate a random password
                });
                
                // Save token and user info to localStorage
                if (response.data.token) {
                    localStorage.setItem('user_token', response.data.token);
                    localStorage.setItem('user_info', JSON.stringify(response.data.user));
                    // Remove admin token if exists to prevent conflicts
                    localStorage.removeItem('admin_token');
                }
            } catch (dbError) {
                // If registration fails, try logging in
                try {
                    const loginResponse = await axios.post(`${getBaseUrl()}/api/auth/login`, {
                        username: user.email,
                        password: Date.now().toString()
                    });
                    
                    // Save token and user info to localStorage
                    if (loginResponse.data.token) {
                        localStorage.setItem('user_token', loginResponse.data.token);
                        localStorage.setItem('user_info', JSON.stringify(loginResponse.data.user));
                        // Remove admin token if exists to prevent conflicts
                        localStorage.removeItem('admin_token');
                    }
                } catch (loginError) {
                    console.error("Error logging in after Google sign-in:", loginError);
                }
            }
            
            return result;
        } catch (error) {
            console.error("Error with Google sign-in:", error);
            throw error;
        }
    }

    // logout the user
    const logout = () => {
        // Remove user data on logout
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_info');
        return signOut(auth)
    }

    // manage user
    useEffect(() => {
        const unsubscribe =  onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);

            if(user) {
               
                const {email, displayName, photoURL} = user;
                const userData = {
                    email, username: displayName, photo: photoURL
                } 
            }
        })

        return () => unsubscribe();
    }, [])


    const value = {
        currentUser,
        loading,
        registerUser,
        loginUser,
        signInWithGoogle,
        logout
    }
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
