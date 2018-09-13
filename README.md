# Local Machine Deployment
1. Download or clone the repo to `project_folder` on your local machine.
2. Open Terminal and `cd` to the `project_folder`.
3. Run `npm install` to install dependencies.
4. Run `node index.js`.
5. Server will listen port 8000.

# Dependencies
1. [LevelDB 4.0.0+](https://github.com/Level/level)
2. [Crypto.js 3.1.9-1+](https://www.npmjs.com/package/crypto-js)
3. [Express.js 4.0.0+](https://expressjs.com/)
4. [BitcoinJS-Message 2.0.0+](https://www.npmjs.com/package/bitcoinjs-message)

# Project Features
## Star Registration using Bitcoin Wallet Address
Client can register new Star only when he had proven his identity.
To prove his identity, Client needs to:
1. Open Validation Window by sending wallet address to `POST /requestValidation`.
The response will contain the message, that Client needs to sign with his
wallet address.
2. Verify signature of the message to `POST /message-signature/validate`.
The response will contain the the signature validity information.
3. When signature is valid, Client may register the Star
be sending its date to `POST /block`.

## Star Lookup by Block Height, Block Hash or Wallet Address
Client can fetch the information about the registered Stars using
three different endpoints:
1. By Height of the Block, where Star were registered:
 `GET /block/{blockHeight}`
2. By Hash of the Block, where Star were registered:
 `GET /stars/hash:{blockHash}`
3. By Wallet Address, which was used to register the Star:
 `GET /stars/address:{walletAddress}`

# REST API Documentation
Base Path for API is `/`.

`Content-Type` header for all requests is `application/json`.

## POST /requestValidation
### Description
Opens Validation Window for the Wallet Address, provided in the request body.

Response contains message, that Client must sign with his walletAddress.

Validation Window is 300 seconds long. It will be closed after 300 seconds,
if not used.

Validation Window will also be closed immediately after the Star is registered. So
Client may have only one open Validation Window open for one Wallet
Address at a time.

Multiple requests to open the Validation Window, that are sent within 300 seconds,
will receive the same Validation Window object back. The `validationWindow`
property will decrease with each request sent.

### Request
#### Example
```
curl -X POST \
  http://localhost:8000/requestValidation \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json' \
  -d '{
  "address": "15KneztcfrTFRnZGHc8PhjEgoZsP62VHwQ"
}'
```
####  Body parameter: `address: String`. Required.
Accepts `address` parameter in request body. This is wallet address, that Client wants to use to register the Star.

`address` is `String` with strict 34 chars length.

### Successful Response
#### Description
Status code: 200.

Returns representation of created Validation Window in Response body.
#### Example
```
{
    "address": "15KneztcfrTFRnZGHc8PhjEgoZsP62VHwQ",
    "requestTimestamp": "1536766868",
    "message": "15KneztcfrTFRnZGHc8PhjEgoZsP62VHwQ:1536766868:starRegistry",
    "validationWindow": 300
}
```

### Error Responses
#### Bad Request
##### Description
This error is returned in case the body of the request does not have required parameters.

##### Examples
###### Request body does not have the `address` field or this field is an empty string.
```
{
    "errors": [
        "Wallet address is undefined"
    ]
}
```
###### Request body has `address` field, but this field has wrong length.
```
{
    "errors": [
        "Wallet address length is 30. Length 34 is expected."
    ]
}
```

## POST /message-signature/validate
### Description
Verifies if message signature in request body has been created using the address
in request body.
### Request
#### Example
```
curl -X POST \
  http://localhost:8000/message-signature/validate \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json' \
  -d '{
  "address": "15KneztcfrTFRnZGHc8PhjEgoZsP62VHwQ",
  "signature": "H682CuwBk9AYfUnWI13UBMiKoAI2jfXNF1QkJW3O0rf8bnEP3FUOMRK2zyxFJGEcdwQ1/Lz/7CMUuLf1rBgkJDU="
}'
```
####  Body parameter: `address: String`. Required.
Accepts `address` parameter in request body. This is wallet address, that Client wants to use to register the Star.

`address` is `String` with strict 34 chars length.

####  Body parameter: `signature: String`. Required.
Accepts `signature` parameter in request body. This is signature of the message received
in response to `POST /requestValidation`.

Client must produce this signature for the message using his Bitcoin Wallet address.

`signature` is `String` with strict 88 chars length.

### Successful Response
#### Description
Status code: 200.

Returns representation of Signature Validation Status in Response body.

__IMPORTANT__ Although, status code returned is 200, signature may be invalid.
Client must check the `messageSignature` to get the signature status.

#### Example
```
{
    "registerStar": true,
    "status": {
        "address": "15KneztcfrTFRnZGHc8PhjEgoZsP62VHwQ",
        "requestTimestamp": "1536768532",
        "message": "15KneztcfrTFRnZGHc8PhjEgoZsP62VHwQ:1536768532:starRegistry",
        "validationWindow": 300,
        "messageSignature": "valid"
    }
}
```

### Error Responses
#### Bad Request
##### Description
This error is returned in case the body of the request does not have required parameters,
or when required parameters are wrongly formatted.

__IMPORTANT!__ Request body is validated prior to check for open Validation Window.

##### Examples
###### Request body is empty
```
{
    "errors": [
        "Wallet address is undefined",
        "Signature is undefined"
    ]
}
```
###### Request body has both `address` and `signature`, but both fields have wrong format
```
{
    "errors": [
        "Wallet address length is 31. Length 34 is expected.",
        "Signature has 85. 88 is expected."
    ]
}
```

#### Unprocessable Entity
##### Description
This error is returned in two cases:
1. Client has forgot to open the Validation Window
2. Client had opened validation window but it has expired

Status code is 422.

Response body has `errors: String[]` property.
##### Example of Case #1 and #2
```
{
    "errors": [
        "Validation window for 15KneztcfrTFRnZGHc8PhjEgoZsP62VHwQ does not exist. Open new validation window."
    ]
}
```

## POST /block
### Description
Allows to append new Block with custom data to Blockchain. Star registration data and walletAddress will be appended to the new Block.
Each new Star registration appends a new Block to the Blockchain.
### Request
#### Example
```
curl -X POST \
  http://localhost:8000/block \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json' \
  -d '{
  "address": "15KneztcfrTFRnZGHc8PhjEgoZsP62VHwQ",
  "star": {
    "dec": "-26° 29'\'' 24.9",
    "ra": "16h 29m 1.0s",
    "story": "Found star using https://www.google.com/sky/"
  }
}'
```
####  Body parameter: `address: String`. Required.
Accepts `address` parameter in request body. This is wallet address, that Client wants to use to register the Star.

`address` is `String` with strict 34 chars length.

####  Body parameter: `Star: Object`. Required.
Accepts `star` parameter in request body. This is object, encapsulating the properties of the Star, that Client wants to register.

`star` is `Object` with three required properties: `ra`, `dec` and `story`, which are described in next chapters.

####  Star parameter: `ra: String`. Required.
Accepts `ra` parameter in request body. This is string describing Right Ascend of the Star, that Client wants to register.

`ra` is `String` with arbitrary length. The format of `ra` is not validated. API expects it exists and non-empty String.

####  Star parameter: `dec: String`. Required.
Accepts `dec` parameter in request body. This is string describing Declination of the Star, that Client wants to register.

`dec` is `String` with arbitrary length. The format of `dec` is not validated. API expects it exists and non-empty String.

####  Star parameter: `story: String`. Required.
Accepts `story` parameter in request body. This is string describing any arbitrary information about the Star, that Client wants to add to Star registration data.

`story` is `String` with max 500 bytes or 250 words length.

### Successful Response
#### Description
Status code: 200.

Returns representation of created Block object in Response Body. Block object contains Star object, that has just been registered.
Star Story is returned in encoded format. Encoding used is `ascii`.
#### Example
```
{
    "hash": "7fe9750038a0f7987d75ee045d7e9f7ab625da15ee712bda5ad3e53fca1f7faf",
    "height": 15,
    "body": {
        "address": "15KneztcfrTFRnZGHc8PhjEgoZsP62VHwQ",
        "star": {
            "dec": "-26° 29' 24.9",
            "ra": "16h 29m 1.0s",
            "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f"
        }
    },
    "time": "1536765658",
    "previousBlockHash": "901646791444b11280c30c06b1b04340249d8406822af0b98a8615f98471b4ce"
}
```

### Error Responses
#### Bad Request
##### Description
This error is returned in case the body of the request does not have required parameters,
or when required parameters are wrongly formatted.

__IMPORTANT!__ Request body is validated prior to checks for open Validation Window
and verified message Signature.
##### Examples
###### Request body does not have `address` field or this field is an empty string.
```
{
    "errors": [
        "Wallet address is undefined"
    ]
}
```
###### Request body has Star object, which misses the `ra` property and has the `story` field more than 250 words or 500 bytes.
```
{
    "errors": [
        "Star Right Ascend is empty",
        "Story is too long. Story length must be less than 500 bytes or 250 words"
    ]
}
```

#### Unprocessable Entity
##### Description
This error is returned in two cases, when Client tries to register the Star.
1. Client has forgot to open the Validation Window
2. Client had opened validation window but has forgot to verify the message
3. Client had opened validation window, tried to verify the message, but signature status returned is 'invalid'

Status code is 422.

Response body has `errors: String[]` property.
##### Example of Case #1
```
{
    "errors": [
        "Star registration needs open Validation Window. It is closed now."
    ]
}
```
##### Example of Case #2 and Case #3
```
{
    "errors": [
        "Star registration needs valid signature. No valid signature found."
    ]
}
```

## GET /block/{blockHeight}
### Description
Allows to read block information by its height.

Returned Block body contains information about Star, that was registered in this Block.
### Request
#### Example
```
curl -X GET \
  http://localhost:8000/block/2 \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json' \
```
#### Path parameter:`blockHeight: Number`
Provides the height of the block to be read.

When block height is beyond the length of the Blockchain, then error is returned.

### Successful Response
#### Description
Status code: 200.

Returns representation of the Block object in Response Body
#### Example
```
{
    "hash": "438595a37aa7ed5cc6cdd376cb1b66fe9169fb532ccff1343cc17fa0e7e9967f",
    "height": 2,
    "body": {
        "address": "15KneztcfrTFRnZGHc8PhjEgoZsP62VHwQ",
        "star": {
            "dec": "-26° 29' 24.9",
            "ra": "16h 29m 1.0s",
            "story": "5365636f6e642053746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
            "storyDecoded": "Second Star using https://www.google.com/sky/"
        }
    },
    "time": "1536633080",
    "previousBlockHash": "9ccada7222533102444e5f81b796c6d7cdc8e6d3758d7de2745b2e4887409bf7"
}
```
### Error Responses
#### Unprocessable Entity
##### Description
When block height parameter, provided in request, is more than current
Blockchain length, then Unprocessable Entity error is returned.

Status code is 422.

Response body has `errors: String[]` property.
##### Example
```
{
    "errors": [
        "Key not found in database [100]"
    ]
}
```

## GET /stars/hash:{blockHash}
### Description
Allows to read Block with Star by Blocks' hash.

Returned Block body contains information about Star, that was registered in this Block.
### Request
#### Example
```
curl -X GET \
  'http://localhost:8000/stars/hash:438595a37aa7ed5cc6cdd376cb1b66fe9169fb532ccff1343cc17fa0e7e9967f' \
  -H 'Cache-Control: no-cache' \
```
#### Path parameter:`blockHash: String`
Provides the hash of the block to be read.

Block hash length is strictly 64 chars.

### Successful Response
#### Description
Status code: 200.

Returns representation of the Block object in Response Body
#### Example
```
{
    "hash": "438595a37aa7ed5cc6cdd376cb1b66fe9169fb532ccff1343cc17fa0e7e9967f",
    "height": 2,
    "body": {
        "address": "15KneztcfrTFRnZGHc8PhjEgoZsP62VHwQ",
        "star": {
            "dec": "-26° 29' 24.9",
            "ra": "16h 29m 1.0s",
            "story": "5365636f6e642053746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
            "storyDecoded": "Second Star using https://www.google.com/sky/"
        }
    },
    "time": "1536633080",
    "previousBlockHash": "9ccada7222533102444e5f81b796c6d7cdc8e6d3758d7de2745b2e4887409bf7"
}
```
### Error Responses
#### Bad Request
##### Description
This error is returned, when block hash has wrong length.

Status code is 400.

Response body has `errors: String[]` property.
##### Example
```
{
    "errors": [
        "Unable to resolve Query type of 'hash:438595a37aa7ed5cc6cdd376cb1b66'."
    ]
}
```

## GET /stars/address:{walletAddress}
### Description
Allows to read all Blocks with Stars by wallet address, that was used to register them.

Returns an array of Blocks for provided wallet address.

Each Block body contains information about Star, that was registered in this Block.
### Request
#### Example
```
curl -X GET \
  'http://localhost:8000/stars/address:15KneztcfrTFRnZGHc8PhjEgoZsP62VHwQ' \
  -H 'Cache-Control: no-cache' \
```
#### Path parameter:`walletAddress: String`
The wallet address used for Star registrations.

`walletAddress` is `String` with strict 34 chars length.

### Successful Response
#### Description
Status code: 200.

Returns array of Block representation in Response Body.
#### Example
```
[
    {
        "hash": "9ccada7222533102444e5f81b796c6d7cdc8e6d3758d7de2745b2e4887409bf7",
        "height": 1,
        "body": {
            "address": "15KneztcfrTFRnZGHc8PhjEgoZsP62VHwQ",
            "star": {
                "dec": "-26° 29' 24.9",
                "ra": "16h 29m 1.0s",
                "story": "46697273742053746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
                "storyDecoded": "First Star using https://www.google.com/sky/"
            }
        },
        "time": "1536588771",
        "previousBlockHash": "9d621c1aa56699c91b1e477bdf97125c2b88cd82304af4182cb17782cf9b2827"
    },
    {
        "hash": "438595a37aa7ed5cc6cdd376cb1b66fe9169fb532ccff1343cc17fa0e7e9967f",
        "height": 2,
        "body": {
            "address": "15KneztcfrTFRnZGHc8PhjEgoZsP62VHwQ",
            "star": {
                "dec": "-26° 29' 24.9",
                "ra": "16h 29m 1.0s",
                "story": "5365636f6e642053746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
                "storyDecoded": "Second Star using https://www.google.com/sky/"
            }
        },
        "time": "1536633080",
        "previousBlockHash": "9ccada7222533102444e5f81b796c6d7cdc8e6d3758d7de2745b2e4887409bf7"
    }
]
```
### Error Responses
#### Bad Request
##### Description
This error is returned, when address has wrong length.

Status code is 400.

Response body has `errors: String[]` property.
##### Example
```
{
    "errors": [
        "Unable to resolve Query type of 'address:15KneztcfrTFRnZGHc8PhjEgoZsP62VHwQZGHc8PhjEgoZsP62VHwQPhjEgoZ'."
    ]
}
```
