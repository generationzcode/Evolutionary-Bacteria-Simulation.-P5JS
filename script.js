const POPULATION_INIT = 200;
const SUGAR_PROB = 0.4;// how much sugar will show up on map
const VISION_DIST = 3;// how far an individual can see
const TILES = 100; // how many squares in a map
const SUGAR_REFILL_TICKS=5000;//ticks until map is reset
const LIFE_MAX=8000 ;//maximum age
const DRIVE_PROB = 0.0015;//probability of reproduction happening
const MAX_METABOLISM = 0.4;//obvious...
const MAX_STEAL = 0.1;//maximum sugar that can be stolen (like damaging an individual)
const MAX_MOVE = 3;//max speed
const MAX_PICKY=30; //maximum threshold value for reproduction




var SIZE = 600;
let bacteria_arr=[];
var game_arr=[];
let tick = 0;


const insert = (arr, index, newItem) => [
  ...arr.slice(0, index),
  newItem,
  ...arr.slice(index)
]


function eat(bacteria,i){
    for (let i = 0;i < bacteria_arr.length;i+=1){
        if ((Math.floor(bacteria.X/(SIZE/TILES))>0)&&(Math.floor(bacteria.X/(SIZE/TILES))<TILES)&&(Math.floor(bacteria.Y/(SIZE/TILES))>0)&&(Math.floor(bacteria.Y/(SIZE/TILES))<TILES)){
            if (game_arr[Math.floor(bacteria.Y/(SIZE/TILES))][Math.floor(bacteria.X/(SIZE/TILES))]>0){
                game_arr[Math.floor(bacteria.Y/(SIZE/TILES))][Math.floor(bacteria.X/(SIZE/TILES))]-=0.05
                bacteria_arr[i].sugar+=0.05
            }
        }
    }
}


function mate(bacteria){
    for (let i = 0;i < bacteria_arr.length;i+=1){
        if (((bacteria.X-bacteria_arr[i].X)**2+(bacteria.Y-bacteria_arr[i].Y)**2)<(VISION_DIST*(SIZE/TILES))**2){
            if (Math.random()>(1-DRIVE_PROB)){
                if (fitness(bacteria.fitness_coeff,bacteria_arr[i])>bacteria.threshold){
                    console.log("a child has been created")
                    let preference=false//mating preference to be inherited
                    if (Math.random()<0.5){
                        preference=bacteria
                    }
                    else{
                        preference=bacteria_arr[i]
                    }
                    bacteria_arr.push({
                        X:(bacteria.X+bacteria_arr[i].X)/2,
        Y:(bacteria.Y+bacteria_arr[i].Y)/2,
        sugar: 50,
        metabolism: (bacteria.metabolism+bacteria_arr[i].metabolism)/2,
        hostility: (bacteria.hostility+bacteria_arr[i].hostility)/2,
        life_expectancy: (bacteria.life_expectancy+bacteria_arr[i].life_expectancy)/2,
        fitness_coeff: preference.fitness_coeff,
        threshold:(bacteria.threshold+bacteria_arr[i].threshold)/2,
        trail:[0,0,0],
        alive:true,
        ticks:0
                    })
                    break
                }
            }
        }
    }
}
function fitness(coeff,bacteria){
    return coeff[0]*bacteria.sugar+coeff[1]*bacteria.metabolism+coeff[2]*bacteria.hostility+coeff[3]*bacteria.life_expectancy;
}

