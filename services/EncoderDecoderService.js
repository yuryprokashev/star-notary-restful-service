const lodashString = require('lodash/string');
const { StringDecoder } = require('string_decoder');

module.exports = class EncoderDecoderService {
    constructor() {
        this.decoder = new StringDecoder('ascii');
    }
    encodeProperty(object, sourcePropertyPath, encodedPropertyPath) {
        let targetPropertyValue = this.resolveTargetPropertyValue(object, sourcePropertyPath);
        let endcodedTargetProperty = Buffer.from(targetPropertyValue, 'ascii').toString('hex');

        let targetChildObject = this.resolveTargetChildObject(object, encodedPropertyPath);
        let targetPropertyKey = this.resolvePropertyNames(encodedPropertyPath).pop();
        targetChildObject[targetPropertyKey] = endcodedTargetProperty;
        return object;
    }

    decodeProperty(object, sourcePropertyPath, decodedPropertyPath) {
        let targetPropertyValue = this.resolveTargetPropertyValue(object, sourcePropertyPath);
        let decodedTargetProperty = this.decoder.write(Buffer.from(targetPropertyValue, "hex"));

        let targetChildObject = this.resolveTargetChildObject(object, decodedPropertyPath);
        let targetPropertyKey = this.resolvePropertyNames(decodedPropertyPath).pop();
        targetChildObject[targetPropertyKey] = decodedTargetProperty;
        return object;
    }
    resolvePropertyNames(propertyPath) {
        return propertyPath.split(".");
    }

    resolveObjectPropertyReference(obj, propertyName) {
        return obj[propertyName];
    }
    resolveTargetPropertyValue(obj, propertyPath) {
        let targetPropertyValue = obj;
        let propertyNames = this.resolvePropertyNames(propertyPath);
        propertyNames.forEach(name => {
            targetPropertyValue = this.resolveObjectPropertyReference(targetPropertyValue, name);
        });
        return targetPropertyValue;
    }

    resolveTargetChildObject(obj, propertyPath) {
        let targetChildObject = obj;
        let propertyNames = this.resolvePropertyNames(propertyPath);
        propertyNames.pop();
        propertyNames.forEach(name => {
            targetChildObject = this.resolveObjectPropertyReference(targetChildObject, name);
        });
        return targetChildObject;
    }
};