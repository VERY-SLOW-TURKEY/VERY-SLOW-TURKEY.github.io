

// variables
var allActors = [];
var allLines = [];
var allAnimations = [];
var keyHeld = {};
var scrollingCamera = {enabled: false, x: 0, y: 0};
var mouse = {x: 0, y: 0, width: 0, height: 0, down: 0, leftDown: 0, rightDown: 0, collide: innerGameBuilderCollide};
var innerGameBuilderWidthScale = units(innerWidth) / window.innerWidth;
var innerGameBuilderHeightScale = units(innerHeight) / window.innerHeight;
gameScreen = {width: window.innerWidth / innerGameBuilderWidthScale, height: window.innerHeight / innerGameBuilderHeightScale};

var canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var c = canvas.getContext('2d');
window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);
window.addEventListener('load', startInnerGameBuilder);
window.addEventListener('mousemove', innerGameBuilderMouseMove);

function startInnerGameBuilder() {
window.requestAnimationFrame(innerGameBuilderLoop);
}

function innerGameBuilderLoop() {
updateScreen();
innerGameBuilderCheckCollisions();
gameLoop();
window.requestAnimationFrame(innerGameBuilderLoop);
}

function updateScreen() {
var widthScale = units(innerWidth) / window.innerWidth;
var heightScale = units(innerHeight) / window.innerHeight;
gameScreen = {width: window.innerWidth / widthScale, height: window.innerHeight / heightScale};
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
c.fillStyle = 'white';
c.fillRect(0, 0, window.innerWidth, window.innerHeight);
for (i = 0; i < allActors.length; i ++) {
if (allActors[i].visible) {
c.save();
if (scrollingCamera.enabled && !allActors[i].scrollStatic) {
c.translate((units(allActors[i].x) - units(scrollingCamera.x)), (units(allActors[i].y) - units(scrollingCamera.y)));
} else {
c.translate(units(allActors[i].x), units(allActors[i].y));
}
if (allActors[i].rotationType == 'allAround') {
c.rotate(allActors[i].rotation * Math.PI / 180);
}
if (allActors[i].image == 'none') {
c.fillStyle = allActors[i].color;
if (allActors[i].text == '') {
c.fillRect(units(allActors[i].width) / -2, units(allActors[i].height) / -2, units(allActors[i].width), units(allActors[i].height));
} else {
//c.font = `${(units(allActors[i].width) + units(allActors[i].height)) / allActors[i].text.length + 10}px sans-serif`;
c.font = `${units(20)}px sans-serif`;
c.textBaseline = 'top';
//allActors[i].charactersPerLine = Math.round((units(allActors[i].width) / 8));
allActors[i].charactersPerLine = Math.round(allActors[i].width / 8);
//c.fillText(allActors[i].text, units(allActors[i].width) / -2, units(allActors[i].height) / 2, units(allActors[i].width))
for (p = 0; p < allActors[i].text.length; p += allActors[i].charactersPerLine) {
c.fillText(allActors[i].text.slice(p, p + allActors[i].charactersPerLine), units(allActors[i].width) / -2, units(allActors[i].height) / -2 + (p / allActors[i].charactersPerLine) * units(16.7), units(allActors[i].width));
}
}
} else {
if (typeof allActors[i].image == 'string') {
var innerGameBuilderImage = new Image();

innerGameBuilderImage.src = allActors[i].image;
} else {
//console.log(i);
var innerGameBuilderImage = allActors[i].image;
}
if (allActors[i].imageParams.width == 0) {
c.drawImage(innerGameBuilderImage, units(allActors[i].width) / -2, units(allActors[i].height) / -2, units(allActors[i].width), units(allActors[i].height));
} else {
c.drawImage(innerGameBuilderImage, allActors[i].imageParams.x, allActors[i].imageParams.y, allActors[i].imageParams.width, allActors[i].imageParams.height,
units(allActors[i].width) / -2, units(allActors[i].height) / -2, units(allActors[i].width), units(allActors[i].height));
}
}
if (allActors[i].innerGameBuilderActorObjects[0]) {
var displayBG = allActors[i].innerGameBuilderActorObjects[0];
var displayBGStyle = allActors[i].innerGameBuilderActorObjects[1];
var displayText = allActors[i].innerGameBuilderActorObjects[2];
displayText.x = allActors[i].x + displayText.width / 2 + allActors[i].width / 2;
displayText.x = displayText.x * 1.05;
displayText.y = allActors[i].y - displayText.height / 2 - allActors[i].height / 2;
displayText.y -= displayText.text.length * 1.28;
displayBG.x = displayText.x;
displayBG.y = displayText.y;
displayBGStyle.x = displayBG.x - displayBG.width / 2;
displayBGStyle.y = displayBG.y + displayBG.height / 2;
}
c.restore();
}
}
for (i3 = 0; i3 < allLines.length; i3 ++) {
if (allLines[i3].visible) {
c.save();
if (scrollingCamera.enabled) {
c.translate(-units(scrollingCamera.x), -units(scrollingCamera.y));
}
c.beginPath();
c.moveTo(units(allLines[i3].x1), units(allLines[i3].y1));
c.lineTo(units(allLines[i3].x2), units(allLines[i3].y2));
c.lineWidth = units(allLines[i3].width);
c.strokeStyle = allLines[i3].color;
c.stroke();
c.restore();
}
}
}

