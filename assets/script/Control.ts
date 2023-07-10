
import { _decorator, Component, Node, Vec3, Vec2, CameraComponent, tween } from 'cc';
const { ccclass, property } = _decorator;
import { Box } from './Box'
import WebIMManage from '../utils/WebIMManage'


@ccclass('Control')
export class Control extends Component {

    @property(Box)
    box: Box = null;
    @property(Node)
    Camera: Node = null;

    @property(Node)
    LeftNode: Node = null;
    @property(Node)
    RightNode: Node = null;
    @property(Node)
    TopNode: Node = null;
    @property(Node)
    BottomNode: Node = null;

    step: number = 0.2;
    btnName: string = '';
    touchFlag: boolean = false;
    touchStartTime: Date = null;
    lockMove:boolean = false;
    
    start () {
        WebIMManage.on('memberMovePos', this.memberMovePos, this);
        //添加按钮触摸监听 长按弹托管弹窗列表
        this.LeftNode.on(Node.EventType.TOUCH_START, this.touchStart, this);
        this.RightNode.on(Node.EventType.TOUCH_START, this.touchStart, this);
        this.TopNode.on(Node.EventType.TOUCH_START, this.touchStart, this);
        this.BottomNode.on(Node.EventType.TOUCH_START, this.touchStart, this);
        this.LeftNode.on(Node.EventType.TOUCH_END, this.touchEnd, this);
        this.RightNode.on(Node.EventType.TOUCH_END, this.touchEnd, this);
        this.TopNode.on(Node.EventType.TOUCH_END, this.touchEnd, this);
        this.BottomNode.on(Node.EventType.TOUCH_END, this.touchEnd, this);
    }

    memberMovePos (msg) {
        let { from } = msg;
        let { x, y, z, delay } = msg.customExts;
        let player = this.box.playerMap[from];
        let move = tween()
            .target(player)
            .to(delay / 1e3, { position: new Vec3(x, y, z) });
        move.start();
    }

    userMovePos () {
        let { x, y, z } = this.box.userNode.position;
        if (this.btnName === 'LeftBtn') {
            x -= this.step;
        }
        if (this.btnName === 'RightBtn') {
            x += this.step;
        }
        if (this.btnName === 'TopBtn') {
            z -= this.step;
        }
        if (this.btnName === 'BottomBtn') {
            z += this.step;
        }
        this.box.userNode.setPosition(new Vec3(x, y, z));
    }

    touchStart(e) {
        let { name } = e.target
        this.btnName = name;
        this.touchFlag = true;
        this.touchStartTime = new Date();
    }

    async touchEnd(e) {
        let delay = new Date().getTime() - this.touchStartTime.getTime();
        this.touchFlag = false;
        this.touchStartTime = null;
        // 更新用户信息
        let { x, y, z } = this.box.userNode.position;
        this.box.userConfig.config = { ... this.box.userConfig.config, x, y, z};
        await WebIMManage.updateOwnUserInfo({ext: JSON.stringify(this.box.userConfig)});
        // 通知所有用户
        await WebIMManage.sendCustomMsg(this.box.roomId, 'memberMovePos', { x, y, z, delay });
    }

    //长按检测函数
    touchHold(){
        if(this.touchFlag && this.touchStartTime != null){
            let touchHoldTime = new Date();
            let milliseconds = touchHoldTime.getTime() - this.touchStartTime.getTime();
            if(milliseconds > 300){
                this.userMovePos();
            }
        }
    }

    update (dt) {
        if(this.touchFlag){
            this.touchHold();
        }
    }
}

