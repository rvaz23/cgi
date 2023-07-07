var canvas;
var gl;
var program;

var aspect;

var mProjectionLoc, mModelViewLoc;var mProjectionLoc2, mModelViewLoc2;

var matrixStack = [];
var modelView;
var projection;

/******Texture*****/
var programTexture;
var texture;

const PLANE_SCALE = 4; //PLANE_SCALE
const REF_DISTANCE = PLANE_SCALE *10;

var proj = 0;

var time = 0;
var aileronLeft = 0;
var aileronRight = 0;
var speed = 0;
var pitch = 0;
var yaw = 0;

var rothelice =0;
var timeRot=0;

var cam=1;
var filled =false;

const bodyScale = {x: PLANE_SCALE  ,  y: PLANE_SCALE*4     , z: PLANE_SCALE  };

const wingScale = {x: bodyScale.x * 5, y:bodyScale.y*0.29, z:bodyScale.z*0.3/2};

const coneScale = {x:bodyScale.x , y:bodyScale.y/4 ,z:bodyScale.z };


const helixScale = { x: coneScale.x/10*1.3  , y:coneScale.y*0.5*1.3 ,z: coneScale.z/10 };


const landingGScale = {x:bodyScale.x * 0.02, y:bodyScale.y*0.02, z:bodyScale.z*0.4};

const tyresScale ={x:landingGScale.y*2 , y:landingGScale.y*2, z:landingGScale.y*2};




const heigth=bodyScale.x/2+landingGScale.z/2+tyresScale.z;
var pos ={xpos:0,ypos:heigth,zpos:0}
var angle={yaw:0,pitch:0,roll:0}


// Stack related operations
function pushMatrix() {
    var m = mat4(modelView[0], modelView[1],
        modelView[2], modelView[3]);
    matrixStack.push(m);
}

function popMatrix() {
    modelView = matrixStack.pop();
}
// Append transformations to modelView
function multMatrix(m) {
    modelView = mult(modelView, m);
}

function multTranslation(t) {
    modelView = mult(modelView, translate(t));
}

function multScale(s) {
    modelView = mult(modelView, scalem(s));
}

function multRotationX(angle) {
    modelView = mult(modelView, rotateX(angle));
}

function multRotationY(angle) {
    modelView = mult(modelView, rotateY(angle));
}

function multRotationZ(angle) {
    modelView = mult(modelView, rotateZ(angle));
}

function fit_canvas_to_window() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    aspect = canvas.width / canvas.height;
    gl.viewport(0, 0, canvas.width, canvas.height);

}

window.onresize = function () {
    fit_canvas_to_window();
}

window.onload = function () {
    canvas = document.getElementById('gl-canvas');

    gl = WebGLUtils.setupWebGL(document.getElementById('gl-canvas'));
    fit_canvas_to_window();

    gl.clearColor(0.5, 0.5, 0.5, 1.0);

    gl.enable(gl.DEPTH_TEST);
    
    
    programTexture = initShaders(gl, 'texture-vertex','texture-fragment' );
    program = initShaders(gl, 'default-vertex', 'default-fragment');
    
    gl.useProgram(programTexture);
    mModelViewLoc2 = gl.getUniformLocation(programTexture, "mModelView");
    mProjectionLoc2 = gl.getUniformLocation(programTexture, "mProjection");
    
    gl.useProgram(program);

    mModelViewLoc = gl.getUniformLocation(program, "mModelView");
    mProjectionLoc = gl.getUniformLocation(program, "mProjection");
    
    
    setupTexture();
    
    sphereInit(gl);
    coneInit(gl);
    pyramidInit(gl);
    cubeInit(gl);
    cylinderInit(gl);
    
    /** Vista default */
    proj=1;
    cam = 0;
    var eye=[pos.xpos+REF_DISTANCE*1.7*Math.sin(radians(-angle.yaw)), pos.ypos+REF_DISTANCE/2, pos.zpos-REF_DISTANCE*1.7*Math.cos(radians(-angle.yaw))];
    var up=[0,1,0];
    var at=[pos.xpos,pos.ypos,pos.zpos];
            modelView = lookAt(eye,at,up);
    filled=true;
    render();
}

