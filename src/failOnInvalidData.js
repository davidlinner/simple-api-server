import {validationResult} from "express-validator";


const failOnInvalidData = (request, response, next) => {

    const validationIssues = validationResult(request);
    if (!validationIssues.isEmpty()) {
        response
            .status(400)
            .json(validationIssues.array());
    } else {
        next();
    }

}

export default failOnInvalidData;