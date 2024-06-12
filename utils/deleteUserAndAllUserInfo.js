// module.exports = async (userDoc, ChatMessageModel, TodoModel, CommentModel) => {
//   // deleting user himself
//   // await userDoc.deleteOne();

//   // Delete all user's messages
//   await ChatMessageModel.deleteMany({ userId: userDoc.id });

//   // Delete all user's todos
//   const allUserTodos = await TodoModel.find({ user: userDoc.id }).exec();
//   const allUserTodoIds = allUserTodos.map((todo) => todo._id);

//   console.log(allUserTodoIds);

//   const allComments = await CommentModel.find({
//     todo: { $in: allUserTodoIds },
//   }).exec();
//   console.log(allComments);

//   // await CommentModel.deleteMany({ todo: { $in: allUserTodoIds } });

//   // await TodoModel.deleteMany({ user: userDoc.id });

//   // // Get user's todo in which we will delete all users' comments
// };

module.exports = async (userDoc, ChatMessageModel, TodoModel) => {
  // deleting user himself
  await userDoc.deleteOne();

  // // Delete all user's messages
  await ChatMessageModel.deleteMany({ userId: userDoc.id });

  // Delete all user's todos
  await TodoModel.deleteMany({ user: userDoc.id });
};
