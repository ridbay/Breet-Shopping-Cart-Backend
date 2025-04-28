import { validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorsArray = errors.array();

    // const allErrorsNew = errorsArray.map((error) => error.msg);

    res.status(422).json({
      status: false,
      message: errorsArray[0].msg,
    });
    return;
  }
  next();
};

export default validateRequest;
