import { Schema, model } from 'mongoose'
import IUserDocument from './interface/IUserDocument';

const UserSchema = new Schema({
  login_id: String,
  password: String,
  token: String,
});

export const User = model<IUserDocument>('User', UserSchema);