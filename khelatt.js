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
    logoUrl: '',
    maleLink: 'https://t.me/+iK88FtiL2YNmZjE1',
    femaleLink: 'https://t.me/+tSQK_jWEeWU0YjI1',
    whatsappSupport: 'https://wa.me/+601130345524',
    telegramSupport: 'https://t.me/CyberSentinelBD',
    guideVideoUrl: '',
    categoryFees: {},
    categoryLinks: {},
    categoryOaths: {},
    categoryRoles: {}
};

const BOT_TOKEN = '8677605758:AAHJs_SE2YmS0g0RVfuesZuXVKAJ3O5CjiM';
const CHANNEL_ID_SUBMIT = '-1004341639499';
const CHANNEL_ID_APPROVE = '-1003891211232';

window.copyText = function(elementId) {
    const text = document.getElementById(elementId).textContent.trim();
    navigator.clipboard.writeText(text).then(() => {
        showToast(`✅ কপি হয়েছে: ${text}`, 'success');
    }).catch(() => {
        showToast('কপি করতে ব্যর্থ হয়েছে', 'error');
    });
};

window.setDocType = function(type) {
    document.getElementById('selectedDocType').value = type;
    const btnNid = document.getElementById('btnTypeNid');
    const btnBirth = document.getElementById('btnTypeBirth');
    const uploadLabel = document.getElementById('docUploadLabel');
    const numLabel = document.getElementById('docNumberLabel');
    const numInput = document.getElementById('nidNumber');

    if (type === 'NID') {
        btnNid.classList.add('active');
        btnBirth.classList.remove('active');
        uploadLabel.textContent = 'NID কার্ডের সামনের দিক আপলোড';
        numLabel.textContent = 'NID নম্বর';
        numInput.placeholder = 'জাতীয় পরিচয়পত্র নম্বর লিখুন';
    } else {
        btnBirth.classList.add('active');
        btnNid.classList.remove('active');
        uploadLabel.textContent = 'জন্মসনদের পরিষ্কার কপি আপলোড';
        numLabel.textContent = 'জন্মসনদ নম্বর';
        numInput.placeholder = '১৭ ডিজিটের জন্মসনদ নম্বর লিখুন';
    }
};

// REAL-TIME LOCAL CLOCK & CALENDAR
function updateLiveDateTime() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('bn-BD', { hour12: true });
    
    document.getElementById('liveDateDisplay').textContent = dateStr;
    document.getElementById('liveClockDisplay').textContent = timeStr;
    document.getElementById('liveTimeDisplay').textContent = timeStr;
}
updateLiveDateTime();
setInterval(updateLiveDateTime, 1000);

// LIVE FIRESTORE LISTENER (WITH ADMIN SUPPORT CONTROL & GUIDE VIDEO)
onSnapshot(doc(db, "settings", "portalConfig"), (snap) => {
    if (snap.exists()) {
        const cfg = snap.data();
        activePortalConfig = { ...activePortalConfig, ...cfg };

        const logoContainer = document.getElementById('brandLogoContainer');
        const adminLogoImg = document.getElementById('adminLogoImage');
        if (cfg.logoUrl && cfg.logoUrl.trim() !== '') {
            adminLogoImg.src = cfg.logoUrl;
            logoContainer.style.display = 'inline-flex';
        } else {
            logoContainer.style.display = 'none';
            adminLogoImg.src = '';
        }

        const noticeBox = document.getElementById('portalNoticeBox');
        const noticeText = document.getElementById('portalNoticeText');
        if (cfg.notice && cfg.notice.trim() !== '') {
            noticeText.textContent = cfg.notice;
            noticeBox.style.display = 'block';
        } else {
            noticeBox.style.display = 'none';
        }

        const bannerWrap = document.getElementById('bannerWrapper');
        const bannerImg = document.getElementById('csbDynamicBanner');
        if (cfg.bannerUrl && cfg.bannerUrl.trim() !== '') {
            bannerImg.src = cfg.bannerUrl;
            bannerWrap.style.display = 'flex';
        } else {
            bannerWrap.style.display = 'none';
        }

        if (cfg.batchTitle) document.getElementById('batchTitleText').textContent = cfg.batchTitle;
        if (cfg.batchSub) document.getElementById('displayBatchSub').innerHTML = `<i class="fas fa-shield-halved"></i> ${cfg.batchSub}`;
        if (cfg.paymentNumber) document.getElementById('displayPaymentPhone').textContent = cfg.paymentNumber;

        // Admin Dynamic Support Links
        if (cfg.whatsappSupport) {
            document.getElementById('dynWhatsappLink').href = cfg.whatsappSupport;
        }
        if (cfg.telegramSupport) {
            document.getElementById('dynTelegramLink').href = cfg.telegramSupport;
        }

        // Admin Dynamic Guide Video (Auto Setup Container)
        const guideVidContainer = document.getElementById('guideVideoContainer');
        if (cfg.guideVideoUrl && cfg.guideVideoUrl.trim() !== '') {
            guideVidContainer.style.display = 'block';
        } else {
            guideVidContainer.style.display = 'none';
            document.getElementById('guidePlayerTarget').innerHTML = '';
        }

        if (cfg.categories && Array.isArray(cfg.categories) && cfg.categories.length > 0) {
            const catSelect = document.getElementById('category');
            const currentCat = catSelect.value;
            catSelect.innerHTML = '';
            cfg.categories.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c; opt.textContent = c;
                if (c === currentCat) opt.selected = true;
                catSelect.appendChild(opt);
            });
        }
        updateCategoryContext();
    }
});

