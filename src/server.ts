import fastify from "fastify";
import { createTrips } from "./routes/create-trip";
import {confirmTrips} from "./routes/confirm-trip";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import cors from "@fastify/cors";


const app  =  fastify();

app.register(cors, {
    origin: process.env.ENABLE_CORS_TO, 
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createTrips);
app.register(confirmTrips);


const PORT = Number(process.env.LISTEN_PORT);

app.listen({port : PORT}).then(() => {
    console.log('Server is Running!');
});


