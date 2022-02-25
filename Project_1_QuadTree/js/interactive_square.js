// some globals
var gl;
var theta = 0.0;
var theta2 = 0.0;
var thetaLoc, colorLoc;
var delay = 100;
var direction = true;
var vBuffer, cBuffer;
var vBufferT, vBufferTS, vBufferTF, cBufferT, cBufferTS, cBufferTF;
var program;
var vertices = [];
var offsetT = 0 , offsetTS = 0, offsetTF = 0;
var offset_vertex_TF = 0, offset_vertex_TS = 0;
var vcolors = [];
var color_vals = [];
var color_vals2 = [];
var numOfSquare = 0 ;
var dir = true;
var offsetTri = 0;
var Triangle = false , TriangleFans = false, TriangleStrips = false ;
var numOfT = 0 , numOfTS = 0 , numOfTF = 0;

var max_prims = 400, num_triangles = 0;

window.onload = function init() {
    var canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { 
		alert( "WebGL isn't available" ); 
	}

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    thetaLoc = gl.getUniformLocation( program, "theta" );

    if(1)
    {
        vBufferT = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER , vBufferT);
	    var buffsizeT = max_prims * 6 * 2 * 4;
        gl.bufferData(gl.ARRAY_BUFFER , buffsizeT , gl.STATIC_DRAW);
        
        vBufferTF = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER , vBufferTF);
        var buffsizeTF = max_prims * 4 * 2 * 4;
        gl.bufferData(gl.ARRAY_BUFFER , buffsizeTF , gl.STATIC_DRAW);

        vBufferTS = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER , vBufferTS);
        var buffsizeTS = max_prims * 4 * 2 * 4;
        gl.bufferData(gl.ARRAY_BUFFER , buffsizeTS , gl.STATIC_DRAW);

    }

    cBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER , cBuffer);
	gl.bufferData(gl.ARRAY_BUFFER , max_prims * 6 * 4 * 4 , gl.STATIC_DRAW);

    if(1)
    {
        cBufferT = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER , cBufferT);
	    var buffsizeT = max_prims * 6 * 4 * 4;
        gl.bufferData(gl.ARRAY_BUFFER , buffsizeT , gl.STATIC_DRAW);
        
        cBufferTF = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER , cBufferTF);
        var buffsizeTF = max_prims * 4 * 4 * 4;
        gl.bufferData(gl.ARRAY_BUFFER , buffsizeTF , gl.STATIC_DRAW);

        cBufferTS = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER , cBufferTS);
        var buffsizeTS = max_prims * 4 * 4 * 4;
        gl.bufferData(gl.ARRAY_BUFFER , buffsizeTS , gl.STATIC_DRAW);
    }
	
    
	// create the square geometry, send it to GPU
    render();
};


function updateVertices() {

    document.getElementById("Triangle").onclick = function() { 
        if(Triangle){document.querySelector('#Triangle').innerText = 'Triangle[ON]';}
        else {document.querySelector('#Triangle').innerText = 'Triangle[OFF]';}
		Triangle = !Triangle;
	};

	document.getElementById("TriangleFans").onclick = function() { 
        if(TriangleFans){document.querySelector('#TriangleFans').innerText = 'TriangleFans[ON]';}
        else {document.querySelector('#TriangleFans').innerText = 'TriangleFans[OFF]';}
		TriangleFans = !TriangleFans;
	};

    document.getElementById("TriangleStrips").onclick = function() { 
        if(TriangleStrips){document.querySelector('#TriangleStrips').innerText = 'TriangleStrips[ON]';}
        else {document.querySelector('#TriangleStrips').innerText = 'TriangleStrips[OFF]';}
        TriangleStrips = !TriangleStrips;
	};

    document.onkeydown = function(e){
        var keyCode = e.keyCode;
        if(keyCode === 49)
        {
            if(Triangle){document.querySelector('#Triangle').innerText = 'Triangle[ON]';}
            else {document.querySelector('#Triangle').innerText = 'Triangle[OFF]';}
		    Triangle = !Triangle;
        }
        else if(keyCode === 50)
        {
            if(TriangleFans){document.querySelector('#TriangleFans').innerText = 'TriangleFans[ON]';}
            else {document.querySelector('#TriangleFans').innerText = 'TriangleFans[OFF]';}
		    TriangleFans = !TriangleFans;
        }
        else if(keyCode === 51)
        {
            if(TriangleStrips){document.querySelector('#TriangleStrips').innerText = 'TriangleStrips[ON]';}
            else {document.querySelector('#TriangleStrips').innerText = 'TriangleStrips[OFF]';}
            TriangleStrips = !TriangleStrips;
        }
    }

    if(Triangle)
    { 
        updateVerticesT();
    }
    if(TriangleFans)
    {       
        updateVerticesTF();
    }
    if(TriangleStrips)
    {
        updateVerticesTS();
    }

    // if(dir) {
    //     theta += 0.1;
    // }
    // else {
    //     theta -= 0.1;
    // }

}

