import {JwtService} from "@nestjs/jwt";
import {UserModel} from "../modules/user/models/user.model";
import {TokenTypeEnum} from "./token.type.enum";

export class JwtUtil {
    private jwtService: JwtService

    constructor() {}

    public sign(user: UserModel): string {
        return this.jwtService.sign({ tokenType: TokenTypeEnum.BLOCK, data: { id: user.id } }, { expiresIn: '30d' })
    }
}
