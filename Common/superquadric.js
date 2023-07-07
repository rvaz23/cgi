var superQ_points = [];
var superQ_normals = [];
var superQ_faces = [];
var superQ_edges = [];

var superQ_points_buffer;
var superQ_normals_buffer;
var superQ_faces_buffer;
var superQ_edges_buffer;

var SUPERQ_LATS = 20;
var SUPERQ_LONS = 30;


function superQuadricInit(gl, e1, e2) {

    superQuadricBuild(e1, e2);
    superQuadricUploadData(gl);
}

function superQuadricBuild(e1, e2) {
    
    superQ_points = [];
    superQ_normals = [];
    superQ_faces = [];
    superQ_edges = [];

    // phi will be latitude
    // theta will be longitude

    var d_phi = Math.PI / (SUPERQ_LATS + 1);
    var d_theta = 2 * Math.PI / SUPERQ_LONS;
    var r = 0.5;

    // Generate north polar cap
    var north = vec3(0, r, 0);
    superQ_points.push(north);
    superQ_normals.push(vec3(0, 1, 0));

    // Generate middle
    for (var i = 0, phi = Math.PI / 2 - d_phi; i < SUPERQ_LATS; i++, phi -= d_phi) {
        for (var j = 0, theta = 0; j < SUPERQ_LONS; j++, theta += d_theta) {
            let cosPhi = Math.cos(phi);
            let cosThe = Math.cos(theta);
            let sinThe = Math.sin(theta);

            let x = r * (Math.sign(cosPhi) * Math.abs(cosPhi) ** e1) * (Math.sign(cosThe) * Math.abs(cosThe) ** e2);

            let y = r * Math.sign(Math.sin(phi)) * Math.abs(Math.sin(phi)) ** e1;

            let z = r * (Math.sign(cosPhi) * Math.abs(cosPhi) ** e1) * (Math.sign(sinThe) * Math.abs(sinThe) ** e2);

            var pt = vec3(x, y, z);
            superQ_points.push(pt);
            var n = vec3(pt);
            superQ_normals.push(normalize(n));
        }
    }

    // Generate norh south cap
    var south = vec3(0, -r, 0);
    superQ_points.push(south);
    superQ_normals.push(vec3(0, -1, 0));

    // Generate the faces

    // north pole faces
    for (var i = 0; i < SUPERQ_LONS - 1; i++) {
        superQ_faces.push(0);
        superQ_faces.push(i + 2);
        superQ_faces.push(i + 1);
    }
    superQ_faces.push(0);
    superQ_faces.push(1);
    superQ_faces.push(SUPERQ_LONS);

    // general middle faces
    var offset = 1;

    for (var i = 0; i < SUPERQ_LATS - 1; i++) {
        for (var j = 0; j < SUPERQ_LONS - 1; j++) {
            var p = offset + i * SUPERQ_LONS + j;
            superQ_faces.push(p);
            superQ_faces.push(p + SUPERQ_LONS + 1);
            superQ_faces.push(p + SUPERQ_LONS);

            superQ_faces.push(p);
            superQ_faces.push(p + 1);
            superQ_faces.push(p + SUPERQ_LONS + 1);
        }
        var p = offset + i * SUPERQ_LONS + SUPERQ_LONS - 1;
        superQ_faces.push(p);
        superQ_faces.push(p + 1);
        superQ_faces.push(p + SUPERQ_LONS);

        superQ_faces.push(p);
        superQ_faces.push(p - SUPERQ_LONS + 1);
        superQ_faces.push(p + 1);
    }

    // south pole faces
    var offset = 1 + (SUPERQ_LATS - 1) * SUPERQ_LONS;
    for (var j = 0; j < SUPERQ_LONS - 1; j++) {
        superQ_faces.push(offset + SUPERQ_LONS);
        superQ_faces.push(offset + j);
        superQ_faces.push(offset + j + 1);
    }
    superQ_faces.push(offset + SUPERQ_LONS);
    superQ_faces.push(offset + SUPERQ_LONS - 1);
    superQ_faces.push(offset);

    // Build the edges
    for (var i = 0; i < SUPERQ_LONS; i++) {
        superQ_edges.push(0); // North pole 
        superQ_edges.push(i + 1);
    }

    for (var i = 0; i < SUPERQ_LATS; i++, p++) {
        for (var j = 0; j < SUPERQ_LONS; j++, p++) {
            var p = 1 + i * SUPERQ_LONS + j;
            superQ_edges.push(p); // horizontal line (same latitude)
            if (j != SUPERQ_LONS - 1)
                superQ_edges.push(p + 1);
            else superQ_edges.push(p + 1 - SUPERQ_LONS);

            if (i != SUPERQ_LATS - 1) {
                superQ_edges.push(p); // vertical line (same longitude)
                superQ_edges.push(p + SUPERQ_LONS);
            } else {
                superQ_edges.push(p);
                superQ_edges.push(superQ_points.length - 1);
            }
        }
    }


}

function superQuadricUploadData(gl) {
    superQ_points_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, superQ_points_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(superQ_points), gl.STATIC_DRAW);

    superQ_normals_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, superQ_normals_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(superQ_normals), gl.STATIC_DRAW);

    superQ_faces_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, superQ_faces_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(superQ_faces), gl.STATIC_DRAW);

    superQ_edges_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, superQ_edges_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(superQ_edges), gl.STATIC_DRAW);
}

function superQuadricWireFrame(gl, program) {
    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, superQ_points_buffer);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, superQ_normals_buffer);
    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, superQ_edges_buffer);
    gl.drawElements(gl.LINES, superQ_edges.length, gl.UNSIGNED_SHORT, 0);
}

function superQuadricFilled(gl, program)
{
    gl.useProgram(program);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, superQ_points_buffer);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, superQ_normals_buffer);
    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, superQ_faces_buffer);
    gl.drawElements(gl.TRIANGLES, superQ_faces.length, gl.UNSIGNED_SHORT, 0);
}



function superQuadric(gl, program, filled = false) {
    if (filled) superQuadricFilled(gl, program);
    else superQuadricWireFrame(gl, program);
}
