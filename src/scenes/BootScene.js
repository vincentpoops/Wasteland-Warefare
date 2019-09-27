/*global Phaser*/


    var map =      [[ 0, 0, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, 0],
                    [ 0, 0, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,-1, 0],
                    [ 0, 0, -1, 0, 0, 0,-1,-1,-1,-1,-1, 0, 0, 0,-1, 0],
                    [ 0, 0, -1, 0, 0, 0,-1, 0, 0, 0,-1, 0, 0, 0,-1, 0],
                    [ 0, 0, -1, 0, 0, 0,-1, 0, 0, 0,-1, 0, 0, 0,-1, 0],
                    [ 0, 0, -1, 0, 0, 0,-1, 0, 0, 0,-1, 0, 0, 0,-1, 0],
                    [ 0, 0, -1, 0, 0, 0,-1, 0, 0, 0,-1, 0, 0, 0,-1, 0],
                    [ 0, 0, -1, 0, 0, 0,-1, 0, 0, 0,-1, 0, 0, 0,-1, 0],
                    [ 0, 0, -1, 0, 0, 0,-1, 0, 0, 0,-1, 0, 0, 0,-1, 0],
                    [ 0, 0, -1, 0, 0, 0,-1, 0, 0, 0,-1, 0, 0, 0,-1, 0],
                    [ 0, 0, -1,-1,-1,-1,-1, 0, 0, 0,-1,-1,-1,-1,-1, 0],
                    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];


export default class BootScene extends Phaser.Scene {
  constructor () {
    super('Boot');
  }

  init (data) {
    // Initialization code goes here
  }

  preload () {
    // Preload assets
    this.load.atlas('sprites', 'assets/spritesheet.png', 'assets/spritesheet.json');
    this.load.image('bullet', 'assets/bullet.png');
    this.load.image('fastenemy', './assets/FastEnemy.png')
    this.load.image('toughenemy', './assets/ToughEnemy.png')
    this.load.image('desertBackground', './assets/background.png')
    this.load.spritesheet('ninja', 'assets/ninja.png', { frameWidth: 88, frameHeight: 88 })

    // Declare variables for center of the scene
    this.centerX = this.cameras.main.width / 2;
    this.centerY = this.cameras.main.height / 2;
  }

  create() {

    //Add background to level
    this.add.image(400, 300, "desertBackground");

    var graphics = this.add.graphics();
    drawLines(graphics);
    path = this.add.path(125, 0);
    path.lineTo(125,525); //add lines for enemies to follow
    path.lineTo(325, 525);
    path.lineTo(325, 125);
    path.lineTo(525, 125);
    path.lineTo(525, 525);
    path.lineTo(725, 525);
    path.lineTo(725, -50);

    graphics.lineStyle(3, 0xffffff, 1);
    path.draw(graphics);

    reg_enemies = this.physics.add.group({ classType: Regular, runChildUpdate: true });

    fast_enemies = this.physics.add.group({ classType: Fast, runChildUpdate: true });

    turrets = this.add.group({ classType: Turret, runChildUpdate: true });

    bullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });

    this.nextEnemy = 0;

    this.physics.add.overlap(reg_enemies, bullets, damageEnemy);
    this.physics.add.overlap(fast_enemies, bullets, damageEnemy);

    this.input.on('pointerdown', placeTurret);

    //Declare wave size and spawned variable
    this.waveSize = 10;
    this.spawned = 0;
    }

update (time, delta) {

    if ((time > this.nextEnemy) && (this.spawned < this.waveSize))
    {

        var fast = fast_enemies.get();
        var regular = reg_enemies.get();

        if (regular)
        {
            regular.setActive(true);
            regular.setVisible(true);
            regular.startOnPath(100);

            this.nextEnemy = time + 20000;
            this.spawned+=1
        }

        if (fast)
        {
            fast.setActive(true);
            fast.setVisible(true);
            fast.startOnPath(50);

            this.nextEnemy = time + 10000;
            this.spawned+=1
        }
    }
  }
}



var Regular = new Phaser.Class({

        Extends: Phaser.GameObjects.Image,

        initialize:

        function Enemy (scene)
        {
            Phaser.GameObjects.Image.call(this, scene, 0, 0, 'sprites', 'enemy');

            this.follower = { t: 0, vec: new Phaser.Math.Vector2() };
            this.hp = 0;
        },

        //Set speed
        ENEMY_SPEED: 1/10000,

        startOnPath: function (i)
        {
            this.follower.t = 0;
            this.hp = i;

            path.getPoint(this.follower.t, this.follower.vec);

            this.setPosition(this.follower.vec.x, this.follower.vec.y);
        },
        receiveDamage: function(damage) {
            this.hp -= damage;

            // if hp drops below 0 we deactivate this enemy
            if(this.hp <= 0) {
                this.setActive(false);
                this.setVisible(false);
            }
        },
        update: function (time, delta)
        {
            this.follower.t += this.ENEMY_SPEED * delta;
            path.getPoint(this.follower.t, this.follower.vec);

            this.setPosition(this.follower.vec.x, this.follower.vec.y);

            if (this.follower.t >= 1)
            {
                this.setActive(false);
                this.setVisible(false);
            }
        }

});

