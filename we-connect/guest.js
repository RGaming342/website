import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const firebaseConfig = {
	apiKey: "AIzaSyBOIu9AxDpW1_E2YzTVAfl-EtylvngInAw",
	authDomain: "website-2a362.firebaseapp.com",
	projectId: "website-2a362",
	storageBucket: "website-2a362.firebasestorage.app",
	messagingSenderId: "585365187275",
	appId: "1:585365187275:web:3c5eb81e7186a5ccd3894e",
	measurementId: "G-LYZMBYNK3M"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function canPost() {
	const now = Date.now();
	const hourAgo = now - 3600_000;
	const log = JSON.parse(localStorage.getItem("guest_log") || "[]");
	const recent = log.filter(t => t > hourAgo);
	
	if (recent.length >= 5) return false;
	
	recent.push(now);
	localStorage.setItem("guest_log", JSON.stringify(recent));
	return true;
}
document.getElementById("sendBtn").addEventListener("click", async () => {
	const message = document.getElementById("message").value.trim();
	const contact = document.getElementById("contact").value.trim();
	const status = document.getElementById("status");
	
	if(!message){
		status.textContent = "Message cannot be empty.";
		return;
	}
	
	if(!canPost()){
		status.textContent = "Rate limit reached: 5 messages/hour.";
		return;
	}
	
	try {
		await addDoc(collection(db, "guest"), {
			message,
			contact: contact || null,
			timestamp: Date.now(),
			user_agent: navigator.userAgent,
			timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
		});
		status.textContent = "Message sent successfully!";
		document.getElementById("message").value = "";
	} catch (err) {
		console.error("Send failed:", err);
		status.textContent = "Error sending message.";
	}
});




