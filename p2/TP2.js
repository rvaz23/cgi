var gl;
var canvas;
var scale = 300;

var zoom = 1;
var program;
var mModelLoc;
var mModel;
var mViewLoc;
var mView;
var mProjectionLoc;
var mProjection;
var cull;
var zBuffer;
var filled;

var perSlider;
var limmaSlider;
var alphaSlider;
var gammaSlider;
var thetaSlider;

window.onload = function init() {

    loadCanvas();

    hideDropDowns();
    document.getElementById("principal").checked = true;
    document.getElementById("cavalier").checked = true;
    document.getElementById("axonometric").checked = true;
    document.getElementById("dimetric").checked = true;
    document.getElementById("cube").checked = true;
    dropDowns();

    perSlider = document.getElementById("perSlider");
    limmaSlider = document.getElementById("limmaSlider");
    alphaSlider = document.getElementById("alphaSlider");
    gammaSlider = document.getElementById("gammaSlider");
    thetaSlider = document.getElementById("thetaSlider");



    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    cubeInit(gl);
    bunnyInit(gl);
    sphereInit(gl, 0, 0);
    cylinderInit(gl);
    torusInit(gl);

    mModelLoc = gl.getUniformLocation(program, "mModel");
    mViewLoc = gl.getUniformLocation(program, "mView");
    mProjectionLoc = gl.getUniformLocation(program, "mProjection");

    mModel = mat4();



    filled = false;
    cull = false;
    zBuffer = false;
    render();
}


function loadCanvas() {
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }
    canvas.width = window.innerWidth - 15;
    canvas.height = window.innerHeight - 300;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.6, 0.6, 0.6, 1.0);
}


window.onresize = function reload() {
    canvas.width = window.innerWidth - 15;

    if (window.innerHeight - 310 < 200)
        canvas.height = 200;
    else
        canvas.height = window.innerHeight - 310;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.6, 0.6, 0.6, 1.0);
}

window.onmousewheel = function zooming(event) {
    var delta = event.deltaY;
    if (delta < 0 && zoom < 4) {
        zoom += 0.02;

    }

    if (delta > 0 && zoom > 0.01)
        zoom -= 0.01;
    checkProjection();
}

function hideDropDowns() {
    document.getElementById("orthoDrop").style.display = "none";
    document.getElementById("axonometricDrop").style.display = "none";
    document.getElementById("obliqueDrop").style.display = "none";
    document.getElementById("persepectiveDrop").style.display = "none";
    document.getElementById("freeDropAx").style.display = "none";
    document.getElementById("freeDropOb").style.display = "none";
    document.getElementById("superqDrop").style.display = "none";


}
window.onclick = dropDowns;
// ver porque e que funciona com o event    
function dropDowns(event) {
    hideDropDowns();
    if (document.getElementById("ortho").checked) {
        document.getElementById("orthoDrop").style.display = "block";
    }
    if (document.getElementById("axonometric").checked) {
        document.getElementById("axonometricDrop").style.display = "block";
    }
    if (document.getElementById("oblique").checked) {
        document.getElementById("obliqueDrop").style.display = "block";
    }
    if (document.getElementById("perspective").checked) {
        document.getElementById("persepectiveDrop").style.display = "block";
    }
    if (document.getElementById("freeax").checked) {
        document.getElementById("freeDropAx").style.display = "block";
    }
    if (document.getElementById("freeob").checked) {
        document.getElementById("freeDropOb").style.display = "block";
    }
    if (document.getElementById("superq").checked) {
        document.getElementById("superqDrop").style.display = "block";


    }

    checkProjection();


}

