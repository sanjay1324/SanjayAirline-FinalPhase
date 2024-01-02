import axios from 'axios';
 
const axiosInstance = axios.create({
  baseURL: 'https://localhost:7285/api/', // Set your API base URL


  headers: {
    'Authorization': `Bearer ${sessionStorage.getItem('token')}`, // Get the token from localStorage
    'Content-Type': 'application/json',
  },
});
 
export default axiosInstance;