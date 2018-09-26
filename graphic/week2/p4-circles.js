
var verticesData = [];
var canvas_colors = [];
var point_colors = [];
var triangle_colors = [];
var circle_colors = [];

var point_vertices = [];
var triangle_vertices = [];
var circle_vertices = [];

var canvas;
var canvas_menu;
var point_menu;
var triangle_menu;

var canvasIndex = 0;
var pointIndex = 0;
var triangleIndex = 0;
var circleIndex = 0;

var gl;

var draw_points_on = false;
var draw_triangle_on = false;
var draw_circle_on = false;

var maxNumTriangles = 200;
var maxNumVertices  = 3 * maxNumTriangles;

var index = 0;
var point_index = 0;
var triangle_index = 0;
var circle_index = 0;

var ATTRIBUTES = 1;
var noOfFans = 360;
var anglePerFan = (2*Math.PI) / noOfFans;
var firstClick = true;


var center_x = 0;
var center_y = 0;
var radiusOfCircle = 0;

var aPosition;
var aColors

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    canvas_menu = document.getElementById("canvas_color_menu");
    point_menu = document.getElementById("point_color_menu");
    triangle_menu = document.getElementById("triangle_color_menu");
    circle_menu = document.getElementById("circle_color_menu");


    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    canvas_menu.addEventListener("click", function() { canvasIndex = canvas_menu.selectedIndex; });
    point_menu.addEventListener("click", function() { pointIndex = point_menu.selectedIndex; });
    triangle_menu.addEventListener("click", function() { triangleIndex = triangle_menu.selectedIndex; });
    circle_menu.addEventListener("click", function() { circleIndex = circle_menu.selectedIndex; });

    canvas_colors = [
      vec4(0.3921, 0.5843, 0.9294, 1.0), // default
      vec4(0.0, 0.0, 0.0, 1.0), // black
      vec4(1.0, 0.0, 0.0, 1.0), // red
      vec4(1.0, 1.0, 0.0, 1.0), // yellow
      vec4(0.0, 1.0, 0.0, 1.0), // green
      vec4(0.0, 0.0, 1.0, 1.0), // blue
      vec4(1.0, 0.0, 1.0, 1.0), // magenta
      vec4(0.0, 1.0, 1.0, 1.0) // cyan
    ];

    point_colors = [
      vec4(0.0, 0.0, 0.0, 1.0), // black
      vec4(1.0, 0.0, 0.0, 1.0), // red
      vec4(0.0, 1.0, 0.0, 1.0), // green
      vec4(0.0, 0.0, 1.0, 1.0), // blue
    ];

    triangle_colors = [
      vec4(0.0, 0.0, 0.0, 1.0), // black
      vec4(1.0, 0.0, 0.0, 1.0), // red
      vec4(0.0, 1.0, 0.0, 1.0), // green
      vec4(0.0, 0.0, 1.0, 1.0), // blue
    ];

    circle_colors = [
      vec4(0.0, 0.0, 0.0, 1.0), // black
      vec4(1.0, 0.0, 0.0, 1.0), // red
      vec4(0.0, 1.0, 0.0, 1.0), // green
      vec4(0.0, 0.0, 1.0, 1.0), // blue
    ];

    // Load the data into the GPU

    // Associate out shader variables with our data buffer

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 8*maxNumVertices, gl.STATIC_DRAW);

    aPosition = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 16*maxNumVertices, gl.STATIC_DRAW );

    aColors = gl.getAttribLocation( program, "aColors" );
    gl.vertexAttribPointer(aColors, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aColors);

    //canvas.onmousedown = function(ev){ click(ev, gl, canvas, aPosition,aColors); };

    canvas.addEventListener("mousedown", function(event){
       //gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
       if (draw_points_on) {
         gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);

         var x = event.clientX; // x coordinate of a mouse pointer
         var y = event.clientY; // y coordinate of a mouse pointer
         var rect = event.target.getBoundingClientRect() ;

         x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
         y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

         gl.bufferSubData(gl.ARRAY_BUFFER, 8*(point_index),flatten(vec2(x,y)));

         gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);

         var t = vec4(point_colors[pointIndex]);

         gl.bufferSubData(gl.ARRAY_BUFFER, 16*point_index, flatten(t));

         point_vertices.push(index);

         point_index++;
         index++;

         render();

       }
       else if (draw_triangle_on) {

         gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);

         var x = event.clientX; // x coordinate of a mouse pointer
         var y = event.clientY; // y coordinate of a mouse pointer
         var rect = event.target.getBoundingClientRect() ;

         x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
         y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

         gl.bufferSubData(gl.ARRAY_BUFFER, 8*(triangle_index),flatten(vec2(x,y)));

         gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);

         var t = vec4(triangle_colors[triangleIndex]);

         gl.bufferSubData(gl.ARRAY_BUFFER, 16*(triangle_index), flatten(t));

         console.log("click");
         triangle_index++;

         if (triangle_index%3==0 && triangle_index != 0)
         {
            triangle_vertices.push(index);
            index += 3;
            render();
         }

       }
       else if (draw_circle_on) {

         if (firstClick)
         {
           firstClick = false;
           gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);

           var x = event.clientX; // x coordinate of a mouse pointer
           var y = event.clientY; // y coordinate of a mouse pointer
           var rect = event.target.getBoundingClientRect() ;

           center_x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
           center_y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

           var centerOfCircle = vec2(center_x,center_y);

           gl.bufferSubData(gl.ARRAY_BUFFER, 8*(circle_index),flatten(centerOfCircle));

           gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);

           var t = vec4(circle_colors[circleIndex]);

           gl.bufferSubData(gl.ARRAY_BUFFER, 16*(circle_index), flatten(t));

           //circle_vertices.push(centerOfCircle);

           circle_index++;
           index++;

           console.log("first");
         } else {
           firstClick = true;
           gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);

           var x = event.clientX; // x coordinate of a mouse pointer
           var y = event.clientY; // y coordinate of a mouse pointer
           var rect = event.target.getBoundingClientRect() ;

           x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
           y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

           var a = x - center_x;
           var b = y - center_y;

           radiusOfCircle = Math.sqrt( a*a + b*b );

           console.log(radiusOfCircle);
           for(var i = 0; i <= noOfFans; i++)
           {
              //var cindex = ATTRIBUTES * i + 2;
              var angle = anglePerFan * (i+1);
              var xCoordinate = center_x + Math.cos(angle) * radiusOfCircle;
              var yCoordinate = center_y + Math.sin(angle) * radiusOfCircle;
              var cpoint = vec2(xCoordinate, yCoordinate);

              gl.bufferSubData(gl.ARRAY_BUFFER, 8*(circle_index),flatten(cpoint));

              gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);

              var t = vec4(circle_colors[circleIndex]);

              gl.bufferSubData(gl.ARRAY_BUFFER, 16*(circle_index), flatten(t));

              circle_index++;
              //circle_vertices.push(cpoint);
              index++;


          }
           circle_vertices.push(0);
           console.log("second");
           render();
         }
       }

   } );


    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
    render();

}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );

    //var len =  triangle_vertices.length;
    //for(var i = 0; i<len; i+=5)
    console.log("Index = " + index);

    console.log("Point Array = " + point_vertices);
    console.log("Triangle Array = " + triangle_vertices);
    console.log("Circle Array = " + circle_vertices);
    //gl.drawArrays( gl.TRIANGLES, 0, 1);


    var point_len = point_vertices.length;
    for(var i=0; i<point_len; i++)
    {
      console.log("point");
      gl.drawArrays( gl.POINTS, point_vertices[i], 1 );
    }

    var triangle_len = triangle_vertices.length;
    for(var j=0; j<triangle_len; j++)
    {
      console.log("triangle");
      gl.drawArrays( gl.TRIANGLE_FAN, triangle_vertices[j], 3 );
    }

    var circle_len = circle_vertices.length;
    for(var k=0; k<circle_len; k++)
    {
      console.log("circle");
      gl.drawArrays( gl.TRIANGLE_FAN, circle_vertices[k], circle_vertices.length/ATTRIBUTES );
    }

    //gl.drawArrays( gl.TRIANGLE_FAN, 0, 360 );
}


function clear_canvas()
{
    index = 0;
    point_index = 0;
    triangle_index = 0;
    point_vertices = [];
    triangle_vertices = [];
    gl.viewport( 0.0, 0.0, canvas.width, canvas.height );
    gl.clearColor(canvas_colors[canvasIndex][0], canvas_colors[canvasIndex][1],
        canvas_colors[canvasIndex][2], 1.0);
    gl.clear( gl.COLOR_BUFFER_BIT );
}

function draw_circle()
{
  if (draw_circle_on) {
    console.log("Circle OFF");
    draw_circle_on = false;
  } else {
    console.log("Circle ON");
    draw_circle_on = true;
  }
}

function draw_triangle()
{
  if (draw_triangle_on) {
    console.log("Triangle OFF");
    draw_triangle_on = false;
  } else {
    console.log("Triangle ON");
    draw_triangle_on = true;
  }
}


function draw_points()
{
  if (draw_points_on) {
    console.log("Points OFF");
    draw_points_on = false;
  } else {
    console.log("Points ON");
    draw_points_on = true;
  }
}
