import { prisma } from "@/lib/prisma";

type NotificationType =
  | "INFO"
  | "SUCCESS"
  | "WARNING"
  | "ERROR";

type CreateNotificationParams = {
  userId: string;
  businessId: string;

  title: string;
  message: string;

  type?: NotificationType;

  resourceId?: string;
  resourceType?: string;
};

/*
|--------------------------------------------------------------------------
| CRIAR NOTIFICAÇÃO
|--------------------------------------------------------------------------
*/

export async function createNotification({
  userId,
  businessId,
  title,
  message,
  type = "INFO",
  resourceId,
  resourceType,
}: CreateNotificationParams) {
  if (!userId) {
    throw new Error(
      "USER_ID_NOT_PROVIDED",
    );
  }

  if (!businessId) {
    throw new Error(
      "BUSINESS_ID_NOT_PROVIDED",
    );
  }

  if (!title) {
    throw new Error(
      "NOTIFICATION_TITLE_NOT_PROVIDED",
    );
  }

  if (!message) {
    throw new Error(
      "NOTIFICATION_MESSAGE_NOT_PROVIDED",
    );
  }

  const notification =
    await prisma.notification.create({
      data: {
        userId,
        businessId,

        title,
        message,

        type,

        resourceId:
          resourceId ?? null,

        resourceType:
          resourceType ?? null,
      },
    });

  console.log(
    "🔔 NOTIFICAÇÃO CRIADA:",
    notification.id,
  );

  return notification;
}