function updateCategoryContext() {
    const selectedCat = document.getElementById('category').value;
    
    let currentFee = '50';
    if (activePortalConfig.categoryFees && activePortalConfig.categoryFees[selectedCat]) {
        currentFee = activePortalConfig.categoryFees[selectedCat];
    } else if (activePortalConfig.formFee) {
        currentFee = activePortalConfig.formFee;
    }
    document.getElementById('displayFormFee').textContent = `ফর্ম ফি: ${currentFee} টাকা`;

    if (activePortalConfig.categoryOaths && activePortalConfig.categoryOaths[selectedCat]) {
        document.getElementById('displayOathText').innerHTML = activePortalConfig.categoryOaths[selectedCat].replace(/\n/g, '<br>');
    } else if (activePortalConfig.oathText) {
        document.getElementById('displayOathText').innerHTML = activePortalConfig.oathText.replace(/\n/g, '<br>');
    }

    const roleSelect = document.getElementById('role');
    roleSelect.innerHTML = '<option value="">সিলেক্ট করুন</option>';

    let availableRoles = [];
    if (activePortalConfig.categoryRoles && activePortalConfig.categoryRoles[selectedCat]) {
        availableRoles = activePortalConfig.categoryRoles[selectedCat];
    } else if (activePortalConfig.roles && Array.isArray(activePortalConfig.roles)) {
        availableRoles = activePortalConfig.roles;
    }

    if (availableRoles.length > 0) {
        availableRoles.forEach(r => {
            const opt = document.createElement('option');
            opt.value = r; opt.textContent = r;
            roleSelect.appendChild(opt);
        });
    } else {
        roleSelect.innerHTML += `<option value="CSB Member">CSB Member</option>`;
    }
}
document.getElementById('category').addEventListener('change', updateCategoryContext);

// DOM ELEMENTS
const landingPage = document.getElementById('landingPage');
const formWrapper = document.getElementById('formWrapper');
const registerBtn = document.getElementById('registerBtn');
const trackingBtn = document.getElementById('trackingBtn');
const guideBtn = document.getElementById('guideBtn');
const supportModalBtn = document.getElementById('supportModalBtn');
const backToHomeBtn = document.getElementById('backToHomeBtn');
const trackingPanel = document.getElementById('trackingPanel');
const trackInput = document.getElementById('trackInput');
const trackSubmitBtn = document.getElementById('trackSubmitBtn');
const trackResult = document.getElementById('trackResult');

