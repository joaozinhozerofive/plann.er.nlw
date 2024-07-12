import  dayjs from "dayjs";
import lozalizedFormat from "dayjs/plugin/localizedFormat";
import 'dayjs/locale/pt-br';
import { env } from "process";
import { getDateFormattedToPtBr } from "../../../lib/dayjs";

dayjs.locale('pt-br');
dayjs.extend(lozalizedFormat);

interface ComponenteEmailProps {
    clientName?       : string, 
    destination       : string,
    starts_at         : Date,
    ends_at           : Date, 
    confirmationLink? : string
}

export function getComponentMailSendToConfirmTrip({destination, ends_at, starts_at, confirmationLink} : ComponenteEmailProps) {
    const formattedStartDate = getDateFormattedToPtBr(starts_at);
    const formattedEndDate   = getDateFormattedToPtBr(ends_at);

    return ` <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
              <p>Você foi convidado(a) para participar de uma viagem para 
              <strong>${destination}</strong> 
               nas datas de 
              <strong>${formattedStartDate}</strong> 
               até 
              <strong>${formattedEndDate}</strong>.</p>
              <p></p>
              <p>Para confirmar sua presença na viagem, clique no link abaixo:</p>
              <p></p>
              <p>
                <a href="${confirmationLink}">Confirmar viagem</a>
              </p>
              <p></p>
              <p>Caso você não saiba do que se trata esse e-mail, apenas ignore-o</p>
            </div>
    `;
}
