import { BadRequestException, Injectable, BadGatewayException, NotFoundException } from "@nestjs/common";
import { UsersService } from "./users.service";
import { randomBytes, scrypt as _scrypt } from "crypto";
import { promisify } from "util";
import { NotFoundError } from "rxjs";

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private UsersService: UsersService) {}

  async signup(email: string, password: string) {
    //see if email is in use
    const users = await this.UsersService.find(email);
      if (users.length) {
        throw new BadRequestException('email in use')
      }

    // Has the users password

    // Generate a salt
    const salt = randomBytes(8).toString('hex');

    // Hash the salt and the password together
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    // Join has and salt together

    const result = salt + '.' + hash.toString('hex');

    //creat new user and save it 

    const user = await this.UsersService.create(email, result);

    // retrun the user
    return user;


  }

  async signin(email: string, password: string) {
    const [user] = await this.UsersService.find(email);
    if (!user) {
      throw new NotFoundException('user not found');
    }

    const [salt, storedhash] =user.password.split('.');

    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (storedhash === hash.toString('hex')) {
      return user;
    } else{
      throw new BadRequestException('bad password');
    }
    return user;


  }
}