// UNIVERSAL AUTO-RUN PLAYER BUILDER
function launchGuideVideo() {
    const target = document.getElementById('guidePlayerTarget');
    const container = document.getElementById('guideVideoContainer');
    const url = (activePortalConfig.guideVideoUrl || '').trim();

    if (!url) {
        container.style.display = 'none';
        target.innerHTML = '';
        return;
    }

    container.style.display = 'block';

    // Facebook Video / Reels Auto Run
    if (url.includes('facebook.com') || url.includes('fb.watch')) {
        const encoded = encodeURIComponent(url);
        target.innerHTML = `<iframe src="https://www.facebook.com/plugins/video.php?href=${encoded}&show_text=false&autoplay=true&width=500" width="100%" height="280" style="border:none;overflow:hidden;border-radius:14px;" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>`;
    }
    // YouTube Auto Run
    else if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let videoId = '';
        if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1].split('?')[0];
        else if (url.includes('watch?v=')) videoId = url.split('watch?v=')[1].split('&')[0];
        else if (url.includes('/embed/')) videoId = url.split('/embed/')[1].split('?')[0];
        else if (url.includes('/shorts/')) videoId = url.split('/shorts/')[1].split('?')[0];
        target.innerHTML = `<iframe width="100%" height="280" src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&enablejsapi=1" style="border:none;border-radius:14px;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    }
    // Direct MP4 / WebM Auto Run
    else {
        target.innerHTML = `<video controls autoplay playsinline style="width:100%; max-height:280px; display:block; border-radius:14px;"><source src="${url}">আপনার ব্রাউজারে ভিডিও সাপোর্ট করছে না।</video>`;
    }
}

// MODAL HANDLERS
window.closeGuideModal = () => {
    document.getElementById('guidePlayerTarget').innerHTML = ''; // Stop video immediately on close
    document.getElementById('guideModal').classList.remove('show');
};
window.closeSupportModal = () => document.getElementById('supportModal').classList.remove('show');
guideBtn.addEventListener('click', () => {
    document.getElementById('guideModal').classList.add('show');
    launchGuideVideo(); // Trigger Auto Run when clicked
});
supportModalBtn.addEventListener('click', () => document.getElementById('supportModal').classList.add('show'));

registerBtn.addEventListener('click', () => {
    landingPage.style.display = 'none';
    formWrapper.classList.add('active');
    trackingPanel.style.display = 'none';
    initCamera(); 
});

backToHomeBtn.addEventListener('click', () => {
    formWrapper.classList.remove('active');
    landingPage.style.display = 'block';
});

trackingBtn.addEventListener('click', () => {
    landingPage.style.display = 'block';
    formWrapper.classList.remove('active');
    trackingPanel.style.display = trackingPanel.style.display === 'none' ? 'block' : 'none';
    if (trackingPanel.style.display === 'block') {
        trackResult.innerHTML = `<p><i class="fas fa-circle-info" style="color:var(--primary);"></i> আপনার আবেদন আইডি প্রদান করুন।</p>`;
    }
});

// QUERY PARAM ACTION HANDLERS (TELEGRAM WEBHOOKS)
window.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    const trackId = params.get('id');
    const msgId = params.get('msg_id');

    if (action && trackId) {
        try {
            const docRef = doc(db, "applications", trackId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const existingData = docSnap.data();
                const updateTime = new Date().toLocaleString('bn-BD');

                if (action === 'approve') {
                    await updateDoc(docRef, { status: 'Approved', updateTime: updateTime });
                    showToast(`✅ ID: ${trackId} অনুমোদিত হয়েছে!`, 'success');
                    sendToApproveChannel(trackId, { ...existingData, time: updateTime });
                } else if (action === 'reject') {
                    await updateDoc(docRef, { status: 'Rejected', updateTime: updateTime });
                    showToast(`❌ ID: ${trackId} বাতিল করা হয়েছে!`, 'error');
                    sendRejectionNotice(trackId, { ...existingData, time: updateTime });
                }

                if (msgId) {
                    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageReplyMarkup`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: CHANNEL_ID_SUBMIT,
                            message_id: parseInt(msgId),
                            reply_markup: { inline_keyboard: [] }
                        })
                    });
                }
            }
        } catch (err) {
            console.error("Action Error:", err);
        }
    }
});

async function sendToApproveChannel(trackId, data) {
    const text = `🎉 **নতুন আবেদন অনুমোদিত (APPROVED)** 🎉\n━━━━━━━━━━━━━━━━━━━━━━\n👤 নাম: ${data.fullName || data.name}\n🆔 ট্র্যাকিং আইডি: \`${trackId}\`\n📂 ক্যাটাগরি: ${data.category || 'N/A'}\n🏠 ঠিকানা: ${data.address || 'N/A'}\n📧 ইমেইল: ${data.email || 'N/A'}\n📱 WhatsApp: ${data.whatsapp || 'N/A'}\n✈️ Telegram: ${data.telegram || 'N/A'}\n⚧️ জেন্ডার: ${data.gender}\n🗂️ রোল: ${data.role}\n🪪 ${data.docType || 'NID/Birth'}: \`${data.nidNumber}\`\n📅 জন্মতারিখ: \`${data.dob}\`\n🧾 TNX ID: ${data.tnxId || 'N/A'}\n📞 অভিভাবক: ${data.guardianPhone || 'N/A'}\n📱 নিজের: ${data.personalPhone || 'N/A'}\n📅 অনুমোদন সময়: ${data.time}\n━━━━━━━━━━━━━━━━━━━━━━\n🛡️ Cyber Sentinel Bangladesh`;
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: CHANNEL_ID_APPROVE, text: text, parse_mode: 'Markdown' })
    });
}

