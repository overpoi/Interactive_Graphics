// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The transformation first applies scale, then rotation, and finally translation.
// The given rotation value is in degrees.
function GetTransform( positionX, positionY, rotation, scale )
{
		// Rotation radians
		let theta = rotation * (Math.PI/180);

		let cosTheta = Math.cos(theta);
		let sinTheta = Math.sin(theta);
		
		
		/*
		scaleMatrix = [
			scale, 0, 0, 
			0, scale, 0, 
			0, 0, 1]

		rotationMatrix = [
			cosTheta, -sinTheta, 0,
			sinTheta, cosTheta, 0,
			0, 0, 1
		]

		translationMatrix = [
			1, 0, positionX,
			0, 1, positionY,
			0, 0, 1
		]
		*/


		return [
		scale * cosTheta, scale * (sinTheta), 0,
		scale * (- sinTheta) , scale * cosTheta, 0,
		positionX, positionY, 1
		]
	
	}

	



// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The arguments are transformation matrices in the same format.
// The returned transformation first applies trans1 and then trans2.
function ApplyTransform( trans1, trans2 )
{

	let trans3 = []; 

    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {

			let index = row + col * 3;
			let sum = 0

            for (let k = 0; k < 3; k++) {

                let a = trans2[row + k * 3];   // trans2 rows
                let b = trans1[k + col * 3];   // trans1 columns
                sum += a * b;
            }

            trans3[index] = sum;
        }
    }

    return trans3;
}
	



