const lodashString = require('lodash/string');
const { StringDecoder } = require('string_decoder');

module.exports = class EncoderDecoderService {
    constructor() {
        this.decoder = new StringDecoder('ascii');
    }
    encodeProperty(object, sourcePropertyPath, encodedPropertyPath) {
        let targetPropertyValue = this._resolveTargetPropertyValue(object, sourcePropertyPath);
        let endcodedTargetProperty = Buffer.from(targetPropertyValue, 'ascii').toString('hex');

        let targetChildObject = this._resolveTargetChildObject(object, encodedPropertyPath);
        let targetPropertyKey = this._resolvePropertyNames(encodedPropertyPath).pop();
        targetChildObject[targetPropertyKey] = endcodedTargetProperty;
        return object;
    }

    decodeProperty(object, sourcePropertyPath, decodedPropertyPath) {
        let targetPropertyValue = this._resolveTargetPropertyValue(object, sourcePropertyPath);
        let decodedTargetProperty = this.decoder.write(Buffer.from(targetPropertyValue, "hex"));

        let targetChildObject = this._resolveTargetChildObject(object, decodedPropertyPath);
        let targetPropertyKey = this._resolvePropertyNames(decodedPropertyPath).pop();
        targetChildObject[targetPropertyKey] = decodedTargetProperty;
        return object;
    }

    _resolvePropertyNames(propertyPath) {
        return propertyPath.split(".");
    }

    _resolveObjectPropertyReference(obj, propertyName) {
        return obj[propertyName];
    }
    _resolveTargetPropertyValue(obj, propertyPath) {
        let targetPropertyValue = obj;
        let propertyNames = this._resolvePropertyNames(propertyPath);
        propertyNames.forEach(name => {
            targetPropertyValue = this._resolveObjectPropertyReference(targetPropertyValue, name);
        });
        return targetPropertyValue;
    }

    _resolveTargetChildObject(obj, propertyPath) {
        let targetChildObject = obj;
        let propertyNames = this._resolvePropertyNames(propertyPath);
        propertyNames.pop();
        propertyNames.forEach(name => {
            targetChildObject = this._resolveObjectPropertyReference(targetChildObject, name);
        });
        return targetChildObject;
    }
};