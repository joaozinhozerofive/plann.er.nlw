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
import { getParticipants } from "./routes/get-participants";
import { createInvite } from "./routes/create-invite";
import { updateTrip } from "./routes/update-trip";
import { getTripDetails } from "./routes/get-trip-details";
import { getParticipant } from "./routes/get-participant";
import { appError } from "../app-error";


const app  =  fastify();

app.register(cors, {
    origin: process.env.ENABLE_CORS_TO, 
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.setErrorHandler(appError);

app.register(createTrips);
app.register(confirmTrips);
app.register(confirmParticipants);
app.register(createActivity);
app.register(getActivities);
app.register(createLink);
app.register(getLinks);
app.register(getParticipants);
app.register(createInvite);
app.register(updateTrip);
app.register(getTripDetails);
app.register(getParticipant);

const PORT = Number(process.env.LISTEN_PORT);

app.listen({port : PORT}).then(() => {
    console.log('Server is Running!');
});


