export function getCurrentUser() {
	const raw = localStorage.getItem("auth_user");
	return raw ? JSON.parse(raw) : null;
}

export function logout() {
	localStorage.removeItem("auth_user");
	location.reload();
}
