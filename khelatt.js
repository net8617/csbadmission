import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDQUF7WzlgooRi3cpQ3Kz6Ed7XEs3txZis",
    authDomain: "csb-team-addmission.firebaseapp.com",
    projectId: "csb-team-addmission",
    storageBucket: "csb-team-addmission.firebasestorage.app",
    messagingSenderId: "701813947891",
    appId: "1:701813947891:web:8536e058bdc3c5a2a5a686",
    measurementId: "G-PNQ70ZYZ81"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let activePortalConfig = {
    paymentNumber: '01971138617',
    categories: ['NEW STUDENTS', 'EX-STUDENTS', 'EXECUTIVE'],
    categoryFees: {},
    categoryFeeDisabled: {},
    oathConfig: { maleEnabled: true, femaleEnabled: true, maleText: '', femaleText: '' },
    promoCodes: []
};

let isFeeFreeForCategory = false;
let isOathDisabledForGender = false;
let isPromoApplied = false;
let appliedPromoCode = "";

const BOT_TOKEN = '8677605758:AAHJs_SE2YmS0g0RVfuesZuXVKAJ3O5CjiM';
const CHANNEL_ID_SUBMIT = '-1004341639499';
const CHANNEL_ID_APPROVE = '-1003891211232';

function escapeHtml(text) {
    if (!text) return '';
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// REALTIME FIRESTORE SETTINGS SYNC
onSnapshot(doc(db, "settings", "portalConfig"), (snap) => {
    if (snap.exists()) {
        activePortalConfig = { ...activePortalConfig, ...snap.data() };
        if (activePortalConfig.paymentNumber) {
            const phoneEl = document.getElementById('displayPaymentPhone');
            if (phoneEl) phoneEl.textContent = activePortalConfig.paymentNumber;
        }
        updateFormContext();
    }
});

// CATEGORY & GENDER CONTEXT HANDLER (DYNAMIC FEE & OATH TOGGLE)
function updateFormContext() {
    const selectedCat = document.getElementById('category').value;
    const selectedGender = document.getElementById('gender').value;

    // 1. ক্যাটাগরি অনুযায়ী ফি চালু / বন্ধ চেক
    isFeeFreeForCategory = activePortalConfig.categoryFeeDisabled && activePortalConfig.categoryFeeDisabled[selectedCat] === true;
    const paymentCard = document.getElementById('paymentCardMain');
    const paymentInputs = document.getElementById('paymentInputsWrapper');
    const displayFee = document.getElementById('displayFormFee');
    const tnxInput = document.getElementById('tnxId');
    const screenshotInput = document.getElementById('paymentScreenshot');

    if (isFeeFreeForCategory || isPromoApplied) {
        displayFee.textContent = "ফর্ম ফি: ০ টাকা (বিনামূল্যে)";
        paymentCard.classList.add('free-mode');
        paymentInputs.style.display = 'none';
        tnxInput.required = false;
        screenshotInput.required = false;
        if (!tnxInput.value) tnxInput.value = isPromoApplied ? `PROMO-${appliedPromoCode}` : "FREE-CATEGORY";
    } else {
        const fee = (activePortalConfig.categoryFees && activePortalConfig.categoryFees[selectedCat]) ? activePortalConfig.categoryFees[selectedCat] : '50';
        displayFee.textContent = `ফর্ম ফি: ${fee} টাকা`;
        paymentCard.classList.remove('free-mode');
        paymentInputs.style.display = 'block';
        tnxInput.required = true;
        screenshotInput.required = true;
        if (tnxInput.value === "FREE-CATEGORY") tnxInput.value = "";
    }

    // 2. ছেলে ও মেয়েদের জন্য আলাদা শপথনামা ও চালু / বন্ধ চেক
    const oathWrapper = document.querySelector('.form-group:has(.video-recorder)') || document.getElementById('oathSectionWrapper');
    const oathTextDisplay = document.getElementById('displayOathText');
    const oathCfg = activePortalConfig.oathConfig || { maleEnabled: true, femaleEnabled: true };

    if (selectedGender === 'Female') {
        isOathDisabledForGender = oathCfg.femaleEnabled === false;
        if (oathTextDisplay) oathTextDisplay.innerHTML = (oathCfg.femaleText || "আমি সততার সাথে দায়িত্ব পালন করবো।").replace(/\n/g, '<br>');
    } else {
        isOathDisabledForGender = oathCfg.maleEnabled === false;
        if (oathTextDisplay) oathTextDisplay.innerHTML = (oathCfg.maleText || "আমি সততার সাথে দায়িত্ব পালন করবো।").replace(/\n/g, '<br>');
    }

    // যদি এই জেন্ডারের জন্য শপথনামা বন্ধ থাকে তবে সম্পূর্ণ ভিডিও রেকর্ডার বক্স হাইড হবে
    if (oathWrapper) {
        if (isOathDisabledForGender) {
            oathWrapper.style.display = 'none';
        } else {
            oathWrapper.style.display = 'block';
        }
    }
}

document.getElementById('category').addEventListener('change', updateFormContext);
document.getElementById('gender').addEventListener('change', updateFormContext);

// PROMO CODE VERIFICATION
document.getElementById('btnApplyPromo').addEventListener('click', () => {
    const code = document.getElementById('promoCodeInput').value.trim().toUpperCase();
    const msg = document.getElementById('promoStatusMessage');
    msg.style.display = 'block';

    const found = (activePortalConfig.promoCodes || []).find(p => p.code === code && p.status === 'Active');
    if (found) {
        isPromoApplied = true;
        appliedPromoCode = code;
        msg.style.color = 'var(--accent-green)';
        msg.textContent = `✅ প্রোমো কোড ${code} সফলভাবে প্রয়োগ হয়েছে! ফি মওকুফ করা হলো।`;
        updateFormContext();
    } else {
        msg.style.color = 'var(--accent-red)';
        msg.textContent = `❌ অবৈধ অথবা ব্যবহৃত প্রোমো কোড!`;
    }
});

// OPTIMIZED CAMERA & CODEC SETUP (NO BLACK SCREEN)
let mediaRecorder, recordedChunks = [], stream = null, recordedBlob = null;
let supportedMimeType = 'video/webm';
let videoExt = 'webm';

if (typeof MediaRecorder !== 'undefined') {
    if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1.42E01E,mp4a.40.2')) {
        supportedMimeType = 'video/mp4;codecs=avc1.42E01E,mp4a.40.2';
        videoExt = 'mp4';
    } else if (MediaRecorder.isTypeSupported('video/mp4')) {
        supportedMimeType = 'video/mp4';
        videoExt = 'mp4';
    }
}

