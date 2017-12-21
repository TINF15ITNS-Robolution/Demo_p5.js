
//General settings
var lifespan = 300; //How long the rockets will live
var maxforce = 0.3; //How fast the rockets are
var popsize = 200; //How many rockets per generation there are
var mutationfactor = 0.01; //Probability of the mutation of a single gene

//Obstacle configuration
var rx = 150;
var ry = 250;
var rw = 300;
var rh = 10;

var sumP; //Summary HTML element
var population; //The population containing all rockets and their DNA
var age = 0; //Current age of this generation
var generation = 0; //Current generation
var hits = 0; //How many of the current generation have hit the target
var target; //The target
var centerpoints = [];

//sliders
var rxSlider;

function setup() {
  createCanvas(600, 450);
  rxSlider = createSlider(0, width - rw, 150, 1);
  rxSlider.position(20, 20);
  rocket = new Rocket();
  population = new Population();
  sumP = createP();

  target = createVector(width/2, 50);
}

function draw() {
  background(0);
  hits = 0;
  population.run();
  //console.log(centerpoints);
  for(var i = 0; i < centerpoints.length; i++){
    noStroke();
    fill(0, 255, 255, 31);
    ellipse(centerpoints[i][0], centerpoints[i][1], 5, 5);
  }
  sumP.html('Age: ' + age +'<br>Generation: ' + generation +'<br>Hits: ' + hits + ' [' + round(hits / popsize * 100) + '%]');
  age++;
  if(age == lifespan){
    population.evaluate();
    population.selection();
    //population = new Population();
    age = 0;
    centerpoints = [];
  }

  fill(255);
  rect(rxSlider.value(), ry, rw, rh);
  ellipse(target.x, target.y, 16, 16);
}

function Population(){
  this.rockets = [];
  this.matingpool = [];

  for(var i = 0; i < popsize; i++){
    this.rockets[i] = new Rocket();
  }

this.evaluate = function(){
  var maxfit = 0;
  for(var i = 0; i < popsize; i++){
    this.rockets[i].calcFitness();
    if(this.rockets[i].fitness > maxfit){
      maxfit = this.rockets[i].fitness;
    }
  }
  //createP(maxfit);

  for(var i = 0; i < popsize; i++){
    this.rockets[i].fitness /= maxfit;
  }

  this.matingpool = [];
  for(var i = 0; i < popsize; i++){
    var n = this.rockets[i].fitness * 100;
    for(var j = 0; j < n; j++){
      this.matingpool.push(this.rockets[i]);
    }
  }
}

this.selection = function(){
  var newRockets = [];
  for(var i = 0; i < this.rockets.length; i++){
    var p1 = random(this.matingpool).dna;
    var p2 = random(this.matingpool).dna;
    var child = p1.crossover(p2);
    child.mutation();
    newRockets[i] = new Rocket(child);
  }
  this.rockets = newRockets;
  generation++;
}

  this.run = function(){
    var cx = 0;
    var cy = 0;
      for(var i = 0; i < popsize; i++){
        this.rockets[i].update();
        this.rockets[i].show();

        cx = (cx + this.rockets[i].pos.x) * 0.5;
        cy = (cy + this.rockets[i].pos.y) * 0.5;
        //console.log(cx + ' ' + cy);
        
    }
    fill(255,0,0);
    centerpoints.push([cx, cy]);
    //console.log(this.cx + ' ' + this.cy);
    //ellipse(cx, cy, 5, 5);

  }
}

function DNA(genes){
  if(genes){
    this.genes = genes;
  } else {
    this.genes = [];
    for (var i = 0; i < lifespan; i++){
      this.genes[i] = p5.Vector.random2D();
      this.genes[i].setMag(maxforce);
    }
  }

  this.crossover = function(partner){
    var newgenes = [];
    var mid = floor(random(this.genes.length));
    for(var i = 0; i < this.genes.length; i++){
      if (i > mid){
        newgenes[i] = this.genes[i];
      } else {
        newgenes[i] = partner.genes[i];
      }
    }
    return new DNA(newgenes);
  }

  this.mutation = function(){
    for(var i = 0; i < this.genes.length; i++){
      if(random() < mutationfactor){
        this.genes[i] = p5.Vector.random2D();
        this.genes[i].setMag(maxforce);
      }
    }
  }
}

function Rocket(dna){
  this.pos = createVector(width/2, height);
  this.vel = createVector();
  this.acc = createVector();
  this.completed = false;
  var completetedTick = lifespan;
  this.crashed = false;
  if(dna){
    this.dna = dna;
  } else {
    this.dna = new DNA();
  }
  this.fitness = 0;

  this.applyForce = function(force) {
    this.acc.add(force);
  }

  this.calcFitness = function(){
    var d = dist(this.pos.x, this.pos.y, target.x, target.y);
    this.fitness = map(d, 0, width, width, 0);
    if(this.completed){
      this.fitness *= (10 + 10 * (1 - completetedTick / lifespan));
    }
    if(this.crashed){
      this.fitness /= 10;
    }
  }

  this.update = function(){

  var d = dist(this.pos.x, this.pos.y, target.x, target.y);
  if(d < 10 && !this.completed){
    this.completed = true;
    this.completetedTick = age;
    hits++;
    this.pos = target.copy();
  } else if(d < 10) {
    this.completed = true;
    hits++;
    this.pos = target.copy();
  }


  if(this.pos.x > rxSlider.value() && this.pos.x < rxSlider.value() + rw && this.pos.y > ry && this.pos.y < ry + rh){
    this.crashed = true;
  }

  if(this.pos.x > width || this.pos.x < 0){
    this.crashed = true;
  }

    if(this.pos.y > height || this.pos.y < 0){
    this.crashed = true;
  }

    this.applyForce(this.dna.genes[age]);
    if(!this.completed && ! this.crashed){
      this.vel.add(this.acc);
      this.pos.add(this.vel);
      this.acc.mult(0);
      this.vel.limit(4);
    }
  }

  this.show = function(){
    push();
    noStroke();
    fill(255, 180);
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    rectMode(CENTER);
    rect(0, 0, 20, 2);
    pop();
  }
}