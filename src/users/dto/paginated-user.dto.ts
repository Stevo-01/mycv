import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from './user.dto';
import { PaginationMetaDto } from '../../common/dto/pagination.dto';

export class PaginatedUserResponseDto {
  @ApiProperty({ 
    description: 'Array of users',
    type: [UserDto]
  })
  data: UserDto[];

  @ApiProperty({ 
    description: 'Pagination metadata',
    type: PaginationMetaDto
  })
  meta: PaginationMetaDto;
}

// This is a helper to transform the response
export function toPaginatedUserDto(
  users: any[],
  meta: PaginationMetaDto
): PaginatedUserResponseDto {
  return {
    data: users,
    meta: meta
  };
}