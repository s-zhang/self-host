import { Request, Response, Router } from 'express';

import EvalRequestData from '../models/EvalRequestData';

import IController from './IController';

class EvalController implements IController {
  serve(req: Request, res: Response): void {
    const data = req.body as EvalRequestData;
    console.log(`Evaluating: ${data.code}`);
    const value = eval(data.code);
    console.log(`Result: ${value}`);
    res.json(value);
  }
  mount(router: Router): void {
    router.post('/eval', this.serve);
  }
}

export default EvalController;
