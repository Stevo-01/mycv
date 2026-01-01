import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { User } from './user.entity';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    fakeUsersService = {
      findOne: (id: number) => {
        return Promise.resolve({id, email: 'someone@example.com', password: 'securepassword123'} as User)
      },
      find: (email: string) => {
        return Promise.resolve([{id: 1, email, password:'securepassword123'} as User])
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService
        },
      ]
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  
  it('findAllUsers returns a list of users with the given email', async () =>{
    const users = await controller.findAllUsers('someone@example.com');
    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('someone@example.com');
  });

  it('findUser returns a user with the given id', async () =>{
    const user = await controller.findUser('1');
    expect(user).toBeDefined();
  })

  it('findUser throws an error if user with given id is not found', async () => {
    fakeUsersService.findOne = () => null;
    await expect(controller.findUser('1')).rejects.toThrow(NotFoundException);
  });
});