function checkProjection() {
    mProjection = ortho((-1 * (canvas.width / scale)) * zoom, (1 * (canvas.width / scale)) * zoom, -1 * (canvas.height / scale) * zoom, 1 * (canvas.height / scale) * zoom, -10, 10);

    if (document.getElementById("ortho").checked) {
        if (document.getElementById("principal").checked)
            /*********Ortho alcado principal*****/
            mView = mat4();
        else if (document.getElementById("laterald").checked)
            /******Alcado lateral direito***/
            mView = rotateY(-90);
        else
            /*******Planta****/
            mView = rotateX(90);

    } else if (document.getElementById("axonometric").checked) {
        if (document.getElementById("isometric").checked)
            axoProj(30, 30);
        else if (document.getElementById("dimetric").checked)
            axoProj(42, 7);
        else if (document.getElementById("trimetric").checked)
            axoProj(54.16, 23.16);
        else
            axoMatrix(parseFloat(thetaSlider.value), parseFloat(gammaSlider.value));
    } else if (document.getElementById("oblique").checked) {
        if (document.getElementById("cavalier").checked)
            oblMatrix(1, 45);
        else if (document.getElementById("cabinet").checked)
            oblMatrix(0.5, 45);
        else
            oblMatrix(parseFloat(limmaSlider.value), parseFloat(alphaSlider.value));
    } else { //perspective
        perMatrix();
    }
}

function perMatrix() {
    let d = parseFloat(perSlider.value);
    mView = mat4();
    mView[3][2] = 1 / d;
}

function oblMatrix(limma, alpha) {
    mView = mat4();
    mView[0][2] = -limma * Math.cos(radians(alpha));
    mView[1][2] = -limma * Math.sin(radians(alpha));
}

function axoProj(A, B) {
    A = radians(A);
    B = radians(B);

    let t = (Math.atan(Math.sqrt(Math.tan(A) / Math.tan(B))) - Math.PI / 2) * 180 / Math.PI;

    let g = Math.asin(Math.sqrt(Math.tan(A) * Math.tan(B))) * 180 / Math.PI;

    axoMatrix(t, g);
}

function axoMatrix(theta, gamma) {
    mView = mult(rotateX(gamma), rotateY(theta));
}



function draw() {
    if (document.getElementById("cube").checked)
        cubeDraw(gl, program, filled);
    else if (document.getElementById("sphere").checked)
        sphereDraw(gl, program, filled);
    else if (document.getElementById("superq").checked) {
        let e1 = parseFloat(document.getElementById("e1slider").value);
        let e2 = parseFloat(document.getElementById("e2slider").value);
        superQuadricInit(gl, e1, e2);
        superQuadric(gl, program, filled);
    } else if (document.getElementById("bunny").checked)
        bunnyDraw(gl, program, filled);
    else if (document.getElementById("cylinder").checked)
        cylinderDraw(gl, program, filled);
    else
        torusDraw(gl, program, filled);
}

window.onkeydown = function auto(event) {

    switch (event.keyCode) {
        case 66: //Tecla 'B'
            changeCull();
            break;
        case 90: //Tecla 'Z'
            changeZBuffer();
            break;
        case 87: //Tecla 'W'
            filled = false;
            break;
        case 70: //Tecla 'F'
            filled = true;
            break;
        default:

    }
}

function changeZBuffer() {
    zBuffer = !zBuffer;

    if (zBuffer) {
        gl.enable(gl.DEPTH_TEST);
        document.getElementById("p1").innerHTML = "True";
    } else {
        gl.disable(gl.DEPTH_TEST);
        document.getElementById("p1").innerHTML = "False";
    }

}

function changeCull() {
    cull = !cull;

    if (cull) {
        gl.enable(gl.CULL_FACE);
        gl.frontFace(gl.BACK);
        document.getElementById("p2").innerHTML = "True";
    } else {
        gl.disable(gl.CULL_FACE);
        document.getElementById("p2").innerHTML = "False";
    }
}

function render() {


    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    checkProjection();

    draw();

    gl.uniformMatrix4fv(mModelLoc, false, flatten(mModel));
    gl.uniformMatrix4fv(mViewLoc, false, flatten(mView));
    gl.uniformMatrix4fv(mProjectionLoc, false, flatten(mProjection));

    console.log(canvas.width);
    requestAnimationFrame(render);
}