function newActor(actorWidth=50, actorHeight=50, actorColor='black', actorImage = 'none', addToBack = false) {
var actorObject = {x: 0, y: 0, rotation: 0, width: actorWidth, height: actorHeight, color: actorColor, image: actorImage, collide: innerGameBuilderCollide,
move: innerGameBuilderMove, lookAt: innerGameBuilderLookAt, edgeBorder: false, scrollStatic: false, rotationType: 'allAround', collidable: true,
distanceTo: innerGameBuilderDistanceTo, deleteActor: innerGameBuilderDeleteActor, text: '', charactersPerLine: 8, say: innerGameBuilderSay,
innerGameBuilderActorObjects: [], cancelSay: innerGameBuilderCancelSay, FORMERX: 0, FORMERY: 0, XSPEED: 5, YSPEED: 5, collidesActors: false,
sense: innerGameBuilderSense, imageParams: {x: 0, y: 0, width: 0, height: 0}, playAnimation: innerGameBuilderAnimate, visible: true, collideMap: false,
moveToward: innerGameBuilderMoveToward};
if (addToBack) {
allActors.unshift(actorObject);
} else {
allActors.push(actorObject);
}
return actorObject;
}

function newLine(lineX1, lineY1, lineX2, lineY2, lineWidth, lineColor) {
var lineObject = {x1: lineX1, y1: lineY1, x2: lineX2, y2: lineY2, width: lineWidth, color: lineColor, visible: true};
allLines.push(lineObject);
return lineObject;
}

function newAnimation() {
var animationObject = {animationFrames: [], animationLength: 20, animationCurrentLength: 0, currentFrame: 0};
allAnimations.push(animationObject);
return animationObject;
}

function innerGameBuilderAnimate(animation) {
if (animation != undefined) {
if (animation.animationCurrentLength > 0) {
animation.animationCurrentLength -= 1;
} else {
animation.animationCurrentLength = animation.animationLength;
if (Array.isArray(animation.animationFrames[animation.currentFrame])) {
this.image = animation.animationFrames[animation.currentFrame][0];
this.imageParams.x = animation.animationFrames[animation.currentFrame][1];
this.imageParams.y = animation.animationFrames[animation.currentFrame][2];
this.imageParams.width = animation.animationFrames[animation.currentFrame][3];
this.imageParams.height = animation.animationFrames[animation.currentFrame][4];
} else {
this.image = animation.animationFrames[animation.currentFrame];
this.imageParams.x = 0;
this.imageParams.y = 0;
this.imageParams.width = 0;
this.imageParams.height = 0;
}
animation.currentFrame ++;
if (animation.animationFrames.length < animation.currentFrame + 1) {
animation.currentFrame = 0;
}
}
}
}

function actorTop(actor) {
var top = actor.y - actor.height / 2;
top = top;
var topObject = {x: actor.x, y: top, width: actor.width / 1.5, height: 0 , collide: innerGameBuilderCollide};
return topObject;
}

