import { db } from "../lib/firebase";
import { collection, addDoc, getDocs, writeBatch, doc } from "firebase/firestore";

const products = [
    {
        name: "Classic Leather Backpack",
        price: 79.99,
        description: "A durable and stylish leather backpack perfect for daily commute or weekend getaways. Features multiple compartments and a laptop sleeve.",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "Bags"
    },
    {
        name: "Wireless Noise-Canceling Headphones",
        price: 199.99,
        description: "Immerse yourself in music with these premium wireless headphones. Active noise cancellation and 30-hour battery life.",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "Electronics"
    },
    {
        name: "Minimalist Wrist Watch",
        price: 129.50,
        description: "Elegant minimalist design with a genuine leather strap and stainless steel case. Water-resistant up to 50 meters.",
        image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "Accessories"
    },
    {
        name: "Organic Cotton T-Shirt",
        price: 24.99,
        description: "Soft, breathable, and eco-friendly. Made from 100% organic cotton. Available in various colors.",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "Clothing"
    },
    {
        name: "Smart Fitness Tracker",
        price: 49.99,
        description: "Track your steps, heart rate, and sleep patterns. persistent battery life and waterproof design.",
        image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "Electronics"
    },
    {
        name: "Ceramic Coffee Mug Set",
        price: 34.00,
        description: "Set of 4 handcrafted ceramic mugs. Perfect for your morning coffee or tea. Dishwasher and microwave safe.",
        image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "Home"
    }
];

export const seedProducts = async () => {
    try {
        const productsCollection = collection(db, "products");

        // Check if products already exist to avoid duplicates
        const snapshot = await getDocs(productsCollection);
        if (!snapshot.empty) {
            console.log("Products already exist. Skipping seed.");
            return;
        }

        const batch = writeBatch(db);

        products.forEach((product) => {
            const docRef = doc(productsCollection);
            batch.set(docRef, product);
        });

        await batch.commit();
        console.log("Products seeded successfully!");
    } catch (error) {
        console.error("Error seeding products:", error);
    }
};
