    /**
        48306 Pedro Rodrigues
        52656 Ruben Vaz
    */
    var gl;
    var isDrawing;
    var endPos;
    var timeLoc;
    var acLoc;
    var frame;
    var startPos;
    var endPos;
    var vPosition;
    var vColor;
    //buff para pos das particulas
    var bufferPos;
    var bufferVel;
    //buff tempoInicial
    var bufferTime;
    //buff com velocidade para explosao
    var bufferNewVel;
    var bufferColor;
    //buff com vel. da 2a explosao
    var buffer3Vel;
    var vel;
    var tInit;
    var tExp;
    var newVel;
    var vel3;
    var active = false;
    var program1;
    var program;

    const MAXPOINTS = 65000;
    const GR_OF_POINTS = 250;
    const MINIGRP = 5;
    const AC = 0.3;
    var numPoints;
    var index;

    window.onload = function init() {
        var canvas = document.getElementById("gl-canvas");
        gl = WebGLUtils.setupWebGL(canvas);
        if (!gl) {
            alert("WebGL isn't available");
        }
        setupCanvas();

        // Load shaders and initialize attribute buffers
        program1 = initShaders(gl, "vertex-shader-line", "fragment-shader");
        gl.useProgram(program1);

        bufferLine = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferLine);
        gl.bufferData(gl.ARRAY_BUFFER, 8 * 8, gl.STATIC_DRAW);

        posLine = gl.getAttribLocation(program1, "vPosition");
        gl.vertexAttribPointer(posLine, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(posLine);

        program = initShaders(gl, "vertex-shader", "fragment-shader");
        gl.useProgram(program);

        // Load the data into the GPU
        bufferPos = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferPos);
        gl.bufferData(gl.ARRAY_BUFFER, 8 * MAXPOINTS, gl.STATIC_DRAW);

        vPosition = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        bufferColor = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferColor);
        gl.bufferData(gl.ARRAY_BUFFER, 12 * MAXPOINTS, gl.STATIC_DRAW);

        vColor = gl.getAttribLocation(program, "vColor");
        gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vColor);


        bufferVel = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferVel);
        gl.bufferData(gl.ARRAY_BUFFER, 8 * MAXPOINTS, gl.STATIC_DRAW);

        vel = gl.getAttribLocation(program, "vel");
        gl.vertexAttribPointer(vel, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vel);


        bufferTime = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferTime);
        gl.bufferData(gl.ARRAY_BUFFER, 4 * MAXPOINTS, gl.STATIC_DRAW);
        tInit = gl.getAttribLocation(program, "tInit");
        gl.vertexAttribPointer(tInit, 1, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(tInit);

        bufferNewVel = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferNewVel);
        gl.bufferData(gl.ARRAY_BUFFER, 8 * MAXPOINTS, gl.STATIC_DRAW);
        newVel = gl.getAttribLocation(program, "newVel");
        gl.vertexAttribPointer(newVel, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(newVel);

        bufferExpTime = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferExpTime);
        gl.bufferData(gl.ARRAY_BUFFER, 4 * MAXPOINTS, gl.STATIC_DRAW);
        tExp = gl.getAttribLocation(program, "tExp");
        gl.vertexAttribPointer(tExp, 1, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(tExp);

        buffer3Vel = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer3Vel);
        gl.bufferData(gl.ARRAY_BUFFER, 8 * MAXPOINTS, gl.STATIC_DRAW);

        vel3 = gl.getAttribLocation(program, "vel3");
        gl.vertexAttribPointer(vel3, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vel3);

        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.DST_ALPHA, gl.ONE, gl.ONE);
        gl.enable(gl.BLEND);

        gl.enable(gl.DEPTH_TEST);

        // Clear the color buffer bit
        gl.clear(gl.COLOR_BUFFER_BIT);

        timeLoc = gl.getUniformLocation(program, "t");
        acLoc = gl.getUniformLocation(program, "ac");

        frame = 0.0;
        numPoints = 0;
        index = 0;
        render();
    }


    function loadLine() {
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferLine);
        gl.useProgram(program1);
        gl.vertexAttribPointer(posLine, 2, gl.FLOAT, false, 0, 0);

    }

    function loadPoints() {

        gl.useProgram(program);

        gl.bindBuffer(gl.ARRAY_BUFFER, bufferPos);
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, bufferColor);
        gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, bufferVel);
        gl.vertexAttribPointer(vel, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, bufferTime);
        gl.vertexAttribPointer(tInit, 1, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, bufferNewVel);
        gl.vertexAttribPointer(newVel, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, bufferExpTime);
        gl.vertexAttribPointer(tExp, 1, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer3Vel);
        gl.vertexAttribPointer(vel3, 2, gl.FLOAT, false, 0, 0);
    }

    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT);
        frame += 0.02;

        if (isDrawing) {
            loadLine();
            gl.drawArrays(gl.LINES, 0, 2);
            gl.drawArrays(gl.POINTS, 0, 1);
        }

        loadPoints();
        if (active) {
            if ((frame % 2).toFixed(1) == 0.2)
                loadAuto();
        }

        gl.uniform1f(timeLoc, frame);
        gl.uniform1f(acLoc, AC);
        gl.drawArrays(gl.POINTS, 0, numPoints);
        requestAnimFrame(render);
    }

    function mouseMove(event) {
        if (isDrawing) {
            var x = (event.offsetX) / canvas.width * 2 - 1;
            var y = ((event.offsetY) / (-canvas.height)) * 2 + 1;
            endPos = vec2(x, y);
            gl.bindBuffer(gl.ARRAY_BUFFER, bufferLine);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten([startPos, endPos]));
        }
    }

    function addAttributes(x, y, vX, vY, r, g, b, texp) {


        for (var i = 0; i < GR_OF_POINTS / MINIGRP; i++) {


            let newVX = Math.random() * (0.2 + 0.2) - 0.2;
            let circle = Math.sqrt((0.14 * 0.14) - (newVX * newVX));
            let newVY = Math.random() * (circle + circle) - (circle);

            for (var j = 0; j < MINIGRP; j++) {
                gl.bindBuffer(gl.ARRAY_BUFFER, bufferPos);
                gl.bufferSubData(gl.ARRAY_BUFFER, index * 8, flatten(vec2(x, y)));

                gl.bindBuffer(gl.ARRAY_BUFFER, bufferVel);
                gl.bufferSubData(gl.ARRAY_BUFFER, index * 8, flatten(vec2(vX, vY)));

                gl.bindBuffer(gl.ARRAY_BUFFER, bufferNewVel);
                gl.bufferSubData(gl.ARRAY_BUFFER, index * 8, flatten(vec2(newVX, newVY)));

                gl.bindBuffer(gl.ARRAY_BUFFER, bufferTime);
                gl.bufferSubData(gl.ARRAY_BUFFER, index * 4, flatten([frame]));

                gl.bindBuffer(gl.ARRAY_BUFFER, bufferColor);
                gl.bufferSubData(gl.ARRAY_BUFFER, index * 12, flatten(vec3(r, g, b)));

                gl.bindBuffer(gl.ARRAY_BUFFER, bufferExpTime);
                gl.bufferSubData(gl.ARRAY_BUFFER, index * 4, flatten([texp]));

                let VX3 = Math.random() * (0.2 + 0.2) - 0.2;

                circle = Math.sqrt((0.2 * 0.2) - (VX3 * VX3));
                let VY3 = Math.random() * (circle + circle) - (circle);

                gl.bindBuffer(gl.ARRAY_BUFFER, buffer3Vel);
                gl.bufferSubData(gl.ARRAY_BUFFER, index * 8, flatten(vec2(VX3, VY3)));

                if (numPoints >= MAXPOINTS) numPoints = MAXPOINTS
                else numPoints++;

                index++;

                if (index >= MAXPOINTS) index = 0;
            }
        }
    }

    function mouseUp(event) {
        if (event.button == 0) {
            isDrawing = false;

            var posX = event.offsetX / canvas.width * 2 - 1;
            var posY = event.offsetY / -canvas.height * 2 + 1;
            endPos = vec2(posX, posY);
            var vX = posX - startPos[0];
            var vY = posY - startPos[1];

            var texp = (vY / AC);
            if (texp < 0)
                texp = 0;
            //adicionar todos os pontos

            var colorMin = 0.1;
            var r = Math.random() * (1.0 - colorMin) + colorMin;
            var g = Math.random() * (1.0 - colorMin) + colorMin;
            var b = Math.random() * (1.0 - colorMin) + colorMin;

            addAttributes(startPos[0], startPos[1], vX, vY, r, g, b, texp);

            //apenas causa fragmentos se dist > 0.5
            if (diff(startPos[1], endPos[1]) > 0.5) {
                var choice = Math.floor(Math.random() * 2);
                if (choice == 1)
                    fire(startPos[0], startPos[1], vX, vY, r, g, b, texp);
            }
        }
    }

    function diff(num1, num2) {
        return (num1 > num2) ? num1 - num2 : num2 - num1
    }

    function mouseDown(event) {

        if (event.button == 0) {
            isDrawing = true;
            var posX = event.offsetX / canvas.width * 2 - 1;
            var posY = event.offsetY / -canvas.height * 2 + 1;
            startPos = vec2(posX, posY);
            endPos = startPos;
            gl.bindBuffer(gl.ARRAY_BUFFER, bufferLine);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten([startPos, endPos]));
        }
    }

    //ejeccao fragmentos
    function fire(inxpos, inypos, vX, vY, r, g, b, texp) {
        var rast = 0;

        for (x = 0; x < 100; x++) {
            gl.bindBuffer(gl.ARRAY_BUFFER, bufferPos);
            gl.bufferSubData(gl.ARRAY_BUFFER, index * 8, flatten(vec2(inxpos, inypos)));

            gl.bindBuffer(gl.ARRAY_BUFFER, bufferVel);
            gl.bufferSubData(gl.ARRAY_BUFFER, index * 8, flatten(vec2(vX, vY)));

            let nvx = Math.random() * (0.01 + 0.01) - 0.01;

            gl.bindBuffer(gl.ARRAY_BUFFER, bufferNewVel);
            gl.bufferSubData(gl.ARRAY_BUFFER, index * 8, flatten(vec2(nvx - (vX * 0.1), -0.1)));

            gl.bindBuffer(gl.ARRAY_BUFFER, bufferColor);
            gl.bufferSubData(gl.ARRAY_BUFFER, index * 12, flatten(vec3(r, g, b)));

            gl.bindBuffer(gl.ARRAY_BUFFER, bufferTime);
            gl.bufferSubData(gl.ARRAY_BUFFER, index * 4, flatten([frame]));

            if (rast >= texp)
                rast = 0;

            gl.bindBuffer(gl.ARRAY_BUFFER, buffer3Vel);
            gl.bufferSubData(gl.ARRAY_BUFFER, index * 8, flatten(vec2(0, 0)));

            gl.bindBuffer(gl.ARRAY_BUFFER, bufferExpTime);
            gl.bufferSubData(gl.ARRAY_BUFFER, index * 4, flatten([rast]));



            rast += 0.025;


            if (numPoints >= MAXPOINTS) numPoints = MAXPOINTS
            else numPoints++;
            index++;
            if (index >= MAXPOINTS) index = 0;

        }

    }

    function loadAuto() {

        let inxpos = Math.random() * (0.2 + 0.2) - 0.2;
        let inypos = -1.1;


        let vX = Math.random() * (0.3 + 0.3) - 0.3;
        let vY = Math.random() * (1 - 0.7) + 0.7;
        var texp = (vY / AC);

        var colorMin = 0.1;
        var r = Math.random() * (1.0 - colorMin) + colorMin;
        var g = Math.random() * (1.0 - colorMin) + colorMin;
        var b = Math.random() * (1.0 - colorMin) + colorMin;

        addAttributes(inxpos, inypos, vX, vY, r, g, b, texp);

        var choice = Math.floor(Math.random() * 2);
        if (choice == 1)
            fire(inxpos, inypos, vX, vY, r, g, b, texp);
    }

    function auto(event) {

        if (event.keyCode == 32)
            active = !active;
    }

    function setupCanvas() {

        canvas = document.getElementById("gl-canvas");
        gl = WebGLUtils.setupWebGL(canvas);
        if (!gl) {
            alert("WebGL isn't available");
        }

        canvas.onmousedown = mouseDown;
        canvas.onmousemove = mouseMove;
        canvas.onmouseup = mouseUp;
        window.onkeydown = auto;

        // Configure WebGL
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
    }
