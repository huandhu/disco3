
import { _decorator, Component, Node, macro } from 'cc';
import WebIMManage from '../utils/WebIMManage'
import { Box } from './Box'
import { AudioManager } from './audioManager'
const { ccclass, property } = _decorator;
 
@ccclass('Game')
export class Game extends Component {

    @property(Box)
    box: Box = null;
    @property(AudioManager)
    audioManager: AudioManager = null;

    userName: string = ''; // 用户名称
    roomId: string = ''; // 语音房id

    async start () {
        WebIMManage.initIM();
        this.initGame();
    }

    // 初始化用户信息及语音房，先在环信上新建该用户，点击新建角色后再新建dome
    async initGame () {
        try {
            this.userName = this.createUserName();
            // 注册用户
            await WebIMManage.registerUser(this.userName);
            // 登录用户
            await WebIMManage.loginUser(this.userName);
            // 获取所有聊天室
            let { data: chatRooms } = await WebIMManage.getChatRooms();
            if(!chatRooms.length) {
                // 新建机器人信息
                await this.box.creatRobotInfo();
                // 获取管理token
                await WebIMManage.getToken();
                // 授权用户为超管
                await WebIMManage.addSuperAdmin(this.userName);
                // 创建语音房
                let { data: { id } } = await WebIMManage.createChatRoom();
                this.roomId = id;
            } else {
                let { id } = chatRooms[0];
                this.roomId = id;
                // 加入语音房
                await WebIMManage.joinChatRoom(this.roomId);
            }
            // ws 初始化有延时
            setTimeout(async () => {
                await this.audioManager.autoPlayMusic();
            }, 1000)
            // 新建舞池用户
            await this.box.initDance(this.userName, this.roomId);
        } catch (error) {
            console.log('初始化失败', error);
        }
    }
  
    // 生成用户名称
    createUserName () {
        let time = Date.now();
        return `user${time}`
    }
}

