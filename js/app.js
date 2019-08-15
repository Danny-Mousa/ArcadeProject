
/********** ALL GAME VARIABLES ******/


// IMPORTANT NOTE

/* I INSERTED THE PIECE OF OF CODE WHICH DEALING WITH (Pause/Play) BUTTON 
 * INTO THE (main) FUNCTION WHICH IS LOCATED INTO THE IIFE (Engine)  
 * AT THE LINE 73 ( INTO THE engine.js file)
 * BECAUSE IT IS RESPONSIBLE FOR THE REPEATED INVOCATION TO THE (enemy.update(dt)) FUNCTION
 */

let pointsArr = [];
const points = document.querySelector("#points");
let livesArr=[1,1,1];
const lives=document.querySelector("#lives");
const form = document.querySelector("#menuForm");
var idArr =["char-boy"];
const startGameBtn = document.querySelector("#start-game");
const container = document.querySelector(".container");
const overlayReceiver = document.querySelector(".overlayReceiver");
const overlayBackground = document.querySelector(".overlayBackground");
const charBoy = document.querySelector("#char-boy");
const resetGame = document.querySelector("#resetCan");
const changePlayer = document.querySelector("#changePlayer");
const playPause = document.querySelector("#play-pause");
var interval;
let secs =0;
let mins =0;
let moveHolderArr =[];
let count=0;
const timer = document.querySelector("#timer");

// Enemies our player must avoid

/**
* @description Represents an enemy which we must avoid
* @constructor
* @param {number} x - The coordinate x of the enemy on the canvas
* @param {number} y - The coordinate y of the enemy on the canvas
* @param {number} speed - The speed of enemy which will multiply by random values to produce random speeds
* @param {string} bugPic - The enemy image name
*/
var Enemy = function(x, y, speed, bugPic) {
    this.x=x;
    this.y=y;
    this.speed= speed;
    this.sprite = `images/${bugPic}.png`;
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    
    if(this.speed<0 && this.x <-100){
        this.x=450;
    }

    if(this.x >600){
        this.x=Math.random() * -60;
    }
    
    this.x += (Math.floor(Math.random() * 4)+1)*this.speed * dt;
};



// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

const enemy1= new Enemy(400, 60, -20, "enemy-bug-b");
const enemy2= new Enemy(0, 60, 40,"enemy-bug");
const enemy3= new Enemy(-100, 145, 60,"enemy-bug");
const enemy4= new Enemy(-40, 230, 30, "enemy-bug");
const enemy5= new Enemy(500, 230, -30, "enemy-bug-b");
const enemy6= new Enemy(350, 145, -15, "Rock");
const enemy7= new Enemy(450, 60, 20, "Rock");

const allEnemies = [ enemy1, enemy2, enemy3,enemy4, enemy5, enemy6, enemy7];


/**************** PLAYER CONSTRUCTION FUNCTION AND ITS INSTANCES ***************/

/**
* @description Represents a player
* @constructor
* @param {number} x - The coordinate x of the player on the canvas
* @param {number} y - The coordinate y of the player on the canvas
* @param {string} playerImg - The player image name
*/
const Player = function(x, y, playerImg){
    this.x=x;
    this.y=y;
    this.sprite=`images/${playerImg}.png`;
}

player = new Player(200, 400, idArr[idArr.length-1]);