var Fast = new Phaser.Class({

        Extends: Phaser.GameObjects.Image,

        initialize:

        function Enemy (scene)
        {
            Phaser.GameObjects.Image.call(this, scene, 0, 0, 'fastenemy');

            this.follower = { t: 0, vec: new Phaser.Math.Vector2() };
            this.hp = 0;
        },

        //Set speed
        ENEMY_SPEED: 1/7500,

        startOnPath: function (i)
        {
            this.follower.t = 0;
            this.hp = i;

            path.getPoint(this.follower.t, this.follower.vec);

            this.setPosition(this.follower.vec.x, this.follower.vec.y);
        },
        receiveDamage: function(damage) {
            this.hp -= damage;

            // if hp drops below 0 we deactivate this enemy
            if(this.hp <= 0) {
                this.setActive(false);
                this.setVisible(false);
            }
        },
        update: function (time, delta)
        {
            this.follower.t += this.ENEMY_SPEED * delta;
            path.getPoint(this.follower.t, this.follower.vec);

            this.setPosition(this.follower.vec.x, this.follower.vec.y);

            if (this.follower.t >= 1)
            {
                this.setActive(false);
                this.setVisible(false);
            }
        }

});

function getEnemy(x, y, distance) {
    var regularUnits = reg_enemies.getChildren();
    var fastUnits = fast_enemies.getChildren();
    for(var i = 0; i < regularUnits.length; i++) {
        if(regularUnits[i].active && Phaser.Math.Distance.Between(x, y, regularUnits[i].x, regularUnits[i].y) < distance)
            return regularUnits[i];
    }
    for(var i = 0; i < fastUnits.length; i++) {
        if(fastUnits[i].active && Phaser.Math.Distance.Between(x, y, fastUnits[i].x, fastUnits[i].y) < distance)
            return fastUnits[i];
    }
    return false;
}

var Turret = new Phaser.Class({

        Extends: Phaser.GameObjects.Image,

        initialize:

        function Turret (scene)
        {
            Phaser.GameObjects.Image.call(this, scene, 0, 0, 'sprites', 'turret');
            this.nextTic = 0;
        },
        place: function(i, j) {
            this.y = i * 64 + 64/2;
            this.x = j * 64 + 64/2;
            map[i][j] = 1;
        },
        fire: function() {
            var enemy = getEnemy(this.x, this.y, 200);
            if(enemy) {
                var angle = Phaser.Math.Angle.Between(this.x, this.y, enemy.x, enemy.y);
                addBullet(this.x, this.y, angle);
                this.angle = (angle + Math.PI/2) * Phaser.Math.RAD_TO_DEG;
            }
        },
        update: function (time, delta)
        {
            if(time > this.nextTic) {
                this.fire();
                this.nextTic = time + 1000;
            }
        }
});

var Bullet = new Phaser.Class({

        Extends: Phaser.GameObjects.Image,

        initialize:

        function Bullet (scene)
        {
            Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bullet');

            this.incX = 0;
            this.incY = 0;
            this.lifespan = 0;

            this.speed = Phaser.Math.GetSpeed(5000, 1);
        },

        fire: function (x, y, angle)
        {
            this.setActive(true);
            this.setVisible(true);
            //  Bullets fire from the middle of the screen to the given x/y
            this.setPosition(x, y);

        //  we don't need to rotate the bullets as they are round
        //    this.setRotation(angle);

            this.dx = Math.cos(angle);
            this.dy = Math.sin(angle);

            this.lifespan = 1000;
        },

        update: function (time, delta)
        {
            this.lifespan -= delta;

            this.x += this.dx * (this.speed * delta);
            this.y += this.dy * (this.speed * delta);

            if (this.lifespan <= 0)
            {
                this.setActive(false);
                this.setVisible(false);
            }
        }

    });


function damageEnemy(enemy, bullet) {
    // only if both enemy and bullet are alive
    if (enemy.active === true && bullet.active === true) {
        // we remove the bullet right away
        bullet.setActive(false);
        bullet.setVisible(false);

        // decrease the enemy hp with BULLET_DAMAGE
        enemy.receiveDamage(BULLET_DAMAGE);
    }
}

function drawLines(graphics) {
    graphics.lineStyle(1, 0x0000ff, 0.8);
    for(var i = 0; i < 12; i++) {
        graphics.moveTo(0, i * 64);
        graphics.lineTo(840, i * 64);
    }
    for(var j = 0; j < 16; j++) {
        graphics.moveTo(j * 64, 0);
        graphics.lineTo(j * 64, 640);
    }
    graphics.strokePath();
}


function canPlaceTurret(i, j) {
    return map[i][j] === 0;
}

function placeTurret(pointer) {
    var i = Math.floor(pointer.y/64);
    var j = Math.floor(pointer.x/64);
    if(canPlaceTurret(i, j)) {
        var turret = turrets.get();
        if (turret)
        {
            turret.setActive(true);
            turret.setVisible(true);
            turret.place(i, j);
        }
    }
}

function addBullet(x, y, angle) {
    var bullet = bullets.get();
    if (bullet)
    {
        bullet.fire(x, y, angle);
    }
}