window.onkeyup = function auto(event){
    switch (event.keyCode) {
            case 65: // 'A' 
            aileronRight =0// Math.max(-45,aileronRight-3);
            aileronLeft =0// Math.min(45,aileronLeft+3);
            break;
        case 68: // 'D'
            aileronRight =0//Math.min(45,aileronRight+3);
            aileronLeft =0//Math.max(-45,aileronLeft-3);
            break;
        case 87: // 'W'
            pitch =  0;
            break;
        case 83: // 'S'
            pitch =0;
            break;
        case 81:// 'Q'
            yaw = 0;
            break;
        case 69:// 'E'
            yaw = 0;
            break;
        default:      
    }
}

window.onkeydown = function auto(event) {
    switch (event.keyCode) {
        case 48://Tecla0 Vista Perseguição
                cam = 0;
                proj = 1;
            break;
        case 49: //Tecla1 Vista de Topo
            cam = 1;
            proj = 0;
            //modelView = lookAt([pos.xpos, REF_DISTANCE, pos.zpos],[pos.xpos, pos.ypos, pos.zpos] , [0, 0, 1]);
            break;
        case 50: //Tecla2 Vista Lateral
            cam = 2;
            proj = 0;
            break;
        case 51: //tecla3 Vista frente
            cam = 3;
            proj = 0;
            break;
        case 65: // 'A' 
            aileronRight =-45// Math.max(-45,aileronRight-3);
            aileronLeft =45// Math.min(45,aileronLeft+3);
            angle.roll-=3;
            break;
        case 68: // 'D'
            aileronRight =45// Math.min(45,aileronRight+3);
            aileronLeft =-45// Math.max(-45,aileronLeft-3);
            angle.roll+=3;
            break;
        case 82: // 'R'
            rothelice=rothelice+(speed*timeRot);
            speed = Math.min(15, speed+0.5);
            timeRot=1;
            //console.log(speed);
            break;
        case 70: //'F'
            rothelice=rothelice+(speed*timeRot);
            speed = Math.max(0, speed-0.5);
            timeRot=1;
            break;
        case 87: // 'W'
            pitch =  -45;
            angle.pitch+=Math.cos(radians(angle.roll));
            angle.yaw+=Math.sin(radians(angle.roll));
            if(angle.pitch%90.00==0.00)
                angle.pitch+=1;
            break;
        case 83: // 'S'
            pitch =45;
            angle.pitch-=Math.cos(radians(angle.roll));
            if(angle.pitch%90==0)
                angle.pitch-=1;
            angle.yaw-=Math.sin(radians(angle.roll));
            break;
        case 81: // 'Q'
            yaw = -45;
            angle.yaw+=Math.cos(radians(angle.roll));
            angle.pitch-=Math.sin(radians(angle.roll));
            break;
        case 69: // 'E'
            yaw = 45;
            angle.yaw-=Math.cos(radians(angle.roll));
            angle.pitch+=Math.sin(radians(angle.roll));
            break;
        case 79 :// 'O'
            filled=!filled;
            break;
        default:
            
    }
  
    }

function setupTexture() {
 // Create a texture.
 texture = gl.createTexture();
 gl.bindTexture(gl.TEXTURE_2D, texture);

 // Fill the texture with a 1x1 blue pixel.
 gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
 new Uint8Array([0, 0, 255, 255]));

 // Asynchronously load an image
 var image = new Image();
 image.src = "texture.jpg";
 image.onload = function() {
 gl.bindTexture(gl.TEXTURE_2D, texture);
 gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
 // setup of texture parameters
 
 gl.texParameteri(gl.TEXTURE_2D,
 gl.TEXTURE_MIN_FILTER, gl.LINEAR);
     
 // ...
 gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
 gl.bindTexture(gl.TEXTURE_2D, null);
 };
}

function wing() {
    multScale([wingScale.x, wingScale.y , wingScale.z ]);
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
    pyramidDraw(gl, program, filled);
}

const flapScale = { x: wingScale.x*0.25 , y:wingScale.y*0.2, z:wingScale.z};
function flap() {

    multScale([flapScale.x, flapScale.y, flapScale.z]);
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
    cubeDraw(gl, program, filled);
 
}