async function sendRejectionNotice(trackId, data) {
    const text = `❌ **আবেদন বাতিল নোটিশ (REJECTED)** ❌\n━━━━━━━━━━━━━━━━━━━━━━\n👤 নাম: ${data.fullName || data.name}\n🆔 ট্র্যাকিং আইডি: \`${trackId}\`\n⚠️ তথ্যে অসঙ্গতি থাকায় আবেদনটি বাতিল করা হয়েছে।\n━━━━━━━━━━━━━━━━━━━━━━\n🛡️ Cyber Sentinel Bangladesh`;
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: CHANNEL_ID_SUBMIT, text: text, parse_mode: 'Markdown' })
    });
}

trackSubmitBtn.addEventListener('click', async () => {
    const id = trackInput.value.trim().toUpperCase();
    if (!id) { showToast('⚠️ আইডি লিখুন', 'error'); return; }

    trackResult.innerHTML = `<p style="color:var(--primary);"><i class="fas fa-spinner fa-spin"></i> ডাটাবেজে খোঁজা হচ্ছে...</p>`;

    try {
        const docRef = doc(db, "applications", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            trackResult.innerHTML = `<div style="background:rgba(244,63,94,0.08); border-radius:14px; padding:16px; border:1px solid rgba(244,63,94,0.25); margin-top:12px;"><p style="color:var(--accent-red); font-size:14px; font-weight:700;"><i class="fas fa-circle-xmark"></i> কোনো আবেদন পাওয়া যায়নি!</p></div>`;
            return;
        }

        const data = docSnap.data();
        const status = data.status || 'Pending';
        const time = data.updateTime || data.createdAt || 'N/A';
        const gender = data.gender || 'Male';
        const cat = data.category || 'NEW STUDENTS';

        let color = '#ffa94d';
        let icon = '⏳';
        let joinLinkHtml = '';

        if (status === 'Approved') {
            color = '#00f5d4';
            icon = '✅';
            
            let targetGroupLink = activePortalConfig.maleLink;
            if (activePortalConfig.categoryLinks && activePortalConfig.categoryLinks[cat]) {
                targetGroupLink = (gender === 'Female') 
                    ? activePortalConfig.categoryLinks[cat].female 
                    : activePortalConfig.categoryLinks[cat].male;
            }
            if (!targetGroupLink) {
                targetGroupLink = (gender === 'Female') ? activePortalConfig.femaleLink : activePortalConfig.maleLink;
            }

            joinLinkHtml = `
                <div style="margin-top: 15px; border-top: 1px dashed rgba(255, 255, 255, 0.1); padding-top: 15px; text-align: center;">
                    <p style="color: var(--primary); font-weight: 600; font-size: 13px; margin-bottom: 10px;">🎉 অভিনন্দন! আপনার আবেদনটি অনুমোদিত হয়েছে।</p>
                    <a href="${targetGroupLink}" target="_blank" style="display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, var(--primary), var(--secondary)); color: #020617; padding: 10px 22px; border-radius: 30px; text-decoration: none; font-weight: 700; font-size: 13px;">
                        <i class="fab fa-telegram"></i> অফিসিয়াল গ্রুপে জয়েন করুন
                    </a>
                </div>
            `;
        } else if (status === 'Rejected') {
            color = '#f43f5e';
            icon = '❌';
            joinLinkHtml = `<div style="margin-top: 15px; border-top: 1px dashed rgba(244, 63, 94, 0.2); padding-top: 15px; text-align: center;"><p style="color: #f43f5e; font-size: 13px;">দুঃখিত, আবেদনটি বাতিল করা হয়েছে।</p></div>`;
        }

        trackResult.innerHTML = `
            <div style="background:rgba(255,255,255,0.02); border-radius:14px; padding:16px; border:1px solid rgba(255,255,255,0.06); margin-top:12px;">
                <p style="font-size:15px; font-weight:700; color:#fff;">আইডি: <span style="color:var(--primary); font-family:'JetBrains Mono';">${id}</span></p>
                <p style="margin-top:6px; font-size:14px; font-weight:600;">স্ট্যাটাস: <span style="color:${color};">${icon} ${status}</span></p>
                <p style="font-size:12px; color:var(--text-muted); margin-top:4px;">আপডেট সময়: ${time}</p>${joinLinkHtml}
            </div>
        `;
    } catch (err) {
        trackResult.innerHTML = `<p style="color:var(--accent-red);">সার্ভার থেকে তথ্য পাওয়া যায়নি।</p>`;
    }
});

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.className = 'toast ' + type;
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation'}" style="margin-right:8px; color:${type === 'success' ? 'var(--primary)' : 'var(--accent-red)'}"></i> ${message}`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4000);
}

