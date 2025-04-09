import Cookies from 'js-cookie';

class CookieWrapper {
	protected cookies: { [key: string]: string };

	constructor() {
		this.cookies = Cookies.get();
	}

	get = (key: string) => {
		return this.cookies[key];
	};

	set = (key: string, value: string) => {
		Cookies.set(key, value, {
			expires: 30, // Max age in days
			path: '/', // Cookie path
			sameSite: 'strict', // SameSite attribute
		});
		this.cookies[key] = value;
		this.cookies = { ...this.cookies };
	};

	remove = (key: string) => {
		Cookies.remove(key);
		delete this.cookies[key];
		this.cookies = { ...this.cookies };
	};
}

const cookies = new CookieWrapper();
export default cookies;