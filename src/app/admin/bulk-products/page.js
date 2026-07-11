"use client";
import { useState, useRef } from 'react';
import { db } from '../../../lib/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
import * as XLSX from 'xlsx';

export default function BulkAddProductsPage() {
    const [previewProducts, setPreviewProducts] = useState([]);
    const [isUpdating, setIsUpdating] = useState(false);
    const fileInputRef = useRef(null);

    const downloadTemplate = () => {
        // Create an empty array for the Excel file with the required headers
        const data = [{
            Name: "Example Product",
            Price: 150,
            MRP: 200,
            Unit: "1 KG",
            Stock: 100,
            Category: "Fruits",
            Description: "Fresh and organic.",
            Image_URL: "https://example.com/image.jpg",
            OfferPrice: 130
        }];

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "New Products");
        XLSX.writeFile(wb, "dichoos_add_products_template.xlsx");
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);
                
                // Parse products
                const newProducts = [];
                data.forEach((row, index) => {
                    const name = row.Name ? String(row.Name).trim() : '';
                    if (!name || name === "Example Product") return; // Skip empty rows or the example row
                    
                    const price = parseFloat(row.Price) || 0;
                    const mrp = parseFloat(row.MRP) || 0;
                    const offerPrice = parseFloat(row.OfferPrice) || null;
                    
                    newProducts.push({
                        _tempId: `row_${index}`, // internal reference for preview
                        name: name,
                        price: price,
                        mrp: mrp,
                        unit: row.Unit ? String(row.Unit).trim() : '',
                        stock: parseInt(row.Stock) || 0,
                        category: row.Category ? String(row.Category).trim() : '',
                        description: row.Description ? String(row.Description).trim() : '',
                        image: row.Image_URL ? String(row.Image_URL).trim() : '',
                        offerPrice: offerPrice,
                        // Validate critical fields
                        isValid: name.length > 0 && price > 0
                    });
                });
                
                setPreviewProducts(newProducts);
                if (newProducts.length === 0) {
                    alert("No valid new products found in the file.");
                }
            } catch (err) {
                console.error(err);
                alert("Error parsing file. Please ensure it's a valid Excel/CSV generated from the template.");
            }
        };
        reader.readAsBinaryString(file);
    };

    const applyUpdates = async () => {
        if (previewProducts.length === 0) return;
        
        const validProducts = previewProducts.filter(p => p.isValid);
        const invalidCount = previewProducts.length - validProducts.length;
        
        if (invalidCount > 0) {
            if (!confirm(`${invalidCount} products are missing a Name or Price and will be skipped. Do you want to continue adding the ${validProducts.length} valid products?`)) return;
        } else {
            if (!confirm(`Are you sure you want to add ${validProducts.length} new products to your store?`)) return;
        }

        if (validProducts.length === 0) {
            alert("No valid products to add.");
            return;
        }

        setIsUpdating(true);
        try {
            const batch = writeBatch(db);
            const productsRef = collection(db, "products");
            let count = 0;
            
            for (const product of validProducts) {
                // Generate a new document reference with an auto-generated ID
                const newDocRef = doc(productsRef);
                
                const productData = {
                    name: product.name,
                    price: product.price,
                    mrp: product.mrp,
                    unit: product.unit,
                    stock: product.stock,
                    category: product.category,
                    categories: product.category ? [product.category] : [],
                    description: product.description,
                    image: product.image,
                    offerPrice: product.offerPrice,
                    offerStart: null,
                    offerEnd: null
                };
                
                // If there's an offer, add 'Offer' to categories automatically for standard filtering
                if (product.offerPrice && productData.categories.indexOf('Offer') === -1) {
                    productData.categories.push('Offer');
                }

                batch.set(newDocRef, productData);
                count++;
                
                // Firestore batch limit is 500
                if (count === 500) {
                    await batch.commit();
                    count = 0;
                }
            }
            
            if (count > 0) {
                await batch.commit();
            }
            
            alert(`Successfully added ${validProducts.length} new products!`);
            setPreviewProducts([]);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (error) {
            console.error("Error adding products:", error);
            alert("Failed to add products. Check console for details.");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="bg-white min-h-screen p-8 text-black">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-black text-gray-800 mb-6 uppercase tracking-tight">Bulk Add Products</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Export Template Card */}
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                        <h2 className="text-xl font-bold text-blue-900 mb-2">1. Get Empty Template</h2>
                        <p className="text-blue-700 mb-4 text-sm font-medium">Download a blank Excel file with all the required columns for adding new products.</p>
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={downloadTemplate}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
                            >
                                Download Empty Template
                            </button>
                        </div>
                    </div>

                    {/* Upload Card */}
                    <div className="bg-green-50 p-6 rounded-xl border border-green-200 shadow-sm">
                        <h2 className="text-xl font-bold text-green-900 mb-2">2. Upload New Products</h2>
                        <p className="text-green-700 mb-4 text-sm font-medium">Upload your filled-out template to instantly add all products to the database.</p>
                        
                        <label className="block mb-2 text-sm font-bold text-green-900">Select File</label>
                        <input 
                            type="file" 
                            accept=".xlsx, .xls, .csv" 
                            onChange={handleFileUpload}
                            ref={fileInputRef}
                            className="block w-full text-sm text-green-800
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-lg file:border-0
                                file:text-sm file:font-bold
                                file:bg-green-600 file:text-white
                                hover:file:bg-green-700 cursor-pointer border border-green-300 rounded p-1 bg-white"
                        />
                    </div>
                </div>

                {/* Preview Table */}
                {previewProducts.length > 0 && (
                    <div className="bg-white border-2 border-gray-200 rounded-xl shadow-md overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b-2 flex justify-between items-center">
                            <div>
                                <h2 className="font-bold text-gray-800 text-lg">Preview New Products ({previewProducts.length} items)</h2>
                                <p className="text-xs text-gray-500">Review carefully. This will create brand new products in your store.</p>
                            </div>
                            <button 
                                onClick={applyUpdates}
                                disabled={isUpdating}
                                className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-opacity-90 transition shadow-sm"
                            >
                                {isUpdating ? 'Adding to Database...' : 'Confirm & Add Products'}
                            </button>
                        </div>
                        <div className="overflow-x-auto max-h-[500px]">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="p-3 font-bold text-gray-700">Status</th>
                                        <th className="p-3 font-bold text-gray-700">Name</th>
                                        <th className="p-3 font-bold text-gray-700">Price</th>
                                        <th className="p-3 font-bold text-gray-700">MRP</th>
                                        <th className="p-3 font-bold text-gray-700">Unit</th>
                                        <th className="p-3 font-bold text-gray-700">Category</th>
                                        <th className="p-3 font-bold text-green-700">OfferPrice</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewProducts.map((p, idx) => (
                                        <tr key={idx} className={`border-b hover:bg-gray-50 ${!p.isValid ? 'bg-red-50' : ''}`}>
                                            <td className="p-3">
                                                {p.isValid ? 
                                                    <span className="text-green-600 font-bold">Valid</span> : 
                                                    <span className="text-red-600 font-bold">Missing Info</span>
                                                }
                                            </td>
                                            <td className="p-3 max-w-[200px] truncate font-semibold">{p.name || '---'}</td>
                                            <td className="p-3">{p.price || '---'}</td>
                                            <td className="p-3 text-gray-500">{p.mrp || '-'}</td>
                                            <td className="p-3">{p.unit || '-'}</td>
                                            <td className="p-3">{p.category || '-'}</td>
                                            <td className="p-3 font-black text-green-600">{p.offerPrice || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
