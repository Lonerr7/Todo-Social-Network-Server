const AppError = require('./appError');
const { ADMIN_ROLE, CEO_ROLE, USER_ROLE } = require('./roles');
const { LOWER_ROLE, BAN, UNBAN, UPGRADE_ROLE } = require('./adminUserActions');

exports.manipulateUserIfAdmin = async (
  UserModel,
  req,
  res,
  next,
  admin,
  user
) => {
  // 3) If he is an admin:
  if (admin.role === ADMIN_ROLE || admin.role === CEO_ROLE) {
    // 4) If the action is to lower a role or ban a user:
    if (req.body.action === LOWER_ROLE || req.body.action === BAN) {
      // 4.1. Checking if the user's role whoose we want to lower is lower than admin's role:
      if (
        admin.role === CEO_ROLE &&
        (user.role === ADMIN_ROLE || user.role === USER_ROLE)
      ) {
        // 4.1.1. If yes: lower.
        const updatedUser = await UserModel.findByIdAndUpdate(
          user.id,
          {
            [req.body.action === LOWER_ROLE ? 'role' : 'isBanned']:
              req.body.action === LOWER_ROLE ? USER_ROLE : true,
          },
          {
            new: true,
          }
        );

        return res.status(201).json({
          status: 'success',
          data: updatedUser,
        });
      } else {
        // 4.1.2. If no: return with Error.
        return next(
          new AppError('Your role permission does not suit this action', 403)
        );
      }

      // 5) If the action is to upgrade a role or unban a user:
    } else if (req.body.action === UPGRADE_ROLE || req.body.action === UNBAN) {
      // 5.1. Checking if roles are correct
      if (
        (admin.role === CEO_ROLE || admin.role === ADMIN_ROLE) &&
        user.role === USER_ROLE
      ) {
        // 5.1.1. If yes: upgrade
        const updatedUser = await UserModel.findByIdAndUpdate(
          user.id,
          {
            [req.body.action === UPGRADE_ROLE ? 'role' : 'isBanned']:
              req.body.action === UPGRADE_ROLE ? ADMIN_ROLE : false,
          },
          {
            new: true,
          }
        );

        return res.status(201).json({
          status: 'success',
          data: updatedUser,
        });
      } else {
        // 5.1.2. If no: return with Error.
        return next(
          new AppError('Your role permission does not suit this action', 403)
        );
      }
    }
  }
};
