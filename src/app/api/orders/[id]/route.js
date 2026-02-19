
import { NextResponse } from 'next/server';
import { db } from '../../../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function GET(req, { params }) {
    try {
        const { id } = await params;
        console.log("API Params ID:", id);

        if (!id) {
            return NextResponse.json({ message: 'Order ID is required' }, { status: 400 });
        }

        const orderRef = doc(db, "orders", id);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) {
            return NextResponse.json({ message: 'Order not found' }, { status: 404 });
        }

        const orderData = orderSnap.data();

        return NextResponse.json({ id: orderSnap.id, ...orderData }, { status: 200 });
    } catch (error) {
        console.error("Error fetching order:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
