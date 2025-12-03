import { PartialType } from '@nestjs/mapped-types';
import { CreatePaqueteDto } from './create-area.dto';

export class UpdatePaqueteDto extends PartialType(CreatePaqueteDto) {}
