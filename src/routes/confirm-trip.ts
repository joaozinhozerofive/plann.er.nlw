import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod"
import { prisma } from "../lib/prisma";
import { getMailCliente } from "../lib/mail";
import nodemailer from "nodemailer";
import { getDateFormattedToPtBr } from "../lib/dayjs";
import { getComponentMailSendToConfirmTrip } from "../utils/sendMail/confirmTrip/componentSendMailConfirmTrip";
import { ClientError } from "../errors/client-error";

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
            throw new ClientError(`Viagem não encontrada.`, 404);
        }

        if(trip.is_confirmed) {
            return reply.redirect(`http://localhost:1010`);
        }

        const tripUpdated = await prisma.trip.update({ 
                data: {
                  is_confirmed : true,
                  participants :{
                    updateMany : {
                        data : {
                            is_confirmed : true
                        },
                        where :{
                            is_owner : true
                        }
                    }
                  }
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
        
        const mail = await getMailCliente();

        await Promise.all(
            tripUpdated.participants.map(async (participant) => {
                const confirmationLink   = `${process.env.API_URL}/trips/${tripUpdated.id}/confirm/${participant.id}`
                
                const message = await mail.sendMail({
                    from : {
                        name    : 'Equipe plann.er',
                        address : 'talkWithPln@planner.com'
                    },
                    to: {
                        name    : participant.name  || '', 
                        address : participant.email
                    }, 
                    subject : `Confirme sua presença na viagem para ${tripUpdated.destination} em ${getDateFormattedToPtBr(tripUpdated.starts_at)}`,
                    html    : getComponentMailSendToConfirmTrip({destination : tripUpdated.destination, ends_at : tripUpdated.ends_at, starts_at : tripUpdated.starts_at, confirmationLink})
                });
                
                console.log(nodemailer.getTestMessageUrl(message));    
            }))

            return reply.redirect(`http://localhost:1010`);
    })
}