function hostility_move(bacteria){
    for (let i = 0;i < bacteria_arr.length;i+=1){
        if (((bacteria.X-bacteria_arr[i].X)**2+(bacteria.Y-bacteria_arr[i].Y)**2)<(((VISION_DIST)*(SIZE/TILES))**2)){
            if (Math.random()<bacteria.hostility){
                bacteria_arr[i].sugar-=Math.random()*MAX_STEAL;
                break;
            }
        }
    }
}
function setup() {
    createCanvas(SIZE, SIZE);
    background(255);
    SIZE=windowHeight-30;

    
    for (let i = 0;i < POPULATION_INIT;i+=1){
    bacteria_arr.push({
        X:Math.abs(Math.random()*TILES)*(SIZE/TILES)+SIZE/(2*TILES),
        Y:Math.abs(Math.random()*TILES)*(SIZE/TILES)+SIZE/(2*TILES),
        sugar: 50,
        metabolism: MAX_METABOLISM*Math.random(),
        hostility: Math.random(),
        life_expectancy: LIFE_MAX*Math.random(),
        fitness_coeff: [Math.random(),Math.random(),Math.random(),Math.random()],
        threshold:Math.random()*MAX_PICKY,
        trail:[0,0,0],
        alive:true,
        ticks:0
    });
}
    for (let i=0;i<TILES;i+=1){
        let arr_append=[]
        for (let v=0;v<TILES;v+=1){
            if (Math.random()<SUGAR_PROB){
                arr_append.push(Math.ceil(Math.random()*30));
            }
            else{
                arr_append.push(0);
            }
        }
        game_arr.push(arr_append);
    }
}
function dothis(){
    document.getElementById("ticks").innerHTML=tick
    document.getElementById("population").innerHTML=bacteria_arr.length
}
setInterval(dothis,3000)
function draw() {
    tick+=1;
    clear();
    noStroke();
    for (let i = 0;i<TILES;i+=1){
        for (let v=0;v<TILES;v+=1){
            fill(255*game_arr[i][v]*(1/40));
            rect(SIZE*v/TILES,SIZE*i/TILES,SIZE/TILES,SIZE/TILES);
        }
    }
    for (let i=0;i<bacteria_arr.length;i+=1){
        if (bacteria_arr[i].alive == true){
        if (bacteria_arr[i].sugar < 0){
            bacteria_arr[i].alive = false;
        }
        if (bacteria_arr[i].ticks>bacteria_arr[i].life_expectancy){
            bacteria_arr[i].alive=false;
        }
        if (Number.isInteger(bacteria_arr[i].ticks/200)){
            bacteria_arr[i].trail=insert(bacteria_arr[i].trail,0,[bacteria_arr[i].X,bacteria_arr[i].Y])
        }
            bacteria_arr[i].sugar-=bacteria_arr[i].metabolism
            hostility_move(bacteria_arr[i])
            if (Math.random()<(DRIVE_PROB*100)){
        mate(bacteria_arr[i])
            }
            eat(bacteria_arr[i],i)
        bacteria_arr[i].ticks+=1
        bacteria_arr[i].trail.pop();
        bacteria_arr[i].trail=insert(bacteria_arr[i].trail,0,[bacteria_arr[i].X,bacteria_arr[i].Y])
        bacteria_arr[i].X += (Math.random()*2-1)*bacteria_arr[i].metabolism*MAX_MOVE*(SIZE/TILES);
        bacteria_arr[i].Y += (Math.random()*2-1)*bacteria_arr[i].metabolism*MAX_MOVE*(SIZE/TILES);
        fill(Math.abs(bacteria_arr[i].hostility*255),255-Math.abs(bacteria_arr[i].hostility*255),2);
        rect(bacteria_arr[i].X, bacteria_arr[i].Y, (3/4)*(SIZE/TILES),(3/4)*(SIZE/TILES));
        fill(Math.abs(bacteria_arr[i].X*255),255-Math.abs(bacteria_arr[i].hostility*255),Math.abs(bacteria_arr[i].sugar))
        //console.log('rgba('+toString(Math.abs(bacteria_arr[i].hostility*255))+','+toString(255-Math.abs(bacteria_arr[i].hostility*255))+',2,100)');
        for (let v =0;v<bacteria_arr[i].trail.length;v+=1){
        rect(bacteria_arr[i].trail[v][0],bacteria_arr[i].trail[v][1], (3/4)*(SIZE/TILES),(3/4)*(SIZE/TILES));
        }
        }
        else{
        fill(77, 32, 1)
        rect(bacteria_arr[i].X, bacteria_arr[i].Y, (5/4)*(SIZE/TILES),(7/4)*(SIZE/TILES));
        }
    }
    if (Number.isInteger(tick/SUGAR_REFILL_TICKS)){
        game_arr=[];
        for (let i=0;i<TILES;i+=1){
        let arr_append=[];
        for (let v=0;v<TILES;v+=1){
            if (Math.random()<SUGAR_PROB){
                arr_append.push(Math.ceil(Math.random()*30));
            }
            else{
                arr_append.push(0);
            }
        }
        game_arr.push(arr_append);
    }
    }
}