// Draw the Player Instance on the screen, required method for game
Player.prototype.render = function() {
    
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/* HANDLE THE KEYBOARD ARROW KEYS BUT TAKE INTO CONSIDERATION
 * THE PLAYER MUSTN'T OVERRIDE ROCKS AND WHEN THE PLAYER INTER
 * THE WATER ZONE, DON'T ALLOW HIM TO MOVE LEFT OR RIGHT
 */

Player.prototype.handleInput= function(direction){

    if(container.classList.contains("hide")){// TO EXCLUDE THE KEYUP EVENTS WHEN THE MAIN MODAL IS OPEN
        count +=1;
        moveHolderArr.push(1);
        if(moveHolderArr.length===1){

            if(direction === 'up' || 'down' || 'right ' || 'left'){
                    interval=setInterval( ()=>{
                                secs +=1;

                                if (secs % 60 ===0) {
                                        mins +=1;
                                        secs =0;
                                }
                                timer.textContent=`${mins} mins ${secs} secs`;
                    }, 1000);

            }    


        }

        if(direction === 'left' && this.x >60 && this.y >0){
                        /*(this.y >0) TO PREVENT
                         * THE PLAYER FROM MOVING TO
                         * THE LEFT WHEN ENTERING THE
                         * WATER ZONE
                         */
                this.x -=101;
        }
        if(direction === 'up' && this.y >90){
            
            this.y -=50;
        }
        if(direction === 'right' && this.x <400 && this.y >0){
            /*(this.y >0) TO PREVENT
             * THE PLAYER FROM MOVING TO
             * THE RIGHT WHEN ENTERING THE
             * WATER ZONE
             */
            this.x +=101;
        }
        if(direction === 'down' && this.y <400){
        
            this.y +=50;
        }else if(this.y <90 && this.x>=75 && this.x<150){
            
            if(direction === 'up' && this.y>10){
        
                this.y -=50;
                
            }
        }
    }
};



/* ADD EVENT LISTENER TO PICK UP A NEW 
PLAYER PICTURE AND PLAY GAME WITH IT */

/**
* @description pick up a new player picture and put that player on the canvas
* @param {object} e - The "click" event 
*/
let playerId = function (e){

    if(e.target.parentElement.nodeName ==="LABEL"){

            e.preventDefault();
            const inputBtn = e.target.parentElement.querySelector("input");
            inputBtn.checked= true;
            id =inputBtn.id;
            idArr.push(id);

            if (idArr.length >1) {

                player = new Player(200, 400, idArr[idArr.length-1]);/* IN ORDER TO EXCLUDE THE DEFAULT PLAYER*/

            }
    }
     
};

form.addEventListener("click", playerId);

// Update the player's position when collision is occur
// AND I BENEFIT OF IT'S REPEATED EXECUTING FOR KEEP TRACKING THE GAME CONDITIONS
Player.prototype.update= function(){

    
    
    /* KEEP TRACK THE GAME PLAYING CONDITIONS:
     * IF THE PLAYER IS ON THE WATER(player.y===0), THEN
     * IF ALL GEMS ARE COLLECTED AND THE PROVIDED 3 LIVES HAVEN'T SPENT
     * SHOW A MODAL OF CONGRATS
     * ELSE IF THE PLAYER  HAS SPENT THE WHOLE 3 LIVES AND THEN LOST ONE LIVE AGAIN 
     * SHOW A MODAL THAT TELLS ABOUT THE GAME IS OVER
     */
   if(this.y===0){
    /*BECAUSE OF THE HIGH SPEED OF REPEATED EXUTION TO THE (player.update) METHOD, THE ANIMATION WHICH APPLIED ON THE MODAL BUTTON 
     *CAN'T BE APPEAR, SO I'LL SET THE (player.y) TO ANY VALUE EXCEPT 0 TO MAKE IT EXECUTE ONLY ONE TIME 
     */
        if(pointsArr.length===3 && livesArr.length>0){

           const modal1 = new Modal(overlayReceiver, livesArr.length, pointsArr.length, this.sprite,mins, secs, ["** CONGRATS **", "You Are AMAZING"]);
           modal1.open();
           this.y=1; 
           clearInterval(interval);

        }
   }else if(livesArr.length===0){

            clearInterval(interval);
            const modal2 = new Modal(overlayReceiver, livesArr.length, pointsArr.length, this.sprite,mins, secs, ["** GAME OVER **", "Give It Another Try"]);
            modal2.open();
        /*BECAUSE OF THE HIGH SPEED OF REPEATED EXUTION TO THE (player.update) METHOD, THE ANIMATION WHICH APPLIED ON THE MODAL BUTTON 
         *CAN'T BE APPEAR, SO I'LL SET THE (livesArr.length) TO ANY VALUE EXCEPT 0 TO MAKE IT EXECUTE ONLY ONE TIME 
         */    
            livesArr.length=1;
   }

    /* CHECK FOR COLLISIONS*/ 
    let enemyDetect = checkCollisions(allEnemies, player);

    if(enemyDetect){
        this.x=200;
        this.y=400;
    }

}


// This listens for key presses and sends the keys to your
// Player.handleInput() method.

/**
* @description listens for key presses and sends the keys to your Player.handleInput() method
* @param {object} e - The "keyup" event 
*/

function keyupHandler (e){ // I NEED IT TO BE EXTERNAL, BECAUSE I NEED TO REMOVE THE EVENT LISTENER LATER
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);

}


