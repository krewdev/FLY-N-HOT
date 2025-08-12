// Placeholder notification service for SMS and Push

type NotifyPassengersInput = {
  phoneNumbers?: string[];
  deviceTokens?: string[];
  message: string;
  deepLinkUrl?: string;
};

export async function notifyPassengers(input: NotifyPassengersInput) {
  // Implement Twilio SMS and FCM/APNS push
  return { sent: true, count: (input.phoneNumbers?.length ?? 0) + (input.deviceTokens?.length ?? 0) };
}

export async function notifyPilotApplicationSubmitted(email?: string, phoneNumber?: string) {
  // TODO: integrate transactional email/SMS provider
  return { enqueued: true, via: { email: !!email, sms: !!phoneNumber } };
}

export async function notifyPilotApplicationApproved(email?: string, phoneNumber?: string) {
  // TODO: integrate transactional email/SMS provider
  return { enqueued: true, via: { email: !!email, sms: !!phoneNumber } };
}

