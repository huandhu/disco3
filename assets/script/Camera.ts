
import { _decorator, Component, Node, Vec3, tween, Quat } from 'cc';
import WebIMManage from '../utils/WebIMManage'
const { ccclass, property } = _decorator;
 
@ccclass('Camera')
export class Camera extends Component {

   ringPosZ: number = 60;
   ringPosY: number = 6;
   ringRotX: number = -7;
   delay: number = 1;

    async start () {
        WebIMManage.on('changeCamera', this.changeCamera, this)
    }

    changeCamera (msg) {
        let { method } = msg.customExts;
        this[method](null, true);
    }

    initStart () {
        let move = tween()
            .target(this.node)
            .to(this.delay, { position: new Vec3(0, this.ringPosY, this.ringPosZ) });

        let  quat: Quat = new Quat();
        Quat.fromEuler(quat, this.ringRotX, 0, 0);
        let rotation = tween()
            .target(this.node)
            .to(this.delay, { rotation: quat });
        return tween(this.node).parallel(move, rotation);
    }

    async moveRing (event, isPush = false) {
        // 通知所有用户
        !isPush && await WebIMManage.sendCustomMsg(WebIMManage.roomId, 'changeCamera', { method: 'moveRing' });

        let start = this.initStart();

        let proRotation = tween()
            .target(this.node)
            .to(5, { rotation: Quat.fromEuler(new Quat(), this.ringRotX, 45, 0) })
            .to(5, { rotation: Quat.fromEuler(new Quat(), this.ringRotX, 0, 0) })
            .to(5, { rotation: Quat.fromEuler(new Quat(), this.ringRotX, -45, 0) })
            .to(5, { rotation: Quat.fromEuler(new Quat(), this.ringRotX, 0, 0) })
            .to(2, { rotation: Quat.fromEuler(new Quat(), 0, 0, 0) });

        let proMove = tween()
            .target(this.node)
            .to(5, { position: new Vec3(this.ringPosZ * 0.52, this.ringPosY, this.ringPosZ * 0.6) })
            .to(5, { position: new Vec3(0, this.ringPosY, this.ringPosZ ) })
            .to(5, { position: new Vec3(0 - this.ringPosZ * 0.52, this.ringPosY, this.ringPosZ * 0.6) })
            .to(5, { position: new Vec3(0, this.ringPosY, this.ringPosZ) })
            .to(2, { position: new Vec3(0, this.ringPosY, 50) })

        let end = tween(this.node).parallel(proMove, proRotation);

        tween(this.node).sequence(start, end).start();
    }

    async hightLowRing (event, isPush = false) {
        // 通知所有用户
        !isPush && await WebIMManage.sendCustomMsg(WebIMManage.roomId, 'changeCamera', { method: 'hightLowRing' });

        let start = this.initStart();

        let proRotation = tween()
            .target(this.node)
            .to(5, { rotation: Quat.fromEuler(new Quat(), -75, 0, 0) })
            .delay(5)
            .to(5, { rotation: Quat.fromEuler(new Quat(), 0, 0, 0) })
            .to(2, { rotation: Quat.fromEuler(new Quat(), 0, 0, 0) });

        let proMove = tween()
            .target(this.node)
            .to(5, { position: new Vec3(-8, 20, 22) })
            .to(5, { position: new Vec3(8, 20, 22) })
            .to(5, { position: new Vec3(0, this.ringPosY, this.ringPosZ) })
            .to(2, { position: new Vec3(0, this.ringPosY, 50) })

        let end = tween(this.node).parallel(proMove, proRotation);

        tween(this.node).sequence(start, end).start();
    }

    async leftRightRing (event, isPush = false) {
        console.log(">>>>>>>>>>>> leftRightRing", isPush)
        // 通知所有用户
        !isPush && await WebIMManage.sendCustomMsg(WebIMManage.roomId, 'changeCamera', { method: 'leftRightRing' });

        tween()
            .target(this.node)
            .to(1, { position: new Vec3(0, 6, 50) })
            .to(3, { position: new Vec3(-12, 6, 50) })
            .to(3, { position: new Vec3(0, 6, 50) })
            .to(3, { position: new Vec3(12, 6, 50) })
            .to(2, { position: new Vec3(0, this.ringPosY, 50) }).start();
    }
}