document.addEventListener('keyup', keyupHandler);


/************************* ADD GEMS RANDOMLY ON THE CANVAS DEPENDING ON (Player constructor) ***********/


const gem1 = new Player(Math.random()*2*200,75, "Gem-Blue");
const gem2 = new Player(Math.random()*2*200,175, "Gem-Green");
const gem3 = new Player(Math.random()*2*200,310, "Gem-Orange");

const allGems =[gem1, gem2, gem3];

/************************* ADD ROCKS ON THE TOP OF THE CANVAS DEPENDING ON (Player constructor) ***********/

const rock1 = new Player(0,-15,"Rock");
const rock2 = new Player(202,-15,"Rock");
const rock3 = new Player(303,-15,"Rock");
const rock4 = new Player(404,-15,"Rock");

const allRocks = [rock1, rock2, rock3, rock4];


/*********************** checkCollisions FUNCTION WITH ENEMIES **************************/

lives.textContent= `lives : ${livesArr.length}`;

/**
* @description player-enemy collision detector
* @param {object} allEnemies - an array represent all the enemies in the game
* @param {object} player 
* @returns {boolean} true - when collision occurs
*/

function checkCollisions( allEnemies, player){

            for(const enemy of allEnemies){

                if( enemy.x < player.x+50 &&
                    enemy.x+50 > player.x &&
                    enemy.y < player.y +50 &&
                    enemy.y + 50 > player.y )
                {
                    livesArr.shift();
                    lives.textContent= `lives : ${livesArr.length}`;

                    return true;
                }
            }
}

/*********************** gemCollision FUNCTION WITH GEMS **************************/

points.textContent=`Points : ${pointsArr.length}`;

/**
* @description player-gem collision detector
* @param {object} allGems - an array represent all the gems in the game
* @param {object} player 
*/

function gemCollision (allGems, player){

    for (const gem of allGems){

        if ( gem.x <player.x+70 &&
            gem.x+70> player.x &&
            gem.y< player.y +70 &&
            gem.y+70> player.y )
        {
          gem.x=1000;
          pointsArr.push(1);
        }
    }
    
    points.textContent=`Points : ${pointsArr.length}`;
    
}


/********************* MODAL CLASS IN ORDER TO DECLARE THE VICTORY OR THE LOSS ********/

/**
* @description Represents a modal
* @constructor
* @param {html DOM element(object)} overlay - The html element that will receive the Modal output
* @param {number} livesArrLength - The currently lives number of the player
* @param {number} pointsArrLength - The currently points number which is collected by to the player
* @param {string} PlayImage - The player image name
* @param {number} mins - The final number of minutes when the game is finished
* @param {number} secs - The final number of seconds when the game is finished
* @param {string} expression - Specify the expression which should appear on the top of the modal (will be different between the case of win and loss)
*/

class Modal {
    constructor(overlay, livesArrLength, pointsArrLength, PlayImage,mins, secs, expression){
        this.overlay = overlay;
        this.lives = livesArr.length;
        this.points= pointsArr.length;
        this.imageUrl = PlayImage;
        [this.one, this.two] = expression;
        this.mins = mins;
        this.secs = secs;
        overlay.innerHTML=`<h1>${this.one}</h1>
                           <h2>${this.two}</h2>
                           <div id="playerImage">
                              <img src="${this.imageUrl}" alt="player photo">
                           </div>
                           <div id="scores">
                                <div>Lives : ${this.lives}</div>
                                <div>Points : ${this.points}</div>
                            </div>
                            <div id="time">Your Time : ${mins} mins ${secs} secs</div>
                           <button type="button" id="ovBtn">Play Again</button>
                           `;
        this.modalBtn = overlay.querySelector("#ovBtn");  
        this.modalBtn.addEventListener("click", this.resetFromMod.bind(this));                 

    }

