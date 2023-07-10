import { _decorator, Component, Node, Vec3, CameraComponent } from 'cc';
const { ccclass, property } = _decorator;
 
@ccclass('Player')
export class Player extends Component {

    @property(CameraComponent)
    camera: CameraComponent = null;

    @property(Node)
    message: Node = null;
    @property(Node)
    msgPosNode: Node = null;

    // update () {
    //     let worldPos = new Vec3(0, 0, 0);
    //     this.msgPosNode.getWorldPosition(worldPos);
    //     this.camera.convertToUINode(worldPos, this.message.parent, worldPos);
    //     this.message.setPosition(worldPos);
    // }
}
