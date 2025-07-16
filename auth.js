import { auth, signInWithEmailAndPassword, db, doc, getDoc, addDoc, collection } from "./main.js"



export let cachedUser = null;

export async function getCurrentUser() {
	if(cachedUser){ return cachedUser; }
	
	const raw = localStorage.getItem("auth_user");
	if(!raw){ return null; }
	
	const localUser = JSON.parse(raw);
	let user = auth.currentUser;
	
	if (!user && localUser.email && localUser.password ) {
		user = await loginUser(localUser.email,localUser.password);
	}
	
	if(!user || user.uid === undefined){ return null; }
	
	cachedUser = {
		email: user.email,
		display: user.display || user.email.split("@")[0],
		uid: user.uid
	};
	return cachedUser;
}

export async function loginUser(email,password) {
	try {
		const result = await signInWithEmailAndPassword(auth, email, password);
		const user = result.user;
		
		const userRef = doc(db, "users", user.uid);
		const userSnap = await getDoc(userRef);
		if(!userSnap.exists()){ return null; }
		
		const userData = userSnap.data();
		userData.email = user.email;
		userData.uid = user.uid;
		localStorage.setItem("auth_user", JSON.stringify({
			email: email,
			password: password,
			display: userData.display
		}));
		return userData;
	} catch (err) {
		console.error("Login failed:", err.code, err.message);
		return null;
	}
}

export function logout() {
	localStorage.removeItem("auth_user");
	cachedUser = null;
	location.reload();
}

export async function sendGuestMessage(message, email, password) {
	const data = {
		message,
		email,
		password,
		timestamp: Date.now(),
		user_agent: navigator.userAgent,
		timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
	};
	
	const guestRef = collection(db, "guest");
	return await addDoc(guestRef, data);
}

