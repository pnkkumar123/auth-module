import { Test, TestingModule } from '@nestjs/testing';
import { UserModuleRolesController } from './user-module-roles.controller';

describe('UserModuleRolesController', () => {
  let controller: UserModuleRolesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserModuleRolesController],
    }).compile();

    controller = module.get<UserModuleRolesController>(UserModuleRolesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
