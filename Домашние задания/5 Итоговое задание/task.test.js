const {
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
} = require('./task');

beforeEach(() => {
  jest.spyOn(global.Math, 'random').mockReturnValue(0);
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('Механика оружия', () => {
  test('takeDamage уменьшает прочность, но не уводит её ниже нуля', () => {
    const sword = new Sword();
    sword.takeDamage(50);
    expect(sword.durability).toBe(450);
    sword.takeDamage(1000);
    expect(sword.durability).toBe(0);
  });

  test('getDamage зависит от прочности и состояния оружия', () => {
    const bow = new Bow();
    expect(bow.getDamage()).toBe(10);
    bow.takeDamage(150);
    expect(bow.getDamage()).toBe(5);
    bow.takeDamage(100);
    expect(bow.getDamage()).toBe(0);
  });
});

describe('Базовое поведение игрока', () => {
  test('getDamage возвращает 0, если цель вне диапазона', () => {
    const player = new Player(0, 'Tester');
    expect(player.getDamage(5)).toBe(0);
  });

  test('getDamage даёт положительный результат при достижимой цели', () => {
    const player = new Player(0, 'Tester');
    player.weapon = new Sword();
    player.luck = 50;

    expect(player.getDamage(1)).toBeCloseTo(17.5, 5);
  });

  test('takeDamage не даёт жизни стать отрицательной и корректно определяет смерть', () => {
    const player = new Player(0, 'Tester');
    player.takeDamage(120);
    expect(player.life).toBe(0);
    expect(player.isDead()).toBe(true);
  });

  test('moveLeft и moveRight учитывают ограничение скорости', () => {
    const player = new Player(5, 'Mover');
    player.speed = 2;
    player.moveLeft(5);
    expect(player.position).toBe(3);
    player.moveRight(5);
    expect(player.position).toBe(5);
  });

  test('isAttackBlocked зависит от удачи персонажа', () => {
    const player = new Player(0, 'Lucky');
    player.luck = 100;
    expect(player.isAttackBlocked()).toBe(true);
  });

  test('dodged зависит от ловкости и скорости', () => {
    const player = new Player(0, 'Agile');
    player.luck = 0;
    player.agility = 100;
    expect(player.dodged()).toBe(true);
  });

  test('takeAttack наносит урон оружию при блоке', () => {
    const defender = new Player(0, 'Defender');
    defender.weapon = new Sword();
    defender.luck = 100;
    const durabilityBefore = defender.weapon.durability;

    defender.takeAttack(40);
    expect(defender.life).toBe(100);
    expect(defender.weapon.durability).toBeLessThan(durabilityBefore);
  });

  test('takeAttack может полностью уклониться от урона', () => {
    const evasive = new Player(0, 'Evasive');
    evasive.weapon = null;
    evasive.luck = 0;
    evasive.agility = 100;
    const lifeBefore = evasive.life;

    evasive.takeAttack(50);
    expect(evasive.life).toBe(lifeBefore);
  });

  test('checkWeapon переключает игрока на следующее оружие в цепочке', () => {
    const warrior = new Warrior(0, 'Smith');
    warrior.weapon.durability = 0;
    warrior.checkWeapon();
    expect(warrior.weapon).toBeInstanceOf(Knife);
    warrior.weapon.durability = 0;
    warrior.checkWeapon();
    expect(warrior.weapon).toBeInstanceOf(Arm);
  });

  test('tryAttack наносит урон, если цель достижима', () => {
    const warrior = new Warrior(0, 'Attacker');
    const mage = new Mage(1, 'Target');
    mage.luck = 0;
    mage.agility = 0;
    const lifeBefore = mage.life;

    warrior.tryAttack(mage);
    expect(mage.life).toBeLessThan(lifeBefore);
  });

  test('chooseEnemy выбирает соперника с минимальным здоровьем', () => {
    const warrior = new Warrior(0, 'Leader');
    const mage = new Mage(1, 'Mage');
    const archer = new Archer(2, 'Archer');
    mage.life = 60;
    archer.life = 40;

    expect(warrior.chooseEnemy([warrior, mage, archer])).toBe(archer);
  });

  test('moveToEnemy приближает игрока к врагу с учётом скорости', () => {
    const warrior = new Warrior(0, 'Runner');
    const mage = new Mage(5, 'Target');

    warrior.moveToEnemy(mage);
    expect(warrior.position).toBe(2);
  });

  test('turn перемещает игрока и наносит удар', () => {
    const warrior = new Warrior(0, 'Fighter');
    const archer = new Archer(1, 'Enemy');
    archer.luck = 0;
    archer.agility = 0;
    const lifeBefore = archer.life;

    warrior.turn([warrior, archer]);
    expect(warrior.position).toBe(1);
    expect(archer.life).toBeLessThan(lifeBefore);
  });
});

describe('Особенности классов', () => {
  test('Warrior тратит магию, чтобы поглощать урон при малом запасе жизни', () => {
    const warrior = new Warrior(0, 'Shielded');
    warrior.life = 50;
    warrior.magic = 20;
    warrior.luck = 100;

    warrior.takeDamage(30);
    expect(warrior.magic).toBe(0);
    expect(warrior.life).toBe(40);
  });

  test('Archer учитывает дистанцию и дальность оружия в getDamage', () => {
    const archer = new Archer(0, 'Sharpshooter');
    archer.luck = 50;
    const closeDamage = archer.getDamage(1);
    const farDamage = archer.getDamage(3);

    expect(closeDamage).toBeGreaterThan(0);
    expect(farDamage).toBeGreaterThan(closeDamage);
    expect(archer.getDamage(5)).toBe(0);
  });

  test('Mage сокращает урон вдвое при большом запасе маны', () => {
    const mage = new Mage(0, 'Wizard');
    mage.takeDamage(40);
    expect(mage.life).toBe(50);
    expect(mage.magic).toBe(88);
  });

  test('Dwarf уменьшает каждый шестой полученный удар', () => {
    const dwarf = new Dwarf(0, 'Durable');
    dwarf.luck = 100;

    for (let i = 0; i < 6; i += 1) {
      dwarf.takeDamage(10);
    }

    expect(dwarf.life).toBe(75);
  });

  test('Crossbowman стартует с улучшенным оружием и характеристиками', () => {
    const crossbowman = new Crossbowman(0, 'Shooter');
    expect(crossbowman.weapon).toBeInstanceOf(LongBow);
    expect(crossbowman.luck).toBe(15);
  });

  test('Demiurge усиливает урон при высоких показателях удачи и магии', () => {
    const demiurge = new Demiurge(0, 'Creator');
    demiurge.luck = 70;
    const result = demiurge.getDamage(1);

    expect(result).toBeCloseTo(16.8, 5);
  });
});

describe('Симуляция боя', () => {
  test('play возвращает победителя среди игроков', () => {
    const warrior = new Warrior(0, 'Hero');
    warrior.luck = 100;
    const mage = new Mage(1, 'Villain');
    mage.luck = 0;
    mage.agility = 0;

    const winner = play([warrior, mage]);
    expect(winner).toBe(warrior);
  });
});