window.closeModal = function() { document.getElementById('successModal').classList.remove('show'); };
window.closeErrorModal = function() { document.getElementById('errorModal').classList.remove('show'); };

// VIDEO RECORDER
let mediaRecorder, recordedChunks = [], stream = null, isCameraReady = false, recordedBlob = null;
const previewVideo = document.getElementById('previewVideo');
const startBtn = document.getElementById('startRecord');
const stopBtn = document.getElementById('stopRecord');
const downloadBtn = document.getElementById('downloadRecord');
const recordingDot = document.getElementById('recordingDot');
const recordingStatus = document.getElementById('recordingStatus');

async function initCamera() {
    if (isCameraReady) return true;
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: true });
        previewVideo.srcObject = stream;
        isCameraReady = true;
        recordingStatus.textContent = 'Ready';
        recordingDot.className = 'dot ready';
        return true;
    } catch (err) {
        recordingStatus.textContent = 'Access Denied';
        recordingDot.className = 'dot';
        return false;
    }
}

startBtn.addEventListener('click', async () => {
    const cameraStarted = await initCamera();
    if (!cameraStarted || !stream) { showToast('⚠️ ক্যামেরা ব্যবহারের অনুমতি দিন', 'error'); return; }
    recordedChunks = [];
    recordedBlob = null;
    try { mediaRecorder = new MediaRecorder(stream); } catch (err) { showToast('⚠️ ভিডিও রেকর্ডিং ব্রাউজারে সাপোর্ট করছে না', 'error'); return; }

    mediaRecorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) recordedChunks.push(e.data); };
    mediaRecorder.onstop = () => {
        if (!recordedChunks.length) { showToast('⚠️ ভিডিও সঠিকভাবে রেকর্ড হয়নি', 'error'); return; }
        recordedBlob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(recordedBlob);
        downloadBtn.disabled = false;
        downloadBtn.onclick = () => {
            const a = document.createElement('a'); a.href = url; a.download = `csb_oath_${Date.now()}.webm`; a.click();
        };
        recordingStatus.textContent = 'Saved';
        recordingDot.className = 'dot ready';
        startBtn.disabled = false;
        stopBtn.disabled = true;
        showToast('✅ ভিডিও রেকর্ড সম্পন্ন হয়েছে', 'success');
    };

    mediaRecorder.start();
    startBtn.disabled = true;
    stopBtn.disabled = false;
    downloadBtn.disabled = true;
    recordingStatus.textContent = 'Recording';
    recordingDot.className = 'dot recording';
});

stopBtn.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') mediaRecorder.stop();
});

document.querySelectorAll('.file-upload-wrapper input[type="file"]').forEach(input => {
    input.addEventListener('change', function() {
        const area = this.closest('.file-upload-wrapper').querySelector('.file-upload-area');
        const span = area.querySelector('.info .main span');
        if (this.files.length) {
            let fileName = this.files[0].name;
            if (fileName.length > 25) {
                fileName = fileName.substring(0, 20) + '...' + fileName.split('.').pop();
            }
            span.textContent = fileName;
        } else {
            span.textContent = 'ফাইল বেছে নিন';
        }
    });
});

function updateProgress(pct, status) {
    const prog = document.getElementById('uploadProgress');
    prog.classList.add('show');
    document.getElementById('progressBar').style.width = pct + '%';
    document.getElementById('progressStatus').textContent = `${status} (${pct}%)`;
    if (pct >= 100) setTimeout(() => prog.classList.remove('show'), 2500);
}

