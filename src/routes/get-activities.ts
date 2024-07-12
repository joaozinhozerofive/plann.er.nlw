import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import dayjs from "dayjs";
import { ClientError } from "../errors/client-error";

export async function getActivities(app : FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId/activities', {
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
            select : {
                activities : {
                    orderBy : {
                        occurs_at : 'asc'
                    }
                }, 
                ends_at    : true, 
                starts_at  : true
            }    
        })

        if(!trip) {
            throw new ClientError('Viagem não encontrada.', 404);
        }

        const differenceInDaysBetweenTripsStartsAndEnd = dayjs(trip.ends_at).diff(trip.starts_at, 'days');
        
        const activities = Array.from({ length :  differenceInDaysBetweenTripsStartsAndEnd + 1 }).map((_, index) => {
            const date = dayjs(trip.starts_at).add(index, 'days');

            return {
                date       : date.toDate(), 
                activities : trip.activities.filter(activity => {
                    return dayjs(activity.occurs_at).isSame(date, 'day')
                })
            };
        }) 

        return {activities : activities};

    })
}