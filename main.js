
class Vector
{
    constructor(w, h)
    {
        this.ctx = document.getElementById('canvas').getContext('2d');
        this.W = canvas.width, this.H = canvas.height;
        this.X = null;
        this.Y = null;
        this.size = {w: w, h: h};
        this.vel = {x: null, y: null};
    }
    get right() {
        return this.X + this.size.w;
    }
    get bottom() {
        return this.Y + this.size.h;
    }
}


class Sprite extends Vector
{
    constructor(path, fwNumber, fhNumber)
    {
        super(32, 32);
        this.img = new Image();
        this.img.src = path;
        this.frame = {  w:this.img.width/fwNumber,    // frame width
                       h:this.img.height/fhNumber }; // frame height
        this.crop = { x:0, y:0 };      // X & Y pos to crop image
        this.counter = { x:0, y:0 };  // tracks animation interval
    }
    animate()
    {
        //  creates animation loop  //
        this.Xspeed = Math.floor(this.counter.x) % this.Xsequence;
        this.Xspeed *= this.frame.w; // amount to increase each frame
        this.counter.x += 0.2;      // animation speed
        this.draw();
    }

    draw() {
        this.ctx.drawImage(this.img,
            this.crop.x, this.crop.y,
            this.frame.w, this.frame.h,
            this.X, this.Y,
            this.size.w, this.size.h);
    }

    update(columnX, rowY, Xsequence) {
        this.Xsequence = Xsequence;             // update animation column length
        this.columnX = columnX * this.frame.w; // update column start position
        this.crop.y = rowY * this.frame.h;
        this.crop.x = this.columnX + this.Xspeed;
    }

    collision()
    {
        //  boundaries //
        if (this.X < 0) this.X = 0;
        if (this.right > this.W) this.X = this.W-this.size.w;
        else if (this.bottom > this.H) this.Y = this.H-this.size.h;
    }
}


class Player extends Sprite
{
    constructor()
    {
        super('img/skeleton_spear.png', 13, 21);
        this.X = this.W/2;
        this.Y = this.H/2;
        this.size = {w: 64, h: 64};
        this.speed = 1; // walk speed

        this.stop = true; this.start = false;

        this.key = {left:false, right:false, up:false, down:false, spacebar:false};

        this.direction = {right:false, left:false, up:false, down:false};

        document.addEventListener('keydown', this.keyPress, false);
        document.addEventListener('keyup', this.keyRelease, false);
    }
    
    init()
    {
        if(this.stop) this.Xspeed = 0; // stops animtion loop
        this.animate();
        this.controller();
        this.collision();

    }
    
    controller()
    {
        this.vel.x = 0;
        this.vel.y = 0;

        // LEFT //
        if(this.key.left &&!(this.key.right || this.key.up || this.key.down))
        {
            this.update(0, 9, 9);
            this.stop = false;
            this.start = true;
            this.direction = {right:false, left:true, up:false, down:false};
            if(!this.key.spacebar) this.vel.x = -this.speed;
        }
        
        // RIGHT //
        if(this.key.right &&!(this.key.left || this.key.up || this.key.down))
        {
            this.update(0, 11, 8);
            this.stop = false;
            this.start = true;
            this.direction = {right:true, left:false, up:false, down:false};
            if(!this.key.spacebar) this.vel.x = this.speed;
        }
        
        // UP //
        if(this.key.up &&!(this.key.right || this.key.left || this.key.down))
        {
            this.update(0, 8, 9);
            this.stop = false;
            this.start = true;
            this.direction = {right:false, left:false, up:true, down:false};
            if(!this.key.spacebar) this.vel.y = -this.speed;
        }
        
        // DOWN //
        if(this.key.down &&!(this.key.right || this.key.up || this.key.left))
        {
            this.update(0, 10, 9);
            this.stop = false;
            this.start = true;
            this.direction = {right:false, left:false, up:false, down:true};
            if(!this.key.spacebar) this.vel.y = this.speed;
        }
        
        // SPACEBAR - Attack //
        if(this.key.spacebar)
        {
            if(this.direction.right) {
                this.update(0, 7, 8);
            }
            else if(this.direction.left) {
                this.update(0, 5, 8);
            }
            else if(this.direction.up) {
                this.update(0, 4, 8);
            }
            else if(this.direction.down) {
                this.update(0, 6, 8);
            }
        }
        
        // updates animation direction
        if(this.stop)
        {
            if(this.direction.right) this.update(0, 7, 1);
            if(this.direction.left) this.update(0, 9, 1);
            if(this.direction.up) this.update(0, 8, 1);
            if(this.direction.down) this.update(0, 10, 1);
        }
        // frame to draw at game start
        if(!this.start) this.update(0, 6, 1);

        this.X += this.vel.x;
        this.Y += this.vel.y;
        this.stop = true; // stops animation loop
    }

    keyPress(e)
    {
        if (e.keyCode == 37) main.player.key.left = true;
        if (e.keyCode == 39) main.player.key.right = true;
        if (e.keyCode == 38) main.player.key.up = true;
        if (e.keyCode == 40) main.player.key.down = true;
        if (e.keyCode == 32) main.player.key.spacebar = true;
    }
    keyRelease(e)
    {
        if (e.keyCode == 37) main.player.key.left = false;
        if (e.keyCode == 39) main.player.key.right = false;
        if (e.keyCode == 38) main.player.key.up = false;
        if (e.keyCode == 40) main.player.key.down = false;
        if (e.keyCode == 32) main.player.key.spacebar = false;
    }
}


class Main extends Vector
{
    constructor()
    {
        super();
        this.loop();
        this.player = new Player;
    }

    update(DT)
    {
        this.player.init();
    }

    loop(lastTime) { // creates main loop
        const callback = (Mseconds) => {
            this.ctx.clearRect(0, 0, this.W, this.H);
            if(lastTime)
                this.update((Mseconds -lastTime)/1000);
            lastTime = Mseconds;
            requestAnimationFrame(callback);
        }
        callback();
    }
}

window.onload = main = new Main; // initiates game //
