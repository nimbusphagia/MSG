import { ForbiddenError } from "../errors";
import { CurrentUserValidation } from "../schemas/util.schema";

export function validateService({ id, currentUserId }: CurrentUserValidation) {
  if (id !== currentUserId) throw new ForbiddenError("User doesn't have permissions");
}
export const safeUserInclude = {
  user: {
    omit: {
      passwordHash: true,
    }
  }
}

