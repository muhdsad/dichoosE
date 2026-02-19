import { NextResponse } from 'next/server';
import { db } from '../../../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import nodemailer from 'nodemailer';

export async function POST(req) {
    try {
        const { order, customer } = await req.json();

        // 1. Save order to Firebase
        const orderRef = await addDoc(collection(db, "orders"), {
            ...order,
            customer,
            createdAt: new Date().toISOString(),
            status: 'pending'
        });

        // 2. Decrement Stock
        // We use updateDoc to lower the stock quantity for each item bought
        const { updateDoc, doc, increment } = await import('firebase/firestore');

        for (const item of order.items) {
            if (item.id) {
                const productRef = doc(db, 'products', item.id);
                // Atomically decrement the stock by the quantity purchased
                await updateDoc(productRef, {
                    stock: increment(-item.quantity)
                });
            }
        }

        // 3. Send email notification
        // Note: User needs to provide EMAIL_USER and EMAIL_PASS in .env.local
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'muhdsad@gmail.com', // Notification enabled for this email as requested
            subject: `New Order Received - Order #${orderRef.id}`,
            html: `
        <h1>New Order Alert</h1>
        <p><strong>Order ID:</strong> ${orderRef.id}</p>
        <p><strong>Customer:</strong> ${customer.name} (${customer.email})</p>
        <p><strong>Address:</strong> ${customer.address}, ${customer.city}, ${customer.zip}</p>
        <hr />
        <h3>Order Details:</h3>
        <ul>
          ${order.items.map(item => `
            <li>
              <strong>${item.name}</strong> x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}
            </li>
          `).join('')}
        </ul>
        <h3>Total: $${order.total.toFixed(2)}</h3>
      `,
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log("Email sent successfully");
        } catch (emailError) {
            console.error("Error sending email:", emailError);
            // We don't fail the request if email fails, but we log it.
        }

        return NextResponse.json({ message: 'Order placed successfully', orderId: orderRef.id }, { status: 200 });

    } catch (error) {
        console.error("Error processing order:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