// DIRECT HIGH-RES PNG SLIP EXPORT
async function generateAutoPNG(trackId, formData, currentTime) {
    const card = document.createElement('div');
    card.style.position = 'fixed';
    card.style.left = '-9999px';
    card.style.top = '0';
    card.style.width = '600px';
    card.style.background = '#060a14';
    card.style.color = '#f8fafc';
    card.style.padding = '35px';
    card.style.borderRadius = '20px';
    card.style.border = '2px solid #00f5d4';
    card.style.boxShadow = '0 20px 40px rgba(0,0,0,0.8)';
    card.style.fontFamily = "'Plus Jakarta Sans', sans-serif";

    card.innerHTML = `
        <div style="text-align: center; border-bottom: 2px dashed rgba(0, 245, 212, 0.4); padding-bottom: 16px; margin-bottom: 22px;">
            <h2 style="color: #00f5d4; font-size: 22px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">CYBER SENTINEL BANGLADESH</h2>
            <p style="font-size: 11.5px; color: #94a3b8; letter-spacing: 2px; font-weight: 700; margin-top: 5px;">OFFICIAL ADMISSION CONFIRMATION SLIP</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13.5px; line-height: 1.6;">
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                <td style="padding: 9px 0; color: #94a3b8; width: 42%; font-weight: 600;">ট্র্যাকিং আইডি:</td>
                <td style="padding: 9px 0; font-weight: 800; color: #00f5d4; font-family: monospace; font-size: 14.5px;">${trackId}</td>
            </tr>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                <td style="padding: 9px 0; color: #94a3b8; font-weight: 600;">আবেদনকারীর নাম:</td>
                <td style="padding: 9px 0; font-weight: 700; color: #fff;">${formData.fullName}</td>
            </tr>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                <td style="padding: 9px 0; color: #94a3b8; font-weight: 600;">মোবাইল নম্বর:</td>
                <td style="padding: 9px 0; font-weight: 600; color: #fff;">${formData.personalPhone}</td>
            </tr>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                <td style="padding: 9px 0; color: #94a3b8; font-weight: 600;">ইমেইল:</td>
                <td style="padding: 9px 0; font-weight: 600; color: #cbd5e1;">${formData.email}</td>
            </tr>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                <td style="padding: 9px 0; color: #94a3b8; font-weight: 600;">ক্যাটাগরি:</td>
                <td style="padding: 9px 0; font-weight: 600; color: #0ea5e9;">${formData.category}</td>
            </tr>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                <td style="padding: 9px 0; color: #94a3b8; font-weight: 600;">নির্বাচিত রোল:</td>
                <td style="padding: 9px 0; font-weight: 600; color: #fff;">${formData.role}</td>
            </tr>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                <td style="padding: 9px 0; color: #94a3b8; font-weight: 600;">সনদের ধরন ও নম্বর:</td>
                <td style="padding: 9px 0; font-weight: 600; color: #fff;">${formData.docType} (${formData.nidNumber})</td>
            </tr>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                <td style="padding: 9px 0; color: #94a3b8; font-weight: 700; color: #0ea5e9; font-family: monospace;">${formData.tnxId}</td>
            </tr>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                <td style="padding: 9px 0; color: #94a3b8; font-weight: 600;">আবেদনের সময়:</td>
                <td style="padding: 9px 0; font-weight: 600; color: #cbd5e1;">${currentTime}</td>
            </tr>
            <tr>
                <td style="padding: 9px 0; color: #94a3b8; font-weight: 600;">বর্তমান অবস্থা:</td>
                <td style="padding: 9px 0; font-weight: 800; color: #f59e0b;">Pending (যাচাই চলছে)</td>
            </tr>
        </table>

        <div style="border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 14px; text-align: center; font-size: 11px; color: #64748b; line-height: 1.5;">
            <p>এই স্লিপটি আপনার অফিশিয়াল প্রমাণপত্র। ট্র্যাকিং প্যানেল থেকে নিয়মিত স্ট্যাটাস চেক করুন।</p>
            <p style="margin-top: 3px; font-weight: 700; color: #00f5d4;">🛡️ Cyber Sentinel Bangladesh · Official Desk</p>
        </div>
    `;

    document.body.appendChild(card);

    try {
        const canvas = await html2canvas(card, {
            scale: 2,
            backgroundColor: '#060a14',
            useCORS: true
        });

        const link = document.createElement('a');
        link.download = `CSB_Slip_${trackId}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (err) {
        console.error("PNG Gen Error:", err);
    } finally {
        document.body.removeChild(card);
    }
}

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
        };

        for (let k in formData) {
            if (!formData[k]) {
                showToast('⚠ সব তথ্য সঠিকভাবে পূরণ করুন', 'error');
                submitBtn.classList.remove('loading'); submitBtn.disabled = false; return;
            }
        }

        try {
            const tnxCheckRef = doc(db, "transactions", formData.tnxId);
            const tnxSnap = await getDoc(tnxCheckRef);
            if (tnxSnap.exists()) {
                document.getElementById('errorMessage').innerHTML = `<p style="color:#fff; font-weight:700;">Transaction ID ইতিমধ্যে ব্যবহৃত হয়েছে!</p><p style="margin-top:4px;">নতুন TNX দিয়ে চেষ্টা করুন।</p>`;
                document.getElementById('errorModal').classList.add('show');
                submitBtn.classList.remove('loading'); submitBtn.disabled = false; return;
            }
        } catch(e) {
            console.log("Validation bypassed");
        }

        if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) { showToast('⚠️ সঠিক ইমেইল দিন', 'error'); submitBtn.classList.remove('loading'); submitBtn.disabled = false; return; }
        const phoneRegex = /^01[3-9]\d{8}$/;
        if (!phoneRegex.test(formData.whatsapp) || !phoneRegex.test(formData.guardianPhone) || !phoneRegex.test(formData.personalPhone)) {
            showToast('⚠️ সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)', 'error'); submitBtn.classList.remove('loading'); submitBtn.disabled = false; return; 
        }
        if (!formData.fbLink.match(/^https?:\/\/(www\.)?facebook\.com\/.+/)) { showToast('⚠️ সঠিক ফেসবুক লিংক দিন', 'error'); submitBtn.classList.remove('loading'); submitBtn.disabled = false; return; }
        if (!recordedBlob) { showToast('⚠️ শপথনামার লাইভ ভিডিও রেকর্ড বাধ্যতামূলক', 'error'); submitBtn.classList.remove('loading'); submitBtn.disabled = false; return; }

        const fileIds = ['photo1', 'photo2', 'nid', 'paymentScreenshot'];
        for (let id of fileIds) {
            const inp = document.getElementById(id);
            if (!inp.files || !inp.files.length) {
                showToast('⚠️ সব প্রয়োজনীয় ডকুমেন্ট আপলোড করুন', 'error'); submitBtn.classList.remove('loading'); submitBtn.disabled = false; return;
            }
        }

        updateProgress(20, 'ফায়ারস্টোর ডেটাবেজে সেভ হচ্ছে...');
        const trackId = 'CSB-2026-' + String(Math.floor(1000 + Math.random() * 9000));
        const currentTime = new Date().toLocaleString('bn-BD');

        await setDoc(doc(db, "applications", trackId), {
            ...formData, status: 'Pending', createdAt: currentTime, updateTime: currentTime
        });
        await setDoc(doc(db, "transactions", formData.tnxId), { trackId: trackId, usedAt: currentTime });

        updateProgress(50, 'টেলিগ্রাম চ্যানেলে পাঠানো হচ্ছে...');
        const caption = `🛡️ **CSB NEW ADMISSION FORM** 🛡️\n━━━━━━━━━━━━━━━━━━━━━━\n👤 নাম: ${formData.fullName}\n📂 ক্যাটাগরি: ${formData.category}\n🏠 ঠিকানা: ${formData.address}\n📧 ইমেইল: ${formData.email}\n📱 WhatsApp: ${formData.whatsapp}\n✈️ Telegram: ${formData.telegram}\n📘 FB নাম: ${formData.fbName}\n🔗 FB লিংক: ${formData.fbLink}\n🪪 ${formData.docType}: \`${formData.nidNumber}\`\n📅 জন্মতারিখ: \`${formData.dob}\`\n⚧️ জেন্ডার: ${formData.gender}\n🗂️ রোল: ${formData.role}\n🧾 TNX ID: \`${formData.tnxId}\`\n📞 অভিভাবক: ${formData.guardianPhone}\n📱 নিজের: ${formData.personalPhone}\n🆔 ট্র্যাকিং আইডি: \`${trackId}\`\n━━━━━━━━━━━━━━━━━━━━━━\n📅 আবেদন টাইম: ${currentTime}`;

        try {
            const mediaGroup = new FormData();
            mediaGroup.append('chat_id', CHANNEL_ID_SUBMIT);
            mediaGroup.append('file1', document.getElementById('photo1').files[0], 'photo1.jpg');
            mediaGroup.append('file2', document.getElementById('photo2').files[0], 'photo2.jpg');
            mediaGroup.append('file3', document.getElementById('nid').files[0], 'nid.jpg');
            mediaGroup.append('file4', document.getElementById('paymentScreenshot').files[0], 'screenshot.jpg');
            mediaGroup.append('videoFile', recordedBlob, `oath_${trackId}.mp4`);

            const mediaData = [
                { type: 'photo', media: 'attach://file1', caption: caption, parse_mode: 'Markdown' },
                { type: 'photo', media: 'attach://file2' },
                { type: 'photo', media: 'attach://file3' },
                { type: 'photo', media: 'attach://file4' },
                { type: 'video', media: 'attach://videoFile' }
            ];
            mediaGroup.append('media', JSON.stringify(mediaData));

            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMediaGroup`, {
                method: 'POST', body: mediaGroup
            });
        } catch(tgErr) {
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: CHANNEL_ID_SUBMIT, text: caption, parse_mode: 'Markdown' })
            });
        }

        updateProgress(80, 'অ্যাকশন কন্ট্রোল ও PNG তৈরি হচ্ছে...');

        const webAppBaseUrl = window.location.href.split('?')[0];
        const actionMsgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                chat_id: CHANNEL_ID_SUBMIT, 
                text: `🚨 **CSB ACTION PANEL** 🚨\nID: \`${trackId}\`\nনাম: ${formData.fullName}\nরোল: ${formData.role}`, 
                parse_mode: 'Markdown' 
            })
        });
        const actionData = await actionMsgRes.json();
        const actionMsgId = actionData.result ? actionData.result.message_id : '';

        if (actionMsgId) {
            const inlineKeyboard = {
                inline_keyboard: [[
                    { text: '✅ Approve', url: `${webAppBaseUrl}?action=approve&id=${trackId}&msg_id=${actionMsgId}` }, 
                    { text: '❌ Reject', url: `${webAppBaseUrl}?action=reject&id=${trackId}&msg_id=${actionMsgId}` }
                ]]
            };

            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageReplyMarkup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: CHANNEL_ID_SUBMIT,
                    message_id: actionMsgId,
                    reply_markup: inlineKeyboard
                })
            });
        }

        await generateAutoPNG(trackId, formData, currentTime);

        updateProgress(100, 'সম্পন্ন হয়েছে!');
        document.getElementById('trackingIdDisplay').textContent = trackId;
        document.getElementById('successModal').classList.add('show');

        setTimeout(() => {
            document.getElementById('csbForm').reset();
            document.querySelectorAll('.file-upload-area .info .main span').forEach(s => s.textContent = 'ফাইল বেছে নিন');
            recordedBlob = null;
            recordedChunks = [];
            recordingStatus.textContent = 'Ready';
            recordingDot.className = 'dot ready';
            startBtn.disabled = false;
            stopBtn.disabled = true;
            downloadBtn.disabled = true;
            if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; isCameraReady = false; previewVideo.srcObject = null; }
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }, 1500);

    } catch (err) {
        console.error(err);
        document.getElementById('errorMessage').textContent = 'ত্রুটি দেখা দিয়েছে। ইন্টারনেট বা পারমিশন চেক করুন। (' + err.message + ')';
        document.getElementById('errorModal').classList.add('show');
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        document.getElementById('uploadProgress').classList.remove('show');
    }
});

document.querySelector('.btn-reset').addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm('সব ফিল্ড মুছে ফেলতে চান?')) {
        document.getElementById('csbForm').reset();
        document.querySelectorAll('.file-upload-area .info .main span').forEach(s => s.textContent = 'ফাইল বেছে নিন');
        recordedBlob = null;
        recordedChunks = [];
        if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; isCameraReady = false; previewVideo.srcObject = null; }
        document.getElementById('uploadProgress').classList.remove('show');
        showToast('ফর্ম রিসেট করা হয়েছে', 'success');
    }
});
