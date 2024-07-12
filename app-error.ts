import { FastifyInstance } from "fastify"
import { ClientError } from "./src/errors/client-error";
import { ZodError } from "zod";

type FastifyAppError = FastifyInstance['errorHandler'];

export const appError : FastifyAppError = (error, request, reply) => {
    if(error instanceof ZodError) {
        return reply.status( 400 ).send(
            {
                message : JSON.parse(error.message)[0].validation ? `${JSON.parse(error.message)[0].validation} inválido(a).` : 'Invalid input', 
                erros   : error.flatten().fieldErrors 
            }
        );
    }

    if(error instanceof ClientError) {
       return reply.status( Number(error.statusCode) ).send(
        {message : error.message}
       );
   }
   
}