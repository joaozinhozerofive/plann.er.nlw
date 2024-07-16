import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod"
import { prisma } from "../lib/prisma";
import dayjs from "dayjs";
import {getMailCliente} from '../lib/mail';
import nodemailer from "nodemailer";
import { getDateFormattedToPtBr } from "../lib/dayjs";
import { getComponentMailSendToCreateTrip } from "../utils/sendMail/createTrip/componentSendMailCreateTrip";
import { ClientError } from "../errors/client-error";

export async function createTrips(app : FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post('/trips', {
        schema :{
            body : z.object({
                destination      : z.string().min(4),
                starts_at        : z.coerce.date(),
                ends_at          : z.coerce.date(),
                owner_name       : z.string(), 
                owner_email      : z.string().email(),
                emails_to_invite : z.array(z.string().email())
            })
        }
    }, async (request) => {
        const { destination, starts_at, ends_at, owner_name, owner_email, emails_to_invite} = request.body;

        if(dayjs(starts_at).isBefore(new Date())) {
            throw new ClientError('Data de início da viagem inválida.',400);
        }

        if(dayjs(ends_at).isBefore(starts_at)) {
            throw new ClientError('Data final da viagem inválida.',400);
        }

        let dataCreateInvitedParticipants = emails_to_invite.map(email => {
            return {
                email
            };
        })

       try {
        const trip = await prisma.trip.create({
            data : {
                destination, 
                starts_at,
                ends_at,
                participants :{
                    createMany : {
                        data: [
                            {
                                name         : owner_name, 
                                email        : owner_email,
                                is_owner     : true,
                                is_confirmed : false
                            },
                            ...dataCreateInvitedParticipants
                        ]
                    }
                }
            }
        })

        const mail = await getMailCliente();
        const confirmationLink = `${process.env.API_URL}/trips/${trip.id}/confirm`;
        
        const message = await mail.sendMail({
            from : {
                name    : 'Equipe plann.er',
                address : 'talkWithPln@planner.com'
            },
            to: {
                name    : owner_name, 
                address : owner_email
            }, 
            subject : `Confirme sua viagem para ${destination} em ${getDateFormattedToPtBr(starts_at)}`,
            html    : getComponentMailSendToCreateTrip({destination, starts_at, ends_at, confirmationLink})
        });

        console.log(nodemailer.getTestMessageUrl(message));

        return { tripId : trip.id };
       }
       catch {
        throw new ClientError('Não foi possível inserir os dados da viagem.',400);
       }
    })
}
