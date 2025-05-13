// This function takes the translation and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// You can use the MatrixMult function defined in project5.html to multiply two 4x4 matrices in the same format.


function GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY )
{
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
    var mvp = MatrixMult(translation, trans1);

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

		this.vertbuffer = gl.createBuffer();
		this.normalbuffer = gl.createBuffer();
		this.texbuffer = gl.createBuffer();

		this.normalLoc = gl.getAttribLocation(this.prog, 'normal');
		this.vertPosLoc = gl.getAttribLocation(this.prog, 'pos');
		this.texCoordLoc = gl.getAttribLocation(this.prog, 'texCoord');

		this.mvpLoc = gl.getUniformLocation(this.prog, 'mvP');
		this.yzSwapLoc = gl.getUniformLocation(this.prog, 'yzSwap');
		this.showTexLoc = gl.getUniformLocation(this.prog, 'showTex');
		this.sampler = gl.getUniformLocation(this.prog, 'tex');
		this.mvLoc = gl.getUniformLocation(this.prog, 'mv');
		this.mvNormalLock = gl.getUniformLocation(this.prog, 'MVNormal');

		this.lightDirLoc = gl.getUniformLocation(this.prog, 'lightDir');
		this.alphaLoc = gl.getUniformLocation(this.prog, 'alpha');

		this.numTriangles = 0;

		this.yz = [
			1,0,0,0,
			0,1,0,0,
			0,0,1,0,
			0,0,0,1];

	}
	
	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions,
	// an array of 2D texture coordinates, and an array of vertex normals.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex and every three consecutive 
	// elements in the normals array form a vertex normal.
	// Note that this method can be called multiple times.
	setMesh( vertPos, texCoords, normals )
	{
		// [TO-DO] Update the contents of the vertex buffer objects.
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer); 
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW); 

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer); 
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW); 

		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalbuffer); 
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW); 

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
	// The arguments are the model-view-projection transformation matrixMVP,
	// the model-view transformation matrixMV, the same matrix returned
	// by the GetModelViewProjection function above, and the normal
	// transformation matrix, which is the inverse-transpose of matrixMV.
	draw( matrixMVP, matrixMV, matrixNormal )
	{
		// [TO-DO] Complete the WebGL initializations before drawing
		this.texture = gl.createTexture();
		gl.useProgram(this.prog);

		gl.uniformMatrix4fv(this.yzSwapLoc,false, this.yz); 
		gl.uniformMatrix4fv(this.mvLoc, false, matrixMV);
		gl.uniformMatrix4fv(this.mvpLoc, false, matrixMVP);
		gl.uniformMatrix3fv(this.mvNormalLock, false, matrixNormal);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
		gl.vertexAttribPointer(this.vertPosLoc, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.vertPosLoc);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer);
		gl.vertexAttribPointer(this.texCoordLoc, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.texCoordLoc);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalbuffer);
		gl.vertexAttribPointer(this.normalLoc, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.normalLoc);

		gl.drawArrays( gl.TRIANGLES, 0, this.numTriangles );
	}
	
	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture( img )
	{
		// [TO-DO] Bind the texture
		gl.useProgram(this.prog);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);

		// You can set the texture image data using the following command.
		gl.texImage2D( 
			gl.TEXTURE_2D, 
			0, 
			gl.RGB, 
			gl.RGB, 
			gl.UNSIGNED_BYTE, 
			img );

		
		gl.generateMipmap(gl.TEXTURE_2D);
		
		// [TO-DO] Now that we have a texture, it might be a good idea to set
		// some uniform parameter(s) of the fragment shader, so that it uses the texture.
		
		this.showTexture(true)
		
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);


		gl.activeTexture(gl.TEXTURE0);
		gl.uniform1i(this.sampler, 0);
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
	
	// This method is called to set the incoming light direction
	setLightDir( x, y, z )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify the light direction.
		gl.useProgram(this.prog);

		var length = Math.sqrt(x * x + y * y + z * z);
		var nx = x / length;
		var ny = y / length;
		var nz = z / length;

		gl.uniform3f(this.lightDirLoc, nx, ny, nz);
	}
	
	// This method is called to set the shininess of the material
	setShininess( shininess )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify the shininess.
		gl.useProgram(this.prog);
		gl.uniform1f(this.alphaLoc, shininess);
	}
}

const vertexShader = `
attribute vec3 pos;
attribute vec2 texCoord;
attribute vec3 normal;

uniform mat4 mvP;
uniform mat4 yzSwap;
uniform mat4 mv;
uniform mat3 MVNormal;

varying vec2 v_texCoord;
varying vec3 v_normal;
varying vec4 v_view;

void main() 
{
	v_texCoord = texCoord;
	vec3 pos = pos;
	v_normal = MVNormal * normal;
	v_view = mv * vec4(pos, 1.0);
	gl_Position = mvP * yzSwap * vec4(pos, 1.0);
	}
`;

const fragmentShader = `
precision mediump float;

uniform bool showTex;
uniform sampler2D tex;
uniform float alpha;
uniform vec3 lightDir;

varying vec2 v_texCoord;
varying vec3 v_normal;
varying vec4 v_view;

vec3 Kd = vec3(1.0);
vec3 Ks = vec3(1.0);
vec3 lightIntensity = vec3(1.0);

void main() {
	vec3 normal = normalize(v_normal);
	vec3 lightDir = normalize(lightDir);
	vec3 viewDir = normalize(-v_view.xyz);

	vec3 hw_Vec = normalize(lightDir + viewDir);
	
	float cosTheta = max(dot(normal, lightDir), 0.0);
	float cosPhi = max(dot(normal, hw_Vec), 0.0);

	vec4 texColor; 
	if (showTex) {
		texColor = texture2D(tex, v_texCoord);
	} else {
		texColor = vec4(1.0, gl_FragCoord.z * gl_FragCoord.z, 0.0, 1.0);
	}
	
	Kd = texColor.rgb;
	vec3 blinnModel = lightIntensity * (cosTheta * Kd + Ks * pow(cosPhi, alpha));
	gl_FragColor = vec4(blinnModel, texColor.a);
}
`;
