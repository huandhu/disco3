
import { _decorator, Component, Node, AudioClip, AudioSource } from 'cc';
import WebIMManage from '../utils/WebIMManage'
const { ccclass, property } = _decorator;

@ccclass('AudioManager')
export class AudioManager extends Component {

  @property(AudioClip)
  DjAudio: AudioClip[] = [];
  @property(AudioClip)
  shotAudio: AudioClip = null!;

  audioComp: AudioSource = null!;
  playIndex: number = 0;

  time: any = null;
  asyncTime: any = null;
  cacheCurrentTime: number = 0;

  start() {
    this.audioComp = this.getComponent(AudioSource)!;
    WebIMManage.on('needAsyncMusic', this.needAsyncMusic, this)
    WebIMManage.on('asyncMusic', this.asyncMusic, this)
    WebIMManage.on('DJSwitchMusic', this.DJSwitchMusic, this)
    // 窗口在显示
    document.addEventListener('visibilitychange', async () => {
      let isHidden = document.hidden;
      let handle = async () => {
        if (WebIMManage.isLogin) await WebIMManage.sendCustomMsg(WebIMManage.roomId, 'needAsyncMusic', {});
        this.node.off(AudioSource.EventType.STARTED, handle, this);
      }
      if (!isHidden) {
        if(this.audioComp.playing){
          if (WebIMManage.isLogin) await WebIMManage.sendCustomMsg(WebIMManage.roomId, 'needAsyncMusic', {});
        } else {
          this.node.on(AudioSource.EventType.STARTED, handle, this);
        }
      } else {
        this.node.off(AudioSource.EventType.STARTED, handle, this);
      }
    });
  }

  DJSwitchMusic (msg) {
    let { playIndex } = msg.customExts;
    this.playIndex = playIndex;
    this.playSound();
  }

  async needAsyncMusic (msg) {
    let { from } = msg;
    let data = { from, playIndex: this.playIndex, currentTime: this.audioComp?.currentTime || 0 };
    await WebIMManage.sendCustomMsg(WebIMManage.roomId, 'asyncMusic', data);
  }

  asyncMusic (msg) {
    clearTimeout(this.time);
    clearTimeout(this.asyncTime);

    let { from, playIndex, currentTime } = msg.customExts;
    if (from === WebIMManage.user) {
      this.playIndex = playIndex;
      if (currentTime > this.cacheCurrentTime) this.cacheCurrentTime = currentTime;
      this.asyncTime = setTimeout(() => {
        this.playSound(this.cacheCurrentTime);
      }, 100)
    }
  }

  async autoPlayMusic () {
    let handle = async () => {
      if (WebIMManage.isLogin) await WebIMManage.sendCustomMsg(WebIMManage.roomId, 'needAsyncMusic', {});
      this.node.off(AudioSource.EventType.STARTED, handle, this);
    }
    this.node.on(AudioSource.EventType.STARTED, handle, this);
    this.playSound();
  }

  async switchMusic () {
    this.playIndex = this.playIndex + 1;
    this.playSound();
    await WebIMManage.sendCustomMsg(WebIMManage.roomId, 'DJSwitchMusic', { playIndex: this.playIndex });
  }

  playSound(currentTime = 0) {
    if(this.audioComp.playing){
      this.audioComp.stop();
    }
    let playIndex = this.playIndex % this.DjAudio.length;
    this.audioComp.clip = this.DjAudio[playIndex];
    this.audioComp.play();
    this.audioComp.currentTime = currentTime;
  }

  playClip() {
    this.audioComp.playOneShot(this.shotAudio);
  }
}

