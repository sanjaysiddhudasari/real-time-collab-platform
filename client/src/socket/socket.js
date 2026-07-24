import {io} from 'socket.io-client'

export const socket=io(`https://${window.location.hostname}:5000`,{
    withCredentials:true,
    autoConnect:false,
    reconnection:true,
    reconnectionAttempts:5,
    reconnectionDelay:1000,
});
