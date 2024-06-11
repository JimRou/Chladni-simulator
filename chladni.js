/*
Expérience de Chladni
 Juin 2024 - © J.ROUSSSEL
 */
let b, half_b;  //taille de la plaque (en pixels)
let a;  //taille de la plaque (en m)
let particules=[];
let n;//nombre de particules
let C;//constante de dispersion
let freq, freqmin, freqmax;//fréquence excitatrice
let k;//nombre d'onde
let gamma;//terme d'amortissement

//-------- GUI
var FS1, FS2; //taille de police
let pauseButton, resetButton, selecteur, calibre;
let sliderF;//slider pour régler la fréquence de l'excitateur
let Pcourbe, labelSlider;//balises <p>
var stop=false;//booléen pour mettre en pause


function setup() {
  let myCanvas=createCanvas(windowWidth, windowWidth/2);//on impose un format 2x1
  myCanvas.parent('sketch');
  b=0.8*height;
  half_b=b/2;
  frameRate(20);
  angleMode(RADIANS);
  //textAlign(LEFT, TOP);
  rectMode(CENTER, CENTER);
  FS1=int(12+height/50);
  FS2=int(8+height/100);
  textSize(FS2);
  //INTERFACE DE CONTROLE
  pauseButton=createButton("PAUSE");
  pauseButton.mousePressed(togglePause);
  pauseButton.position(11*width/20, 50+0.1*height);
  resetButton=createButton("RESET");
  resetButton.mousePressed(toggleReset);
  resetButton.position(pauseButton.x+pauseButton.width+FS1, pauseButton.y);
  selecteur = createSelect();
  selecteur.position(pauseButton.x, pauseButton.y+2*FS1);
  selecteur.option('Cuivre 320mm x 320mm x 1mm');
  selecteur.option('Aluminium 320mm x 320mm x 1mm');
  selecteur.option('Zinc 320mm x 320mm x 1mm');
  selecteur.option('Inox 18-8 320mm x 320mm x 1mm');
  selecteur.changed(mySelectEvent);
  sliderF = createSlider(0, 1000, 500, 1);
  sliderF.position(11*width/20, height/2+FS1);
  sliderF.size(0.4*width);
  sliderF.input(changeF);
  calibre = createSelect();
  calibre.position(11*width/20, height/2);
  calibre.option('50 Hz-1000 Hz');
  calibre.option('1000 Hz - 2000 Hz');
  calibre.option('2000 Hz - 3000 Hz');
  calibre.option('3000 Hz - 4000 Hz');
  calibre.changed(ChangeCalibre);
  labelSlider=createP();
  labelSlider.position(11*width/20, calibre.y+FS1);
  Pcourbe=createP('COURBE DE RESONANCE');
  Pcourbe.position(sliderF.x+0.25*sliderF.width, sliderF.y+FS1);
  // Plaque de Chladni
  n=10000;
  for (let i = 0; i < n; i++) {
    particules.push(new Particle());
  }
  freqmin=50;
  freqmax=1000;
  a=0.32;
  C=0.178;
  gamma=0.02/a;
}


function draw() {
  background(64);
  translate(width/4, height/2);
  dessinePlaque();
  freq=map(sliderF.value(), 0, 1000, freqmin, freqmax);
  trace_strength(freqmin, freqmax);
  k=sqrt(freq/C);
  labelSlider.html('Fréquence : '+round(freq)+' Hz');

  // -- mise en place des grains --
  for (let i = 0; i < particules.length; i++) {
    particules[i].display();
  }
  // -- déplacement des grains --
  for (let i = particules.length-1; i >=0; i--) {
    if (abs(particules[i].x)<b/2 && abs(particules[i].y)<b/2) {
      particules[i].move();
    } else {
      particules.splice(i, 1);//on élimine les grains qui quittent la plaque
    }
  }
}

function dessinePlaque() {
  fill(0);
  rect(0, 0, b, b);
}

// état ondulatoire en un point de la plaque
function psi(px, py) {
  let S=0;
  for (let m = 0; m < 20; m+=2) {
    for (let n=0; n<20; n+=2) {
      let kmn=(PI/a)*sqrt(m*m+n*n);
      let denominateur=sqrt(sq(sq(k)-sq(kmn))+sq(2*gamma*k));
      S+=(cos(m*PI*px/b)*cos(n*PI*py/b))/denominateur;
    }
  }
  return sq(2/a)*S;
}



