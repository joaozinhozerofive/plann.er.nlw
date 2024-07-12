import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod"
import { prisma } from "../lib/prisma";
import dayjs from "dayjs";
import {getMailCliente} from '../lib/mail';
import nodemailer from "nodemailer";
import { getDateFormattedToPtBr } from "../lib/dayjs";
import { ClientError } from "../errors/client-error";

export async function updateTrip(app : FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().put('/trips/:tripId', {
        schema :{
            params : z.object( {
                tripId: z.string().uuid()
            }),
            body : z.object({
                destination      : z.string().min(4),
                starts_at        : z.coerce.date(),
                ends_at          : z.coerce.date(),
            })
        }
    }, async (request) => {
        const { tripId }  = request.params;
        const { destination, starts_at, ends_at} = request.body;

        if(dayjs(starts_at).isBefore(new Date())) {
            throw new ClientError('Data de início da viagem inválida.',400) ;
        }

        if(dayjs(ends_at).isBefore(starts_at)) {
            throw new ClientError('Data final da viagem inválida.',400)
        }

        const trip = await prisma.trip.findUnique({
            where: {
                id : tripId
            }
        })

        if(!trip) {
            throw new ClientError("Viagem não encontrada", 404);
        }

        try {
            await prisma.trip.update({
                data: {
                    destination, 
                    starts_at, 
                    ends_at, 
                },
                where :{
                     id : tripId
                }
            })
        }
        catch {
            throw new ClientError("Não foi possível atualizar a viagem.", 400)
        }
    
    })
}
