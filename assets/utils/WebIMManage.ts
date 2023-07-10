import { EasemobChat, EasemobChatStatic } from 'easemob-websdk';
import Event from './Event'
import * as api from '../api'

const config: EasemobChat.ConnectionParameters = {
    appKey: '', // 应用唯一标识
    autoReconnectNumMax: 5, // 最大重连次数，默认 5 次。
    delivery: true, // 是否开启已送达回执
    heartBeatWait: 30000,  // 心跳时间间隔（单位为毫秒）
    isDebug: true,
    isHttpDNS: true, // 是否启用 DNS。-（默认）true
    useOwnUploadFun: false, // 是否使用自己的上传函数，如想把图片、文件上传到自己的服务器
}

const roomCofig = {
    name: 'disco', // 聊天室名称
    description: '周五的蹦迪', // 聊天室描述
    maxusers: 100, // 聊天室成员最大数（包括聊天室创建者），默认值200，聊天室人数最大默认5000。
    members: [],
    token: ''
}

class WebIMManage extends Event {

    websdk: EasemobChatStatic = window.WebIM;
    connect:  EasemobChat.Connection = null;

    isLogin: boolean = false;
    token: string = '';
    userToken: string = '';
    user: string = '';
    roomId: string = '';

    initIM () {
        this.isLogin = false;
        this.connect = new this.websdk.connection(config);
        this.connect.addEventHandler('chatroomEvent', {
            onChatroomChange: this.onChatroomChange.bind(this),
            onCustomMessage: this.onCustomMessage.bind(this),
            onTextMessage: this.onTextMessage.bind(this),
        })
    }

    async sendCustomMsg(roomId, eventName, data) {
        let id = this.connect.getUniqueId();
        let msg = new this.websdk.message('custom', id);
        msg.set({
            to: roomId,
            customEvent: eventName,
            customExts: data,
            ext: {},
            chatType: 'chatRoom',
        });
        await this.connect.send(msg.body);
    }

    async sendTextMsg(roomId, text) {
        let id = this.connect.getUniqueId();
        let msg = new this.websdk.message('txt', id);
        msg.set({
            msg: text,
            to: roomId,
            chatType: 'chatRoom',
            ext: {},
        });
        await this.connect.send(msg.body);
    }

    async listChatRoomMember(roomId) {
        return await this.connect.listChatRoomMembers({
            pageNum: 1,
            pageSize: 100,
            chatRoomId: roomId
        })
    }

    async fetchUserInfoById(userIds, attrs) {
        return await this.connect.fetchUserInfoById(userIds, attrs);
    }

    async getDiscoRoom () {
        let { data: chatRooms } = await this.getChatRooms();
        if (!chatRooms.length) {
            // 获取管理token
            await this.getToken();
            // 授权用户为超管
            await this.addSuperAdmin(this.user);
            // 创建语音房
            let { id } = await this.createChatRoom();
            this.roomId = id;
        } else {
            let { id } = chatRooms[0];
            this.roomId = id;
        }
        return this.roomId
    }

    async joinChatRoom (roomId) {
        this.roomId = roomId;
        return await this.connect.joinChatRoom({roomId});
    }

    async getChatRooms () {
        return await this.connect.getChatRooms({pagenum: 1, pagesize: 20});
    }

    async createChatRoom () {
        roomCofig.token = this.userToken;
        let res = await this.connect.createChatRoom(roomCofig);
        this.roomId = res?.data.id;
        return res;
    }

    async addSuperAdmin(user) {
        return await api.superAdmin({superadmin: user});
    }

    // 进入页面注册&&登录，离开界面注销掉账号
    async registerUser (user) {
        return await this.connect.registerUser({
            username: user,
            nickname: user,
            password: '1',
        });
    }

    async loginUser (user) {
        this.user = user;
        this.isLogin = true;
        let res = await this.connect.open({pwd: '1', user});
        this.userToken = res?.accessToken;
        return res;
    }

    async getToken () {
        let res = await api.token({
            grant_type: 'client_credentials',
            client_id: '',
            client_secret: '',
            ttl: `${24 * 3600}`
        });
        this.token = res?.access_token;
        localStorage.setItem('discoToken', res?.access_token);
        return res;
    }

    async updateOwnUserInfo (options) {
        return await this.connect.updateOwnUserInfo(options)
    }

    onOpened () {
        this.emit('onOpened');
    }

    onError (error) {
        this.emit('onOpened', error)
    }

    onChatroomChange (msg) {
        switch (msg?.type) {
        case 'memberJoinChatRoomSuccess':
            // 监听其他人进房
            this.emit('memberJoinChatRoomSuccess', msg)
            break;
        case 'leaveChatRoom':
            // 监听其他人离开进房
            this.emit('leaveChatRoom', msg)
            break;
        }
    }

    onCustomMessage (msg) {
        switch (msg?.customEvent) {
        case 'createRole':
            // 监听创建角色
            this.emit('createRole', msg)
            break;
        case 'memberBecomeDJ':
            // 监听成为DJ
            this.emit('memberBecomeDJ', msg)
            break;
        case 'memberNoDJ':
            // 监听不是DJ
            this.emit('memberNoDJ', msg)
            break;
        case 'memberShowDJBtn':
            // 监听显示DJ按钮
            this.emit('memberShowDJBtn', msg)
            break;
        case 'memberSwitchAnimate':
            // 监听显示DJ按钮
            this.emit('memberSwitchAnimate', msg)
            break;
        case 'allMemberCarray':
            // 监听显示DJ按钮
            this.emit('allMemberCarray', msg)
            break;
        case 'changeCamera':
            // 监听显示DJ按钮
            this.emit('changeCamera', msg)
            break;
        case 'needAsyncMusic':
            // 监听显示DJ按钮
            this.emit('needAsyncMusic', msg)
            break;
        case 'asyncMusic':
            // 监听显示DJ按钮
            this.emit('asyncMusic', msg)
            break;
        case 'DJSwitchMusic':
            // 监听显示DJ按钮
            this.emit('DJSwitchMusic', msg)
            break;
        case 'sendChatAllMessage':
            // 监听显示DJ按钮
            this.emit('sendChatAllMessage', msg)
            break;
        case 'memberMovePos':
            // 监听显示DJ按钮
            this.emit('memberMovePos', msg)
            break;
        }
    }

    onTextMessage (msg) {
        this.emit('getMemberMessage', msg)
    }
}

export default new WebIMManage();
