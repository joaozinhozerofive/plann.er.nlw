import fastify from "fastify";
import { createTrips } from "./routes/create-trip";
import { confirmTrips } from "./routes/confirm-trip";
import { confirmParticipants } from './routes/confirm-participants';
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import cors from "@fastify/cors";
import { createActivity } from "./routes/create-activity";
import { getActivities } from "./routes/get-activities";
import { createLink } from "./routes/create-link";
import { getLinks } from "./routes/get-links";


const app  =  fastify();

app.register(cors, {
    origin: process.env.ENABLE_CORS_TO, 
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createTrips);
app.register(confirmTrips);
app.register(confirmParticipants);
app.register(createActivity);
app.register(getActivities);
app.register(createLink);
app.register(getLinks);

const PORT = Number(process.env.LISTEN_PORT);

app.listen({port : PORT}).then(() => {
    console.log('Server is Running!');
});


