import {io} from 'socket.io-client'

export const socket=io('http://192.168.56.1:5000',{
    withCredentials:true
});

