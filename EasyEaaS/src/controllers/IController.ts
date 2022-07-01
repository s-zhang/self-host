import { Router } from 'express';

interface IController {
  mount(router: Router): void;
}

export default IController;