// Intensité de la résonance en fonction de la fréquence
function strength(f) {
  let SS=0;
  let kk=sqrt(f/C);
  for (let m = 0; m < 15; m+=2) {
    for (let n=0; n<15; n+=2) {
      let kmn=(PI/a)*sqrt(m*m+n*n);
      let denominateur=sq(sq(kk)-sq(kmn))+sq(2*gamma*kk);
      SS+=1/denominateur;
    }
  }
  return sq(2/a)*abs(SS);
}

function trace_strength(f1, f2) {
  let x, y;
  strokeWeight(1);
  stroke(255);
  fill(255);
  push();
  translate(0.3*width, half_b);
  line(0, 0, 0.4*width, 0);
  x=map(freq, f1, f2, 0, 0.4*width);
  line(x, 0, x, -half_b+2*FS1);
  strokeWeight(2);
  stroke(0, 153, 204);
  noFill();
  beginShape();
  for (let k=0; k<0.4*width; k++) {
    x=map(k, 0, 0.4*width, f1, f2);
    y=map(constrain(strength(x), 0, 1), 0, 1, 2, half_b-2*FS1);
    vertex(k, -y);
  }
  endShape();

  pop();
}


function togglePause() {
  stop=!stop;
  if (stop) {
    noLoop();
    pauseButton.html('PLAY');
  } else {
    loop();
    pauseButton.html('PAUSE');
  }
}


function toggleReset() {
  for (let i = 0; i < n; i++) {
    particules.pop();
  }
  for (let i = 0; i < n; i++) {
    particules.push(new Particle());
  }
  loop();
}

function mySelectEvent() {
  let nom = selecteur.value();
  switch(nom) {
  case 'Cuivre 320mm x 320mm x 1mm':
    C=0.178;
      break;
  case 'Aluminium 320mm x 320mm x 1mm':
    C=0.246;
    break;
  case 'Zinc 320mm x 320mm x 1mm':
    C=0.166;
    break;
  case 'Inox 18-8 320mm x 320mm x 1mm':
    C=0.238;
    break;
  }
}

function ChangeCalibre() {
  let nom = calibre.value();
  switch(nom) {
  case '50 Hz-1000 Hz':
    freqmin=50;
    freqmax=1000;
    break;
  case '1000 Hz - 2000 Hz':
    freqmin=1000;
    freqmax=2000;
    break;
  case '2000 Hz - 3000 Hz':
    freqmin=2000;
    freqmax=3000;
    break;
  case '3000 Hz - 4000 Hz':
    freqmin=3000;
    freqmax=4000;
    break;
  }
}

function changeF() {
  freq=sliderF.value();
}

function keyPressed() {
  if (key =='s' || key == 'S') {
    save('myCanvas.jpg');
  }
  if (keyCode == 32 ) {
    togglePause();
  }// hit space bar for pause
}

function windowResized() {
  resizeCanvas(windowWidth, windowWidth/2);
  FS1=int(12+height/50);
  FS2=int(8+height/100);
  b=0.8*height;
  half_b=b/2;
  textSize(FS2);
  pauseButton.position(11*width/20, 50+0.1*height);
  resetButton.position(pauseButton.x+pauseButton.width+FS1, pauseButton.y);
  selecteur.position(pauseButton.x, pauseButton.y+2*FS1);
  sliderF.position(11*width/20, height/2+FS1);
  sliderF.size(0.4*width);
  calibre.position(11*width/20, height/2);
  labelSlider.position(11*width/20, calibre.y+FS1);
  Pcourbe.position(sliderF.x+0.25*sliderF.width, sliderF.y+FS1);
  toggleReset();
}



/*Objet Oscillateur*/
class Particle {
  constructor() {
    this.x = random(-half_b, half_b);
    this.y = random(-half_b, half_b);
  }

  display() {
    stroke(255, 140);
    strokeWeight(2);
    point(this.x, this.y);
  }
  move() {
    let theta=random(0, TWO_PI);
    let pas=5*psi(this.x, this.y);
    this.x+=pas*cos(theta);
    this.y+=pas*sin(theta);
  }
}
