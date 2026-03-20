import { IsString, IsOptional, IsDateString, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePatientDto {
  @ApiProperty({ example: 'VN-HCM-2026-001234' })
  @IsString()
  mrn!: string;

  @ApiProperty({ example: 'Nguyễn Văn An' })
  @IsString()
  fullName!: string;

  @ApiProperty({ example: '1985-07-15' })
  @IsDateString()
  dob!: string;

  @ApiProperty({ enum: ['male', 'female', 'other'] })
  @IsIn(['male', 'female', 'other'])
  gender!: string;

  @ApiPropertyOptional({ example: '079123456789' })
  @IsOptional()
  @IsString()
  nationalId?: string;

  @ApiPropertyOptional({ example: '+84 909 123 456' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: '123 Nguyễn Huệ, Q.1, TP.HCM' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'Organization ID' })
  @IsString()
  organizationId!: string;
}
