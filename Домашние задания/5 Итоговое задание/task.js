class Weapon {
  constructor(name, attack, durability, range) {
    this.name = name;
    this.attack = attack;
    this.durability = durability;
    this.range = range;
    this.initDurability = durability;
  }

  takeDamage(damage) {
    if (damage <= 0) {
      return;
    }

    if (this.durability === Infinity) {
      return;
    }

    this.durability -= damage;

    if (this.durability < 0) {
      this.durability = 0;
    }
  }

  getDamage() {
    if (this.isBroken()) {
      return 0;
    }

    if (this.durability === Infinity) {
      return this.attack;
    }

    const durabilityRatio = this.durability / this.initDurability;

    if (durabilityRatio >= 0.3) {
      return this.attack;
    }

    return this.attack / 2;
  }

  isBroken() {
    return this.durability === 0;
  }
}

class Arm extends Weapon {
  constructor() {
    super('Рука', 1, Infinity, 1);
  }
}

class Bow extends Weapon {
  constructor() {
    super('Лук', 10, 200, 3);
  }
}

class Sword extends Weapon {
  constructor() {
    super('Меч', 25, 500, 1);
  }
}

class Knife extends Weapon {
  constructor() {
    super('Нож', 5, 300, 1);
  }
}

class Staff extends Weapon {
  constructor() {
    super('Посох', 8, 300, 2);
  }
}

class LongBow extends Bow {
  constructor() {
    super();
    this.name = 'Длинный лук';
    this.attack = 15;
    this.range = 4;
  }
}

class Axe extends Sword {
  constructor() {
    super();
    this.name = 'Секира';
    this.attack = 27;
    this.durability = 800;
    this.initDurability = 800;
  }
}

class StormStaff extends Staff {
  constructor() {
    super();
    this.name = 'Посох Бури';
    this.attack = 10;
    this.range = 3;
  }
}

class Player {
  constructor(position, name) {
    this.life = 100;
    this.magic = 20;
    this.speed = 1;
    this.attack = 10;
    this.agility = 5;
    this.luck = 10;
    this.description = 'Игрок';
    this.weapon = new Arm();
    this.weaponOrder = [Arm];
    this.position = typeof position === 'number' ? position : 0;
    this.name = name || 'Игрок';
    this.maxLife = this.life;
    this.maxMagic = this.magic;
  }

  getLuck() {
    const randomNumber = Math.random() * 100;

    return (randomNumber + this.luck) / 100;
  }

  getDamage(distance) {
    if (distance <= 0) {
      return 0;
    }

    if (!this.weapon || distance > this.weapon.range) {
      return 0;
    }

    const weaponDamage = this.weapon.getDamage();
    const totalAttack = this.attack + weaponDamage;

    return (totalAttack * this.getLuck()) / distance;
  }

  takeDamage(damage) {
    if (damage <= 0) {
      return;
    }

    this.life -= damage;

    if (this.life < 0) {
      this.life = 0;
    }

    this.log(`получает ${damage.toFixed(2)} урона. Здоровье: ${this.life.toFixed(2)}`);
  }

  isDead() {
    return this.life === 0;
  }

  moveLeft(distance) {
    if (this.isDead()) {
      return this.position;
    }

    const shift = Math.min(Math.abs(distance), this.speed);

    if (!shift) {
      return this.position;
    }

    this.position -= shift;
    this.log(`сместился влево на ${shift}. Позиция: ${this.position}`);

    return this.position;
  }

  moveRight(distance) {
    if (this.isDead()) {
      return this.position;
    }

    const shift = Math.min(Math.abs(distance), this.speed);

    if (!shift) {
      return this.position;
    }

    this.position += shift;
    this.log(`сместился вправо на ${shift}. Позиция: ${this.position}`);

    return this.position;
  }

  move(distance) {
    if (distance < 0) {
      return this.moveLeft(-distance);
    }

    if (distance > 0) {
      return this.moveRight(distance);
    }

    return this.position;
  }

  isAttackBlocked() {
    const threshold = (100 - this.luck) / 100;
    const blocked = this.getLuck() > threshold;

    if (blocked) {
      this.log('блокирует атаку');
    }

    return blocked;
  }

