const isNode = typeof window === 'undefined';
const windowObj = isNode ? { localStorage: new Map() } : window;
const storage = windowObj.localStorage;

const getUrlParam = (paramName) => {
	if (isNode) {
		return null;
	}
	const urlParams = new URLSearchParams(window.location.search);
	return urlParams.get(paramName);
}

const getAppParams = () => {
	const token = getUrlParam("access_token");
	if (token) {
		storage.setItem('token', token);
	}
	
	const clearToken = getUrlParam("clear_access_token");
	if (clearToken === 'true') {
		storage.removeItem('token');
	}
	
	return {
		token: token || storage.getItem('token'),
	}
}

export const appParams = {
	...getAppParams()
}