async function initCamera() {
    if (stream) return true;
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 24 } },
            audio: true
        });
        document.getElementById('previewVideo').srcObject = stream;
        document.getElementById('recordingStatus').textContent = 'Ready';
        document.getElementById('recordingDot').className = 'dot ready';
        return true;
    } catch (e) { return false; }
}

document.getElementById('startRecord').addEventListener('click', async () => {
    await initCamera();
    recordedChunks = [];
    recordedBlob = null;
    mediaRecorder = new MediaRecorder(stream, { mimeType: supportedMimeType, videoBitsPerSecond: 1000000 });
    mediaRecorder.ondataavailable = e => { if (e.data.size > 0) recordedChunks.push(e.data); };
    mediaRecorder.onstop = () => {
        recordedBlob = new Blob(recordedChunks, { type: supportedMimeType });
        document.getElementById('recordingStatus').textContent = 'Saved';
        document.getElementById('recordingDot').className = 'dot ready';
        document.getElementById('startRecord').disabled = false;
        document.getElementById('stopRecord').disabled = true;
    };
    mediaRecorder.start(1000);
    document.getElementById('startRecord').disabled = true;
    document.getElementById('stopRecord').disabled = false;
    document.getElementById('recordingStatus').textContent = 'Recording';
    document.getElementById('recordingDot').className = 'dot recording';
});

document.getElementById('stopRecord').addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') mediaRecorder.stop();
});

