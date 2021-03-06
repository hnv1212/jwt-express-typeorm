import "reflect-metadata";
import {createConnection} from "typeorm";
import * as express from "express";
import * as bodyParser from "body-parser";
// import {Request, Response} from "express";
// import {Routes} from "./routes";
// import {User} from "./entity/User";
import * as helmet from 'helmet';
import * as cors from 'cors';
import routes from './routes';

createConnection().then(async connection => {

    // create express app
    const app = express();

    // Call middlewares
    app.use(cors());
    app.use(helmet());
    app.use(bodyParser.json());

    // // register express routes from defined application routes
    // Routes.forEach(route => {
    //     (app as any)[route.method](route.route, (req: Request, res: Response, next: Function) => {
    //         const result = (new (route.controller as any))[route.action](req, res, next);
    //         if (result instanceof Promise) {
    //             result.then(result => result !== null && result !== undefined ? res.send(result) : undefined);

    //         } else if (result !== null && result !== undefined) {
    //             res.json(result);
    //         }
    //     });
    // });

    // setup express app here
    // set all routes from routes folder
    app.use("/", routes);

    app.listen(3000, () => {
        console.log("Server started on port 3000")
    })

    // // start express server
    // app.listen(3000);

    // // insert new users for test
    // await connection.manager.save(connection.manager.create(User, {
    //     firstName: "Timber",
    //     lastName: "Saw",
    //     age: 27
    // }));
    // await connection.manager.save(connection.manager.create(User, {
    //     firstName: "Phantom",
    //     lastName: "Assassin",
    //     age: 24
    // }));

    // console.log("Express server has started on port 3000. Open http://localhost:3000/users to see results");

}).catch(error => console.log(error));