// function updateVerticesT()
// {
//     document.getElementById("DirectionButton").onclick = function() { 
// 		dir = !dir;
// 	};

//     if (numOfSquare < max_prims)
// 	{ 
//         vertices = [];
//         vcolors = [];
//         color = [];

//         var minx = -1. , miny = -1.;
//         var max = 1. , maxy = 1. ;
        
//         var x = Math.random()* (max - minx) + minx;
//         var y = Math.random()* (maxy - miny) + miny;

        
//         //var index = Math.floor(Math.random()*3);
//         var index = 0 ;        
//         // var sizes = [0.1 , 0.03, 0.07];
//         var sizes = [0.09];

//         //Random Triangles : 
//         vertices.push([ x-sizes[index], y]); 
//         vertices.push([ x, y-sizes[index]]); 
//         vertices.push([ x, y+sizes[index]]); 

//         // triangle 4
//         vertices.push([ x,  y-sizes[index]]); 
//         vertices.push([ x+sizes[index], y]); 
//         vertices.push([ x,  y+sizes[index]]);

//         gl.bindBuffer(gl.ARRAY_BUFFER, vBufferT);

//         var offset = offsetTri * 3 * 2 * 4;
//         //console.log("offset:" + offset);
//         gl.bufferSubData(gl.ARRAY_BUFFER, offset , flatten(vertices));

//         var vPosition = gl.getAttribLocation( program, "vPosition");

//         gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);

//         // enable the vertex attribute array 
//         gl.enableVertexAttribArray(vPosition);

//         //append colors
//         var color = [ 1.0 ,0.0 ,0.0 ,1.0 ]
//         vcolors.push(color);
//         vcolors.push(color);
//         vcolors.push(color);
//         vcolors.push(color);
//         vcolors.push(color);
//         vcolors.push(color);

//         gl.bindBuffer(gl.ARRAY_BUFFER, cBufferT);

//         //offsetC += 64;
//         gl.bufferSubData(gl.ARRAY_BUFFER, offsetT , flatten(vcolors));
        
//         var vColor = gl.getAttribLocation( program, "vColor");

//         gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);

//         gl.enableVertexAttribArray(vColor);

//         numOfSquare++;
//         offsetTri += 2;	
//         offsetT += 96;
//         //console.log(offsetTri);
//     }
// }

function updateVerticesTF()
{
    document.getElementById("DirectionButton").onclick = function() 
    { 
		dir = !dir;
	};

    vertices = [];
    vcolors = [];
    color = [];
    var minx = -1. , miny = -1.;
    var max = 1. , maxy = 1. ;        
    var x = Math.random()* (max - minx) + minx;
    var y = Math.random()* (maxy - miny) + miny;        
    var index = 0;       
    var sizes = [0.01];
    
    vertices.push([ x , y ]);
    vertices.push([ x - sizes[index]/2 , y + sizes[index]/2]);
    vertices.push([ x , y + sizes[index] ]);
    vertices.push([ x + sizes[index]/2 , y + sizes[index]/2]);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vBufferTF);
    gl.bufferSubData(gl.ARRAY_BUFFER, offset_vertex_TF , flatten(vertices));
    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
 
    //append colors
    var color = [ 0.0, 1.0 ,0.0 , 1.0 ]
    vcolors.push(color);
    vcolors.push(color);
    vcolors.push(color);
    vcolors.push(color);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, cBufferTF);
    gl.bufferSubData(gl.ARRAY_BUFFER, offsetTF , flatten(vcolors));
    var vColor = gl.getAttribLocation( program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);
    
    numOfTF++;	
    offsetTF += 64;
    offset_vertex_TF += 32;
}

