

// some globals
var gl;
var delay = 100;
var direction = true;
var vBuffer, cBuffer;
var program;
var vertices = [];
var vcolors = [];
var dir = true;
var randpts = [];
var numRandPts = 10;
var canvas;
var quadLines= [];
var pcolors = [];
var LineColors = [];
var LineCoords = [];
var InterLineColors = [];
var IntPtColors = [];
var InterPts = [];


class quadrant {

	constructor(top , bottom , start , end , ListPts = []){
		this.top = top ;
		this.bottom = bottom ;
		this.start = start ;
		this.end = end ;
		this._ListPts = ListPts ;
	}

	get height () {
		return this.height;
	}

	get width () {
		return this.width;
	}

	get ListPts () {
		return this._ListPts;
	}

}

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { 
		alert( "WebGL isn't available" ); 
	}
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
	vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER , vBuffer);
	var buffsize = numRandPts * 6 * 2 * 4;
	gl.bufferData(gl.ARRAY_BUFFER , buffsize , gl.STATIC_DRAW);

    cBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER , cBuffer);
	gl.bufferData(gl.ARRAY_BUFFER , numRandPts * 6 * 4 * 4 , gl.STATIC_DRAW);
	
	//lineBuffer
	LineBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER , LineBuffer);
	var buffsize = 500 * 6 * 2 * 4;
	gl.bufferData(gl.ARRAY_BUFFER , buffsize , gl.STATIC_DRAW);

	//lineColorBuffer
    LineColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER , LineColorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER , 500 * 6 * 4 * 4 , gl.STATIC_DRAW);

	//InterlineBuffer
	InterlineBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER , InterlineBuffer);
	var buffsize =  6 * 2 * 4;
	gl.bufferData(gl.ARRAY_BUFFER , buffsize , gl.STATIC_DRAW);

	//InterlineColorBuffer
	InterlineColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER , InterlineColorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER ,  6 * 4 * 4 , gl.STATIC_DRAW);

	//InterPtBuffer
	InterPtBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER , InterPtBuffer);
	var buffsize =  6 * 2 * 4;
	gl.bufferData(gl.ARRAY_BUFFER , buffsize , gl.STATIC_DRAW);

	//InterPtColorBuffer
	InterPtColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER , InterPtColorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER ,  6 * 4 * 4 , gl.STATIC_DRAW);

	var root = canvas;
	genRandPts();

	var threshold = 4;
	let Quad = new quadrant( 1 , -1 , -1 , 1 , randpts);
	var QuadsObjs = [];
	QuadsObjs.push(Quad);

	while(QuadsObjs.length > 0)
	{
		var currQuad = QuadsObjs.pop();
		if (currQuad._ListPts.length > threshold)
		{
			var result = DivideQuadrant(currQuad.top , currQuad.bottom, currQuad.start , currQuad.end );
			result.forEach(i => {
				var jPointsAhet = [];
				currQuad._ListPts.forEach( j => {
					
					if ( j[1] <= i[0] && j[1] >= i[1] && j[0] >= i[2] && j[0] <= i[3])
					{
						jPointsAhet.push(j);
					}
			});
				var temp = new quadrant(i[0] , i[1] , i[2] , i[3] , jPointsAhet);
				QuadsObjs.push(temp);
			});
		}
	}

	document.getElementById("InterSection").addEventListener("click" , DrawIntersectionLine );

	bindLineBuffer();
	if(LineCoords.length == 2)
	{
	bindInterSecLine();
	}

	bindInterPtBuffer();

    render();
};

function bindInterPtBuffer(){
	gl.bindBuffer(gl.ARRAY_BUFFER, InterPtBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(InterPts) , gl.STATIC_DRAW);
	var vPosition = gl.getAttribLocation( program, "vPosition");
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0); 
	gl.enableVertexAttribArray(vPosition);

	for(var i = 0 ; i < InterPts.length ; i++){
		IntPtColors.push([0.0,0.0,1.0,1.0]);
	}

	//bind line color buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, InterPtColorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(IntPtColors) , gl.STATIC_DRAW);
	var vColor = gl.getAttribLocation( program, "vColor");
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vColor);
}

function worldToNormalizedDeviceCoords(){

    var translate1 = translate2d(-100 , -100);
    var scale = scale2d(2/200 , 2/200);
    var translate2 = translate2d(1.0 , 1.0);
    result = mult(translate2 , mult(scale , translate1));
    var Wcoords = vec4(worldCoords[0] , worldCoords[1] , 0.0 , 1.0);
    var ndcCoords = vec3(dot_prod(result[0], Wcoords) , dot_prod(result[1], Wcoords) , dot_prod(result[2], Wcoords));
    return [ ndcCoords[0] , ndcCoords[1] ];
}

