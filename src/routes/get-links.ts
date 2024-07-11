import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";

export async function getLinks(app : FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId/links', {
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
            }
        })

        if(!trip) {
            throw new Error('Viagem não encontrada.');
        }

        const links =  await prisma.link.findMany({
            where : {
                trip_id : trip.id
            }
        })

        return {links};

    })
}