// function updateVerticesTS()
// {
//     document.getElementById("DirectionButton").onclick = function() { 
// 		dir = !dir;
// 	};
//     if (numOfTS < max_prims)
// 	{ 
//         vertices = [];
//         vcolors = [];
//         color = [];

//         var minx = -1. , miny = -1.;
//         var max = 1. , maxy = 1. ;       
//         var x = Math.random()* (max - minx) + minx;
//         var y = Math.random()* (maxy - miny) + miny;        
//         var index = 0 ;   
//         var sizes = [0.07];

//         vertices.push([ x , y]);
//         vertices.push([ x , y+sizes[index]]);
//         vertices.push([ x+sizes[index] , y]);
//         vertices.push([ x+sizes[index] , y+sizes[index]]);

//         gl.bindBuffer(gl.ARRAY_BUFFER, vBufferTS);
//         gl.bufferSubData(gl.ARRAY_BUFFER, offset_vertex_TS , flatten(vertices));
//         var vPosition = gl.getAttribLocation( program, "vPosition");
//         gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
//         gl.enableVertexAttribArray(vPosition);

//         var color = [ 0.0 , 0.0 , 1.0 , 1.0 ]
//         vcolors.push(color);
//         vcolors.push(color);
//         vcolors.push(color);
//         vcolors.push(color);

//         gl.bindBuffer(gl.ARRAY_BUFFER, cBufferTS);   
//         gl.bufferSubData(gl.ARRAY_BUFFER, offsetTS , flatten(vcolors));
//         var vColor = gl.getAttribLocation( program, "vColor");
//         gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
//         gl.enableVertexAttribArray(vColor);
//         numOfTS++;
//         offset_vertex_TS += 32;
//         offsetTS += 64;
	
//     }
// }

// function drawTriangleT(){
//     gl.bindBuffer(gl.ARRAY_BUFFER , vBufferT);
//     var vPosition = gl.getAttribLocation( program, "vPosition");
//     gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
//     gl.enableVertexAttribArray(vPosition);
//     gl.uniform1f(thetaLoc, theta);
    
//     gl.bindBuffer(gl.ARRAY_BUFFER , cBufferT);
//     var vColor = gl.getAttribLocation( program, "vColor");
//     gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
//     gl.enableVertexAttribArray(vColor);
//     gl.drawArrays(gl.TRIANGLES, 0, offsetTri*3);
// }

// function drawTriangleTS(){
//     gl.bindBuffer(gl.ARRAY_BUFFER , vBufferTS);
//     var vPosition = gl.getAttribLocation( program, "vPosition");
//     gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
//     gl.enableVertexAttribArray(vPosition);
//     gl.uniform1f(thetaLoc, theta);
	
//     gl.bindBuffer(gl.ARRAY_BUFFER , cBufferTS);
//     var vColor = gl.getAttribLocation( program, "vColor");
//     gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
//     gl.enableVertexAttribArray(vColor);

//     for( var i = 0; i < numOfTS ; i++)
//     {
//         gl.drawArrays(gl.TRIANGLE_STRIP, i*4, 4);
//     }
// }

function drawTriangleTF(){
    gl.bindBuffer(gl.ARRAY_BUFFER , vBufferTF);
    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    gl.uniform1f(thetaLoc, theta);
	
    gl.bindBuffer(gl.ARRAY_BUFFER , cBufferTF);
    var vColor = gl.getAttribLocation( program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    for( var i = 0; i < numOfTF ; i++) 
    {
        gl.drawArrays(gl.TRIANGLE_FAN, i*4, 4);
    }
}

function render() {
	gl.clear( gl.COLOR_BUFFER_BIT );

    updateVertices();
    // if(Triangle)
    // {
    //     drawTriangleT();
    // }
    if(TriangleFans)
    {
        drawTriangleTF();    
    }
    // if(TriangleStrips)
    // {    
    //     drawTriangleTS();
    // }

    setTimeout(
        function (){requestAnimFrame(render);}, delay
    );
}
