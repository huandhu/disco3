
import WebIMManage from '../utils/WebIMManage'
import { _decorator, Component, Node, Prefab, instantiate, Vec3, CameraComponent, Label, EditBox, MeshRenderer, Texture2D, Animation } from 'cc';
const { ccclass, property } = _decorator;
 
@ccclass('Box')
export class Box extends Component {

    @property(Node)
    Start: Node = null;
    @property(Node)
    Main: Node = null;
    @property(Node)
    DjBtns: Node = null;
    @property(Node)
    DjSendAllBtn: Node = null;
    @property(Node)
    Camera: Node = null;
    @property(Prefab)
    Player: Prefab = null!;
    @property(Prefab)
    MsgBox: Prefab = null!;
    @property(Prefab)
    Name: Prefab = null!;
    @property(Node)
    Canvas: Node = null!;
    @property(EditBox)
    NameInput: EditBox = null!;
    @property(EditBox)
    sendInput: EditBox = null!;
    @property(Texture2D)
    RoleImgs: Texture2D[] = [];
    @property(Node)
    DJBtn: Node = null!;
    @property(Node)
    Fire01: Node = null!;
    @property(Node)
    Fire02: Node = null!;
    @property(Node)
    DJLight01: Node = null!;
    @property(Node)
    DJLight02: Node = null!;

    userNode: Node = null;
    animateList: any[] = ['standing', 'forward', 'moving', 'rotating']
    playerMap: any = {};
    robotNames: string[] = [
        '拉闸队',
        'GE战队',
        '呼唤星期五的频率...',
        '不会街舞的开发不是好产品',
        '少年先疯队',
        '唱响队',
        '有多少人工，就有多少智能',
        '读书破万卷',
        '趣丸宇宙',
        'NULL',
        'HP',
        '暂定队',
        '你说的对',
        '人工智障老六',
        '打不过就加入别的队',
        '河东三十年',
        '一大队',
        '老板，我想上班',
    ];

    roomId: string = ''; // 语音房id
    userName: string = '';
    DJName: string = '';
    CarrayMsg: string = '让我看到你们的双手!!!';
    userConfig: any = {};

    robotNum: number = 20;

    maxPosX: number = 15;
    minPosX: number = -15;
    maxLimitX: number = 4;
    minLimitX: number = -4;

    maxPosZ1: number = 18;
    minPosZ1: number = 14;

    maxPosZ2: number = 18;
    minPosZ2: number = 4;

    DJPosX: number = 0;
    DJPosY: number = 2.5;
    DJPosZ: number = 9;

    defaultMsgList: string[] = ['蹦蹦蹦！','在该蹦迪的年纪，千万不要保温杯里泡枸杞','谁说夜晚是悲伤的时候，也可以是蹦迪的时候','Weeeeeeee!!','yay!!!!!!','Drop the beat','Make some noise','CHECK IT OUT']

    start () {
        WebIMManage.on('createRole', this.createRole, this)
        WebIMManage.on('getMemberMessage', this.getMemberMessage, this)
        WebIMManage.on('memberBecomeDJ', this.memberBecomeDJ, this)
        WebIMManage.on('memberNoDJ', this.memberNoDJ, this)
        WebIMManage.on('memberShowDJBtn', this.memberShowDJBtn, this)
        WebIMManage.on('memberSwitchAnimate', this.memberSwitchAnimate, this)
        WebIMManage.on('allMemberCarray', this.allMemberCarray, this)
        WebIMManage.on('sendChatAllMessage', this.sendChatAllMessage, this)
        WebIMManage.on('leaveChatRoom', this.leaveChatRoom, this)

        // 窗口在显示
        document.addEventListener('visibilitychange', async () => {
            let isHidden = document.hidden;
            if (!isHidden && WebIMManage.isLogin) {
                let arr = await this.getPlayerArr(this.userName, this.roomId);
                for (const key in this.playerMap) {
                    let player = this.playerMap[key];
                    let config = arr.find(u => u?.user === key || u?.nickname === key)
                    if (player && !config) {
                        player.destroy();
                    }
                    if (player && config) {
                        let { x, y, z, user } = config;
                        if (user === this.DJName) {
                            player.setPosition(new Vec3(this.DJPosX, this.DJPosY, this.DJPosZ));
                        } else {
                            player.setPosition(new Vec3(x, y, z));
                        }
                    }
                }
            }
        });
    }

