import { reactive } from 'vue'
import musicURL from './assets/audio/music.mp3'
import hitSfxURL from './assets/audio/slash.wav'
import unlockSfxURL from './assets/audio/unlock.wav'

export enum UpgradeType {
  DamagePerClick = 'damagePerClick',
  DamagePerSecond = 'damagePerSecond',
}

export interface Upgrade {
  name: string
  price: number
  value: number
  type: UpgradeType
  icon: string
}

export const UPGRADES: Upgrade[] = [
  {
    name: 'Poignard',
    price: 20,
    value: 1,
    type: UpgradeType.DamagePerClick,
    icon: 'knife',
  },
  {
    name: 'Slime',
    price: 80,
    value: 2,
    type: UpgradeType.DamagePerSecond,
    icon: 'slime',
  },
  {
    name: 'Araignée',
    price: 500,
    value: 8,
    type: UpgradeType.DamagePerSecond,
    icon: 'web',
  },
  {
    name: 'Balai magique',
    price: 4000,
    value: 50,
    type: UpgradeType.DamagePerSecond,
    icon: 'broomstick',
  },
  {
    name: 'Hache',
    price: 10000,
    value: 300,
    type: UpgradeType.DamagePerClick,
    icon: 'axe',
  },
  {
    name: 'Chauve-souris',
    price: 60000,
    value: 1200,
    type: UpgradeType.DamagePerSecond,
    icon: 'bat',
  },
  {
    name: 'Fantôme',
    price: 250000,
    value: 5000,
    type: UpgradeType.DamagePerSecond,
    icon: 'ghost',
  },
  {
    name: 'Zombie',
    price: 800000,
    value: 25000,
    type: UpgradeType.DamagePerSecond,
    icon: 'zombie',
  },
  {
    name: 'Épée',
    price: 2000000,
    value: 75000,
    type: UpgradeType.DamagePerClick,
    icon: 'sword',
  },
  {
    name: 'Sorcière',
    price: 5000000,
    value: 150000,
    type: UpgradeType.DamagePerSecond,
    icon: 'witch',
  },
  {
    name: 'Squelette',
    price: 20000000,
    value: 700000,
    type: UpgradeType.DamagePerSecond,
    icon: 'skull',
  },
  {
    name: 'Chaudron',
    price: 80000000,
    value: 3000000,
    type: UpgradeType.DamagePerSecond,
    icon: 'cauldron',
  },
  {
    name: 'Flèche',
    price: 200000000,
    value: 12000000,
    type: UpgradeType.DamagePerClick,
    icon: 'arrow',
  },
  {
    name: 'Sac magique',
    price: 500000000,
    value: 50000000,
    type: UpgradeType.DamagePerSecond,
    icon: 'bag',
  },
  {
    name: 'Coffre maudit',
    price: 2000000000,
    value: 200000000,
    type: UpgradeType.DamagePerSecond,
    icon: 'chest',
  },
  {
    name: 'Patte de singe',
    price: 8000000000,
    value: 800000000,
    type: UpgradeType.DamagePerSecond,
    icon: 'paw',
  },
  {
    name: 'Shuriken',
    price: 20000000000,
    value: 4000000000,
    type: UpgradeType.DamagePerClick,
    icon: 'shuriken',
  },
  {
    name: 'Cercueil',
    price: 100000000000,
    value: 20000000000,
    type: UpgradeType.DamagePerSecond,
    icon: 'coffin',
  },
  {
    name: 'Démon citrouille',
    price: 500000000000,
    value: 100000000000,
    type: UpgradeType.DamagePerSecond,
    icon: 'demon',
  },
]

import { Howl } from 'howler'

const music = new Howl({
  src: [musicURL],
  autoplay: true,
  loop: true,
})

const sfx = new Howl({
  src: [hitSfxURL],
  sprite: {
    slash1: [0, 500],
    slash2: [1700, 500],
  },
})
sfx.volume(0.2)

const unlock = new Howl({
  src: [unlockSfxURL],
})
unlock.volume(0.2)

export const store = reactive({
  count: 0,
  damagePerClick: 1,
  damagePerSecond: 0,
  isShopOpened: false,
  mute: false,
  upgrades: Array(UPGRADES.length).fill(0),
  slash() {
    if (this.mute) return
    sfx.play(`slash${Math.floor(Math.random() * 2) + 1}`)
  },
  toggleMute() {
    this.mute = !this.mute
    if (this.mute) {
      music.pause()
    } else {
      music.play()
    }
  },
  toggleShop() {
    this.isShopOpened = !this.isShopOpened
  },
  hit() {
    this.count += this.damagePerClick
    this.slash()
  },
  buy(upgrade: Upgrade, num: number) {
    let totalCost = 0;
    let currentPrice = upgrade.price;
    for (let i = 0; i < num; i++) {
      totalCost += currentPrice;
      currentPrice = Math.floor(currentPrice * 1.35);
    }
  
    if (this.count < totalCost) return;
  
    this.count -= totalCost;
    unlock.play();
  
    if (upgrade.type === UpgradeType.DamagePerClick) {
      this.damagePerClick += upgrade.value * num;
    } else {
      if (this.damagePerSecond === 0) {
        this.startTimer();
      }
      this.damagePerSecond += upgrade.value * num;
    }
  
    upgrade.price = currentPrice;
  
    const index = UPGRADES.findIndex(({ name }) => name === upgrade.name);
    this.upgrades[index] += num;
  
    this.saveData();
  },
  autoHit() {
    this.count += this.damagePerSecond
  },
  saveData() {
    localStorage.setItem(
      'clickerData',
      JSON.stringify({
        count: this.count,
        damagePerClick: this.damagePerClick,
        damagePerSecond: this.damagePerSecond,
        upgrades: this.upgrades,
      })
    )
  },
  loadData() {
    const dataString = localStorage.getItem('clickerData')
    if (dataString) {
      const data = JSON.parse(dataString)
      this.count = data.count || 0
      this.damagePerClick = data.damagePerClick || 1
      this.damagePerSecond = data.damagePerSecond || 0
      this.upgrades = data.upgrades || Array(UPGRADES.length).fill(0)

      if (this.damagePerSecond > 0) {
        this.startTimer()
      }
    }
  },
  startTimer() {
    const intervaId = setInterval(() => {
      this.autoHit()
    }, 1000)

    setTimeout(() => {
      clearInterval(intervaId)
    }, 1000 * 60 * 60 * 10)
  },
})
