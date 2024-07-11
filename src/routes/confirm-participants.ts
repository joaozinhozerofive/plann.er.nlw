import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";

export async function confirmParticipants(app : FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId/confirm/:participantId', {
        schema :{
            params : z.object({
                tripId        : z.string().uuid(), 
                participantId : z.string().uuid()
            })
        }
    }, async (request, reply) => {
        const { tripId , participantId} =  request.params;

        const trip = await prisma.trip.findUnique({
            where: {
                id : tripId
            }
        });

        if(!trip) {
            throw new Error(`Viagem não encontrada.`);
        }

        const participant = await prisma.participant.findUnique({
            where :{
                id : participantId, 
                trip_id : trip.id
            }
        })

        if(!participant) {
            throw new Error(`Participante não encontrado.`);
        }

        if(participant.is_confirmed) {
            return reply.redirect(`http://localhost:1011/confirm/${trip.id}/participant/${participant.id}`);
        }

        try {
            const tripUpdated = await prisma.trip.update({ 
                data: {
                  is_confirmed : true, 
                  participants :{
                    update: {
                        data: {
                            is_confirmed : true
                        }, 
                        where :{
                            id : participant.id
                        }
                    }
                  }
                }, 
                where: {
                    id : trip.id
                },
        })
        }
        catch {
            throw new Error('Não foi possível confirmar sua presença na viagem, entre em contato com o suporte.');
        }
    })
}
