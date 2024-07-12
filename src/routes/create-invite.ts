import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod"
import { prisma } from "../lib/prisma";
import { getMailCliente } from "../lib/mail";
import nodemailer from "nodemailer";
import { getDateFormattedToPtBr } from "../lib/dayjs";
import { getComponentMailSendToConfirmTrip } from "../utils/sendMail/confirmTrip/componentSendMailConfirmTrip";
import { ClientError } from "../errors/client-error";

export async function createInvite(app : FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post('/trips/:tripId/invite', {
        schema :{
            params : z.object({
                tripId: z.string().uuid()
            }), 
            body : z.object({
                email : z.string().email()
            })
        } 
    }, async (request, reply) => {
        const { tripId } =  request.params;
        const { email } = request.body;

        const trip = await prisma.trip.findUnique({
            where: {
                id : tripId
            }
        });

        if(!trip) {
            throw new ClientError(`Viagem não encontrada.`, 404);
        }

        const mail = await getMailCliente();

        
        const participant = await prisma.participant.create({
            data: {
                email, 
                trip_id : trip.id
            }, 
            select : {
                email : true, 
                id : true
            }
        })
       
        const confirmationLink   = `${process.env.API_URL}/trips/${trip.id}/confirm/${participant.id}`
       
        const message = await mail.sendMail({
            from : {
                name    : 'Equipe plann.er',
                address : 'talkWithPln@planner.com'
            },
            to: {
                name    : '', 
                address : participant.email
            }, 
            subject : `Confirme sua presença na viagem para ${trip.destination} em ${getDateFormattedToPtBr(trip.starts_at)}`,
            html    : getComponentMailSendToConfirmTrip({destination : trip.destination, ends_at : trip.ends_at, starts_at : trip.starts_at, confirmationLink})
        });
        
        console.log(nodemailer.getTestMessageUrl(message));    

        return {participantId : participant.id};
        
    })
}
