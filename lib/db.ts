import mongoose from "mongoose";

export type SessionFile = {
  public_id: string;
  filename: string;
  format: string;
};

export type Session = {
  id: string;
  files: SessionFile[];
  createdAt: Date;
};

const sessionSchema = new mongoose.Schema({
  id: String,
  files: [
    {
      public_id: String,
      filename: String,
      format: String,
    },
  ],
  createdAt: { type: Date, default: Date.now, expires: "1h" }, // Auto-delete after 1 hour
});

const SessionModel =
  mongoose.models.Session || mongoose.model<Session>("Session", sessionSchema);

export async function createSession(
  id: string,
  files: SessionFile[]
): Promise<Session> {
  const session = new SessionModel({ id, files });
  await session.save();
  return session;
}

export async function getSession(id: string): Promise<Session | null> {
  return await SessionModel.findOne({ id }).exec();
}

export async function deleteSession(id: string): Promise<void> {
  await SessionModel.deleteOne({ id }).exec();
}
