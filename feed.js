// Import Firebase services
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, query, orderBy, limit, onSnapshot } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { getCurrentUser } from './auth.js';

const firebaseConfig = {
	apiKey: "AIzaSyBOIu9AxDpW1_E2YzTVAfl-EtylvngInAw",
	authDomain: "website-2a362.firebaseapp.com",
	projectId: "website-2a362",
	storageBucket: "website-2a362.firebasestorage.app",
	messagingSenderId: "585365187275",
	appId: "1:585365187275:web:3c5eb81e7186a5ccd3894e",
	measurementId: "G-LYZMBYNK3M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const user = getCurrentUser();

if (!user) {
	window.location.href = "guest.html";
} else {
	document.body.style.display = "block";
	document.getElementById("user-display").textContent = user.display;
	loadScopes();
}


const scopeSelect = document.getElementById("scope-select");
const scopeIdMap = {};

async function loadScopes() {
	const q = query(collection(db, "scopes"));
	const snap = await getDocs(q);
	scopeSelect.innerHTML = "";
	
	snap.forEach(docSnap => {
		const data = docSnap.data();
		if (data.public || (data.allowed && data.allowed.includes(user.email))) {
			scopeIdMap[data.name] = docSnap.id;
			const opt = document.createElement("option");
			opt.value = data.name;
			opt.textContent = data.name;
			scopeSelect.appendChild(opt);
		}
	});
	
	if (snap.size > 0) {
		scopeSelect.value = "general";
		selectScope("general");
	}
}



const feedDiv = document.getElementById("feed");
const messageBox = document.getElementById("message");
const postBtn = document.getElementById("postBtn");

let currentScope = null;
let unsubscribe = null;


// Call this when user picks a scope
function loadMessages() {
	if (unsubscribe) unsubscribe(); // stop previous listener
	
	feedDiv.innerHTML = "";
	const messagesRef = collection(db, "scopes", currentScope, "messages");
	const q = query(messagesRef, orderBy("timestamp"));
	
	unsubscribe = onSnapshot(q, (snapshot) => {
		feedDiv.innerHTML = "";
		snapshot.forEach((doc) => {
			const data = doc.data();
			const div = document.createElement("div");
			div.className = "post";
			div.innerHTML = `<strong>${data.user}</strong>: ${data.message}`;
			feedDiv.appendChild(div);
		});
	});
}

// Triggered when a scope is clicked
function selectScope(scopeName) {
	currentScope = scopeName;
	loadMessages();
}

// Hook this up to your scope buttons or dropdown
// Example for dropdown:
scopeSelect.addEventListener("change", () => {
	const scopeName = scopeSelect.value;
	selectScope(scopeName);
});

// Send a message
postBtn.addEventListener("click", async () => {
	const message = messageBox.value.trim();
	if (!message || !currentScope) return;
	
	await addDoc(collection(db, "scopes", currentScope, "messages"), {
		message: message,
		user: user.display,
		email: user.email,
		timestamp: Date.now()
	});
	
	messageBox.value = "";
});












