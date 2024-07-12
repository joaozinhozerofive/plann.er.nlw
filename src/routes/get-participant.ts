import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { ClientError } from "../errors/client-error";

export async function getParticipant(app : FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get('/participant/:participantId', {
        schema :{
            params : z.object({
                participantId: z.string().uuid()
            })
        }
    }, async (request, reply) => {
        const { participantId } = request.params;

        const participant = await prisma.participant.findUnique({
            where :{
                id : participantId
            }, 
            select : {
                name         : true, 
                email        : true,
                id           : true ,
                is_confirmed : true
            }
        })

        if(!participant) {
            throw new ClientError('Participante não encontrado.', 404);
        }

        return {participant};
    })
}