    update () {
        for (const key in this.playerMap) {
            let player = this.playerMap[key];
            this.createName(player, player.nameNode);
            if (player.messageNode) this.updateMsg(player, player.messageNode);
        }
    }

    leaveChatRoom (msg) {
        let { from } = msg;
        let player = this.playerMap[from];
        player.nameNode.destroy();
        player.destroy();
        delete this.playerMap[from];
    }

    getMemberMessage (msg) {
        let {msg: text, from} = msg;
        let player = this.playerMap[from]
        player && this.createMsg(player, text);
    }

    async createRole (msg) {
        let { from } = msg;
        let { data = {} } = await WebIMManage.fetchUserInfoById([from], ['nickname', 'ext']);
        let info = data[from] || {};
        let extJson = info.ext ? JSON.parse(info.ext) : {};
        let player = this.createPlayer(extJson.config);
        this.playerMap[from] = player;
    }

    async allCarray () {
        for (let user in this.playerMap) {
            let player = this.playerMap[user];
            player && this.createMsg(player, this.CarrayMsg);
        }
        this.Fire01.active = true;
        this.Fire02.active = true;
        setTimeout(() => {
            this.Fire01.active = false;
            this.Fire02.active = false;
        }, 4e3)
        // 通知所有用户
        await WebIMManage.sendCustomMsg(this.roomId, 'allMemberCarray', {});
    }

    allMemberCarray () {
        for (let user in this.playerMap) {
            let player = this.playerMap[user];
            player && this.createMsg(player, this.CarrayMsg);
        }
        this.Fire01.active = true;
        this.Fire02.active = true;
        setTimeout(() => {
            this.Fire01.active = false;
            this.Fire02.active = false;
        }, 4e3)
    }

    async switchAnimate () {
        let { animateId = 0 } = this.userConfig?.config;
        animateId = (animateId + 1) % this.animateList.length;
        this.userConfig.config.animateId = animateId;
        await WebIMManage.updateOwnUserInfo({ext: JSON.stringify(this.userConfig)});
        // 通知所有用户
        await WebIMManage.sendCustomMsg(this.roomId, 'memberSwitchAnimate', { user: this.userName, animateId });

        let box = this.userNode.getChildByName('Box');
        let animateName = this.animateList[animateId];
        let animate = box.getComponent(Animation);
        animate.on(Animation.EventType.LASTFRAME, () => { animate.play(animateName) })
    }

    memberSwitchAnimate (msg) {
        let { user, animateId } = msg.customExts;
        let player = this.playerMap[user];
        let box = player.getChildByName('Box');
        let animateName = this.animateList[animateId];
        let animate = box.getComponent(Animation);
        animate.on(Animation.EventType.LASTFRAME, () => { animate.play(animateName) })
    }

    async memberBecomeDJ(msg) {
        // 隐藏 成为DJ 按钮
        this.DJBtn.active = false;
        let { from } = msg;
        this.DJName = from;
        // 同步新DJ位置
        let player = this.playerMap[from];
        player.setPosition(new Vec3(this.DJPosX, this.DJPosY, this.DJPosZ));
        // 出现聚光灯
        this.DJLight01.active = true;
        this.DJLight02.active = true;
        this.Fire01.active = true;
        this.Fire02.active = true;
        setTimeout(() => {
            this.DJLight01.active = false;
            this.DJLight02.active = false;
            this.Fire01.active = false;
            this.Fire02.active = false;
        }, 3 * 1e3)
    }

    async memberNoDJ (msg) {
        let { DJName } = msg.customExts;
        let oldDJ = this.playerMap[DJName];
        let { x, y, z } = oldDJ.nodeConfig;
        oldDJ.setPosition(new Vec3(x, y, z));
        if (this.userName === DJName) {
            this.userConfig = {
                ...this.userConfig,
                isDJ: false,
            };
            this.DjSendAllBtn.active = false;
            this.DjBtns.active = false;
            await WebIMManage.updateOwnUserInfo({ext: JSON.stringify(this.userConfig)});
        }
    }

