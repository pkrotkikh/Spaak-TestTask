import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const titles = ['FIU alm. del', 'Traditionel', 'Europa-Parlamentets', 'Om digital kommunikation', 'High Level Segment Session'];
const content = ['Finder ministeren det acceptabelt...', 'Hvad er ministerens holdning til...', 'Vil ministeren følge forslaget...', 'Der henvises til TV2s...'];
const stages = ['Fremast', '1. Behandling', '2. Behandling', '3. Behandling', 'Færdig'];
const paginations = ['', '?$skip=100', '?$skip=200', '?$skip=300', '?$skip=400', '?$skip=500', '?$skip=600']


type ExternalData = {
    id: number;
    typeid: number;
    kategoriid: number;
    statusid: number;

    title: string;
    content: string;
    stage: string;

    titel: string;
    titelkort: string;
    offentlighedskode: string;
    nummer: string;
    nummerprefix: string;
    nummernumerisk: string;
    nummerpostfix: string;
    resume: string;
    afstemningskonklusion: string;

    periodeid: number;
    afgørelsesresultatkode: string;
    baggrundsmateriale: string;
    opdateringsdato: Date;

    statsbudgetsag: boolean;
    begrundelse: string;
    paragrafnummer: string;
    paragraf: string;
    afgørelsesdato: Date;
    afgørelse: string;
    rådsmødedato: Date;
    lovnummer: string;
    lovnummerdato: Date;
    retsinformationsurl: string;
    fremsatundersagid: string;
    deltundersagid: string;
};

type ApiResponse = {
    value: ExternalData[];
};

function sanitizeRecord(record: Record<string, any>) {
    return Object.fromEntries(
        Object.entries(record).map(([key, value]) => [key, value === null ? undefined : value])
    );
}

async function fetchAndSaveData() {
    for (const paginate of paginations) {
        try {
            // 1. Receive data from endpoint:
            const response = await fetch('https://oda.ft.dk/api/Sag' + paginate);
            if (!response.ok) {
                throw new Error(`Error while receiving data: ${response.statusText}`);
            }

            // 2. Casting to the proper type:
            const result: ApiResponse | null = await response.json();
            if (!result || !result.value) {
                throw new Error("Empty or unexpected data received from API");
            }
            const data = result.value;

            // 3. Filter data based on typeid and periodeid
            const filteredData = data.filter(
                item => [3, 5, 9].includes(item.typeid) || item.periodeid === 160
            );

            for (const item of filteredData) {
                // 4. Gather all needed information into form and create record:
                const randomTitle = titles[Math.floor(Math.random() * titles.length)];
                const randomContent = content[Math.floor(Math.random() * content.length)];
                const randomStage = stages[Math.floor(Math.random() * stages.length)];

                const record = {
                    id: item.id,
                    typeid: item.typeid ? item.typeid : 0,
                    kategoriid: item.kategoriid ? item.kategoriid : 0,
                    statusid: item.statusid ? item.statusid : 0,

                    title: randomTitle,
                    content: randomContent,
                    stage: randomStage,

                    titel: item.titel ? item.titel : '',
                    titelkort: item.titelkort ? item.titelkort : '',
                    offentlighedskode: item.offentlighedskode ? item.offentlighedskode : '',
                    nummer: item.nummer ? item.nummer : '',
                    nummerprefix: item.nummerprefix ? item.nummerprefix : '',
                    nummernumerisk: item.nummernumerisk ? item.nummernumerisk : '',
                    nummerpostfix: item.nummerpostfix ? item.nummerpostfix : '',
                    resume: item.resume ? item.resume : '',
                    afstemningskonklusion: item.afstemningskonklusion ? item.afstemningskonklusion : null,

                    periodeid: item.periodeid ? item.periodeid : 0,
                    afgorelsesresultatkode: item.afgørelsesresultatkode ? item.afgørelsesresultatkode : '',
                    baggrundsmateriale: item.baggrundsmateriale ? item.baggrundsmateriale : '',
                    opdateringsdato: item.opdateringsdato ? new Date(item.opdateringsdato) : new Date(),

                    statsbudgetsag: item.statsbudgetsag ? item.statsbudgetsag : false,
                    begrundelse: item.begrundelse ? item.begrundelse : '',
                    paragrafnummer: item.paragrafnummer ? item.paragrafnummer : '',
                    paragraf: item.paragraf ? item.paragraf : '',
                    afgorelsesdato: item.afgørelsesdato ? new Date(item.afgørelsesdato) : new Date(),
                    afgorelse: item.afgørelse ? item.afgørelse : '',
                    radsmodedato: item.rådsmødedato ? new Date(item.rådsmødedato) : new Date(),
                    lovnummer: item.lovnummer ? item.lovnummer : '',
                    lovnummerdato: item.lovnummerdato ? new Date(item.lovnummerdato) : new Date(),
                    retsinformationsurl: item.retsinformationsurl ? item.retsinformationsurl : '',
                    fremsatundersagid: item.fremsatundersagid ? item.fremsatundersagid : '',
                    deltundersagid: item.deltundersagid ? item.deltundersagid : '',
                };

                // 5. Sanitize Record and inserting a record into the database:
                const sanitizedRecord = sanitizeRecord(record);
                console.log("Inserting a Record:", JSON.stringify(sanitizedRecord, null, 2));
                await prisma.post.create({data: sanitizedRecord});
            }
        } catch (error) {
            console.error('Error while retrieving and saving data:', error);
            throw error;
        } finally {
            await prisma.$disconnect();
        }
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        await fetchAndSaveData();
        res.status(200).json({
            success: true,
            message: 'The data has been successfully saved to the database.',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error while saving data',
            error: (error as Error).message,
        });
    }
}