function rightSideFlaps(){
    
    
    pushMatrix();
    //rightflaps
    
    multRotationX(aileronRight); //rotacao a partir de valor
    multTranslation([flapScale.x/2,0,0]);// /2  *2 flap dir1 dir2
    flap();
    popMatrix();
    pushMatrix();
    //RightLeft 
    multTranslation([-flapScale.x/2,0,0]);
    flap();
    popMatrix();
    
}
function leftFlaps(){
    
    pushMatrix();
    //leftRight
    multTranslation([flapScale.x/2,0,0]);// /2  *2 flap dir1 dir2
    flap();
    popMatrix();
    pushMatrix();
    //rotate Movimento dos flaps
    multRotationX(aileronLeft);
    multTranslation([-flapScale.x/2,0,0]);
    flap();
    popMatrix();
}
function body(){
    multScale([bodyScale.x, bodyScale.y, bodyScale.z]);
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
    cylinderDraw(gl,program,filled); 
    
}
function mainChasis(){
    pushMatrix();
    pushMatrix();
    multRotationX(90);
    body();
    popMatrix();
   
    multTranslation([0,0,bodyScale.x*0.6]);/******ATENCAO****/
    multRotationX(90);//dir horizontal Asa+Flaps
    pushMatrix();
    wing();
    popMatrix();
    
    pushMatrix(); //right flaps
    multTranslation([wingScale.x*0.5*0.5 ,-wingScale.y/2 - flapScale.y/2,0]);//metade da metade wing, 0 , Y da wing /2 + z do flap/2
    rightSideFlaps();
    popMatrix();
    
    pushMatrix(); //left flaps
    multTranslation([-wingScale.x*0.5*0.5 , -wingScale.y/2 - flapScale.y/2, 0]);//metade da metade wing, 0 , Y da wing /2 + z do 
    leftFlaps();
    popMatrix();//fim do left
    popMatrix();
}
function front(){
    //ideia: constroi toda a frente apontada para cima e no fim roda tudo
    pushMatrix();
    multTranslation([0,0,bodyScale.y/2+coneScale.y/2]);
     multRotationX(90);//roda frente toda
    pushMatrix();
   
    nose();
    popMatrix();
    multRotationY((rothelice+speed*timeRot)*2);
    
    pushMatrix();
    multRotationX(-90);//serve para anular a rotacao a seguir
    helices();
    popMatrix();
    
    popMatrix();
    
}

function nose(){
    multScale([coneScale.x,coneScale.y , coneScale.z]);
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
    coneDraw(gl,program,filled);   
}
function helix(){
   multTranslation([0,-helixScale.y/2,coneScale.y/2]);/****ATENCAO***/
   
    multScale([helixScale.x, helixScale.y, helixScale.z]);
    
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
    pyramidDraw(gl,program,filled);
    
}
function helices(){
    pushMatrix();
  
    helix();
    popMatrix();
    pushMatrix();
    multRotationZ(90);        
        helix();
    popMatrix();
    
    pushMatrix();
        multRotationZ(180);
        helix();
    popMatrix();
    pushMatrix();
        multRotationZ(-90);
        helix();
    popMatrix();
    
}
const stabilizerScale = { x: PLANE_SCALE*2, y:  PLANE_SCALE , z: PLANE_SCALE/8  };

function stabilizer(){

    multScale([stabilizerScale.x,stabilizerScale.y, stabilizerScale.z]);
     gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
    pyramidDraw(gl,program,filled);
    
}
const elevatorScale = { x: stabilizerScale.x , y: stabilizerScale.y*0.2, z:stabilizerScale.z }
function elevator(){
    
    multScale([ elevatorScale.x,elevatorScale.y , elevatorScale.z]);
    
     gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
  cubeDraw(gl,program,filled);
    
}

const verticalFinScale = {x: PLANE_SCALE/8 , y: PLANE_SCALE/2*2  , z: PLANE_SCALE  }

function verticalFin(){
   
    multScale([ verticalFinScale.x,verticalFinScale.y ,verticalFinScale.z ]);
   // multRotationZ(90);
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
    pyramidDraw(gl,program,filled); 
    
}

const rudderScale = {x: PLANE_SCALE/8  , y: Math.sqrt((verticalFinScale.z/2)**2+verticalFinScale.y**2) , z:  PLANE_SCALE/8 }

function rudder(){

    multScale([rudderScale.x,rudderScale.y ,rudderScale.z]);
     //multRotationZ(-45);// //FAZER lOSANGULO
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
    cubeDraw(gl,program,filled);   
    
    
}