  dodged() {
    const threshold = (100 - this.agility - this.speed * 3) / 100;
    const dodged = this.getLuck() > threshold;

    if (dodged) {
      this.log('уклоняется от удара');
    }

    return dodged;
  }

  takeAttack(damage) {
    if (damage <= 0 || this.isDead()) {
      return;
    }

    if (this.weapon && this.isAttackBlocked()) {
      this.weapon.takeDamage(damage);
      this.checkWeapon();
      return;
    }

    if (this.dodged()) {
      return;
    }

    this.takeDamage(damage);
  }

  checkWeapon() {
    if (!this.weapon) {
      this.weapon = new Arm();
    }

    if (!this.weapon.isBroken()) {
      return;
    }

    const order = this.weaponOrder || [Arm];
    const currentIndex = order.findIndex(
      (WeaponClass) => this.weapon instanceof WeaponClass
    );
    const nextIndex = currentIndex === -1 ? 0 : currentIndex + 1;

    if (nextIndex < order.length) {
      const NextWeapon = order[nextIndex];
      this.weapon = new NextWeapon();
    } else {
      this.weapon = new Arm();
    }

    this.log(`берёт новое оружие: ${this.weapon.name}`);
  }

  tryAttack(enemy) {
    if (!enemy || enemy === this || this.isDead() || enemy.isDead()) {
      return;
    }

    if (!this.weapon) {
      this.weapon = new Arm();
    }

    const rawDistance = Math.abs(this.position - enemy.position);

    if (rawDistance > this.weapon.range) {
      this.log(`не достаёт до ${enemy.description} ${enemy.name}`);
      return;
    }

    const wear = 10 * this.getLuck();
    this.weapon.takeDamage(wear);
    this.checkWeapon();

    const damageDistance = rawDistance === 0 ? 1 : rawDistance;
    let damage = this.getDamage(damageDistance);

    if (damage <= 0) {
      this.log(`атакует ${enemy.description} ${enemy.name}, но урон отсутствует`);
      return;
    }

    if (this.position === enemy.position) {
      enemy.position += 1;
      enemy.log('отскакивает на 1 позицию вправо');
      damage *= 2;
      this.log(
        `атакует вплотную ${enemy.description} ${enemy.name} с удвоенной силой`
      );
    } else {
      this.log(
        `атакует ${enemy.description} ${enemy.name} на дистанции ${rawDistance}`
      );
    }

    enemy.takeAttack(damage);
  }

  chooseEnemy(players) {
    if (!Array.isArray(players) || players.length === 0) {
      return null;
    }

    const candidates = players.filter(
      (player) => player !== this && !player.isDead()
    );

    if (candidates.length === 0) {
      return null;
    }

    return candidates.reduce((weakest, current) => {
      if (!weakest) {
        return current;
      }

      return current.life < weakest.life ? current : weakest;
    }, null);
  }

  moveToEnemy(enemy) {
    if (!enemy || enemy === this || this.isDead()) {
      return;
    }

    const distance = enemy.position - this.position;

    if (distance === 0) {
      return;
    }

    this.move(distance);
  }

  turn(players) {
    if (this.isDead()) {
      return;
    }

    const enemy = this.chooseEnemy(players);

    if (!enemy) {
      this.log('не видит противников');
      return;
    }

    this.moveToEnemy(enemy);
    this.tryAttack(enemy);
  }

  log(message) {
    if (typeof console !== 'undefined') {
      console.log(`[${this.description} ${this.name}] ${message}`);
    }
  }
}

class Warrior extends Player {
  constructor(position, name) {
    super(position, name);
    this.life = 120;
    this.maxLife = 120;
    this.speed = 2;
    this.weapon = new Sword();
    this.weaponOrder = [Sword, Knife, Arm];
    this.description = 'Воин';
  }

  takeDamage(damage) {
    if (damage <= 0) {
      return;
    }

    const halfLife = this.maxLife / 2;
    const canUseMagicShield =
      this.life < halfLife && this.getLuck() > 0.8 && this.magic > 0;

    if (!canUseMagicShield) {
      super.takeDamage(damage);
      return;
    }

    const absorbedDamage = Math.min(this.magic, damage);
    this.magic -= absorbedDamage;
    const remainingDamage = damage - absorbedDamage;

    if (remainingDamage > 0) {
      super.takeDamage(remainingDamage);
    }
  }
}

