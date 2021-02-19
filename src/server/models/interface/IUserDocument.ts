import { Document } from 'mongoose'

export default interface IUserDocument extends Document {
  login_id:	string;
  password:	string;
  token: string;
}