    memberShowDJBtn (msg) {
        this.DJBtn.active = true;
    }

    // 成为DJ
    async becomeDJ () {
        if(this.DJName === this.userName) return;
        this.userConfig = {
            ...this.userConfig,
            isDJ: true,
            DJTime: Date.now(),
        };
        this.DJBtn.active = false;
        this.DjBtns.active = true;
        this.DjSendAllBtn.active = true;
        // 更新用户信息
        await WebIMManage.updateOwnUserInfo({ext: JSON.stringify(this.userConfig)});
        // 通知所有用户
        await WebIMManage.sendCustomMsg(this.roomId, 'memberBecomeDJ', this.userConfig);
        // 上一个DJ, 回到原先的位置
        if (this.DJName) {
            let oldDJ = this.playerMap[this.DJName];
            let { x, y, z } = oldDJ.nodeConfig;
            oldDJ.setPosition(new Vec3(x, y, z));
            await WebIMManage.sendCustomMsg(this.roomId, 'memberNoDJ', { DJName: this.DJName });
        }
        this.DJName = this.userName;
        // 当前用户移动到DJ台
        this.userNode.setPosition(new Vec3(this.DJPosX, this.DJPosY, this.DJPosZ));
        setTimeout(async () => {
            await WebIMManage.sendCustomMsg(this.roomId, 'memberShowDJBtn', {});
        }, 10 * 1e3);
        // DJ 本人延时显示DJ按钮
        setTimeout(async () => {
            this.DJBtn.active = true;
        }, 10 * 1e3 + 5 * 1e3);
        // 出现聚光灯
        this.DJLight01.active = true;
        this.DJLight02.active = true;
        this.Fire01.active = true;
        this.Fire02.active = true;
        setTimeout(() => {
            this.DJLight01.active = false;
            this.DJLight02.active = false;
            this.Fire01.active = false;
            this.Fire02.active = false;
        }, 3 * 1e3)
    }

    async initDance (userName, roomId) {
        let arr = await this.getPlayerArr(userName, roomId);
        arr.forEach(u => {
            let player = this.createPlayer(u);
            this.playerMap[u?.user || u?.nickname] = player;
        });
    }

    async getPlayerArr (userName, roomId) {
        this.roomId = roomId;
        this.userName = userName;
        let { data: users } = await WebIMManage.listChatRoomMember(roomId);
        let members: any[] = users
        users = members.map(u => u?.member || u?.owner);

        let { data = {} } = await WebIMManage.fetchUserInfoById(users, ['nickname', 'ext']);
        let arr = [];
        let cacheDj = null;
        for(let user in data) {
            let info = data[user] || {};
            let extJson = info.ext ? JSON.parse(info.ext) : {};
            // 获取当前DJ
            if (extJson.isDJ) {
                // 处理用户离线导致用户不是DJ的信息没有更新到的问题
                if (!cacheDj || cacheDj.DJTime < extJson.DJTime) {
                    this.DJName = user;
                    cacheDj = extJson;
                }
            }
            this.userConfig = userName === user ? extJson : {};
            let { robots = [], config = null } = extJson;
            arr = arr.concat(robots);
            if (config) {
                config.user = user;
                arr.push(config);
            }
        }
        // 排序
        arr = arr.sort((u1, u2) =>  u1.z - u2.z);
        return arr;
    }

    async createUserPlayer() {
        let nickname = this.NameInput.string;
        if (nickname) {
            // 更新到用户信息里
            let config = this.createPlayerInfo(nickname);
            let info = { isOwner: false, config, ...this.userConfig }
            this.userConfig = info;
            await WebIMManage.updateOwnUserInfo({ext: JSON.stringify(info)});
            // 发送自定义消息
            await WebIMManage.sendCustomMsg(this.roomId, 'createRole', info);
            this.userNode = this.createPlayer(config);
            this.playerMap[this.userName] = this.userNode;

            this.Start.active = false;
            this.Main.active = true;
        }
    }

