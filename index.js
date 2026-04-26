const express = require('express');
const admin = require('firebase-admin');
const app = express().use(express.json());

// ربط السيرفر بحساب الفايربيز الخاص بك
const serviceAccount = require("./firebase-key.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// التحقق من فيسبوك (Webhook)
app.get('/webhook', (req, res) => {
    res.status(200).send(req.query['hub.challenge']);
});

// استلام الرسالة وإرسالها لموبايلك
app.post('/webhook', async (req, res) => {
    const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (message) {
        await admin.messaging().send({
            data: { 
                chatId: message.from, 
                text: message.text.body 
            },
            token: "ضع_هنا_التوكن_الذي_ظهر_لك_في_الموبايل" 
        });
        console.log("✅ وصلت رسالة وتم إرسالها للموبايل");
    }
    res.sendStatus(200);
});

app.listen(process.env.PORT || 3000, () => console.log("🚀 السيرفر جاهز!"));