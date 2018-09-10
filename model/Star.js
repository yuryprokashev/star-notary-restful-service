module.exports = class Star {
    constructor(rightAscension,
                declination,
                story,
                magnitude,
                constellation ) {
        this.rightAscension = rightAscension;
        this.declination = declination;
        this.magnitude = magnitude || 'unknown';
        this.constellation = constellation || 'unknown';
    }
};