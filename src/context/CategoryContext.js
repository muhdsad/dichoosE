"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { categories as defaultCategories } from "../utils/categories";

const CategoryContext = createContext({});

export const useCategories = () => useContext(CategoryContext);

export const CategoryProvider = ({ children }) => {
    const [categories, setCategories] = useState(defaultCategories);
    const [loading, setLoading] = useState(true);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, "categories"));
            if (querySnapshot.empty) {
                // Seed Firestore with default categories
                console.log("Seeding categories in Firestore...");
                const promises = defaultCategories.map(async (cat) => {
                    const catToSeed = {
                        ...cat,
                        subcategories: cat.subcategories || []
                    };
                    await addDoc(collection(db, "categories"), catToSeed);
                });
                await Promise.all(promises);
                setCategories(defaultCategories.map(c => ({ ...c, subcategories: c.subcategories || [] })));
            } else {
                const list = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    subcategories: [], // default to empty if not present
                    ...doc.data()
                }));
                // Sort categories: put 'Offer' at the end, and sort others alphabetically
                list.sort((a, b) => {
                    if (a.name === 'Offer') return 1;
                    if (b.name === 'Offer') return -1;
                    return a.name.localeCompare(b.name);
                });
                setCategories(list);
            }
        } catch (error) {
            console.error("Error fetching categories from Firestore:", error);
            // Fallback is defaultCategories, which is already in state
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const addCategory = async (newCat) => {
        try {
            // value is a slugified version of the name or same as name
            const categoryData = {
                name: newCat.name,
                value: newCat.value || newCat.name,
                image: newCat.image || "/categories/default.png",
                color: newCat.color || "bg-gray-100",
                subcategories: newCat.subcategories || []
            };

            const docRef = await addDoc(collection(db, "categories"), categoryData);
            const createdCat = { id: docRef.id, ...categoryData };

            setCategories(prev => {
                const list = [...prev.filter(c => c.name !== 'Offer'), createdCat];
                // Keep 'Offer' at the end
                const offerCat = prev.find(c => c.name === 'Offer');
                if (offerCat) list.push(offerCat);
                return list;
            });

            return createdCat;
        } catch (error) {
            console.error("Error adding category:", error);
            throw error;
        }
    };

    const updateCategory = async (id, updatedCatData) => {
        try {
            const docRef = doc(db, "categories", id);
            const toUpdate = {};
            if (updatedCatData.name !== undefined) toUpdate.name = updatedCatData.name;
            if (updatedCatData.value !== undefined) toUpdate.value = updatedCatData.value;
            if (updatedCatData.image !== undefined) toUpdate.image = updatedCatData.image;
            if (updatedCatData.color !== undefined) toUpdate.color = updatedCatData.color;
            if (updatedCatData.subcategories !== undefined) toUpdate.subcategories = updatedCatData.subcategories;

            await updateDoc(docRef, toUpdate);

            setCategories(prev => {
                const list = prev.map(c => c.id === id ? { ...c, ...toUpdate } : c);
                // Keep 'Offer' at the end
                const listNoOffer = list.filter(c => c.name !== 'Offer');
                const offerCat = list.find(c => c.name === 'Offer');
                if (offerCat) listNoOffer.push(offerCat);
                return listNoOffer;
            });
        } catch (error) {
            console.error("Error updating category:", error);
            throw error;
        }
    };

    const deleteCategory = async (id) => {
        try {
            const docRef = doc(db, "categories", id);
            await deleteDoc(docRef);
            setCategories(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            console.error("Error deleting category:", error);
            throw error;
        }
    };

    return (
        <CategoryContext.Provider value={{ categories, loading, addCategory, updateCategory, deleteCategory, refreshCategories: fetchCategories }}>
            {children}
        </CategoryContext.Provider>
    );
};
