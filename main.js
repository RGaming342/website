import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, doc, getDoc, getDocs, addDoc, query, orderBy, onSnapshot, limit, deleteDoc, setDoc, startAfter, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getCurrentUser } from "./auth.js";

// Firebase config
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
const auth = getAuth(app);



export {
	db,
	doc,
	auth,
	getDoc,
	addDoc,
	collection,
	signInWithEmailAndPassword
};



let currentChatName = null;
let currentVersion = null;
let lastCheckTime = 0;
let loadedMessages = [];

export async function sendMessage(name, message) {
	await addDoc(collection(db, "chats", currentChatName, "messages"), {
		message,
		user: name,
		timestamp: Date.now()
	});
	const chatRef = doc(db, "chat-versions", currentChatName);
	const val = await getDoc(chatRef);
	let num = val.data().version;
	await updateDoc(chatRef, {
		version: num+1
	});
}
export async function initChat(chatName) {
	currentChatName = chatName;
	currentVersion = null;
	lastCheckTime = 0;
	loadedMessages = [];
	
	currentVersion = 0;
	console.log("B");
	startMessagePolling();
}
export async function checkMessages() {
	if (!currentChatName) return [];
	
	const now = Date.now();
	if (now - lastCheckTime < 5000) return [];
	
	lastCheckTime = now;
	
	const chatDoc = await getDoc(doc(db, "chat-versions", currentChatName));
	const newVersion = chatDoc.data().version;
	
	if (newVersion <= currentVersion) return [];
	
	currentVersion = newVersion;
	
	// Get timestamp of the last loaded message (most recent)
	const lastTimestamp = loadedMessages.length? loadedMessages[loadedMessages.length - 1].timestamp : 0;
	
	const msgQuery = query(
		collection(db, "chats", currentChatName, "messages"),
		orderBy("timestamp", "asc"),
		startAfter(lastTimestamp)
	);
	
	const snap = await getDocs(msgQuery);
	const newMessages = snap.docs.map(doc => ({ id: doc.id, content: doc.data().message, timestamp: doc.data().timestamp, sender: doc.data().user }));
	
	loadedMessages = [...loadedMessages, ...newMessages];
	
	return newMessages;
}
function resetChat() {
	currentChatName = null;
	currentVersion = null;
	lastCheckTime = 0;
	loadedMessages = [];
}
function getAllMessages() {
	return [...loadedMessages];
}
export async function startMessagePolling() {
	console.log("C");
	const newMessages = await checkMessages();
	if(newMessages.length > 0){
		const dt = document.getElementById("user-section");
		dt.innerHTML = "";
		loadedMessages.forEach(msg => {
			const div = document.createElement("div");
			addToElement(div,time(msg.timestamp),msg.sender+": ",`${msg.content}`);
			dt.appendChild(element("</br>"));
			dt.appendChild(div);
		});
	}
	setTimeout(startMessagePolling, 5000);
}


export function time(timestamp){
	const now = Date.now();
	const diff = now - timestamp;
	
	const msInHour = 1000 * 60 * 60;
	const msInDay = msInHour * 24;
	
	const date = new Date(timestamp);
	const hoursDiff = diff / msInHour;
	
	if (hoursDiff < 24) {
		// Format to HH:MM
		const hours = date.getHours().toString().padStart(2, '0');
		const minutes = date.getMinutes().toString().padStart(2, '0');
		return `${hours}:${minutes}`;
	} else if (hoursDiff < 48) {
		return "Yesterday";
	} else {
		// Format to MM/DD/YYYY
		const month = (date.getMonth() + 1).toString().padStart(2, '0');
		const day = date.getDate().toString().padStart(2, '0');
		const year = date.getFullYear();
		return `${month}/${day}/${year}`;
	}
}

export async function loadFiles(category){
	const user = await getCurrentUser();
	if(!user){ return []; }
	
	const result = [];
	const snap = await getDocs(query(collection(db, category)));
	
	snap.forEach(doc =>{
		const data = doc.data();
		result.push({ id: doc.id, ...data });
	});
	
	return result;
}
export async function deleteFile(category, name){
	const user = await getCurrentUser();
	if(!user){ return; }
	await deleteDoc(doc(db, category, name));
}
export async function addFile(category, name, data){
	const Ref = doc(collection(db, category),name);
	return await setDoc(Ref, data);
}

export function addToElement(parent, ...values){
	for (const val of values) {
		const p = document.createElement("p");
		p.textContent = val;
		parent.appendChild(p);
	}
}
export function element(string){
	const div = document.createElement("div");
	div.innerHTML = string;
	return div;
}












