let encoder = new TextEncoder();

async function verifySignature(secret, header, payload) {

	//Log all of the arguements that got passed in
    let parts = header.split("="); //Splits the payload header 
    let sigHex = parts[1]; //Gets the signature part of the header

	//Define algorithm
    let algorithm = { name: "HMAC", hash: { name: 'SHA-256' } };

    let keyBytes = encoder.encode(secret); // Turns the passed secret into an array of utf-8 numbers
    let extractable = false; // Not sure what this does???

	// Takes a key in the raw format 
    let key = await crypto.subtle.importKey(
        "raw",
        keyBytes, // Key bytes are in an array of numbers 
        algorithm, // algorithm must be correct
        extractable, // This just means I can't export the key?? idk what that's for
        [ "sign", "verify" ], // Specifies that the key can be used to sign messages and to verify a signautre 
    );

    let sigBytes = hexToBytes(sigHex); // Turns the signature from being in hexcode into being into bytes
	payload_string = JSON.stringify(payload);
    let dataBytes = encoder.encode(payload_string); // The bytes from the payload this looks right 
		// console.log(`I think this is supposed to be the bytes from the payload, it's: ${dataBytes}`) // This is where it's going wrong. This is coming back with nothing I think it's because payload is a json object instead of being converted to whatever encoder.encode expects it as? 

    let equal = await crypto.subtle.verify( 
        algorithm.name,
        key,
        sigBytes,
        dataBytes,
    );
    return equal;
}

function hexToBytes(hex) {
    let len = hex.length / 2;
    let bytes = new Uint8Array(len);

    let index = 0;
    for (let i = 0; i < hex.length; i += 2) {
        let c = hex.slice(i, i + 2);
        let b = parseInt(c, 16);
        bytes[index] = b;
        index += 1;
    }

    return bytes;
}

module.exports = { verifySignature };
