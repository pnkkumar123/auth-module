import { Test, TestingModule } from '@nestjs/testing';
import { UserModuleRolesService } from './user-module-roles.service';

describe('UserModuleRolesService', () => {
  let service: UserModuleRolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserModuleRolesService],
    }).compile();

    service = module.get<UserModuleRolesService>(UserModuleRolesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