function tail(){
    pushMatrix();
   
    multTranslation([0,0,-bodyScale.y/2-coneScale.y/2]);
    pushMatrix();
    multRotationX(-90);
    nose();
    popMatrix();
    pushMatrix();
    multRotationX(90);
    pushMatrix();
    
    stabilizer();
    popMatrix();
    pushMatrix();
   // multTranslation([0,0,-PLANE_SCALE/2-PLANE_SCALE/8]);
   multTranslation([0,-stabilizerScale.y/2 - elevatorScale.y/2,0]);
    
    multRotationX(pitch);//ajustar com o pitch ENTRE -20 E 20
  //  multRotationY(90);
  //  multRotationZ(90);
    elevator();
    popMatrix();
    popMatrix();
    
    pushMatrix();//entrar no leme
    multTranslation([0,PLANE_SCALE*0.68,-PLANE_SCALE*0.2]);
    multRotationX(-27);
   
    pushMatrix();
    //multRotationX(-27);
    verticalFin();
    popMatrix();
    pushMatrix();
    
    multTranslation([0,rudderScale.y*0.03,-verticalFinScale.z*0.5*0.5-rudderScale.z/2]);
    multRotationX(27);
    //multTranslation([0,0,-PLANE_SCALE*(0.2) - rudderScale.z/2]);
   // multRotationX(90);
    multRotationY(yaw); //ajustar com o YAW ENTRE -20 E 20
    rudder();
    popMatrix();
    popMatrix();
    popMatrix();
}

const cockpitScale = {  x: bodyScale.x/2 , y: bodyScale.z  ,z: bodyScale.y*0.48 }/**ATENCAO**/
function cockpit(){
     multTranslation([0,bodyScale.z/3,bodyScale.y/5]);
    multScale([cockpitScale.x,cockpitScale.y ,cockpitScale.z]);
    
     gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
  sphereDraw(gl,program,filled);
}



function landingGear(){
    pushMatrix();
    multTranslation([bodyScale.x/4,-bodyScale.z/2,-bodyScale.y*0.3]);// em funcao do body
    pushMatrix();
   drawtyreSupport();
    popMatrix();
        pushMatrix();
     multTranslation([landingGScale.y,0,0]);// por roda ao lado do supporte
   tyre();
    popMatrix();
    multTranslation([-bodyScale.x/4*2,-0,0]);
    pushMatrix();
    drawtyreSupport();
    popMatrix();
    pushMatrix();
     multTranslation([-landingGScale.y,0,0]);
    tyre();
    popMatrix();
    popMatrix();
    multTranslation([0,-bodyScale.z/2,bodyScale.y*0.3]);
    pushMatrix();
    drawtyreSupport();
    popMatrix();
    pushMatrix();
    tyre();
    popMatrix();
    
}

function drawtyreSupport(){
       multScale([landingGScale.x, landingGScale.z, landingGScale.y]); 
   gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
  cylinderDraw(gl,program,filled);
    
    
}

function tyre(){
    multTranslation([0,-landingGScale.z/2,0]);// em funcao do suporte
    multRotationX(90);
    multRotationZ(90);
    multScale([tyresScale.x, tyresScale.y, tyresScale.z]); 
    
   multRotationY(-(rothelice+speed*timeRot));// rotacao das rodas no movimento
     gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
  cylinderDraw(gl,program,filled);
}


const planeLength = coneScale.y*2 + bodyScale.y ;
const floorScale = {x: planeLength*8 ,  y: PLANE_SCALE/8  , z:planeLength*8}

function floor() {
  
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
 
    gl.uniform1i(gl.getUniformLocation(programTexture, "texture"), 0);
    gl.uniformMatrix4fv(mProjectionLoc2, false, flatten(projection));
      
 for(var i=Math.round(pos.xpos/floorScale.x)*floorScale.x-floorScale.x;i<=Math.round(pos.xpos/floorScale.x)*floorScale.x+floorScale.x;i+= floorScale.x){
    for(var j=Math.round(pos.zpos/floorScale.z)*floorScale.z-floorScale.z;j<=Math.round(pos.zpos/floorScale.z)*floorScale.z+floorScale.z;j+= floorScale.z){ 
        
    pushMatrix();
 
    multTranslation([i,0,j]);
    multScale([ floorScale.x,floorScale.y, floorScale.z]);
    gl.uniformMatrix4fv(mModelViewLoc2, false, flatten(modelView));
    cubeDraw(gl,programTexture,true);
    popMatrix();
    }
  }
 }

