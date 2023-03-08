const AppError = require('./appError');

exports.changeUserRoleHelp = async (req, admin, user, Model) => {
  // 4) If the action is to lower a role:
  if (req.body.action === 'lower') {
    // 4.1. Checking if the user's role whoose we want to lower is lower than admin's role:
    if (
      admin.role === 'CEO' &&
      (user.role === 'admin' || user.role === 'user')
    ) {
      // 4.1.1. If yes: lower.
      const updatedUser = await Model.findOneAndUpdate(
        {
          _id: user.id,
        },
        {
          role: 'user',
        },
        {
          new: true,
        }
      );

      return updatedUser;
    } else {
      // 4.1.2. If no: return with Error.
      return new AppError(
        'Your role permission does not suit this action',
        403
      );
    }
  }
};