function actorBottom(actor) {
var bottom = actor.y + actor.height / 2;
bottom = bottom;
var bottomObject = {x: actor.x, y: bottom, width: actor.width / 1.5, height: 0, collide: innerGameBuilderCollide};
return bottomObject;
}

function actorLeft(actor) {
var left = actor.x - actor.width / 2;
left = left;
var leftObject = {x: left, y: actor.y, width: 0, height: actor.height / 1.5, collide: innerGameBuilderCollide};
return leftObject;
}

function actorRight(actor) {
var right = actor.x + actor.width / 2;
right = right;
var rightObject = {x: right, y: actor.y, width: 0, height: actor.height / 1.5, collide: innerGameBuilderCollide};
return rightObject;
}

function innerGameBuilderCollide(object1) {
if (object1 != undefined) {
var object2 = this;
if (object1.y + object1.height / 2 >= object2.y - object2.height / 2 && object1.y - object1.height / 2 <= object2.y + object2.height / 2 && object1.x + object1.width / 2 >= object2.x - object2.width / 2 && object1.x - object1.width / 2 <= object2.x + object2.width / 2) {
return true;
} else {
return false;
}
}
}

function innerGameBuilderMove(amount) {
if (amount != undefined) {
var mesh = this;
const xChange = Math.sin(mesh.rotation * Math.PI / 180) * amount;
const yChange = Math.cos(mesh.rotation * Math.PI / 180) * amount;
mesh.x += xChange;
mesh.y -= yChange;
}
}

function innerGameBuilderLookAt(mesh2) {
if (mesh2 != undefined) {
var mesh1 = this;
var a = mesh1.x - mesh2.x;
var o = mesh1.y - mesh2.y;
const result = Math.atan(o / a) - Math.PI / 2;
if (a < 0) {
var subResult = result + Math.PI;
mesh1.rotation = subResult * 180 / Math.PI;
} else {
mesh1.rotation = result * 180 / Math.PI;
}
}
}

function innerGameBuilderDistanceTo(actor) {
if (actor != undefined) {
var actor2 = this;
var xDis = actor.x - actor2.x;
var yDis = actor.y - actor2.y;
var distance = Math.sqrt(xDis * xDis + yDis * yDis);
return distance;
}
}

function innerGameBuilderCheckCollisions() {
for (i = 0; i < allActors.length; i ++) {
// edge border
if (allActors[i].edgeBorder) {
var actor = allActors[i];
var widthScale = units(innerWidth) / window.innerWidth;
var heightScale = units(innerHeight) / window.innerHeight;
if (actor.x - actor.width / 2 < 0) {actor.x = actor.width / 2;}
if (actor.x + actor.width / 2 > window.innerWidth / widthScale) {actor.x = window.innerWidth / widthScale - actor.width / 2;}
if (actor.y - actor.height / 2 < 0) {actor.y = actor.height / 2;}
if (actor.y + actor.height / 2 > window.innerHeight / heightScale) {actor.y = window.innerHeight / heightScale - actor.height / 2;}
}
// find speed
if (allActors[i].FORMERX != allActors[i].x) {
allActors[i].XSPEED = Math.abs(allActors[i].FORMERX - allActors[i].x);
allActors[i].FORMERX = allActors[i].x;
}
if (allActors[i].FORMERY != allActors[i].y) {
allActors[i].YSPEED = Math.abs(allActors[i].FORMERY - allActors[i].y);
allActors[i].FORMERY = allActors[i].y;
}
// map collisions
var collidedMap = false;
if (allActors[i].collidesActors) {
for (i2 = 0; i2 < allActors.length; i2 ++) {
if (allActors[i] != allActors[i2] && allActors[i2].collidable) {
if (allActors[i].collide(allActors[i2])) {allActors[i].collideMap = true; collidedMap = true;}
if (actorTop(allActors[i]).collide(allActors[i2])) {allActors[i].y += allActors[i].YSPEED;}
if (actorBottom(allActors[i]).collide(allActors[i2])) {allActors[i].y -= allActors[i].YSPEED;}
if (actorLeft(allActors[i]).collide(allActors[i2])) {allActors[i].x += allActors[i].XSPEED;}
if (actorRight(allActors[i]).collide(allActors[i2])) {allActors[i].x -= allActors[i].XSPEED;}
}
}
}
if (!collidedMap) {allActors[i].collideMap = false;}
}
}

