import axios from './axios'

// 超级管理员
export const superAdmin = (data) => {
    return axios.post(`/chatrooms/super_admin`, data);
};
export const token = (data) => {
    return axios.post(`/token`, data);
};