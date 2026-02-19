"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, setDoc } from 'firebase/firestore';

const WishlistContext = createContext();

export function useWishlist() {
    return useContext(WishlistContext);
}

export function WishlistProvider({ children }) {
    const { user } = useAuth();
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWishlist = async () => {
            if (!user) {
                setWishlist([]);
                setLoading(false);
                return;
            }

            try {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists() && docSnap.data().wishlist) {
                    setWishlist(docSnap.data().wishlist);
                } else {
                    setWishlist([]);
                }
            } catch (error) {
                console.error("Error fetching wishlist:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWishlist();
    }, [user]);

    const addToWishlist = async (productId) => {
        if (!user) {
            alert("Please login to add items to your wishlist.");
            return;
        }

        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                wishlist: arrayUnion(productId)
            }).catch(async (error) => {
                // If document doesn't exist (e.g. older users), create it
                if (error.code === 'not-found' || error.message.includes('No document to update')) {
                    await setDoc(userRef, { wishlist: [productId] }, { merge: true });
                } else {
                    throw error;
                }
            });

            setWishlist(prev => [...prev, productId]);
        } catch (error) {
            console.error("Error adding to wishlist:", error);
        }
    };

    const removeFromWishlist = async (productId) => {
        if (!user) return;

        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                wishlist: arrayRemove(productId)
            });

            setWishlist(prev => prev.filter(id => id !== productId));
        } catch (error) {
            console.error("Error removing from wishlist:", error);
        }
    };

    const isInWishlist = (productId) => {
        return wishlist.includes(productId);
    };

    const value = {
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        loading
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
}