function innerGameBuilderDeleteActor() {
allActors.splice(allActors.indexOf(this), 1);
var varName = Object.keys(window).find(key => window[key] === this);
if (varName) {
window[varName] = null;
}
}

function innerGameBuilderSay(message, time=0) {
var scale = message.length * 2;
//scale = scale * 100;
for (i=0; i < this.innerGameBuilderActorObjects.length; i ++) {
this.innerGameBuilderActorObjects[i].deleteActor();
}
this.innerGameBuilderActorObjects = [];
let bGHeight = (message.length / 16) * 30;
if (bGHeight < 40) {
bGHeight = 30;
}
this.innerGameBuilderActorObjects.push(newActor(100, bGHeight, 'black'));
this.innerGameBuilderActorObjects.push(newActor(bGHeight / 5, bGHeight / 5, 'black'));
this.innerGameBuilderActorObjects.push(newActor(100, (message.length / 16) * 20, 'white'));
var displayBG = this.innerGameBuilderActorObjects[0];
var displayBGStyle = this.innerGameBuilderActorObjects[1];
var displayText = this.innerGameBuilderActorObjects[2];
displayText.text = message;
displayText.x = this.x + displayText.width / 2 + this.width / 2;
displayText.x = displayText.x * 1.05;
displayText.y = this.y - displayText.height / 2 - this.height / 2;
displayText.y -= message.length * 1.28;
displayBG.x = displayText.x;
displayBG.y = displayText.y;
displayBGStyle.x = displayBG.x - displayBG.width / 2;
displayBGStyle.y = displayBG.y + displayBG.height / 2;
displayBGStyle.rotation = 45;
var targetActor = this;
if (time) {
setTimeout(function() {innerGameBuilderCancelSay(targetActor)}, time);
}
}

function innerGameBuilderCancelSay(target=0) {
if (!target) {
target = this;
}
for (i=0; i < target.innerGameBuilderActorObjects.length; i ++) {
target.innerGameBuilderActorObjects[i].deleteActor();
}
target.innerGameBuilderActorObjects = [];
}

function innerGameBuilderSense(actor, senseRadius, maxDistance = 100, senseRotation = 0,) {
actor2 = this;
if (senseRotation == 0) {
senseRotation = actor2.rotation;
}
var sensor = {x: actor2.x, y: actor2.y, width: senseRadius, height: senseRadius, collide: innerGameBuilderCollide, rotation: senseRotation, move: innerGameBuilderMove};
for (i=0; i < maxDistance; i ++) {
if (sensor.collide(actor)) {
return actor2.distanceTo(sensor);
}
sensor.move(5);
}
}

function innerGameBuilderMoveToward(actor, amount) {
if (actor != undefined && amount != undefined) {
if (this.x > actor.x) {
this.x -= amount;
} else {
this.x += amount;
}
if (this.y > actor.y) {
this.y -= amount;
} else {
this.y += amount;
}
}
}

function randNum(max) {
return Math.floor(Math.random() * max);
}

function units(amount) {
var returnAmount = window.innerWidth * window.innerHeight / 500000;
returnAmount = returnAmount * amount;
return returnAmount;
}

function keyDown(event) {
keyHeld[event.key] = true;
try {
keyPressed(event);
}
catch {
}
}

function keyUp(event) {
keyHeld[event.key] = false;
}

function innerGameBuilderMouseMove(event) {
var yChange = units(event.clientY) / event.clientY;
var xChange = units(event.clientX) / event.clientX;
if (event.clientX != 0) {
mouse.x = event.clientX / xChange;
}
if (event.clientY != 0) {
mouse.y = event.clientY / yChange;
}
}

window.onmousedown = (event) => {  
++mouse.down;
if (event.button == 2) {
++mouse.rightDown;
}
if (event.button == 0) {
++mouse.leftDown;
}
}  
window.onmouseup = () => {  
--mouse.down;
if (event.button == 2) {
--mouse.rightDown;
}
if (event.button == 0) {
--mouse.leftDown;
}
}

document.body.appendChild(canvas);
document.querySelector('canvas').style.display = 'block';
document.querySelector('body').style.margin = '0';
