import { getDateFormattedToPtBr } from "../../lib/dayjs";


interface ComponenteEmailProps {
    clientName?       : string, 
    destination       : string,
    starts_at         : Date,
    ends_at           : Date, 
    confirmationLink? : string
}

export function getComponentMailSendToCreateTrip({destination, ends_at, starts_at, confirmationLink} : ComponenteEmailProps) {
    const formattedStartDate = getDateFormattedToPtBr(starts_at);
    const formattedEndDate   = getDateFormattedToPtBr(ends_at);

    return ` <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
              <p>Você solicitou a criação de uma viagem para
              <strong>${destination}</strong> 
               nas datas de 
              <strong>${formattedStartDate}</strong> 
               até 
              <strong>${formattedEndDate}</strong>.</p>
              <p></p>
              <p>Para confirmar a viagem, clique no link abaixo:</p>
              <p></p>
              <p>
                <a href="${confirmationLink}">Confirmar viagem</a>
              </p>
              <p></p>
              <p>Caso você não saiba do que se trata esse e-mail, apenas ignore esse e-mail.</p>
            </div>
    `;
}
