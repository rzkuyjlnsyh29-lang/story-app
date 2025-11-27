// src/scripts/utils/auth.js
class Auth {
    static getToken() {
      return localStorage.getItem('token');
    }
  
    static setToken(token) {
      localStorage.setItem('token', token);
    }
  
    static removeToken() {
      localStorage.removeItem('token');
    }
  
    static isLoggedIn() {
      return !!this.getToken();
    }
  
    static getUserData() {
      const userData = localStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    }
  
    static setUserData(userData) {
      localStorage.setItem('userData', JSON.stringify(userData));
    }
  
    static logout() {
      this.removeToken();
      localStorage.removeItem('userData');
    }
  }
  
  export default Auth;