function move(){
    
    //pitch entre 0 e 360
    if(angle.pitch%360==0)
        angle.pitch=0;
    if(angle.pitch<0)
     angle.pitch=360+angle.pitch;
    
    //rool de 0 a 360
     if(angle.roll%360==0)
        angle.roll=0;
    if(angle.roll<0)
     angle.roll=360+angle.roll;
    
    if(angle.yaw%360==0)
        angle.yaw=0;
   

    let angY=radians(angle.yaw);
    let angP=radians(angle.pitch);
    //let angR=radians(angle.roll);
    pos.zpos+=(Math.cos(angY)*Math.cos(angP))*speed*0.1;
    pos.xpos+=(Math.sin(angY)*Math.cos(angP))*speed*0.1;
    console.log(angle.roll);
    pos.ypos-=Math.sin(angP)*speed*0.1;
    if(pos.ypos<heigth)
        pos.ypos=heigth;
    
}

function selectcam(){
    switch (cam){
        case 0:
            var x =pos.xpos+REF_DISTANCE*1.7*Math.sin(radians(-angle.yaw))*Math.cos(radians(-angle.pitch));
            var y =pos.ypos+REF_DISTANCE*2*Math.sin(radians(angle.pitch))+REF_DISTANCE/2;
            var z=pos.zpos-REF_DISTANCE*1.7*Math.cos(radians(-angle.yaw))*Math.cos(radians(-angle.pitch));
            var eye=[x, y, z];
        
        
            if(angle.pitch<=270 & angle.pitch>90)
                var up =[0,-1,0];
            else
                var up=[0,1,0];
            var at=[pos.xpos,pos.ypos,pos.zpos];
            modelView = lookAt(eye,at,up);
            break;
        case 1:
           
            var eye=[(pos.xpos),(pos.ypos)*REF_DISTANCE*0.5,(pos.zpos)];
            console.log((pos.ypos)*REF_DISTANCE*0.5)
            var up=[0,0,1];
            var at=[pos.xpos,pos.ypos,pos.zpos];
            modelView = lookAt(eye,at,up);
            break;
        case 2:eye=[pos.xpos+REF_DISTANCE*Math.cos(radians(-angle.yaw)),pos.ypos,pos.zpos+REF_DISTANCE*Math.sin(radians(-angle.yaw))];
        var up=[0,1,0];
            var at=[pos.xpos,pos.ypos,pos.zpos];
            modelView = lookAt(eye,at,up);
            break;
        case 3:var eye=[pos.xpos-REF_DISTANCE*Math.sin(radians(-angle.yaw)),pos.ypos,pos.zpos+REF_DISTANCE*Math.cos(radians(-angle.yaw))];
        var up=[0,1,0];
            var at=[pos.xpos,pos.ypos,pos.zpos];
            modelView = lookAt(eye,at,up);
            break;
        
    }
}


function render() {
     time += 0.5;
    timeRot+=0.5;
    
    move();
    
    requestAnimationFrame(render);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    gl.useProgram(program);
    
    if(proj == 0){
        projection =ortho(-REF_DISTANCE * aspect, REF_DISTANCE * aspect, -REF_DISTANCE, REF_DISTANCE,-(pos.ypos)*REF_DISTANCE*0.5,(pos.ypos)*REF_DISTANCE*3);

    }else{
            
    projection = perspective( 35, canvas.width/canvas.height, REF_DISTANCE, -REF_DISTANCE*3 );/****ATENCAO FAR *1.5 MAYBE **/
    }
    
       
    gl.uniformMatrix4fv(mProjectionLoc, false, flatten(projection));

  
    
    selectcam();
   pushMatrix();//Start
   
    pushMatrix();
   
     multTranslation([pos.xpos,pos.ypos,pos.zpos]);
    
    
    
    multRotationY(angle.yaw);
    multRotationX(angle.pitch);
    multRotationZ(angle.roll);
    mainChasis();
    
    
   front();
    
    tail();
    pushMatrix();
    cockpit();
    popMatrix();
    
    landingGear();
    popMatrix();
    
    
    popMatrix();//ENd
    
   
    
    gl.useProgram(programTexture);
    
     floor();
    
}