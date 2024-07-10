import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod"
import { prisma } from "../lib/prisma";
import { getMailCliente } from "../lib/mail";
import nodemailer from "nodemailer";
import { getDateFormattedToPtBr } from "../lib/dayjs";
import { getComponentMailSendToConfirmTrip } from "../utils/confirmTrip/componentSendMailConfirmTrip";

export async function confirmTrips(app : FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId/confirm', {
        schema :{
            params : z.object({
                tripId: z.string().uuid()
            })
        }
    }, async (request, reply) => {
        const { tripId } =  request.params;
        const trip = await prisma.trip.findUnique({
            where: {
                id : tripId
            }
        });

        if(!trip) {
            throw new Error(`Viagem não encontrada.`);
        }

        if(trip.is_confirmed) {
            return reply.redirect(`http://localhost:1010`);
        }

        const tripUpdated = await prisma.trip.update({ 
                data: {
                  is_confirmed : true
                }, 
                where: {
                    id : trip.id
                },
                select : {
                    participants : {
                        where: {
                            is_owner : false
                        }
                    }, 
                    destination : true, 
                    starts_at   : true, 
                    ends_at     : true, 
                    id          : true
            }    
        })


         const formattedStartDate = getDateFormattedToPtBr(tripUpdated.starts_at);
         const formattedEndDate   = getDateFormattedToPtBr(tripUpdated.ends_at);
         const confirmationLink   = `http://localhost:1011/trips/${tripUpdated.id}/confirm/:userId`

         const mail = await getMailCliente();

        await Promise.all(
            tripUpdated.participants.map(async (participant) => {
                const message = await mail.sendMail({
                    from : {
                        name    : 'Equipe plann.er',
                        address : 'talkWithPln@planner.com'
                    },
                    to: {
                        name    : participant.name  || ' ', 
                        address : participant.email
                    }, 
                    subject : `Confirme sua presença na viagem para ${tripUpdated.destination} em ${getDateFormattedToPtBr(tripUpdated.starts_at)}`,
                    html    : getComponentMailSendToConfirmTrip({destination : tripUpdated.destination, ends_at : tripUpdated.ends_at, starts_at : tripUpdated.starts_at})
                });
                
                console.log(nodemailer.getTestMessageUrl(message));    
            }))

            return reply.redirect(`http://localhost:1010`);
    })
}
