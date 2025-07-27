let encoder = new TextEncoder();

async function verifySignature(secret, header, payload) {

	console.log('secret is');
    console.log(secret);
	console.log('header is');
    console.log(header);
	console.log('payload is');
    console.log(payload);
    let parts = header.split("=");
    let sigHex = parts[1];
	console.log('Parts is: ');
	console.log(parts);
	console.log('sigHex is: ');
	console.log(sigHex);

    let algorithm = { name: "HMAC", hash: { name: 'SHA-256' } };

    let keyBytes = encoder.encode(secret);
    let extractable = false;
	//Error hereing here says something about a 0 length key 
    let key = await crypto.subtle.importKey(
        "raw",
        keyBytes,
        algorithm,
        extractable,
        [ "sign", "verify" ],
    );

    let sigBytes = hexToBytes(sigHex);
    let dataBytes = encoder.encode(payload);
    let equal = await crypto.subtle.verify(
        algorithm.name,
        key,
        sigBytes,
        dataBytes,
    );
	
	console.log('Value of the comparing of the two secretey hashey hash browns is: ');
	console.log(equal);

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
