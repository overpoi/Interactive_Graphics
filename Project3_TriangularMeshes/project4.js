// This function takes the projection matrix, the translation, and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// The given projection matrix is also a 4x4 matrix stored as an array in column-major order.
// You can use the MatrixMult function defined in project4.html to multiply two 4x4 matrices in the same format.


function GetModelViewProjection(projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY) {


	var translation = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        translationX, translationY, translationZ, 1
    ];

    var rotationX = [
        1, 0, 0, 0,
        0, Math.cos(rotationX), Math.sin(rotationX), 0,
        0, -Math.sin(rotationX), Math.cos(rotationX), 0,
        0, 0, 0, 1
    ];

	//the matrix on the slides has wrong signs
    var rotationY = [
        Math.cos(rotationY), 0, -Math.sin(rotationY), 0,
        0, 1, 0, 0,
        Math.sin(rotationY), 0, Math.cos(rotationY), 0,
        0, 0, 0, 1
    ];


    // rotationX, rotationY, translation, projection
    var trans1 = MatrixMult(rotationY, rotationX);
    trans2 = MatrixMult(translation, trans1);
    var mvp = MatrixMult(projectionMatrix, trans2);

    return mvp;
}




// [TO-DO] Complete the implementation of the following class.

class MeshDrawer
{
	// The constructor is a good place for taking care of the necessary initializations.
	constructor()
	{

		// [TO-DO] initializations
		this.prog = InitShaderProgram(vertexShader, fragmentShader);
		
		this.vertPosLoc = gl.getAttribLocation(this.prog, 'pos');
		this.texCoordLoc = gl.getAttribLocation(this.prog, 'texCoord');

		this.mvpLoc = gl.getUniformLocation(this.prog, 'mvp'); 
		this.yzSwapLoc = gl.getUniformLocation(this.prog, 'yzSwap');
		this.showTexLoc = gl.getUniformLocation(this.prog, 'showTex'); 
		this.colorLoc = gl.getUniformLocation(this.prog, 'color');
		this.sampler = gl.getUniformLocation(this.prog, 'tex');
		
		this.vertbuffer = gl.createBuffer(); 
		this.texbuffer = gl.createBuffer(); 

		this.numTriangles = 0;
		
		this.yz = [
			1,0,0,0,
			0,1,0,0,
			0,0,1,0,
			0,0,0,1];
	}
		
	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions
	// and an array of 2D texture coordinates.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex.
	// Note that this method can be called multiple times.
	setMesh( vertPos, texCoords)
	{
		// [TO-DO] Update the contents of the vertex buffer objects.
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer); 
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer); 
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

		this.numTriangles = vertPos.length / 3;
	}
	
	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ( swap )
	{
		// [TO-DO] Set the uniform parameter(s) of the vertex shader
		if(swap){
			this.yz = MatrixMult(
				[
					1,0,0,0,
					0,-1,0,0,
					0,0,1,0,
					0,0,0,1
				], 
				[
					1,0,0,0,
					0,Math.cos(Math.PI/2),Math.sin(Math.PI/2),0,
					0,-Math.sin(Math.PI/2),Math.cos(Math.PI/2),0,
					0,0,0,1,
				]
			);

		}else{
			this.yz = [
				1,0,0,0,
				0,1,0,0,
				0,0,1,0,
				0,0,0,1];
		}
	}
	
	// This method is called to draw the triangular mesh.
	// The argument is the transformation matrix, the same matrix returned
	// by the GetModelViewProjection function above.
	draw( trans )
	{
		// [TO-DO] Complete the WebGL initializations before drawing
		gl.useProgram(this.prog); 

		gl.uniformMatrix4fv(this.mvpLoc, false, trans);
		gl.uniformMatrix4fv(this.yzSwapLoc,false, this.yz); 
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer); 
		gl.enableVertexAttribArray( this.vertPosLoc);
		gl.vertexAttribPointer(this.vertPosLoc, 3, gl.FLOAT, false, 0, 0); 

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer); 
		gl.enableVertexAttribArray(this.texCoordLoc);
		gl.vertexAttribPointer(this.texCoordLoc, 2, gl.FLOAT, false, 0, 0);
 
		gl.drawArrays( gl.TRIANGLES, 0, this.numTriangles );
	}
	
	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture( img )
	{
		// [TO-DO] Bind the texture
		const mytex = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, mytex);
		
		// You can set the texture image data using the following command.
		gl.texImage2D( 
			gl.TEXTURE_2D, 
			0, 
			gl.RGB, 
			gl.RGB, 
			gl.UNSIGNED_BYTE, 
			img );


		gl.generateMipmap(gl.TEXTURE_2D);		

		// Set texture parameters 

		this.showTexture(true);

		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT );

		// [TO-DO] Now that we have a texture, it might be a good idea to set
		// some uniform parameter(s) of the fragment shader, so that it uses the texture.
		

		gl.activeTexture(gl.TEXTURE0); 
		gl.bindTexture(gl.TEXTURE_2D, mytex); 

		
		gl.useProgram( this.prog );
		gl.uniform1i( sampler,0 );

	}
	
	// This method is called when the user changes the state of the
	// "Show Texture" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	showTexture( show )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify if it should use the texture.
		gl.useProgram(this.prog);
		gl.uniform1i(this.showTexLoc, show); 
	}

}



const vertexShader = `
			attribute vec3 pos; 
			attribute vec2 texCoord; 

			uniform mat4 mvp; 
			uniform mat4 yzSwap;

			varying vec2 v_texCoord; 

			void main()
			{
				v_texCoord = texCoord;

				gl_Position = mvp * yzSwap * vec4(pos,1.0); 
			}`;

const fragmentShader = `
			precision mediump float;

			uniform bool showTex;
			uniform sampler2D tex;
			uniform vec3 color; 

			varying vec2 v_texCoord;

			void main(){
				if (showTex) {
					gl_FragColor = texture2D(tex, v_texCoord);
				} else {
					gl_FragColor = vec4(color.x, color.y, color.z, 1.0);
						}
						}`;