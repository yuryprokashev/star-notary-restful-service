const InvalidInputError = require('../InvalidInputError');
const MAX_STORY_LENGTH_WORDS = 250;
const MAX_STORY_LENGTH_BYTES = 500;

module.exports = class Star {
    constructor(star) {
        this.star = star;
    }
    isValid(){
        if(this.star === undefined || this.star === "") throw new InvalidInputError("Star object is undefined");
        let error = new InvalidInputError();
        if (this.star.ra === undefined || this.star.ra === "") error.addUserMessage("Star Right Ascend is empty");
        if (this.star.dec === undefined || this.star.dec === "") error.addUserMessage("Star Declination is empty");
        if (this.star.story === undefined || this.star.story === "") {
            error.addUserMessage("Star Story is empty");
        } else {
            let storyLengthBytes = Buffer.from(this.star.story, "ascii").toString("hex").length;
            let storyLengthWords = this.star.story.split(" ").length;
            if (storyLengthBytes > MAX_STORY_LENGTH_BYTES || storyLengthWords > MAX_STORY_LENGTH_WORDS) {
                error.addUserMessage(`Story is too long. Story length must be less than ${MAX_STORY_LENGTH_BYTES} bytes or ${MAX_STORY_LENGTH_WORDS} words`);
            }
        }
        if(error.userMessages.length > 0) throw error;
    }
};

