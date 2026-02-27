import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserService } from '../user/user.service';
import { PrismaService } from 'src/core/prisma/prisma.service';

@WebSocketGateway({
    cors: {
        origin: '*'
    }
})
export class ChatGateway implements OnGatewayConnection {
    @WebSocketServer()
    server: Server;

    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
        private readonly prisma: PrismaService
    ) { }

    async handleConnection(client: any) {
        try {
            const token = client.handshake.auth?.token;

            if (!token) {
                client.disconnect();
                return;
            }

            const cleanToken = token.replace('Bearer ', '');
            const payload = await this.jwtService.verifyAsync(cleanToken);

            const user = await this.userService.findById(payload.sub);
            if (!user) throw new Error('User not found');

            client.data.user = user;
            console.log(`✅ Authenticated: ${user.name} (${client.id})`);

            const userRooms = await this.prisma.roomMember.findMany({
                where: { userId: user.id },
                select: { roomId: true }
            });
            userRooms.forEach(room => {
                client.join(room.roomId)
            });
            console.log(`📌 User ${user.name} joined ${userRooms.length} rooms.`);
        } catch (error) {
            console.log(`❌ Auth Failed: ${error.message}`);
            client.disconnect();
        }
    }

    sendMessageToRoom(roomId: string, event: string, payload: any) {
        this.server.to(roomId).emit(event, payload);
    }
}
