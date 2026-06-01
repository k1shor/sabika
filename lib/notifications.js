// import { Notification } from "@/models/Notification";
// import { User } from "@/models/User";

// /**
//  * Create notifications for multiple users
//  * @param {Array<string>} userIds - array of user IDs to receive this notification
//  * @param {Object} data - { type, message, writerId?, postSlug? }
//  */
// export async function createNotification(userIds, data) {
//   const notifications = userIds.map((id) => ({
//     userId: id,
//     type: data.type,
//     message: data.message,
//     writerId: data.writerId || null,
//     postSlug: data.postSlug || null,
//   }));

//   await Notification.insertMany(notifications);
// }

// /**
//  * Send notification to all admins
//  */
// export async function notifyAdmins(data) {
//   const admins = await User.find({ role: "admin" }).select("_id");
//   const adminIds = admins.map((a) => a._id);
//   await createNotification(adminIds, data);
// }