    async sendMessage () {
        let msg = this.sendInput.string;
        if(!msg) msg = this.defaultMsgList[this.createRandom(0, this.defaultMsgList.length - 1)];
        await WebIMManage.sendTextMsg(this.roomId, msg);
        this.createMsg(this.userNode, msg);
        this.sendInput.string = '';
    }

    async sendAllMessage () {
        let msg = this.sendInput.string;
        if (msg) {
            for (let user in this.playerMap) {
                let player = this.playerMap[user];
                player && this.createMsg(player, msg);
            }
            // 通知所有用户
            await WebIMManage.sendCustomMsg(this.roomId, 'sendChatAllMessage', { text: msg });
            this.sendInput.string = '';
        }
    }

    sendChatAllMessage (msg) {
        let { text } = msg.customExts;
        for (let user in this.playerMap) {
            let player = this.playerMap[user];
            player && this.createMsg(player, text);
        }
    }

    createPlayer(config) {
        let {x, z, y = 0.5, nickname, roleId, user, animateId } = config;
        let player: any = instantiate(this.Player);
        let box = player.getChildByName('Box');
        let body: Node = box.getChildByName('Body');
        let target:MeshRenderer = body.getComponent(MeshRenderer);
        player.nodeConfig = config;
        target.material.setProperty('mainTexture', this.RoleImgs[roleId]);

        this.node.addChild(player);
        if (user === this.DJName) {
            player.setPosition(new Vec3(this.DJPosX, this.DJPosY, this.DJPosZ));
        } else {
            player.setPosition(new Vec3(x, y, z));
        }
        let animateName = this.animateList[animateId];
        box.getComponent(Animation).play(animateName);

        let name: any = instantiate(this.Name);
        this.Canvas.addChild(name);
        name.getComponent(Label).string = nickname;
        player.nameNode = name;
        return player;
    }

    createName (player: Node, nameNode:Node) {
        let worldPos = new Vec3(0, 0, 0);
        player.getChildByName('Box').getChildByName('Name').getWorldPosition(worldPos);
        this.Camera.getComponent(CameraComponent).convertToUINode(worldPos, this.Canvas, worldPos);
        nameNode.setPosition(worldPos);
    }

    createMsg (player: any, text) {
        if (player.messageNode) {
            player.messageNode.destroy();
        }
        let message: any = instantiate(this.MsgBox);
        message.getChildByName('Text').getComponent(Label).string = text;
        this.Canvas.addChild(message);
        player.messageNode = message;
        setTimeout(() => {
            message.destroy();
            player.messageNode = null;
        }, 5 * 1e3);
    }

    updateMsg (player: Node, messageNode: Node) {
        let worldPos = new Vec3(0, 0, 0);
        player.getChildByName('Box').getChildByName('Msg').getWorldPosition(worldPos);
        this.Camera.getComponent(CameraComponent).convertToUINode(worldPos, this.Canvas, worldPos);
        messageNode.setPosition(worldPos);
    }

    async creatRobotInfo () {
        let arr = []
        for(let i = 0; i < this.robotNames.length; i++) {
            // arr.push(this.createPlayerInfo(`robot${i}`));
            arr.push(this.createPlayerInfo(this.robotNames[i]));
        }
        // 更新到用户信息里
        let config = { isOwner: true, robots: arr }
        await WebIMManage.updateOwnUserInfo({ext: JSON.stringify(config)});
    }

    createPlayerInfo (nickname) {
        let config: any = {};
        config.x = this.createRandom(this.maxPosX, this.minPosX) ;
        if (config.x > this.minLimitX && config.x < this.maxLimitX) {
            config.z = this.createRandom(this.maxPosZ1, this.minPosZ1);
        } else {
            config.z = this.createRandom(this.maxPosZ2, this.minPosZ2);
        }
        config.y = 0.5;
        config.nickname = nickname;
        config.roleId = this.createRandom(this.RoleImgs.length - 1, 0);
        config.animateId = this.createRandom(this.animateList.length - 1, 0);
        return config;
    }

    // 生成区间随机数
    createRandom (max, min) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}