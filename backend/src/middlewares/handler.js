import httpStatus from "http-status";

export default (req, res, next) => {
    res.ok = (data) => {
        res
            .status(httpStatus.OK)
            .json(data);
    }

    res.created = () => {
        res
            .status(httpStatus.CREATED)
            .send();
    }

    res.noContent = () => {
        res
            .status(httpStatus.NO_CONTENT)
            .send();
    }

    res.internalServerError = (err) => {
        /*
        #swagger.responses[500] = {
            schema: { $ref: "#/definitions/InternalServerError"}
        }
        */
        res
            .status(httpStatus.INTERNAL_SERVER_ERROR)
            .json(err);
    }

    res.notFound = () => {
        res
            .status(httpStatus.NOT_FOUND)
            .send("Not Found...");
    }

    res.paymentRequired = (err) => {
        res
            .status(httpStatus.PAYMENT_REQUIRED)
            .json(err);
    }

    res.unauthorized = () => {
        res
            .status(httpStatus.UNAUTHORIZED)
            .send();
    }

    next();
}