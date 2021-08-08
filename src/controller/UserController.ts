// import {getRepository} from "typeorm";
// import {NextFunction, Request, Response} from "express";
// import {User} from "../entity/User";

// export class UserController {

//     private userRepository = getRepository(User);

//     async all(request: Request, response: Response, next: NextFunction) {
//         return this.userRepository.find();
//     }

//     async one(request: Request, response: Response, next: NextFunction) {
//         return this.userRepository.findOne(request.params.id);
//     }

//     async save(request: Request, response: Response, next: NextFunction) {
//         return this.userRepository.save(request.body);
//     }

//     async remove(request: Request, response: Response, next: NextFunction) {
//         let userToRemove = await this.userRepository.findOne(request.params.id);
//         await this.userRepository.remove(userToRemove);
//     }

// }

import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { validate } from 'class-validator';

import { User } from '../entity/User';

class UserController {
    static listAll = async (req: Request, res: Response) => {
        // Get users from database
        const userRepository = getRepository(User);
        const users = await userRepository.find({
            select: ["id",  "username", "role"] // not send the password on response
        });

        // send the users object
        res.send(users);
    };

    static getOneById = async (req: Request, res: Response) => {
        // Get the ID from the url
        const id: number = req.params.id;

        // Get the user from database
        const userRepository = getRepository(User);
        try {
            const user = await userRepository.findOneOrFail(id, {
                select: ["id", "username", "role"]
            });
        } catch (error) {
            res.status(404).send("User not found");
        }
    };

    static newUser = async (req: Request, res: Response) => {
        // Get parameters from the body
        let { username, password, role} = req.body;
        let user = new User();
        user.username = username;
        user.password = password;
        user.role = role;

        // Validate if the parameters are ok
        const errors = await validate(user);
        if(errors.length > 0) {
            res.status(400).send(errors);
            return;
        }

        // Hash the password, to securely store on DB
        user.hashPassword();

        // Try to save. If fails, the username is already in use
        const userRepository = getRepository(User);
        try {
            await userRepository.save(user);
        } catch (error) {
            res.status(409).send("username already in use");
            return;
        }

        // If all ok, send 201 response
        res.status(201).send("User created");
    };

    static editUser = async (req: Request, res: Response) => {
        // Get the ID from the url
        const id = req.params.id;

        // Get values from the body
        const { username, role} = req.body;

        // Try to find user on database
        const userRepository = getRepository(User);
        let user;
        try {
            user = await userRepository.findOneOrFail(id);
        } catch (error) {
            res.status(404).send("User not found");
            return;
        }

        // validate the new values on model
        user.username = username;
        user.role = role;
        const errors = await validate(user);
        if(errors.lenght > 0) {
            res.status(400).send(errors);
            return;
        }

        try {
            await userRepository.save(user);
        } catch (e) {
            res.status(409).send("username already in use");
            return;
        }

        // After all send a 204 (no content, but accepted) response
        res.status(204).send();
    };

    static deleteUser = async (req: Request, res: Response) => {
        const id = req.params.id;

        const userRepository = getRepository(User);
        let user: User;
        try {
            user = await userRepository.findOneOrFail(id);
        } catch (error) {
            res.status(404).send("User Not Found");
            return;
        }
        userRepository.delete(id);

        res.status(204).send();
    };
}

export default UserController;