// FORM SUBMISSION ENGINE
document.getElementById('csbForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
        const formData = {
            fullName: document.getElementById('fullName').value.trim(),
            address: document.getElementById('address').value.trim(),
            email: document.getElementById('email').value.trim(),
            whatsapp: document.getElementById('whatsapp').value.trim(),
            telegram: document.getElementById('telegram').value.trim(),
            fbName: document.getElementById('fbName').value.trim(),
            fbLink: document.getElementById('fbLink').value.trim(),
            docType: document.getElementById('selectedDocType').value,
            nidNumber: document.getElementById('nidNumber').value.trim(),
            dob: document.getElementById('dob').value,
            gender: document.getElementById('gender').value,
            role: document.getElementById('role').value,
            category: document.getElementById('category').value,
            tnxId: document.getElementById('tnxId').value.trim().toUpperCase(),
            guardianPhone: document.getElementById('guardianPhone').value.trim(),
            personalPhone: document.getElementById('personalPhone').value.trim(),
            promoCode: appliedPromoCode || (isFeeFreeForCategory ? "FREE-CAT" : "NONE")
        };

        // যদি শপথনামা চালু থাকে তবেই ভিডিও রেকর্ড বাধ্যতামূলক হবে
        if (!isOathDisabledForGender && !recordedBlob) {
            showToast('⚠️ শপথনামার লাইভ ভিডিও রেকর্ড বাধ্যতামূলক!', 'error');
            submitBtn.classList.remove('loading'); submitBtn.disabled = false; return;
        }

        const photo1File = document.getElementById('photo1').files[0];
        const photo2File = document.getElementById('photo2').files[0];
        const nidFile = document.getElementById('nid').files[0];
        const paymentFile = document.getElementById('paymentScreenshot').files[0];

        const trackId = 'CSB-2026-' + Math.floor(1000 + Math.random() * 9000);
        const currentTime = new Date().toLocaleString('bn-BD');

        // SAFE HTML CAPTION
        const caption = `🛡️ <b>CSB NEW ADMISSION FORM</b> 🛡️\n━━━━━━━━━━━━━━━━━━━━━━\n👤 নাম: ${escapeHtml(formData.fullName)}\n📂 ক্যাটাগরি: ${escapeHtml(formData.category)}\n🏠 ঠিকানা: ${escapeHtml(formData.address)}\n📧 ইমেইল: ${escapeHtml(formData.email)}\n📱 WhatsApp: ${escapeHtml(formData.whatsapp)}\n✈️ Telegram: ${escapeHtml(formData.telegram)}\n📘 FB: ${escapeHtml(formData.fbName)}\n🔗 লিংক: ${escapeHtml(formData.fbLink)}\n🪪 ${escapeHtml(formData.docType)}: <code>${escapeHtml(formData.nidNumber)}</code>\n⚧️ জেন্ডার: ${escapeHtml(formData.gender)}\n🗂️ রোল: ${escapeHtml(formData.role)}\n🧾 TNX: <code>${escapeHtml(formData.tnxId)}</code>\n🎟️ ফি স্ট্যাটাস: ${isFeeFreeForCategory || isPromoApplied ? 'ফ্রি' : 'পেইড'}\n🆔 ট্র্যাকিং আইডি: <code>${escapeHtml(trackId)}</code>\n📅 সময়: ${escapeHtml(currentTime)}`;

        const mediaGroup = new FormData();
        mediaGroup.append('chat_id', CHANNEL_ID_SUBMIT);
        mediaGroup.append('file1', photo1File, 'photo1.jpg');
        mediaGroup.append('file2', photo2File, 'photo2.jpg');
        mediaGroup.append('file3', nidFile, 'doc.jpg');

        let mediaData = [
            { type: 'photo', media: 'attach://file1', caption: caption, parse_mode: 'HTML' },
            { type: 'photo', media: 'attach://file2' },
            { type: 'photo', media: 'attach://file3' }
        ];

        if (paymentFile && !isFeeFreeForCategory && !isPromoApplied) {
            mediaGroup.append('file4', paymentFile, 'payment.jpg');
            mediaData.push({ type: 'photo', media: 'attach://file4' });
        }

        if (!isOathDisabledForGender && recordedBlob) {
            mediaGroup.append('videoFile', recordedBlob, `oath_${trackId}.${videoExt}`);
            mediaData.push({ type: 'video', media: 'attach://videoFile' });
        }

        mediaGroup.append('media', JSON.stringify(mediaData));

        const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMediaGroup`, { method: 'POST', body: mediaGroup });
        const tgData = await tgRes.json();
        if (!tgData.ok) throw new Error(tgData.description || 'টেলিগ্রাম আপলোড ব্যর্থ!');

        // SAVE DATA TO FIRESTORE
        await setDoc(doc(db, "applications", trackId), {
            ...formData, status: 'Pending', createdAt: currentTime
        });

        // Redeem promo code
        if (isPromoApplied && activePortalConfig.promoCodes) {
            const updated = activePortalConfig.promoCodes.map(p => p.code === appliedPromoCode ? { ...p, status: 'Redeemed', usedBy: trackId } : p);
            await updateDoc(doc(db, "settings", "portalConfig"), { promoCodes: updated });
        }

        document.getElementById('trackingIdDisplay').textContent = trackId;
        document.getElementById('successModal').classList.add('show');

    } catch (err) {
        document.getElementById('errorMessage').textContent = err.message;
        document.getElementById('errorModal').classList.add('show');
    } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
});