class Archer extends Player {
  constructor(position, name) {
    super(position, name);
    this.life = 80;
    this.maxLife = 80;
    this.magic = 35;
    this.maxMagic = 35;
    this.attack = 5;
    this.agility = 10;
    this.weapon = new Bow();
    this.weaponOrder = [Bow, Knife, Arm];
    this.description = 'Лучник';
  }

  getDamage(distance) {
    if (distance <= 0) {
      return 0;
    }

    if (!this.weapon || distance > this.weapon.range) {
      return 0;
    }

    const weaponDamage = this.weapon.getDamage();
    const totalAttack = this.attack + weaponDamage;
    const weaponRange = this.weapon.range;

    if (weaponRange === 0) {
      return 0;
    }

    return (totalAttack * this.getLuck() * distance) / weaponRange;
  }
}

class Mage extends Player {
  constructor(position, name) {
    super(position, name);
    this.life = 70;
    this.maxLife = 70;
    this.magic = 100;
    this.maxMagic = 100;
    this.attack = 5;
    this.agility = 8;
    this.weapon = new Staff();
    this.weaponOrder = [Staff, Knife, Arm];
    this.description = 'Маг';
  }

  takeDamage(damage) {
    if (damage <= 0) {
      return;
    }

    let actualDamage = damage;

    if (this.magic > this.maxMagic / 2) {
      actualDamage = damage / 2;
      this.magic -= 12;

      if (this.magic < 0) {
        this.magic = 0;
      }
    }

    super.takeDamage(actualDamage);
  }
}

class Dwarf extends Warrior {
  constructor(position, name) {
    super(position, name);
    this.life = 130;
    this.maxLife = 130;
    this.attack = 15;
    this.luck = 20;
    this.weapon = new Axe();
    this.weaponOrder = [Axe, Knife, Arm];
    this.description = 'Гном';
    this.hitsTaken = 0;
  }

  takeDamage(damage) {
    if (damage <= 0) {
      return;
    }

    this.hitsTaken += 1;
    let actualDamage = damage;

    const isSixthHit = this.hitsTaken % 6 === 0;
    const isLucky = this.getLuck() > 0.5;

    if (isSixthHit && isLucky) {
      actualDamage = damage / 2;
    }

    super.takeDamage(actualDamage);
  }
}

class Crossbowman extends Archer {
  constructor(position, name) {
    super(position, name);
    this.life = 85;
    this.maxLife = 85;
    this.attack = 8;
    this.agility = 20;
    this.luck = 15;
    this.weapon = new LongBow();
    this.weaponOrder = [LongBow, Knife, Arm];
    this.description = 'Арбалетчик';
  }
}

class Demiurge extends Mage {
  constructor(position, name) {
    super(position, name);
    this.life = 80;
    this.maxLife = 80;
    this.magic = 120;
    this.maxMagic = 120;
    this.attack = 6;
    this.luck = 12;
    this.weapon = new StormStaff();
    this.weaponOrder = [StormStaff, Knife, Arm];
    this.description = 'Демиург';
  }

  getDamage(distance) {
    const baseDamage = super.getDamage(distance);

    if (baseDamage === 0) {
      return 0;
    }

    if (this.magic > 0 && this.getLuck() > 0.6) {
      return baseDamage * 1.5;
    }

    return baseDamage;
  }
}

function play(players) {
  if (!Array.isArray(players) || players.length === 0) {
    return null;
  }

  let round = 1;

  while (true) {
    const alivePlayers = players.filter((player) => !player.isDead());

    if (alivePlayers.length <= 1) {
      const winner = alivePlayers[0] || null;

      if (winner) {
        winner.log('одерживает победу');
      }

      return winner;
    }

    alivePlayers.forEach((player) => {
      player.log(`начинает ход ${round}`);
      player.turn(players);
    });

    round += 1;

    if (round > 1000) {
      console.log('Бой затянулся. Победитель не определён.');
      return null;
    }
  }
}

if (typeof module !== 'undefined') {
  module.exports = {
    Weapon,
    Arm,
    Bow,
    Sword,
    Knife,
    Staff,
    LongBow,
    Axe,
    StormStaff,
    Player,
    Warrior,
    Archer,
    Mage,
    Dwarf,
    Crossbowman,
    Demiurge,
    play
  };
}
