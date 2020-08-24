import * as jwt from "jsonwebtoken";
import { toUserRole } from "../models/UserModel";

export class Authenticator {
  public generateToken(
    input: AuthenticationData,
    expiresIn: string = process.env.ACCESS_TOKEN_EXPIRES_IN!
  ): string {
    const token = jwt.sign(
      {
        id: input.id,
        role: input.role,
        nickname: input.nickname,
      },
      process.env.JWT_KEY as string,
      {
        expiresIn,
      }
    );
    return token;
  }

  public getData(token: string): AuthenticationData {
    const payload = jwt.verify(token, process.env.JWT_KEY as string) as any;
    const result = {
      id: payload.id,
      role: toUserRole(payload.role),
      nickname: payload.nickname,
    };
    return result;
  }
}

interface AuthenticationData {
  id: string;
  role?: string;
  nickname: string;
}
