import axios from 'axios';

const http = axios.create({ baseURL: '/api' });
http.interceptors.response.use(
  (res) => res,
  (err) => {
    // 这里可以 toast 错误；先简单返回
    return Promise.reject(err);
  }
);
export default http;
