import { InferSubjects } from '@casl/ability';

import { UserModel } from 'src/modules/user/models/user.model';
// import { MessageModel } from 'src/modules/message/models/message.model';
// import { GroupModel } from 'src/modules/group/models/group.model';
// import { GroupMemberModel } from 'src/modules/group/models/group-member.model';

export type Subjects =
  | InferSubjects<
      | typeof UserModel
    //   | typeof MessageModel
    //   | typeof GroupModel
    //   | typeof GroupMemberModel
    >
  | 'all';