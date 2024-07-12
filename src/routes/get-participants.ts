import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { ClientError } from "../errors/client-error";

export async function getParticipants(app : FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId/participants', {
        schema :{
            params : z.object({
                tripId: z.string().uuid()
            })
        }
    }, async (request, reply) => {
        const {tripId} = request.params;

        const trip = await prisma.trip.findUnique({
            where :{
                id : tripId
            }, 
            select :{
                participants : {
                    select :{
                        id: true, 
                        name : true, 
                        email :  true, 
                        is_confirmed : true
                    }
                }
            }
        })

        if(!trip) {
            throw new ClientError('Viagem não encontrada.', 404);
        }

        return {particpants : trip.participants};
    })
}