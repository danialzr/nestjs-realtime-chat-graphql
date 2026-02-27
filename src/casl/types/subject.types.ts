import { InferSubjects } from '@casl/ability';
import { RoomMemberModel } from 'src/modules/room/models/room-member.model';
import { RoomModel } from 'src/modules/room/models/room.model';
import { UserModel } from 'src/modules/user/models/user.model';

export type Subjects =
  | InferSubjects<
      | typeof UserModel
      | typeof RoomModel
      | typeof RoomMemberModel
    >
  | 'all';