function DrawIntersectionLine(event){
	document.getElementById("InterSection").value = "Draw[OFF]";
	document.getElementById("gl-canvas").onclick = function(event)
	{
	var temp = [event.clientX , event.clientY];
	var NdcLines = DisplayDeviceToWorld(temp);
	LineCoords.push(worldToNormalizedDeviceCoords(NdcLines));
	if(LineCoords.length == 2)
        {
			calcIntersections(LineCoords , quadLines);
			bindInterSecLine();
		}
	}
}


function calcIntersections(LineCoords , quadLines){

	for(var i = 0 ; i < quadLines.length - 1; i++)
	{
		var temp = (intersect(LineCoords[0][0] , LineCoords[0][1] , LineCoords[1][0] , LineCoords[1][1] ,	
			quadLines[i][0] , quadLines[i][1] , quadLines[i+1][0] , quadLines[i+1][1] ))		
		if(temp)
		{
			InterPts.push(temp);
		}
	}

	console.log("intersections" , InterPts);

}

function intersect(x1, y1, x2, y2, x3, y3, x4, y4) {

	if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
	  return false
	}

	denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))

	if (denominator === 0) {
	  return false
	}

	let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
	let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator

	if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
	  return false
	}

	let x = x1 + ua * (x2 - x1)
	let y = y1 + ua * (y2 - y1)

	return [x, y]
}


function bindInterSecLine(){
	gl.bindBuffer(gl.ARRAY_BUFFER, InterlineBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(LineCoords) , gl.STATIC_DRAW);
	var vPosition = gl.getAttribLocation( program, "vPosition");
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0); 
	gl.enableVertexAttribArray(vPosition);

	for(var i = 0 ; i < LineCoords.length ; i++){
		InterLineColors.push([0.0,0.0,1.0,1.0]);
	}

	//bind line color buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, InterlineColorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(InterlineColorBuffer) , gl.STATIC_DRAW);
	var vColor = gl.getAttribLocation( program, "vColor");
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vColor);
}

function bindLineBuffer(){
	//bind Line BUffer
	gl.bindBuffer(gl.ARRAY_BUFFER, LineBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(quadLines) , gl.STATIC_DRAW);
	var vPosition = gl.getAttribLocation( program, "vPosition");
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0); 
	gl.enableVertexAttribArray(vPosition);

	for(var i = 0 ; i < quadLines.length ; i++){
		LineColors.push([1.0,0.0,1.0,1.0]);
	}

	//bind line color buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, LineColorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(LineColors) , gl.STATIC_DRAW);
	var vColor = gl.getAttribLocation( program, "vColor");
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vColor);
}

var displayCoordsArr = 0;
var worldCoords = 0;

function scale2d(width , height){
    return mat4(vec4(width , 0.0 , 0.0 , 0.0), 
                vec4(0.0 , height , 0.0 , 0.0), 
                vec4(0.0 , 0.0 , 1.0 , 0.0), 
                vec4(0.0 , 0.0 , 0.0 , 1.0));
}

function translate2d(min , max){
    return mat4(vec4(1.0 ,0.0, min , 0.0) , 
                vec4(0.0 ,1.0 ,max , 0.0) , 
                vec4(0.0, 0.0, 1.0 , 0.0) , 
                vec4(0.0 ,0.0, 0.0 , 1.0));
}

function dot_prod(vec1 , vec2){
    return ((vec1[0]*vec2[0]) + (vec1[1]*vec2[1]) + (vec1[2]*vec2[2]) + (vec1[3]*vec2[3])) ;
}

function DisplayDeviceToWorld(displayCoords){

    displayCoordsArr = vec4(displayCoords[0] , 520-displayCoords[1] , 1.0 , 0.0);
    var scale = scale2d(200/(document.getElementById('gl-canvas').width) , 200/(document.getElementById('gl-canvas').height));
    var translate = translate2d(-100 , -100); //worldminx, worldminy
    var resultD2W = mult(translate , scale);

    worldCoords = vec4(dot_prod(resultD2W[0] , displayCoordsArr) , 
                       dot_prod(resultD2W[1] , displayCoordsArr) , 
                       dot_prod(resultD2W[2] , displayCoordsArr) , 
                       dot_prod(resultD2W[3] , displayCoordsArr));

    return [ worldCoords[0] , worldCoords[1] ];
}


function DivideQuadrant(top , bottom , start , end){
	var newQuadSets = []
	newQuadSets.push([top , (top+bottom)/2 , start , (start+end)/2]);
	newQuadSets.push([(top+bottom)/2 - 0.000001 , bottom , start , (start+end)/2]);
	newQuadSets.push([top , (top+bottom)/2  , (start+end)/2 + 0.000001 , end]);
	newQuadSets.push([(top+bottom)/2 - 0.000001 , bottom , (start+end)/2 + 0.000001 , end]);
	
	DrawLine(top , bottom , start , end);
	return newQuadSets;
}

