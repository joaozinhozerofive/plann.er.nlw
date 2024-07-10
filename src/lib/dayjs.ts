import  dayjs from "dayjs";
import lozalizedFormat from "dayjs/plugin/localizedFormat";
import 'dayjs/locale/pt-br';

dayjs.locale('pt-br');
dayjs.extend(lozalizedFormat);

export function getDateFormattedToPtBr(date: Date) {
    dayjs.extend(lozalizedFormat);
    return dayjs(date).format('LL');
}