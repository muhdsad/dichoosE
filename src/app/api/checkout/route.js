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
              <strong>${item.name}</strong> x ${item.quantity} - ₹${Number(item.price * item.quantity || 0).toFixed(2)}
            </li>
          `).join('')}
        </ul>
        <h3>Total: ₹${Number(order.total || 0).toFixed(2)}</h3>
      `,
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log("Email notification sent successfully to admin");
        } catch (emailError) {
            console.error("Error sending email notification:", emailError);
            // We don't fail the request if email fails, but we log it.
        }

        // 4. Send WhatsApp Notification to Admin
        const adminPhone = process.env.WHATSAPP_ADMIN_PHONE || '918547246183';
        const itemsText = order.items
            ?.map(item => `• ${item.name} (x${item.quantity}) - ₹${Number(item.price * item.quantity || 0).toFixed(2)}`)
            .join('\n') || '';

        const whatsappMessage = `*New Order Alert - Dichoos* 🛍️

*Order ID:* #${orderRef.id}
*Customer:* ${customer.name} (+91 ${customer.phone})
*Address:* ${customer.address}, ${customer.city}, ${customer.zip}

*Items:*
${itemsText}

*Total:* ₹${Number(order.total || 0).toFixed(2)} (Cash on Delivery)`;

        // Check and send via CallMeBot (Free, easy for personal notifications)
        if (process.env.CALLMEBOT_API_KEY) {
            const apiKey = process.env.CALLMEBOT_API_KEY;
            const url = `https://api.callmebot.com/whatsapp.php?phone=${adminPhone}&text=${encodeURIComponent(whatsappMessage)}&apikey=${apiKey}`;
            try {
                const waRes = await fetch(url);
                if (waRes.ok) {
                    console.log("WhatsApp alert sent via CallMeBot successfully");
                } else {
                    console.error("Failed to send WhatsApp alert via CallMeBot:", await waRes.text());
                }
            } catch (err) {
                console.error("Error sending WhatsApp alert via CallMeBot:", err);
            }
        }
        // Check and send via UltraMsg (Professional API)
        else if (process.env.ULTRAMSG_INSTANCE_ID && process.env.ULTRAMSG_TOKEN) {
            const instanceId = process.env.ULTRAMSG_INSTANCE_ID;
            const token = process.env.ULTRAMSG_TOKEN;
            const url = `https://api.ultramsg.com/${instanceId}/messages/chat`;
            try {
                const waRes = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({
                        token,
                        to: adminPhone,
                        body: whatsappMessage
                    })
                });
                if (waRes.ok) {
                    console.log("WhatsApp alert sent via UltraMsg successfully");
                } else {
                    console.error("Failed to send WhatsApp alert via UltraMsg:", await waRes.text());
                }
            } catch (err) {
                console.error("Error sending WhatsApp alert via UltraMsg:", err);
            }
        }
        // Check and send via Green API (Professional API)
        else if (process.env.GREENAPI_ID_INSTANCE && process.env.GREENAPI_API_TOKEN) {
            const idInstance = process.env.GREENAPI_ID_INSTANCE;
            const apiToken = process.env.GREENAPI_API_TOKEN;
            const url = `https://api.green-api.com/waInstance${idInstance}/sendMessage/${apiToken}`;
            try {
                const waRes = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chatId: `${adminPhone}@c.us`,
                        message: whatsappMessage
                    })
                });
                if (waRes.ok) {
                    console.log("WhatsApp alert sent via Green API successfully");
                } else {
                    console.error("Failed to send WhatsApp alert via Green API:", await waRes.text());
                }
            } catch (err) {
                console.error("Error sending WhatsApp alert via Green API:", err);
            }
        } else {
            console.log("No WhatsApp API credentials configured in .env.local. Server-side auto WhatsApp notification skipped.");
        }

        return NextResponse.json({ message: 'Order placed successfully', orderId: orderRef.id }, { status: 200 });

    } catch (error) {
        console.error("Error processing order:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
