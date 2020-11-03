//Painting
//From textbook page 85
//********
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'void main() {\n' +
    '    gl_Position = a_Position;\n' +
    '}\n';
var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'uniform vec4 u_FragColor;\n' +
    'void main() {\n' +
    '  gl_FragColor = u_FragColor;\n' +
    '}\n';
//********

var canvas;
var gl;

var isMouseDown = 0;
var arr_vertices = [];
var arr_colors = [];
var shape_choice = 0;

var last_Mouse_x = 0;
var last_Mouse_y = 0;

function main() {

    canvas = document.getElementById("webgl");
    gl = getWebGLContext(canvas);

    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log("error: could not initialize shaders");
        return;
    }

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('error: could not get location of a_Position');
        return;
    }

    var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    //Events
    //so you keep lists of the old shapes' colors and vertices, and u concat the newly clicked one. draw_vertices reprints old shapes.
    canvas.onmousedown = function(ev) { 
      isMouseDown = 1;
      draw_shape(ev, a_Position, u_FragColor);
    };

    canvas.onmouseup = function(ev) { 
      isMouseDown = 0;
    };
    canvas.onmousemove = function(ev) {
      if(isMouseDown == 1) {
        draw_shape(ev, a_Position, u_FragColor);
      }
    };

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

function draw_shape(ev, a_Position, u_FragColor){

    //store mouse value
    var x = ev.clientX;
    var y = ev.clientY;
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    // makes sure that dragging isn't too spammy
    if (Math.abs (x - last_Mouse_x + y - last_Mouse_y) < 0.05) return;

    gl.clear(gl.COLOR_BUFFER_BIT);

    var size = document.getElementById("size").value/4;

    //DRAW based on shape selection: shape_choice
    if (shape_choice == 0) { //SQUARE, with width&height of 1, composed of 2 triangles on upleft and downright
        arr_vertices.push(
            //triangle 1
            x - (0.5*size), y + (0.5*size),
            x + (0.5*size), y + (0.5*size),
            x - (0.5*size), y - (0.5*size),
            //triangle 2
            x + (0.5*size), y + (0.5*size),
            x - (0.5*size), y - (0.5*size),
            x + (0.5*size), y - (0.5*size)
        );
        arr_colors.push(
            //triangle 1's colors
            document.getElementById("redslider").value,
            document.getElementById("greenslider").value,
            document.getElementById("blueslider").value,
            document.getElementById("alphaslider").value,
            //triangle 2's colors
            document.getElementById("redslider").value,
            document.getElementById("greenslider").value,
            document.getElementById("blueslider").value,
            document.getElementById("alphaslider").value
        );
    } else if (shape_choice == 1) { //TRIANGLE, equilateral of width 1
        arr_vertices.push(
            x, y + ((Math.sqrt(3)/4)*size),
            x - (0.5*size), y - ((Math.sqrt(3)/4)*size),
            x + (0.5*size), y - ((Math.sqrt(3)/4)*size)
        );
        arr_colors.push(
            document.getElementById("redslider").value,
            document.getElementById("greenslider").value,
            document.getElementById("blueslider").value,
            document.getElementById("alphaslider").value
        )
    } else { //CIRCLE, divide circle into equal triangles
        var wheel = 2*Math.PI / document.getElementById("segments").value;
        temp_vertices = [];
        for (var i = 0; i < 2 * Math.PI; i += wheel) {
            temp_vertices.push(
               /* x + (size * Math.cos(i)), y + (size * Math.sin(i)),
                x + (size * Math.cos(i)), y + (size * Math.sin(i)),*/
                size * Math.cos (i) + x, size * Math.sin (i) + y,
                size * Math.cos (i) + x, size * Math.sin (i) + y,
                x, y
            );
            arr_colors.push(
                document.getElementById("redslider").value,
                document.getElementById("greenslider").value,
                document.getElementById("blueslider").value,
                document.getElementById("alphaslider").value,
            );
        }
        //because the first two vertices are the same
        temp_vertices.push(temp_vertices[0], temp_vertices[1]);
        temp_vertices.shift(); //removes first element in array
        temp_vertices.shift();

        //append to global array
        arr_vertices = arr_vertices.concat(temp_vertices);
    
    }

    for (var i = 0; i < arr_vertices.length/6; i++) {
        createBuffer(a_Position, [
            arr_vertices[i*6],
            arr_vertices[i*6+1],
            arr_vertices[i*6+2],
            arr_vertices[i*6+3],
            arr_vertices[i*6+4],
            arr_vertices[i*6+5] 
            ]);
        gl.uniform4f(u_FragColor, arr_colors[i*4], arr_colors[i*4+1], arr_colors[i*4+2], arr_colors[i*4+3]);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    last_Mouse_x = x;
    last_Mouse_y = y;
}

function createBuffer(a_Position, vertex_list) {
    var vertices = new Float32Array(vertex_list);
    var buffer = gl.createBuffer();
    if (!buffer) {
        console.log('Could not load buffer.');
        return -1;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    return buffer;
}
//-------------------------------------------------------------
function clearCanvas() {
    arr_vertices = [];
    arr_colors = [];
    gl.clear(gl.COLOR_BUFFER_BIT);
}

function setTriangle() {
    shape_choice = 1;
}

function setSquare() {
    shape_choice = 0;
}

function setCircle() {
    shape_choice = 2;
}