function DrawLine(top , bottom , start , end){
	quadLines.push([start , (top+bottom)/2]);
	quadLines.push([end , (top+bottom)/2]);
	quadLines.push([(start+end)/2 , top ]);
	quadLines.push([(start+end)/2 , bottom ]);
}

function genRandPts(){
	var minx = -1.0 , miny = -1.0;
	var max = 0.0 , maxy = 0.0 ;
	var pcolors = [];
	numRandPts = Math.random()* (300 - 20) + 20;
	//numRandPts = 30;

	for(var i = 0 ; i < numRandPts/4 ; i++){
		var x = Math.random()* (max - minx) + minx;
		var y = Math.random()* (maxy - miny) + miny;
		randpts.push([x,y]);
	}

	for(var i = 0 ; i < (3*numRandPts)/4 ; i++){
		var x = Math.random()* (1.0 - (-1.0)) + (-1.0);
		var y = Math.random()* ((1.0) - (-1.0)) + (-1.0);
		randpts.push([x,y]);
	}

	// gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	// gl.bufferData(gl.ARRAY_BUFFER, flatten(randpts) , gl.STATIC_DRAW);
	// var vPosition = gl.getAttribLocation( program, "vPosition");
	// gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0); 
	// gl.enableVertexAttribArray(vPosition);

	// for(var i = 0 ; i < randpts.length ; i++){
	// 	pcolors.push([0.0,1.0,0.0,1.0]);
	// }

	// gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
	// gl.bufferData(gl.ARRAY_BUFFER, flatten(pcolors) , gl.STATIC_DRAW);
	// var vColor = gl.getAttribLocation( program, "vColor");
	// gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
	// gl.enableVertexAttribArray(vColor);

}

function ActuallyDrawLine(){
	//bind Line BUffer
	gl.bindBuffer(gl.ARRAY_BUFFER, LineBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(quadLines) , gl.STATIC_DRAW);
	var vPosition = gl.getAttribLocation( program, "vPosition");
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0); 
	gl.enableVertexAttribArray(vPosition);

	for(var i = 0 ; i < quadLines.length ; i++){
		LineColors.push([1.0,0.0,1.0,1.0]);
	}

	//bind line color buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, LineColorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(LineColors) , gl.STATIC_DRAW);
	var vColor = gl.getAttribLocation( program, "vColor");
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vColor);

	gl.drawArrays(gl.LINES , 0 , quadLines.length);
}

function ActuallyDrawInterLine(){
	gl.bindBuffer(gl.ARRAY_BUFFER, InterlineBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(LineCoords) , gl.STATIC_DRAW);
	var vPosition = gl.getAttribLocation( program, "vPosition");
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0); 
	gl.enableVertexAttribArray(vPosition);

	for(var i = 0 ; i < LineCoords.length ; i++){
		InterLineColors.push([0.0,0.0,1.0,1.0]);
	}

	//bind line color buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, InterlineColorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(InterlineColorBuffer) , gl.STATIC_DRAW);
	var vColor = gl.getAttribLocation( program, "vColor");
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vColor);

	gl.drawArrays(gl.LINES , 0 , LineCoords.length);
}

function ActuallyDrawPts(){

	//point buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(randpts) , gl.STATIC_DRAW);
	var vPosition = gl.getAttribLocation( program, "vPosition");
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0); 
	gl.enableVertexAttribArray(vPosition);

	for(var i = 0 ; i < randpts.length ; i++){
		pcolors.push([0.0,1.0,0.0,1.0]);
	}

	//point color buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(pcolors) , gl.STATIC_DRAW);
	var vColor = gl.getAttribLocation( program, "vColor");
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vColor);

	gl.drawArrays(gl.POINTS , 0 , randpts.length);
}

function ActuallyDrawInterPts(){

	gl.bindBuffer(gl.ARRAY_BUFFER, InterPtBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(InterPts) , gl.STATIC_DRAW);
	var vPosition = gl.getAttribLocation( program, "vPosition");
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0); 
	gl.enableVertexAttribArray(vPosition);

	for(var i = 0 ; i < InterPts.length ; i++){
		IntPtColors.push([0.0,0.0,1.0,1.0]);
	}

	//bind line color buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, InterPtColorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(IntPtColors) , gl.STATIC_DRAW);
	var vColor = gl.getAttribLocation( program, "vColor");
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vColor);

	gl.drawArrays(gl.POINTS , 0 , InterPts.length);

}

function render() {
	gl.clear( gl.COLOR_BUFFER_BIT );
	
	ActuallyDrawPts();
	ActuallyDrawLine();
	ActuallyDrawInterLine();
	ActuallyDrawInterPts();

	setTimeout(
        function (){requestAnimFrame(render);}, delay
    );
}