    open() { this.overlay.parentElement.classList.remove("hide"); 
             changePlayer.style.display="none";
             resetGame.style.display="none";
             playPause.style.display="none";
            }

    close () { this.overlay.parentElement.classList.add("hide");}

    resetFromMod () { reset(); }
}


// RESET FUNCTION

/**
* @description Reset the game
*/

function reset (){

    if(!overlayBackground.classList.contains("hide")){//THIS STEP TO TAKE INTO CONSIDERATION THE FUTURE USE OF reset FUNCTION OUTSIDE THE MODAL
        overlayBackground.classList.add("hide");
        container.classList.remove("hide");
        /* RESET THE MAIN MENU TO POINT TO THE CHAR BOY 
         * AS IN THE DEFAULT CASE, ONLY IF GAME BEING ENDED
         * OTHERWISE DON'T CHANGE THE PLAYER PICTURE
         */
       charBoy.checked=true;
       player = new Player(200, 400, "char-boy");
    }else{
        player.x=200;
        player.y=400;
    }
   // RESET LIVES TO 3
   livesArr=[1,1,1];
   lives.textContent= `lives : ${livesArr.length}`;

   // RESET POINTS TO 0
   pointsArr=[];
   points.textContent=`Points : ${pointsArr.length}`;

   // RESET THE GEMS RANDOMLY 
   for(const gem of allGems){

        gem.x= Math.random()*2*200;
   }

   // RESET THE ENEMIES RANDOMLY
   for(const enemy of allEnemies){
        enemy.x=Math.random()*500;
   }

   // RESET THE TIMER
   clearInterval(interval);
   moveHolderArr=[];
   secs=0;
   mins=0;
   timer.textContent=`${mins} mins ${secs} secs`;
}

/* ADD EVENT LISTENER TO THE (Start Game) BUTTON ON THE MAIN MODAL 
 AND AFTER PRESSING THAT BUTTON, PUT THE CANVAS IN THE CENTER OF 
 THE SCREEN, TO MAKE THE GAME BOARD NOT GET AFFECTED BY SCROLLING 
 ACROSS THE MAIN MODAL  */

playPause.style.display="none";
changePlayer.style.display="none";
resetGame.style.display="none";/* BECAUSE resetGame, changePlayer, AND playPause  
                                * ARE POSITIONED RELATIVE 
                                * AND WILL APPEAR ON THE MAIN MODAL
                                */
startGameBtn.addEventListener("click", ()=>{

        const canvas = document.querySelector("#canvas");
        canvas.setAttribute("tabindex", "0");
        canvas.focus();
        container.classList.add("hide");

        resetGame.style.display="inline-block";
        changePlayer.style.display="inline-block";
        playPause.style.display="inline-block";
});

resetGame.addEventListener("click", reset);


// ADD THE ABBILITY TO OPEN THE MAIN MODAL WHEN CLICK ON THE (Change Player) BUTTON
changePlayer.addEventListener("click", ()=>{ 

    charBoy.checked=true;
    player = new Player(200, 400, "char-boy");

    changePlayer.style.display="none";
    resetGame.style.display="none";
    playPause.style.display="none";
    container.classList.remove("hide");
    reset();
});

// IMPORTANT NOTE

/* I INSERTED THE PIECE OF OF CODE WHICH DEALING WITH (Pause/Play) BUTTON 
 * INTO THE (main) FUNCTION WHICH IS LOCATED INTO THE IIFE (Engine)  
 * AT THE LINE 73 ( INTO THE engine.js file)
 * BECAUSE IT IS RESPONSIBLE FOR THE REPEATED INVOCATION TO THE (enemy.update(dt)) FUNCTION
 */